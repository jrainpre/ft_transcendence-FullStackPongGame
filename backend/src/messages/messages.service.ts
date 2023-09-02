import { Injectable } from '@nestjs/common';
import { Message } from './entities/message.entity';
import { User } from './entities/user.entity';
import { Channel } from './entities/channel.entity';
import { ChannelUser } from './entities/channel_user.entity';
// import { BlockedUser } from '../../db/saveforlater/blocked_user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
// import { mapMessageToDto } from './helpers/helpers';
import { SendMessageDto } from './dto/send-message.dto';
import { SendUserDto } from './dto/send-user.dto copy';
import { Game } from './entities/games.entity';
import { Friend } from './entities/friends.entity';
import { mapUserToDto, mapMessageToDto, mapChannelToDto } from './helpers/helpers';
import { Server, Socket } from 'socket.io';
import { SendChannelDto } from './dto/send-channel.dto';
import { BlockedUser } from './entities/blocked_user.entity';
import { MessagesGateway } from './messages.gateway';
import e from 'express';


@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    @InjectRepository(Message)
    readonly messageRepository: Repository<Message>,

    @InjectRepository(User)
    readonly userRepository: Repository<User>,

    @InjectRepository(Channel)
     readonly channelRepository: Repository<Channel>,

    @InjectRepository(Game)
    readonly gameRepository: Repository<Game>,

    @InjectRepository(Friend)
    readonly friendRepository: Repository<Friend>,

    @InjectRepository(ChannelUser)
    readonly channelUserRepository: Repository<ChannelUser>,

    @InjectRepository(BlockedUser)
    readonly blockedUserRepository: Repository<BlockedUser>,

  ) {}




   async createNewMessage(messageDto: SendMessageDto, server: Server ): Promise<Message> {
    const user = await this.userRepository.findOne({ where: { id_42: messageDto.owner_id } });
    const channel = await this.channelRepository.findOne({ where: { id: messageDto.channel_id } });
    if (channel && user) {
      let message = this.messageRepository.create({ content: messageDto.content, owner: user, channel: channel, isSystemMessage: messageDto.isSystemMessage });
      await this.messageRepository.save(message);
      message = await this.messageRepository.findOne({ where: { id: message.id }, relations: ['owner'] });
      const dtoMessage = mapMessageToDto(message);
      server.to(message.channel.name).emit('message', dtoMessage);
      return message;
    }

    }

   



    async identify(userIn: SendUserDto, socket_id: string) {
    let user = await this.userRepository.findOne({ where: { id_42: userIn.id_42 }, relations: ["channelUsers", "channelUsers.channel", "blockedUsers", "blockedUsers.blockedUser"],});
    if (!user) {
      user = this.userRepository.create({ id_42: userIn.id_42, name: userIn.name });
    }
    user.socket_id = socket_id;
    await this.userRepository.save(user);   
    user = await this.userRepository.findOne({ where: { id_42: userIn.id_42 },
       relations: ["channelUsers", "channelUsers.channel", "blockedUsers", "blockedUsers.blockedUser"],});
    return user; 
  }
  

  async joinChannels(user: User, client: Socket) {
    const channels = user?.channelUsers.map(cu => cu.channel);
    client.join(channels.map(c => c.name));
    return channels;
  }

  async updateBlockedUsers(user: User, client: Socket) {
    const blockedUsersList = user?.blockedUsers.map(blockedUserEntry => blockedUserEntry.blockedUser);
    const blockedUsersDto = blockedUsersList?.map(mapUserToDto);
    client.emit('blockedUsers', blockedUsersDto);
    return blockedUsersList;
  }


  async getClientBySocketId(socket_id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { socket_id } });
    return user;
  }

  async getChannel(channelDto: SendChannelDto): Promise <Channel> {
    let channel = await this.channelRepository.findOne({ where: { name: channelDto.name } });
    if (!channel) {
      channel = this.channelRepository.create({ name: channelDto.name });
      await this.channelRepository.save(channel);
    }
    channel = await this.channelRepository.findOne({ where: { name: channel.name },
       relations: ["channelUsers", "channelUsers.user", "channelUsers.channel", ],});
    return channel;
}

async isPrivateChannel(channelDto: SendChannelDto): Promise <boolean> {
  let channel = await this.channelRepository.findOne({ where: { name: channelDto.name, private_channel: true } });
  if (channel) {
    return true;
  }else {
    return false;
  }
}


async createPrivateChat(user: User, toChatUserDto: SendUserDto, client: Socket) {
  const toChatUser = await this.userRepository.findOne({ where: { name: toChatUserDto.name }, relations: ["channelUsers", "channelUsers.user", "channelUsers.channel","channelUsers.channel.channelUsers" , ], });
  if (toChatUser) {
    let channelIsPresent = toChatUser.channelUsers.find(cu => cu.channel.private_channel === true && cu.channel.channelUsers.some(cu => cu.user.id_42 === user.id_42));
    if (!channelIsPresent) {
      const name = `${user.name}-${toChatUser.name}`;
      let channel = this.channelRepository.create({ name: name, private_channel: true });
      await this.channelRepository.save(channel);
      channel = await this.channelRepository.findOne({ where: { name: channel.name }, relations: ["channelUsers", "channelUsers.user", "channelUsers.channel"], });
      await this.addUsersToPrivateChat(user, toChatUser, channel, client);

    }
  }
}


async addUsersToPrivateChat(user: User, toChatUser: User, channel: Channel, client: Socket) {
  let channelUser = this.channelUserRepository.create({ user: user, channel: channel, owner: true, admin: true });
  await this.channelUserRepository.save(channelUser);
  channel.channelUsers.push(channelUser);
  channelUser = this.channelUserRepository.create({ user: toChatUser, channel: channel, owner: false, admin: true });
  await this.channelUserRepository.save(channelUser);
  client.join(channel.name);
  this.sendUserChannels(user, client);
  }
  

async addUserToChannel(user: User, channel: Channel, client: Socket) {
  let newInChannel = !channel.channelUsers.some(cu => cu.user.id_42 === user.id_42);
  if (newInChannel) {
    const channelUser = this.channelUserRepository.create({ user: user, channel: channel,  });
    if (channel.channelUsers.length === 0)//first user in channel
    {
      channelUser.owner = true;
      channelUser.admin = true;
    }
    await this.channelUserRepository.save(channelUser);
    channel.channelUsers.push(channelUser);
      await this.channelRepository.save(channel);
      client.join(channel.name);
      this.sendJoinedChannelMessage(channel, user, client);
   }
  }

async getChannelMessages(channel: Channel, client: Socket)  {
    const messages = await this.messageRepository.find({ where: { channel: { id: channel.id } }, relations: ['channel'],   order: {created_at: 'ASC'} });
    const messagesDto = messages.map(mapMessageToDto);
    client.emit('ChannelMessages', messagesDto); // Send all messages of the channel to the user
}

async leaveChannel(user: User, channelDto: SendChannelDto, client: Socket) {
 const channel = await this.channelRepository.findOne({ where: { name: channelDto.name }, relations: ["channelUsers", "channelUsers.user", "channelUsers.channel"], });
  if (channel.channelUsers.length === 1) {
    await this.channelUserRepository.delete({ user: user, channel: channel });
    await this.channelRepository.delete(channel.id);
  }
  else {
    this.updateChannelOwner(channel, user);
    this.sendLeftChannelMessage(channel, user, client);
    await this.channelUserRepository.delete({ user: user, channel: channel });
}
  await this.sendUserChannels(user, client);
}

async updateChannelOwner(channel: Channel, user: User) {
 let channelOwner = channel.channelUsers.find(cu => cu.owner === true);
  if (channelOwner.user.id_42 === user.id_42) {
    const newOwner = channel.channelUsers.find(cu => cu.user.id_42 !== user.id_42);
    if (newOwner) {
      newOwner.owner = true;
      await this.channelUserRepository.save(newOwner);
    }
  }
}

async sendLeftChannelMessage(channel: Channel, user: User, client: Socket) {
  let message = this.messageRepository.create({ content: `${user.name} left the channel`, owner: user, channel: channel, isSystemMessage: true });
  await this.messageRepository.save(message);
  message = await this.messageRepository.findOne({ where: { id: message.id }, relations: ['owner'] });
  const dtoMessage = mapMessageToDto(message);
  client.to(channel.name).emit('message', dtoMessage); 

}

async sendJoinedChannelMessage(channel: Channel, user: User, client: Socket) {
  let message = this.messageRepository.create({ content: `${user.name} joined the channel`, owner: user, channel: channel, isSystemMessage: true });
  await this.messageRepository.save(message);
  message = await this.messageRepository.findOne({ where: { id: message.id }, relations: ['owner'] });
  const dtoMessage = mapMessageToDto(message);
  client.to(channel.name).emit('message', dtoMessage);
}

async sendChannelInfo(channel: Channel, client: Socket) {
  const channelDto = mapChannelToDto(channel);
  client.emit('channelInfo', channelDto);
}

async getUserChannels(user: User, client: Socket) : Promise<Channel[]> {
  let userOut = await this.userRepository.findOne({ where: { id_42: user.id_42 }, relations: ["channelUsers", "channelUsers.user", "channelUsers.channel"], });
  const channels = userOut?.channelUsers.map(cu => cu.channel);
  return channels;
}

async sendUserChannels(user: User, client: Socket) : Promise<SendChannelDto[]> {
  const channels = await this.getUserChannels(user, client);
  const channelsDto = channels.map(mapChannelToDto);
  client.emit('userChannels', channelsDto);
  return channelsDto;
}


async addUserToBlockList(user: User, toBlockUserDto: SendUserDto) {
  const userToBlock = await this.userRepository.findOne({ where: { name: toBlockUserDto.name } });
  user = await this.userRepository.findOne({ where: { id_42: user.id_42 }, relations: ["blockedUsers", "blockedByUser"], });
  if (user && userToBlock) {
    let newInBlockList = !user.blockedByUser.some(bu => bu.blockedUser.id_42 === userToBlock.id_42);
    if (newInBlockList) {
      const blockedUser = this.blockedUserRepository.create({ blockedByUser: user, blockedUser: userToBlock });
      await this.blockedUserRepository.save(blockedUser);

    }
  }
}

async removeUserFromBlockList(user: User, toUnblockUserDto: SendUserDto) {
  const userToUnblock = await this.userRepository.findOne({ where: { name: toUnblockUserDto.name } });
  user = await this.userRepository.findOne({ where: { id_42: user.id_42 }, relations: ["blockedUsers", "blockedByUser"], });
  if (user && userToUnblock) {
    const blockedUser = await this.blockedUserRepository.findOne({ 
      where: { 
          blockedByUser: { id_42: user.id_42 }, 
          blockedUser: { id_42: userToUnblock.id_42 }
      }, 
      relations: ["blockedUser", "blockedByUser"] 
  });
  if (blockedUser) {
    await this.blockedUserRepository.delete(blockedUser.id);
  }
}
}

async getBlockedUsers(user: User, client: Socket): Promise<User[]>{
  user = await this.userRepository.findOne({ where: { id_42: user.id_42 }, relations: ["blockedUsers", "blockedByUser"],  });
  const blockedUsersList = user?.blockedByUser.map(blockedUserEntry => blockedUserEntry.blockedUser);
  return blockedUsersList;
}

async sendBlockedUsers(user: User, client: Socket) {
  const blockedUser = await this.getBlockedUsers(user, client);
  const blockedUserDto = blockedUser.map(mapUserToDto);
  client.emit('blockedUsers', blockedUserDto);
}

}
