import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AdminJwtStrategy } from './admin-jwt.strategy';
import { GoogleSheetsService } from './google-sheets.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      useFactory: () => {
        const secret = process.env.JWT_SECRET;
        if (!secret) throw new Error('JWT_SECRET environment variable is not set');
        return {
          secret,
          signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
        };
      },
    }),
  ],
  providers: [AdminService, AdminJwtStrategy, GoogleSheetsService],
  controllers: [AdminController],
  exports: [GoogleSheetsService],
})
export class AdminModule {}
