import { Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { FortyTwoGuard } from "./42-auth.guard";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";

@Controller('auth')
export class AuthController{
    constructor(private readonly authService: AuthService,) {}

    //localhost:3001/api/auth/42/login
    @Get('42/login')
    @UseGuards(FortyTwoGuard)
    async handleLogin(){
        //this is never called, but below 42/redirect
    }

    //localhost:3001/api/auth/42/redirect
    @UseGuards(FortyTwoGuard)
    @Get('42/redirect')
    async handleRedirect(@Req() req, @Res() res){
            const token = await this.authService.login(req.user);
            res.cookie('jwtToken', token, { httpOnly: true, secure: true }); // Set the cookie
            res.redirect("/api/auth/42/hello");
    }

    @UseGuards(JwtAuthGuard)
    @Get ('42/hello')
    check(@Req() req){
        return {msg: 'hello'}
    }
}