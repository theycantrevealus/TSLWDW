import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller('pokemon')
export class AppController {
  constructor(private readonly appService: AppService) { }
}
