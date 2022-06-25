import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport } from '@nestjs/microservices';
require('dotenv').config();

async function bootstrap () {
  const app = await NestFactory.createMicroservice(AppModule);
  await app.listen().then(() => console.log('Microservice is listening'));
}
bootstrap();
