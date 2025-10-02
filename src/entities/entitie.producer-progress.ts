import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  JoinColumn
} from "typeorm";
import { User } from './entitie.user';

@Entity('producer_progress')
@Index(['userId'])
export class ProducerProgress {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column({ type: 'json', default: '[]' })
  completedTasks: string[];

  @Column({ type: 'json', default: '[]' })
  completedSubtasks: string[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}