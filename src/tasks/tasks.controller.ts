import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { TasksService } from 'src/tasks/tasks.service';
import { CreateTaskDto } from './dtos/create-task.dto';
import { GetTaskFilterDto } from './dtos/get-task-filter.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { TaskEntity } from './task.entity';
import { UpdateTaskStatusDto } from './dtos/update-task-status.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
  constructor(private taskService: TasksService) {}
  @Get()
  async getTasks(@Body() filterDto: GetTaskFilterDto): Promise<TaskEntity[]> {
    return this.taskService.getTaskWithFilter(filterDto);
  }

  @Post()
  async createTask(@Body() createTaskDto: CreateTaskDto): Promise<TaskEntity> {
    return await this.taskService.createTask(createTaskDto);
  }

  @Get('/:id')
  async getTaskById(@Param('id') taskId: string): Promise<TaskEntity> {
    const task = await this.taskService.getTaskById(taskId);
    return task;
  }

  @Delete('/:id')
  async delteTaskById(@Param('id') taskId: string): Promise<TaskEntity> {
    return await this.taskService.deleteTaskById(taskId);
  }

  @Put('/:id')
  async updateTask(
    @Param('id') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return await this.taskService.updateTask(taskId, updateTaskDto);
  }

  @Post('/:id/status')
  async updateTaskStatus(
    @Param('id') taskId: string,
    @Body() updateTaskDto: UpdateTaskStatusDto,
  ) {
    const task = await this.taskService.getTaskById(taskId);
    Object.assign(task, updateTaskDto);
    return await this.taskService.updateTask(taskId, updateTaskDto);
  }

  // @Post('/:id/status')
  // updateTaskStatus(
  //   @Param('id') taskId: string,
  //   @Body()
  //   updateStatusDto: UpdateTaskStatusDto,
  // ): TaskEntity {
  //   const result = this.taskService.updateTaskStatus(
  //     taskId,
  //     updateStatusDto.status,
  //   );
  //   return result;
  // }
}
