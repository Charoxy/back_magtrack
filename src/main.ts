import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from 'cookie-parser';
import { GlobalSanitizePipe } from "./pipe/GlobalSanitizePipe";

async function bootstrap() {
  console.log('=== APPLICATION STARTING ===');
  console.log('Environment variables:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_USERNAME:', process.env.DB_USERNAME);
  console.log('DB_DATABASE:', process.env.DB_DATABASE);
  console.log('CORS_ORIGIN:', process.env.CORS_ORIGIN);
  console.log('PORT:', process.env.PORT);
  console.log('===========================');

  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true
  });
  app.useGlobalPipes(new GlobalSanitizePipe());

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
