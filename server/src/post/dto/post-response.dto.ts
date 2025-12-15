export class AuthorDto {
  id: string;
  name: string;
  image: string | null;
  email?: string;
}
export class PostResponseDto {
  id: string;
  content: string;
  images: string[] | null;
  communityId: string | null;

  viewCount: number;
  thumbsUpCount: number;
  thumbsDownCount: number;
  commentCount: number;
  shareCount: number;

  mentions: string[] | null;
  hashtags: string[] | null;
  isPinned: boolean;

  author: AuthorDto;

  userReaction: 'thumbs_up' | 'thumbs_down' | null;

  createdAt: Date;
  updatedAt: Date;
  editedAt: Date | null;
}
