// friends.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository} from 'typeorm';
import { Friend } from 'src/entities/friends.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class FriendsService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendRepository: Repository<Friend>,
  ) {}

  async getAllFriends(id: number): Promise<Friend[]> {
    // Using TypeORM's repository methods to query the database
    return this.friendRepository
      .createQueryBuilder('friend')
      .select(['friend.id', 'friend.accepted', 'friend.created_at'])
      .addSelect(['userOne.name', 'userOne.id_42', 'userOne.status'])
      .addSelect(['userTwo.name', 'userTwo.id_42', 'userTwo.status'])
      .leftJoin('friend.userOne', 'userOne')
      .leftJoin('friend.userTwo', 'userTwo')
      .where('friend.accepted = true') // Filter accepted friends
      .andWhere('(friend.user_id_one = :id OR friend.user_id_two = :id)', { id })
      .getMany();
  }
  
  // Implement other methods as needed
}
