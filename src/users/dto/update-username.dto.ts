import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdateUsernameDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  username: string;
}
