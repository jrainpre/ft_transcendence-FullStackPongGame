import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post, Req, Res, UseGuards } from "@nestjs/common";
import { FortyTwoGuard } from "./42-auth.guard";
import { AuthService } from "./auth.service";
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { JwtAuthGuard } from "./jwt-auth.guard";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";
import { verify2FADto } from "src/dto/verify2FADto";



@Controller('auth')
export class AuthController{
    constructor(private readonly authService: AuthService,
      @InjectRepository(User)
    private readonly userRepository: Repository<User>,) {}

    //localhost:3001/api/auth/42/redirect
    @Get('42/redirect')
    @UseGuards(FortyTwoGuard)
    async handleRedirect(@Req() req, @Res() res): Promise<any>{
        if(req.user.tfa_enabled == false){
                const token = await this.authService.login(req.user);
                await res.cookie('jwtToken', token, { httpOnly: false, secure: false }); // Set the cookie
                if(req.user.first_login == true)
                res.redirect(`http://localhost:4200/edit/${req.user.id_42}`);
                else
                res.redirect('http://localhost:4200/game');
            }
            else{
              res.redirect(`http://localhost:4200/2fa?user=${req.user.id_42}`);
            }
            }

    @UseGuards(JwtAuthGuard)
    @Get ('42/get-qr-code/:userId')
    async getQrCode(@Req() req, @Param('userId')  userIdStr: string): Promise<{ qrCodeDataUri: string }> {
      const userFromCookie = await this.authService.getUserFromJwtCookie(req);
      await this.authService.compareUserToId(userIdStr, userFromCookie);
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
        const id = qrInfo.id;
        const code = qrInfo.code;
        const curUser = await this.authService.findUserById(id);

        const isVerified = speakeasy.totp.verify({
          secret: curUser.tfa_secret,
          encoding: 'base32',
          token: code,
        
        })
        if(isVerified == true)
        {
          const token = await this.authService.login(curUser);
          await res.cookie('jwtToken', token, { httpOnly: false, secure: false });
          res.send({message: 'Success!'});
        }
      else{
        throw new BadRequestException('Code wrong');
      }
      }

      @UseGuards(JwtAuthGuard)
      @Post ('42/enable-2FA')
      async enableQrCode(@Req() req, @Res() res, @Body() qrInfo: verify2FADto): Promise<any>{
        const userFromCookie = await this.authService.getUserFromJwtCookie(req);
        await this.authService.compareUserToId(qrInfo.id, userFromCookie);
        const id =  parseInt(qrInfo.id, 10);
        const code = qrInfo.code;
        const curUser = await this.authService.findUserById(id);

        const isVerified = speakeasy.totp.verify({
          secret: curUser.tfa_secret,
          encoding: 'base32',
          token: code,
        
        })
        if(isVerified == true)
        {
            curUser.tfa_enabled = true;
            await this.userRepository.save(curUser);
            res.send({message: "Success!"});
        }
      else{
        throw new BadRequestException('Code wrong');
      }
      }

      @UseGuards(JwtAuthGuard)
      @Post ('42/disable')
      async disableTFA(@Res() res,  @Req() req): Promise<any>{
        const userFromCookie = await this.authService.getUserFromJwtCookie(req);
        const curUser = await this.authService.findUserById(userFromCookie.id_42);
        if(curUser)
        {
          curUser.tfa_enabled = false;
          await this.userRepository.save(curUser);
          res.send({message: "Success!"});
        }
      else{
        throw new BadRequestException('User not Found');
      }
      }
    }

    