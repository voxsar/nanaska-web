import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, Request, UseGuards,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';
import { AdminJwtAuthGuard } from '../admin/admin-jwt-auth.guard';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // Public: list published posts
  @Get()
  findAll(@Query('published') published?: string) {
    return this.blogService.findAll(published === 'true');
  }

  // Public: get post by slug
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  // Public: get post by id
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }

  // Admin: create post
  @UseGuards(AdminJwtAuthGuard)
  @Post()
  create(@Body() dto: CreateBlogPostDto, @Request() req) {
    return this.blogService.create(dto, req.user?.adminId);
  }

  // Admin: update post
  @UseGuards(AdminJwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) {
    return this.blogService.update(id, dto);
  }

  // Admin: delete post
  @UseGuards(AdminJwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}
