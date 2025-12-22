import { Inject, Injectable } from '@nestjs/common';
import {
  ilike,
  or,
  and,
  desc,
  eq,
  ne,
  arrayContains,
  sql,
  gte,
  SQL,
  notInArray,
} from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from '../database/schema';
import {
  SearchQueryDto,
  SearchType,
  SortOption,
  DateRange,
} from './dto/search.dto';

@Injectable()
export class SearchService {
  constructor(@Inject('DB') private db: NodePgDatabase<typeof schema>) {}

  async search(dto: SearchQueryDto, currentUserId?: string) {
    const results: {
      people?: any[];
      communities?: any[];
      posts?: any[];
    } = {};

    const promises: Promise<void>[] = [];

    if (dto.type === SearchType.ALL || dto.type === SearchType.PEOPLE) {
      promises.push(
        this.searchUsers(dto, currentUserId).then((res) => {
          results.people = res;
        }),
      );
    }

    if (dto.type === SearchType.ALL || dto.type === SearchType.COMMUNITY) {
      promises.push(
        this.searchCommunities(dto).then((res) => {
          results.communities = res;
        }),
      );
    }

    if (dto.type === SearchType.ALL || dto.type === SearchType.POST) {
      promises.push(
        this.searchPosts(dto).then((res) => {
          results.posts = res;
        }),
      );
    }

    await Promise.all(promises);
    return results;
  }

  // =========================================================
  // 1. PEOPLE SEARCH (Excludes Self)
  // =========================================================
  private async searchUsers(dto: SearchQueryDto, currentUserId?: string) {
    const filters: SQL[] = [];

    filters.push(eq(schema.user.isBanned, false));

    // Modern Logic: Never show the current logged-in user in suggestions or search
    if (currentUserId) {
      filters.push(ne(schema.user.id, currentUserId));
    }

    if (dto.q && dto.q.trim() !== '') {
      const searchPattern = `%${dto.q}%`;
      filters.push(
        or(
          ilike(schema.user.username, searchPattern),
          ilike(schema.user.displayUsername, searchPattern),
          ilike(schema.user.name, searchPattern),
          ilike(schema.user.bio, searchPattern),
        )!,
      );
    }

    if (dto.verifiedOnly) filters.push(eq(schema.user.isVerified, true));
    if (dto.isOnline) filters.push(eq(schema.user.isOnline, true));
    if (dto.country) filters.push(ilike(schema.user.country, dto.country));
    if (dto.minFollowers)
      filters.push(gte(schema.user.followerCount, dto.minFollowers));

    let orderBy: SQL[] = [];
    switch (dto.sortBy) {
      case SortOption.NEWEST:
        orderBy = [desc(schema.user.createdAt)];
        break;
      case SortOption.POPULAR:
        orderBy = [desc(schema.user.followerCount)];
        break;
      case SortOption.RELEVANCE:
      default:
        orderBy = [
          desc(schema.user.isVerified),
          desc(schema.user.followerCount),
        ];
        break;
    }

    return this.db.query.user.findMany({
      where: filters.length > 0 ? and(...filters) : undefined,
      limit: dto.limit,
      offset: dto.offset,
      orderBy,
      columns: {
        id: true,
        name: true,
        username: true,
        image: true,
        bio: true,
        country: true,
        followerCount: true,
        isVerified: true,
        isOnline: true,
      },
    });
  }

  // =========================================================
  // 2. COMMUNITY RECOMMENDATIONS (Discovery Algorithm)
  // =========================================================
  async getRecommendedCommunities(currentUserId?: string, limit = 5) {
    const filters: SQL[] = [];
    filters.push(eq(schema.community.isPrivate, false));

    // Algorithm: Don't recommend communities the user is already a member of
    if (currentUserId) {
      const userMemberships = this.db
        .select({ id: schema.communityMember.communityId })
        .from(schema.communityMember)
        .where(eq(schema.communityMember.userId, currentUserId));

      filters.push(notInArray(schema.community.id, userMemberships));
    }

    return this.db.query.community.findMany({
      where: filters.length > 0 ? and(...filters) : undefined,
      limit: limit,
      // Sort by high activity (member count + post count)
      orderBy: [
        desc(schema.community.memberCount),
        desc(schema.community.postCount),
      ],
      columns: {
        id: true,
        name: true,
        slug: true,
        avatar: true,
        description: true,
        memberCount: true,
        postCount: true,
      },
    });
  }

  // =========================================================
  // 3. POST SEARCH
  // =========================================================
  private async searchPosts(dto: SearchQueryDto) {
    const filters: SQL[] = [];
    filters.push(sql`${schema.post.deletedAt} IS NULL`);

    if (dto.q && dto.q.trim() !== '') {
      const searchPattern = `%${dto.q}%`;
      filters.push(
        or(
          ilike(schema.post.content, searchPattern),
          arrayContains(schema.post.hashtags, [dto.q]),
          arrayContains(schema.post.mentions, [dto.q]),
        )!,
      );
    }

    if (dto.dateRange && dto.dateRange !== DateRange.ALL_TIME) {
      const dateLimit = new Date();
      if (dto.dateRange === DateRange.TODAY)
        dateLimit.setDate(dateLimit.getDate() - 1);
      else if (dto.dateRange === DateRange.WEEK)
        dateLimit.setDate(dateLimit.getDate() - 7);
      else if (dto.dateRange === DateRange.MONTH)
        dateLimit.setMonth(dateLimit.getMonth() - 1);
      filters.push(gte(schema.post.createdAt, dateLimit));
    }

    return this.db.query.post.findMany({
      where: filters.length > 0 ? and(...filters) : undefined,
      limit: dto.limit,
      offset: dto.offset,
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            name: true,
            image: true,
            isVerified: true,
          },
        },
        community: {
          columns: { id: true, name: true, slug: true, avatar: true },
        },
      },
      orderBy: [desc(schema.post.createdAt)],
    });
  }

  // =========================================================
  // 4. COMMUNITY SEARCH (Standard)
  // =========================================================
  private async searchCommunities(dto: SearchQueryDto) {
    const filters: SQL[] = [];
    if (dto.q && dto.q.trim() !== '') {
      const searchPattern = `%${dto.q}%`;
      filters.push(
        or(
          ilike(schema.community.name, searchPattern),
          ilike(schema.community.slug, searchPattern),
          ilike(schema.community.description, searchPattern),
        )!,
      );
    }

    return this.db.query.community.findMany({
      where: filters.length > 0 ? and(...filters) : undefined,
      limit: dto.limit,
      offset: dto.offset,
      orderBy: [desc(schema.community.memberCount)],
    });
  }
}
