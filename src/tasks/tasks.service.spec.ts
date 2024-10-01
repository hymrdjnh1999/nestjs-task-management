import { Test } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { TaskEntity } from './task.entity';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { GetTaskFilterDto } from './dtos/get-task-filter.dto';
import { User } from 'src/auth/user.entity';
import { TaskStatus } from './task-status.enum';

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
});

const mockUser: User = {
  username: 'Do Tien Dinh',
  id: 'some ID',
  password: 'some password',
  tasks: [],
};
describe('Task service', () => {
  let taskService: TasksService;
  let taskRepository;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: TaskRepository,
          useFactory: mockTaskRepository,
        },
      ],
    }).compile();
    taskService = module.get(TasksService);
    taskRepository = module.get(TaskRepository);
  });
  describe('Get Tasks', () => {
    it('call taskRepository.getTasks and return the result', async () => {
      expect(taskRepository.getTasks).not.toHaveBeenCalled();
      taskRepository.getTasks.mockResolvedValue('some');
      const result = await taskService.getTaskWithFilter(null, mockUser);
      expect(taskRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual('some');
    });
  });

  //   describe('get task by id ', () => {
  //     it('call taskRepository.getTaskById', async () => {
  //       const mockTask: TaskEntity = {
  //         title: 'test title',
  //         description: 'test descr',
  //         id: 'someId',
  //         user: mockUser,
  //         status: TaskStatus.OPEN,
  //       };
  //       //   taskRepository.findOne.mockResolvedValue(mockTask);
  //       const result = await taskService.getTaskById('someId', mockUser);
  //       expect(taskRepository.getTaskById).toHaveBeenCalled();
  //       //   expect(result).toEqual(mockTask);
  //     });
  //   });
});
