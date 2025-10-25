import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditDocument = Audit & Document;

@Schema({ timestamps: true, collection: 'audits' })
export class Audit {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  action: string;

  @Prop({ required: true })
  resource: string;

  @Prop({ required: true })
  resourceId: string;

  @Prop({ type: Object, default: {} })
  oldValues?: Record<string, any>;

  @Prop({ type: Object, default: {} })
  newValues?: Record<string, any>;

  @Prop({ type: Date, default: Date.now, expires: 365 * 24 * 60 * 60 })
  expiresAt: Date;
}

export const AuditSchema = SchemaFactory.createForClass(Audit);
