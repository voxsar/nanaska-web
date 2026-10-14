import { Module } from '@nestjs/common';
import { FormLeadsService } from './form-leads.service';
import { FormLeadsController } from './form-leads.controller';

@Module({
	providers: [FormLeadsService],
	controllers: [FormLeadsController],
})
export class FormLeadsModule { }
