import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SurfSummaryService } from '../ai/surf-summary.service';
import { SpotsService } from '../spots/spots.service';
import { MARINE_FORECAST_PROVIDER, MarineForecastProvider } from './providers/marine-forecast.provider';

interface SpotLocationRow {
  id: string;
  slug: string;
  region: string;
  lat: number;
  lon: number;
}

export interface IngestSummary {
  spots: number;
  forecasts: number;
}

@Injectable()
export class ForecastsIngestService {
  private readonly logger = new Logger(ForecastsIngestService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(MARINE_FORECAST_PROVIDER) private readonly provider: MarineForecastProvider,
    private readonly spotsService: SpotsService,
    private readonly surfSummaryService: SurfSummaryService,
  ) {}

  @Cron(CronExpression.EVERY_6_HOURS)
  async ingestAll(): Promise<IngestSummary> {
    const spots = await this.dataSource.query<SpotLocationRow[]>(
      `SELECT "id", "slug", "region", ST_Y("location"::geometry) AS lat, ST_X("location"::geometry) AS lon FROM "spots"`,
    );

    const byRegion = new Map<string, SpotLocationRow[]>();
    for (const spot of spots) {
      const group = byRegion.get(spot.region);
      if (group) {
        group.push(spot);
      } else {
        byRegion.set(spot.region, [spot]);
      }
    }

    let forecasts = 0;
    for (const [region, regionSpots] of byRegion) {
      // Tide is a regional-scale phenomenon (unlike wave/wind, which do vary
      // spot to spot), so it's fetched once per region using one spot as the
      // anchor point and shared across every spot in that group - not
      // refetched per spot.
      const tideByTime = await this.fetchRegionTide(region, regionSpots[0]);
      for (const spot of regionSpots) {
        try {
          forecasts += await this.ingestSpot(spot.id, spot.lat, spot.lon, tideByTime);
        } catch (err) {
          this.logger.error(`Failed to ingest forecast for "${spot.slug}": ${(err as Error).message}`);
        }
      }
    }

    this.logger.log(`Ingested ${forecasts} forecast rows across ${spots.length} spots.`);
    await this.refreshRegionSummaries();

    return { spots: spots.length, forecasts };
  }

  /**
   * A region's tide fetch failing only nulls out tideHeight for that
   * region's spots - it must not block them from ingesting wave/wind data,
   * and must not affect other regions.
   */
  private async fetchRegionTide(
    region: string,
    anchor: SpotLocationRow,
  ): Promise<Map<number, number | null>> {
    try {
      const points = await this.provider.getTide(anchor.lat, anchor.lon);
      return new Map(points.map((p) => [p.time.getTime(), p.tideHeight]));
    } catch (err) {
      this.logger.error(`Failed to fetch tide for region "${region}": ${(err as Error).message}`);
      return new Map();
    }
  }

  /**
   * Regenerates the cached natural-language summary for every region, one
   * Claude call per region regardless of how many users query it later.
   * Runs only here, right after fresh forecasts land - never on-demand.
   */
  private async refreshRegionSummaries(): Promise<void> {
    const regions = await this.dataSource.query<Array<{ region: string }>>(
      `SELECT DISTINCT "region" FROM "spots" ORDER BY "region"`,
    );

    for (const { region } of regions) {
      try {
        const recommendations = await this.spotsService.getRegionRecommendations(region);
        const summary = await this.surfSummaryService.summarize(recommendations);
        await this.spotsService.cacheRegionSummary(region, summary);
      } catch (err) {
        this.logger.error(`Failed to refresh summary for region "${region}": ${(err as Error).message}`);
      }
    }

    this.logger.log(`Refreshed cached summaries for ${regions.length} regions.`);
  }

  private async ingestSpot(
    spotId: string,
    lat: number,
    lon: number,
    tideByTime: Map<number, number | null>,
  ): Promise<number> {
    const points = await this.provider.getForecast(lat, lon);
    if (points.length === 0) {
      return 0;
    }

    const rowPlaceholders: string[] = [];
    const values: unknown[] = [];
    points.forEach((point, i) => {
      const tideHeight = tideByTime.get(point.forecastTime.getTime()) ?? null;
      const base = i * 9;
      rowPlaceholders.push(
        `($${base + 1}, $${base + 2}, now(), $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9})`,
      );
      values.push(
        spotId,
        point.forecastTime,
        point.waveHeight,
        point.wavePeriod,
        point.swellDirection,
        point.windSpeed,
        point.windDirection,
        tideHeight,
        JSON.stringify(point.raw),
      );
    });

    await this.dataSource.query(
      `
      INSERT INTO "forecasts"
        ("spotId", "forecastTime", "fetchedAt", "waveHeight", "wavePeriod", "swellDirection", "windSpeed", "windDirection", "tideHeight", "rawResponse")
      VALUES ${rowPlaceholders.join(', ')}
      ON CONFLICT ("spotId", "forecastTime") DO UPDATE SET
        "fetchedAt" = now(),
        "waveHeight" = EXCLUDED."waveHeight",
        "wavePeriod" = EXCLUDED."wavePeriod",
        "swellDirection" = EXCLUDED."swellDirection",
        "windSpeed" = EXCLUDED."windSpeed",
        "windDirection" = EXCLUDED."windDirection",
        "tideHeight" = EXCLUDED."tideHeight",
        "rawResponse" = EXCLUDED."rawResponse"
      `,
      values,
    );

    return points.length;
  }
}
