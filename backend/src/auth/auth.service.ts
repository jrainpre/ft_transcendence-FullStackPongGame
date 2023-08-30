import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entety';
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
        tfa_enabled: true,
        username: profile.username,
        tfa_secret: secret.base32,
        tfa_ourl: secret.otpauth_url,
      });
      user.tfa_enabled = true;
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
}