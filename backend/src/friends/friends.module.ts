// friends.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Friend } from 'src/entities/friends.entity'; // Import your Friend entity
import { FriendsController } from 'src/friends/friends.controller'; // Import the controller
import { FriendsService } from 'src/friends/friends.service'; // Import the service


@Module({
  imports: [TypeOrmModule.forFeature([Friend])],
  controllers: [FriendsController],
  providers: [FriendsService],
})
export class FriendsModule {}
