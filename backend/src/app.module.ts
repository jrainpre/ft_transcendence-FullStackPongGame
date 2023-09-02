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
import { UploadController } from './upload/upload.controller';
import { UploadService } from './upload/upload.service';
import { ConfigModule } from '@nestjs/config';
import { MessagesModule } from './messages/messages.module';

@Module({
  imports: [ ConfigModule.forRoot(),TypeOrmModule.forRoot({
    type: 'postgres', // Replace with your database type
    host: process.env.dbHost, // Replace with your database host
    port: parseInt(process.env.dbPort, 10), // Replace with your database port
    username: process.env.dbUser,
    password: process.env.dbPass,
    database: process.env.dbName,
    entities: ['dist/**/*.entity.js'], // Automatically load entity classes
    synchronize: true, // Auto-create database schema (in development)
  }),
  TypeOrmModule.forFeature([User])
    ,AuthModule, TfaModule, UserModule, EditModule, MessagesModule],
  controllers: [AppController, TfaController, EditController, UploadController],
  providers: [AppService, TfaService, EditService, UploadService,],
})
export class AppModule {}
