import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('friends')
export class Friend {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.friendOne,{ eager: true })
  @JoinColumn({ name: 'user_id_one', referencedColumnName: 'id_42' })
  userOne: User;

  @ManyToOne(() => User, user => user.friendTwo,{ eager: true })
  @JoinColumn({ name: 'user_id_two', referencedColumnName: 'id_42' })
  userTwo: User;

  @Column({ type: 'boolean', default: false })
  accepted: boolean;

  @CreateDateColumn()
  created_at: Date;
}