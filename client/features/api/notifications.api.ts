import apiClient from "@/config/axios";

export type NotificationType =
  | "post_thumbs_up"
  | "post_thumbs_down"
  | "comment_on_post"
  | "reply_to_comment"
  | "comment_thumbs_up"
  | "comment_thumbs_down"
  | "mention_in_post"
  | "mention_in_comment"
  | "new_follower"
  | "community_invite"
  | "community_join_request"
  | "community_post"
  | "direct_message";

export interface NotificationDto {
  id: string;
  type: NotificationType;
  content: string;
  actionUrl: string;
  isRead: boolean;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    username: string;
    image: string | null;
  };
}

// 📡 API Calls
export const getNotificationsRequest = async (limit = 20, offset = 0) => {
  const res = await apiClient.get<NotificationDto[]>("/notifications", {
    params: { limit, offset },
  });
  return res.data;
};

export const markReadRequest = async (notificationId: string) => {
  await apiClient.patch(`/notifications/${notificationId}/read`);
};

export const markAllReadRequest = async () => {
  await apiClient.patch(`/notifications/read-all`);
};
