import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-42';
import { AuthService } from './auth.service'; // Replace with your auth service

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
  constructor(private readonly authService: AuthService) {
    super({
      clientID: 'u-s4t2ud-9904fa10768d1a760e5ff38e9647bde2c6b9431a9c32b5269fe17946f41a414a',
      clientSecret: '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',
      callbackURL: 'http://localhost:3001/api/auth/42/redirect',
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any): Promise<any> {
    // You can customize the validation logic here
    // Profile will contain user information from 42
    const user = await this.authService.findOrCreateUser(profile);
    return user;
  }
}