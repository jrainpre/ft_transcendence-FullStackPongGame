import { MessagesService } from './messages.service';
import { Body, Controller, Get, Post, NotFoundException, Param, Req, Res, UseGuards, HttpStatus, HttpException } from '@nestjs/common';
import { SendChannelDto } from './dto/send-channel.dto';
import { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { get } from 'http';
import { SendUserDto } from './dto/send-user.dto copy';
import { mapUserToDto, mapChannelToDto } from './helpers/helpers';
import { MessagesGateway } from './messages.gateway';



@Controller('chat')
export class MessagesController {
	constructor(private readonly messagesService: MessagesService, private readonly AuthService: AuthService, private readonly messagesGateway: MessagesGateway) {}




//   loadUserData(): void {
//         this.http.get<{ user: User, publicCannels: Channel[], userChannels: Channel[],  }>(`http://localhost:3001/api/chat/get-user-data`, { withCredentials: true }).subscribe(data => {
//             this.user = data.user;
//             this.publicChannels = data.publicCannels;
//             this.userChannels = data.userChannels;
//             console.log(JSON.stringify(this.user));
//             console.log(JSON.stringify(this.publicChannels));
//             console.log(JSON.stringify(this.userChannels));
//     });
//     }

@Get('get-user-data')
    async getUserData(@Res() res: Response, @Req() req: any) {
        try {
			const user = await this.AuthService.getUserFromJwtCookie(req);
			const userDto = mapUserToDto(user);
            const publicChannelsDto = await this.messagesService.getPuplicChannelsDto();
            const userChannelsDto = await this.messagesService.getUserChannelsDto(user);
			const blockedUsersDto = await this.messagesService.getBlockedUsersDto(user);
            
            if (!user ) {
                return res.status(400).json({ message: "Failed to retrieve data" });
            }

            return res.json({
                user: userDto,
                publicChannels: publicChannelsDto,
                userChannels: userChannelsDto,
				blockedUsers: blockedUsersDto,
            });
        } catch (error) {
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }


	@Post('create-channel')
	async createChannel(@Body('channel') channelDto: SendChannelDto, @Req() req: any, @Res() res: Response) {
		console.log(req.body);
		try {
			const user = await this.AuthService.getUserFromJwtCookie(req);
			this.messagesService.validateChannelName(channelDto);
			const channel = await this.messagesService.createNewChannel(channelDto, user);
			await this.messagesService.addUserToChannel(user, channel, this.messagesGateway.server);
			const channelDtoToSend = mapChannelToDto(channel);
			res.status(200).json({ channel: channelDtoToSend });
		} catch (error) {
			return res.status(400).json({ message: error.message });
		}
	}

    @Post('join-channel')
    async joinChannel(@Body('channel') channelDto: SendChannelDto, @Req() req: any, @Res() res: Response) {
        try {
            const user = await this.AuthService.getUserFromJwtCookie(req);
            const channel = await this.messagesService.findChannel(channelDto);
            await this.messagesService.addUserToChannel(user, channel, this.messagesGateway.server);
            const channelDtoToSend = mapChannelToDto(channel);
            res.status(200).json({ channel: channelDtoToSend });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    @Post('leave-channel')
    async leaveChannel(@Body('channel') channelDto: SendChannelDto, @Req() req: any, @Res() res: Response) {
        try {
            const user = await this.AuthService.getUserFromJwtCookie(req);
            await this.messagesService.leaveChannel(user, channelDto, this.messagesGateway.server);
            const userChannelsDto = await this.messagesService.getUserChannelsDto(user);
            res.status(200).json({ userChannels: userChannelsDto });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    @Post('block-user')
    async blockUser(@Body('user') toBlockUser: SendUserDto, @Req() req: any, @Res() res: Response) {
        try {
            let user = await this.AuthService.getUserFromJwtCookie(req);
            user =  await this.messagesService.addUserToBlockList(user, toBlockUser);
            const blockedUsersDto = await this.messagesService.getBlockedUsersDto(user);
            res.status(200).json({ blockedUsers: blockedUsersDto });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    @Post('unblock-user')
    async unblockUser(@Body('user') toUnblockUser: SendUserDto, @Req() req: any, @Res() res: Response) {
        try {
            let user = await this.AuthService.getUserFromJwtCookie(req);
            user = await this.messagesService.removeUserFromBlockList(user, toUnblockUser);
            const blockedUsersDto = await this.messagesService.getBlockedUsersDto(user);
            res.status(200).json({ blockedUsers: blockedUsersDto });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    @Post('start-private-chat')
    async createPrivateChat(@Body('user') userDto: SendUserDto, @Req() req: any, @Res() res: Response) {
        try {
            const user = await this.AuthService.getUserFromJwtCookie(req);
            const channel = await this.messagesService.createPrivateChat(user, userDto, this.messagesGateway.server);
            const channelDto = mapChannelToDto(channel);
            res.status(200).json({ channel: channelDto });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }










}
