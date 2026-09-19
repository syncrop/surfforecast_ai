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
import { Throttle } from '@nestjs/throttler';
import { AdminGuard } from '../common/guards/admin.guard';
import { CreateSpotDto } from './dto/create-spot.dto';
import { FindNearbySpotsDto } from './dto/find-nearby-spots.dto';
import { RecommendationsSummaryDto } from './dto/recommendations-summary.dto';
import { SpotsService } from './spots.service';

@Controller('spots')
export class SpotsController {
  constructor(private readonly spotsService: SpotsService) {}

  @UseGuards(AdminGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post()
  create(@Body() dto: CreateSpotDto) {
    return this.spotsService.create(dto);
  }

  @Get()
  findAll() {
    return this.spotsService.findAll();
  }

  // Must come before ':slug' so it isn't swallowed by that route.
  @Get('nearby')
  findNearby(@Query() query: FindNearbySpotsDto) {
    return this.spotsService.findNearby(query.lat, query.lon, query.radius ?? 20_000);
  }

  // Must come before ':slug' so it isn't swallowed by that route.
  @Get('recommendations')
  getRecommendations(@Query() query: FindNearbySpotsDto) {
    return this.spotsService.getRecommendations(query.lat, query.lon, query.radius ?? 20_000);
  }

  // Must come before ':slug' so it isn't swallowed by that route.
  // Tighter limit than the global default: a `query` here triggers a live
  // (paid) Claude call, unlike the rest of this controller's cheap DB reads.
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

  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const spot = await this.spotsService.findBySlug(slug);
    if (!spot) {
      throw new NotFoundException(`Spot "${slug}" not found`);
    }
    return spot;
  }
}
