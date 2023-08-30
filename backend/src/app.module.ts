import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TfaController } from './tfa/tfa.controller';
import { TfaService } from './tfa/tfa.service';
import { TfaModule } from './tfa/tfa.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { UserController } from './user/user.controller';
import { EditController } from './edit/edit.controller';
import { EditService } from './edit/edit.service';
import { EditModule } from './edit/edit.module';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forRoot({
    type: 'postgres', // Replace with your database type
    host: '10.12.200.86', // Replace with your database host
    port: 5432, // Replace with your database port
    username: 'jakob',
    password: 'pass123',
    database: 'my_db',
    entities: ['dist/**/*.entity.js'], // Automatically load entity classes
    synchronize: true, // Auto-create database schema (in development)
  }),
  TypeOrmModule.forFeature([User])
    ,AuthModule, TfaModule, UserModule, EditModule,],
  controllers: [AppController, TfaController, EditController],
  providers: [AppService, TfaService, EditService,],
})
export class AppModule {}
