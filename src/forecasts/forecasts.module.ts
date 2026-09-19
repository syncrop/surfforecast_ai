import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from '../ai/ai.module';
import { SpotsModule } from '../spots/spots.module';
import { Forecast } from './entities/forecast.entity';
import { ForecastsController } from './forecasts.controller';
import { ForecastsIngestService } from './forecasts-ingest.service';
import { MARINE_FORECAST_PROVIDER } from './providers/marine-forecast.provider';
import { OpenMeteoProvider } from './providers/open-meteo.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Forecast]), SpotsModule, AiModule],
  controllers: [ForecastsController],
  providers: [
    ForecastsIngestService,
    { provide: MARINE_FORECAST_PROVIDER, useClass: OpenMeteoProvider },
  ],
  exports: [TypeOrmModule],
})
export class ForecastsModule {}
