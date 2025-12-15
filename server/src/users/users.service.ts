;import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { eq, sql, ilike, or } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePreferencesDto } from './dto/update-preference.dto';
import { schema } from '../database/schema';
import { user } from '../auth/schema';

@Injectable()
export class UserService {
constructor(@Inject('DB') private db: NodePgDatabase<typeof schema>) {}


  /**
   * Find a user by their ID (Internal use or Session use)
   */
  async findById(userId: string) {
    const [foundUser] = await this.db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!foundUser) throw new NotFoundException('User not found');
    return foundUser;
  }

  /**
   * Find a public profile by username
   */
  async findByUsername(username: string, viewerId?: string) {
    const [foundUser] = await this.db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        displayUsername: user.displayUsername,
        image: user.image,
        bio: user.bio,
        country: user.country,
        city: user.city,
        languages: user.languages,
        followingCount: user.followingCount,
        followerCount: user.followerCount,
        postsCount: user.postsCount,
        profileTheme: user.profileTheme,
        createdAt: user.createdAt,
        isVerified: user.isVerified,
        // Only return these if the user allows activity status
        isOnline: sql<boolean>`CASE WHEN ${user.showActivityStatus} IS TRUE THEN ${user.isOnline} ELSE false END`,
        lastActiveAt: sql<Date>`CASE WHEN ${user.showActivityStatus} IS TRUE THEN ${user.lastActiveAt} ELSE null END`,
      })
      .from(user)
      .where(eq(user.username, username))
      .limit(1);

    if (!foundUser) throw new NotFoundException('User not found');

    // Here you might check if the viewerId follows this user
    // to add a `isFollowing` boolean to the response.

    return foundUser;
  }

  /**
   * Search users by name or username (Fuzzy search)
   */
  async searchUsers(query: string, limit = 10) {
    if (!query) return [];

    return this.db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        image: user.image,
        followerCount: user.followerCount,
      })
      .from(user)
      .where(
        or(
          ilike(user.username, `%${query}%`),
          ilike(user.name, `%${query}%`)
        )
      )
      .limit(limit);
  }

  /**
   * Update Public Profile Information
   */
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // Check if username is taken if they are trying to change it
    // (Assuming username updates are handled here, otherwise remove displayUsername logic)

    const [updatedUser] = await this.db
      .update(user)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning();

    return updatedUser;
  }

  /**
   * Update Settings / Preferences
   */
  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    const [updatedUser] = await this.db
      .update(user)
      .set({
        ...dto,
        updatedAt: new Date(),
      })
      .where(eq(user.id, userId))
      .returning();

    return updatedUser;
  }

  /**
   * Increment Profile View Count
   * Should be called when someone visits a profile
   */
  async incrementProfileView(targetUsername: string) {
    // We update by username because usually the URL is /u/:username
    await this.db
      .update(user)
      .set({
        profileViewsCount: sql`${user.profileViewsCount} + 1`,
      })
      .where(eq(user.username, targetUsername));

    return { success: true };
  }

  /**
   * Update Online Status (Can be used by a Gateway/Websocket or Interceptor)
   */
  async updateStatus(userId: string, isOnline: boolean) {
    await this.db
      .update(user)
      .set({
        isOnline: isOnline,
        lastActiveAt: new Date(),
      })
      .where(eq(user.id, userId));
  }
}
