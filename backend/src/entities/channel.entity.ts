
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, ManyToOne, JoinTable, JoinColumn, CreateDateColumn } from 'typeorm';
import { Message } from './message.entity';
import { User } from './user.entity';
import { ChannelUser } from './channel_user.entity';

@Entity('channel')
export class Channel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'boolean', default: false })
  private_channel: boolean;

  @Column({ type: 'boolean', default: false })
  direct_message: boolean;

  @Column({ type: 'boolean', default: false })
  pw_protected: boolean;

  @Column({ type: 'text', nullable: true })
  pw_hashed: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Message, message => message.channel)
  messages: Message[];

  @OneToMany(() => ChannelUser, channelUser => channelUser.channel)
  channelUsers: ChannelUser[];

}