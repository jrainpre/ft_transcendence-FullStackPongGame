import { Body, Controller, Get, NotFoundException, Param, Req, Res, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Controller('user')
export class UserController {

    constructor(private readonly AuthService: AuthService,  
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) {}


    @UseGuards(JwtAuthGuard)
    @Get('first-login-false')
    async setFirstLoginFalse(@Req() req) : Promise<any>{
        const jwtUser = await this.AuthService.getUserFromJwtCookie(req);
        jwtUser.first_login = false;
        await this.userRepository.save(jwtUser);
    }

    //localhost:3001/api/user/id
    //@UseGuards(JwtAuthGuard)
    @Get(':id')
    async getProfileInfo(@Param() params: any, @Res() res): Promise<any> {
        const searchedUser = await this.AuthService.findUserById(+params.id);
        if(!searchedUser)
        {
            throw new NotFoundException('User not found');
        }
        //return {searchedUser};
        res.send(searchedUser);
    }

    @UseGuards(JwtAuthGuard)
    @Get('is-user/:id')
    async isUser(@Req() req, @Res() res, @Param('id')id: string ): Promise<any>{
        const jwtUser = await this.AuthService.getUserFromJwtCookie(req);
        if(jwtUser && id == jwtUser.id_42)
        {
            res.status(200).json({ message: 'true' });
        }
        else
        {
            res.status(200).json({ message: 'false' });
        }
    }

}