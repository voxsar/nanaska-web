import {
	Controller,
	Post,
	Get,
	Body,
	Query,
	Request,
	Res,
	UseGuards,
	HttpCode,
	HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { GuestPaymentDto } from './dto/guest-payment.dto';
import { WebhookDto } from './dto/webhook.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
	constructor(private readonly paymentsService: PaymentsService) { }

	/**
	 * POST /payments/create
	 * Authenticated – creates a PENDING order and returns the signed IPG payload.
	 */
	@UseGuards(JwtAuthGuard)
	@Post('create')
	createPayment(@Body() dto: CreatePaymentDto, @Request() req) {
		return this.paymentsService.createPayment(req.user.userId, dto);
	}

	/**
	 * POST /payments/guest-create
	 * Unauthenticated – allows guest users to pay without an account.
	 * Guest details (name, email, phone) are stored on the order record.
	 */
	@Post('guest-create')
	createGuestPayment(@Body() dto: GuestPaymentDto) {
		return this.paymentsService.createGuestPayment(dto);
	}

	/**
	 * POST /payments/webhook
	 * Called by the IPG (no JWT) – validates signature before processing.
	 * Returns 200 even on business errors so the IPG doesn't retry endlessly.
	 */
	@Post('webhook')
	@HttpCode(HttpStatus.OK)
	webhook(@Body() body: WebhookDto) {
		return this.paymentsService.handleWebhook(body);
	}

	/**
	 * GET /payments/complete?reqid=xxx
	 * PayCorp redirects the browser here after the card page is submitted.
	 * We call PAYMENT_COMPLETE, then redirect the browser to the frontend.
	 */
	@Get('complete')
	async complete(@Query('reqid') reqid: string, @Res() res: Response) {
		const frontendBase = (process.env.FRONTEND_URL || 'https://nanaska.com').split(',')[0].trim();
		if (!reqid) {
			return res.redirect(`${frontendBase}/payment-cancel?reason=missing_reqid`);
		}
		try {
			const { redirectTo } = await this.paymentsService.completePayment(reqid);
			return res.redirect(redirectTo);
		} catch (err) {
			return res.redirect(`${frontendBase}/payment-cancel?reason=error`);
		}
	}
}
