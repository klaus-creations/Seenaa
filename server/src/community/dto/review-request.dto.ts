import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class ReviewRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['approved', 'rejected'])
  status: 'approved' | 'rejected';
}
