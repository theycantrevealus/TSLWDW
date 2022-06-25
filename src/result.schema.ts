import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ResultDocument = Result & Document;

@Schema()
export class Result {
  @Prop()
  sn: string

  @Prop()
  report_id: number

  @Prop()
  msisdn: string

  @Prop()
  lms_trxtime: string

  @Prop()
  lms_denom: string

  @Prop()
  lms_point: string

  @Prop()
  lms_tier: string

  @Prop()
  sl_trxtime: string

  @Prop()
  sl_denom: string

  @Prop()
  sl_point: string

  @Prop()
  sl_tier: string

  @Prop()
  status: string
}

export const ResultSchema = SchemaFactory.createForClass(Result);