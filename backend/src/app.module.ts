import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TfaController } from './tfa/tfa.controller';
import { TfaService } from './tfa/tfa.service';
import { TfaModule } from './tfa/tfa.module';

@Module({
  imports: [AuthModule, TfaModule],
  controllers: [AppController, TfaController],
  providers: [AppService, TfaService],
})
export class AppModule {}
