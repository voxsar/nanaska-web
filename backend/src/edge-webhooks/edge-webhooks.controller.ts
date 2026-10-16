import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Body,
	Param,
	Query,
	UseGuards,
} from '@nestjs/common';
import { EdgeWebhooksService } from './edge-webhooks.service';
import { CreateEdgeWebhookDto } from './dto/create-edge-webhook.dto';
import { UpdateEdgeWebhookDto } from './dto/update-edge-webhook.dto';
import { AdminJwtAuthGuard } from '../admin/admin-jwt-auth.guard';

/**
 * Admin-only. One row per running Nanaska Edge, each with the endpoint and
 * shared secret a paid registration is posted to.
 */
@UseGuards(AdminJwtAuthGuard)
@Controller('edge-webhooks')
export class EdgeWebhooksController {
	constructor(private readonly edgeWebhooks: EdgeWebhooksService) { }

	@Get()
	findAll() {
		return this.edgeWebhooks.findAll();
	}

	@Post()
	create(@Body() dto: CreateEdgeWebhookDto) {
		return this.edgeWebhooks.create(dto);
	}

	@Put(':id')
	update(@Param('id') id: string, @Body() dto: UpdateEdgeWebhookDto) {
		return this.edgeWebhooks.update(id, dto);
	}

	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.edgeWebhooks.remove(id);
	}

	@Get(':id/deliveries')
	deliveries(@Param('id') id: string, @Query('limit') limit?: string) {
		return this.edgeWebhooks.findDeliveries(id, limit ? parseInt(limit, 10) : 20);
	}

	/** Signed probe that proves the URL and secret without registering anybody. */
	@Post(':id/test')
	test(@Param('id') id: string) {
		return this.edgeWebhooks.sendTest(id);
	}

	@Post('deliveries/:deliveryId/retry')
	retry(@Param('deliveryId') deliveryId: string) {
		return this.edgeWebhooks.retryDelivery(deliveryId);
	}
}
