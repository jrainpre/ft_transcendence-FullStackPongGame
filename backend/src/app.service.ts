import { Injectable } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { User } from './entities/user.entety';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  
}
