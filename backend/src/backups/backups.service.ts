import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

export interface BackupFile {
	filename: string;
	path: string;
	size: number;
	sizeFormatted: string;
	createdAt: Date;
}

@Injectable()
export class BackupsService {
	private readonly logger = new Logger(BackupsService.name);
	private readonly backupDir: string;

	constructor() {
		// Path to backups directory relative to the backend root
		this.backupDir = path.join(__dirname, '..', '..', 'backups');
	}

	/**
	 * List all backup files in the backups directory
	 */
	async listBackups(): Promise<BackupFile[]> {
		try {
			// Ensure backups directory exists
			await fs.mkdir(this.backupDir, { recursive: true });

			const files = await fs.readdir(this.backupDir);

			// Filter for .tar.gz files
			const backupFiles = files.filter(file => file.endsWith('.tar.gz'));

			// Get file stats for each backup
			const backups = await Promise.all(
				backupFiles.map(async (filename) => {
					const filePath = path.join(this.backupDir, filename);
					const stats = await fs.stat(filePath);

					return {
						filename,
						path: filePath,
						size: stats.size,
						sizeFormatted: this.formatBytes(stats.size),
						createdAt: stats.birthtime,
					};
				}),
			);

			// Sort by creation date (newest first)
			backups.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

			return backups;
		} catch (error: any) {
			this.logger.error(`Failed to list backups: ${error.message}`);
			throw error;
		}
	}

	/**
	 * Create a new database backup
	 */
	async createBackup(): Promise<{ success: boolean; message: string; filename?: string }> {
		this.logger.log('Starting manual database backup...');

		const scriptPath = path.join(__dirname, '..', '..', 'scripts', 'backup-db.sh');

		try {
			const { stdout, stderr } = await execAsync(`bash ${scriptPath}`, {
				cwd: path.join(__dirname, '..', '..'),
			});

			// Extract filename from output
			const filenameMatch = stdout.match(/✓ File: (.+\.tar\.gz)/);
			const filename = filenameMatch ? path.basename(filenameMatch[1]) : undefined;

			this.logger.log('✓ Manual database backup completed successfully');

			return {
				success: true,
				message: 'Backup created successfully',
				filename,
			};
		} catch (error: any) {
			this.logger.error(`Manual database backup failed: ${error.message}`);
			return {
				success: false,
				message: `Backup failed: ${error.message}`,
			};
		}
	}

	/**
	 * Restore a database from a backup file
	 */
	async restoreBackup(filename: string): Promise<{ success: boolean; message: string }> {
		this.logger.log(`Attempting to restore database from: ${filename}`);

		const backupPath = path.join(this.backupDir, filename);

		try {
			// Verify the file exists
			await fs.access(backupPath);

			// Extract the tar.gz file
			const extractedDir = path.join(this.backupDir, 'temp');
			await fs.mkdir(extractedDir, { recursive: true });

			await execAsync(`tar -xzf "${backupPath}" -C "${extractedDir}"`);

			// Find the .sql file
			const extractedFiles = await fs.readdir(extractedDir);
			const sqlFile = extractedFiles.find(file => file.endsWith('.sql'));

			if (!sqlFile) {
				throw new Error('No SQL file found in the backup archive');
			}

			const sqlPath = path.join(extractedDir, sqlFile);

			// Get database connection details from environment
			const dbUrl = process.env.DATABASE_URL;
			if (!dbUrl) {
				throw new Error('DATABASE_URL not set in environment');
			}

			// Parse DATABASE_URL
			const urlMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
			if (!urlMatch) {
				throw new Error('Invalid DATABASE_URL format');
			}

			const [, dbUser, dbPassEncoded, dbHost, dbPort, dbName] = urlMatch;

			// URL decode the password
			const dbPass = decodeURIComponent(dbPassEncoded);

			// Restore the database
			this.logger.log(`Restoring database ${dbName}...`);

			await execAsync(
				`PGPASSWORD="${dbPass}" psql -h "${dbHost}" -p "${dbPort}" -U "${dbUser}" -d "${dbName}" -f "${sqlPath}"`,
			);

			// Cleanup extracted files
			await fs.rm(extractedDir, { recursive: true, force: true });

			this.logger.log('✓ Database restored successfully');

			return {
				success: true,
				message: 'Database restored successfully',
			};
		} catch (error: any) {
			this.logger.error(`Failed to restore database: ${error.message}`);

			// Cleanup on error
			try {
				const extractedDir = path.join(this.backupDir, 'temp');
				await fs.rm(extractedDir, { recursive: true, force: true });
			} catch { }

			return {
				success: false,
				message: `Restore failed: ${error.message}`,
			};
		}
	}

	/**
	 * Delete a backup file
	 */
	async deleteBackup(filename: string): Promise<{ success: boolean; message: string }> {
		this.logger.log(`Attempting to delete backup: ${filename}`);

		const backupPath = path.join(this.backupDir, filename);

		try {
			// Verify the file exists and is a .tar.gz file
			if (!filename.endsWith('.tar.gz')) {
				throw new Error('Invalid backup file format');
			}

			await fs.access(backupPath);
			await fs.unlink(backupPath);

			this.logger.log(`✓ Backup deleted: ${filename}`);

			return {
				success: true,
				message: 'Backup deleted successfully',
			};
		} catch (error: any) {
			this.logger.error(`Failed to delete backup: ${error.message}`);
			return {
				success: false,
				message: `Delete failed: ${error.message}`,
			};
		}
	}

	/**
	 * Format bytes to human-readable string
	 */
	private formatBytes(bytes: number): string {
		if (bytes === 0) return '0 B';

		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));

		return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
	}
}
