import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LMSDocument = LMS & Document;

@Schema()
export class LMS {
  @Prop()
  report_id: number

  @Prop()
  date: string

  @Prop()
  run_time: string;

  @Prop()
  from_time: string;

  @Prop()
  file_name: string;
}

export const LMSSchema = SchemaFactory.createForClass(LMS);