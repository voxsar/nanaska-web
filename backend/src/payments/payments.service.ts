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
import { GoogleSheetsService } from '../admin/google-sheets.service';

const EDGE_REGISTRATION_WEBHOOK_URL = 'https://automation.nanaska.com/webhook-test/registration';

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
		private readonly googleSheets: GoogleSheetsService,
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
		const user = await this.prisma.user.findUnique({ where: { id: userId } });
		if (!user) throw new NotFoundException('User not found');

		const currency = dto.currency || process.env.IPG_CURRENCY || 'LKR';

		// Calculate total from all combinations and courses in cart
		let totalPriceLkr = 0;
		let totalPriceGbp = 0;
		const allCombinationIds: string[] = [];

		// Add single combinationId if provided
		if (dto.combinationId) {
			allCombinationIds.push(dto.combinationId);
		}

		// Add multiple combinationIds if provided
		if (dto.combinationIds && dto.combinationIds.length > 0) {
			allCombinationIds.push(...dto.combinationIds);
		}

		// Fetch all combinations and sum their prices
		for (const comboId of allCombinationIds) {
			const combo = await this.prisma.courseCombination.findUnique({
				where: { id: comboId },
				include: { items: { include: { course: true } } },
			});
			if (!combo) throw new NotFoundException(`Combination ${comboId} not found`);
			totalPriceLkr += combo.price;
			totalPriceGbp += combo.priceGbp || 0;
		}

		// Add individual course prices
		if (dto.courseIds && dto.courseIds.length > 0) {
			const courses = await this.prisma.course.findMany({
				where: { id: { in: dto.courseIds } },
			});
			if (courses.length !== dto.courseIds.length) {
				throw new NotFoundException(`One or more course IDs not found`);
			}
			for (const course of courses) {
				totalPriceLkr += course.price;
				totalPriceGbp += course.priceGbp || 0;
			}
		}

		// Use currency-specific total
		const amount = currency === 'GBP' ? totalPriceGbp : totalPriceLkr;

		if (amount <= 0) {
			throw new BadRequestException('Cart total must be greater than zero');
		}

		// Create or find combination for this cart
		let finalComboId = dto.combinationId;
		if (!finalComboId) {
			// If multiple items, create a dynamic combination
			const allCourseIds = [...dto.courseIds || []];
			// Extract course IDs from combinations
			for (const comboId of allCombinationIds) {
				const combo = await this.prisma.courseCombination.findUnique({
					where: { id: comboId },
					include: { items: { include: { course: true } } },
				});
				if (combo?.items) {
					allCourseIds.push(...combo.items.map(item => item.course.id));
				}
			}
			if (allCourseIds.length > 0) {
				const combo = await this.findOrCreateCombination(allCourseIds);
				finalComboId = combo.id;
			}
		}

		const frontendOrigin = this.resolveOrigin(origin);

		// Create a PENDING order
		const order = await this.prisma.order.create({
			data: {
				userId,
				combinationId: finalComboId,
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
		const fullName = [dto.firstName, dto.lastName].filter(Boolean).join(' ');
		const phone = dto.phone || '';
		const currency = dto.currency || process.env.IPG_CURRENCY || 'LKR';

		// Calculate total from all combinations and courses in cart
		let totalPriceLkr = 0;
		let totalPriceGbp = 0;
		const allCombinationIds: string[] = [];

		// Add single combinationId if provided
		if (dto.combinationId) {
			allCombinationIds.push(dto.combinationId);
		}

		// Add multiple combinationIds if provided
		if (dto.combinationIds && dto.combinationIds.length > 0) {
			allCombinationIds.push(...dto.combinationIds);
		}

		// Fetch all combinations and sum their prices
		for (const comboId of allCombinationIds) {
			const combo = await this.prisma.courseCombination.findUnique({
				where: { id: comboId },
				include: { items: { include: { course: true } } },
			});
			if (!combo) throw new NotFoundException(`Combination ${comboId} not found`);
			totalPriceLkr += combo.price;
			totalPriceGbp += combo.priceGbp || 0;
		}

		// Add individual course prices
		if (dto.courseIds && dto.courseIds.length > 0) {
			const courses = await this.prisma.course.findMany({
				where: { id: { in: dto.courseIds } },
			});
			if (courses.length !== dto.courseIds.length) {
				throw new NotFoundException(`One or more course IDs not found`);
			}
			for (const course of courses) {
				totalPriceLkr += course.price;
				totalPriceGbp += course.priceGbp || 0;
			}
		}

		// Use currency-specific total
		const amount = currency === 'GBP' ? totalPriceGbp : totalPriceLkr;

		if (amount <= 0) {
			throw new BadRequestException('Cart total must be greater than zero');
		}

		// Create or find combination for this cart
		let finalComboId = dto.combinationId;
		if (!finalComboId) {
			// If multiple items, create a dynamic combination
			const allCourseIds = [...dto.courseIds || []];
			// Extract course IDs from combinations
			for (const comboId of allCombinationIds) {
				const combo = await this.prisma.courseCombination.findUnique({
					where: { id: comboId },
					include: { items: { include: { course: true } } },
				});
				if (combo?.items) {
					allCourseIds.push(...combo.items.map(item => item.course.id));
				}
			}
			if (allCourseIds.length > 0) {
				const combo = await this.findOrCreateCombination(allCourseIds);
				finalComboId = combo.id;
			}
		}

		const frontendOrigin = this.resolveOrigin(origin);

		// Create a PENDING order (no user account required)
		const order = await this.prisma.order.create({
			data: {
				combinationId: finalComboId,
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

			await this.sendPaidEdgeRegistrationForOrder({
				...order,
				status: 'PAID',
				ipgRef: body.payment_id ?? order.ipgRef,
			});

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

	private getCartItems(enrollment: { cartJson: unknown }): any[] {
		return Array.isArray(enrollment.cartJson) ? enrollment.cartJson : [];
	}

	private getEdgeCartItem(enrollment: { cartJson: unknown }): any | null {
		return this.getCartItems(enrollment).find((item) => item?.type === 'nanaska-edge') || null;
	}

	private getEdgeRegistrationType(enrollment: { cartJson: unknown }): 'free-mock' | 'revision' | null {
		const item = this.getEdgeCartItem(enrollment);
		const explicit = item?.registrationType;
		if (explicit === 'free-mock' || explicit === 'revision') return explicit;
		if (item?.kind === 'free') return 'free-mock';
		if (item?.kind === 'revision') return 'revision';
		return null;
	}

	private hasEdgeRegistrationBeenSent(enrollment: { cartJson: unknown }): boolean {
		const item = this.getEdgeCartItem(enrollment);
		return Boolean(item?.n8nSentAt);
	}

	private async getEdgeRegistrationWebhookUrl(): Promise<string> {
		const setting = await this.prisma.siteSetting.findUnique({
			where: { key: 'edge_n8n_registration_webhook' },
		});
		return setting?.value?.trim() || EDGE_REGISTRATION_WEBHOOK_URL;
	}

	private buildEdgeRegistrationPayload(
		enrollment: any,
		registrationType: 'free-mock' | 'revision',
		paymentStatus: 'unpaid' | 'paid',
		order?: any,
	) {
		const item = this.getEdgeCartItem(enrollment) || {};
		const firstName = enrollment.firstName || '';
		const lastName = enrollment.lastName || '';
		const name = [firstName, lastName].filter(Boolean).join(' ').trim();

		return {
			registration_type: registrationType,
			payment_status: paymentStatus,
			enrollment_id: enrollment.id,
			order_id: order?.id || enrollment.orderId || null,
			payment_ref: order?.ipgRef || null,
			first_name: firstName,
			last_name: lastName,
			name,
			email: enrollment.email,
			phone: enrollment.phone,
			whatsapp: enrollment.whatsapp,
			cima_id: enrollment.cimaId,
			cima_stage: enrollment.cimaStage,
			country: enrollment.country,
			city: enrollment.city,
			postcode: enrollment.postcode,
			notes: enrollment.notes,
			currency: order?.currency || enrollment.currency,
			amount: order?.amount ?? enrollment.amount,
			course_code: item.courseCode || null,
			case_study: item.title || item.name || enrollment.cimaStage || null,
			combination_id: item.combinationId || order?.combinationId || null,
			study_mode: item.studyMode || null,
			cart_items: this.getCartItems(enrollment),
			submitted_at: enrollment.createdAt,
			sent_at: new Date().toISOString(),
		};
	}

	private async sendEdgeRegistrationToN8n(
		enrollment: any,
		paymentStatus: 'unpaid' | 'paid',
		order?: any,
	): Promise<boolean> {
		const registrationType = this.getEdgeRegistrationType(enrollment);
		if (!registrationType) return false;
		if (this.hasEdgeRegistrationBeenSent(enrollment)) return false;
		if (registrationType === 'revision' && paymentStatus !== 'paid') return false;

		const webhookUrl = await this.getEdgeRegistrationWebhookUrl();
		const payload = this.buildEdgeRegistrationPayload(enrollment, registrationType, paymentStatus, order);

		const res = await fetch(webhookUrl, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});

		if (!res.ok) {
			const responseText = await res.text().catch(() => '');
			throw new BadRequestException(`Nanaska Edge n8n registration failed (${res.status}) ${responseText}`.trim());
		}

		const cartItems = this.getCartItems(enrollment).map((item) => (
			item?.type === 'nanaska-edge'
				? { ...item, n8nSentAt: payload.sent_at, n8nRegistrationType: registrationType }
				: item
		));

		await this.prisma.enrollmentSubmission.update({
			where: { id: enrollment.id },
			data: { cartJson: cartItems as any },
		});

		this.logger.log(`Nanaska Edge ${registrationType} registration ${enrollment.id} sent to n8n`);
		return true;
	}

	private async sendPaidEdgeRegistrationForOrder(order: any) {
		const enrollment = await this.prisma.enrollmentSubmission.findFirst({
			where: { orderId: order.id },
			orderBy: { createdAt: 'desc' },
		});

		if (!enrollment) return;
		try {
			await this.sendEdgeRegistrationToN8n(enrollment, 'paid', order);
		} catch (error) {
			this.logger.error(`Failed to send paid Nanaska Edge registration for order ${order.id}`, error.message);
		}
	}

	/** Saves enrollment form data so admin can see unpaid submissions. */
	async saveEnrollment(dto: EnrollmentSubmitDto): Promise<{ id: string }> {
		const cartItems = (dto.cartItems || []).map((item) => (
			item?.type === 'nanaska-edge'
				? { ...item, registrationType: dto.registrationType || item.registrationType }
				: item
		));

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
				cartJson: cartItems as any,
				currency: dto.currency || 'GBP',
				amount: dto.amount || 0,
				orderId: dto.orderId || null,
			},
		});

		// Auto-sync to Google Sheets (non-blocking)
		this.googleSheets.syncSingleEnrollment(record.id).catch((error) => {
			this.logger.error(`Failed to auto-sync enrollment ${record.id} to Google Sheets`, error.message);
		});

		if (this.getEdgeRegistrationType(record) === 'free-mock') {
			await this.sendEdgeRegistrationToN8n(record, 'unpaid');
		}

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

				await this.sendPaidEdgeRegistrationForOrder({
					...order,
					status: 'PAID',
					ipgRef: txnRef || order.ipgRef,
				});
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
