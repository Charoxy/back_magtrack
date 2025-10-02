import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from "@nestjs/common";
import * as cookieParser from 'cookie-parser';
import { GlobalSanitizePipe } from "./pipe/GlobalSanitizePipe";

async function bootstrap() {

  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true
  });
  app.useGlobalPipes(new GlobalSanitizePipe());
  await app.listen(process.env.PORT || 3000);

}

bootstrap();
