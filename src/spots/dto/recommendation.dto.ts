import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { Conditions, ScoreBreakdown } from '../../scoring/scoring.types';
import { SpotWithLocationDto } from './spot-with-location.dto';

const CONDITIONS_VALUES: Conditions[] = ['poor', 'fair', 'good', 'excellent'];

/** API-facing mirror of ScoreBreakdown (kept a separate DTO so the scoring engine stays decoupled from Swagger). */
export class ScoreBreakdownDto implements ScoreBreakdown {
  @ApiProperty({ minimum: 0, maximum: 100 }) swellDirection: number;
  @ApiProperty({ minimum: 0, maximum: 100 }) waveHeight: number;
  @ApiProperty({ minimum: 0, maximum: 100 }) wind: number;
  @ApiProperty({ minimum: 0, maximum: 100 }) period: number;
}

export class ForecastUsedDto {
  @ApiProperty() forecastTime: Date;
  @ApiProperty() fetchedAt: Date;
  @ApiProperty() waveHeight: number;
  @ApiProperty() wavePeriod: number;
  @ApiProperty() swellDirection: number;
  @ApiProperty() windSpeed: number;
  @ApiProperty() windDirection: number;
  @ApiProperty({ type: 'number', nullable: true }) tideHeight: number | null;
}

@ApiExtraModels(ScoreBreakdownDto)
export class SpotRecommendationDto {
  @ApiProperty({ type: SpotWithLocationDto })
  spot: SpotWithLocationDto;

  @ApiProperty({ description: 'Distance from the query point, in meters.' })
  distance: number;

  @ApiProperty({
    type: 'number',
    nullable: true,
    description: 'Null when the spot has no forecast ingested yet.',
  })
  score: number | null;

  @ApiProperty({ nullable: true, allOf: [{ $ref: getSchemaPath(ScoreBreakdownDto) }] })
  breakdown: ScoreBreakdown | null;

  @ApiProperty({ enum: [...CONDITIONS_VALUES, null], nullable: true })
  conditions: Conditions | null;

  @ApiProperty({ type: ForecastUsedDto, nullable: true })
  forecast: ForecastUsedDto | null;
}
