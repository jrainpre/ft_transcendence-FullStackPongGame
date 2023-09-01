import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    ) {}

  async findOrCreateUser(profile: any): Promise<any> {
    let user = await this.findUserById(profile.id);
    if(user == undefined)
    {
      const secret = speakeasy.generateSecret({lenght : 20, name: 'The Boyzs Transcendence'});
      user = this.userRepository.create({
        id_42: profile.id,
        name: profile.username,
        socket_id: '0',
        tfa_enabled: false,
        tfa_secret: secret.base32,
        tfa_otpath_url: secret.otpauth_url,
        profile_picture: profile._json.image.link,
      });
      await this.userRepository.save(user);
    }
    return user;
  }

  async findUserById (id: number): Promise<User | undefined> {
    const user = await this.userRepository.find({where: {id_42: id}}); //42_id or id?
    return user.length > 0 ? user[0] : undefined;
  }
  
  async login(user: any){
    const payload = {id: user.id_42, username: user.username};

    return this.jwtService.sign(payload, { expiresIn: '2h',});
  }

  verify2FA(key: string, code: string) : boolean{
    const verify = speakeasy.totp.verify({
      secret: key,
      encoding: 'base32',
      token: code,
    })

    return verify;
  }

  async generateQRCodeDataUri(secret: string, label: string, issuer: string): Promise<string> {
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret,
      label: label,
      issuer: issuer,
    });

    const qrCodeDataUri = await qrcode.toDataURL(otpauthUrl); // Use "await" here
    return qrCodeDataUri;
  }

  async getUserFromJwtCookie(req: Request): Promise<any>{
    const jwtCookie = req.cookies.jwtToken;
    try{
      const decodeToken = jwt.verify(jwtCookie, '1337Secret') as any;// Use ENV Variable Later
      const user = await this.findUserById(decodeToken.id);
      return user;
    } catch (error)
    {
      console.log('Couldnt get user from Cookie', error);
    }
    return null;
  }

  async compareUserToId(id_42: string, user: any): Promise<any>{
    if(id_42 != user.id_42)
    throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
  }

}