import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoryService } from './history.service';
import { HistoryController } from './history.controller';
import { Game } from 'src/entities/games.entity';
import { User } from 'src/entities/user.entity'; // Import the UserRepository
import { AuthService } from 'src/auth/auth.service';
import { AuthController } from 'src/auth/auth.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Game, User]),AuthModule // Include UserRepository in forFeature
  ], 
  providers: [HistoryService],
  controllers: [HistoryController],
})
export class HistoryModule {}
