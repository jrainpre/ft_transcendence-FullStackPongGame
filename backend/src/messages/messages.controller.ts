import { MessagesService } from './messages.service';
import { Body, Controller, Get, Post, NotFoundException, Param, Req, Res, UseGuards, HttpStatus, HttpException, ParseIntPipe } from '@nestjs/common';
import { SendChannelDto } from './dto/send-channel.dto';
import { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { get } from 'http';
import { SendUserDto } from './dto/send-user.dto';
import { mapUserToDto, mapChannelToDto, mapChannelUserToDto } from './helpers/helpers';
// import { MessagesGateway } from './messages.gateway';
import { GameGateway } from '../game/gateways/game/game.gateway';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';



@UseGuards(JwtAuthGuard)
@Controller('chat')
export class MessagesController {
	constructor(private readonly messagesService: MessagesService, private readonly AuthService: AuthService, private readonly messagesGateway: GameGateway) {}


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
		try {
			const user = await this.AuthService.getUserFromJwtCookie(req);
			this.messagesService.validateChannelName(channelDto);
			const channel = await this.messagesService.createNewChannel(channelDto, user);
			await this.messagesService.addUserToChannel(user, channel, this.messagesGateway.lobbyManager.server);
			const channelDtoToSend = mapChannelToDto(channel);
            const messagesDto = await this.messagesService.getChannelMessagesDto(channel);
            const channelUsersDto = await this.messagesService.getChannelUsersDto(channel);
            const publicChannelsDto = await this.messagesService.getPuplicChannelsDto();
			res.status(200).json({  channel: channelDtoToSend,  channelUsers: channelUsersDto, messages: messagesDto});
            this.messagesGateway.lobbyManager.server.emit('updatePublicChannels', { publicChannels: publicChannelsDto});
		} catch (error) {
			return res.status(400).json({ message: error.message });
		}
	}

    @Post('join-channel')
    async joinChannel(@Body('channel') channelDto: SendChannelDto, @Req() req: any, @Res() res: Response) {
        try {
            const user = await this.AuthService.getUserFromJwtCookie(req);
            const channel = await this.messagesService.findChannel(channelDto, true);
            await this.messagesService.addUserToChannel(user, channel, this.messagesGateway.lobbyManager.server);
            const channelDtoToSend = mapChannelToDto(channel);
            const messagesDto = await this.messagesService.getChannelMessagesDto(channel);
            const channelUsersDto = await this.messagesService.getChannelUsersDto(channel);
            res.status(200).json({ channel: channelDtoToSend, messages: messagesDto, channelUsers: channelUsersDto });
            this.messagesGateway.lobbyManager.server.to(channelDtoToSend.name).emit('updateChannelUsers', {channel: channelDtoToSend, channelUsers: channelUsersDto});
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    @Post('leave-channel')
    async leaveChannel(@Body('channel') channelDto: SendChannelDto, @Req() req: any, @Res() res: Response) {
        try {
            const user = await this.AuthService.getUserFromJwtCookie(req);
            await this.messagesService.leaveChannel(user, channelDto, this.messagesGateway.lobbyManager.server);
            const userChannelsDto = await this.messagesService.getUserChannelsDto(user);
            res.status(200).json({ userChannels: userChannelsDto });
            const channel = await this.messagesService.findChannelNoThrow(channelDto);
            if(channel){
                const channelUsersDto = await this.messagesService.getChannelUsersDto(channel);
                this.messagesGateway.lobbyManager.server.to(channelDto.name).emit('updateChannelUsers', {channel: channelDto, channelUsers: channelUsersDto});
            }
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
            const blockedUser = await this.messagesService.findUserByName(toBlockUser);
            this.messagesGateway.lobbyManager.server.to(user.socket_id).emit('updateBlockedUsers', {blockedUsers: blockedUsersDto});
            this.messagesGateway.lobbyManager.server.to(blockedUser.socket_id).emit('gotBlocked', {user: mapUserToDto(user)});
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
            const blockedUser = await this.messagesService.findUserByName(toUnblockUser);
            this.messagesGateway.lobbyManager.server.to(user.socket_id).emit('updateBlockedUsers', {blockedUsers: blockedUsersDto});
            this.messagesGateway.lobbyManager.server.to(blockedUser.socket_id).emit('gotUnblocked', {user: mapUserToDto(user)});
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    @Post('start-private-chat')
    async createPrivateChat(@Body('user') userDto: SendUserDto, @Req() req: any, @Res() res: Response) {
        try {
            const user = await this.AuthService.getUserFromJwtCookie(req);
            if(user.name === userDto.name)
                throw new Error(`Can't start private chat with yourself`);
            const channel = await this.messagesService.createPrivateChat(user, userDto, this.messagesGateway.lobbyManager.server);
            const channelDto = mapChannelToDto(channel);
            res.status(200).json({ channel: channelDto});
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    @Post('set-password')
    async setPassword(@Body('channel') channelDto: SendChannelDto, @Req() req: any, @Res() res: Response) {
        try {
            const user = await this.AuthService.getUserFromJwtCookie(req);
            const channel = await this.messagesService.setPassword(user, channelDto, this.messagesGateway.lobbyManager.server);
            const channelDtoToSend = mapChannelToDto(channel);
            res.status(200).json({ channel: channelDtoToSend });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    @Post('promote-user')
    async promoteUser(@Body('user') userDto: SendUserDto, @Body('channel') channelDto: SendChannelDto, @Req() req: any, @Res() res: Response) {
        try {
            const user = await this.AuthService.getUserFromJwtCookie(req);
            const channel = await this.messagesService.promoteUser(user, userDto, channelDto, this.messagesGateway.lobbyManager.server);
            const channelUsersDto = await this.messagesService.getChannelUsersDto(channel);
            res.status(200).json({ channelUsers: channelUsersDto });
            this.messagesGateway.lobbyManager.server.to(channelDto.name).emit('updateChannelUsers', {channel: channelDto, channelUsers: channelUsersDto});
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    @Post('kick-user')
    async kickUser(@Body('user') userDto: SendUserDto, @Body('channel') channelDto: SendChannelDto, @Req() req: any, @Res() res: Response) {
        try {
            const user = await this.AuthService.getUserFromJwtCookie(req);
            const channel = await this.messagesService.kickUser(user, userDto, channelDto, this.messagesGateway.lobbyManager.server);
            const channelUsersDto = await this.messagesService.getChannelUsersDto(channel);
            res.status(200).json({ channelUsers: channelUsersDto });
            this.messagesGateway.lobbyManager.server.to(channelDto.name).emit('updateChannelUsers', {channel: channelDto, channelUsers: channelUsersDto});

        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    @Post('ban-user')
    async banUser(@Body('user') userDto: SendUserDto, @Body('channel') channelDto: SendChannelDto, @Req() req: any, @Res() res: Response) {
        try {
            const user = await this.AuthService.getUserFromJwtCookie(req);
            const channel = await this.messagesService.banUser(user, userDto, channelDto, this.messagesGateway.lobbyManager.server);
            const channelUsersDto = await this.messagesService.getChannelUsersDto(channel);
            res.status(200).json({ channelUsers: channelUsersDto });
            this.messagesGateway.lobbyManager.server.to(channelDto.name).emit('updateChannelUsers', {channel: channelDto, channelUsers: channelUsersDto});

        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    @Post('mute-user')
    async muteUser(@Body('user') userDto: SendUserDto, @Body('channel') channelDto: SendChannelDto, @Req() req: any, @Res() res: Response) {
        try {
            const user = await this.AuthService.getUserFromJwtCookie(req);
            const channel = await this.messagesService.muteUser(user, userDto, channelDto, this.messagesGateway.lobbyManager.server);
            const channelUsersDto = await this.messagesService.getChannelUsersDto(channel);
            res.status(200).json({ channelUsers: channelUsersDto });
            this.messagesGateway.lobbyManager.server.to(channelDto.name).emit('updateChannelUsers', {channel: channelDto, channelUsers: channelUsersDto});
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    @Post('invite-user-to-game')
    async inviteUserToGame(@Body('user') userDto: SendUserDto, @Req() req: any, @Res() res: Response) {
        try {
            const user = await this.AuthService.getUserFromJwtCookie(req);
            const channel = await this.messagesService.inviteUserToGame(user, userDto, this.messagesGateway.lobbyManager.server);
            res.status(200).json({ message: "User invited to game" });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    @Post('select-channel')
    async selectChannel(@Body('channel') channelDto: SendChannelDto, @Req() req: any, @Res() res: Response) {
        try {
            let user = await this.AuthService.getUserFromJwtCookie(req);
            const channel = await this.messagesService.findChannel(channelDto, false);
            const channelDtoToSend = mapChannelToDto(channel);
            const messagesDto = await this.messagesService.getChannelMessagesDto(channel);
            const channelUsersDto = await this.messagesService.getChannelUsersDto(channel);
            res.status(200).json({ channel: channelDtoToSend, messages: messagesDto, channelUsers: channelUsersDto });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    @Get('one-vs-one/:id')
    async getOneVsOneInfos(@Param('id', ParseIntPipe) id: number, @Res() res: Response){
        try {
            let user = await this.AuthService.findUserById(id);
            let ret = {
                id_42: user.id_42,
                socketId: user.socket_id,
                name: user.name
            }
            res.status(200).json({ info: ret});
        } catch (error) {
            return res.status(400).json({message: error.message});
        }
    }

    @Post('get-status-from-user')
    async getStatusFromUser(@Body('user') userDto: SendUserDto, @Req() req: any, @Res() res: Response) {
        try {
            const user = await this.messagesService.findUserByName(userDto);
            res.status(200).json({ status: user.status });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }




}
