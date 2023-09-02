import { MessagesService } from './messages.service';
import { Body, Controller, Get, Post, NotFoundException, Param, Req, Res, UseGuards, HttpStatus, HttpException } from '@nestjs/common';
import { SendChannelDto } from './dto/send-channel.dto';



@Controller('messages')
export class MessagesController {
	constructor(private readonly messagesService: MessagesService) {}


// 	@Post('createChannel')
// 	async createChannel(@Body('channel') channelDto: SendChannelDto) {
// 	  try {
// 		const channel = await this.messagesService.createChannel(channelDto);
		
// 		// Check if the channel was created successfully
// 		if (channel) {
// 		  return {
// 			status: HttpStatus.CREATED,
// 			message: 'Channel created successfully',
// 			data: channel
// 		  };
// 		} else {
// 		  // This can be a fallback if the service doesn't return anything, indicating an unknown error
// 		  throw new HttpException('Unknown error occurred', HttpStatus.INTERNAL_SERVER_ERROR);
// 		}
// 	  } catch (error) {
// 		// Handle known errors
// 		if (error.message === 'Channel already exists') {
// 		  throw new HttpException('Channel already exists', HttpStatus.BAD_REQUEST);
// 		} else if (error.message === 'Invalid channel name') {
// 		  throw new HttpException('Invalid channel name', HttpStatus.BAD_REQUEST);
// 		} else {
// 		  // Handle unknown errors
// 		  throw new HttpException(error.message || 'Unknown error', HttpStatus.INTERNAL_SERVER_ERROR);
// 		}
// 	  }
// 	}
//   }









}
