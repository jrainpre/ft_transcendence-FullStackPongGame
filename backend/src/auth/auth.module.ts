import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { FortyTwoStrategy } from './42.strategy';
import { AuthService } from './auth.service'; // Create this service


@Module({
    controllers: [AuthController],
    imports: [PassportModule],
    providers: [FortyTwoStrategy,
    AuthService],

})
export class AuthModule {}

