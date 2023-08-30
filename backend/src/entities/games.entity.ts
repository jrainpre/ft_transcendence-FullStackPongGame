import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';

export enum GameType {
    NORMAL = 'normal',
    RANKED = 'ranked',
    NO_POWER = 'no_power'
}

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'player_one_id', referencedColumnName: 'id_42' })
  playerOne: User;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'player_two_id', referencedColumnName: 'id_42' })
  playerTwo: User;

  @Column({ type: 'int', default: 0 })
  player_one_score: number;

  @Column({ type: 'int', default: 0 })
  player_two_score: number;

  @ManyToOne(() => User, { eager: true, nullable: true })
  @JoinColumn({ name: 'winner_id', referencedColumnName: 'id_42' })
  winner: User | null;

  @Column({ type: 'enum', enum: GameType, default: GameType.NORMAL })
  type: GameType;
}