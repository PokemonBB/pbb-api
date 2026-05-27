import {
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  Min,
  IsString,
  IsNumber,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PokemonTypeSlotDto {
  @ApiPropertyOptional({ description: 'Slot (1 or 2)', example: 1 })
  @IsInt()
  @Min(1)
  slot: number;

  @ApiPropertyOptional({
    description: 'Numeric id of the Pokémon type (from types collection)',
    example: 12,
  })
  @IsInt()
  @Min(1)
  typeId: number;
}

export class PokemonStatDto {
  @ApiPropertyOptional({
    description:
      'Stat name (hp, attack, defense, special-attack, special-defense, speed)',
    example: 'hp',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Base stat value', example: 45 })
  @IsNumber()
  @Min(0)
  base_stat: number;
}

export class UpdatePokemonDto {
  @ApiPropertyOptional({
    description: 'List of type slots to set (replaces current types)',
    type: [PokemonTypeSlotDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PokemonTypeSlotDto)
  @ArrayMinSize(1)
  types?: PokemonTypeSlotDto[];

  @ApiPropertyOptional({
    description: 'List of base stats to set (replaces current stats)',
    type: [PokemonStatDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PokemonStatDto)
  @ArrayMinSize(1)
  stats?: PokemonStatDto[];
}
