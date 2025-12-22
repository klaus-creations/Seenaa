import {
  Controller,
  Get,
  Query,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { SearchService } from './search.service';
import {
  SearchQueryDto,
  SearchType,
  SortOption,
  DateRange,
} from './dto/search.dto';
import { Session } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * 🔍 GLOBAL SEARCH
   * Usage: /search?q=query&type=all
   */
  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async search(
    @Query() query: SearchQueryDto,
    @Session() session: UserSession | undefined,
  ) {
    const viewerId = session?.user?.id;
    return this.searchService.search(query, viewerId);
  }

  /**
   * 🔥 TRENDING CONTENT
   */
  @Get('trending')
  async getTrending(@Session() session: UserSession | undefined) {
    const viewerId = session?.user?.id;
    return this.searchService.search(
      {
        q: '',
        type: SearchType.ALL,
        sortBy: SortOption.POPULAR,
        limit: 5,
        offset: 0,
        dateRange: DateRange.MONTH,
      },
      viewerId,
    );
  }

  /**
   * 👥 SUGGESTED PEOPLE (Who to follow)
   * Excludes the current logged-in user.
   */
  @Get('suggestions/people')
  async getPeopleSuggestions(@Session() session: UserSession | undefined) {
    const viewerId = session?.user?.id;
    return this.searchService.search(
      {
        q: '',
        type: SearchType.PEOPLE,
        sortBy: SortOption.RELEVANCE,
        limit: 5,
        offset: 0,
      },
      viewerId,
    );
  }

  /**
   * 🏘️ RECOMMENDED COMMUNITIES
   * Algorithm: Popular communities the user hasn't joined.
   */
  @Get('suggestions/communities')
  async getCommunitySuggestions(@Session() session: UserSession | undefined) {
    const viewerId = session?.user?.id;
    return this.searchService.getRecommendedCommunities(viewerId, 5);
  }
}
