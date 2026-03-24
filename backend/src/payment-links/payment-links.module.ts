import { Module } from '@nestjs/common';
import { PaymentLinksService } from './payment-links.service';
import { PaymentLinksController } from './payment-links.controller';
import { PaymentsModule } from '../payments/payments.module';
import { EmailModule } from '../email/email.module';

@Module({
	imports: [PaymentsModule, EmailModule],
	providers: [PaymentLinksService],
	controllers: [PaymentLinksController],
})
export class PaymentLinksModule { }
