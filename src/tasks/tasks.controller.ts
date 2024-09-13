import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/auth/get-user.decorator';
import { User } from 'src/auth/user.entity';
import { TasksService } from 'src/tasks/tasks.service';
import { CreateTaskDto } from './dtos/create-task.dto';
import { GetTaskFilterDto } from './dtos/get-task-filter.dto';
import { UpdateTaskStatusDto } from './dtos/update-task-status.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { TaskEntity } from './task.entity';

@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
  private logger = new Logger('TaskController');
  constructor(private taskService: TasksService) {}
  @Get()
  async getTasks(
    @Body() filterDto: GetTaskFilterDto,
    @GetUser() user: User,
  ): Promise<TaskEntity[]> {
    this.logger.verbose(
      `User "${user.username}" retrieving all tasks, Filters: ${JSON.stringify(filterDto)}`,
    );
    return await this.taskService.getTaskWithFilter(filterDto, user);
  }

  @Post()
  async createTask(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser() user: User,
  ): Promise<TaskEntity> {
    this.logger.verbose(
      `User "${user.username}" createTask, Task: ${JSON.stringify(createTaskDto)}`,
    );
    return await this.taskService.createTask(createTaskDto, user);
  }

  @Get('/:id')
  async getTaskById(
    @Param('id') taskId: string,
    @GetUser() user: User,
  ): Promise<TaskEntity> {
    this.logger.verbose(
      `User "${user.username}" getTaskById, TaskId: ${taskId}`,
    );
    const task = await this.taskService.getTaskById(taskId, user);
    return task;
  }

  @Delete('/:id')
  async delteTaskById(
    @Param('id') taskId: string,
    @GetUser() user: User,
  ): Promise<TaskEntity> {
    this.logger.verbose(
      `User "${user.username}" delteTaskById, TaskId: ${taskId}`,
    );
    return await this.taskService.deleteTaskById(taskId, user);
  }

  @Put('/:id')
  async updateTask(
    @Param('id') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUser() user: User,
  ) {
    this.logger.verbose(
      `User "${user.username}" updateTask, task: ${JSON.stringify(updateTaskDto)}`,
    );
    return await this.taskService.updateTask(taskId, updateTaskDto, user);
  }

  @Post('/:id/status')
  async updateTaskStatus(
    @Param('id') taskId: string,
    @Body() updateTaskDto: UpdateTaskStatusDto,
    @GetUser() user: User,
  ) {
    this.logger.verbose(
      `User "${user.username}" updateTaskStatus, task: ${JSON.stringify(updateTaskDto)}`,
    );
    const task = await this.taskService.getTaskById(taskId, user);
    Object.assign(task, updateTaskDto);
    return await this.taskService.updateTask(taskId, updateTaskDto, user);
  }
}
