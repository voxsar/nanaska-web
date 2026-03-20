import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

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

  async create(data: { id: string; name: string; price: number; level: string; slug: string; description?: string }) {
    return this.prisma.course.create({ data });
  }

  async update(id: string, data: Partial<{ name: string; price: number; level: string; slug: string; description: string }>) {
    return this.prisma.course.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.course.delete({ where: { id } });
    return { message: 'Course deleted' };
  }
}
