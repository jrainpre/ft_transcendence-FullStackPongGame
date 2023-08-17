import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController{

    //localhost:3001/api/auth/42/login
    @Get('42/login')
    @UseGuards(AuthGuard('42'))
    async handleLogin(){
        //redirected to Login page through the Auth Guard
    }

    //localhost:3001/api/auth/42/redirect
    @Get('42/redirect')
    @UseGuards(AuthGuard('42'))
    handleRedirect(@Req() req, @Res() res){

            // Check if User Exists, if 2FA is enabled etc
            return res.redirect('/hello');
    }
}
