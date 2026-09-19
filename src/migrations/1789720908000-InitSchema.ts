import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1789720908000 implements MigrationInterface {
  name = 'InitSchema1789720908000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgis`);

    await queryRunner.query(`
      CREATE TYPE "spots_breaktype_enum" AS ENUM (
        'beach_break', 'reef_break', 'point_break', 'river_mouth'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "spots_bottom_enum" AS ENUM (
        'sand', 'rock', 'reef', 'cobblestone', 'mixed'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "spots_skilllevel_enum" AS ENUM (
        'beginner', 'intermediate', 'advanced', 'expert'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "spots" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying NOT NULL,
        "slug" character varying NOT NULL,
        "location" geography(Point,4326) NOT NULL,
        "region" character varying NOT NULL,
        "country" character varying NOT NULL,
        "breakType" "spots_breaktype_enum" NOT NULL,
        "bottom" "spots_bottom_enum" NOT NULL,
        "optimalSwellDirMin" smallint NOT NULL,
        "optimalSwellDirMax" smallint NOT NULL,
        "optimalWindDirMin" smallint NOT NULL,
        "optimalWindDirMax" smallint NOT NULL,
        "optimalWaveMin" real NOT NULL,
        "optimalWaveMax" real NOT NULL,
        "skillLevel" "spots_skilllevel_enum" NOT NULL,
        "sourceUrl" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_spots_slug" UNIQUE ("slug"),
        CONSTRAINT "PK_spots" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_spots_location" ON "spots" USING GIST ("location")
    `);

    await queryRunner.query(`
      CREATE TABLE "forecasts" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "spotId" uuid NOT NULL,
        "fetchedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "forecastTime" TIMESTAMPTZ NOT NULL,
        "waveHeight" real NOT NULL,
        "wavePeriod" real NOT NULL,
        "swellDirection" smallint NOT NULL,
        "windSpeed" real NOT NULL,
        "windDirection" smallint NOT NULL,
        "tideHeight" real,
        "rawResponse" jsonb NOT NULL,
        CONSTRAINT "PK_forecasts" PRIMARY KEY ("id"),
        CONSTRAINT "FK_forecasts_spot" FOREIGN KEY ("spotId")
          REFERENCES "spots"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_forecasts_forecastTime" ON "forecasts" ("forecastTime")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_forecasts_spotId" ON "forecasts" ("spotId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "forecasts"`);
    await queryRunner.query(`DROP TABLE "spots"`);
    await queryRunner.query(`DROP TYPE "spots_skilllevel_enum"`);
    await queryRunner.query(`DROP TYPE "spots_bottom_enum"`);
    await queryRunner.query(`DROP TYPE "spots_breaktype_enum"`);
  }
}
