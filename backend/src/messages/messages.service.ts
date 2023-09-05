import { Injectable } from '@nestjs/common';
import { Message } from '../entities/message.entity';
import { User } from '../entities/user.entity';
import { Channel } from '../entities/channel.entity';
import { ChannelUser } from '../entities/channel_user.entity';
// import { BlockedUser } from '../../db/saveforlater/blocked_user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logger } from '@nestjs/common';
// import { mapMessageToDto } from './helpers/helpers';
import { SendMessageDto } from './dto/send-message.dto';
import { SendUserDto } from './dto/send-user.dto';
import { Game } from '../entities/games.entity';
import { Friend } from '../entities/friends.entity';
import { mapUserToDto, mapMessageToDto, mapChannelToDto, mapChannelUserToDto } from './helpers/helpers';
import { Server, Socket } from 'socket.io';
import { SendChannelDto } from './dto/send-channel.dto';
import { BlockedUser } from '../entities/blocked_user.entity';
import { MessagesGateway } from './messages.gateway';
import e from 'express';
import { get } from 'http';
import { SendChannelUserDto } from './dto/send-channelUser';


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





    async getPuplicChannelsDto(): Promise<SendChannelDto[]> {
      const channels = await this.channelRepository.find({ where: { private_channel: false }, });
      const channelsDto = channels.map(mapChannelToDto);
      return channelsDto;
    }

    async getUserChannelsDto(user: User): Promise<SendChannelDto[]> {
      const channels = await this.getUserChannels(user);
      const channelsDto = channels.map(mapChannelToDto);
      return channelsDto;
    }

    async getBlockedUsersDto(user: User): Promise<SendUserDto[]> {
      user = await this.userRepository.findOne({ where: { id_42: user.id_42 }, relations: ["blockedUsers", "blockedByUser"],  });
      const blockedUsers = await this.getBlockedUsers(user);
      const blockedUsersDto = blockedUsers.map(mapUserToDto);
      return blockedUsersDto;
    }

    async updateSocketId(user: SendUserDto, socket_id: string) {
      let userOut = await this.userRepository.findOne({ where: { id_42: user.id_42 }, relations:["channelUsers", "channelUsers.channel", "blockedUsers", "blockedUsers.blockedUser"]});
      if (userOut) {
        userOut.socket_id = socket_id;
        await this.userRepository.save(userOut);
      }
      return userOut;
    }

    validateChannelName(channel: SendChannelDto): boolean {
      const channelName = channel.name.trim();
      if (channelName === '' || !channel) {
          throw new Error('Channel name cannot be empty');
      }
      if (channelName.length > 10) {
          throw new Error('Channel name cannot be longer than 10 characters');
      }
  
      const lettersOnlyRegex = /^[A-Za-z]+$/;
      if (!lettersOnlyRegex.test(channelName)) {
          throw new Error('Channel name can only contain letters');
      }
      return true;
  }


async createNewChannel(channelDto: SendChannelDto, user: User): Promise<Channel> {
  let channel = await this.channelRepository.findOne({ where: { name: channelDto.name } });
  if (channel) {
    throw new Error('Channel already exists');
  }
  channel = this.channelRepository.create({ name: channelDto.name, private_channel: channelDto.private_channel, pw_hashed: channelDto.password, });
  await this.channelRepository.save(channel);
  channel = await this.channelRepository.findOne({ where: { name: channel.name },
    relations: ["channelUsers", "channelUsers.user", "channelUsers.channel", ],});
 return channel;
  }


  getSocketForUser(user: User, server: Server, check: boolean): Socket {
    const socket = server.sockets.sockets.get(user.socket_id);
    if (!socket && check) {
      throw new Error('Socket not found');
    }
    return socket;
  }


  async addUserToChannel(user: User, channel: Channel, server: Server){
  let newInChannel = !channel.channelUsers.some(cu => cu.user.id_42 === user.id_42);
  if (!newInChannel) {
    throw new Error('User already in channel');
  }
    const channelUser = this.channelUserRepository.create({ user: user, channel: channel,  });
    if (channel.channelUsers.length === 0)//first user in channel
    {
      channelUser.owner = true;
      channelUser.admin = true;
    }
    await this.channelUserRepository.save(channelUser);
    const client = this.getSocketForUser(user, server, true);

    client.join(channel.name);
    this.sendJoinedChannelMessage(channel, user, client);
  }


  async findChannel(channeldto: SendChannelDto): Promise<Channel> {
    const channel = await this.channelRepository.findOne({ where: { name: channeldto.name }, relations: ["channelUsers", "channelUsers.user", "channelUsers.channel", ], });
    if (!channel) {
      throw new Error('Channel not found');
    }
    if (channel.pw_hashed) {
      if (channeldto.password !== channel.pw_hashed) {
        throw new Error('Wrong password');
      }
    }
      return channel;
    }

    async deleteAllUsersFromChannel(channel: Channel) {
      await this.channelUserRepository.delete({ channel: channel });
    }

    async leaveChannel(user: User, channelDto: SendChannelDto, server: Server) {
      const channel = await this.channelRepository.findOne({ where: { name: channelDto.name }, relations: ["channelUsers", "channelUsers.user", "channelUsers.channel"], });
      if (!channel) {
        throw new Error('Channel not found');
      }
      if (channel.direct_message === true) {
        await this.deleteAllUsersFromChannel(channel);
        await this.channelRepository.delete(channel.id);
        return;
      }
      if (channel.channelUsers.length === 1) {
         await this.channelUserRepository.delete({ user: user, channel: channel });
         await this.channelRepository.delete(channel.id);
       }
       else {
         this.updateChannelOwner(channel, user);
          const client = this.getSocketForUser(user, server, true);
         this.sendLeftChannelMessage(channel, user, client);
         await this.channelUserRepository.delete({ user: user, channel: channel });
     }
     }

     async updateChannelOwner(channel: Channel, user: User) {
      let channelOwner = channel.channelUsers.find(cu => cu.owner === true);
      if (!channelOwner)
        return;
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
       const dtoMessage = mapMessageToDto(message);
       client.to(channel.name).emit('message', dtoMessage); 
     }

     async addUserToBlockList(user: User, toBlockUserDto: SendUserDto) {
      const userToBlock = await this.userRepository.findOne({ where: { name: toBlockUserDto.name } });
      if (!userToBlock) {
        throw new Error('User to block not found');
      }
      user = await this.userRepository.findOne({ where: { id_42: user.id_42 }, relations: ["blockedUsers", "blockedByUser"], });
      if (user && userToBlock) {
        let newInBlockList = !user.blockedByUser.some(bu => bu.blockedUser.id_42 === userToBlock.id_42);
        if (!newInBlockList) {
          throw new Error('User already in block list');
        }
          const blockedUser = this.blockedUserRepository.create({ blockedByUser: user, blockedUser: userToBlock });
          await this.blockedUserRepository.save(blockedUser);
          return user;
      }
    }


    async removeUserFromBlockList(user: User, toUnblockUserDto: SendUserDto) {
      const userToUnblock = await this.userRepository.findOne({ where: { name: toUnblockUserDto.name } });
      if (!userToUnblock)
        throw new Error('User to unblock not found');
      user = await this.userRepository.findOne({ where: { id_42: user.id_42 }, relations: ["blockedUsers", "blockedByUser"], });
      if (!user) 
        throw new Error('User not found');
      const blockedUser = await this.blockedUserRepository.findOne({ 
          where: { 
              blockedByUser: { id_42: user.id_42 }, 
              blockedUser: { id_42: userToUnblock.id_42 }
          }, relations: ["blockedUser", "blockedByUser"] 
      });
      if (!blockedUser) 
        throw new Error('User was not blocked');
      await this.blockedUserRepository.delete(blockedUser.id);
      return user;
    }
    





    






































   async createNewMessage(messageDto: SendMessageDto, server: Server ): Promise<Message> {
    const user = await this.userRepository.findOne({ where: { id_42: messageDto.owner_id } });
    const channel = await this.channelRepository.findOne({ where: { id: messageDto.channel_id } });
    if (channel && user) {
      let message = this.messageRepository.create({ content: messageDto.content, owner: user, channel: channel, isSystemMessage: messageDto.isSystemMessage });
      await this.messageRepository.save(message);
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


async createPrivateChat(user: User, toChatUserDto: SendUserDto, server: Server) {
  const toChatUser = await this.userRepository.findOne({ where: { name: toChatUserDto.name }, relations: ["channelUsers", "channelUsers.user", "channelUsers.channel","channelUsers.channel.channelUsers" , ], });
  if (!toChatUser)
    throw new Error('User to chat with not found');
  let channelIsPresent = toChatUser.channelUsers.find(cu => cu.channel.private_channel === true && cu.channel.channelUsers.some(cu => cu.user.id_42 === user.id_42));
  if (channelIsPresent)
    throw new Error('Private chat already exists');
  const name = `${user.name}-${toChatUser.name}`;
  let channel = this.channelRepository.create({ name: name, private_channel: true, direct_message: true });
  await this.channelRepository.save(channel);
  channel = await this.channelRepository.findOne({ where: { name: channel.name }, relations: ["channelUsers", "channelUsers.user", "channelUsers.channel"], });
  if (!channel)
    throw new Error('Channel not found');
  const client = this.getSocketForUser(user, server, true);
  await this.addUsersToPrivateChat(user, toChatUser, channel, client);
  return channel;
}


async addUsersToPrivateChat(user: User, toChatUser: User, channel: Channel, client: Socket) {
  let channelUser = this.channelUserRepository.create({ user: user, channel: channel, owner: true, admin: true });
  await this.channelUserRepository.save(channelUser);
  channelUser = this.channelUserRepository.create({ user: toChatUser, channel: channel, owner: false, admin: true });
  await this.channelUserRepository.save(channelUser);
  client.join(channel.name);
  this.sendUserChannels(user, client);
}
  
async setPassword(user: User, channelDto: SendChannelDto, server: Server) {
  const channel = await this.channelRepository.findOne({ where: { name: channelDto.name }, relations: ["channelUsers", "channelUsers.user",], });
  if (!channel)
    throw new Error('Channel not found');
  const channelUser = channel.channelUsers.find(cu => cu.user.id_42 === user.id_42);
  if (!channelUser)
    throw new Error('User not in channel');
  if (!channelUser.owner)
    throw new Error('User not owner of channel');
  if (channel.direct_message === true)
    throw new Error('Cannot set password for direct message');
  channel.pw_hashed = channelDto.password;
  channel.private_channel = true;
  await this.channelRepository.save(channel);
  const client = this.getSocketForUser(user, server, true);
  this.sendInfoMessage(channel, user, client, 'owner set new password');
  return channel;
}

async sendInfoMessage(channel: Channel, user: User, client: Socket, content: string) {
let message = this.messageRepository.create({ content: content, owner: user, channel: channel, isSystemMessage: true });
this.messageRepository.save(message);
const dtoMessage = mapMessageToDto(message);
client.to(channel.name).emit('message', dtoMessage);
}


async getChannelUsersDto(channel: Channel) {
  channel = await this.channelRepository.findOne({ where: { name: channel.name }, relations: ["channelUsers", "channelUsers.user",], });
  const channelUsersDto = channel.channelUsers.map(mapChannelUserToDto);
  return channelUsersDto;
}

async promoteUser(user: User, toPromoteUserDto: SendUserDto, channelDto: SendChannelDto, server: Server) {
  const channel = await this.channelRepository.findOne({ where: { name: channelDto.name }, relations: ["channelUsers", "channelUsers.user",], });
  if (!channel)
    throw new Error('Channel not found');
  const channelUser = channel.channelUsers.find(cu => cu.user.id_42 === user.id_42);
  if (!channelUser)
    throw new Error('User not in channel');
  if (!channelUser.owner)
    throw new Error('User not owner of channel');
  const toPromoteUser = await this.userRepository.findOne({ where: { name: toPromoteUserDto.name }, });
  if (!toPromoteUser)
    throw new Error('User to promote not found');
  const toPromoteChannelUser = channel.channelUsers.find(cu => cu.user.id_42 === toPromoteUser.id_42);
  if (!toPromoteChannelUser)
    throw new Error('User to promote not in channel');
  if (toPromoteChannelUser.owner)
    throw new Error('User already owner of channel');
  toPromoteChannelUser.admin = true;
  await this.channelUserRepository.save(toPromoteChannelUser);
  const client = this.getSocketForUser(user, server, true);
  this.sendInfoMessage(channel, user, client, `${toPromoteUser.name} was promoted to admin`);
  this.updateChannelUserforChannel(channel, user, client);
  return channel;
}

async updateChannelUserforChannel(channel: Channel, user: User, client: Socket) {
  const channelUsersDto = await this.getChannelUsersDto(channel);
  client.to(channel.name).emit('channelUsers', channelUsersDto);
}


































async getChannelMessages(channel: Channel, client: Socket)  {
    const messages = await this.messageRepository.find({ where: { channel: { id: channel.id } }, relations: ['channel'],   order: {created_at: 'ASC'} });
    const messagesDto = messages.map(mapMessageToDto);
    client.emit('ChannelMessages', messagesDto); // Send all messages of the channel to the user
}




async sendJoinedChannelMessage(channel: Channel, user: User, client: Socket) {
  let message = this.messageRepository.create({ content: `${user.name} joined the channel`, owner: user, channel: channel, isSystemMessage: true });
  await this.messageRepository.save(message);
  const dtoMessage = mapMessageToDto(message);
  client.to(channel.name).emit('message', dtoMessage);
}

async sendChannelInfo(channel: Channel, client: Socket) {
  const channelDto = mapChannelToDto(channel);
  client.emit('channelInfo', channelDto);
  const channelUsersDto = await this.getChannelUsersDto(channel);
  client.to(channel.name).emit('channelUsers', channelUsersDto);
}

async getUserChannels(user: User) : Promise<Channel[]> {
  let userOut = await this.userRepository.findOne({ where: { id_42: user.id_42 }, relations: ["channelUsers", "channelUsers.user", "channelUsers.channel"], });
  const channels = userOut?.channelUsers.map(cu => cu.channel);
  return channels;
}

async sendUserChannels(user: User, client: Socket) : Promise<SendChannelDto[]> {
  const channels = await this.getUserChannels(user);
  const channelsDto = channels.map(mapChannelToDto);
  client.emit('userChannels', channelsDto);
  return channelsDto;
}




async getBlockedUsers(user: User): Promise<User[]>{
  user = await this.userRepository.findOne({ where: { id_42: user.id_42 }, relations: ["blockedUsers", "blockedByUser"],  });
  const blockedUsersList = user?.blockedByUser.map(blockedUserEntry => blockedUserEntry.blockedUser);
  return blockedUsersList;
}

async sendBlockedUsers(user: User, client: Socket) {
  const blockedUser = await this.getBlockedUsers(user);
  const blockedUserDto = blockedUser.map(mapUserToDto);
  client.emit('blockedUsers', blockedUserDto);
}
}
