import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InvitationDocument = Invitation & Document;

@Schema({ timestamps: true })
export class Invitation {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ default: false })
  used: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  usedBy?: Types.ObjectId;

  @Prop({ required: true, index: { expireAfterSeconds: 0 } })
  expiresAt: Date;
}

export const InvitationSchema = SchemaFactory.createForClass(Invitation);
