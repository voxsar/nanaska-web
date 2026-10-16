import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { EmailModule } from '../email/email.module';
import { AdminModule } from '../admin/admin.module';
import { EdgeWebhooksModule } from '../edge-webhooks/edge-webhooks.module';

@Module({
	imports: [EmailModule, AdminModule, EdgeWebhooksModule],
	providers: [PaymentsService],
	controllers: [PaymentsController],
	exports: [PaymentsService],
})
export class PaymentsModule { }
