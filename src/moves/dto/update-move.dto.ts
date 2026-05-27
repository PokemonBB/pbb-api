import {
  IsOptional,
  IsNumber,
  IsInt,
  IsArray,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMoveDto {
  @ApiPropertyOptional({
    description: 'Accuracy (0-100 or null for moves that never miss)',
    nullable: true,
    example: 100,
  })
  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsNumber()
  @Min(0)
  @Max(100)
  accuracy?: number | null;

  @ApiPropertyOptional({ description: 'Power', example: 40 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  power?: number;

  @ApiPropertyOptional({ description: 'PP', example: 35 })
  @IsOptional()
  @IsInt()
  @Min(0)
  pp?: number;

  @ApiPropertyOptional({ description: 'Priority', example: 0 })
  @IsOptional()
  @IsInt()
  @Min(-10)
  @Max(10)
  priority?: number;

  @ApiPropertyOptional({
    description: 'Numeric id of the move type (from types collection)',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  typeId?: number;

  @ApiPropertyOptional({
    description: 'List of pokemon numeric ids that learn this move',
    type: [Number],
    example: [1, 25, 133],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  learned_by_pokemon?: number[];
}
