import { IsNotEmpty, IsEmail } from 'class-validator';

export class UpdateEmailDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
