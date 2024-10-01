import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Like, Repository } from 'typeorm';
import { TaskEntity } from './task.entity';
import { User } from '../auth/user.entity';
import { GetTaskFilterDto } from './dtos/get-task-filter.dto';
import { CreateTaskDto } from './dtos/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { UpdateTaskStatusDto } from './dtos/update-task-status.dto';

@Injectable()
export class TaskRepository extends Repository<TaskEntity> {
  constructor(private dataSource: DataSource) {
    super(TaskEntity, dataSource.createEntityManager());
  }

  async getTasks(
    filterDto: GetTaskFilterDto,
    user: User,
  ): Promise<TaskEntity[]> {
    const { status, search } = filterDto;

    // Base filter with userId
    const filters: any = {
      user: { id: user.id },
    };

    // Add status filter if provided
    if (status) {
      filters.status = status;
    }

    // If search is provided, use Like to match title or description
    let tasks: TaskEntity[];

    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      tasks = await this.find({
        where: [
          { ...filters, title: Like(searchLower) },
          { ...filters, description: Like(searchLower) },
        ],
      });
    } else {
      tasks = await this.find({ where: filters });
    }

    return tasks;
  }

  async createTask(
    createTaskDto: CreateTaskDto,
    user: User,
  ): Promise<TaskEntity> {
    const { title, description } = createTaskDto;

    const task = this.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });

    await this.save(task);
    return task;
  }

  async getTaskById(taskId: string, user: User): Promise<TaskEntity> {
    return await this.findOne({
      where: {
        id: taskId,
        user: {
          id: user.id,
        },
      },
    });
  }

  async deleteTaskById(taskId: string, user: User): Promise<TaskEntity> {
    const task = await this.findOneBy({
      id: taskId,
      user: {
        id: user.id,
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID: "${taskId}" not found`);
    }

    const result = await this.delete(taskId);
    if (result.affected) {
      return task;
    }
  }

  async updateTask(
    taskId: string,
    updateTaskDto: UpdateTaskDto | UpdateTaskStatusDto,
    user: User,
  ): Promise<TaskEntity> {
    const task = await this.findOneBy({
      id: taskId,
      user: {
        id: user.id,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    Object.assign(task, updateTaskDto);
    return await this.save(task);
  }
}
