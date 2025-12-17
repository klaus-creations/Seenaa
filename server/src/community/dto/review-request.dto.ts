import { IsEnum, IsNotEmpty } from 'class-validator';

export class ReviewRequestDto {
  @IsEnum(['approved', 'rejected'])
  @IsNotEmpty()
  status: 'approved' | 'rejected';
}
