import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { UserController } from './user/user.controller';
import { EditController } from './edit/edit.controller';
import { EditService } from './edit/edit.service';
import { EditModule } from './edit/edit.module';
import { User } from './entities/user.entity';
import { UploadController } from './upload/upload.controller';
import { UploadService } from './upload/upload.service';
import { ConfigModule } from '@nestjs/config';
import { MessagesModule } from './messages/messages.module';
import { Friend } from 'src/entities/friends.entity';
import { FriendsModule } from 'src/friends/friends.module'
import { FriendsController } from 'src/friends/friends.controller';
import { FriendsService } from 'src/friends/friends.service';
import { Game } from 'src/entities/games.entity';
import { HistoryModule } from './history/history.module';
import { HistoryController } from './history/history.controller';
import { HistoryService } from './history/history.service';
import { Channel } from 'diagnostics_channel';
import { Message } from './entities/message.entity';
import { BlockedUser } from './entities/blocked_user.entity';
import { ChannelUser } from './entities/channel_user.entity';
import { StatusController } from './status/status.controller';
import { StatusService } from './status/status.service';
import { StatusModule } from './status/status.module';

@Module({
  imports: [ ConfigModule.forRoot(),TypeOrmModule.forRoot({
    type: 'postgres', // Replace with your database type
    host: process.env.dbHost, // Replace with your database host
    port: parseInt(process.env.dbPort, 10), // Replace with your database port
    username: process.env.dbUser,
    password: process.env.dbPass,
    database: process.env.dbName,
    entities: ['dist/**/*.entity.js'], // Automatically load entity classes
    synchronize: true, // Auto-create database schema (in development)
  }),

  TypeOrmModule.forFeature([User, Friend, Game, Channel, Message, BlockedUser, ChannelUser, ])
    ,AuthModule, UserModule, EditModule, FriendsModule, HistoryModule, MessagesModule, StatusModule],
  controllers: [AppController, EditController, UploadController, FriendsController, HistoryController, StatusController],
  providers: [AppService, EditService, UploadService, FriendsService, HistoryService, StatusService],


})
export class AppModule {}
