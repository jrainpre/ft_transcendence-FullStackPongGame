import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserStatus } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StatusService {

    constructor(@InjectRepository(User) readonly user: Repository<User>){}

    async setStatus(user: User, status: UserStatus): Promise<any>{
        user.status = status;
        await this.user.save(user);
    }
}
