import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('blocked_users')
export class BlockedUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.blockedByUser,  { eager: true })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id_42' })
  blockedByUser: User;

  @ManyToOne(() => User, user => user.blockedUsers, { eager: true })
  @JoinColumn({ name: 'blocked_user_id', referencedColumnName: 'id_42'})
  blockedUser: User;

  @CreateDateColumn()
  blocked_at: Date;
}

