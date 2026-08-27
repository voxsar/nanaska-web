import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { RECAPTCHA_ACTION, RECAPTCHA_TOKEN_FIELD } from './recaptcha.constants';
import { RecaptchaService } from './recaptcha.service';

type RecaptchaRequest = Request & { recaptchaToken?: string };

/** Rejects a request whose reCAPTCHA v3 token is missing, invalid or low-scoring. */
@Injectable()
export class RecaptchaGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly recaptcha: RecaptchaService,
	) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const req = context.switchToHttp().getRequest<RecaptchaRequest>();

		// RecaptchaMiddleware normally moves the token here; fall back to the raw
		// body so the guard still works if middleware ordering ever changes.
		let token = req.recaptchaToken;
		const body = req.body as Record<string, unknown> | undefined;
		if (!token && body && typeof body === 'object' && typeof body[RECAPTCHA_TOKEN_FIELD] === 'string') {
			token = body[RECAPTCHA_TOKEN_FIELD] as string;
			delete body[RECAPTCHA_TOKEN_FIELD];
		}

		const action = this.reflector.getAllAndOverride<string | undefined>(RECAPTCHA_ACTION, [
			context.getHandler(),
			context.getClass(),
		]);

		const result = await this.recaptcha.verify(token, { action, remoteIp: this.resolveIp(req) });
		if (!result.ok) {
			throw new ForbiddenException(
				'We could not verify that you are human. Please reload the page and try again.',
			);
		}
		return true;
	}

	private resolveIp(req: RecaptchaRequest): string | undefined {
		const forwarded = req.headers['x-forwarded-for'];
		const first = Array.isArray(forwarded) ? forwarded[0] : forwarded;
		const candidate = first?.split(',')[0]?.trim() || req.ip;
		return candidate || undefined;
	}
}
