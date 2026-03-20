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
import { TestimonialsModule } from './testimonials/testimonials.module';

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
    TestimonialsModule,
  ],
})
export class AppModule {}
