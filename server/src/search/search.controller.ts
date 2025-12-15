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
import { OptionalAuth } from '@thallesp/nestjs-better-auth';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * 🔍 MAIN SEARCH ENDPOINT
   * Usage: /search?q=tech&type=post&minLikes=50&hasMedia=true
   *
   * "User Friendly" aspect:
   * - Handles all types (People, Posts, Communities) in one place.
   * - Automatically converts URL strings ("true", "50") into Booleans and Numbers.
   */
  @Get()
  @OptionalAuth()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async search(@Query() query: SearchQueryDto) {
    return this.searchService.search(query);
  }

  /**
   * 🔥 TRENDING / DISCOVERY ENDPOINT
   * Usage: /search/trending
   *
   * "Optimistic" aspect:
   * - When the user clicks the search bar *before* typing,
   *   call this to show the most popular/verified content instantly.
   */
  @Get('trending')
  @OptionalAuth()
  async getTrending() {
    // We reuse the efficient search logic but force specific "Viral" params
    return this.searchService.search({
      q: '', // No text query
      type: SearchType.ALL,
      sortBy: SortOption.POPULAR, // Force 'Popular' sorting
      limit: 5, // Just top 5 of each category
      offset: 0,

      // OPTIONAL: Add defaults for quality control
      // e.g., only show posts from last month that are not empty
      dateRange: DateRange.MONTH,
      verifiedOnly: false,
    });
  }

  /**
   * 👥 SUGGESTED PEOPLE
   * Usage: /search/suggestions/people
   * Useful for "Who to follow" sidebars
   */
  @Get('suggestions/people')
  @OptionalAuth()
  async getPeopleSuggestions() {
    return this.searchService.search({
      q: '',
      type: SearchType.PEOPLE,
      sortBy: SortOption.RELEVANCE, // Prioritizes Verified & High Followers
      limit: 10,
      offset: 0,
      verifiedOnly: false, // Set to true if you only want celebs
      isOnline: false, // Set to true if you want 'Who is online now'
    });
  }
}
