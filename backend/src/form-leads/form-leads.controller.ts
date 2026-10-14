import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { FormLeadsService } from './form-leads.service';
import { CreateEnquiryLeadDto } from './dto/create-enquiry-lead.dto';
import { CreateAlumniRegistrationDto } from './dto/create-alumni-registration.dto';
import { AdminJwtAuthGuard } from '../admin/admin-jwt-auth.guard';
import { Recaptcha } from '../recaptcha/recaptcha.decorator';

@Controller()
export class FormLeadsController {
	constructor(private readonly formLeadsService: FormLeadsService) { }

	/** POST /enquiry-leads – public, home-page enquiry modal. */
	@Recaptcha('enroll_interest')
	@Post('enquiry-leads')
	createEnquiry(@Body() dto: CreateEnquiryLeadDto) {
		return this.formLeadsService.createEnquiry(dto);
	}

	/** POST /alumni – public, alumni registration form. */
	@Recaptcha('alumni_register')
	@Post('alumni')
	createAlumni(@Body() dto: CreateAlumniRegistrationDto) {
		return this.formLeadsService.createAlumni(dto);
	}

	/** GET /enquiry-leads – admin. */
	@UseGuards(AdminJwtAuthGuard)
	@Get('enquiry-leads')
	findEnquiries() {
		return this.formLeadsService.findEnquiries();
	}

	/** GET /alumni – admin. */
	@UseGuards(AdminJwtAuthGuard)
	@Get('alumni')
	findAlumni() {
		return this.formLeadsService.findAlumni();
	}
}
