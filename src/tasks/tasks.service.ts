import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { CreateTaskDto } from './dtos/create-task.dto';
import { GetTaskFilterDto } from './dtos/get-task-filter.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { TaskStatus } from './task-status.enum';
import { TaskEntity } from './task.entity';
import { UpdateTaskStatusDto } from './dtos/update-task-status.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskEntity)
    private taskRepository: Repository<TaskEntity>,
  ) {}

  async createTask(createTaskDto: CreateTaskDto): Promise<TaskEntity> {
    const { title, description } = createTaskDto;
    const task = this.taskRepository.create({
      title,
      description,
      status: TaskStatus.OPEN,
    });
    await this.taskRepository.save(task);
    return task;
  }

  async getTaskById(taskId: string): Promise<TaskEntity> {
    const found = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!found) {
      throw new NotFoundException(`Task with ID: "${taskId}" not exists!`);
    }
    return found;
  }

  async deleteTaskById(taskId: string): Promise<TaskEntity> {
    const task = await this.taskRepository.findOneBy({
      id: taskId,
    });
    if (!task) {
      throw new NotFoundException();
    }
    const result = await this.taskRepository.delete(taskId);
    if (result.affected) {
      return task;
    }
  }

  // updateTaskStatus(taskId: string, status: TaskStatus): TaskEntity {
  //   const task = this.getTaskById(taskId);
  //   task.status = status;
  //   return task;
  // }

  // updateTask(taskId, updateTaskDto: UpdateTaskDto) {
  //   const task = this.getTaskById(taskId);
  //   task.title = updateTaskDto.title;
  //   task.description = updateTaskDto.description;
  //   return task;
  // }

  async updateTask(
    taskId: string,
    updateTaskDto: UpdateTaskDto | UpdateTaskStatusDto,
  ) {
    const task = await this.taskRepository.findOneBy({
      id: taskId,
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    Object.assign(task, updateTaskDto);
    return await this.taskRepository.save(task);
  }

  async getTaskWithFilter(filterDto: GetTaskFilterDto): Promise<TaskEntity[]> {
    const { status, search } = filterDto;
    const result: TaskEntity[] = [];

    const result1 = await this.taskRepository.find();
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
