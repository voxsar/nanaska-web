import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	Logger,
	NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentsService } from '../payments/payments.service';
import { EmailService } from '../email/email.service';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';
import { PayPaymentLinkDto } from './dto/pay-payment-link.dto';

@Injectable()
export class PaymentLinksService {
	private readonly logger = new Logger(PaymentLinksService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly payments: PaymentsService,
		private readonly email: EmailService,
	) { }

	// ── Admin: create ──────────────────────────────────────────────────────────

	async create(adminId: string, dto: CreatePaymentLinkDto) {
		const slug = this.generateSlug();
		const passwordHash = dto.password
			? await bcrypt.hash(dto.password, 12)
			: null;

		const link = await this.prisma.paymentLink.create({
			data: {
				slug,
				label: dto.label,
				studentName: dto.studentName,
				studentEmail: dto.studentEmail,
				amount: dto.amount,
				currency: dto.currency,
				description: dto.description ?? null,
				passwordHash,
				expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
				expireOnPayment: dto.expireOnPayment ?? false,
				createdByAdminId: adminId,
			},
		});

		if (dto.sendEmail !== false && link.studentEmail) {
			const frontendBase = (process.env.FRONTEND_URL || 'https://nanaska.com')
				.split(',')[0]
				.trim();
			const paymentUrl = `${frontendBase}/pay/${link.slug}`;
			this.email.sendPaymentLinkEmail({
				studentName: link.studentName ?? 'Student',
				studentEmail: link.studentEmail,
				amount: link.amount,
				currency: link.currency,
				description: link.description ?? undefined,
				paymentUrl,
				hasPassword: !!passwordHash,
				expiresAt: link.expiresAt ?? undefined,
			});
		}

		return this.sanitize(link);
	}

	// ── Admin: list ────────────────────────────────────────────────────────────

	async findAll() {
		const links = await this.prisma.paymentLink.findMany({
			orderBy: { createdAt: 'desc' },
		});
		return links.map(this.sanitize);
	}

	// ── Admin: delete ──────────────────────────────────────────────────────────

	async remove(id: string) {
		const link = await this.prisma.paymentLink.findUnique({ where: { id } });
		if (!link) throw new NotFoundException('Payment link not found');
		await this.prisma.paymentLink.delete({ where: { id } });
		return { message: 'Deleted' };
	}

	// ── Admin: resend email ────────────────────────────────────────────────────

	async resendEmail(id: string) {
		const link = await this.prisma.paymentLink.findUnique({ where: { id } });
		if (!link) throw new NotFoundException('Payment link not found');
		if (!link.studentEmail) throw new BadRequestException('No student email on this link — cannot resend');

		const frontendBase = (process.env.FRONTEND_URL || 'https://nanaska.com')
			.split(',')[0]
			.trim();
		const paymentUrl = `${frontendBase}/pay/${link.slug}`;

		await this.email.sendPaymentLinkEmail({
			studentName: link.studentName ?? 'Student',
			studentEmail: link.studentEmail,
			amount: link.amount,
			currency: link.currency,
			description: link.description ?? undefined,
			paymentUrl,
			hasPassword: !!link.passwordHash,
			expiresAt: link.expiresAt ?? undefined,
		});

		return { message: 'Email resent' };
	}

	// ── Public: get link info ──────────────────────────────────────────────────

	async getPublicInfo(slug: string) {
		const link = await this.prisma.paymentLink.findUnique({ where: { slug } });
		if (!link) throw new NotFoundException('Payment link not found');

		// Only check if admin manually deactivated the link
		if (!link.isActive) throw new ForbiddenException('This payment link is no longer active');

		return {
			id: link.id,
			studentName: link.studentName,
			amount: link.amount,
			currency: link.currency,
			description: link.description,
			hasPassword: !!link.passwordHash,
			expiresAt: link.expiresAt,
			isPaid: link.isPaid,
		};
	}

	// ── Public: verify password ────────────────────────────────────────────────

	async verifyPassword(slug: string, password: string) {
		const link = await this.prisma.paymentLink.findUnique({ where: { slug } });
		if (!link) throw new NotFoundException('Payment link not found');
		if (!link.passwordHash)
			return { valid: true }; // no password required

		const valid = await bcrypt.compare(password, link.passwordHash);
		if (!valid) throw new ForbiddenException('Incorrect password');
		return { valid: true };
	}

	// ── Public: initiate payment ───────────────────────────────────────────────

	async initiatePayment(slug: string, dto: PayPaymentLinkDto, origin?: string) {
		const link = await this.prisma.paymentLink.findUnique({ where: { slug } });
		if (!link) throw new NotFoundException('Payment link not found');

		// Only check if admin manually deactivated the link
		if (!link.isActive) throw new ForbiddenException('This payment link is no longer active');

		// Verify password if protected
		if (link.passwordHash) {
			if (!dto.password) throw new ForbiddenException('Password required');
			const valid = await bcrypt.compare(dto.password, link.passwordHash);
			if (!valid) throw new ForbiddenException('Incorrect password');
		}

		const fullName = [dto.firstName, dto.lastName].filter(Boolean).join(' ');

		// Save enrollment submission for admin visibility
		await this.prisma.enrollmentSubmission.create({
			data: {
				firstName: dto.firstName,
				lastName: dto.lastName,
				email: dto.email,
				phone: dto.phone ?? null,
				whatsapp: dto.whatsapp ?? null,
				cimaId: dto.cimaId ?? null,
				cimaStage: dto.cimaStage ?? null,
				dob: dto.dob ?? null,
				gender: dto.gender ?? null,
				country: dto.country ?? null,
				city: dto.city ?? null,
				postcode: dto.postcode ?? null,
				notes: dto.notes ?? null,
				cartJson: [{ id: 'custom-link', name: link.label }] as any,
				currency: link.currency,
				amount: link.amount,
			},
		});

		// Create a PENDING order linked to this payment link (no combinationId)
		const merchantRef = this.payments.generateMerchantRef();
		const frontendOrigin = this.payments.resolveOrigin(origin);

		const order = await this.prisma.order.create({
			data: {
				paymentLinkId: link.id,
				amount: link.amount,
				currency: link.currency,
				status: 'PENDING',
				ipgMerchantRef: merchantRef,
				guestName: fullName,
				guestEmail: dto.email,
				guestPhone: dto.phone ?? null,
				frontendOrigin,
			},
		});

		const paymentUrl = await this.payments.initiateCustomPayment({
			orderId: order.id,
			merchantRef,
			amount: link.amount,
			currency: link.currency,
			customer: { name: fullName, email: dto.email, phone: dto.phone ?? '' },
			frontendOrigin,
		});

		return { orderId: order.id, paymentUrl };
	}

	// ── Helpers ────────────────────────────────────────────────────────────────

	/** Strip passwordHash before returning to callers */
	private sanitize(link: any) {
		const { passwordHash, ...rest } = link;
		return { ...rest, hasPassword: !!passwordHash };
	}

	private generateSlug(): string {
		const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
		const bytes = crypto.randomBytes(12);
		return Array.from(bytes as Uint8Array)
			.map((b) => chars[b % chars.length])
			.join('');
	}
}
