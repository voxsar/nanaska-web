import { Controller, Post, Get, Body, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { FlpLeadsService } from './flp-leads.service';
import { CreateFlpLeadDto } from './dto/create-flp-lead.dto';
import { AdminJwtAuthGuard } from '../admin/admin-jwt-auth.guard';

@Controller('flp-leads')
export class FlpLeadsController {
	constructor(private readonly flpLeadsService: FlpLeadsService) { }

	/**
	 * POST /flp-leads
	 * Public – captures a CGMA FLP enquiry from the landing-page CTA form.
	 */
	@Post()
	create(@Body() dto: CreateFlpLeadDto) {
		return this.flpLeadsService.create(dto);
	}

	/**
	 * GET /flp-leads
	 * Admin – returns all captured leads for the admin table.
	 */
	@UseGuards(AdminJwtAuthGuard)
	@Get()
	findAll() {
		return this.flpLeadsService.findAll();
	}

	/**
	 * GET /flp-leads/export
	 * Admin – streams all leads as an .xlsx download.
	 */
	@UseGuards(AdminJwtAuthGuard)
	@Get('export')
	export(@Res() res: Response) {
		return this.flpLeadsService.exportExcel(res);
	}
}
