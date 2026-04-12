import {
	Controller, Get, Post, Put, Delete, Query, Param, Body,
	UseGuards, UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { randomBytes } from 'crypto';
import { AdminJwtAuthGuard } from '../admin/admin-jwt-auth.guard';
import { MediaService } from './media.service';
import { CreateSiteImageDto } from './dto/create-site-image.dto';
import { UpdateSiteImageDto } from './dto/update-site-image.dto';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function getApiBaseUrl(): string {
	const configured = process.env.API_BASE_URL;
	if (configured) return configured.replace(/\/$/, '');
	const port = process.env.PORT || '3001';
	return `http://localhost:${port}`;
}

@Controller('media')
export class MediaController {
	constructor(private readonly mediaService: MediaService) { }

	// Public: list images (optionally filtered by group)
	@Get('public')
	findPublic(@Query('group') group?: string) {
		return this.mediaService.findAll(group);
	}

	// Admin: list all images
	@UseGuards(AdminJwtAuthGuard)
	@Get()
	findAll(@Query('group') group?: string) {
		return this.mediaService.findAll(group);
	}

	// Admin: create a new image slot
	@UseGuards(AdminJwtAuthGuard)
	@Post()
	create(@Body() dto: CreateSiteImageDto) {
		return this.mediaService.createImage(dto);
	}

	// Admin: delete an image slot
	@UseGuards(AdminJwtAuthGuard)
	@Delete(':key')
	remove(@Param('key') key: string) {
		return this.mediaService.deleteImage(key);
	}

	// Admin: upload a new image file and assign it to a key
	@UseGuards(AdminJwtAuthGuard)
	@Post('upload/:key')
	@UseInterceptors(
		FileInterceptor('file', {
			storage: diskStorage({
				destination: join(process.cwd(), 'uploads'),
				filename: (_req, file, cb) => {
					const uniqueSuffix = randomBytes(16).toString('hex');
					cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
				},
			}),
			fileFilter: (_req, file, cb) => {
				if (!ALLOWED_MIME.includes(file.mimetype)) {
					cb(new BadRequestException(`Unsupported file type: ${file.mimetype}`), false);
				} else {
					cb(null, true);
				}
			},
			limits: { fileSize: MAX_FILE_SIZE },
		}),
	)
	async uploadImage(
		@Param('key') key: string,
		@UploadedFile() file: Express.Multer.File,
	) {
		if (!file) throw new BadRequestException('No file uploaded');
		const fileUrl = `${getApiBaseUrl()}/uploads/${file.filename}`;
		return this.mediaService.uploadAndSetImage(key, fileUrl);
	}

	// Admin: update alt text / sort order for an image slot
	@UseGuards(AdminJwtAuthGuard)
	@Put(':key')
	update(@Param('key') key: string, @Body() dto: UpdateSiteImageDto) {
		return this.mediaService.updateImage(key, dto);
	}
}
