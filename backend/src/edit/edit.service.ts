import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class EditService {

    constructor(    
        @InjectRepository(User) private readonly userRepository: Repository<User>,
    ) {}AuthService

    async changeUsername(id_42: string, newName: string): Promise<any>{
        if(newName == '')
            return;
        const existingUser = await this.userRepository.findOne({ where: { name: newName } });
        if(existingUser)
            throw new HttpException('Username already exists', HttpStatus.BAD_REQUEST);

        const parsedId:number  = parseInt(id_42);
        const user = await this.userRepository.findOne({ where: { id_42 : parsedId} });

        if(!user)
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        user.name = newName;
        await this.userRepository.save(user);
    }
}
