import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository} from 'typeorm';
import { User } from 'src/entities/user.entity';
import { Game } from 'src/entities/games.entity';
import { create } from 'domain';

@Injectable()
export class HistoryService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Game)
        private readonly gameRepository: Repository<Game>,
    ) {}
    
    async getFullHistory(): Promise<Game[]> {
        // Using TypeORM's repository methods to query the database
        return this.gameRepository
          .createQueryBuilder('game')
          .select(['game.id', 'game.created_at', 'game.type', 'game.player_one_score', 'game.player_two_score'])
          .addSelect(['winner.name', 'winner.id_42'])
          .addSelect(['playerOne.name', 'playerOne.id_42'])
          .addSelect(['playerTwo.name', 'playerTwo.id_42'])
          .leftJoin('game.winner', 'winner')
          .leftJoin('game.playerOne', 'playerOne')
          .leftJoin('game.playerTwo', 'playerTwo')
          .where('game.winner_id IS NOT NULL')
          .getMany();
    }
}
    
