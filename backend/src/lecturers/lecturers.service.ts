import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLecturerDto } from './dto/create-lecturer.dto';
import { UpdateLecturerDto } from './dto/update-lecturer.dto';

@Injectable()
export class LecturersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(activeOnly = false) {
    return this.prisma.lecturer.findMany({
      where: activeOnly ? { active: true } : undefined,
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const lecturer = await this.prisma.lecturer.findUnique({ where: { id } });
    if (!lecturer) throw new NotFoundException('Lecturer not found');
    return lecturer;
  }

  async create(dto: CreateLecturerDto) {
    return this.prisma.lecturer.create({
      data: {
        ...dto,
        stats: (dto.stats ?? []) as any,
        specialties: dto.specialties ?? [],
        credentials: dto.credentials,
      },
    });
  }

  async update(id: string, dto: UpdateLecturerDto) {
    const exists = await this.prisma.lecturer.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Lecturer not found');
    return this.prisma.lecturer.update({
      where: { id },
      data: {
        ...dto,
        stats: dto.stats !== undefined ? (dto.stats as any) : undefined,
      },
    });
  }

  async remove(id: string) {
    const exists = await this.prisma.lecturer.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Lecturer not found');
    await this.prisma.lecturer.delete({ where: { id } });
    return { message: 'Lecturer deleted' };
  }
}
