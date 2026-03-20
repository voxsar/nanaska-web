import { Injectable, NotFoundException } from '@nestjs/common';
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

	async create(data: { id: string; name: string; price: number; level: string; slug: string; description?: string; icon?: string; subtitle?: string; highlights?: string[]; syllabus?: any; outcomes?: string[]; lecturerName?: string; duration?: string; lecturerIds?: string[] }) {
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
					items: { create: { courseId: data.id } },
				},
			});
		}

		return course;
	}

	async update(id: string, data: Partial<{ name: string; price: number; level: string; slug: string; description: string; icon: string; subtitle: string; highlights: string[]; syllabus: any; outcomes: string[]; lecturerName: string; duration: string; lecturerIds: string[] }>) {
		const course = await this.prisma.course.update({ where: { id }, data });

		// Keep the auto-generated combination price in sync
		if (data.price !== undefined) {
			const comboId = `${course.level.slice(0, 4)}_${id.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
			await this.prisma.courseCombination.updateMany({
				where: { id: comboId },
				data: { price: data.price },
			});
		}

		return course;
	}

	async remove(id: string) {
		await this.prisma.course.delete({ where: { id } });
		return { message: 'Course deleted' };
	}
}
