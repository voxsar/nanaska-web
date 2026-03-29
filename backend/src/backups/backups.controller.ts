import {
	Controller,
	Get,
	Post,
	Delete,
	Body,
	UseGuards,
	HttpCode,
	HttpStatus,
} from '@nestjs/common';
import { BackupsService } from './backups.service';
import { AdminJwtAuthGuard } from '../admin/admin-jwt-auth.guard';
import { SuperadminGuard } from '../admin/superadmin.guard';

@Controller('admin/backups')
@UseGuards(AdminJwtAuthGuard, SuperadminGuard)
export class BackupsController {
	constructor(private readonly backupsService: BackupsService) { }

	/**
	 * GET /admin/backups
	 * List all available database backups
	 */
	@Get()
	async listBackups() {
		const backups = await this.backupsService.listBackups();
		return {
			success: true,
			backups,
		};
	}

	/**
	 * POST /admin/backups
	 * Create a new database backup
	 */
	@Post()
	@HttpCode(HttpStatus.OK)
	async createBackup() {
		return await this.backupsService.createBackup();
	}

	/**
	 * POST /admin/backups/restore
	 * Restore database from a backup file
	 */
	@Post('restore')
	@HttpCode(HttpStatus.OK)
	async restoreBackup(@Body('filename') filename: string) {
		if (!filename) {
			return {
				success: false,
				message: 'Filename is required',
			};
		}

		return await this.backupsService.restoreBackup(filename);
	}

	/**
	 * DELETE /admin/backups
	 * Delete a backup file
	 */
	@Delete()
	@HttpCode(HttpStatus.OK)
	async deleteBackup(@Body('filename') filename: string) {
		if (!filename) {
			return {
				success: false,
				message: 'Filename is required',
			};
		}

		return await this.backupsService.deleteBackup(filename);
	}
}
