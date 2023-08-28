import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from "passport";
import { JwtModule } from '@nestjs/jwt';
import * as cookieParser from 'cookie-parser';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  const corsOptions: CorsOptions = {
    origin: '*', // Allow requests from your Angular app
    credentials: true, // Allow sending cookies and other credentials
  };

  app.enableCors(corsOptions);
  await app.listen(3001);
}
bootstrap();
