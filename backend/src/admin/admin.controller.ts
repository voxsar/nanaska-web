import {
  Controller, Post, Get, Put, Body, Request, UseGuards, Param,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AdminJwtAuthGuard } from './admin-jwt-auth.guard';
import { SuperadminGuard } from './superadmin.guard';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  login(@Body() dto: AdminLoginDto) {
    return this.adminService.login(dto);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return this.adminService.getProfile(req.user.adminId);
  }

  @UseGuards(AdminJwtAuthGuard)
  @Put('change-password')
  changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    return this.adminService.changePassword(req.user.adminId, dto);
  }

  // ── Data views ─────────────────────────────────────────────────────────────

  @UseGuards(AdminJwtAuthGuard)
  @Get('students')
  getStudents() {
    return this.adminService.getStudents();
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('newsletter')
  getNewsletter() {
    return this.adminService.getNewsletter();
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('contact-submissions')
  getContactSubmissions() {
    return this.adminService.getContactSubmissions();
  }

  @UseGuards(AdminJwtAuthGuard)
  @Get('payments')
  getPayments() {
    return this.adminService.getPayments();
  }

  // ── Superadmin: raw DB access ───────────────────────────────────────────────

  @UseGuards(AdminJwtAuthGuard, SuperadminGuard)
  @Get('db/tables')
  listTables() {
    return this.adminService.listTables();
  }

  @UseGuards(AdminJwtAuthGuard, SuperadminGuard)
  @Get('db/tables/:tableName')
  getTableData(@Param('tableName') tableName: string) {
    return this.adminService.getTableData(tableName);
  }

  @UseGuards(AdminJwtAuthGuard, SuperadminGuard)
  @Put('db/tables/:tableName/:id')
  updateTableRow(
    @Param('tableName') tableName: string,
    @Param('id') id: string,
    @Body() data: Record<string, unknown>,
  ) {
    return this.adminService.updateTableRow(tableName, id, data);
  }
}
