import {
  Controller, Get, Post, Put, Body, Param, Query, UseGuards, BadRequestException,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpsertSettingDto } from './dto/upsert-setting.dto';
import { UpsertPageMetaDto } from './dto/upsert-page-meta.dto';
import { NewsletterSignupDto } from './dto/newsletter-signup.dto';
import { ContactSubmissionDto } from './dto/contact-submission.dto';
import { AdminJwtAuthGuard } from '../admin/admin-jwt-auth.guard';
import { EmailService } from '../email/email.service';
import { IsEmail } from 'class-validator';

class TestEmailDto {
  @IsEmail()
  to: string;
}

@Controller('settings')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly email: EmailService,
  ) {}

  // Public: newsletter signup
  @Post('newsletter/signup')
  newsletterSignup(@Body() dto: NewsletterSignupDto) {
    return this.settingsService.newsletterSignup(dto);
  }

  // Public: contact form
  @Post('contact')
  submitContact(@Body() dto: ContactSubmissionDto) {
    return this.settingsService.submitContact(dto);
  }

  // Public: get meta for a specific page path
  @Get('page-meta')
  findPageMeta(@Query('path') path: string) {
    return this.settingsService.findPageMeta(path);
  }

  // Public: get settings by category (for contact info etc.)
  @Get('public')
  findPublic(@Query('category') category: string) {
    if (!category) throw new BadRequestException('category query parameter is required');
    return this.settingsService.findByCategory(category);
  }

  // Admin: list all settings
  @UseGuards(AdminJwtAuthGuard)
  @Get()
  findAll(@Query('category') category?: string) {
    if (category) return this.settingsService.findByCategory(category);
    return this.settingsService.findAll();
  }

  // Admin: upsert a setting
  @UseGuards(AdminJwtAuthGuard)
  @Put()
  upsert(@Body() dto: UpsertSettingDto) {
    return this.settingsService.upsert(dto);
  }

  // Admin: bulk upsert settings
  @UseGuards(AdminJwtAuthGuard)
  @Post('bulk')
  upsertMany(@Body() settings: UpsertSettingDto[]) {
    return this.settingsService.upsertMany(settings);
  }

  // Admin: test email
  @UseGuards(AdminJwtAuthGuard)
  @Post('test-email')
  async testEmail(@Body() body: TestEmailDto) {
    if (!body.to) throw new BadRequestException('to is required');
    await this.email.sendTestEmail(body.to);
    return { message: `Test email sent to ${body.to}` };
  }

  // Admin: list all page meta
  @UseGuards(AdminJwtAuthGuard)
  @Get('page-meta/all')
  findAllPageMeta() {
    return this.settingsService.findAllPageMeta();
  }

  // Admin: upsert page meta
  @UseGuards(AdminJwtAuthGuard)
  @Put('page-meta')
  upsertPageMeta(@Body() dto: UpsertPageMetaDto) {
    return this.settingsService.upsertPageMeta(dto);
  }
}
