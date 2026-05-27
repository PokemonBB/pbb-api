import { IsInt, IsIn, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export const DAMAGE_MULTIPLIERS = ['x2', 'x0.5', 'x0', 'x1'] as const;
export type DamageMultiplier = (typeof DAMAGE_MULTIPLIERS)[number];

export class UpdateDamageRelationDto {
  @ApiProperty({
    description: 'Type id of the attacking type (1–18)',
    example: 9,
  })
  @IsInt()
  @Min(1)
  attackerId: number;

  @ApiProperty({
    description: 'Type id of the defending type (1–18)',
    example: 18,
  })
  @IsInt()
  @Min(1)
  defenderId: number;

  @ApiProperty({
    description:
      'New damage multiplier: x2 (double), x0.5 (half), x0 (immune), x1 (neutral)',
    enum: DAMAGE_MULTIPLIERS,
    example: 'x0.5',
  })
  @IsIn(DAMAGE_MULTIPLIERS)
  multiplier: DamageMultiplier;
}
