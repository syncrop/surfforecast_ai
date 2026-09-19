import { Controller, Post, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AdminGuard } from '../common/guards/admin.guard';
import { ForecastsIngestService, IngestSummary } from './forecasts-ingest.service';

@ApiTags('forecasts')
@Controller('forecasts')
export class ForecastsController {
  constructor(private readonly ingestService: ForecastsIngestService) {}

  @ApiOperation({
    summary: 'Manually trigger forecast ingestion + region summary refresh (admin only)',
    description: 'Same job the 6h cron runs. Hits the Open-Meteo and Claude APIs, so it is rate-limited.',
  })
  @ApiHeader({ name: 'x-admin-key', required: true })
  @ApiOkResponse({ schema: { properties: { spots: { type: 'number' }, forecasts: { type: 'number' } } } })
  @UseGuards(AdminGuard)
  @Throttle({ default: { limit: 2, ttl: 60_000 } })
  @Post('ingest-now')
  ingestNow(): Promise<IngestSummary> {
    return this.ingestService.ingestAll();
  }
}
