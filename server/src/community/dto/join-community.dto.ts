import { IsOptional, IsString, MaxLength } from 'class-validator';

export class JoinCommunityDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  message?: string;
}


