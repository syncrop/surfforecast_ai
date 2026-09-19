import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AdminGuard } from '../common/guards/admin.guard';
import { CreateSpotDto } from './dto/create-spot.dto';
import { FindNearbySpotsDto } from './dto/find-nearby-spots.dto';
import { NearbySpotDto, SpotWithLocationDto } from './dto/spot-with-location.dto';
import { SpotRecommendationDto } from './dto/recommendation.dto';
import { RecommendationsSummaryDto } from './dto/recommendations-summary.dto';
import { RecommendationsWithSummaryDto } from './dto/recommendations-with-summary.dto';
import { SpotsService } from './spots.service';

@ApiTags('spots')
@Controller('spots')
export class SpotsController {
  constructor(private readonly spotsService: SpotsService) {}

  @ApiOperation({ summary: 'Create a spot (admin only)' })
  @ApiHeader({ name: 'x-admin-key', required: true })
  @ApiOkResponse({ type: SpotWithLocationDto })
  @UseGuards(AdminGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post()
  create(@Body() dto: CreateSpotDto) {
    return this.spotsService.create(dto);
  }

  @ApiOperation({ summary: 'List all spots' })
  @ApiOkResponse({ type: [SpotWithLocationDto] })
  @Get()
  findAll() {
    return this.spotsService.findAll();
  }

  // Must come before ':slug' so it isn't swallowed by that route.
  @ApiOperation({ summary: 'Spots within a radius, closest first' })
  @ApiOkResponse({ type: [NearbySpotDto] })
  @Get('nearby')
  findNearby(@Query() query: FindNearbySpotsDto) {
    return this.spotsService.findNearby(query.lat, query.lon, query.radius ?? 20_000);
  }

  // Must come before ':slug' so it isn't swallowed by that route.
  @ApiOperation({ summary: 'Spots within a radius, scored against their current forecast' })
  @ApiOkResponse({ type: [SpotRecommendationDto] })
  @Get('recommendations')
  getRecommendations(@Query() query: FindNearbySpotsDto) {
    return this.spotsService.getRecommendations(query.lat, query.lon, query.radius ?? 20_000);
  }

  // Must come before ':slug' so it isn't swallowed by that route.
  // Tighter limit than the global default: a `query` here triggers a live
  // (paid) Claude call, unlike the rest of this controller's cheap DB reads.
  @ApiOperation({
    summary: 'Recommendations plus a natural-language summary',
    description:
      'Without `query`, reads a summary the ingest cron already cached per region (fast, no ' +
      'LLM call). With `query`, calls Claude live to personalize tone/focus for that request.',
  })
  @ApiOkResponse({ type: RecommendationsWithSummaryDto })
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Get('recommendations/summary')
  getRecommendationsSummary(@Query() query: RecommendationsSummaryDto) {
    return this.spotsService.getRecommendationsSummary(
      query.lat,
      query.lon,
      query.radius ?? 20_000,
      query.query,
    );
  }

  @ApiOperation({ summary: 'Get a spot by slug' })
  @ApiOkResponse({ type: SpotWithLocationDto })
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const spot = await this.spotsService.findBySlug(slug);
    if (!spot) {
      throw new NotFoundException(`Spot "${slug}" not found`);
    }
    return spot;
  }
}
