import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TaskRepository } from './task.repository';
import { CreateTaskDto } from './dtos/create-task.dto';
import { GetTaskFilterDto } from './dtos/get-task-filter.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { TaskStatus } from './task-status.enum';
import { TaskEntity } from './task.entity';
import { UpdateTaskStatusDto } from './dtos/update-task-status.dto';
import { User } from '../auth/user.entity';

@Injectable()
export class TasksService {
  private logger = new Logger('TasksService');

  constructor(
    @InjectRepository(TaskRepository) private taskRepository: TaskRepository,
  ) {}

  async createTask(
    createTaskDto: CreateTaskDto,
    user: User,
  ): Promise<TaskEntity> {
    this.logger.verbose(
      `Task from createTask: ${JSON.stringify(createTaskDto)}, user: ${user.username}`,
    );
    return await this.taskRepository.createTask(createTaskDto, user);
  }

  async getTaskById(taskId: string, user: User): Promise<TaskEntity> {
    const found = await this.taskRepository.getTaskById(taskId, user);
    if (!found) {
      throw new NotFoundException(`Task with ID: "${taskId}" not exists!`);
    }
    return found;
  }

  async deleteTaskById(taskId: string, user: User): Promise<TaskEntity> {
    this.logger.verbose(
      `Task id from deleteTaskById : ${taskId}, user: ${user.username}`,
    );
    return this.taskRepository.deleteTaskById(taskId, user);
  }

  async updateTask(
    taskId: string,
    updateTaskDto: UpdateTaskDto | UpdateTaskStatusDto,
    user: User,
  ): Promise<TaskEntity> {
    this.logger.verbose(
      `Task from updateTask : ${JSON.stringify(updateTaskDto)}, taskId: ${taskId}`,
    );

    return await this.taskRepository.updateTask(taskId, updateTaskDto, user);
  }

  async getTaskWithFilter(
    filterDto: GetTaskFilterDto,
    user: User,
  ): Promise<TaskEntity[]> {
    this.logger.verbose(
      `Filter from getTaskWithFilter : ${JSON.stringify(filterDto)}, user: ${user.username}`,
    );

    // Use the custom `getTasks` method from TaskRepository
    return this.taskRepository.getTasks(filterDto, user);
  }
}
