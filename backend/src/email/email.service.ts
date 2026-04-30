import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface WebhookConfig {
	webhookUrl: string;
	authKey: string;
	authValue: string;
	fromName: string;
	cc: string[];
	paymentCc: string[];
}

@Injectable()
export class EmailService {
	private readonly logger = new Logger(EmailService.name);

	constructor(private readonly prisma: PrismaService) { }

	private async getConfig(): Promise<WebhookConfig> {
		const rows = await this.prisma.siteSetting.findMany({
			where: { category: 'email' },
		});
		const get = (key: string, fallback = ''): string =>
			rows.find((r) => r.key === key)?.value ?? fallback;

		const ccRaw = get('email_cc', process.env.EMAIL_CC || 'info@nanaska.com');
		const cc = ccRaw.split(',').map((e) => e.trim()).filter(Boolean);

		// Separate CC list for payment/enrollment emails; falls back to general CC
		const paymentCcRaw = get('email_payment_cc', ccRaw);
		const paymentCc = paymentCcRaw.split(',').map((e) => e.trim()).filter(Boolean);

		return {
			webhookUrl: get(
				'email_webhook_url',
				process.env.EMAIL_WEBHOOK_URL || 'https://automation.nanaska.com/webhook/send-email',
			),
			authKey: get('email_webhook_auth_key', process.env.EMAIL_WEBHOOK_AUTH_KEY || 'monthra'),
			authValue: get('email_webhook_auth_value', process.env.EMAIL_WEBHOOK_AUTH_VALUE || ''),
			fromName: get('email_from_name', 'Nanaska'),
			cc,
			paymentCc,
		};
	}

	/** Send to webhook. ccList overrides the config-level CC list to allow per-type routing. */
	private async postToWebhook(
		to: string,
		subject: string,
		html: string,
		ccList?: string[],
	): Promise<void> {
		const cfg = await this.getConfig();
		const cc = ccList ?? cfg.cc;

		const res = await fetch(cfg.webhookUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				[cfg.authKey]: cfg.authValue,
			},
			body: JSON.stringify({ to, cc, subject, body: html }),
		});

		if (!res.ok) {
			const text = await res.text().catch(() => '');
			throw new Error(`Email webhook responded with ${res.status}: ${text}`);
		}
	}

	// ── General emails (newsletter / registration / contact → email_cc) ─────────

	async sendRegistrationEmail(opts: { name: string; email: string }): Promise<void> {
		try {
			const cfg = await this.getConfig();
			await this.postToWebhook(
				opts.email,
				'Welcome to Nanaska \u2013 Registration Confirmed',
				this.registrationTemplate(opts),
				cfg.cc,
			);
			this.logger.log(`Registration email sent to ${opts.email}`);
		} catch (err: any) {
			this.logger.error(`Failed to send registration email to ${opts.email}: ${err.message}`);
		}
	}

	async sendNewsletterWelcomeEmail(opts: { name?: string; email: string }): Promise<void> {
		try {
			const cfg = await this.getConfig();
			await this.postToWebhook(
				opts.email,
				'Thank you for subscribing to Nanaska updates!',
				this.newsletterWelcomeTemplate(opts),
				cfg.cc,
			);
			this.logger.log(`Newsletter welcome email sent to ${opts.email}`);
		} catch (err: any) {
			this.logger.error(`Failed to send newsletter welcome email to ${opts.email}: ${err.message}`);
		}
	}

	async sendContactNotificationEmail(opts: {
		name: string;
		email: string;
		phone?: string;
		subject?: string;
		message: string;
	}): Promise<void> {
		try {
			const cfg = await this.getConfig();
			// Notify the admin CC addresses about the new contact submission
			for (const adminEmail of cfg.cc) {
				await this.postToWebhook(
					adminEmail,
					`New Contact Form Submission – ${opts.subject || 'General Enquiry'}`,
					this.contactNotificationTemplate(opts),
					[],
				);
			}
			this.logger.log(`Contact notification sent for ${opts.email}`);
		} catch (err: any) {
			this.logger.error(`Failed to send contact notification for ${opts.email}: ${err.message}`);
		}
	}

	// ── Payment / enrollment emails (→ email_payment_cc) ────────────────────────

	async sendPaymentReceiptEmail(opts: {
		name: string;
		email: string;
		orderId: string;
		courseName: string;
		amount: number;
		currency: string;
		ipgRef?: string;
		paidAt: Date;
	}): Promise<void> {
		try {
			const cfg = await this.getConfig();
			const shortRef = opts.ipgRef || opts.orderId.slice(-8).toUpperCase();
			await this.postToWebhook(
				opts.email,
				`Payment Receipt \u2013 Nanaska CIMA (Ref: ${shortRef})`,
				this.paymentReceiptTemplate(opts),
				cfg.paymentCc,
			);
			this.logger.log(`Payment receipt email sent to ${opts.email}`);
		} catch (err: any) {
			this.logger.error(`Failed to send payment receipt email to ${opts.email}: ${err.message}`);
		}
	}

	async sendEdgeRegistrationConfirmationEmail(opts: {
		name: string;
		email: string;
		enrollmentId: string;
		programme: string;
		caseStudy: string;
		registrationType: 'free-mock' | 'revision';
		amount: number;
		currency: string;
		paidAt?: Date;
	}): Promise<void> {
		try {
			const cfg = await this.getConfig();
			const subject = opts.registrationType === 'free-mock'
				? `Nanaska Edge – Free Mock Registration Confirmed (${opts.caseStudy})`
				: `Nanaska Edge – Revision Session Receipt (${opts.caseStudy})`;
			await this.postToWebhook(
				opts.email,
				subject,
				this.edgeRegistrationConfirmationTemplate(opts),
				cfg.paymentCc,
			);
			this.logger.log(`Edge registration confirmation sent to ${opts.email}`);
		} catch (err: any) {
			this.logger.error(`Failed to send Edge registration confirmation to ${opts.email}: ${err.message}`);
		}
	}

	async sendEnrollmentReminderEmail(opts: {
		name: string;
		email: string;
		enrollmentId: string;
		reminderNumber: number;
		cartItems: any[];
		currency: string;
		amount: number;
	}): Promise<void> {
		try {
			const cfg = await this.getConfig();
			await this.postToWebhook(
				opts.email,
				`Complete your Nanaska enrollment – Reminder #${opts.reminderNumber}`,
				this.enrollmentReminderTemplate(opts),
				cfg.paymentCc,
			);
			this.logger.log(`Enrollment reminder #${opts.reminderNumber} sent to ${opts.email}`);
		} catch (err: any) {
			this.logger.error(`Failed to send enrollment reminder to ${opts.email}: ${err.message}`);
		}
	}

	// ── Test emails ──────────────────────────────────────────────────────────────

	// ── Payment link email ────────────────────────────────────────────────────

	async sendPaymentLinkEmail(opts: {
		studentName: string;
		studentEmail: string;
		amount: number;
		currency: string;
		description?: string;
		paymentUrl: string;
		hasPassword: boolean;
		expiresAt?: Date;
	}): Promise<void> {
		try {
			const cfg = await this.getConfig();
			await this.postToWebhook(
				opts.studentEmail,
				`Your Nanaska Payment Link – ${opts.currency} ${opts.amount.toLocaleString()}`,
				this.paymentLinkTemplate(opts),
				cfg.paymentCc,
			);
			this.logger.log(`Payment link email sent to ${opts.studentEmail}`);
		} catch (err: any) {
			this.logger.error(`Failed to send payment link email to ${opts.studentEmail}: ${err.message}`);
		}
	}

	/**
	 * Send a typed test email. Type determines which template and CC list is used.
	 * Valid types: registration | payment-receipt | enrollment-reminder | contact | newsletter
	 * Falls back to a generic test email if no type or unknown type is given.
	 */
	async sendTestEmail(to: string, type = 'generic'): Promise<void> {
		const cfg = await this.getConfig();

		switch (type) {
			case 'registration':
				await this.postToWebhook(
					to,
					'[TEST] Welcome to Nanaska \u2013 Registration Confirmed',
					this.registrationTemplate({ name: 'Test Student', email: to }),
					cfg.cc,
				);
				break;

			case 'payment-receipt':
				await this.postToWebhook(
					to,
					'[TEST] Payment Receipt \u2013 Nanaska CIMA (Ref: TEST1234)',
					this.paymentReceiptTemplate({
						name: 'Test Student',
						email: to,
						orderId: 'test-order-00001234',
						courseName: 'CIMA Certificate Level (BA1, BA2, BA3, BA4)',
						amount: 25000,
						currency: 'LKR',
						ipgRef: 'TEST1234',
						paidAt: new Date(),
					}),
					cfg.paymentCc,
				);
				break;

			case 'enrollment-reminder':
				await this.postToWebhook(
					to,
					'[TEST] Complete your Nanaska enrollment – Reminder #1',
					this.enrollmentReminderTemplate({
						name: 'Test Student',
						email: to,
						enrollmentId: 'test-enrollment-id',
						reminderNumber: 1,
						cartItems: [
							{ type: 'level', levelTitle: 'CIMA Certificate Level', courseCount: 4 },
							{ type: 'course', courseCode: 'P1', courseName: 'Management Accounting' }
						],
						currency: 'LKR',
						amount: 25000,
					}),
					cfg.paymentCc,
				);
				break;

			case 'contact':
				await this.postToWebhook(
					to,
					'[TEST] New Contact Form Submission – General Enquiry',
					this.contactNotificationTemplate({
						name: 'Test Visitor',
						email: 'visitor@example.com',
						phone: '+94 71 234 5678',
						subject: 'General Enquiry',
						message: 'This is a test contact form submission to verify email delivery.',
					}),
					[],
				);
				break;

			case 'newsletter':
				await this.postToWebhook(
					to,
					'[TEST] Thank you for subscribing to Nanaska updates!',
					this.newsletterWelcomeTemplate({ name: 'Test Subscriber', email: to }),
					cfg.cc,
				);
				break;

			default:
				await this.postToWebhook(
					to,
					'[TEST] Nanaska \u2013 Email System Test',
					`<div style="font-family:Arial,sans-serif;max-width:600px;margin:40px auto;padding:32px;background:#fff;border-radius:8px;border:1px solid #e0e0e0;">
  <h2 style="color:#1B365D;">Test Email</h2>
  <p>This is a test email from the <strong>Nanaska</strong> email system.</p>
  <p>If you received this, your email webhook is configured correctly.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
  <p style="color:#999;font-size:12px;">Sent at: ${new Date().toISOString()}</p>
</div>`,
					cfg.cc,
				);
		}
	}

	// ── Email templates ──────────────────────────────────────────────────────

	private registrationTemplate(opts: { name: string; email: string }): string {
		return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}
  .wrap{max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}
  .hdr{background:#1B365D;padding:32px;text-align:center}
  .hdr h1{color:#fff;margin:0;font-size:28px}
  .hdr p{color:#24ADE3;margin:8px 0 0;font-size:14px}
  .body{padding:32px;color:#333}
  .body h2{color:#1B365D;margin-top:0}
  .box{background:#f0f8ff;border-left:4px solid #24ADE3;padding:16px;border-radius:4px;margin:24px 0;font-size:15px;line-height:1.6}
  .btn{display:inline-block;background:#24ADE3;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;margin-top:16px}
  .ftr{background:#f9f9f9;padding:24px;text-align:center;color:#999;font-size:12px;border-top:1px solid #eee}
</style>
</head><body>
<div class="wrap">
  <div class="hdr"><h1>Nanaska</h1><p>CIMA Exam Preparation</p></div>
  <div class="body">
    <h2>Welcome, ${opts.name}!</h2>
    <p>Thank you for registering with Nanaska. Your account has been successfully created.</p>
    <div class="box">
      <strong>Your Account Details</strong><br>
      Name: ${opts.name}<br>
      Email: ${opts.email}
    </div>
    <p>You can now log in and start exploring our CIMA preparation courses.</p>
    <a href="https://nanaska.com" class="btn">Visit Nanaska</a>
  </div>
  <div class="ftr">
    <p>&copy; ${new Date().getFullYear()} Nanaska. All rights reserved.</p>
    <p>If you did not create this account, contact us at <a href="mailto:info@nanaska.com">info@nanaska.com</a>.</p>
  </div>
</div>
</body></html>`;
	}

	private paymentReceiptTemplate(opts: {
		name: string;
		email: string;
		orderId: string;
		courseName: string;
		amount: number;
		currency: string;
		ipgRef?: string;
		paidAt: Date;
	}): string {
		const formattedAmount =
			opts.currency === 'GBP'
				? `&pound;${opts.amount.toLocaleString()}`
				: `LKR ${opts.amount.toLocaleString()}`;
		const formattedDate = opts.paidAt.toLocaleDateString('en-GB', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
		const ref = opts.ipgRef || opts.orderId.slice(-8).toUpperCase();

		return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}
  .wrap{max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}
  .hdr{background:#1B365D;padding:32px;text-align:center}
  .hdr h1{color:#fff;margin:0;font-size:28px}
  .hdr p{color:#24ADE3;margin:8px 0 0;font-size:14px}
  .body{padding:32px;color:#333}
  .body h2{color:#1B365D;margin-top:0}
  .badge{display:inline-block;background:#e8f8e8;color:#2a7a2a;border:1px solid #b8e8b8;padding:4px 14px;border-radius:20px;font-size:13px;margin-bottom:16px}
  .receipt{border:1px solid #e0e0e0;border-radius:6px;overflow:hidden;margin:24px 0}
  .receipt-hdr{background:#1B365D;color:#fff;padding:12px 16px;font-weight:bold;font-size:14px}
  .row{display:flex;justify-content:space-between;padding:11px 16px;border-bottom:1px solid #f0f0f0;font-size:14px}
  .row:last-child{border-bottom:none}
  .row.total{background:#f0f8ff;font-weight:bold;color:#1B365D;font-size:15px}
  .lbl{color:#888}
  .ftr{background:#f9f9f9;padding:24px;text-align:center;color:#999;font-size:12px;border-top:1px solid #eee}
</style>
</head><body>
<div class="wrap">
  <div class="hdr"><h1>Nanaska</h1><p>CIMA Exam Preparation</p></div>
  <div class="body">
    <h2>Payment Receipt</h2>
    <span class="badge">&#10003; Payment Confirmed</span>
    <p>Dear ${opts.name}, your payment has been received and your enrollment is confirmed.</p>
    <div class="receipt">
      <div class="receipt-hdr">Receipt Details</div>
      <div class="row"><span class="lbl">Reference</span><span>${ref}</span></div>
      <div class="row"><span class="lbl">Date</span><span>${formattedDate}</span></div>
      <div class="row"><span class="lbl">Student Name</span><span>${opts.name}</span></div>
      <div class="row"><span class="lbl">Email</span><span>${opts.email}</span></div>
      <div class="row"><span class="lbl">Course / Program</span><span>${opts.courseName}</span></div>
      <div class="row total"><span>Total Paid</span><span>${formattedAmount}</span></div>
    </div>
    <p>Please retain this receipt for your records. For any queries, contact us at <a href="mailto:info@nanaska.com">info@nanaska.com</a>.</p>
  </div>
  <div class="ftr">
    <p>&copy; ${new Date().getFullYear()} Nanaska. All rights reserved.</p>
    <p>This is an automated receipt. Please do not reply directly to this email.</p>
  </div>
</div>
</body></html>`;
	}

	private newsletterWelcomeTemplate(opts: { name?: string; email: string }): string {
		const greeting = opts.name ? `Hi ${opts.name},` : 'Hi there,';
		return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}
  .wrap{max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}
  .hdr{background:#1B365D;padding:32px;text-align:center}
  .hdr h1{color:#fff;margin:0;font-size:28px}
  .hdr p{color:#24ADE3;margin:8px 0 0;font-size:14px}
  .body{padding:32px;color:#333}
  .body h2{color:#1B365D;margin-top:0}
  .btn{display:inline-block;background:#24ADE3;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;margin-top:16px}
  .ftr{background:#f9f9f9;padding:24px;text-align:center;color:#999;font-size:12px;border-top:1px solid #eee}
</style>
</head><body>
<div class="wrap">
  <div class="hdr"><h1>Nanaska</h1><p>CIMA Exam Preparation</p></div>
  <div class="body">
    <h2>${greeting}</h2>
    <p>Thank you for subscribing to the <strong>Nanaska</strong> newsletter.</p>
    <p>You'll receive the latest updates on CIMA courses, exam tips, student success stories, and exclusive offers.</p>
    <a href="https://nanaska.com" class="btn">Explore Our Courses</a>
  </div>
  <div class="ftr">
    <p>&copy; ${new Date().getFullYear()} Nanaska. All rights reserved.</p>
    <p>If you did not subscribe, please ignore this email or contact <a href="mailto:info@nanaska.com">info@nanaska.com</a>.</p>
  </div>
</div>
</body></html>`;
	}

	private contactNotificationTemplate(opts: {
		name: string;
		email: string;
		phone?: string;
		subject?: string;
		message: string;
	}): string {
		return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}
  .wrap{max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}
  .hdr{background:#1B365D;padding:24px 32px;display:flex;align-items:center;gap:12px}
  .hdr h1{color:#fff;margin:0;font-size:22px}
  .body{padding:32px;color:#333}
  .field{margin-bottom:14px}
  .lbl{font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
  .val{font-size:15px;color:#222;word-break:break-word}
  .msg-box{background:#f8f8f8;border-left:4px solid #24ADE3;padding:16px;border-radius:4px;font-size:15px;line-height:1.6;white-space:pre-wrap}
  .ftr{background:#f9f9f9;padding:20px 32px;text-align:center;color:#999;font-size:12px;border-top:1px solid #eee}
</style>
</head><body>
<div class="wrap">
  <div class="hdr"><h1>New Contact Form Submission</h1></div>
  <div class="body">
    <div class="field"><div class="lbl">Name</div><div class="val">${opts.name}</div></div>
    <div class="field"><div class="lbl">Email</div><div class="val"><a href="mailto:${opts.email}">${opts.email}</a></div></div>
    ${opts.phone ? `<div class="field"><div class="lbl">Phone</div><div class="val">${opts.phone}</div></div>` : ''}
    ${opts.subject ? `<div class="field"><div class="lbl">Subject</div><div class="val">${opts.subject}</div></div>` : ''}
    <div class="field">
      <div class="lbl">Message</div>
      <div class="msg-box">${opts.message}</div>
    </div>
  </div>
  <div class="ftr"><p>Received at ${new Date().toUTCString()} &mdash; Nanaska Contact System</p></div>
</div>
</body></html>`;
	}

	private edgeRegistrationConfirmationTemplate(opts: {
		name: string;
		email: string;
		enrollmentId: string;
		programme: string;
		caseStudy: string;
		registrationType: 'free-mock' | 'revision';
		amount: number;
		currency: string;
		paidAt?: Date;
	}): string {
		const isFree = opts.registrationType === 'free-mock';
		const formattedAmount = isFree
			? 'Complimentary'
			: opts.currency === 'GBP'
				? `&pound;${opts.amount.toLocaleString()}`
				: `LKR ${opts.amount.toLocaleString()}`;
		const formattedDate = (opts.paidAt || new Date()).toLocaleDateString('en-GB', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
		const ref = opts.enrollmentId.slice(-8).toUpperCase();

		return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}
  .wrap{max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}
  .hdr{background:#1B365D;padding:32px;text-align:center}
  .hdr h1{color:#fff;margin:0;font-size:28px}
  .hdr p{color:#24ADE3;margin:8px 0 0;font-size:14px}
  .body{padding:32px;color:#333}
  .body h2{color:#1B365D;margin-top:0}
  .badge{display:inline-block;background:#e8f8e8;color:#2a7a2a;border:1px solid #b8e8b8;padding:4px 14px;border-radius:20px;font-size:13px;margin-bottom:16px}
  .receipt{border:1px solid #e0e0e0;border-radius:6px;overflow:hidden;margin:24px 0}
  .receipt-hdr{background:#1B365D;color:#fff;padding:12px 16px;font-weight:bold;font-size:14px}
  .row{display:flex;justify-content:space-between;padding:11px 16px;border-bottom:1px solid #f0f0f0;font-size:14px}
  .row:last-child{border-bottom:none}
  .row.total{background:#f0f8ff;font-weight:bold;color:#1B365D;font-size:15px}
  .lbl{color:#888}
  .ftr{background:#f9f9f9;padding:24px;text-align:center;color:#999;font-size:12px;border-top:1px solid #eee}
</style>
</head><body>
<div class="wrap">
  <div class="hdr"><h1>Nanaska Edge</h1><p>CIMA Case Study Platform</p></div>
  <div class="body">
    <h2>${isFree ? 'Free Mock Registration Confirmed' : 'Revision Session Receipt'}</h2>
    <span class="badge">&#10003; ${isFree ? 'Registration Confirmed' : 'Payment Confirmed'}</span>
    <p>Dear ${opts.name}, your ${isFree ? 'free mock registration' : 'revision session enrollment'} has been confirmed. Our team will be in touch with your platform access details shortly.</p>
    <div class="receipt">
      <div class="receipt-hdr">Registration Details</div>
      <div class="row"><span class="lbl">Reference</span><span>${ref}</span></div>
      <div class="row"><span class="lbl">Date</span><span>${formattedDate}</span></div>
      <div class="row"><span class="lbl">Student Name</span><span>${opts.name}</span></div>
      <div class="row"><span class="lbl">Email</span><span>${opts.email}</span></div>
      <div class="row"><span class="lbl">Programme</span><span>${opts.programme}</span></div>
      <div class="row"><span class="lbl">Case Study</span><span>${opts.caseStudy}</span></div>
      <div class="row total"><span>${isFree ? 'Price' : 'Total Paid'}</span><span>${formattedAmount}</span></div>
    </div>
    <p>Please retain this confirmation for your records. For any queries, contact us at <a href="mailto:info@nanaska.com">info@nanaska.com</a>.</p>
  </div>
  <div class="ftr">
    <p>&copy; ${new Date().getFullYear()} Nanaska. All rights reserved.</p>
    <p>This is an automated confirmation. Please do not reply directly to this email.</p>
  </div>
</div>
</body></html>`;
	}

	private enrollmentReminderTemplate(opts: {
		name: string;
		email: string;
		enrollmentId: string;
		reminderNumber: number;
		cartItems: any[];
		currency: string;
		amount: number;
	}): string {
		const formattedAmount =
			opts.currency === 'GBP'
				? `&pound;${opts.amount.toLocaleString()}`
				: `LKR ${opts.amount.toLocaleString()}`;

		// Format cart items as a visually appealing list based on item type
		const cartList = Array.isArray(opts.cartItems) && opts.cartItems.length
			? opts.cartItems.map((i: any) => {
				if (i.type === 'level') {
					return `<li style="margin-bottom:12px;padding:10px;background:#f0f8ff;border-left:3px solid #24ADE3;border-radius:4px;">
								<div style="color:#1B365D;font-weight:bold;font-size:15px;margin-bottom:4px;">${i.levelTitle || 'CIMA Level Package'}</div>
								<div style="color:#666;font-size:13px;">📚 Full Level Programme · ${i.courseCount || 'Multiple'} courses</div>
							</li>`;
				} else if (i.type === 'course') {
					return `<li style="margin-bottom:12px;padding:10px;background:#f9f9f9;border-left:3px solid #1B365D;border-radius:4px;">
								<div style="color:#1B365D;font-weight:bold;font-size:15px;">${i.courseCode ? `${i.courseCode} — ` : ''}${i.courseName || 'CIMA Course'}</div>
							</li>`;
				}
				// Fallback for legacy or unexpected formats
				return `<li style="margin-bottom:12px;padding:10px;background:#f9f9f9;border-left:3px solid #24ADE3;border-radius:4px;">
							<div style="color:#1B365D;font-weight:bold;font-size:15px;">${i.name || i.title || i.courseName || i.levelTitle || 'Selected programme'}</div>
						</li>`;
			}).join('')
			: '<li style="padding:10px;">Your selected programme</li>';
		return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}
  .wrap{max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}
  .hdr{background:#1B365D;padding:32px;text-align:center}
  .hdr h1{color:#fff;margin:0;font-size:28px}
  .hdr p{color:#24ADE3;margin:8px 0 0;font-size:14px}
  .body{padding:32px;color:#333}
  .body h2{color:#1B365D;margin-top:0}
  .box{background:#fff8e6;border-left:4px solid #F5A623;padding:16px;border-radius:4px;margin:20px 0;font-size:15px}
  .btn{display:inline-block;background:#F5A623;color:#fff;padding:14px 32px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:16px;margin-top:8px}
  ul{list-style:none;padding:0;margin:12px 0}
  li{margin-bottom:4px}
  .ftr{background:#f9f9f9;padding:24px;text-align:center;color:#999;font-size:12px;border-top:1px solid #eee}
</style>
</head><body>
<div class="wrap">
  <div class="hdr"><h1>Nanaska</h1><p>CIMA Exam Preparation</p></div>
  <div class="body">
    <h2>Hi ${opts.name}, don't miss your spot!</h2>
    <p>You recently submitted an enrollment application with us but haven't yet completed your payment.</p>
    <div class="box">
      <strong>Your selected programme${Array.isArray(opts.cartItems) && opts.cartItems.length > 1 ? 's' : ''}:</strong>
      <ul>${cartList}</ul>
      <strong>Total: ${formattedAmount}</strong>
    </div>
    <p>Secure your place today before spaces fill up. Click below to complete your payment.</p>
    <a href="https://nanaska.com/enroll" class="btn">Complete Enrollment &amp; Pay Now</a>
    <p style="margin-top:24px;color:#666;font-size:13px;">
      If you've already paid or no longer wish to enroll, you can ignore this email.
      For any queries, contact us at <a href="mailto:info@nanaska.com">info@nanaska.com</a>.
    </p>
  </div>
  <div class="ftr">
    <p>&copy; ${new Date().getFullYear()} Nanaska. All rights reserved.</p>
    <p>This is reminder #${opts.reminderNumber} for enrollment ref: ${opts.enrollmentId.slice(-8).toUpperCase()}.</p>
  </div>
</div>
</body></html>`;
	}

	private paymentLinkTemplate(opts: {
		studentName: string;
		amount: number;
		currency: string;
		description?: string;
		paymentUrl: string;
		hasPassword: boolean;
		expiresAt?: Date;
	}): string {
		const symbol = opts.currency === 'GBP' ? '£' : 'LKR ';
		const formattedAmount = `${symbol}${opts.amount.toLocaleString()}`;
		const expiryLine = opts.expiresAt
			? `<p style="color:#e67e22;font-size:14px;"><strong>⏰ This link expires on ${opts.expiresAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.</strong></p>`
			: '';
		const passwordNote = opts.hasPassword
			? `<p style="color:#555;font-size:14px;">🔒 This link is password protected. Please use the password provided by your advisor to proceed.</p>`
			: '';
		return `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body{font-family:Arial,sans-serif;background:#f4f4f4;margin:0;padding:0}
  .wrap{max-width:600px;margin:40px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.1)}
  .hdr{background:#1B365D;padding:32px;text-align:center}
  .hdr h1{color:#24ADE3;margin:0;font-size:26px}
  .hdr p{color:#fff;margin:8px 0 0;font-size:14px}
  .body{padding:32px}
  .amount-box{background:#f0f8ff;border:2px solid #24ADE3;border-radius:8px;padding:20px;text-align:center;margin:24px 0}
  .amount-box .amount{font-size:36px;font-weight:bold;color:#1B365D}
  .amount-box .currency{font-size:16px;color:#666}
  .btn{display:inline-block;background:#F5A623;color:#fff!important;text-decoration:none;padding:16px 40px;border-radius:6px;font-size:18px;font-weight:bold;margin:24px 0}
  .desc{background:#f9f9f9;border-left:4px solid #24ADE3;padding:16px;margin:16px 0;font-size:14px;color:#444}
  .ftr{background:#f4f4f4;padding:16px 32px;text-align:center;font-size:12px;color:#999}
  .url-box{word-break:break-all;font-size:13px;color:#666;border:1px solid #ddd;padding:10px;border-radius:4px;margin-top:16px}
</style>
</head>
<body>
<div class="wrap">
  <div class="hdr">
    <h1>Nanaska CIMA</h1>
    <p>Your personalised payment link is ready</p>
  </div>
  <div class="body">
    <p style="font-size:16px;">Dear <strong>${opts.studentName}</strong>,</p>
    <p style="color:#555;">Your Nanaska advisor has created a secure payment link for you. Please use the button below to complete your payment.</p>
    <div class="amount-box">
      <div class="amount">${formattedAmount}</div>
      <div class="currency">${opts.currency}</div>
    </div>
    ${opts.description ? `<div class="desc"><strong>Details:</strong> ${opts.description}</div>` : ''}
    ${expiryLine}
    ${passwordNote}
    <div style="text-align:center">
      <a href="${opts.paymentUrl}" class="btn">Complete Payment →</a>
    </div>
    <p style="color:#888;font-size:13px;">If the button doesn't work, copy and paste this link into your browser:</p>
    <div class="url-box">${opts.paymentUrl}</div>
    <p style="color:#888;font-size:13px;margin-top:24px;">For any questions, please contact us at <a href="mailto:info@nanaska.com">info@nanaska.com</a>.</p>
  </div>
  <div class="ftr">
    <p>&copy; ${new Date().getFullYear()} Nanaska. All rights reserved.</p>
  </div>
</div>
</body></html>`;
	}
}

