import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  const corsOptions: CorsOptions = {
    origin: process.env.frontendUrl,
    credentials: true, // Allow sending cookies and other credentials
  };

  app.useGlobalPipes(new ValidationPipe());
  app.use('/img', express.static('img'));
  app.enableCors(corsOptions);
  await app.listen(3001);
}
bootstrap();
