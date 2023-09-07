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

    async setUserOfflineAfterTimeout(){
        const timeoutDur = 7 * 1000; // 30 sec
        const curTime = new Date();
        const cutOffTime = new Date(curTime.getTime() - timeoutDur);

        const inactiveUsers = await this.user.createQueryBuilder('user').where(
            'user.lastActiveTimestamp <= :cutOffTime', {cutOffTime}).getMany();
        
        inactiveUsers.forEach(async (user) => {
            user.status = UserStatus.OFFLINE;
            await this.user.save(user);
        })
    }

    async setUserOnlineTimestamp(){
        const timeoutDur = 7 * 1000; // 3 sec
        const curTime = new Date();
        const cutOffTime = new Date(curTime.getTime() - timeoutDur);

        const inactiveUsers = await this.user.createQueryBuilder('user').where(
            'user.lastActiveTimestamp > :cutOffTime', {cutOffTime}).getMany();
        
        inactiveUsers.forEach(async (user) => {
            if(user.status == UserStatus.OFFLINE)
            {
                user.status = UserStatus.ONLINE;
                await this.user.save(user);
            }
        })
    }

    async updateTimestamp(user: User) : Promise<any>{
        user.lastActiveTimestamp = new Date();
        await this.user.save(user);
    }
}
