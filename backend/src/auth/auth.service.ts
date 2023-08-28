import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entety';
import { Repository } from 'typeorm';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';

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
      user = this.userRepository.create({
        id_42: profile.id,
        tfa_enabled: true,
        username: profile.username,
        tfa_secret: speakeasy.generateSecret({lenght : 20}),
      });
      user.tfa_enabled = true;
      await this.userRepository.save(user);
    }
    return user;
  }

  async findUserById (id: number): Promise<User | undefined> {
    const user = await this.userRepository.find({where: {id_42: id}});
    return user.length > 0 ? user[0] : undefined;
  }
  
  async login(user: any){
    const payload = {id: user.id, username: user.username};

    return this.jwtService.sign(payload);
  }

  verify2FA(key: string, code: string) : boolean{
    const verify = speakeasy.totp.verify({
      secret: key,
      encoding: 'base32',
      token: code,
    })

    return verify;
  }
  
  async getQrCodeUri(user: any) {

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
}