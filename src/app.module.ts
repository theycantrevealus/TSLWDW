import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import * as AutoIncrementFactory from 'mongoose-sequence';
import { ScheduleModule } from '@nestjs/schedule';
import { Report, ReportSchema } from './report.schema';
import { LMS, LMSSchema } from './lms.schema';
import { Result, ResultSchema } from './result.schema';
import { Connection } from 'mongoose';
require('dotenv').config();

@Module({
  imports: [
    MongooseModule.forRoot(`${process.env.MONGO_CONNECTION}`),
    MongooseModule.forFeatureAsync([
      {
        name: Report.name,
        useFactory: async (connection: Connection) => {
          const schema = ReportSchema;
          const AutoIncrement = AutoIncrementFactory(connection);
          schema.plugin(AutoIncrement, { inc_field: 'id' });
          return schema;
        },
        inject: [getConnectionToken()],
      },
      {
        name: LMS.name,
        useFactory: async (connection: Connection) => {
          const schema = LMSSchema;
          return schema;
        },
        inject: [getConnectionToken()],
      },
      {
        name: Result.name,
        useFactory: async (connection: Connection) => {
          const schema = ResultSchema;
          return schema;
        },
        inject: [getConnectionToken()],
      }
    ]),
    // MongooseModule.forFeature([
    //   { name: 'Report', schema: Report.name },
    //   { name: 'LMS', schema: LMS.name },
    //   { name: 'Result', schema: Result.name }
    // ]),
    ScheduleModule.forRoot()
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  //
}
