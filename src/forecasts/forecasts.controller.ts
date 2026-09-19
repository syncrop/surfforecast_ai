import { Controller, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AdminGuard } from '../common/guards/admin.guard';
import { ForecastsIngestService, IngestSummary } from './forecasts-ingest.service';

@Controller('forecasts')
export class ForecastsController {
  constructor(private readonly ingestService: ForecastsIngestService) {}

  @UseGuards(AdminGuard)
  @Throttle({ default: { limit: 2, ttl: 60_000 } })
  @Post('ingest-now')
  ingestNow(): Promise<IngestSummary> {
    return this.ingestService.ingestAll();
  }
}
