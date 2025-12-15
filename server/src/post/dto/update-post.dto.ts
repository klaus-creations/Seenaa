import { IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdatePostDto {
  @IsString()
  @MaxLength(2000, { message: 'Post content must not exceed 2000 characters' })
  @IsOptional()
  content?: string;

  @IsOptional()
  @IsString({ each: true })
  images?: string[];
}
