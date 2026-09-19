import { MigrationInterface, QueryRunner } from 'typeorm';

// Lets ingestion upsert on (spotId, forecastTime) instead of piling up
// duplicate rows every time the cron re-fetches the same hourly slot.
export class ForecastsUniqueSpotTime1789725504000 implements MigrationInterface {
  name = 'ForecastsUniqueSpotTime1789725504000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "forecasts"
      ADD CONSTRAINT "UQ_forecasts_spotId_forecastTime" UNIQUE ("spotId", "forecastTime")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "forecasts" DROP CONSTRAINT "UQ_forecasts_spotId_forecastTime"
    `);
  }
}
