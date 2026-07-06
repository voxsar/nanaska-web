import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { GoogleSheetsService } from './google-sheets.service';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

@Injectable()
export class AdminService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly jwt: JwtService,
		private readonly googleSheets: GoogleSheetsService,
	) { }

	async login(dto: AdminLoginDto) {
		const admin = await this.prisma.adminUser.findUnique({ where: { email: dto.email } });
		const valid = admin && (await bcrypt.compare(dto.password, admin.passwordHash));
		if (!valid) throw new UnauthorizedException('Invalid credentials');
		return this.signToken(admin.id, admin.email, admin.role);
	}

	async getProfile(adminId: string) {
		const admin = await this.prisma.adminUser.findUnique({
			where: { id: adminId },
			select: { id: true, email: true, name: true, role: true, createdAt: true },
		});
		if (!admin) throw new UnauthorizedException();
		return admin;
	}

	async changePassword(adminId: string, dto: ChangePasswordDto) {
		const admin = await this.prisma.adminUser.findUnique({ where: { id: adminId } });
		if (!admin) throw new UnauthorizedException();
		const valid = await bcrypt.compare(dto.currentPassword, admin.passwordHash);
		if (!valid) throw new UnauthorizedException('Current password is incorrect');
		const passwordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
		await this.prisma.adminUser.update({ where: { id: adminId }, data: { passwordHash } });
		return { message: 'Password changed successfully' };
	}

	// ── Data views for admins ──────────────────────────────────────────────────

	async getStudents() {
		return this.prisma.user.findMany({
			select: { id: true, email: true, name: true, createdAt: true },
			orderBy: { createdAt: 'desc' },
		});
	}

	async getEnrollmentSubmissions() {
		return this.prisma.enrollmentSubmission.findMany({
			orderBy: { createdAt: 'desc' },
		});
	}

	async getPaidStudents() {
		const orders = await this.prisma.order.findMany({
			where: { status: 'PAID' },
			include: {
				user: { select: { id: true, email: true, name: true } },
				combination: { include: { items: { include: { course: true } } } },
				paymentLink: true,
			},
			orderBy: { createdAt: 'desc' },
		});
		return this.attachEnrollmentSubmissions(orders);
	}

	async getNewsletter() {
		return this.prisma.newsletterSignup.findMany({ orderBy: { createdAt: 'desc' } });
	}

	async getContactSubmissions() {
		return this.prisma.contactSubmission.findMany({ orderBy: { createdAt: 'desc' } });
	}

	async getPayments() {
		const orders = await this.prisma.order.findMany({
			include: {
				user: { select: { id: true, email: true, name: true } },
				combination: { include: { items: { include: { course: true } } } },
				paymentLink: true,
			},
			orderBy: { createdAt: 'desc' },
		});
		return this.attachEnrollmentSubmissions(orders);
	}

	async syncEnrollmentsToGoogleSheets() {
		return this.googleSheets.syncEnrollmentSubmissions();
	}

	private async attachEnrollmentSubmissions(orders: any[]) {
		const orderIds = orders.map((order) => order.id).filter(Boolean);
		const emails = orders
			.map((order) => order.user?.email || order.guestEmail)
			.filter(Boolean);
		if (orderIds.length === 0 && emails.length === 0) return orders;

		const enrollments = await this.prisma.enrollmentSubmission.findMany({
			where: {
				OR: [
					...(orderIds.length ? [{ orderId: { in: orderIds } }] : []),
					...(emails.length ? [{ email: { in: emails } }] : []),
				],
			},
			orderBy: { createdAt: 'desc' },
		});
		const enrollmentByOrderId = new Map<string, any>();
		const enrollmentsByEmail = new Map<string, any[]>();
		for (const enrollment of enrollments) {
			if (!enrollmentByOrderId.has(enrollment.orderId)) {
				enrollmentByOrderId.set(enrollment.orderId, enrollment);
			}
			if (!enrollmentsByEmail.has(enrollment.email)) {
				enrollmentsByEmail.set(enrollment.email, []);
			}
			enrollmentsByEmail.get(enrollment.email).push(enrollment);
		}

		return orders.map((order) => ({
			...order,
			enrollmentSubmission: enrollmentByOrderId.get(order.id) || this.findLikelyEnrollment(order, enrollmentsByEmail) || null,
		}));
	}

	private findLikelyEnrollment(order: any, enrollmentsByEmail: Map<string, any[]>) {
		const email = order.user?.email || order.guestEmail;
		if (!email) return null;
		const candidates = enrollmentsByEmail.get(email) || [];
		if (candidates.length === 0) return null;

		const orderCreatedAt = new Date(order.createdAt).getTime();
		const oneDayMs = 24 * 60 * 60 * 1000;
		return candidates.find((enrollment) => {
			const enrollmentCreatedAt = new Date(enrollment.createdAt).getTime();
			const closeToOrder = Math.abs(orderCreatedAt - enrollmentCreatedAt) <= oneDayMs;
			const sameAmount = !enrollment.amount || enrollment.amount === order.amount;
			return closeToOrder && sameAmount;
		}) || candidates[0];
	}

	// ── Superadmin: raw table access ───────────────────────────────────────────

	async listTables() {
		const tables: Array<{ table_name: string }> = await this.prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
		return tables.map((t) => t.table_name);
	}

	private async getAllowedTables(): Promise<string[]> {
		const tables = await this.listTables();
		return tables;
	}

	async getTableData(tableName: string) {
		const allowed = await this.getAllowedTables();
		if (!allowed.includes(tableName)) {
			throw new UnauthorizedException('Table not found or not accessible');
		}
		const rows = await this.prisma.$queryRawUnsafe(`SELECT * FROM "${tableName}" LIMIT 500`);
		return rows;
	}

	async updateTableRow(tableName: string, id: string, data: Record<string, unknown>) {
		// Validate table name against allowed tables from the DB itself
		const allowed = await this.getAllowedTables();
		if (!allowed.includes(tableName)) {
			throw new UnauthorizedException('Table not found or not accessible');
		}

		// Get table columns from information_schema to whitelist column names
		const columnsResult: Array<{ column_name: string }> = await this.prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = ${tableName}
    `;
		const allowedColumns = new Set(columnsResult.map((c) => c.column_name));

		const updateFields = Object.keys(data).filter(
			(k) => k !== 'id' && allowedColumns.has(k),
		);
		if (updateFields.length === 0) return { message: 'No valid fields to update' };

		const sets = updateFields.map((k, i) => `"${k}" = $${i + 2}`).join(', ');
		const values = updateFields.map((k) => data[k]);

		await this.prisma.$queryRawUnsafe(
			`UPDATE "${tableName}" SET ${sets} WHERE id = $1`,
			id,
			...values,
		);
		return { message: 'Row updated' };
	}

	private signToken(adminId: string, email: string, role: string) {
		const payload = { sub: adminId, email, role, isAdmin: true };
		return {
			access_token: this.jwt.sign(payload),
			admin: { id: adminId, email, role },
		};
	}
}
