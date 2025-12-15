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
} from "@/features/api/community.api";

import type {
  Community,
  CommunityJoinRequest,
  CommunityQueryDto,
  CreateCommunityDto,
  JoinCommunityDto,
} from "@/types/community";

interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

// Get All Communities
export const useGetCommunities = (query: CommunityQueryDto) => {
  return useQuery<Community[], AxiosError<ApiErrorResponse>>({
    queryKey: ["communities", query],
    queryFn: () => getCommunitiesRequest(query),
    placeholderData: (previousData) => previousData,
  });
};

//  Fetch a single community by ID or Slug
export const useGetCommunity = (idOrSlug: string) => {
  return useQuery<Community, AxiosError<ApiErrorResponse>>({
    queryKey: ["community", idOrSlug],
    queryFn: () => getCommunityRequest(idOrSlug),
    enabled: !!idOrSlug,
    retry: 1,
  });
};

//  Fetch pending join requests (Admin Dashboard)
export const useGetCommunityRequests = (communityId: string) => {
  return useQuery<CommunityJoinRequest[], AxiosError<ApiErrorResponse>>({
    queryKey: ["community-requests", communityId],
    queryFn: () => getCommunityRequestsRequest(communityId),
    enabled: !!communityId,
  });
};

//  Create a new community
export const useCreateCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation<
    Community,
    AxiosError<ApiErrorResponse>,
    CreateCommunityDto
  >({
    mutationFn: createCommunityRequest,
    onSuccess: (newCommunity) => {
      queryClient.invalidateQueries({
        queryKey: ["communities"],
      });

      queryClient.setQueryData(["community", newCommunity.slug], newCommunity);
    },
  });
};

// Join a community
export const useJoinCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { status: string; message: string },
    AxiosError<ApiErrorResponse>,
    { communityId: string; slug?: string; data: JoinCommunityDto }
  >({
    mutationFn: ({ communityId, data }) =>
      joinCommunityRequest(communityId, data),
    onSuccess: (_, variables) => {
      if (variables.slug) {
        queryClient.invalidateQueries({
          queryKey: ["community", variables.slug],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["community", variables.communityId],
      });

      queryClient.invalidateQueries({
        queryKey: ["communities"],
      });
    },
  });
};

// Leave a community
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
        queryClient.invalidateQueries({
          queryKey: ["community", variables.slug],
        });
      }
      queryClient.invalidateQueries({
        queryKey: ["community", variables.communityId],
      });

      queryClient.invalidateQueries({
        queryKey: ["communities"],
      });
    },
  });
};

// Review a join request (Admin)
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
      queryClient.invalidateQueries({
        queryKey: ["community-requests", variables.communityId],
      });

      if (variables.status === "approved") {
        queryClient.invalidateQueries({
          queryKey: ["community", variables.communityId],
        });
      }
    },
  });
};
