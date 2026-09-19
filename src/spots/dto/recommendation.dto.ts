import { Conditions, ScoreBreakdown } from '../../scoring/scoring.types';
import { SpotWithLocationDto } from './spot-with-location.dto';

export class ForecastUsedDto {
  forecastTime: Date;
  fetchedAt: Date;
  waveHeight: number;
  wavePeriod: number;
  swellDirection: number;
  windSpeed: number;
  windDirection: number;
  tideHeight: number | null;
}

export class SpotRecommendationDto {
  spot: SpotWithLocationDto;
  /** Distance from the query point, in meters. */
  distance: number;
  /** Null when the spot has no forecast ingested yet. */
  score: number | null;
  breakdown: ScoreBreakdown | null;
  conditions: Conditions | null;
  forecast: ForecastUsedDto | null;
}
