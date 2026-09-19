import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateSpotDto } from '../dto/create-spot.dto';
import { NearbySpotDto, SpotWithLocationDto } from '../dto/spot-with-location.dto';
import { Spot } from '../entities/spot.entity';

export interface NearbySpotWithForecastRow extends NearbySpotDto {
  forecastId: string | null;
  forecastTime: Date | null;
  fetchedAt: Date | null;
  waveHeight: number | null;
  wavePeriod: number | null;
  swellDirection: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  tideHeight: number | null;
}

/**
 * `location` is a PostGIS `geography(Point,4326)` column. TypeORM cannot
 * reliably insert/select it as a plain JS value, so every read/write of it
 * goes through raw SQL here (ST_MakePoint on write, ST_X/ST_Y on read)
 * instead of the inherited Repository find/save methods.
 */
const SELECT_COLUMNS = `
  "id", "name", "slug", "region", "country", "breakType", "bottom",
  "optimalSwellDirMin", "optimalSwellDirMax", "optimalWindDirMin", "optimalWindDirMax",
  "optimalWaveMin", "optimalWaveMax", "skillLevel", "sourceUrl",
  ST_Y("location"::geometry) AS lat,
  ST_X("location"::geometry) AS lon
`;

@Injectable()
export class SpotsRepository extends Repository<Spot> {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {
    super(Spot, dataSource.createEntityManager());
  }

  async createSpot(dto: CreateSpotDto): Promise<SpotWithLocationDto> {
    const rows = await this.dataSource.query<Array<{ id: string }>>(
      `
      INSERT INTO "spots" (
        "name", "slug", "location", "region", "country", "breakType", "bottom",
        "optimalSwellDirMin", "optimalSwellDirMax", "optimalWindDirMin", "optimalWindDirMax",
        "optimalWaveMin", "optimalWaveMax", "skillLevel", "sourceUrl"
      ) VALUES (
        $1, $2, ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15, $16
      )
      RETURNING "id"
      `,
      [
        dto.name,
        dto.slug,
        dto.lon,
        dto.lat,
        dto.region,
        dto.country,
        dto.breakType,
        dto.bottom,
        dto.optimalSwellDirMin,
        dto.optimalSwellDirMax,
        dto.optimalWindDirMin,
        dto.optimalWindDirMax,
        dto.optimalWaveMin,
        dto.optimalWaveMax,
        dto.skillLevel,
        dto.sourceUrl ?? null,
      ],
    );

    return this.findById(rows[0].id);
  }

  async findById(id: string): Promise<SpotWithLocationDto> {
    const rows = await this.dataSource.query<SpotWithLocationDto[]>(
      `SELECT ${SELECT_COLUMNS} FROM "spots" WHERE "id" = $1`,
      [id],
    );
    if (!rows[0]) {
      throw new NotFoundException(`Spot ${id} not found`);
    }
    return rows[0];
  }

  async findBySlug(slug: string): Promise<SpotWithLocationDto | null> {
    const rows = await this.dataSource.query<SpotWithLocationDto[]>(
      `SELECT ${SELECT_COLUMNS} FROM "spots" WHERE "slug" = $1`,
      [slug],
    );
    return rows[0] ?? null;
  }

  async findAllWithLocation(): Promise<SpotWithLocationDto[]> {
    return this.dataSource.query<SpotWithLocationDto[]>(
      `SELECT ${SELECT_COLUMNS} FROM "spots" ORDER BY "name" ASC`,
    );
  }

  /**
   * Spots within `radiusMeters` of (lat, lon), closest first.
   * ST_DWithin uses the geography spatial index (GIST) to prune candidates
   * cheaply; ST_Distance then computes the exact great-circle distance.
   */
  async findNearby(
    lat: number,
    lon: number,
    radiusMeters: number,
  ): Promise<NearbySpotDto[]> {
    return this.dataSource.query<NearbySpotDto[]>(
      `
      SELECT ${SELECT_COLUMNS},
        ST_Distance("location", ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) AS distance
      FROM "spots"
      WHERE ST_DWithin("location", ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
      ORDER BY distance ASC
      `,
      [lon, lat, radiusMeters],
    );
  }

  /**
   * Spots within `radiusMeters` of (lat, lon), each joined via a LATERAL
   * subquery to the hourly forecast row whose forecastTime is closest to
   * now (the current/upcoming conditions, not literally the furthest-out
   * forecast). `forecastId` is null when the spot has no forecast rows yet.
   */
  async findNearbyWithLatestForecast(
    lat: number,
    lon: number,
    radiusMeters: number,
  ): Promise<NearbySpotWithForecastRow[]> {
    return this.dataSource.query<NearbySpotWithForecastRow[]>(
      `
      SELECT
        "spots"."id", "spots"."name", "spots"."slug", "spots"."region", "spots"."country",
        "spots"."breakType", "spots"."bottom",
        "spots"."optimalSwellDirMin", "spots"."optimalSwellDirMax",
        "spots"."optimalWindDirMin", "spots"."optimalWindDirMax",
        "spots"."optimalWaveMin", "spots"."optimalWaveMax",
        "spots"."skillLevel", "spots"."sourceUrl",
        ST_Y("spots"."location"::geometry) AS lat,
        ST_X("spots"."location"::geometry) AS lon,
        ST_Distance("spots"."location", ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) AS distance,
        f."forecastId", f."forecastTime", f."fetchedAt", f."waveHeight", f."wavePeriod",
        f."swellDirection", f."windSpeed", f."windDirection", f."tideHeight"
      FROM "spots"
      LEFT JOIN LATERAL (
        SELECT
          "id" AS "forecastId",
          "forecastTime",
          "fetchedAt",
          "waveHeight",
          "wavePeriod",
          "swellDirection",
          "windSpeed",
          "windDirection",
          "tideHeight"
        FROM "forecasts"
        WHERE "forecasts"."spotId" = "spots"."id"
        ORDER BY ABS(EXTRACT(EPOCH FROM ("forecastTime" - now())))
        LIMIT 1
      ) f ON true
      WHERE ST_DWithin("spots"."location", ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography, $3)
      ORDER BY distance ASC
      `,
      [lon, lat, radiusMeters],
    );
  }

  /**
   * All spots in a region joined to their current forecast, same shape as
   * {@link findNearbyWithLatestForecast} but scoped by `region` instead of a
   * radius (`distance` is meaningless here, so it's always 0). Used by the
   * ingest cron to build the region's cached recommendation summary.
   */
  async findByRegionWithLatestForecast(region: string): Promise<NearbySpotWithForecastRow[]> {
    return this.dataSource.query<NearbySpotWithForecastRow[]>(
      `
      SELECT
        "spots"."id", "spots"."name", "spots"."slug", "spots"."region", "spots"."country",
        "spots"."breakType", "spots"."bottom",
        "spots"."optimalSwellDirMin", "spots"."optimalSwellDirMax",
        "spots"."optimalWindDirMin", "spots"."optimalWindDirMax",
        "spots"."optimalWaveMin", "spots"."optimalWaveMax",
        "spots"."skillLevel", "spots"."sourceUrl",
        ST_Y("spots"."location"::geometry) AS lat,
        ST_X("spots"."location"::geometry) AS lon,
        0 AS distance,
        f."forecastId", f."forecastTime", f."fetchedAt", f."waveHeight", f."wavePeriod",
        f."swellDirection", f."windSpeed", f."windDirection", f."tideHeight"
      FROM "spots"
      LEFT JOIN LATERAL (
        SELECT
          "id" AS "forecastId",
          "forecastTime",
          "fetchedAt",
          "waveHeight",
          "wavePeriod",
          "swellDirection",
          "windSpeed",
          "windDirection",
          "tideHeight"
        FROM "forecasts"
        WHERE "forecasts"."spotId" = "spots"."id"
        ORDER BY ABS(EXTRACT(EPOCH FROM ("forecastTime" - now())))
        LIMIT 1
      ) f ON true
      WHERE "spots"."region" = $1
      ORDER BY "spots"."name" ASC
      `,
      [region],
    );
  }

  /** Cached natural-language summary for a region, or null if none has been generated yet. */
  async findRegionSummary(region: string): Promise<{ summary: string; generatedAt: Date } | null> {
    const rows = await this.dataSource.query<Array<{ summary: string; generatedAt: Date }>>(
      `SELECT "summary", "generatedAt" FROM "region_summaries" WHERE "region" = $1`,
      [region],
    );
    return rows[0] ?? null;
  }

  /** Upserts the cached summary for a region. Called only from the ingest cron - never per-request. */
  async upsertRegionSummary(region: string, summary: string): Promise<void> {
    await this.dataSource.query(
      `
      INSERT INTO "region_summaries" ("region", "summary", "generatedAt")
      VALUES ($1, $2, now())
      ON CONFLICT ("region") DO UPDATE SET
        "summary" = EXCLUDED."summary",
        "generatedAt" = now()
      `,
      [region, summary],
    );
  }
}
