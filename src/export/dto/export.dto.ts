import { IsArray, IsOptional, IsString, ArrayMinSize } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class ExportDto {
  @ApiPropertyOptional({
    description:
      'List of collection names to export. If omitted or empty, all non-system collections are exported.',
    example: ['types', 'users'],
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
