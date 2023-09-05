import { BadRequestException, Controller, Param, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { StatusService } from './status.service';
import { UserStatus } from 'src/entities/user.entity';

@Controller('status')
export class StatusController {

    constructor(private auth: AuthService, private status: StatusService) {}

    @Post()
    async setOnline(@Req() req, @Res() res): Promise<any>{
        try{
            const jwtUser = await this.auth.getUserFromJwtCookie(req);
            await this.status.setStatus(jwtUser, UserStatus.ONLINE);
        }
        catch(error){
            throw new BadRequestException();
        }
    }

    @Post()
    async setOffline(@Req() req): Promise<any>{
        try{
            const jwtUser = await this.auth.getUserFromJwtCookie(req);
            await this.status.setStatus(jwtUser, UserStatus.OFFLINE);
        }
        catch(error){
            throw new BadRequestException();
        }
    }

    @Post()
    async setIngame(@Req() req): Promise<any>{
        try{
            const jwtUser = await this.auth.getUserFromJwtCookie(req);
            await this.status.setStatus(jwtUser, UserStatus.INGAME);
        }
        catch(error){
            throw new BadRequestException();
        }
    }
}
