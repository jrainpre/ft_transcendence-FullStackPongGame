import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entety';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    ) {}
  // Implement your logic to find or create users here
  async findOrCreateUser(profile: any): Promise<any> {
    // Example logic
    
    const curUser = this.userRepository.create({
      id_42: profile.id,
      tfa_enabled: false,
      username: profile.username,
      tfa_secret: 'rand',
    });
    
    await this.userRepository.save(curUser);


    const user = {
      id: profile.id,
      username: profile.username,
      email: profile.email,
    };
    // Implement your database operations or user creation logic here
    return user;
  }
  
  async login(user: any){
    const payload = {id: user.id, username: user.username};

    return this.jwtService.sign(payload);
  }
}
