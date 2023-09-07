import { Injectable } from '@nestjs/common';
import { EntityRepository, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron } from '@nestjs/schedule';
import { StatusService } from './status/status.service';

@Injectable()
export class AppService {
  constructor(private status: StatusService) {}

  @Cron('0/3 * * * * *')
  handleCron(){
    this.status.setUserOnlineTimestamp();
    this.status.setUserOfflineAfterTimeout();
  }
}
