import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GoogleSheetsService {
	private readonly logger = new Logger(GoogleSheetsService.name);
	private sheets: any;

	constructor(private readonly prisma: PrismaService) {
		this.initializeGoogleSheets();
	}

	private initializeGoogleSheets() {
		try {
			// Check if Google credentials are configured
			const credentials = process.env.GOOGLE_SHEETS_CREDENTIALS;
			if (!credentials) {
				this.logger.warn('GOOGLE_SHEETS_CREDENTIALS not configured - Google Sheets sync disabled');
				return;
			}

			const auth = new google.auth.GoogleAuth({
				credentials: JSON.parse(credentials),
				scopes: ['https://www.googleapis.com/auth/spreadsheets'],
			});

			this.sheets = google.sheets({ version: 'v4', auth });
			this.logger.log('Google Sheets API initialized successfully');
		} catch (error) {
			this.logger.error('Failed to initialize Google Sheets API', error.message);
		}
	}

	async syncEnrollmentSubmissions(): Promise<{ message: string; syncedCount: number }> {
		if (!this.sheets) {
			throw new Error('Google Sheets API not configured. Please set GOOGLE_SHEETS_CREDENTIALS and GOOGLE_SHEETS_SPREADSHEET_ID environment variables.');
		}

		const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
		if (!spreadsheetId) {
			throw new Error('GOOGLE_SHEETS_SPREADSHEET_ID not configured');
		}

		// Fetch all enrollment submissions
		const enrollments = await this.prisma.enrollmentSubmission.findMany({
			orderBy: { createdAt: 'desc' },
		});

		// Prepare data for Google Sheets
		const headers = [
			'Submission Date',
			'First Name',
			'Last Name',
			'Email',
			'Phone',
			'WhatsApp',
			'CIMA ID',
			'CIMA Stage',
			'Date of Birth',
			'Gender',
			'Country',
			'City',
			'Postcode',
			'Cart Items',
			'Currency',
			'Amount',
			'Order ID',
			'Notes',
		];

		const rows = enrollments.map((e) => [
			new Date(e.createdAt).toLocaleString(),
			e.firstName || '',
			e.lastName || '',
			e.email || '',
			e.phone || '',
			e.whatsapp || '',
			e.cimaId || '',
			e.cimaStage || '',
			e.dob || '',
			e.gender || '',
			e.country || '',
			e.city || '',
			e.postcode || '',
			this.formatCartItems(e.cartJson),
			e.currency || '',
			e.amount?.toString() || '0',
			e.orderId || '',
			e.notes || '',
		]);

		// Clear existing data and write new data
		const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || 'Enrollment Submissions';

		try {
			// Clear the sheet first
			await this.sheets.spreadsheets.values.clear({
				spreadsheetId,
				range: `${sheetName}!A:Z`,
			});

			// Write headers and data
			await this.sheets.spreadsheets.values.update({
				spreadsheetId,
				range: `${sheetName}!A1`,
				valueInputOption: 'RAW',
				resource: {
					values: [headers, ...rows],
				},
			});

			this.logger.log(`Successfully synced ${enrollments.length} enrollment submissions to Google Sheets`);

			return {
				message: `Successfully synced ${enrollments.length} enrollment submissions to Google Sheets`,
				syncedCount: enrollments.length,
			};
		} catch (error) {
			this.logger.error('Failed to sync to Google Sheets', error.message);
			throw new Error(`Failed to sync to Google Sheets: ${error.message}`);
		}
	}

	async syncSingleEnrollment(enrollmentId: string): Promise<void> {
		if (!this.sheets) {
			this.logger.warn('Google Sheets API not configured - skipping auto-sync');
			return;
		}

		const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
		if (!spreadsheetId) {
			this.logger.warn('GOOGLE_SHEETS_SPREADSHEET_ID not configured - skipping auto-sync');
			return;
		}

		try {
			const enrollment = await this.prisma.enrollmentSubmission.findUnique({
				where: { id: enrollmentId },
			});

			if (!enrollment) {
				this.logger.warn(`Enrollment ${enrollmentId} not found - skipping auto-sync`);
				return;
			}

			const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || 'Enrollment Submissions';

			// Append the new row
			const row = [
				new Date(enrollment.createdAt).toLocaleString(),
				enrollment.firstName || '',
				enrollment.lastName || '',
				enrollment.email || '',
				enrollment.phone || '',
				enrollment.whatsapp || '',
				enrollment.cimaId || '',
				enrollment.cimaStage || '',
				enrollment.dob || '',
				enrollment.gender || '',
				enrollment.country || '',
				enrollment.city || '',
				enrollment.postcode || '',
				this.formatCartItems(enrollment.cartJson),
				enrollment.currency || '',
				enrollment.amount?.toString() || '0',
				enrollment.orderId || '',
				enrollment.notes || '',
			];

			await this.sheets.spreadsheets.values.append({
				spreadsheetId,
				range: `${sheetName}!A:Z`,
				valueInputOption: 'RAW',
				insertDataOption: 'INSERT_ROWS',
				resource: {
					values: [row],
				},
			});

			this.logger.log(`Auto-synced enrollment ${enrollmentId} to Google Sheets`);
		} catch (error) {
			this.logger.error(`Failed to auto-sync enrollment ${enrollmentId} to Google Sheets`, error.message);
			// Don't throw - auto-sync is non-critical
		}
	}

	private formatCartItems(cartJson: any): string {
		if (!cartJson || !Array.isArray(cartJson)) return '';
		return cartJson
			.map((item) => {
				const title = item.title || item.name || 'Unknown';
				const code = item.combinationId || item.courseCode || '';
				return code ? `${title} (${code})` : title;
			})
			.join(', ');
	}
}
