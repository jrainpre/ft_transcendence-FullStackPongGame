import { Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Req, Res, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { HistoryService } from './history.service';
import { Game } from 'src/entities/games.entity';

@Controller('history')
export class HistoryController {
    constructor(private readonly historyService: HistoryService) {}

    @UseGuards(JwtAuthGuard)
    @Get('all')
    async getFullHistory(): Promise<Game[]> {
        const history = await this.historyService.getFullHistory();
        return history;
    }
}
