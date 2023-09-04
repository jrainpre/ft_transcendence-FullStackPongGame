import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { FortyTwoStrategy } from './42.strategy';
import { AuthService } from './auth.service'; // Create this service
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategty } from './jwt.stategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';


@Module({
    controllers: [AuthController, ],
    imports: [PassportModule, 
            JwtModule.register({ secret: '1337Secret', //ENV
                                signOptions: {expiresIn: '1h'}}),
                                TypeOrmModule.forFeature([User])],
    providers: [FortyTwoStrategy,
    AuthService, JwtStrategty],
    exports: [AuthService]

})
export class AuthModule {}

