import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  id_42: number;

  @Column()
  username: string;

  @Column()
  tfa_enabled: boolean;

  @Column()
  tfa_secret: string;
}