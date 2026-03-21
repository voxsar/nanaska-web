import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
	constructor(private readonly prisma: PrismaService) { }

	async findAll() {
		return this.prisma.course.findMany({
			orderBy: [{ level: 'asc' }, { id: 'asc' }],
		});
	}

	async findOne(id: string) {
		const course = await this.prisma.course.findUnique({
			where: { id },
			include: {
				combinationItems: {
					include: { combination: true },
				},
			},
		});
		if (!course) throw new NotFoundException(`Course ${id} not found`);
		return course;
	}

	async findCombinations(level?: string) {
		return this.prisma.courseCombination.findMany({
			where: level ? { level } : undefined,
			include: {
				items: { include: { course: true } },
			},
			orderBy: { price: 'asc' },
		});
	}

	async findCombinationById(id: string) {
		const combo = await this.prisma.courseCombination.findUnique({
			where: { id },
			include: { items: { include: { course: true } } },
		});
		if (!combo) throw new NotFoundException(`Combination ${id} not found`);
		return combo;
	}

	async create(data: { id: string; name: string; price: number; priceGbp?: number; level: string; slug: string; description?: string; icon?: string; subtitle?: string; highlights?: string[]; syllabus?: any; outcomes?: string[]; lecturerName?: string; duration?: string; lecturerIds?: string[] }) {
		const course = await this.prisma.course.create({ data });

		// Auto-create a single-course CourseCombination so payment works immediately
		const comboId = `${data.level.slice(0, 4)}_${data.id.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
		const existing = await this.prisma.courseCombination.findUnique({ where: { id: comboId } });
		if (!existing) {
			await this.prisma.courseCombination.create({
				data: {
					id: comboId,
					level: data.level,
					price: data.price,
					priceGbp: data.priceGbp || 0,
					items: { create: { courseId: data.id } },
				},
			});
		}

		return course;
	}

	async update(id: string, data: Partial<{ name: string; price: number; priceGbp: number; level: string; slug: string; description: string; icon: string; subtitle: string; highlights: string[]; syllabus: any; outcomes: string[]; lecturerName: string; duration: string; lecturerIds: string[] }>) {
		const course = await this.prisma.course.update({ where: { id }, data });

		// Keep the auto-generated combination price in sync
		if (data.price !== undefined || data.priceGbp !== undefined) {
			const comboId = `${course.level.slice(0, 4)}_${id.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
			const updateData: any = {};
			if (data.price !== undefined) updateData.price = data.price;
			if (data.priceGbp !== undefined) updateData.priceGbp = data.priceGbp;
			await this.prisma.courseCombination.updateMany({
				where: { id: comboId },
				data: updateData,
			});
		}

		return course;
	}

	async remove(id: string) {
		await this.prisma.course.delete({ where: { id } });
		return { message: 'Course deleted' };
	}

	// ─── Admin: CourseCombination CRUD ─────────────────────────────────────────

	async createCombination(data: {
		id: string;
		name: string;
		slug?: string;
		level: string;
		price: number;
		priceGbp?: number;
		courseIds: string[];
	}) {
		const existing = await this.prisma.courseCombination.findUnique({ where: { id: data.id } });
		if (existing) throw new BadRequestException(`Combination ID "${data.id}" already exists`);

		return this.prisma.courseCombination.create({
			data: {
				id: data.id,
				name: data.name,
				slug: data.slug || null,
				level: data.level,
				price: data.price,
				priceGbp: data.priceGbp || 0,
				items: {
					create: data.courseIds.map((courseId) => ({ courseId })),
				},
			},
			include: { items: { include: { course: true } } },
		});
	}

	async updateCombination(
		id: string,
		data: {
			name?: string;
			slug?: string;
			level?: string;
			price?: number;
			priceGbp?: number;
			courseIds?: string[];
		},
	) {
		const combo = await this.prisma.courseCombination.findUnique({ where: { id } });
		if (!combo) throw new NotFoundException(`Combination ${id} not found`);

		const { courseIds, ...rest } = data;

		// Build the update payload, handling slug null-clearing
		const updatePayload: any = { ...rest };
		if ('slug' in data) {
			updatePayload.slug = data.slug || null;
		}

		await this.prisma.courseCombination.update({ where: { id }, data: updatePayload });

		if (courseIds !== undefined) {
			await this.prisma.courseCombinationItem.deleteMany({ where: { combinationId: id } });
			if (courseIds.length > 0) {
				await this.prisma.courseCombinationItem.createMany({
					data: courseIds.map((courseId) => ({ combinationId: id, courseId })),
				});
			}
		}

		return this.prisma.courseCombination.findUnique({
			where: { id },
			include: { items: { include: { course: true } } },
		});
	}

	async removeCombination(id: string) {
		const combo = await this.prisma.courseCombination.findUnique({
			where: { id },
			include: { orders: { take: 1 } },
		});
		if (!combo) throw new NotFoundException(`Combination ${id} not found`);
		if (combo.orders.length > 0) {
			throw new BadRequestException('Cannot delete a combination that has existing orders');
		}
		await this.prisma.courseCombination.delete({ where: { id } });
		return { message: 'Combination deleted' };
	}
}
