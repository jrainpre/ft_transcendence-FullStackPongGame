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
    constructor(private readonly friendsService: FriendsService) {}

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getAllFriends(@Param('id', ParseIntPipe) id: number): Promise<Friend[]> {
    const friends = await this.friendsService.getAllFriends(id);
    return friends;
  }
}
