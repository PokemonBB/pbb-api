import { IsEnum, IsOptional } from 'class-validator';

export class UpdateConfigurationDto {
  @IsOptional()
  @IsEnum(['es', 'en'])
  language?: 'es' | 'en';

  @IsOptional()
  @IsEnum(['system', 'dark', 'light'])
  theme?: 'system' | 'dark' | 'light';
}
