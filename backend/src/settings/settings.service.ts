import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertSettingDto } from './dto/upsert-setting.dto';
import { UpsertPageMetaDto } from './dto/upsert-page-meta.dto';
import { NewsletterSignupDto } from './dto/newsletter-signup.dto';
import { ContactSubmissionDto } from './dto/contact-submission.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class SettingsService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly email: EmailService,
	) { }

	async findAll() {
		return this.prisma.siteSetting.findMany({ orderBy: [{ category: 'asc' }, { key: 'asc' }] });
	}

	async findByCategory(category: string) {
		return this.prisma.siteSetting.findMany({
			where: { category },
			orderBy: { key: 'asc' },
		});
	}

	async upsert(dto: UpsertSettingDto) {
		return this.prisma.siteSetting.upsert({
			where: { key: dto.key },
			update: { value: dto.value, category: dto.category, label: dto.label },
			create: { key: dto.key, value: dto.value, category: dto.category ?? 'general', label: dto.label },
		});
	}

	async upsertMany(settings: UpsertSettingDto[]) {
		const results = await Promise.all(settings.map((s) => this.upsert(s)));
		return results;
	}

	// ── Page Meta ──────────────────────────────────────────────────────────────

	async findAllPageMeta() {
		return this.prisma.pageMeta.findMany({ orderBy: { pagePath: 'asc' } });
	}

	async findPageMeta(pagePath: string) {
		return this.prisma.pageMeta.findUnique({ where: { pagePath } });
	}

	async upsertPageMeta(dto: UpsertPageMetaDto) {
		return this.prisma.pageMeta.upsert({
			where: { pagePath: dto.pagePath },
			update: dto,
			create: dto,
		});
	}

	// ── Newsletter ─────────────────────────────────────────────────────────────

	async newsletterSignup(dto: NewsletterSignupDto) {
		const record = await this.prisma.newsletterSignup.upsert({
			where: { email: dto.email },
			update: { name: dto.name },
			create: { email: dto.email, name: dto.name },
		});
		// Send welcome email (fire-and-forget)
		this.email.sendNewsletterWelcomeEmail({ name: dto.name, email: dto.email });
		return record;
	}

	// ── Contact form ─────────────────────────────────────────────

	async submitContact(dto: ContactSubmissionDto) {
		const record = await this.prisma.contactSubmission.create({ data: dto });
		// Notify admin (fire-and-forget)
		this.email.sendContactNotificationEmail(dto);
		return record;
	}
}
