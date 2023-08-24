import { Controller, Get, UseGuards, Post, Req } from '@nestjs/common';
import { AuthController } from 'src/auth/auth.controller';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';


@Controller('tfa')
export class TfaController {
    
    @Get('enable')
    enableTfa(@Req() req: Request){
        if(req.isAuthenticated())
        {
            return {msg: 'hi'};
        }
        else{
            return {msg: 'bye'}
        }
    }

    @Post('disable')
    disableTfa(){

    }

    @Post('verify')
    verifyTfa(){
        
    }

}
