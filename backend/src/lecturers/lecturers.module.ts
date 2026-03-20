import { Module } from '@nestjs/common';
import { LecturersService } from './lecturers.service';
import { LecturersController } from './lecturers.controller';

@Module({
  providers: [LecturersService],
  controllers: [LecturersController],
})
export class LecturersModule {}
