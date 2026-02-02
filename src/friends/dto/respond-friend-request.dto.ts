import { IsNotEmpty, IsString, IsMongoId } from 'class-validator';

export class RespondFriendRequestDto {
  @IsNotEmpty()
  @IsString()
  @IsMongoId()
  requestId: string;
}
