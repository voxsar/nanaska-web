import {
	Injectable,
	NotFoundException,
	BadRequestException,
	Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { GuestPaymentDto } from './dto/guest-payment.dto';
import { WebhookDto } from './dto/webhook.dto';
import { EnrollmentSubmitDto } from './dto/enrollment-submit.dto';
import { EmailService } from '../email/email.service';

/**
 * PaymentsService
 *
 * Implements a PayHere-compatible IPG flow:
 *   - /payments/create  → creates an Order, builds a signed checkout payload
 *   - /payments/webhook → verifies the IPG notification and grants course access
 *
 * Replace the PayHere-specific signature logic if using a different gateway.
 */
@Injectable()
export class PaymentsService {
	private readonly logger = new Logger(PaymentsService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly email: EmailService,
	) { }

	/**
	 * Find or create a course combination dynamically based on course IDs.
	 * Returns the combination with all necessary pricing information.
	 */
	private async findOrCreateCombination(courseIds: string[]) {
		//Sort course IDs for consistent lookup
		const sortedIds = [...courseIds].sort();

		// Try to find existing combination
		const allCombos = await this.prisma.courseCombination.findMany({
			include: { items: { include: { course: true } } },
		});

		const existing = allCombos.find((combo) => {
			const comboCourses = combo.items.map(i => i.course.id).sort();
			return comboCourses.length === sortedIds.length &&
				comboCourses.every((code, idx) => code === sortedIds[idx]);
		});

		if (existing) return existing;

		// Combination doesn't exist - create it dynamically
		const courses = await this.prisma.course.findMany({
			where: { id: { in: sortedIds } },
		});

		if (courses.length !== sortedIds.length) {
			throw new NotFoundException(`One or more course IDs not found: ${sortedIds.join(', ')}`);
		}

		// Calculate pricing as sum of individual courses
		const priceLkr = courses.reduce((sum, c) => sum + c.price, 0);
		const priceGbp = courses.reduce((sum, c) => sum + (c.priceGbp || 0), 0);

		// Determine the level (use the first course's level, or 'mixed' if different levels)
		const levels = [...new Set(courses.map(c => c.level))];
		const level = levels.length === 1 ? levels[0] : 'mixed';

		// Generate combination ID
		const levelPrefix = level === 'mixed' ? 'mix' : level.slice(0, 4).toLowerCase();
		const comboId = `${levelPrefix}_${sortedIds.map(id => id.toLowerCase()).join('_')}`;

		// Create the combination
		const newCombo = await this.prisma.courseCombination.create({
			data: {
				id: comboId,
				level,
				price: priceLkr,
				priceGbp,
				name: courses.map(c => c.name).join(' + '),
				items: {
					create: sortedIds.map(courseId => ({ courseId })),
				},
			},
			include: { items: { include: { course: true } } },
		});

		this.logger.log(`Created dynamic combination: ${comboId} for courses [${sortedIds.join(', ')}]`);
		return newCombo;
	}

	/** HMAC-SHA256 of envelopeJson signed with IPG_HMAC_SECRET (hex-encoded, as required by PayCorp). */
	private sign(envelopeJson: string): string {
		return crypto
			.createHmac('sha256', process.env.IPG_HMAC_SECRET!)
			.update(envelopeJson, 'utf8')
			.digest('hex');
	}

	/**
	 * Wraps requestData in the PayCorp API envelope.
	 * The HMAC must be computed over the JSON of this envelope.
	 */
	private buildEnvelope(operation: string, requestData: object): object {
		const now = new Date();
		const requestDate =
			now.getFullYear() + '-' +
			String(now.getMonth() + 1).padStart(2, '0') + '-' +
			String(now.getDate()).padStart(2, '0') + ' ' +
			String(now.getHours()).padStart(2, '0') + ':' +
			String(now.getMinutes()).padStart(2, '0') + ':' +
			String(now.getSeconds()).padStart(2, '0');

		return {
			version: '1.5.6',
			msgId: crypto.randomUUID(),
			operation,
			requestDate,
			validateOnly: false,
			requestData,
		};
	}

	// ──────────────────────────────────────────────────────────────────────────
	// POST /payments/create
	// ──────────────────────────────────────────────────────────────────────────
	async createPayment(userId: string, dto: CreatePaymentDto, origin?: string) {
		// Resolve combination from either combinationId or courseIds
		let combo;
		if (dto.combinationId) {
			combo = await this.prisma.courseCombination.findUnique({
				where: { id: dto.combinationId },
				include: { items: { include: { course: true } } },
			});
			if (!combo) throw new NotFoundException(`Combination ${dto.combinationId} not found`);
		} else if (dto.courseIds && dto.courseIds.length > 0) {
			combo = await this.findOrCreateCombination(dto.courseIds);
		} else {
			throw new BadRequestException('Either combinationId or courseIds must be provided');
		}

		const user = await this.prisma.user.findUnique({ where: { id: userId } });
		if (!user) throw new NotFoundException('User not found');

		const currency = dto.currency || process.env.IPG_CURRENCY || 'LKR';
		const amount = currency === 'GBP'
			? (combo.priceGbp && combo.priceGbp > 0 ? combo.priceGbp : (dto.amount || combo.priceGbp || 0))
			: combo.price;
		const frontendOrigin = this.resolveOrigin(origin);

		// Create a PENDING order
		const order = await this.prisma.order.create({
			data: {
				userId,
				combinationId: combo.id,
				amount,
				currency,
				status: 'PENDING',
				ipgMerchantRef: this.generateMerchantRef(),
				frontendOrigin,
			},
		});

		const checkoutUrl = await this.callPayCorpCheckout(order.id, order.ipgMerchantRef!, amount, currency, {
			name: user.name,
			email: user.email,
			phone: (user as any).phone ?? '',
		}, frontendOrigin);

		return { orderId: order.id, paymentUrl: checkoutUrl };
	}

	// ──────────────────────────────────────────────────────────────────────────
	// POST /payments/guest-create
	// ──────────────────────────────────────────────────────────────────────────
	async createGuestPayment(dto: GuestPaymentDto, origin?: string) {
		// Resolve combination from either combinationId or courseIds
		let combo;
		if (dto.combinationId) {
			combo = await this.prisma.courseCombination.findUnique({
				where: { id: dto.combinationId },
				include: { items: { include: { course: true } } },
			});
			if (!combo) throw new NotFoundException(`Combination ${dto.combinationId} not found`);
		} else if (dto.courseIds && dto.courseIds.length > 0) {
			combo = await this.findOrCreateCombination(dto.courseIds);
		} else {
			throw new BadRequestException('Either combinationId or courseIds must be provided');
		}

		const fullName = [dto.firstName, dto.lastName].filter(Boolean).join(' ');
		const phone = dto.phone || '';
		const currency = dto.currency || process.env.IPG_CURRENCY || 'LKR';
		const amount = currency === 'GBP'
			? (combo.priceGbp && combo.priceGbp > 0 ? combo.priceGbp : (dto.amount || combo.priceGbp || 0))
			: combo.price;
		const frontendOrigin = this.resolveOrigin(origin);

		// Create a PENDING order (no user account required)
		const order = await this.prisma.order.create({
			data: {
				combinationId: combo.id,
				amount,
				currency,
				status: 'PENDING',
				ipgMerchantRef: this.generateMerchantRef(),
				guestName: fullName,
				guestEmail: dto.email,
				guestPhone: phone || null,
				frontendOrigin,
			},
		});

		const checkoutUrl = await this.callPayCorpCheckout(order.id, order.ipgMerchantRef!, amount, currency, {
			name: fullName,
			email: dto.email,
			phone,
		}, frontendOrigin);

		return {
			orderId: order.id,
			paymentUrl: checkoutUrl,
		};
	}

	// ──────────────────────────────────────────────────────────────────────────
	// POST /payments/webhook
	// ──────────────────────────────────────────────────────────────────────────
	async handleWebhook(body: WebhookDto) {
		this.logger.log(`Webhook received: order_id=${body.order_id} status_code=${body.status_code}`);

		const { merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig } = body;

		// 1. Verify merchant identity
		if (merchant_id !== process.env.IPG_CUSTOMER_ID) {
			this.logger.warn('Webhook: merchant_id mismatch');
			throw new BadRequestException('Invalid merchant');
		}

		// 2. Verify signature (PayHere format)
		const expectedSig = this.buildWebhookSignature(
			merchant_id,
			order_id,
			payhere_amount,
			payhere_currency,
			status_code,
		);
		if (expectedSig.toUpperCase() !== (md5sig || '').toUpperCase()) {
			this.logger.warn('Webhook: signature mismatch');
			throw new BadRequestException('Invalid signature');
		}

		// 3. Fetch and validate the order
		const order = await this.prisma.order.findUnique({
			where: { id: order_id },
			include: {
				user: true,
				combination: { include: { items: { include: { course: true } } } },
			},
		});
		if (!order) {
			this.logger.warn(`Webhook: order ${order_id} not found`);
			throw new NotFoundException('Order not found');
		}
		if (order.status === 'PAID') {
			// Idempotent – already processed
			return { message: 'Already processed' };
		}

		// 4. Verify amount (compare as integers to avoid floating-point issues)
		const receivedAmountLkr = Math.round(parseFloat(payhere_amount));
		if (receivedAmountLkr !== order.amount) {
			this.logger.warn(
				`Webhook: amount mismatch (got ${receivedAmountLkr}, expected ${order.amount})`,
			);
			throw new BadRequestException('Amount mismatch');
		}

		// 5. Process result based on status_code
		//    PayHere: 2 = SUCCESS, 0 = PENDING, -1 = CANCELLED, -2 = FAILED, -3 = CHARGEDBACK
		if (status_code === '2') {
			await this.prisma.order.update({
				where: { id: order_id },
				data: { status: 'PAID', ipgRef: body.payment_id ?? null },
			});

			// Grant access to each subject in the combination (only for registered users with a combo)
			if (order.userId && order.combination) {
				const courseIds = order.combination.items.map((i) => i.courseId);
				for (const courseId of courseIds) {
					await this.prisma.userCourse.upsert({
						where: { userId_courseId: { userId: order.userId, courseId } },
						update: {},
						create: { userId: order.userId, courseId, orderId: order.id },
					});
				}
				this.logger.log(`Order ${order_id} marked PAID, ${courseIds.length} course(s) granted to user ${order.userId}`);
			} else {
				this.logger.log(`Order ${order_id} marked PAID (guest/custom order – no course access grants)`);
			}

			// Mark payment link as paid when expireOnPayment is set
			if (order.paymentLinkId) {
				const pl = await this.prisma.paymentLink.findUnique({ where: { id: order.paymentLinkId } });
				if (pl) {
					await this.prisma.paymentLink.update({
						where: { id: order.paymentLinkId },
						data: { isPaid: true, paidAt: new Date() },
					});
				}
			}

			// Send payment receipt email
			const recipientName = order.userId
				? (order.user?.name ?? order.guestName ?? 'Student')
				: (order.guestName ?? 'Student');
			const recipientEmail = order.userId
				? (order.user?.email ?? order.guestEmail ?? '')
				: (order.guestEmail ?? '');
			if (recipientEmail) {
				this.email.sendPaymentReceiptEmail({
					name: recipientName,
					email: recipientEmail,
					orderId: order.id,
					courseName: order.combination?.name || order.combination?.id || 'Custom Payment',
					amount: order.amount,
					currency: order.currency,
					ipgRef: body.payment_id ?? undefined,
					paidAt: new Date(),
				});
			}

			return { message: 'Payment successful' };
		}

		if (status_code === '-1' || status_code === '-2' || status_code === '-3') {
			await this.prisma.order.update({
				where: { id: order_id },
				data: { status: 'FAILED' },
			});
			this.logger.log(`Order ${order_id} marked FAILED (status_code=${status_code})`);
			return { message: 'Payment failed' };
		}

		// status_code 0 = still pending
		return { message: 'Pending' };
	}

	// ──────────────────────────────────────────────────────────────────────────
	// Private helpers
	// ──────────────────────────────────────────────────────────────────────────

	generateMerchantRef(): string {
		return `NAN-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
	}

	/** Saves enrollment form data so admin can see unpaid submissions. */
	async saveEnrollment(dto: EnrollmentSubmitDto): Promise<{ id: string }> {
		const record = await this.prisma.enrollmentSubmission.create({
			data: {
				firstName: dto.firstName,
				lastName: dto.lastName,
				email: dto.email,
				phone: dto.phone || null,
				whatsapp: dto.whatsapp || null,
				cimaId: dto.cimaId || null,
				cimaStage: dto.cimaStage || null,
				dob: dto.dob || null,
				gender: dto.gender || null,
				country: dto.country || null,
				city: dto.city || null,
				postcode: dto.postcode || null,
				notes: dto.notes || null,
				cartJson: (dto.cartItems || []) as any,
				currency: dto.currency || 'GBP',
				amount: dto.amount || 0,
			},
		});
		return { id: record.id };
	}

	/**
	 * Step 1 of 2: PAYMENT_INIT
	 *
	 * Calls the PayCorp merchant API to create a hosted payment page session.
	 * Auth: AUTHTOKEN header (merchant UUID) + HMAC header (HMAC-SHA256 of body).
	 * On success PayCorp returns { paymentPageUrl, reqid }.
	 * The caller redirects the browser to paymentPageUrl.
	 */
	/** Returns the first allowed origin from FRONTEND_URL, or validates the provided origin against the whitelist. */
	resolveOrigin(requestOrigin?: string): string {
		const allowed = (process.env.FRONTEND_URL || 'https://nanaska.com')
			.split(',')
			.map((o) => o.trim())
			.filter(Boolean);
		if (requestOrigin && allowed.includes(requestOrigin)) {
			return requestOrigin;
		}
		return allowed[0];
	}

	/**
	 * Expose checkout call for PaymentLinksService without duplicating logic.
	 */
	async initiateCustomPayment(opts: {
		orderId: string;
		merchantRef: string;
		amount: number;
		currency: string;
		customer: { name: string; email: string; phone?: string };
		frontendOrigin?: string;
	}): Promise<string> {
		return this.callPayCorpCheckout(
			opts.orderId,
			opts.merchantRef,
			opts.amount,
			opts.currency,
			opts.customer,
			opts.frontendOrigin,
		);
	}

	private async callPayCorpCheckout(
		orderId: string,
		merchantRef: string,
		amount: number,
		currency: string,
		user: { name: string; email: string; phone?: string },
		frontendOrigin?: string,
	): Promise<string> {
		const clientId = currency === 'GBP'
			? parseInt(process.env.IPG_GBP_CLIENT_ID || '14004406', 10)
			: parseInt(process.env.IPG_CLIENT_ID!, 10);
		const serviceEndpoint = process.env.IPG_SERVICE_ENDPOINT || process.env.IPG_BASE_URL!

		const requestData = {
			clientId,
			transactionType: 'PURCHASE',
			transactionAmount: {
				totalAmount: amount * 100,
				paymentAmount: amount * 100,
				serviceFeeAmount: 0,
				currency,
			},
			redirect: {
				returnUrl: process.env.IPG_RETURN_URL!,
				cancelUrl: frontendOrigin
					? `${frontendOrigin}/payment-cancel`
					: process.env.IPG_CANCEL_URL || process.env.IPG_RETURN_URL!,
				returnMethod: 'GET',
			},
			clientRef: merchantRef,
			tokenize: false,
		};

		const envelope = this.buildEnvelope('PAYMENT_INIT', requestData);
		const envelopeJson = JSON.stringify(envelope);
		const hmac = this.sign(envelopeJson);

		this.logger.log(`PayCorp PAYMENT_INIT → ${serviceEndpoint}\n  Body: ${envelopeJson}`);

		const res = await fetch(serviceEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'AUTHTOKEN': process.env.IPG_AUTH_TOKEN!,
				'HMAC': hmac,
			},
			body: envelopeJson,
		});

		const data: any = await res.json().catch(() => ({}));
		this.logger.log(`PayCorp PAYMENT_INIT response (${res.status}): ${JSON.stringify(data)}`);

		if (!res.ok) {
			throw new BadRequestException(
				data?.message || data?.error || `PayCorp error ${res.status}`,
			);
		}

		// PayCorp wraps the result under responseData
		const rd = data?.responseData ?? data;
		const paymentPageUrl: string =
			rd?.paymentPageUrl ??
			rd?.paymentURL ??
			rd?.redirectUrl;

		if (!paymentPageUrl) {
			this.logger.error(`PayCorp PAYMENT_INIT – no paymentPageUrl in response: ${JSON.stringify(data)}`);
			throw new BadRequestException('PayCorp did not return a payment page URL');
		}

		// Persist the reqid so PAYMENT_COMPLETE can look up the order
		const reqid = rd?.reqid ?? rd?.ReqID ?? rd?.requestId;
		if (reqid) {
			await this.prisma.order.updateMany({
				where: { ipgMerchantRef: merchantRef },
				data: { ipgRef: String(reqid) },
			});
		}

		return paymentPageUrl;
	}

	/**
	 * Step 2 of 2: PAYMENT_COMPLETE
	 * Called when PayCorp redirects the browser back to our returnUrl with ?reqid=xxx.
	 * Submits the reqid to PayCorp to finalise the transaction and updates the order.
	 * Returns { success, redirectTo } so the controller can redirect the browser.
	 * Ref: Paycenter Web 4.0 §6.9
	 */
	/**
	 * Step 2 of 2: PAYMENT_COMPLETE
	 *
	 * Called when PayCorp GETs the merchant returnUrl with ?ReqID=xxx.
	 * Submits the ReqID back to PayCorp to finalise and get the transaction result.
	 */
	async completePayment(reqid: string): Promise<{ success: boolean; redirectTo: string }> {
		// Look up the order first to determine which client ID was used at init time
		const pendingOrder = await this.prisma.order.findFirst({ where: { ipgRef: reqid } });
		const orderCurrency = pendingOrder?.currency || 'LKR';
		const clientId = orderCurrency === 'GBP'
			? parseInt(process.env.IPG_GBP_CLIENT_ID || '14004406', 10)
			: parseInt(process.env.IPG_CLIENT_ID!, 10);
		const serviceEndpoint = process.env.IPG_SERVICE_ENDPOINT || process.env.IPG_BASE_URL!

		const requestData = { clientId, reqid };
		const envelope = this.buildEnvelope('PAYMENT_COMPLETE', requestData);
		const envelopeJson = JSON.stringify(envelope);
		const hmac = this.sign(envelopeJson);

		this.logger.log(`PayCorp PAYMENT_COMPLETE reqid=${reqid}`);

		const res = await fetch(serviceEndpoint, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'AUTHTOKEN': process.env.IPG_AUTH_TOKEN!,
				'HMAC': hmac,
			},
			body: envelopeJson,
		});

		const data: any = await res.json().catch(() => ({}));
		this.logger.log(`PayCorp PAYMENT_COMPLETE response (${res.status}): ${JSON.stringify(data)}`);

		// PayCorp wraps results under responseData
		const rd = data?.responseData ?? data;
		const responseCode: string = rd?.responseCode ?? '';
		const txnRef: string = String(rd?.txnReference ?? rd?.transactionRef ?? '');
		const success = res.ok && responseCode === '00';

		// Find and update the order
		const order = await this.prisma.order.findFirst({
			where: { ipgRef: reqid },
			include: {
				user: true,
				combination: { include: { items: { include: { course: true } } } },
			},
		});

		if (order) {
			await this.prisma.order.update({
				where: { id: order.id },
				data: { status: success ? 'PAID' : 'FAILED' },
			});

			if (success && order.userId && order.combination) {
				const courseIds = order.combination.items.map((i) => i.courseId);
				for (const courseId of courseIds) {
					await this.prisma.userCourse.upsert({
						where: { userId_courseId: { userId: order.userId, courseId } },
						update: {},
						create: { userId: order.userId, courseId, orderId: order.id },
					});
				}
				this.logger.log(`Order ${order.id} PAID – ${courseIds.length} course(s) granted to user ${order.userId}`);
			}

			// Mark payment link paid
			if (success && order.paymentLinkId) {
				await this.prisma.paymentLink.update({
					where: { id: order.paymentLinkId },
					data: { isPaid: true, paidAt: new Date() },
				});
			}

			// Send payment receipt email on success
			if (success) {
				const recipientName = order.user?.name ?? order.guestName ?? 'Student';
				const recipientEmail = order.user?.email ?? order.guestEmail ?? '';
				if (recipientEmail) {
					this.email.sendPaymentReceiptEmail({
						name: recipientName,
						email: recipientEmail,
						orderId: order.id,
						courseName: order.combination?.name || order.combination?.id || 'Custom Payment',
						amount: order.amount,
						currency: order.currency,
						ipgRef: txnRef || undefined,
						paidAt: new Date(),
					});
				}
			}
		} else {
			this.logger.warn(`PAYMENT_COMPLETE: no order found for reqid=${reqid}`);
		}

		const frontendBase = order?.frontendOrigin || (process.env.FRONTEND_URL || 'https://nanaska.com').split(',')[0].trim();
		const redirectTo = success
			? `${frontendBase}/payment-success?ref=${txnRef}`
			: `${frontendBase}/payment-cancel?reason=${encodeURIComponent(data?.responseText ?? 'Payment failed')}`;

		return { success, redirectTo };
	}

	/**
	 * Builds the expected MD5 signature for an incoming webhook notification.
	 * PayHere format:
	 *   MD5( merchant_id + order_id + payhere_amount + payhere_currency + status_code + MD5(merchant_secret).toUpperCase() ).toUpperCase()
	 */
	private buildWebhookSignature(
		merchantId: string,
		orderId: string,
		amount: string,
		currency: string,
		statusCode: string,
	): string {
		const merchantSecret = process.env.IPG_MERCHANT_SECRET!;
		const hashedSecret = crypto
			.createHash('md5')
			.update(merchantSecret)
			.digest('hex')
			.toUpperCase();

		return crypto
			.createHash('md5')
			.update(`${merchantId}${orderId}${amount}${currency}${statusCode}${hashedSecret}`)
			.digest('hex')
			.toUpperCase();
	}
}
