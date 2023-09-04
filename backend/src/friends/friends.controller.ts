import { Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Req, Res, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { Friend } from 'src/entities/friends.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Controller('friends')
export class FriendsController {
    constructor(private readonly friendsService: FriendsService,
      private AuthService: AuthService,
      ) {}

    @UseGuards(JwtAuthGuard)
    @Get('is-friend/:id')
    async isFriend(@Req() req, @Param('id', ParseIntPipe) id: number): Promise<any>{
        const jwtUser = await this.AuthService.getUserFromJwtCookie(req);
        var isFriend = await this.friendsService.areUsersFriends(jwtUser.id_42, id);
        return true;
    }

    @UseGuards(JwtAuthGuard)
    @Get('add-friend/:id')
    async addFriend(@Req() req, @Param('id', ParseIntPipe) id: number): Promise<any>{
        const jwtUser = await this.AuthService.getUserFromJwtCookie(req);
        var isFriend = await this.friendsService.areUsersFriends(jwtUser.id_42, id);
        return true;
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getAllFriends(@Param('id', ParseIntPipe) id: number): Promise<Friend[]> {
    const friends = await this.friendsService.getAllFriends(id);
    return friends;
  }
}
