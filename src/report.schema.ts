import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ReportDocument = Report & Document;

@Schema()
export class Report {
  @Prop()
  id: number

  @Prop()
  report_created: string

  @Prop()
  report_type: number;
}

export const ReportSchema = SchemaFactory.createForClass(Report);