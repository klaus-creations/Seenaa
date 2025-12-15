export type CommunityRole = "creator" | "admin" | "moderator" | "member";
export type MemberStatus = "active" | "pending" | "banned" | "left";
export type RequestStatus = "pending" | "approved" | "rejected";

export interface CurrentUserContext {
  isMember: boolean;
  role: CommunityRole | null;
  status: MemberStatus | null;
  hasPendingRequest: boolean;
}

export interface Community {
  id: string;
  creatorId: string;
  name: string;
  slug: string;
  description: string | null;
  avatar: string | null;
  banner: string | null;
  isPrivate: boolean;
  requireApproval: boolean;
  memberCount: number;
  postCount: number;
  createdAt: string;
  updatedAt: string;

  currentUser?: CurrentUserContext;
}

// DTO for creating
export interface CreateCommunityDto {
  name: string;
  slug: string;
  description?: string;
  isPrivate?: boolean;
  requireApproval?: boolean;
}

// DTO for joining
export interface JoinCommunityDto {
  message?: string;
}

// DTO for listing
export interface CommunityQueryDto {
  limit?: number;
  offset?: number;
  search?: string;
}

// Join Request Object (for Admin Dashboard)
export interface CommunityJoinRequest {
  id: string;
  communityId: string;
  userId: string;
  message: string | null;
  status: RequestStatus;
  createdAt: string;
  // If you expand the backend to include user details, add them here
  // user?: { id: string; name: string; avatar: string };
}

// DTO for Reviewing
export interface ReviewRequestDto {
  status: "approved" | "rejected";
}
