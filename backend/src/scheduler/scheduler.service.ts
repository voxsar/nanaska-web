import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

@Injectable()
export class SchedulerService {
	private readonly logger = new Logger(SchedulerService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly email: EmailService,
	) { }

	// ── Helpers ────────────────────────────────────────────────────────────────

	/**
	 * Read reminder interval days from settings.
	 * Setting key: reminder_intervals  (comma-separated days, e.g. "1,2,4,8,16")
	 * Default: exponential backoff starting at 1 day, doubled each time, up to ~1 month.
	 */
	private async getReminderIntervals(): Promise<number[]> {
		const row = await this.prisma.siteSetting.findUnique({
			where: { key: 'reminder_intervals' },
		});
		const raw = row?.value?.trim();
		if (raw) {
			const parsed = raw
				.split(',')
				.map((s) => parseInt(s.trim(), 10))
				.filter((n) => !isNaN(n) && n > 0);
			if (parsed.length) return parsed;
		}
		// Default: 1, 2, 4, 8, 16, 32 days
		return [1, 2, 4, 8, 16, 32];
	}

	/**
	 * Maximum months to keep sending reminders.
	 * Setting key: reminder_max_months  (integer, default 2)
	 */
	private async getReminderMaxMonths(): Promise<number> {
		const row = await this.prisma.siteSetting.findUnique({
			where: { key: 'reminder_max_months' },
		});
		const val = parseInt(row?.value ?? '', 10);
		return isNaN(val) || val <= 0 ? 2 : val;
	}

	// ── Cron: Send enrollment payment reminders (every hour) ──────────────────

	// @Cron(CronExpression.EVERY_HOUR) // DISABLED
	async sendEnrollmentReminders(): Promise<void> {
		this.logger.log('Running enrollment reminder check...');

		const intervals = await this.getReminderIntervals();
		const maxMonths = await this.getReminderMaxMonths();
		const cutoff = new Date();
		cutoff.setMonth(cutoff.getMonth() - maxMonths);

		// Find enrollments created within the window that are still unpaid
		const enrollments = await this.prisma.enrollmentSubmission.findMany({
			where: {
				createdAt: { gte: cutoff },
				OR: [
					{ orderId: null },
					{
						orderId: { not: null },
					},
				],
			},
			include: {
				reminders: { orderBy: { reminderNumber: 'asc' } },
			},
		});

		let sent = 0;
		const now = Date.now();

		for (const enrollment of enrollments) {
			// Check if there is already a paid order linked to this enrollment
			if (enrollment.orderId) {
				const order = await this.prisma.order.findUnique({
					where: { id: enrollment.orderId },
					select: { status: true },
				});
				if (order?.status === 'PAID') continue; // already paid – skip
			}

			const remindersSent = enrollment.reminders.length;

			// All intervals exhausted – no more reminders
			if (remindersSent >= intervals.length) continue;

			const nextIntervalDays = intervals[remindersSent];
			const sendAfterMs = nextIntervalDays * 24 * 60 * 60 * 1000;
			const sendAt = enrollment.createdAt.getTime() + sendAfterMs;

			if (now < sendAt) continue; // not time yet

			// Send reminder
			const name = [enrollment.firstName, enrollment.lastName].filter(Boolean).join(' ') || 'Student';
			try {
				await this.email.sendEnrollmentReminderEmail({
					name,
					email: enrollment.email,
					enrollmentId: enrollment.id,
					reminderNumber: remindersSent + 1,
					cartItems: Array.isArray(enrollment.cartJson) ? enrollment.cartJson as any[] : [],
					currency: enrollment.currency,
					amount: enrollment.amount,
				});

				// Record that this reminder was sent
				await this.prisma.enrollmentReminder.create({
					data: {
						enrollmentId: enrollment.id,
						reminderNumber: remindersSent + 1,
					},
				});
				sent++;
			} catch (err: any) {
				this.logger.error(
					`Failed to send reminder #${remindersSent + 1} to ${enrollment.email}: ${err.message}`,
				);
			}
		}

		if (sent > 0) {
			this.logger.log(`Enrollment reminders: sent ${sent} reminder(s)`);
		}
	}

	// ── Cron: Auto-archive old PENDING orders (daily at 02:00) ────────────────

	@Cron('0 2 * * *')
	async archiveOldPendingOrders(): Promise<void> {
		this.logger.log('Running pending order archive job...');

		const twoMonthsAgo = new Date();
		twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);

		const result = await this.prisma.order.updateMany({
			where: {
				status: 'PENDING',
				createdAt: { lt: twoMonthsAgo },
			},
			data: {
				status: 'ARCHIVED',
				archivedAt: new Date(),
			},
		});

		if (result.count > 0) {
			this.logger.log(`Archived ${result.count} pending order(s) older than 2 months`);
		}
	}

	// ── Cron: Database backup every 4 hours ────────────────────────────────────

	@Cron('0 */4 * * *')
	async performDatabaseBackup(): Promise<void> {
		this.logger.log('Starting scheduled database backup...');

		// Use process.cwd() to get the backend root directory (works in compiled dist/ folder)
		const backendRoot = process.cwd();
		const scriptPath = path.join(backendRoot, 'scripts', 'backup-db.sh');

		try {
			const { stdout, stderr } = await execAsync(`bash ${scriptPath}`, {
				cwd: backendRoot,
			});

			if (stdout) {
				this.logger.log(`Backup output: ${stdout}`);
			}
			if (stderr) {
				this.logger.warn(`Backup warnings: ${stderr}`);
			}

			this.logger.log('✓ Database backup completed successfully');
		} catch (error: any) {
			this.logger.error(`Database backup failed: ${error.message}`);
			if (error.stdout) {
				this.logger.error(`STDOUT: ${error.stdout}`);
			}
			if (error.stderr) {
				this.logger.error(`STDERR: ${error.stderr}`);
			}
		}
	}
}
