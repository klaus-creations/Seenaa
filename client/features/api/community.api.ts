import apiClient from "@/config/axios";
import {
  Community,
  CommunityJoinRequest,
  CommunityMember,
  CommunityQueryDto,
  CreateCommunityDto,
  JoinCommunityDto,
  ReviewRequestDto,
  UpdateMemberRoleDto,
  BanMemberDto,
  UpdateSettingsDto,
  CreateReportDto,
} from "@/types/community";

// --- Core & Discovery ---

export const createCommunityRequest = async (data: CreateCommunityDto) => {
  const res = await apiClient.post<Community>("/community", data);
  return res.data;
};

export const getCommunitiesRequest = async (query: CommunityQueryDto) => {
  const res = await apiClient.get<Community[]>("/community", { params: query });
  return res.data;
};

export const getCommunityRequest = async (idOrSlug: string) => {
  const res = await apiClient.get<Community>(`/community/${idOrSlug}`);
  return res.data;
};

// --- Actions ---

export const joinCommunityRequest = async (
  communityId: string,
  data: JoinCommunityDto
) => {
  const res = await apiClient.post<{ status: string; message: string }>(
    `/community/${communityId}/join`,
    data
  );
  return res.data;
};

export const leaveCommunityRequest = async (communityId: string) => {
  const res = await apiClient.post<{ message: string }>(
    `/community/${communityId}/leave`
  );
  return res.data;
};

// --- Member Management ---

export const getCommunityRequestsRequest = async (communityId: string) => {
  const res = await apiClient.get<CommunityJoinRequest[]>(
    `/community/${communityId}/requests`
  );
  return res.data;
};

export const reviewJoinRequestRequest = async (
  requestId: string,
  data: ReviewRequestDto
) => {
  const res = await apiClient.post<{ message: string }>(
    `/community/requests/${requestId}/review`,
    data
  );
  return res.data;
};

export const getCommunityMembersRequest = async (
  communityId: string,
  filter: "all" | "banned" | "admin" | "pending" = "all"
) => {
  const res = await apiClient.get<CommunityMember[]>(
    `/community/${communityId}/members`,
    { params: { filter } }
  );
  return res.data;
};

export const updateMemberRoleRequest = async (
  communityId: string,
  userId: string,
  data: UpdateMemberRoleDto
) => {
  const res = await apiClient.patch<{ message: string }>(
    `/community/${communityId}/members/${userId}/role`,
    data
  );
  return res.data;
};

export const banMemberRequest = async (
  communityId: string,
  userId: string,
  data: BanMemberDto
) => {
  const res = await apiClient.post<{ message: string }>(
    `/community/${communityId}/members/${userId}/ban`,
    data
  );
  return res.data;
};

// --- Settings & Reports ---

export const updateCommunitySettingsRequest = async (
  communityId: string,
  data: UpdateSettingsDto
) => {
  const res = await apiClient.patch<{ message: string }>(
    `/community/${communityId}/settings`,
    data
  );
  return res.data;
};

export const reportContentRequest = async (
  communityId: string,
  data: CreateReportDto
) => {
  const res = await apiClient.post<{ message: string }>(
    `/community/${communityId}/report`,
    data
  );
  return res.data;
};
