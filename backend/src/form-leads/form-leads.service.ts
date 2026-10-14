import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnquiryLeadDto } from './dto/create-enquiry-lead.dto';
import { CreateAlumniRegistrationDto } from './dto/create-alumni-registration.dto';

@Injectable()
export class FormLeadsService {
	private readonly logger = new Logger(FormLeadsService.name);

	constructor(private readonly prisma: PrismaService) { }

	/** Public: store a "Register My Interest" enquiry from the home-page modal. */
	async createEnquiry(dto: CreateEnquiryLeadDto): Promise<{ id: string }> {
		const record = await this.prisma.enquiryLead.create({
			data: {
				name: dto.name.trim(),
				email: dto.email.trim().toLowerCase(),
				phone: dto.phone?.trim() || null,
				level: dto.level?.trim() || null,
				source: dto.source?.trim() || 'home-modal',
			},
		});
		this.logger.log(`New enquiry lead captured: ${record.email} (${record.id})`);
		return { id: record.id };
	}

	/** Public: store an alumni registration. */
	async createAlumni(dto: CreateAlumniRegistrationDto): Promise<{ id: string }> {
		const record = await this.prisma.alumniRegistration.create({
			data: {
				name: dto.name.trim(),
				email: dto.email.trim().toLowerCase(),
				phone: dto.phone.trim(),
				occupation: dto.occupation?.trim() || null,
				address: dto.address?.trim() || null,
			},
		});
		this.logger.log(`New alumni registration captured: ${record.email} (${record.id})`);
		return { id: record.id };
	}

	findEnquiries() {
		return this.prisma.enquiryLead.findMany({ orderBy: { createdAt: 'desc' } });
	}

	findAlumni() {
		return this.prisma.alumniRegistration.findMany({ orderBy: { createdAt: 'desc' } });
	}
}
