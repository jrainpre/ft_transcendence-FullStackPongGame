import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayDisconnect,
  } from '@nestjs/websockets';
import { MessagesService } from './messages.service';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { SendMessageDto } from './dto/send-message.dto';
import { log } from 'console';
import { Send } from 'express';
import { SendUserDto } from './dto/send-user.dto';
import { SendChannelDto } from './dto/send-channel.dto';
import { mapChannelToDto, mapUserToDto } from './helpers/helpers';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from 'src/entities/message.entity';
import { LobbyService } from '../game/services/lobby/lobby.service';
// import { mapMessageToDto } from './helpers/helpers';
// import { mapMessageToDto, mapChannelToDto, mapUserToDto } from './helpers/helpers';

  @WebSocketGateway({
    cors: {
      origin: '*',
      },
    })
    @Injectable()
      export class MessagesGateway implements OnGatewayDisconnect {
        private readonly logger = new Logger(WebSocketGateway.name);
        // @WebSocketServer()
        // server: Server;
        
      constructor(private readonly messagesService: MessagesService, public lobbyManager: LobbyService) {}
  

      @SubscribeMessage('createMessage')
      async createMessage(@MessageBody('message') messageDto: SendMessageDto,) {
        const message = await this.messagesService.createNewMessage(messageDto, this.lobbyManager.server);
      }

      @SubscribeMessage('updateSocketId')
      async updateSocketId(@MessageBody('user') userDto: SendUserDto,@ConnectedSocket() client: Socket,) {
        const user = await this.messagesService.updateSocketId(userDto, client.id);
        const channel = await this.messagesService.joinChannels(user, client);
      }
      
      async handleDisconnect(client: Socket) {}
    }
