import { IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateInvitationDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(30)
  expiresInDays?: number = 7; // Default 7 days
}
