import { Controller, Get, Post, Put, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { AdminJwtAuthGuard } from '../admin/admin-jwt-auth.guard';

@Controller('courses')
export class CoursesController {
	constructor(private readonly coursesService: CoursesService) { }

	/** GET /courses – list all individual subjects */
	@Get()
	findAll() {
		return this.coursesService.findAll();
	}

	/** GET /courses/combinations?level=certificate – list combinations, optionally filtered */
	@Get('combinations')
	findCombinations(@Query('level') level?: string) {
		return this.coursesService.findCombinations(level);
	}

	/** GET /courses/combinations/:id – single combination */
	@Get('combinations/:id')
	findCombinationById(@Param('id') id: string) {
		return this.coursesService.findCombinationById(id);
	}

	/** GET /courses/:id – single subject */
	@Get(':id')
	findOne(@Param('id') id: string) {
		return this.coursesService.findOne(id);
	}

	/** Admin: create course */
	@UseGuards(AdminJwtAuthGuard)
	@Post()
	create(@Body() data: { id: string; name: string; price: number; level: string; slug: string; description?: string; icon?: string; subtitle?: string; highlights?: string[]; syllabus?: any; outcomes?: string[]; lecturerName?: string; duration?: string; lecturerIds?: string[] }) {
		return this.coursesService.create(data);
	}

	/** Admin: update course */
	@UseGuards(AdminJwtAuthGuard)
	@Put(':id')
	update(@Param('id') id: string, @Body() data: Partial<{ name: string; price: number; level: string; slug: string; description: string; icon: string; subtitle: string; highlights: string[]; syllabus: any; outcomes: string[]; lecturerName: string; duration: string; lecturerIds: string[] }>) {
		return this.coursesService.update(id, data);
	}

	/** Admin: delete course */
	@UseGuards(AdminJwtAuthGuard)
	@Delete(':id')
	remove(@Param('id') id: string) {
		return this.coursesService.remove(id);
	}
}
