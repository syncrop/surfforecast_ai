import { MigrationInterface, QueryRunner } from 'typeorm';

// Cache table for the AI-generated per-region summaries. Written only by
// ForecastsIngestService after each ingest cycle, read by SpotsService on
// every request - keeps GET /spots/recommendations/summary from calling
// Claude per request.
export class RegionSummaries1789726744000 implements MigrationInterface {
  name = 'RegionSummaries1789726744000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "region_summaries" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "region" character varying NOT NULL,
        "summary" text NOT NULL,
        "generatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_region_summaries_region" UNIQUE ("region"),
        CONSTRAINT "PK_region_summaries" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "region_summaries"`);
  }
}
