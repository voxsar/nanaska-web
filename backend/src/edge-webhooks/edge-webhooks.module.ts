import { Module } from '@nestjs/common';
import { EdgeWebhooksController } from './edge-webhooks.controller';
import { EdgeWebhooksService } from './edge-webhooks.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
	imports: [PrismaModule],
	controllers: [EdgeWebhooksController],
	providers: [EdgeWebhooksService],
	exports: [EdgeWebhooksService],
})
export class EdgeWebhooksModule { }
