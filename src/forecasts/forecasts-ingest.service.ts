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
      `SELECT "id", "slug", ST_Y("location"::geometry) AS lat, ST_X("location"::geometry) AS lon FROM "spots"`,
    );

    let forecasts = 0;
    for (const spot of spots) {
      try {
        forecasts += await this.ingestSpot(spot.id, spot.lat, spot.lon);
      } catch (err) {
        this.logger.error(`Failed to ingest forecast for "${spot.slug}": ${(err as Error).message}`);
      }
    }

    this.logger.log(`Ingested ${forecasts} forecast rows across ${spots.length} spots.`);
    await this.refreshRegionSummaries();

    return { spots: spots.length, forecasts };
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

  private async ingestSpot(spotId: string, lat: number, lon: number): Promise<number> {
    const points = await this.provider.getForecast(lat, lon);
    if (points.length === 0) {
      return 0;
    }

    const rowPlaceholders: string[] = [];
    const values: unknown[] = [];
    points.forEach((point, i) => {
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
        point.tideHeight,
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
