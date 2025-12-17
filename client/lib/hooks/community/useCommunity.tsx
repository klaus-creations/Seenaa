import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import {
  createCommunityRequest,
  getCommunitiesRequest,
  getCommunityRequest,
  joinCommunityRequest,
  leaveCommunityRequest,
  getCommunityRequestsRequest,
  reviewJoinRequestRequest,
  getCommunityMembersRequest,
  updateMemberRoleRequest,
  banMemberRequest,
  updateCommunitySettingsRequest,
  reportContentRequest,
} from "@/features/api/community.api";

import type {
  Community,
  CommunityJoinRequest,
  CommunityMember,
  CommunityQueryDto,
  CreateCommunityDto,
  JoinCommunityDto,
  UpdateMemberRoleDto,
  BanMemberDto,
  UpdateSettingsDto,
  CreateReportDto,
} from "@/types/community";

interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

// ==========================
// QUERIES
// ==========================

export const useGetCommunities = (query: CommunityQueryDto) => {
  return useQuery<Community[], AxiosError<ApiErrorResponse>>({
    queryKey: ["communities", query],
    queryFn: () => getCommunitiesRequest(query),
    placeholderData: (previousData) => previousData,
  });
};

export const useGetCommunity = (idOrSlug: string) => {
  return useQuery<Community, AxiosError<ApiErrorResponse>>({
    queryKey: ["community", idOrSlug],
    queryFn: () => getCommunityRequest(idOrSlug),
    enabled: !!idOrSlug,
    retry: 1,
  });
};

export const useGetCommunityRequests = (communityId: string) => {
  return useQuery<CommunityJoinRequest[], AxiosError<ApiErrorResponse>>({
    queryKey: ["community-requests", communityId],
    queryFn: () => getCommunityRequestsRequest(communityId),
    enabled: !!communityId,
  });
};

export const useGetCommunityMembers = (
  communityId: string,
  filter: "all" | "banned" | "admin" | "pending" = "all"
) => {
  return useQuery<CommunityMember[], AxiosError<ApiErrorResponse>>({
    queryKey: ["community-members", communityId, filter],
    queryFn: () => getCommunityMembersRequest(communityId, filter),
    enabled: !!communityId,
  });
};

// ==========================
// MUTATIONS
// ==========================

// Create Community
export const useCreateCommunity = () => {
  const queryClient = useQueryClient();
  return useMutation<Community, AxiosError<ApiErrorResponse>, CreateCommunityDto>({
    mutationFn: createCommunityRequest,
    onSuccess: (newCommunity) => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      queryClient.setQueryData(["community", newCommunity.slug], newCommunity);
    },
  });
};

// Join Community
export const useJoinCommunity = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { status: string; message: string },
    AxiosError<ApiErrorResponse>,
    { communityId: string; slug?: string; data: JoinCommunityDto }
  >({
    mutationFn: ({ communityId, data }) => joinCommunityRequest(communityId, data),
    onSuccess: (_, variables) => {
      // Invalidate specific community (to update currentUser status)
      if (variables.slug) {
        queryClient.invalidateQueries({ queryKey: ["community", variables.slug] });
      }
      queryClient.invalidateQueries({ queryKey: ["community", variables.communityId] });
      queryClient.invalidateQueries({ queryKey: ["communities"] });
    },
  });
};

// Leave Community
export const useLeaveCommunity = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { message: string },
    AxiosError<ApiErrorResponse>,
    { communityId: string; slug?: string }
  >({
    mutationFn: ({ communityId }) => leaveCommunityRequest(communityId),
    onSuccess: (_, variables) => {
      if (variables.slug) {
        queryClient.invalidateQueries({ queryKey: ["community", variables.slug] });
      }
      queryClient.invalidateQueries({ queryKey: ["community", variables.communityId] });
      queryClient.invalidateQueries({ queryKey: ["communities"] });
    },
  });
};

// Review Join Request
export const useReviewJoinRequest = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { message: string },
    AxiosError<ApiErrorResponse>,
    { requestId: string; communityId: string; status: "approved" | "rejected" }
  >({
    mutationFn: ({ requestId, status }) =>
      reviewJoinRequestRequest(requestId, { status }),
    onSuccess: (_, variables) => {
      // Refresh requests list
      queryClient.invalidateQueries({
        queryKey: ["community-requests", variables.communityId],
      });
      // If approved, member count changes
      if (variables.status === "approved") {
        queryClient.invalidateQueries({
          queryKey: ["community", variables.communityId],
        });
        queryClient.invalidateQueries({
          queryKey: ["community-members", variables.communityId],
        });
      }
    },
  });
};

// Update Member Role
export const useUpdateMemberRole = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { message: string },
    AxiosError<ApiErrorResponse>,
    { communityId: string; userId: string; data: UpdateMemberRoleDto }
  >({
    mutationFn: ({ communityId, userId, data }) =>
      updateMemberRoleRequest(communityId, userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["community-members", variables.communityId],
      });
    },
  });
};

// Ban Member
export const useBanMember = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { message: string },
    AxiosError<ApiErrorResponse>,
    { communityId: string; userId: string; data: BanMemberDto }
  >({
    mutationFn: ({ communityId, userId, data }) =>
      banMemberRequest(communityId, userId, data),
    onSuccess: (_, variables) => {
      // Refresh member list
      queryClient.invalidateQueries({
        queryKey: ["community-members", variables.communityId],
      });
      // Refresh community details (member count decreases)
      queryClient.invalidateQueries({
        queryKey: ["community", variables.communityId],
      });
    },
  });
};

// Update Settings
export const useUpdateSettings = () => {
  const queryClient = useQueryClient();
  return useMutation<
    { message: string },
    AxiosError<ApiErrorResponse>,
    { communityId: string; slug?: string; data: UpdateSettingsDto }
  >({
    mutationFn: ({ communityId, data }) =>
      updateCommunitySettingsRequest(communityId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["community", variables.communityId],
      });
      if (variables.slug) {
        queryClient.invalidateQueries({
          queryKey: ["community", variables.slug],
        });
      }
    },
  });
};

// Report Content
export const useReportContent = () => {
  return useMutation<
    { message: string },
    AxiosError<ApiErrorResponse>,
    { communityId: string; data: CreateReportDto }
  >({
    mutationFn: ({ communityId, data }) => reportContentRequest(communityId, data),
  });
};
