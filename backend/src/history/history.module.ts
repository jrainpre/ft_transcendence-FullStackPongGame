import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { Game } from 'src/entities/games.entity';
import { User } from 'src/entities/user.entity'; // Import the UserRepository

@Module({
  imports: [
    TypeOrmModule.forFeature([Game, User]), // Include UserRepository in forFeature
  ],
  providers: [HistoryService],
  controllers: [HistoryController],
})
export class HistoryModule {}
