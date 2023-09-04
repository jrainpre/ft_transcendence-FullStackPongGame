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
  // import { mapMessageToDto, mapChannelToDto, mapUserToDto } from './helpers/helpers';
import { Send } from 'express';
import { SendUserDto } from './dto/send-user.dto copy';
import { SendChannelDto } from './dto/send-channel.dto';
// import { mapMessageToDto } from './helpers/helpers';
import { mapChannelToDto, mapUserToDto } from './helpers/helpers';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from 'src/entities/message.entity';



  
  @WebSocketGateway({
    cors: {
      origin: '*',
      },
    })
    @Injectable()
      export class MessagesGateway implements OnGatewayDisconnect {
        private readonly logger = new Logger(WebSocketGateway.name);
        @WebSocketServer()
        server: Server;
        



      constructor(private readonly messagesService: MessagesService) {}
  

      @SubscribeMessage('createMessage')
      async createMessage(@MessageBody('message') messageDto: SendMessageDto,) {
        const message = await this.messagesService.createNewMessage(messageDto, this.server);
      }




      @SubscribeMessage('identifyUser')
      async identifyUser(@MessageBody('user') userIn: SendUserDto, @ConnectedSocket() client: Socket, ) {
        const user = await this.messagesService.identify(userIn, client.id);
        const channel = await this.messagesService.joinChannels(user, client);
        const blockedUser = await this.messagesService.updateBlockedUsers(user, client);
        const userDto = mapUserToDto(user);
        client.emit('identifyDone', userDto);
        await this.messagesService.sendUserChannels(user, client);
      }

      @SubscribeMessage('selectChannel')
      async selectChannel(@MessageBody('channel') channelDto: SendChannelDto, @ConnectedSocket() client: Socket, ) {
        const channel = await this.messagesService.getChannel(channelDto);
        await this.messagesService.getChannelMessages(channel, client);
        await this.messagesService.sendChannelInfo(channel, client);
      }







 
      
      // @SubscribeMessage('typing')
      // async typing(
      // @MessageBody('isTyping') isTyping: boolean,
      // @MessageBody('channelName') channelName: string,
      // @ConnectedSocket() client: Socket
      // ) {
      //   const name = await this.messagesService.getClientByClientId(client.id);
      //   client.broadcast.to(channelName).emit('typing', {name: name, isTyping: isTyping, channelName: channelName});
      // }
      

      // @SubscribeMessage('createOrJoinChannel')
      // async createChannel(@MessageBody('channel') channelDto: SendChannelDto, @ConnectedSocket() client: Socket,) {
      //   if (this.messagesService.isPrivateChannel(channelDto)) {
      //   let channel = await this.messagesService.getChannel(channelDto);
      //   const user = await this.messagesService.getClientBySocketId(client.id);
      //   await this.messagesService.addUserToChannel(user, channel, client);
      //   await this.messagesService.getChannelMessages(channel, client);
      //   channelDto = mapChannelToDto(channel);
      //   client.emit('channelInfo', channelDto);
      //   await this.messagesService.sendUserChannels(user, client);
      //   }
      // }

    
      @SubscribeMessage('blockUser')
      async blockUser(@MessageBody("toBlockUser") toBlockUserDto: SendUserDto, @ConnectedSocket() client: Socket ){
        const user = await this.messagesService.getClientBySocketId(client.id);
        await this.messagesService.addUserToBlockList(user, toBlockUserDto);
        await this.messagesService.sendBlockedUsers(user, client);
      }

      @SubscribeMessage('unblockUser')
      async unblockUser(@MessageBody("toUnblockUser") toUnblockUserDto: SendUserDto, @ConnectedSocket() client: Socket ){
        const user = await this.messagesService.getClientBySocketId(client.id);
        await this.messagesService.removeUserFromBlockList(user, toUnblockUserDto);
        await this.messagesService.sendBlockedUsers(user, client);
      }

      @SubscribeMessage('updateSocketId')
      async updateSocketId(@MessageBody('user') userDto: SendUserDto,@ConnectedSocket() client: Socket,) {
        const user = await this.messagesService.updateSocketId(userDto, client.id);
        const channel = await this.messagesService.joinChannels(user, client);
      }


      
      
      async handleDisconnect(client: Socket) {
     
      }
    }
