import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Channel } from './channel.entity';
import { User } from './user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'owner_id', referencedColumnName: 'id_42' })
  owner: User;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column({ type: 'boolean', default: false })
  isSystemMessage: boolean;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Channel, { eager: true })
  @JoinColumn({ name: 'channel_id', referencedColumnName: 'id' })
  channel: Channel;
}