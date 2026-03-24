import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { PrismaModule } from '../prisma/prisma.module';
import { EmailModule } from '../email/email.module';

@Module({
	imports: [PrismaModule, EmailModule],
	providers: [SchedulerService],
})
export class SchedulerModule { }
