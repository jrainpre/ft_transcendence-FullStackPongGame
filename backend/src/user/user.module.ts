import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthController } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockedUser } from 'src/entities/blocked_user.entity';

@Module({
  controllers: [UserController],
  providers: [UserService,],
  imports: [AuthModule, TypeOrmModule.forFeature([User, BlockedUser])],
})
export class UserModule {}
