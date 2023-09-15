import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';
import { AuthService } from './auth.service';
import { User } from 'src/entities/user.entity';

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor(private readonly authService: AuthService
    )
    {
    super({
      clientID: process.env.clientID,
      clientSecret: process.env.clientSecret,
      callbackURL: process.env.callBackURL,
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
    const user: User = await this.authService.findOrCreateUser(profile); // Function which interacts with DB
    return user;
  }
}