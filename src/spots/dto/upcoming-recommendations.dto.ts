import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, Max, Min } from 'class-validator';
import { FORECAST_HORIZON_DAYS } from '../../forecasts/providers/open-meteo.provider';
import { FindNearbySpotsDto } from './find-nearby-spots.dto';

export class UpcomingRecommendationsDto extends FindNearbySpotsDto {
  @ApiPropertyOptional({
    example: FORECAST_HORIZON_DAYS,
    minimum: 1,
    maximum: FORECAST_HORIZON_DAYS,
    description:
      `How many days ahead to look, starting from now. Capped at ${FORECAST_HORIZON_DAYS} - ` +
      'the ingest cron only fetches that many days of forecast.',
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(FORECAST_HORIZON_DAYS)
  days?: number = FORECAST_HORIZON_DAYS;
}
