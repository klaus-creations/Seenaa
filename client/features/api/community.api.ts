import apiClient from "@/config/axios";
import {
  Community,
  CommunityJoinRequest,
  CommunityQueryDto,
  CreateCommunityDto,
  JoinCommunityDto,
  ReviewRequestDto,
} from "@/types/community";

export const createCommunityRequest = async (data: CreateCommunityDto) => {
  const res = await apiClient.post<Community>("/community", data);
  return res.data;
};

export const getCommunitiesRequest = async (query: CommunityQueryDto) => {
  const res = await apiClient.get<Community[]>("/community", {
    params: query,
  });
  return res.data;
};

export const getCommunityRequest = async (idOrSlug: string) => {
  const res = await apiClient.get<Community>(`/community/${idOrSlug}`);
  return res.data;
};

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
