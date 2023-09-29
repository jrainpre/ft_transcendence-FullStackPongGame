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
import { Games } from '../entities/games.entity';
import { Friend } from '../entities/friends.entity';
import { mapUserToDto, mapMessageToDto, mapChannelToDto, mapChannelUserToDto } from './helpers/helpers';
import { Server, Socket } from 'socket.io';
import { SendChannelDto } from './dto/send-channel.dto';
import { BlockedUser } from '../entities/blocked_user.entity';
import * as bcrypt from 'bcrypt';
import { UserStatus } from '../entities/user.entity';
import { ColumnNumericOptions } from 'typeorm/decorator/options/ColumnNumericOptions';
import { Send } from 'express';
import { get } from 'http';


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

    @InjectRepository(Games)
    readonly gameRepository: Repository<Games>,

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
    user = await this.userRepository.findOne({ where: { id_42: user.id_42 }, relations: ["blockedUsers", "blockedByUser"], });
    const blockedUsers = await this.getBlockedUsers(user);
    const blockedUsersDto = blockedUsers.map(mapUserToDto);
    return blockedUsersDto;
  }

  async updateSocketId(user: SendUserDto, socket_id: string, server: Server) {
    let userOut = await this.userRepository.findOne({ where: { id_42: user.id_42 }, relations: ["channelUsers", "channelUsers.channel", "blockedUsers", "blockedUsers.blockedUser"] });
    if (!userOut)
    {
      return null;
    }
    if (socket_id === userOut.socket_id)
      return userOut;
    const socket = this.getSocketForUser(userOut, server, false);
    if (socket)
    {
      server.to(socket_id).emit('userAlreadyConnected');
      return null;
    }
    if (userOut) {
      userOut.socket_id = socket_id;
      await this.userRepository.save(userOut);
      return userOut;
    }
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


  async createPasswordHash(password: string): Promise<string> {
    const salt = await bcrypt.genSaltSync(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  }

async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}



  async createNewChannel(channelDto: SendChannelDto, user: User): Promise<Channel> {
    let channel = await this.channelRepository.findOne({ where: { name: channelDto.name } });
    if (channel) {
      throw new Error('Channel already exists');
    }
    if (channelDto.name.match(/^[a-zA-Z0-9 ]*$/) === null)
      throw new Error('Channel name should only contain alphabets and numbers');
    channelDto.password = await this.createPasswordHash(channelDto.password);
    channel = this.channelRepository.create({ name: channelDto.name, private_channel: channelDto.private_channel, pw_hashed: channelDto.password, });
    await this.channelRepository.save(channel);
    channel = await this.channelRepository.findOne({
      where: { name: channel.name },
      relations: ["channelUsers", "channelUsers.user", "channelUsers.channel",],
    });
    return channel;
  }


  getSocketForUser(user: User, server: Server, check: boolean): Socket {
    const socket = server.sockets.sockets.get(user.socket_id);
    if (!socket && check) {
      throw new Error('Socket not found');
    }
    return socket;
  }



  async addUserToChannel(user: User, channel: Channel, server: Server) {

    let isBanned = channel.channelUsers.some(cu => cu.user.id_42 === user.id_42 && cu.banned);
    if (isBanned)
      throw new Error('User is banned from channel');
    let newInChannel = !channel.channelUsers.some(cu => cu.user.id_42 === user.id_42);
    if (!newInChannel)
      throw new Error('User already in channel');
    const channelUser = this.channelUserRepository.create({ user: user, channel: channel, });
    if (channel.channelUsers.length === 0)//first user in channel
    {
      channelUser.owner = true;
      channelUser.admin = true;
    }
    await this.channelUserRepository.save(channelUser);
    const client = this.getSocketForUser(user, server, true);

    client.join(channel.name);
    this.sendJoinedChannelMessage(channel, user, server);
  }


  findChannelNoThrow(channeldto: SendChannelDto): Promise<Channel> {
    return this.channelRepository.findOne({ where: { name: channeldto.name }, relations: ["channelUsers", "channelUsers.user", "channelUsers.channel",], });
  }

  async findChannel(channeldto: SendChannelDto, pw_check: boolean): Promise<Channel> {
    const channel = await this.channelRepository.findOne({ where: { name: channeldto.name }, relations: ["channelUsers", "channelUsers.user", "channelUsers.channel",], });
    if (!channel) {
      throw new Error('Channel not found');
    }
    if (channel.pw_hashed && pw_check === true) {
      if (await this.comparePasswords(channeldto.password, channel.pw_hashed) === false)
        throw new Error('Wrong password');
    }
    return channel;
  }

  async deleteAllUsersFromChannel(channel: Channel) {
    await this.channelUserRepository.delete({ channel: channel });
  }

  async leaveChannel(user: User, channelDto: SendChannelDto, server: Server) {
    let channel = await this.channelRepository.findOne({ where: { name: channelDto.name }, relations: ["channelUsers", "channelUsers.user", "channelUsers.channel"], });
    if (!channel) {
      throw new Error('Channel not found');
    }
    if (channel.direct_message === true) {
      server.to(channel.name).emit('channelDeleted', channelDto);
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
    
    channel = await this.channelRepository.findOne({ where: { name: channelDto.name }, relations: ["channelUsers", "channelUsers.user", "channelUsers.channel"], });
    if (channel.channelUsers.every(cu => cu.banned)) {
      await this.deleteAllUsersFromChannel(channel);
      await this.channelRepository.delete(channel.id);
      return;
    }
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


  checkIfMuted(channel: Channel, user: User): boolean {
    const channelUser = channel.channelUsers.find(cu => cu.user.id_42 === user.id_42);
    if (channelUser.mute && channelUser.mute > new Date(Date.now()))
      return true;
    else
      return false;
  }

  async createNewMessage(messageDto: SendMessageDto, server: Server): Promise<Message> {
    const user = await this.userRepository.findOne({ where: { id_42: messageDto.owner_id }, relations: ["channelUsers", "channelUsers.channel.channelUsers", "blockedUsers", "blockedUsers.blockedUser"], });
    const channels = user.channelUsers.filter(cu => !cu.banned).map(cu => cu.channel);
    const channel = channels.find(c => c.id === messageDto.channel_id);
    if (channel && user && !this.checkIfMuted(channel, user)) {
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

  async createPrivateChat(user: User, toChatUserDto: SendUserDto, server: Server) {
    const toChatUser = await this.userRepository.findOne({ where: { name: toChatUserDto.name }, relations: ["channelUsers", "channelUsers.user", "channelUsers.channel", "channelUsers.channel.channelUsers",], });
    if (!toChatUser)
      throw new Error('User to chat with not found');
    let channelIsPresent = toChatUser.channelUsers.find(cu => cu.channel.direct_message === true && cu.channel.channelUsers.some(cu => cu.user.id_42 === user.id_42));
    if (channelIsPresent)
      throw new Error('Private chat already exists');
    const name = `${user.name}-${toChatUser.name}`;
    let channel = this.channelRepository.create({ name: name, private_channel: true, direct_message: true });
    await this.channelRepository.save(channel);
    channel = await this.channelRepository.findOne({ where: { name: channel.name }, relations: ["channelUsers", "channelUsers.user", "channelUsers.channel"], });
    if (!channel)
      throw new Error('Channel not found');
    await this.addUsersToPrivateChat(user, toChatUser, channel, server);
    return channel;
  }


  async addUsersToPrivateChat(user: User, toChatUser: User, channel: Channel, server: Server) {
    let channelUser = this.channelUserRepository.create({ user: user, channel: channel, owner: true, admin: true });
    await this.channelUserRepository.save(channelUser);
    channelUser = this.channelUserRepository.create({ user: toChatUser, channel: channel, owner: false, admin: true });
    await this.channelUserRepository.save(channelUser);
    this.addSocketToChannel(channel, user, true, server);
    this.addSocketToChannel(channel, toChatUser, false, server);
  }

  //either the the message gets sent to the channel or the user gets added to the channel, the user that gets added may be offline
  addSocketToChannel(channel: Channel, user: User, ownClient: boolean, server: Server) {
    const client = this.getSocketForUser(user, server, ownClient);
    if (client) {
      client.join(channel.name);
      this.sendUserChannels(user, client);
    }
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
    channelDto.password = await this.createPasswordHash(channelDto.password);
    channel.pw_hashed = channelDto.password;
    channel.private_channel = true;
    if (channel.pw_hashed === null)
      channel.private_channel = false;
    await this.channelRepository.save(channel);
    this.sendInfoMessage(channel, user, server, 'owner set new password');
    return channel;
  }

  async sendInfoMessage(channel: Channel, user: User, server: Server, content: string) {
    let message = this.messageRepository.create({ content: content, owner: user, channel: channel, isSystemMessage: true });
    this.messageRepository.save(message);
    const dtoMessage = mapMessageToDto(message);
    server.to(channel.name).emit('message', dtoMessage);
  }

  async getChannelUsersDto(channel: Channel) {
    channel = await this.channelRepository.findOne({ where: { name: channel.name }, relations: ["channelUsers", "channelUsers.user",], });
    const channelUsers = channel.channelUsers.filter(cu => !cu.banned);
    const channelUsersDto = channelUsers.map(mapChannelUserToDto);
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
    this.sendInfoMessage(channel, user, server, `${toPromoteUser.name} was promoted to admin`);
    const socket = this.getSocketForUser(toPromoteUser, server, false);
    if (socket)
      socket.emit('gotPromoted', channelDto);
    return channel;
  }

  async kickUser(user: User, toKickUserDto: SendUserDto, channelDto: SendChannelDto, server: Server) {
    const channel = await this.channelRepository.findOne({ where: { name: channelDto.name }, relations: ["channelUsers", "channelUsers.user",], });
    if (!channel)
      throw new Error('Channel not found');
    const channelUser = channel.channelUsers.find(cu => cu.user.id_42 === user.id_42);
    if (!channelUser)
      throw new Error('User not in channel');
    if (!channelUser.admin)
      throw new Error('User not admin of channel');
    const toKickUser = await this.userRepository.findOne({ where: { name: toKickUserDto.name }, });
    if (!toKickUser)
      throw new Error('User to kick not found');
    const toKickChannelUser = channel.channelUsers.find(cu => cu.user.id_42 === toKickUser.id_42);
    if (!toKickChannelUser)
      throw new Error('User to kick not in channel');
    if (toKickChannelUser.owner)
      throw new Error('Cannot kick owner of channel');
    await this.channelUserRepository.delete(toKickChannelUser.id);
    this.sendInfoMessage(channel, user, server, `${toKickUser.name} was kicked from channel`);
    const socket = this.getSocketForUser(toKickUser, server, false);
    if (socket)
      socket.emit('gotKicked', channelDto);
      socket.leave(channel.name);
    return channel;
  }

  async banUser(user: User, toBanUserDto: SendUserDto, channelDto: SendChannelDto, server: Server) {
    const channel = await this.channelRepository.findOne({ where: { name: channelDto.name }, relations: ["channelUsers", "channelUsers.user",], });
    if (!channel)
      throw new Error('Channel not found');
    const channelUser = channel.channelUsers.find(cu => cu.user.id_42 === user.id_42);
    if (!channelUser)
      throw new Error('User not in channel');
    if (!channelUser.admin)
      throw new Error('User not admin of channel');
    const toBanUser = await this.userRepository.findOne({ where: { name: toBanUserDto.name }, });
    if (!toBanUser)
      throw new Error('User to ban not found');
    const toBanChannelUser = channel.channelUsers.find(cu => cu.user.id_42 === toBanUser.id_42);
    if (!toBanChannelUser)
      throw new Error('User to ban not in channel');
    if (toBanChannelUser.owner)
      throw new Error('Cannot ban owner of channel');
    toBanChannelUser.banned = true;
    await this.channelUserRepository.save(toBanChannelUser);
    this.sendInfoMessage(channel, user, server, `${toBanUser.name} was banned from channel`);
    const socket = this.getSocketForUser(toBanUser, server, false);
    if (socket)
    {
      socket.leave(channel.name);
      socket.emit('gotBanned', channelDto)
    }
    return channel;
  }

  async muteUser(user: User, toMuteUserDto: SendUserDto, channelDto: SendChannelDto, server: Server) {
    const channel = await this.channelRepository.findOne({ where: { name: channelDto.name }, relations: ["channelUsers", "channelUsers.user",], });
    if (!channel)
      throw new Error('Channel not found');
    const channelUser = channel.channelUsers.find(cu => cu.user.id_42 === user.id_42);
    if (!channelUser)
      throw new Error('User not in channel');
    if (!channelUser.admin)
      throw new Error('User not admin of channel');
    const toMuteUser = await this.userRepository.findOne({ where: { name: toMuteUserDto.name }, });
    if (!toMuteUser)
      throw new Error('User to mute not found');
    const toMuteChannelUser = channel.channelUsers.find(cu => cu.user.id_42 === toMuteUser.id_42);
    if (!toMuteChannelUser)
      throw new Error('User to mute not in channel');
    if (toMuteChannelUser.owner)
      throw new Error('Cannot mute owner of channel');
    toMuteChannelUser.mute = new Date(Date.now() + 3 * 60 * 1000);
    await this.channelUserRepository.save(toMuteChannelUser);
    this.sendInfoMessage(channel, user, server, `${toMuteUser.name} is muted for 3 minutes`);
    const socket = this.getSocketForUser(toMuteUser, server, false);
    if (socket)
      socket.emit('gotMuted', channelDto);
    return channel;
  }

  async inviteUserToGame(user: User, toInviteUserDto: SendUserDto, server: Server) {
    const toInviteUser = await this.userRepository.findOne({ where: { name: toInviteUserDto.name }, relations: ["channelUsers", "channelUsers.user",], });
    if (!toInviteUser)
      throw new Error('User to invite not found');
    const user_socket = this.getSocketForUser(user, server, false);
    if (!user_socket)
      throw new Error('User not connected');
    const toInviteUser_socket = this.getSocketForUser(toInviteUser, server, false);
    if (!toInviteUser_socket)
      throw new Error('User to invite not connected');
    //start game lobby
    //function from marcel that creates a game lobby and takes two users
    //@marcel otdo

  }

  async getChannelMessagesDto(channel: Channel) {
    const messages = await this.messageRepository.find({ where: { channel: { id: channel.id } }, relations: ['channel'], order: { created_at: 'ASC' } });
    const messagesDto = messages.map(mapMessageToDto);
    return messagesDto;
  }

  async sendJoinedChannelMessage(channel: Channel, user: User, server: Server) {
    let message = this.messageRepository.create({ content: `${user.name} joined the channel`, owner: user, channel: channel, isSystemMessage: true });
    await this.messageRepository.save(message);
    const dtoMessage = mapMessageToDto(message);
    server.to(channel.name).emit('message', dtoMessage);
  }

  async sendChannelInfo(channel: Channel, client: Socket) {
    const channelDto = mapChannelToDto(channel);
    client.emit('channelInfo', channelDto);
    const channelUsersDto = await this.getChannelUsersDto(channel);
    client.to(channel.name).emit('channelUsers', channelUsersDto);
  }

  async getUserChannels(user: User): Promise<Channel[]> {
    let userOut = await this.userRepository.findOne({ where: { id_42: user.id_42 }, relations: ["channelUsers", "channelUsers.user", "channelUsers.channel"], });
    const channels = userOut.channelUsers.filter(cu => !cu.banned).map(cu => cu.channel);
    return channels;
  }

  async sendUserChannels(user: User, client: Socket): Promise<SendChannelDto[]> {
    const channels = await this.getUserChannels(user);
    const channelsDto = channels.map(mapChannelToDto);
    client.emit('userChannels', channelsDto);
    return channelsDto;
  }


  async getBlockedUsers(user: User): Promise<User[]> {
    user = await this.userRepository.findOne({ where: { id_42: user.id_42 }, relations: ["blockedUsers", "blockedByUser"], });
    const blockedUsersList = user?.blockedByUser.map(blockedUserEntry => blockedUserEntry.blockedUser);
    return blockedUsersList;
  }

  async sendBlockedUsers(user: User, client: Socket) {
    const blockedUser = await this.getBlockedUsers(user);
    const blockedUserDto = blockedUser.map(mapUserToDto);
    client.emit('blockedUsers', blockedUserDto);
  }

  async findUserByName(userDto: SendUserDto) {
    const user = await this.userRepository.findOne({ where: { name: userDto.name }, });
    return user;
  }



async markConnected(socket_id: string, server: Server)
{
  let user = await this.userRepository.findOne({ where: { socket_id: socket_id }, });
  if (user) {
    user.status = UserStatus.ONLINE;
    await this.userRepository.save(user);
    const userDto = mapUserToDto(user);
    server.emit('userStatus', userDto,  UserStatus.ONLINE);
  }
}

async markOnline(user: SendUserDto, server: Server){
  let userOut = await this.userRepository.findOne({ where: { id_42: user.id_42 },});
  if (userOut) {
    userOut.status = UserStatus.ONLINE;
    await this.userRepository.save(userOut);
    const userDto = mapUserToDto(userOut);
    server.emit('userStatus', userDto, UserStatus.ONLINE);
  }
}


async markDisconnected(socket_id: string, server: Server)
{
  let user = await this.userRepository.findOne({ where: { socket_id: socket_id }, });
  if (user) {
    user.status = UserStatus.OFFLINE;
    await this.userRepository.save(user);
    const userDto = mapUserToDto(user);
    server.emit('userStatus', userDto, UserStatus.OFFLINE);
  }
}

async markInGame(socket_id: string, server: Server)
{
  let user = await this.userRepository.findOne({ where: { socket_id: socket_id }, });
  if (user) {
    user.status = UserStatus.INGAME;
    await this.userRepository.save(user);
    const userDto = mapUserToDto(user);
    server.emit('userStatus', userDto, UserStatus.INGAME);
  }
}

async sendInvite(user: SendUserDto, client: Socket, server: Server)
{
  const sender = await this.userRepository.findOne({ where: { socket_id: client.id }});
  const senderDto = mapUserToDto(sender);
  const partner = await this.userRepository.findOne({ where: { name: user.name }, });
  const partner_socket = this.getSocketForUser(partner, server, false);
  if (partner_socket)
    partner_socket.emit('gameInvite', senderDto);
}














}
