import { Module } from '@nestjs/common';
import { EditService } from './edit.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';

@Module({})
export class EditModule {
    exports: [EditService]
}
