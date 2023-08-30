import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Req, Res, UseGuards } from "@nestjs/common";
import { FortyTwoGuard } from "./42-auth.guard";
import { AuthService } from "./auth.service";
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';



@Controller('auth')
export class AuthController{
    constructor(private readonly authService: AuthService,) {}

    //localhost:3001/api/auth/42/login
    // @Get('42/login')
    //@UseGuards(FortyTwoGuard)
    //async handleLogin(@Res() res){
        //res.redirect('https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-9904fa10768d1a760e5ff38e9647bde2c6b9431a9c32b5269fe17946f41a414a&redirect_uri=http%3A%2F%2Flocalhost%3A3001%2Fapi%2Fauth%2F42%2Fredirect&response_type=code')
        //this is never called, but below 42/redirect
    //}

    //localhost:3001/api/auth/42/redirect
    @Get('42/redirect')
    @UseGuards(FortyTwoGuard)
    async handleRedirect(@Req() req, @Res() res): Promise<any>{
        if(req.user.tfa_enabled == false){
                const token = await this.authService.login(req.user);
                await res.cookie('jwtToken', token, { httpOnly: true, secure: false }); // Set the cookie
                res.redirect('http://localhost:4200/game')
            }
            else{
              res.redirect(`http://localhost:4200/2fa?user=${req.user.id_42}`);
            }
            }

    // @Post('42/2fa-verify')
    // async verify2FA(@Req() req, @Res() res, @Body() verifyDto: verify2FADto){
    //     const user = this.authService.findUserById(verifyDto.id);


    //     if(this.authService.verify2FA(key, verifyDto.code)){
    //         const token = await this.authService.login(req.user);
    //         res.cookie('jwtToken', token, { httpOnly: true, secure: true }); // Set the cookie
    //         res.redirect('http://localhost:4200/game')
    //     }
    //     else
    //         return { sucess: false, message: "Invalid 2FA"};
    // }

    //@UseGuards(JwtAuthGuard)
    @Get ('42/hello')
    async check(@Req() req): Promise<any>{
      const user = await this.authService.getUserFromJwtCookie(req);
    }

    @Get ('42/get-qr-code/:userId')
    async getQrCode(@Param('userId') userIdStr: string): Promise<{ qrCodeDataUri: string }> {
        const userId = parseInt(userIdStr, 10);
        const user = await this.authService.findUserById(userId);
    
        if (!user) {
          throw new NotFoundException('User not found');
        }
    
        const qrCodeDataUri = await new Promise<string>((resolve, reject) => {
          qrcode.toDataURL(user.tfa_otpath_url, (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          });
        });
        return { qrCodeDataUri };
      }

      @Post ('42/verify-2FA')
      async verifyQrCode(@Req() req, @Res() res, @Body() qrInfo: any): Promise<any>{
        console.log(qrInfo.id);
        console.log(qrInfo.code);
        const id = qrInfo.id;
        const code = qrInfo.code;
        const curUser = await this.authService.findUserById(id);

        const isVerified = speakeasy.totp.verify({
          secret: curUser.tfa_secret,
          encoding: 'base32',
          token: code,
        
        })
        if(isVerified == false)
        {
          const token = await this.authService.login(curUser);
          await res.cookie('jwtToken', token, { httpOnly: true, secure: false });
          res.send({message: 'Success!'});
        }
      else{
        throw new BadRequestException('Code wrong');
      }
      }
    }