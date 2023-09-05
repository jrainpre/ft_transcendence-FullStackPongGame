// friends.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository} from 'typeorm';
import { Friend } from 'src/entities/friends.entity';
import { User } from 'src/entities/user.entity';
import { NotFoundError } from 'rxjs';

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
  
  async areUsersFriends(userId: number, friendId: number) : Promise<any>{
    const areFriends = await this.friendRepository.findOne({
        where: [{
            userOne: { id_42: userId },
            userTwo: { id_42 :friendId},
        },
    {
        userOne: { id_42 :friendId},
        userTwo: { id_42: userId },
    }
    ]
    })
    return !!areFriends;
}

  async addFriend(user: User, friend: User){
    const newFriend = new Friend;
    newFriend.userOne = user;
    newFriend.userTwo = friend;

    await this.friendRepository.save(newFriend);
    return;
  }

  async removeFriend(user: User, friend: User){
    const friendship = await this.friendRepository.findOne({
      where: [
        {
          userOne: {id_42: user.id_42},
          userTwo: {id_42: friend.id_42}
        },
        {
          userOne: {id_42: friend.id_42},
          userTwo: {id_42: user.id_42}
        }
      ]
    });

    if(!friendship)
      throw new NotFoundException('User not found');

    await this.friendRepository.remove(friendship);
  }
  // Implement other methods as needed
}
