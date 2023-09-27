import { BadRequestException, Controller, Param, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { StatusService } from './status.service';
import { User, UserStatus } from 'src/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { json } from 'stream/consumers';

@Controller('status')
export class StatusController {

    constructor(private auth: AuthService, private status: StatusService) {}

    @Post('online')
    async setOnline(@Req() req, @Res() res): Promise<any>{
        try{
            const jwtUser = await this.auth.getUserFromJwtCookie(req);
            await this.status.setStatus(jwtUser, UserStatus.ONLINE);
        }
        catch(error){
            throw new BadRequestException();
        }
        res.status(200).json(); 
    }

    @Post('offline')
    async setOffline(@Req() req, @Res() res): Promise<any>{
        try{
            const jwtUser = await this.auth.getUserFromJwtCookie(req);
            await this.status.setStatus(jwtUser, UserStatus.OFFLINE);
        }
        catch(error){
            throw new BadRequestException();
        }
        res.status(200).json(); 
    }

 

    @UseGuards(JwtAuthGuard)
    @Post('heartbeat')
    async setHeartbeat(@Req() req, @Res() res): Promise<any>{
        let user: User;
        try{
            user = await this.auth.getUserFromJwtCookie(req);
            await this.status.updateTimestamp(user);
        }
        catch(error){
            return new BadRequestException();
        }
        res.status(200).json(); 
    }
}
