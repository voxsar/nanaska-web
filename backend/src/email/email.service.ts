import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface WebhookConfig {
  webhookUrl: string;
  authKey: string;
  authValue: string;
  fromName: string;
  cc: string[];
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly prisma: PrismaService) {}

  private async getConfig(): Promise<WebhookConfig> {
    const rows = await this.prisma.siteSetting.findMany({
      where: { category: 'email' },
    });
    const get = (key: string, fallback = ''): string =>
      rows.find((r) => r.key === key)?.value ?? fallback;

    const ccRaw = get('email_cc', process.env.EMAIL_CC || 'info@nanaska.com');
    const cc = ccRaw
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);

    return {
      webhookUrl: get(
        'email_webhook_url',
        process.env.EMAIL_WEBHOOK_URL || 'https://automation.nanaska.com/webhook/send-email',
      ),
      authKey: get('email_webhook_auth_key', process.env.EMAIL_WEBHOOK_AUTH_KEY || 'monthra'),
      authValue: get('email_webhook_auth_value', process.env.EMAIL_WEBHOOK_AUTH_VALUE || ''),
      fromName: get('email_from_name', 'Nanaska'),
      cc,
    };
  }

  private async postToWebhook(to: string, subject: string, html: string): Promise<void> {
    const cfg = await this.getConfig();

    const res = await fetch(cfg.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [cfg.authKey]: cfg.authValue,
      },
      body: JSON.stringify({ to, cc: cfg.cc, subject, body: html }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Email webhook responded with ${res.status}: ${text}`);
    }
  }

  async sendRegistrationEmail(opts: { name: string; email: string }): Promise<void> {
    try {
      await this.postToWebhook(
        opts.email,
        'Welcome to Nanaska \u2013 Registration Confirmed',
        this.registrationTemplate(opts),
      );
      this.logger.log(`Registration email sent to ${opts.email}`);
    } catch (err: any) {
      this.logger.error(`Failed to send registration email to ${opts.email}: ${err.message}`);
    }
  }

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
      const shortRef = opts.ipgRef || opts.orderId.slice(-8).toUpperCase();
      await this.postToWebhook(
        opts.email,
        `Payment Receipt \u2013 Nanaska CIMA (Ref: ${shortRef})`,
        this.paymentReceiptTemplate(opts),
      );
      this.logger.log(`Payment receipt email sent to ${opts.email}`);
    } catch (err: any) {
      this.logger.error(`Failed to send payment receipt email to ${opts.email}: ${err.message}`);
    }
  }

  /** Called from the test-email endpoint – throws on failure so the caller can report it. */
  async sendTestEmail(to: string): Promise<void> {
    await this.postToWebhook(
      to,
      'Nanaska \u2013 Test Email',
      `<div style="font-family:Arial,sans-serif;max-width:600px;margin:40px auto;padding:32px;background:#fff;border-radius:8px;border:1px solid #e0e0e0;">
  <h2 style="color:#1B365D;">Test Email</h2>
  <p>This is a test email from the <strong>Nanaska</strong> email system.</p>
  <p>If you received this, your email webhook is configured correctly.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">
  <p style="color:#999;font-size:12px;">Sent at: ${new Date().toISOString()}</p>
</div>`,
    );
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
}
