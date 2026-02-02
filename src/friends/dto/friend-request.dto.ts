import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class FriendRequestDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  receiverId: string;
}
