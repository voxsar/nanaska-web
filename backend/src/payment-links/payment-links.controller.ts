import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AdminJwtAuthGuard } from '../admin/admin-jwt-auth.guard';
import { PaymentLinksService } from './payment-links.service';
import { CreatePaymentLinkDto } from './dto/create-payment-link.dto';
import { PayPaymentLinkDto } from './dto/pay-payment-link.dto';
import { VerifyPasswordDto } from './dto/verify-password.dto';

@Controller('payment-links')
export class PaymentLinksController {
  constructor(private readonly service: PaymentLinksService) {}

  // ── Admin routes (protected) ───────────────────────────────────────────────

  @UseGuards(AdminJwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body() dto: CreatePaymentLinkDto) {
    return this.service.create(req.user.adminId, dto);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get()
  findAll() {
    return this.service.findAll();
  }

  @UseGuards(AdminJwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Post(':id/resend')
  resendEmail(@Param('id') id: string) {
    return this.service.resendEmail(id);
  }

  // ── Public routes ──────────────────────────────────────────────────────────

  @Get('p/:slug')
  getPublicInfo(@Param('slug') slug: string) {
    return this.service.getPublicInfo(slug);
  }

  @Post('p/:slug/verify')
  verifyPassword(@Param('slug') slug: string, @Body() dto: VerifyPasswordDto) {
    return this.service.verifyPassword(slug, dto.password);
  }

  @Post('p/:slug/pay')
  initiatePayment(
    @Param('slug') slug: string,
    @Body() dto: PayPaymentLinkDto,
    @Headers('origin') origin: string,
  ) {
    return this.service.initiatePayment(slug, dto, origin);
  }
}
