import { Entity, PrimaryColumn, Column, ManyToMany, JoinTable, OneToMany,CreateDateColumn } from 'typeorm';
import { Channel } from './channel.entity';
import { ChannelUser } from './channel_user.entity';
import { BlockedUser } from './blocked_user.entity';
import { Friend } from './friends.entity';
import { Game } from './games.entity';

export enum UserStatus {
    ONLINE = 'online',
    OFFLINE = 'offline',
    INGAME = 'ingame'
}

@Entity('users')
export class User {
  @PrimaryColumn()
  id_42: number;

  @Column({ type: 'varchar', unique: false, nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  socket_id: string;

  @Column({ type: 'boolean', default: false })
  tfa_enabled: boolean;

  @Column({ type: 'varchar', nullable: true })
  tfa_secret: string;

  @Column({ type: 'varchar', nullable: true })
  tfa_otpath_url: string;

  @Column({ type: 'varchar', nullable: true })
  profile_picture: string;

  @Column({ type: 'boolean', default: true })
  first_login: boolean;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ONLINE })
  status: UserStatus;

  @Column({ type: 'boolean', default: false })
  in_queue: boolean;

  @Column({ type: 'int', default: 0 })
  win_normal: number;

  @Column({ type: 'int', default: 0 })
  loss_normal: number;

  @Column({ type: 'int', default: 0 })
  games_played_normal: number;

  @Column({ type: 'int', default: 0 })
  win_ranked: number;

  @Column({ type: 'int', default: 0 })
  loss_ranked: number;

  @Column({ type: 'int', default: 0 })
  games_played_ranked: number;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => ChannelUser, channelUser => channelUser.user)
  channelUsers: ChannelUser[];

  @OneToMany(() => BlockedUser, blockedUser => blockedUser.blockedUser)
  blockedUsers: BlockedUser[];

  @OneToMany(() => BlockedUser, blockedUser => blockedUser.blockedByUser)
  blockedByUser: BlockedUser[];

  @OneToMany(() => Friend, friend => friend.userOne)
  friendOne: Friend[];

  @OneToMany(() => Friend, friend => friend.userTwo)
  friendTwo: Friend[];

  @OneToMany(() => Game, game => game.winner)
  gamesWon: Game[];

  @OneToMany(() => Game, game => game.playerOne)
  gamesPlayerOne: Game[];

  @OneToMany(() => Game, game => game.playerTwo)
  gamesPlayerTwo: Game[];

}