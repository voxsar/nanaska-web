import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEdgeWebhookDto } from './dto/create-edge-webhook.dto';
import { UpdateEdgeWebhookDto } from './dto/update-edge-webhook.dto';

/** Normalised paid registration, built by the payments service from an order. */
export interface PaidRegistrationInput {
	orderId: string;
	enrollmentId?: string | null;
	paymentRef?: string | null;
	paidAt: Date;
	amount: number;
	currency: string;
	student: {
		name?: string | null;
		firstName?: string | null;
		lastName?: string | null;
		email: string;
		phone?: string | null;
		whatsapp?: string | null;
		cimaId?: string | null;
		studentId?: string | null;
		dateOfBirth?: string | null;
		gender?: string | null;
		country?: string | null;
		street?: string | null;
		city?: string | null;
		postcode?: string | null;
		timezone?: string | null;
	};
	course: {
		code?: string | null;
		name?: string | null;
		qualificationStage?: string | null;
		combinationId?: string | null;
		cohortId?: number | null;
		packageSlug?: string | null;
		items?: any[];
	};
	receipt: {
		receiptNo?: string | null;
		method?: string | null;
		total?: number | null;
		lineItems?: Array<{ description: string; amount: number | null }>;
	};
	/** Every code this order touches – case-study code, course ids, level. Used to match an edge's filter. */
	matchCodes: string[];
}

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1500;
const REQUEST_TIMEOUT_MS = 20000;

/**
 * Nanaska Edge registration webhooks.
 *
 * Several edges run at once, each its own deployment with its own database, so
 * a paid registration is posted to every enabled edge whose course filter
 * matches the order. Each delivery is signed with that edge's own secret in the
 * form its HMAC middleware expects (`X-Signature: sha256=<hex>` over the raw
 * body), and every attempt is recorded so a hand-off that failed is visible in
 * admin and can be retried without replaying the payment.
 */
@Injectable()
export class EdgeWebhooksService {
	private readonly logger = new Logger(EdgeWebhooksService.name);

	constructor(private readonly prisma: PrismaService) { }

	// ── Admin CRUD ────────────────────────────────────────────────────────────

	async findAll() {
		const webhooks = await this.prisma.edgeWebhook.findMany({
			orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
			include: {
				deliveries: {
					orderBy: { createdAt: 'desc' },
					take: 1,
				},
			},
		});

		// The secret is write-only in admin: it is never echoed back, only
		// whether one is set, so opening the page cannot leak it.
		return webhooks.map(({ secret, deliveries, ...webhook }) => ({
			...webhook,
			hasSecret: Boolean(secret),
			lastDelivery: deliveries[0]
				? {
					status: deliveries[0].status,
					statusCode: deliveries[0].statusCode,
					error: deliveries[0].error,
					attempts: deliveries[0].attempts,
					orderId: deliveries[0].orderId,
					createdAt: deliveries[0].createdAt,
					deliveredAt: deliveries[0].deliveredAt,
				}
				: null,
		}));
	}

	async create(dto: CreateEdgeWebhookDto) {
		const webhook = await this.prisma.edgeWebhook.create({
			data: {
				name: dto.name,
				url: dto.url,
				secret: dto.secret,
				courseCodes: this.normaliseCodes(dto.courseCodes),
				isActive: dto.isActive ?? true,
				sortOrder: dto.sortOrder ?? 0,
				notes: dto.notes ?? null,
			},
		});
		this.logger.log(`Edge webhook created: ${webhook.name} → ${webhook.url}`);
		return { ...webhook, secret: undefined, hasSecret: true };
	}

	async update(id: string, dto: UpdateEdgeWebhookDto) {
		await this.findOneOrFail(id);

		const webhook = await this.prisma.edgeWebhook.update({
			where: { id },
			data: {
				...(dto.name !== undefined ? { name: dto.name } : {}),
				...(dto.url !== undefined ? { url: dto.url } : {}),
				// An empty secret means "leave the stored one alone".
				...(dto.secret ? { secret: dto.secret } : {}),
				...(dto.courseCodes !== undefined ? { courseCodes: this.normaliseCodes(dto.courseCodes) } : {}),
				...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
				...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
				...(dto.notes !== undefined ? { notes: dto.notes } : {}),
			},
		});
		return { ...webhook, secret: undefined, hasSecret: Boolean(webhook.secret) };
	}

	async remove(id: string) {
		await this.findOneOrFail(id);
		await this.prisma.edgeWebhook.delete({ where: { id } });
		return { message: 'Edge webhook deleted' };
	}

	async findDeliveries(id: string, limit = 20) {
		await this.findOneOrFail(id);
		return this.prisma.edgeWebhookDelivery.findMany({
			where: { webhookId: id },
			orderBy: { createdAt: 'desc' },
			take: Math.min(limit, 100),
		});
	}

	/**
	 * Post a harmless probe so admin can confirm a new edge's URL and secret
	 * before a real student depends on them. `test: true` and a `dry_run` event
	 * keep the edge from registering anybody.
	 */
	async sendTest(id: string) {
		const webhook = await this.findOneOrFail(id);
		const payload = {
			event: 'registration.test',
			test: true,
			sent_at: new Date().toISOString(),
		};

		const result = await this.post(webhook, payload);

		return {
			ok: result.ok,
			statusCode: result.statusCode,
			error: result.error,
			// A signed probe that reaches the edge is answered by validation
			// (422), which still proves the URL and secret are right.
			message: result.ok || result.statusCode === 422
				? 'The edge accepted the signed request.'
				: 'The edge did not accept the request – check the URL and secret.',
		};
	}

	/** Re-send a recorded delivery, keeping the original payload. */
	async retryDelivery(deliveryId: string) {
		const delivery = await this.prisma.edgeWebhookDelivery.findUnique({
			where: { id: deliveryId },
			include: { webhook: true },
		});

		if (!delivery) throw new NotFoundException('Delivery not found');
		if (!delivery.payloadJson) throw new NotFoundException('This delivery has no stored payload to retry');

		const result = await this.post(delivery.webhook, delivery.payloadJson as any);

		await this.prisma.edgeWebhookDelivery.update({
			where: { id: deliveryId },
			data: {
				status: result.ok ? 'success' : 'failed',
				statusCode: result.statusCode,
				responseBody: result.body?.slice(0, 2000) ?? null,
				error: result.error ?? null,
				attempts: { increment: 1 },
				deliveredAt: result.ok ? new Date() : null,
			},
		});

		return { ok: result.ok, statusCode: result.statusCode, error: result.error };
	}

	// ── Fan-out ───────────────────────────────────────────────────────────────

	/**
	 * Deliver a paid registration to every edge configured for it.
	 *
	 * Never throws: the payment has already succeeded, so a webhook problem
	 * must not fail the caller. Failures land in edge_webhook_deliveries.
	 */
	async dispatchPaidRegistration(input: PaidRegistrationInput): Promise<void> {
		let webhooks: Array<{ id: string; name: string; url: string; secret: string; courseCodes: string[] }>;

		try {
			webhooks = await this.prisma.edgeWebhook.findMany({
				where: { isActive: true },
				orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
			});
		} catch (err: any) {
			this.logger.error(`Could not load edge webhooks for order ${input.orderId}: ${err.message}`);
			return;
		}

		const targets = webhooks.filter((webhook) => this.matches(webhook.courseCodes, input.matchCodes));

		if (targets.length === 0) {
			this.logger.log(
				`Order ${input.orderId}: no edge webhook matches codes [${input.matchCodes.join(', ')}]`,
			);
			return;
		}

		const payload = this.buildPayload(input);

		await Promise.all(targets.map((webhook) => this.deliver(webhook, payload, input.orderId)));
	}

	/**
	 * An edge with no course codes takes every registration; otherwise it takes
	 * the ones whose order mentions a code it serves.
	 */
	private matches(webhookCodes: string[], orderCodes: string[]): boolean {
		if (!webhookCodes || webhookCodes.length === 0) return true;

		const wanted = new Set(webhookCodes.map((code) => code.trim().toUpperCase()).filter(Boolean));
		if (wanted.size === 0) return true;

		return orderCodes.some((code) => wanted.has(code.trim().toUpperCase()));
	}

	/** Wire format expected by the edge's /api/provision/students/website-registration. */
	private buildPayload(input: PaidRegistrationInput): Record<string, any> {
		const name = input.student.name
			|| [input.student.firstName, input.student.lastName].filter(Boolean).join(' ').trim()
			|| undefined;

		return {
			event: 'registration.paid',
			order_id: input.orderId,
			enrollment_id: input.enrollmentId ?? null,
			payment_ref: input.paymentRef ?? null,
			paid_at: input.paidAt.toISOString(),
			amount: input.amount,
			currency: input.currency,
			student: {
				name,
				first_name: input.student.firstName ?? null,
				last_name: input.student.lastName ?? null,
				email: input.student.email,
				phone: input.student.phone ?? null,
				whatsapp: input.student.whatsapp ?? null,
				cima_id: input.student.cimaId ?? null,
				student_id: input.student.studentId ?? null,
				date_of_birth: input.student.dateOfBirth ?? null,
				gender: input.student.gender ?? null,
				country: input.student.country ?? null,
				street: input.student.street ?? null,
				city: input.student.city ?? null,
				postcode: input.student.postcode ?? null,
				timezone: input.student.timezone ?? null,
			},
			course: {
				code: input.course.code ?? null,
				name: input.course.name ?? null,
				qualification_stage: input.course.qualificationStage ?? null,
				combination_id: input.course.combinationId ?? null,
				cohort_id: input.course.cohortId ?? null,
				package: input.course.packageSlug ?? null,
				items: input.course.items ?? [],
			},
			receipt: {
				receipt_no: input.receipt.receiptNo ?? null,
				method: input.receipt.method ?? null,
				total: input.receipt.total ?? input.amount,
				line_items: input.receipt.lineItems ?? [],
			},
		};
	}

	private async deliver(
		webhook: { id: string; name: string; url: string; secret: string },
		payload: Record<string, any>,
		orderId: string,
	): Promise<void> {
		const delivery = await this.prisma.edgeWebhookDelivery.create({
			data: {
				webhookId: webhook.id,
				orderId,
				event: String(payload.event ?? 'registration.paid'),
				payloadJson: payload as any,
				status: 'pending',
			},
		});

		let last: { ok: boolean; statusCode?: number; body?: string; error?: string } = {
			ok: false,
			error: 'No attempt was made',
		};

		for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
			last = await this.post(webhook, payload);

			if (last.ok) break;

			// A 4xx other than 429 is the edge rejecting the payload itself –
			// retrying sends the same body to the same answer.
			const code = last.statusCode ?? 0;
			if (code >= 400 && code < 500 && code !== 429) break;

			if (attempt < MAX_ATTEMPTS) {
				await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * attempt));
			}

			await this.prisma.edgeWebhookDelivery.update({
				where: { id: delivery.id },
				data: { attempts: attempt },
			}).catch(() => undefined);
		}

		await this.prisma.edgeWebhookDelivery.update({
			where: { id: delivery.id },
			data: {
				status: last.ok ? 'success' : 'failed',
				statusCode: last.statusCode ?? null,
				responseBody: last.body?.slice(0, 2000) ?? null,
				error: last.error ?? null,
				deliveredAt: last.ok ? new Date() : null,
			},
		}).catch((err) => {
			this.logger.error(`Failed to record edge delivery ${delivery.id}: ${err.message}`);
		});

		if (last.ok) {
			this.logger.log(`Order ${orderId} registered on edge "${webhook.name}" (${last.statusCode})`);
		} else {
			this.logger.error(
				`Order ${orderId} failed on edge "${webhook.name}": ${last.statusCode ?? ''} ${last.error ?? ''}`.trim(),
			);
		}
	}

	/**
	 * One signed POST. The signature is taken over the exact bytes sent, so the
	 * body is serialised once and reused for both the HMAC and the request.
	 */
	private async post(
		webhook: { url: string; secret: string },
		payload: Record<string, any>,
	): Promise<{ ok: boolean; statusCode?: number; body?: string; error?: string }> {
		const body = JSON.stringify(payload);
		const signature = crypto.createHmac('sha256', webhook.secret).update(body, 'utf8').digest('hex');

		try {
			const res = await fetch(webhook.url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Accept: 'application/json',
					'X-Signature': `sha256=${signature}`,
				},
				body,
				signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
			});

			const text = await res.text().catch(() => '');

			return {
				ok: res.ok,
				statusCode: res.status,
				body: text,
				error: res.ok ? undefined : `Edge responded ${res.status}`,
			};
		} catch (err: any) {
			return { ok: false, error: err?.message || 'Request failed' };
		}
	}

	private normaliseCodes(codes?: string[]): string[] {
		if (!codes) return [];
		return [...new Set(
			codes
				.map((code) => code.trim().toUpperCase())
				.filter(Boolean),
		)];
	}

	private async findOneOrFail(id: string) {
		const webhook = await this.prisma.edgeWebhook.findUnique({ where: { id } });
		if (!webhook) throw new NotFoundException('Edge webhook not found');
		return webhook;
	}
}
