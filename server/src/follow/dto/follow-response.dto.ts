export class FollowUserResponseDto {
  id: string;
  name: string;
  image: string | null;
  username?: string;
  bio?: string;
  isFollowing: boolean;
}
