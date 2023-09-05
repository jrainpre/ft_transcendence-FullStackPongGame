// friends.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { Friend } from 'src/entities/friends.entity'; // Import your Friend entity
import { FriendsController } from 'src/friends/friends.controller'; // Import the controller
import { FriendsService } from 'src/friends/friends.service'; // Import the service


@Module({
  imports: [TypeOrmModule.forFeature([Friend]), AuthModule],
  controllers: [FriendsController],
  providers: [FriendsService],
})
export class FriendsModule {}
