import { BadRequestException, Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Post, Req, Res, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { UserService } from './user.service';

@Controller('user')
export class UserController {

    constructor(private readonly AuthService: AuthService,  
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private user: UserService,
    ) {}
 
    @UseGuards(JwtAuthGuard)
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
          res.status(400).json({ error: 'An error occurred while fetching users.' });
        }
      }

    @UseGuards(JwtAuthGuard)
    @Get('is-user/:id') 
    async isUser(@Req() req, @Res() res, @Param('id')id: string ): Promise<any>{
        const jwtUser = await this.AuthService.getUserFromJwtCookie(req);
        if(jwtUser && id == jwtUser.id_42)
            res.status(200).json({ message: 'true' });
        else
            res.status(200).json({ message: 'false' });
    }

    @UseGuards(JwtAuthGuard)
    @Get('is-blocked/:id')
    async isBlocked(@Req() req, @Res() res, @Param('id', ParseIntPipe) id: number): Promise<any>{
        if(id > 2147483646)
        {
          throw new NotFoundException('Id out of range');
        }
        const jwtUser = await this.AuthService.getUserFromJwtCookie(req);
        let isBlocked: boolean = await this.user.isBlocked(jwtUser, id);
        res.send(isBlocked);
    }

    @UseGuards(JwtAuthGuard)
    @Post('block/:id')
    async blockUser(@Req() req, @Res() res, @Param('id', ParseIntPipe) id: number): Promise<any>{
        const jwtUser = await this.AuthService.getUserFromJwtCookie(req);
        if(id > 2147483646)
        {
          throw new NotFoundException('Id out of range');
        }
        try{
            
            await this.user.blockUser(jwtUser.id_42, id);
        }
        catch(error){
            throw new BadRequestException('Failed to block User');
        }
        return;
    }

    @UseGuards(JwtAuthGuard)
    @Post('logout')
    logout(@Res() res){
        res.clearCookie('jwtToken');
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getProfileInfo(@Param('id', ParseIntPipe) id: number, @Res() res): Promise<any> {
        const searchedUser = await this.AuthService.findUserById(id);
        if(!searchedUser)
        {
            throw new NotFoundException('User not found');
        }
        res.send({
            profile_picture: searchedUser.profile_picture,
            name: searchedUser.name,
            tfa_enabled: searchedUser.tfa_enabled,
            win_ranked: searchedUser.win_ranked,
            loss_ranked: searchedUser.loss_ranked,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get('name/:user_name')
    async getUserByName(@Param('user_name') user_name: string, @Res() res): Promise<any> {
    try {
    // Check if the user exists in your UserRepository
        const searchedUsers = await this.userRepository.find({ where: { name: user_name } });

        if (searchedUsers.length === 0) {
        // User not found, return an appropriate response
        return res.status(404).json({ message: 'User not found' });
        }

        const user = searchedUsers[0];
        res.status(200).json({ id: user.id_42 });
    } catch (error) {
    // Handle any unexpected errors
        console.error('Error:', error);
        res.status(400).json({ message: 'Internal server error' });
        }
    }

}