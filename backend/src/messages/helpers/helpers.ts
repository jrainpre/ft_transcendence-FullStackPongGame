import { SendMessageDto } from "../dto/send-message.dto";
import { SendChannelDto } from "../dto/send-channel.dto";
import { SendUserDto } from "../dto/send-user.dto copy";
import { Message } from "../entities/message.entity";
import { Channel } from "../entities/channel.entity";
import { User } from "../entities/user.entity";

export function mapMessageToDto(message: Message): SendMessageDto {
	return {
	  content: message.content,
	  author: message.owner.name,
	  owner_id: message.owner.id_42,
	  created_at: message.created_at,
	  channel_id: message.channel.id,
	  isSystemMessage: message.isSystemMessage
	};
  }

export function mapChannelToDto(channel: Channel): SendChannelDto {
	return {
		id: channel.id,
		name: channel.name,
		private_channel: channel.private_channel,
		password: channel.pw_hashed,
	};
  }

export function mapUserToDto(user: User): SendUserDto {
	return {
		id_42: user.id_42,
	  name: user.name,
	};
  }