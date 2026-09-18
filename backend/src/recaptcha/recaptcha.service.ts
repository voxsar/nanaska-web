import { Injectable, Logger } from '@nestjs/common';
import { RECAPTCHA_VERIFY_URL } from './recaptcha.constants';

export interface RecaptchaVerifyOptions {
	/** Expected action name set on the route – mismatches are rejected. */
	action?: string;
	/** Caller IP, forwarded to Google to improve scoring. */
	remoteIp?: string;
}

export interface RecaptchaVerifyResult {
	ok: boolean;
	/** True when the check was waived (not configured, or Google was unreachable). */
	skipped: boolean;
	score?: number;
	action?: string;
	reason?: string;
}

/** Shape of Google's siteverify response for reCAPTCHA v3. */
interface SiteVerifyResponse {
	success: boolean;
	score?: number;
	action?: string;
	challenge_ts?: string;
	hostname?: string;
	'error-codes'?: string[];
}

const VERIFY_TIMEOUT_MS = 5000;

@Injectable()
export class RecaptchaService {
	private readonly logger = new Logger(RecaptchaService.name);
	private warnedMissingSecret = false;

	private get secret(): string {
		return (process.env.RECAPTCHA_SECRET_KEY || '').trim();
	}

	/** Minimum v3 score to accept. Google recommends 0.5 as a starting point. */
	private get minScore(): number {
		const raw = Number(process.env.RECAPTCHA_MIN_SCORE);
		return Number.isFinite(raw) && raw >= 0 && raw <= 1 ? raw : 0.5;
	}

	/**
	 * When Google itself cannot be reached we let the request through by default –
	 * a reCAPTCHA outage must not take down enrolment and checkout.
	 * Set RECAPTCHA_FAIL_OPEN=false to reject instead.
	 */
	private get failOpen(): boolean {
		return (process.env.RECAPTCHA_FAIL_OPEN || 'true').trim().toLowerCase() !== 'false';
	}

	get configured(): boolean {
		return this.secret.length > 0;
	}

	async verify(token: unknown, options: RecaptchaVerifyOptions = {}): Promise<RecaptchaVerifyResult> {
		if (!this.configured) {
			if (!this.warnedMissingSecret) {
				this.warnedMissingSecret = true;
				this.logger.warn(
					'RECAPTCHA_SECRET_KEY is not set – captcha checks are disabled. Set it in backend/.env to enable spam protection.',
				);
			}
			return { ok: true, skipped: true, reason: 'not-configured' };
		}

		if (typeof token !== 'string' || token.trim().length === 0) {
			this.logger.warn(
				`reCAPTCHA token missing (action: ${options.action || 'n/a'}, ip: ${options.remoteIp || 'unknown'}) – request blocked`,
			);
			return { ok: false, skipped: false, reason: 'missing-token' };
		}

		let data: SiteVerifyResponse;
		try {
			data = await this.callSiteVerify(token.trim(), options.remoteIp);
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			this.logger.error(`reCAPTCHA verification request failed: ${message}`);
			return this.failOpen
				? { ok: true, skipped: true, reason: 'verify-unavailable' }
				: { ok: false, skipped: false, reason: 'verify-unavailable' };
		}

		if (!data.success) {
			const codes = (data['error-codes'] || []).join(', ') || 'unknown';
			this.logger.warn(`reCAPTCHA token rejected by Google (${codes})`);
			return { ok: false, skipped: false, reason: `invalid-token: ${codes}` };
		}

		if (options.action && data.action && data.action !== options.action) {
			this.logger.warn(`reCAPTCHA action mismatch – expected "${options.action}", got "${data.action}"`);
			return { ok: false, skipped: false, score: data.score, action: data.action, reason: 'action-mismatch' };
		}

		const score = typeof data.score === 'number' ? data.score : 0;
		if (score < this.minScore) {
			this.logger.warn(`reCAPTCHA score ${score} below threshold ${this.minScore} (action: ${data.action || 'n/a'})`);
			return { ok: false, skipped: false, score, action: data.action, reason: 'low-score' };
		}

		// Logged so the score distribution of real traffic is visible: a v3 key with
		// no history scores almost everything highly, which lets scripted browsers
		// through at the default threshold.
		this.logger.log(
			`reCAPTCHA passed – score ${score}, action ${data.action || 'n/a'}, ip ${options.remoteIp || 'unknown'}`,
		);
		return { ok: true, skipped: false, score, action: data.action };
	}

	private async callSiteVerify(token: string, remoteIp?: string): Promise<SiteVerifyResponse> {
		const params = new URLSearchParams({ secret: this.secret, response: token });
		if (remoteIp) params.set('remoteip', remoteIp);

		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), VERIFY_TIMEOUT_MS);
		try {
			const res = await fetch(RECAPTCHA_VERIFY_URL, {
				method: 'POST',
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				body: params.toString(),
				signal: controller.signal,
			});
			if (!res.ok) throw new Error(`siteverify responded with HTTP ${res.status}`);
			return (await res.json()) as SiteVerifyResponse;
		} finally {
			clearTimeout(timer);
		}
	}
}
