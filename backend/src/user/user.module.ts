import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthController } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockedUser } from 'src/entities/blocked_user.entity';
import { MessagesService } from 'src/messages/messages.service';
import { MessagesModule } from 'src/messages/messages.module';
import { Message } from 'src/entities/message.entity';
import { Channel } from 'src/entities/channel.entity';
import { ChannelUser } from 'src/entities/channel_user.entity';
import { Games } from 'src/entities/games.entity';
import { Friend } from 'src/entities/friends.entity';
import { GameGateway } from 'src/game/gateways/game/game.gateway';
import { LobbyService } from 'src/game/services/lobby/lobby.service';

@Module({
  controllers: [UserController],
  providers: [UserService, MessagesService, LobbyService],
  imports: [MessagesModule ,AuthModule, TypeOrmModule.forFeature([Message, Channel, User, ChannelUser, BlockedUser, Games, Friend, ])],
})
export class UserModule {}
