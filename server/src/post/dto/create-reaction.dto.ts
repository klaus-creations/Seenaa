import { IsEnum } from 'class-validator';

export enum ReactionType {
  THUMBS_UP = 'thumbs_up',
  THUMBS_DOWN = 'thumbs_down',
}

export class CreateReactionDto {
  @IsEnum(ReactionType)
  reactionType: ReactionType;
}
