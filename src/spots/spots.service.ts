import { Injectable } from '@nestjs/common';
import { SurfSummaryService } from '../ai/surf-summary.service';
import { ScoringService } from '../scoring/scoring.service';
import { CreateSpotDto } from './dto/create-spot.dto';
import { DayScoreDto, SpotRecommendationDto, UpcomingSpotRecommendationDto } from './dto/recommendation.dto';
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

  /**
   * Spots within radius, each scored against its best-scoring forecast
   * window over the next `days` days (not just "now"). Pure DB + scoring
   * engine, no AI involved - same reasoning as {@link getRecommendations}.
   */
  async getUpcomingRecommendations(
    lat: number,
    lon: number,
    radiusMeters: number,
    days: number,
  ): Promise<UpcomingSpotRecommendationDto[]> {
    const rows = await this.spotsRepository.findNearbyWithForecastWindow(
      lat,
      lon,
      radiusMeters,
      days,
    );
    return this.toUpcomingRecommendations(rows);
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
   * Just the cached summary for a region - no scoring, no recommendations,
   * never touches Claude. Meant to be called on-demand (e.g. when the user
   * opens a spot's detail view), decoupled from the list/map data so panning
   * the map doesn't also re-fetch a summary on every move.
   */
  async getCachedRegionSummary(
    region: string,
  ): Promise<{ summary: string | null; generatedAt: Date | null }> {
    const cached = await this.spotsRepository.findRegionSummary(region);
    return { summary: cached?.summary ?? null, generatedAt: cached?.generatedAt ?? null };
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

  /**
   * Groups the (spot, forecast) rows by spot, scores every forecast row in
   * the window, and keeps the best-scoring one per spot plus a per-day peak
   * (`dailyBest`) so the UI can show which day is worth going without
   * fetching each day separately.
   */
  private toUpcomingRecommendations(
    rows: NearbySpotWithForecastRow[],
  ): UpcomingSpotRecommendationDto[] {
    interface Group {
      spot: SpotWithLocationDto;
      distance: number;
      forecastRows: NearbySpotWithForecastRow[];
    }

    const bySpot = new Map<string, Group>();
    for (const row of rows) {
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

      let group = bySpot.get(spot.id);
      if (!group) {
        group = { spot, distance, forecastRows: [] };
        bySpot.set(spot.id, group);
      }
      if (forecastId) {
        group.forecastRows.push(row);
      }
    }

    const recommendations: UpcomingSpotRecommendationDto[] = Array.from(bySpot.values()).map(
      ({ spot, distance, forecastRows }) => {
        if (forecastRows.length === 0) {
          return {
            spot,
            distance,
            score: null,
            breakdown: null,
            conditions: null,
            forecast: null,
            dailyBest: [],
          };
        }

        const scored = forecastRows.map((row) => ({
          row,
          result: this.scoringService.score(spot, {
            waveHeight: row.waveHeight,
            wavePeriod: row.wavePeriod,
            swellDirection: row.swellDirection,
            windSpeed: row.windSpeed,
            windDirection: row.windDirection,
          }),
        }));

        const best = scored.reduce((a, b) => (b.result.score > a.result.score ? b : a));

        const byDate = new Map<string, (typeof scored)[number]>();
        for (const entry of scored) {
          const date = (entry.row.forecastTime as Date).toISOString().slice(0, 10);
          const existing = byDate.get(date);
          if (!existing || entry.result.score > existing.result.score) {
            byDate.set(date, entry);
          }
        }
        const dailyBest: DayScoreDto[] = Array.from(byDate.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, { row, result }]) => ({
            date,
            score: result.score,
            conditions: result.conditions,
            breakdown: result.breakdown,
            forecast: {
              forecastTime: row.forecastTime as Date,
              fetchedAt: row.fetchedAt as Date,
              waveHeight: row.waveHeight as number,
              wavePeriod: row.wavePeriod as number,
              swellDirection: row.swellDirection as number,
              windSpeed: row.windSpeed as number,
              windDirection: row.windDirection as number,
              tideHeight: row.tideHeight,
            },
          }));

        return {
          spot,
          distance,
          score: best.result.score,
          breakdown: best.result.breakdown,
          conditions: best.result.conditions,
          forecast: {
            forecastTime: best.row.forecastTime as Date,
            fetchedAt: best.row.fetchedAt as Date,
            waveHeight: best.row.waveHeight as number,
            wavePeriod: best.row.wavePeriod as number,
            swellDirection: best.row.swellDirection as number,
            windSpeed: best.row.windSpeed as number,
            windDirection: best.row.windDirection as number,
            tideHeight: best.row.tideHeight,
          },
          dailyBest,
        };
      },
    );

    return recommendations.sort((a, b) => {
      if (a.score == null && b.score == null) return 0;
      if (a.score == null) return 1;
      if (b.score == null) return -1;
      return b.score - a.score;
    });
  }
}
