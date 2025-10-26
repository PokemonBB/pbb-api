import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { UserRole } from '../enums/user-role.enum';

export type UserDocument = User & Document;

@Schema({ _id: false })
export class UserConfiguration {
  @Prop({ type: String, enum: ['es', 'en'] })
  language?: string;

  @Prop({ type: String, enum: ['system', 'dark', 'light'] })
  theme?: string;
}

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Prop({
    type: Boolean,
    default: false,
  })
  active: boolean;

  @Prop({
    type: Boolean,
    default: false,
  })
  canInvite: boolean;

  @Prop({ type: UserConfiguration })
  configuration?: UserConfiguration;
}

export const UserSchema = SchemaFactory.createForClass(User);
