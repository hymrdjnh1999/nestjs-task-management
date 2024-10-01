import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { TasksService } from '../tasks/tasks.service';
import { TaskEntity } from './task.entity';
import { TasksController } from './tasks.controller';
import { TaskRepository } from './task.repository';

@Module({
  controllers: [TasksController],
  providers: [TasksService],
  imports: [TypeOrmModule.forFeature([TaskRepository]), AuthModule],
})
export class TasksModule {}
