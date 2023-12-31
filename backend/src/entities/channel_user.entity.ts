import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Channel } from './channel.entity';

@Entity('channel_user')
export class ChannelUser {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Channel, channel => channel.channelUsers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id', referencedColumnName: 'id' })
  channel: Channel;

  @ManyToOne(() => User, user => user.channelUsers, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id_42' })
  user: User;

  @Column({ type: 'boolean', default: false })
  owner: boolean;

  @Column({ type: 'boolean', default: false })
  admin: boolean;

  @Column({ type: 'boolean', default: false })
  banned: boolean;

  @Column({ type: 'timestamp', nullable: true })
  mute: Date | null;
}
