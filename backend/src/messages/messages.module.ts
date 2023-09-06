import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { Message } from '../entities/message.entity';
import { Channel } from '../entities/channel.entity';
import { User } from '../entities/user.entity';
import { ChannelUser } from '../entities/channel_user.entity';
import { BlockedUser } from '../entities/blocked_user.entity';
import { Game } from '../entities/games.entity';
import { Friend } from '../entities/friends.entity';
import { Socket } from 'dgram';
import { MessagesController } from './messages.controller';
import { AuthController } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';
import { LobbyService } from '../game/services/lobby/lobby.service';
import { GameGateway } from '../game/gateways/game/game.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Channel, User, ChannelUser, BlockedUser, Game, Friend, ]), AuthModule],
  providers: [GameGateway, MessagesGateway, MessagesService, LobbyService],
  exports: [MessagesService],
  controllers: [MessagesController],
})
export class MessagesModule {}
