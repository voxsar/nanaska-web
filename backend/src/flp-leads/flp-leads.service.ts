import { Injectable, Logger } from '@nestjs/common';
import { Response } from 'express';
import * as ExcelJS from 'exceljs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFlpLeadDto } from './dto/create-flp-lead.dto';

@Injectable()
export class FlpLeadsService {
	private readonly logger = new Logger(FlpLeadsService.name);

	constructor(private readonly prisma: PrismaService) { }

	/** Public: store a CGMA FLP enquiry from the landing page. */
	async create(dto: CreateFlpLeadDto): Promise<{ id: string }> {
		const record = await this.prisma.flpLead.create({
			data: {
				fullName: dto.fullName.trim(),
				email: dto.email.trim().toLowerCase(),
				phone: dto.phone?.trim() || null,
				whatsapp: dto.whatsapp?.trim() || null,
				qualification: dto.qualification?.trim() || null,
				entryLevel: dto.entryLevel?.trim() || null,
				message: dto.message?.trim() || null,
				source: dto.source?.trim() || 'flp-page',
			},
		});
		this.logger.log(`New FLP lead captured: ${record.email} (${record.id})`);
		return { id: record.id };
	}

	/** Admin: list all leads, newest first. */
	findAll() {
		return this.prisma.flpLead.findMany({ orderBy: { createdAt: 'desc' } });
	}

	/** Admin: stream all leads as a formatted .xlsx workbook. */
	async exportExcel(res: Response): Promise<void> {
		const leads = await this.prisma.flpLead.findMany({ orderBy: { createdAt: 'desc' } });

		const workbook = new ExcelJS.Workbook();
		workbook.creator = 'Nanaska';
		workbook.created = new Date();
		const sheet = workbook.addWorksheet('FLP Leads', {
			views: [{ state: 'frozen', ySplit: 1 }],
		});

		sheet.columns = [
			{ header: 'Date', key: 'createdAt', width: 20 },
			{ header: 'Full Name', key: 'fullName', width: 26 },
			{ header: 'Email', key: 'email', width: 30 },
			{ header: 'Phone', key: 'phone', width: 18 },
			{ header: 'WhatsApp', key: 'whatsapp', width: 18 },
			{ header: 'Qualification', key: 'qualification', width: 34 },
			{ header: 'Interested Level', key: 'entryLevel', width: 18 },
			{ header: 'Message', key: 'message', width: 44 },
			{ header: 'Source', key: 'source', width: 16 },
		];

		// Header styling
		sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
		sheet.getRow(1).fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: 'FF1B365D' },
		};
		sheet.getRow(1).alignment = { vertical: 'middle' };

		leads.forEach((l) => {
			sheet.addRow({
				createdAt: new Date(l.createdAt).toLocaleString('en-GB'),
				fullName: l.fullName,
				email: l.email,
				phone: l.phone || '',
				whatsapp: l.whatsapp || '',
				qualification: l.qualification || '',
				entryLevel: l.entryLevel || '',
				message: l.message || '',
				source: l.source || '',
			});
		});

		const stamp = new Date().toISOString().slice(0, 10);
		res.setHeader(
			'Content-Type',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		);
		res.setHeader(
			'Content-Disposition',
			`attachment; filename="flp-leads-${stamp}.xlsx"`,
		);

		await workbook.xlsx.write(res);
		res.end();
	}
}
