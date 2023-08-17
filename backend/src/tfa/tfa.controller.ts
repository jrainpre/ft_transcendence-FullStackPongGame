import { Controller, Get, UseGuards, Post } from '@nestjs/common';
import { AuthController } from 'src/auth/auth.controller';
import { AuthGuard } from '@nestjs/passport';


@Controller('tfa')
//@UseGuards(AuthGuard('42')) create guard to check if user is logged in
export class TfaController {
    
    @Get('enable')
    enableTfa(){
        return {msg: 'hi'};
    }

    @Post('disable')
    disableTfa(){

    }

    @Post('verify')
    verifyTfa(){

    }

}
