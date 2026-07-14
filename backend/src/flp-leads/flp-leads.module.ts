import { Module } from '@nestjs/common';
import { FlpLeadsService } from './flp-leads.service';
import { FlpLeadsController } from './flp-leads.controller';

@Module({
	providers: [FlpLeadsService],
	controllers: [FlpLeadsController],
})
export class FlpLeadsModule { }
