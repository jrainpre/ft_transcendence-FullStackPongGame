import { Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Post, Req, Res, UseGuards } from '@nestjs/common';
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
      if(id > 2147483646)
      {
        throw new NotFoundException('Id out of range');
      }
        const jwtUser = await this.AuthService.getUserFromJwtCookie(req);
        var isFriend = await this.friendsService.areUsersFriends(jwtUser.id_42, id);
        return isFriend;
    }

    @UseGuards(JwtAuthGuard)
    @Post('add-friend/:id')
    async addFriend(@Req() req, @Param('id', ParseIntPipe) id: number): Promise<any>{
      if(id > 2147483646)
      {
        throw new NotFoundException('Id out of range');
      }
        const jwtUser = await this.AuthService.getUserFromJwtCookie(req);
        if(await this.friendsService.areUsersFriends(jwtUser.id_42, id) == true)
          return false;
        const friend = await this.AuthService.findUserById(id);
        this.friendsService.addFriend(jwtUser, friend);
        return true;
    }

    @UseGuards(JwtAuthGuard)
    @Post('remove-friend/:id')
    async removeFriend(@Req() req, @Param('id', ParseIntPipe) id: number): Promise<any>{
      if(id > 2147483646)
      {
        throw new NotFoundException('Id out of range');
      }
        const jwtUser = await this.AuthService.getUserFromJwtCookie(req);
        const friend = await this.AuthService.findUserById(id);
        await this.friendsService.removeFriend(jwtUser, friend);
        return;
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getAllFriends(@Param('id', ParseIntPipe) id: number): Promise<Friend[]> {
      if(id > 2147483646)
      {
        throw new NotFoundException('Id out of range');
      }
    const friends = await this.friendsService.getAllFriends(id);
    return friends;
  }
}
