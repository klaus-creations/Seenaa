import { IsBoolean, IsEnum, IsOptional } from 'class-validator';

export enum ProfileTheme {
  DEFAULT = 'default',
  MINIMAL = 'minimal',
  NEO = 'neo',
  CLASSIC = 'classic',
}

export class UpdatePreferencesDto {
  @IsOptional()
  @IsBoolean()
  allowMessages?: boolean;

  @IsOptional()
  @IsBoolean()
  allowMentions?: boolean;

  @IsOptional()
  @IsBoolean()
  showActivityStatus?: boolean;

  @IsOptional()
  @IsEnum(ProfileTheme)
  profileTheme?: 'default' | 'minimal' | 'neo' | 'classic';
}
