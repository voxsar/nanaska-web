import { PartialType } from '@nestjs/mapped-types';
import { CreateEdgeWebhookDto } from './create-edge-webhook.dto';

export class UpdateEdgeWebhookDto extends PartialType(CreateEdgeWebhookDto) {}
