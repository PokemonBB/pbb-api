import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FriendshipDocument = Friendship & Document;

@Schema({ timestamps: true, collection: 'friendships' })
export class Friendship {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  requester: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  receiver: Types.ObjectId;

  @Prop({
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
  })
  status: string;

  @Prop({ type: Date, default: null })
  respondedAt?: Date;
}

export const FriendshipSchema = SchemaFactory.createForClass(Friendship);

// Indexes for optimization
FriendshipSchema.index({ requester: 1, receiver: 1 }, { unique: true });
FriendshipSchema.index({ status: 1 });
FriendshipSchema.index({ requester: 1, status: 1 });
FriendshipSchema.index({ receiver: 1, status: 1 });

// Prevent auto-solicitudes
FriendshipSchema.pre('save', function (next) {
  if (this.requester.toString() === this.receiver.toString()) {
    return next(new Error('Cannot send friend request to yourself'));
  }
  next();
});
