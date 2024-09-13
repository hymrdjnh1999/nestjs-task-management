import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateTaskDto } from './dtos/create-task.dto';
import { GetTaskFilterDto } from './dtos/get-task-filter.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { TaskStatus } from './task-status.enum';
import { TaskEntity } from './task.entity';
import { UpdateTaskStatusDto } from './dtos/update-task-status.dto';
import { User } from 'src/auth/user.entity';
import { filter } from 'rxjs';

@Injectable()
export class TasksService {
  private logger = new Logger('Task Service');
  constructor(
    @InjectRepository(TaskEntity)
    private taskRepository: Repository<TaskEntity>,
  ) {}

  async createTask(
    createTaskDto: CreateTaskDto,
    user: User,
  ): Promise<TaskEntity> {
    this.logger.verbose(
      `Task from createTask: ${JSON.stringify(createTaskDto)}`,
    );
    const { title, description } = createTaskDto;
    const task = this.taskRepository.create({
      title,
      description,
      status: TaskStatus.OPEN,
      user,
    });
    await this.taskRepository.save(task);
    return task;
  }

  async getTaskById(taskId: string, user: User): Promise<TaskEntity> {
    this.logger.verbose(`Task id from getTaskById : ${taskId}`);
    const found = await this.taskRepository.findOne({
      where: {
        id: taskId,
        user: {
          id: user.id,
        },
      },
    });
    if (!found) {
      throw new NotFoundException(`Task with ID: "${taskId}" not exists!`);
    }
    return found;
  }

  async deleteTaskById(taskId: string, user: User): Promise<TaskEntity> {
    this.logger.verbose(
      `Task id from deleteTaskById : ${taskId}, user: ${user.username}`,
    );
    const task = await this.taskRepository.findOneBy({
      id: taskId,
      user: {
        id: user.id,
      },
    });
    if (!task) {
      throw new NotFoundException();
    }
    const result = await this.taskRepository.delete(taskId);
    if (result.affected) {
      return task;
    }
  }

  async updateTask(
    taskId: string,
    updateTaskDto: UpdateTaskDto | UpdateTaskStatusDto,
    user: User,
  ) {
    this.logger.verbose(
      `Task from updateTask : ${JSON.stringify(updateTaskDto)}, taskId: ${taskId}`,
    );
    const task = await this.taskRepository.findOneBy({
      id: taskId,
      user: {
        id: user.id,
      },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    Object.assign(task, updateTaskDto);
    return await this.taskRepository.save(task);
  }

  async getTaskWithFilter(
    filterDto: GetTaskFilterDto,
    user: User,
  ): Promise<TaskEntity[]> {
    this.logger.verbose(
      `Filter from getTaskWithFilter : ${JSON.stringify(filter)}, user: ${user.username}`,
    );
    const { status, search } = filterDto;
    const result: TaskEntity[] = [];

    const result1 = await this.taskRepository.findBy({ user: { id: user.id } });
    if (search) {
      result.push(
        ...(await this.taskRepository.findBy({
          title: Like(`%${search.toLowerCase()}%`),
          description: Like(`%${search.toLowerCase()}%`),
        })),
      );
    }
    if (status) {
      result.push(
        ...(await this.taskRepository.findBy({
          status,
        })),
      );
    }
    if (!search && !status) {
      result.push(...result1);
    }
    return result;
  }
}
