import { IsOptional, IsString, IsDateString, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

const VALID_ACTIONS = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'REGISTER',
  'LOGIN_FAILURE',
  'USE',
  'READ',
  'UNKNOWN',
] as const;

const VALID_RESOURCES = [
  'USER',
  'AUTH',
  'INVITATION',
  'NOTIFICATION',
  'FRIENDSHIP',
  'UNKNOWN',
] as const;

export class AuditFilterDto {
  @ApiPropertyOptional({
    description: 'Filter by username (partial, case-insensitive)',
    example: 'admin',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: 'Filter by userId (exact match)',
    example: '69806b5bb2d75f0114510877',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filter by action',
    enum: VALID_ACTIONS,
    example: 'UPDATE',
  })
  @IsOptional()
  @IsString()
  @IsIn(VALID_ACTIONS)
  action?: string;

  @ApiPropertyOptional({
    description: 'Filter by resource',
    enum: VALID_RESOURCES,
    example: 'USER',
  })
  @IsOptional()
  @IsString()
  @IsIn(VALID_RESOURCES)
  resource?: string;

  @ApiPropertyOptional({
    description: 'Filter by resourceId (exact match)',
    example: '69806b5bb2d75f0114510877',
  })
  @IsOptional()
  @IsString()
  resourceId?: string;

  @ApiPropertyOptional({
    description: 'Start date for date range filter (ISO 8601)',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({
    description: 'End date for date range filter (ISO 8601)',
    example: '2026-02-08T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
