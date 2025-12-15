import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateCommentDto {
  @IsUUID('4', { message: 'Invalid Post ID' })
  @IsNotEmpty()
  postId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000, { message: 'Comment is too long' })
  content: string;

  @IsUUID('4', { message: 'Invalid Parent Comment ID' })
  @IsOptional()
  parentCommentId?: string;
}
