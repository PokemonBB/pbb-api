import { IsArray, IsOptional, IsString, ArrayMinSize } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class SeedResetDto {
  @ApiPropertyOptional({
    description:
      'List of collection names to drop and re-seed. If omitted or empty, all collections are dropped and all seed files are applied.',
    example: ['types', 'moves'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(0)
  @Transform(({ value }) =>
    Array.isArray(value) ? value.filter((v) => typeof v === 'string') : [],
  )
  collections?: string[];
}
