import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ActivationCodeDocument = ActivationCode & Document;

@Schema({ timestamps: true, collection: 'activation_codes' })
export class ActivationCode {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  email: string;

  @Prop({ default: false })
  used: boolean;

  @Prop({ required: true, index: { expireAfterSeconds: 0 } })
  expiresAt: Date;
}

export const ActivationCodeSchema =
  SchemaFactory.createForClass(ActivationCode);
