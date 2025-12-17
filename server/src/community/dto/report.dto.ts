import { IsEnum, IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateReportDto {
  @IsEnum(['post', 'comment', 'user'])
  targetType: 'post' | 'comment' | 'user';

  @IsString()
  @IsNotEmpty()
  targetId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason: string;
}
