import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { LecturersService } from './lecturers.service';
import { CreateLecturerDto } from './dto/create-lecturer.dto';
import { UpdateLecturerDto } from './dto/update-lecturer.dto';
import { AdminJwtAuthGuard } from '../admin/admin-jwt-auth.guard';

@Controller('lecturers')
export class LecturersController {
  constructor(private readonly lecturersService: LecturersService) {}

  // Public: list active lecturers
  @Get()
  findAll(@Query('active') active?: string) {
    return this.lecturersService.findAll(active === 'true');
  }

  // Public: get one lecturer
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.lecturersService.findOne(id);
  }

  // Admin: create lecturer
  @UseGuards(AdminJwtAuthGuard)
  @Post()
  create(@Body() dto: CreateLecturerDto) {
    return this.lecturersService.create(dto);
  }

  // Admin: update lecturer
  @UseGuards(AdminJwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLecturerDto) {
    return this.lecturersService.update(id, dto);
  }

  // Admin: delete lecturer
  @UseGuards(AdminJwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.lecturersService.remove(id);
  }
}
