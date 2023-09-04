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

    

    //@UseGuards(JwtAuthGuard)
    @Get('first-login-false')
    async setFirstLoginFalse(@Req() req) : Promise<any>{
        const jwtUser = await this.AuthService.getUserFromJwtCookie(req);
        jwtUser.first_login = false;
        await this.userRepository.save(jwtUser);
    }

    @UseGuards(JwtAuthGuard)
    @Get('get-id-by-jwt')
    async getIdByJwt(@Req() req, @Res() res): Promise<any>{
        const jwtUser = await this.AuthService.getUserFromJwtCookie(req);
        res.status(200).json({ message: jwtUser.id_42 })
    }

    // get all the users from the database, but only send back name 
    @Get('all-users')
    async getAllUsers(@Res() res): Promise<any> {
        try {
          // Fetch all users from the database
          const allUsers = await this.userRepository.find();
    
          // Map the user data to include only the required properties
          const simplifiedUsers = allUsers.map(user => ({
            id_42: user.id_42,
            name: user.name,
            win_ranked: user.win_ranked,
            loss_ranked: user.loss_ranked,
          }));
    
          res.status(200).json(simplifiedUsers);
        } catch (error) {
          res.status(500).json({ error: 'An error occurred while fetching users.' });
        }
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

}