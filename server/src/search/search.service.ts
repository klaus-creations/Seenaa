import { Inject, Injectable } from '@nestjs/common';
import {
  ilike,
  or,
  and,
  desc,
  eq,
  arrayContains,
  sql,
  gte,
  SQL,
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

  async search(dto: SearchQueryDto) {
    const results: {
      people?: any[];
      communities?: any[];
      posts?: any[];
    } = {};

    // FIX 1: Explicitly type the promises array to avoid 'never' error
    const promises: Promise<void>[] = [];

    if (dto.type === SearchType.ALL || dto.type === SearchType.PEOPLE) {
      promises.push(
        this.searchUsers(dto).then((res) => {
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
  // 1. PEOPLE SEARCH
  // =========================================================
  private async searchUsers(dto: SearchQueryDto) {
    // FIX 2: Explicitly type the filters array as SQL[]
    const filters: SQL[] = [];

    // Always exclude banned users
    filters.push(eq(schema.user.isBanned, false));

    // Text Search
    if (dto.q && dto.q.trim() !== '') {
      const searchPattern = `%${dto.q}%`;
      filters.push(
        or(
          ilike(schema.user.username, searchPattern),
          // Handle nullable field safely
          ilike(schema.user.displayUsername, searchPattern),
          ilike(schema.user.name, searchPattern),
          ilike(schema.user.bio, searchPattern),
        )!, // The ! assertion helps if TS thinks 'or' can return undefined (it shouldn't here)
      );
    }

    // Advanced Filters
    if (dto.verifiedOnly) {
      filters.push(eq(schema.user.isVerified, true));
    }
    if (dto.isOnline) {
      filters.push(eq(schema.user.isOnline, true));
    }
    if (dto.country) {
      filters.push(ilike(schema.user.country, dto.country));
    }
    if (dto.minFollowers) {
      filters.push(gte(schema.user.followerCount, dto.minFollowers));
    }

    // Sorting
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
      // FIX 3: Safe check for filters length
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
  // 2. POST SEARCH
  // =========================================================
  private async searchPosts(dto: SearchQueryDto) {
    const filters: SQL[] = [];

    // Always exclude deleted posts
    filters.push(sql`${schema.post.deletedAt} IS NULL`);

    // Text & Tag Search
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

    // Engagement Filters
    if (dto.minLikes) {
      filters.push(gte(schema.post.thumbsUpCount, dto.minLikes));
    }
    if (dto.minViews) {
      filters.push(gte(schema.post.viewCount, dto.minViews));
    }

    // Content Filters
    if (dto.hasMedia) {
      // Drizzle SQL raw query for array length check
      filters.push(sql`array_length(${schema.post.images}, 1) > 0`);
    }

    // Date Range
    if (dto.dateRange && dto.dateRange !== DateRange.ALL_TIME) {
      const now = new Date();
      const dateLimit = new Date();

      if (dto.dateRange === DateRange.TODAY) {
        dateLimit.setDate(now.getDate() - 1);
      } else if (dto.dateRange === DateRange.WEEK) {
        dateLimit.setDate(now.getDate() - 7);
      } else if (dto.dateRange === DateRange.MONTH) {
        dateLimit.setMonth(now.getMonth() - 1);
      }

      filters.push(gte(schema.post.createdAt, dateLimit));
    }

    // Sorting
    let orderBy: SQL[] = [];
    switch (dto.sortBy) {
      case SortOption.NEWEST:
        orderBy = [desc(schema.post.createdAt)];
        break;
      case SortOption.POPULAR:
        orderBy = [
          desc(schema.post.thumbsUpCount),
          desc(schema.post.viewCount),
        ];
        break;
      case SortOption.RELEVANCE:
      default:
        orderBy = [
          desc(schema.post.thumbsUpCount),
          desc(schema.post.createdAt),
        ];
        break;
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
      orderBy,
    });
  }

  // =========================================================
  // 3. COMMUNITY SEARCH
  // =========================================================
  private async searchCommunities(dto: SearchQueryDto) {
    const filters: SQL[] = [];

    // Text Search
    if (dto.q && dto.q.trim() !== '') {
      const searchPattern = `%${dto.q}%`;
      filters.push(
        or(
          ilike(schema.community.name, searchPattern),
          ilike(schema.community.slug, searchPattern),
          ilike(schema.community.description, searchPattern),
          arrayContains(schema.community.rules, [dto.q]),
        )!,
      );
    }

    // Filters
    if (dto.minMembers) {
      filters.push(gte(schema.community.memberCount, dto.minMembers));
    }

    // Sorting
    let orderBy: SQL[] = [];
    if (dto.sortBy === SortOption.NEWEST) {
      orderBy = [desc(schema.community.createdAt)];
    } else {
      orderBy = [
        desc(schema.community.memberCount),
        desc(schema.community.postCount),
      ];
    }

    return this.db.query.community.findMany({
      where: filters.length > 0 ? and(...filters) : undefined,
      limit: dto.limit,
      offset: dto.offset,
      orderBy,
      columns: {
        id: true,
        name: true,
        slug: true,
        avatar: true,
        description: true,
        memberCount: true,
        postCount: true,
        isPrivate: true,
      },
    });
  }
}
