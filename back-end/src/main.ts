import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import { AppModule } from './app.module';
import { parseEnv } from './env.validation';

config();

async function bootstrap() {
  const env = parseEnv();
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.enableCors({ origin: env.FRONTEND_URL, credentials: true });
  app.useGlobalPipes(new ValidationPipe());
  const port = Number(env.PORT);
  await app.listen(port);
}
bootstrap();
