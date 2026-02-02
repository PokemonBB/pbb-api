import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: true, collection: 'notifications' })
export class Notification {
  @Prop({ required: true })
  message: string;

  @Prop({
    type: String,
    enum: ['notification', 'info', 'warning', 'error', 'success'],
    default: 'notification',
  })
  type: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiver: Types.ObjectId;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

NotificationSchema.index({ receiver: 1, createdAt: -1 });
NotificationSchema.index({ receiver: 1 });
