import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { CoursesModule } from './courses/courses.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { BlogModule } from './blog/blog.module';
import { LecturersModule } from './lecturers/lecturers.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AdminModule,
    CoursesModule,
    OrdersModule,
    PaymentsModule,
    BlogModule,
    LecturersModule,
    SettingsModule,
  ],
})
export class AppModule {}
