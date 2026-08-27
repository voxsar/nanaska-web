import { Controller, Get, HttpCode, Post } from '@nestjs/common';
import { Recaptcha } from './recaptcha.decorator';
import { RecaptchaService } from './recaptcha.service';

@Controller('recaptcha')
export class RecaptchaController {
	constructor(private readonly recaptcha: RecaptchaService) { }

	/**
	 * Standalone token check for forms that have no backend endpoint of their own
	 * (alumni registration, the enrol-interest modal). Returns 403 when the
	 * visitor fails the captcha so the form can refuse to show a success state.
	 */
	@Post('verify')
	@HttpCode(200)
	@Recaptcha()
	verify() {
		return { ok: true };
	}

	/** Lets the frontend and ops confirm whether captcha checks are live. */
	@Get('status')
	status() {
		return { enabled: this.recaptcha.configured };
	}
}
