import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesService } from './messages.service';
import { MessagesGateway } from './messages.gateway';
import { Message } from './entities/message.entity';
import { Channel } from './entities/channel.entity';
import { User } from './entities/user.entity';
import { ChannelUser } from './entities/channel_user.entity';
import { BlockedUser } from './entities/blocked_user.entity';
import { Game } from './entities/games.entity';
import { Friend } from './entities/friends.entity';
import { Socket } from 'dgram';
import { MessagesController } from './messages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Channel, User, ChannelUser, BlockedUser, Game, Friend])],
  providers: [MessagesGateway, MessagesService, ],
  exports: [MessagesService],
  controllers: [MessagesController],
})
export class MessagesModule {}
