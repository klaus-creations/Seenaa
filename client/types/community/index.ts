import { User } from "../user";

export type CommunityRole = "creator" | "admin" | "member";
export type MemberStatus = "active" | "pending" | "banned" | "left";
export type RequestStatus = "pending" | "approved" | "rejected";

/**
 * Granular permissions for Admin roles
 * Matches the 'PermissionAction' type in your NestJS service
 */
export interface AdminPermissions {
  canManageInfo: boolean;
  canManageMembers: boolean;
  canManageRoles: boolean;
  canVerifyPosts: boolean;
  canDeletePosts: boolean;
}

export interface CurrentUserContext {
  isMember: boolean;
  role: CommunityRole | null;
  status: MemberStatus | null;
  permissions: Partial<AdminPermissions> | null;
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
  requirePostApproval: boolean; // Added from service logic
  rules: string[] | null;
  welcomeMessage: string | null;
  memberCount: number;
  postCount: number;
  createdAt: string;
  updatedAt: string;

  currentUser?: CurrentUserContext;
}

/**
 * Represents a member record when listing community members
 */
export interface CommunityMember {
  id: string;
  communityId: string;
  userId: string;
  role: CommunityRole;
  status: MemberStatus;
  permissions: Partial<AdminPermissions> | Record<string, any>;
  joinedAt: string;
  leftAt: string | null;
  bannedAt: string | null;
  banReason: string | null;
  user: User
}

// ==========================
// DTOs (Data Transfer Objects)
// ==========================

export interface CreateCommunityDto {
  name: string;
  slug: string;
  description?: string;
  isPrivate?: boolean;
  requireApproval?: boolean;
}

export interface CommunityQueryDto {
  limit?: number;
  offset?: number;
  search?: string;
}

export interface JoinCommunityDto {
  message?: string;
}

export interface ReviewRequestDto {
  status: RequestStatus;
}

export interface UpdateMemberRoleDto {
  role: "admin" | "member";
  permissions: Partial<AdminPermissions>;
}

export interface BanMemberDto {
  reason: string;
}

export interface UpdateSettingsDto {
  name?: string;
  description?: string;
  avatar?: string;
  banner?: string;
  isPrivate?: boolean;
  requireApproval?: boolean;
  requirePostApproval?: boolean;
}

export interface CreateReportDto {
  targetType: "post" | "comment" | "member";
  targetId: string;
  reason: string;
}

// ==========================
// OBJECTS
// ==========================

export interface CommunityJoinRequest {
  id: string;
  communityId: string;
  userId: string;
  message: string | null;
  status: RequestStatus;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  // Included if using relations
  user: User
}

export interface CommunityReport {
  id: string;
  communityId: string;
  reporterId: string;
  targetType: "post" | "comment" | "member";
  targetId: string;
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  createdAt: string;
}
