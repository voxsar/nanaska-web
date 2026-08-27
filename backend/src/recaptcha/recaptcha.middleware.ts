import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { RECAPTCHA_TOKEN_FIELD } from './recaptcha.constants';

/**
 * Lifts the reCAPTCHA token off the request body onto the request object and
 * removes it from the body.
 *
 * This runs before validation, so DTOs never need to declare the field and the
 * token can never leak into a Prisma `create` that spreads the DTO. It also
 * means a token sent to a route that is not captcha-guarded is ignored rather
 * than rejected by the global `forbidNonWhitelisted` ValidationPipe.
 */
@Injectable()
export class RecaptchaMiddleware implements NestMiddleware {
	use(req: Request, _res: Response, next: NextFunction) {
		const body = req.body as Record<string, unknown> | undefined;
		if (body && typeof body === 'object' && !Array.isArray(body) && RECAPTCHA_TOKEN_FIELD in body) {
			const token = body[RECAPTCHA_TOKEN_FIELD];
			if (typeof token === 'string') {
				(req as Request & { recaptchaToken?: string }).recaptchaToken = token;
			}
			delete body[RECAPTCHA_TOKEN_FIELD];
		}
		next();
	}
}
