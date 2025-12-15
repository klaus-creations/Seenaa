import { relations } from 'drizzle-orm';
import { post, reaction, bookmark } from '../post/schema';
import { user, session, account } from '../auth/schema';
import { notification, notificationPreference } from '../notifications/schema'; // Import added
import { follow } from '../user/schema'; // Import follow table

import {
  community,
  communityMember,
  communityInvitation,
  communityJoinRequest,
} from '../community/schema';
import { comment } from '../comment/schema';

// AUTH RELATIONS
export const userRelations = relations(user, ({ many, one }) => ({
  sessions: many(session),
  accounts: many(account),

  posts: many(post),
  comments: many(comment),
  reactions: many(reaction),
  bookmarks: many(bookmark),
  communityMemberships: many(communityMember),
  ownedCommunities: many(community, { relationName: 'creator' }),

  // New Notification Relations
  notifications: many(notification, { relationName: 'recipient' }),
  notificationPreference: one(notificationPreference),

  // Follow Relations
  followers: many(follow, { relationName: 'following' }),
  following: many(follow, { relationName: 'follower' }),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// NOTIFICATION RELATIONS (New)
export const notificationRelations = relations(notification, ({ one }) => ({
  // The user who receives the notification
  user: one(user, {
    fields: [notification.userId],
    references: [user.id],
    relationName: 'recipient', // Matches relationName in userRelations
  }),
  // The user who triggered the notification (e.g., the person who liked the post)
  actor: one(user, {
    fields: [notification.actorId],
    references: [user.id],
    relationName: 'actor',
  }),
}));

export const notificationPreferenceRelations = relations(
  notificationPreference,
  ({ one }) => ({
    user: one(user, {
      fields: [notificationPreference.userId],
      references: [user.id],
    }),
  }),
);

// POST RELATIONS
export const postRelations = relations(post, ({ one, many }) => ({
  user: one(user, {
    fields: [post.userId],
    references: [user.id],
  }),
  community: one(community, {
    fields: [post.communityId],
    references: [community.id],
  }),
  comments: many(comment),
  reactions: many(reaction),
  bookmarks: many(bookmark),
}));

export const commentRelations = relations(comment, ({ one }) => ({
  post: one(post, {
    fields: [comment.postId],
    references: [post.id],
  }),
  user: one(user, {
    fields: [comment.userId],
    references: [user.id],
  }),
}));

// COMMUNITY RELATIONS
export const communityRelations = relations(community, ({ one, many }) => ({
  creator: one(user, {
    fields: [community.creatorId],
    references: [user.id],
    relationName: 'creator',
  }),
  members: many(communityMember),
  posts: many(post),
}));

export const communityMemberRelations = relations(
  communityMember,
  ({ one }) => ({
    user: one(user, {
      fields: [communityMember.userId],
      references: [user.id],
    }),
    community: one(community, {
      fields: [communityMember.communityId],
      references: [community.id],
    }),
  }),
);

export const communityInvitationRelations = relations(
  communityInvitation,
  ({ one }) => ({
    community: one(community, {
      fields: [communityInvitation.communityId],
      references: [community.id],
    }),
    inviter: one(user, {
      fields: [communityInvitation.inviterId],
      references: [user.id],
    }),
    invitee: one(user, {
      fields: [communityInvitation.inviteeId],
      references: [user.id],
    }),
  }),
);

export const communityJoinRequestRelations = relations(
  communityJoinRequest,
  ({ one }) => ({
    community: one(community, {
      fields: [communityJoinRequest.communityId],
      references: [community.id],
    }),
    user: one(user, {
      fields: [communityJoinRequest.userId],
      references: [user.id],
    }),
    reviewedByUser: one(user, {
      fields: [communityJoinRequest.reviewedBy],
      references: [user.id],
    }),
  }),
);

// INTERACTION RELATIONS
export const reactionRelations = relations(reaction, ({ one }) => ({
  user: one(user, {
    fields: [reaction.userId],
    references: [user.id],
  }),
  post: one(post, {
    fields: [reaction.targetId],
    references: [post.id],
  }),
}));

export const bookmarkRelations = relations(bookmark, ({ one }) => ({
  user: one(user, {
    fields: [bookmark.userId],
    references: [user.id],
  }),
  post: one(post, {
    fields: [bookmark.postId],
    references: [post.id],
  }),
}));

// FOLLOW RELATIONS
export const followRelations = relations(follow, ({ one }) => ({
  follower: one(user, {
    fields: [follow.followerId],
    references: [user.id],
    relationName: 'follower',
  }),
  following: one(user, {
    fields: [follow.followingId],
    references: [user.id],
    relationName: 'following',
  }),
}));
