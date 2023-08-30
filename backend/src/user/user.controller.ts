import { Controller, Get, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';

@Controller('user')
export class UserController {

    constructor(private readonly AuthService: AuthService ) {}


    //localhost:3001/api/user/id
    //@UseGuards(JwtAuthGuard)
    @Get(':id')
    async getProfileInfo(@Param() params: any): Promise<any> {
        const searchedUser = await this.AuthService.findUserById(params.id);
        if(!searchedUser)
        {
            throw new NotFoundException('User not found');
        }
        return {searchedUser};
    }

}
