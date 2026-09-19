import { Injectable } from '@nestjs/common';
import { SurfSummaryService } from '../ai/surf-summary.service';
import { ScoringService } from '../scoring/scoring.service';
import { CreateSpotDto } from './dto/create-spot.dto';
import { SpotRecommendationDto } from './dto/recommendation.dto';
import { RecommendationsWithSummaryDto } from './dto/recommendations-with-summary.dto';
import { NearbySpotDto, SpotWithLocationDto } from './dto/spot-with-location.dto';
import { NearbySpotWithForecastRow, SpotsRepository } from './repositories/spots.repository';

@Injectable()
export class SpotsService {
  constructor(
    private readonly spotsRepository: SpotsRepository,
    private readonly scoringService: ScoringService,
    private readonly surfSummaryService: SurfSummaryService,
  ) {}

  create(dto: CreateSpotDto): Promise<SpotWithLocationDto> {
    return this.spotsRepository.createSpot(dto);
  }

  findAll(): Promise<SpotWithLocationDto[]> {
    return this.spotsRepository.findAllWithLocation();
  }

  findBySlug(slug: string): Promise<SpotWithLocationDto | null> {
    return this.spotsRepository.findBySlug(slug);
  }

  findNearby(lat: number, lon: number, radiusMeters: number): Promise<NearbySpotDto[]> {
    return this.spotsRepository.findNearby(lat, lon, radiusMeters);
  }

  async getRecommendations(
    lat: number,
    lon: number,
    radiusMeters: number,
  ): Promise<SpotRecommendationDto[]> {
    const rows = await this.spotsRepository.findNearbyWithLatestForecast(lat, lon, radiusMeters);
    return this.toRecommendations(rows);
  }

  /** All spots in a region with their current forecast, scored. Used by the ingest cron to build region summaries. */
  async getRegionRecommendations(region: string): Promise<SpotRecommendationDto[]> {
    const rows = await this.spotsRepository.findByRegionWithLatestForecast(region);
    return this.toRecommendations(rows);
  }

  /** Called only from the ingest cron to refresh the cached per-region summary - never per-request. */
  cacheRegionSummary(region: string, summary: string): Promise<void> {
    return this.spotsRepository.upsertRegionSummary(region, summary);
  }

  /**
   * Natural-language summary for a location. Calling Claude on every request
   * would multiply LLM calls by every user hitting the same spot, so the
   * default path reads a summary the ingest cron already generated and
   * cached per region (see ForecastsIngestService). A live Claude call only
   * happens when the caller passes `userQuery` - a deliberate, comparatively
   * rare request that a precomputed cache can't personalize for.
   */
  async getRecommendationsSummary(
    lat: number,
    lon: number,
    radiusMeters: number,
    userQuery?: string,
  ): Promise<RecommendationsWithSummaryDto> {
    const recommendations = await this.getRecommendations(lat, lon, radiusMeters);

    if (userQuery) {
      const summary = await this.surfSummaryService.summarize(recommendations, userQuery);
      return { summary, summaryGeneratedAt: new Date(), recommendations };
    }

    const topRegion = recommendations[0]?.spot.region ?? null;
    const cached = topRegion ? await this.spotsRepository.findRegionSummary(topRegion) : null;

    return {
      summary: cached?.summary ?? null,
      summaryGeneratedAt: cached?.generatedAt ?? null,
      recommendations,
    };
  }

  private toRecommendations(rows: NearbySpotWithForecastRow[]): SpotRecommendationDto[] {
    const recommendations: SpotRecommendationDto[] = rows.map((row) => {
      const {
        distance,
        forecastId,
        forecastTime,
        fetchedAt,
        waveHeight,
        wavePeriod,
        swellDirection,
        windSpeed,
        windDirection,
        tideHeight,
        ...spot
      } = row;

      if (!forecastId) {
        return { spot, distance, score: null, breakdown: null, conditions: null, forecast: null };
      }

      const { score, breakdown, conditions } = this.scoringService.score(spot, {
        waveHeight,
        wavePeriod,
        swellDirection,
        windSpeed,
        windDirection,
      });

      return {
        spot,
        distance,
        score,
        breakdown,
        conditions,
        forecast: {
          forecastTime: forecastTime as Date,
          fetchedAt: fetchedAt as Date,
          waveHeight: waveHeight as number,
          wavePeriod: wavePeriod as number,
          swellDirection: swellDirection as number,
          windSpeed: windSpeed as number,
          windDirection: windDirection as number,
          tideHeight,
        },
      };
    });

    return recommendations.sort((a, b) => {
      if (a.score == null && b.score == null) return 0;
      if (a.score == null) return 1;
      if (b.score == null) return -1;
      return b.score - a.score;
    });
  }
}
