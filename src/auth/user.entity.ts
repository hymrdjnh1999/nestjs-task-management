import { TaskEntity } from '../tasks/task.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({
    unique: true,
  })
  username: string;
  @Column()
  password: string;
  @OneToMany((_type) => TaskEntity, (task) => task.user)
  tasks: TaskEntity[];
}
