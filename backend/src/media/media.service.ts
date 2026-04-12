import {
	Injectable, NotFoundException, BadRequestException, ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSiteImageDto } from './dto/create-site-image.dto';
import { UpdateSiteImageDto } from './dto/update-site-image.dto';

@Injectable()
export class MediaService {
	constructor(private readonly prisma: PrismaService) { }

	async createImage(dto: CreateSiteImageDto) {
		const existing = await this.prisma.siteImage.findUnique({ where: { key: dto.key } });
		if (existing) throw new ConflictException(`Site image key "${dto.key}" already exists`);
		return this.prisma.siteImage.create({ data: dto });
	}

	async deleteImage(key: string) {
		const exists = await this.prisma.siteImage.findUnique({ where: { key } });
		if (!exists) throw new NotFoundException(`Site image "${key}" not found`);
		await this.prisma.siteImage.delete({ where: { key } });
		return { deleted: key };
	}

	async findAll(group?: string) {
		return this.prisma.siteImage.findMany({
			where: group ? { group } : undefined,
			orderBy: [{ group: 'asc' }, { sortOrder: 'asc' }],
		});
	}

	async findByKey(key: string) {
		const image = await this.prisma.siteImage.findUnique({ where: { key } });
		if (!image) throw new NotFoundException(`Site image "${key}" not found`);
		return image;
	}

	async updateImage(key: string, dto: UpdateSiteImageDto) {
		const exists = await this.prisma.siteImage.findUnique({ where: { key } });
		if (!exists) throw new NotFoundException(`Site image "${key}" not found`);
		return this.prisma.siteImage.update({
			where: { key },
			data: {
				...(dto.url !== undefined && { url: dto.url }),
				...(dto.altText !== undefined && { altText: dto.altText }),
				...(dto.sortOrder !== undefined && { sortOrder: dto.sortOrder }),
			},
		});
	}

	async uploadAndSetImage(key: string, fileUrl: string) {
		const exists = await this.prisma.siteImage.findUnique({ where: { key } });
		if (!exists) throw new NotFoundException(`Site image "${key}" not found`);
		return this.prisma.siteImage.update({
			where: { key },
			data: { url: fileUrl },
		});
	}
}
