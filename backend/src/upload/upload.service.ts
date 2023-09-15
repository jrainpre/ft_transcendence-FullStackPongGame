import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UploadService {
    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>, private auth: AuthService) {}

    async changeAvatar(path :string, user: any): Promise<any>{
        user.profile_picture = process.env.backendUrl + path;
        await this.userRepository.save(user);
    }
}
