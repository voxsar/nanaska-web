import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(publishedOnly = false) {
    return this.prisma.blogPost.findMany({
      where: publishedOnly ? { published: true } : undefined,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        coverUrl: true,
        published: true,
        metaTitle: true,
        metaDesc: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!post) throw new NotFoundException('Blog post not found');
    return post;
  }

  async create(dto: CreateBlogPostDto, authorId?: string) {
    const slug = dto.slug || slugify(dto.title);
    return this.prisma.blogPost.create({
      data: {
        title: dto.title,
        slug,
        content: dto.content,
        coverUrl: dto.coverUrl,
        published: dto.published ?? false,
        metaTitle: dto.metaTitle,
        metaDesc: dto.metaDesc,
        authorId,
      },
    });
  }

  async update(id: string, dto: UpdateBlogPostDto) {
    const exists = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Blog post not found');
    return this.prisma.blogPost.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    const exists = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('Blog post not found');
    await this.prisma.blogPost.delete({ where: { id } });
    return { message: 'Blog post deleted' };
  }
}
