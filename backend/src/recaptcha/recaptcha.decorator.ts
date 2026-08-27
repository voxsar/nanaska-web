import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { RECAPTCHA_ACTION } from './recaptcha.constants';
import { RecaptchaGuard } from './recaptcha.guard';

/**
 * Protects a route with Google reCAPTCHA v3.
 *
 * @param action the action name the frontend passes to `grecaptcha.execute` –
 *   the token is rejected if Google reports a different action.
 */
export const Recaptcha = (action?: string) =>
	applyDecorators(SetMetadata(RECAPTCHA_ACTION, action), UseGuards(RecaptchaGuard));
