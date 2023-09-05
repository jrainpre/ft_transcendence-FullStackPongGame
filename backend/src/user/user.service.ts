import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockedUser } from 'src/entities/blocked_user.entity';
import { Friend } from 'src/entities/friends.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {

    constructor(    @InjectRepository(BlockedUser)
    readonly blockedUserRepository: Repository<BlockedUser>,) {}

    async isBlocked(jwtUser, id) : Promise<any>{
        let blockedUser;
        try{
            blockedUser = await this.blockedUserRepository.findOne({
                where: {
                    blockedUser: {id_42: id},
                    blockedByUser: {id_42: jwtUser.id_42},
                }
            });
        }
        catch(error){
            throw new NotFoundException('User not found');
        }
        return !!blockedUser;
    }

    async blockUser(userId, blockId) : Promise<any> {
        const blockedUser = new BlockedUser;
        blockedUser.blockedUser = blockId;
        blockedUser.blockedByUser = userId;

        await this.blockedUserRepository.save(blockedUser);
    }
}
