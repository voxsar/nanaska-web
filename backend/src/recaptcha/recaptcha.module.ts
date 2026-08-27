import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { RecaptchaController } from './recaptcha.controller';
import { RecaptchaGuard } from './recaptcha.guard';
import { RecaptchaMiddleware } from './recaptcha.middleware';
import { RecaptchaService } from './recaptcha.service';

@Global()
@Module({
	controllers: [RecaptchaController],
	providers: [RecaptchaService, RecaptchaGuard],
	exports: [RecaptchaService, RecaptchaGuard],
})
export class RecaptchaModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		// Strip the token from every request body before validation runs.
		consumer.apply(RecaptchaMiddleware).forRoutes('*');
	}
}
