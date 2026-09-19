import { Injectable } from '@nestjs/common';
import { distanceToRange } from './direction.util';
import {
  Conditions,
  ForecastSnapshot,
  ScoreBreakdown,
  ScoreResult,
  SpotProfile,
} from './scoring.types';

const WEIGHTS = {
  swellDirection: 0.35,
  waveHeight: 0.3,
  wind: 0.25,
  period: 0.1,
};

const NEUTRAL_SCORE = 50;

// Full penalty (score 0) once a reading is this far outside the optimal
// range; anything closer decays linearly toward 100 at the range edge.
const SWELL_PENALTY_RANGE_DEG = 90;
const WIND_PENALTY_RANGE_DEG = 90;
const WAVE_PENALTY_RANGE_M = 1.5;

// Wind speed (km/h) at which the intensity component bottoms out at 0.
const WIND_SPEED_FULL_PENALTY_KMH = 40;

// Wave period (s) band: <=6s scores 0 (windswell), >=12s scores 100 (groundswell).
const PERIOD_MIN_S = 6;
const PERIOD_MAX_S = 12;

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

function linearFalloff(distance: number, penaltyRange: number): number {
  return clamp(100 - (distance / penaltyRange) * 100);
}

@Injectable()
export class ScoringService {
  score(spot: SpotProfile, forecast: ForecastSnapshot): ScoreResult {
    const breakdown: ScoreBreakdown = {
      swellDirection: this.scoreSwellDirection(spot, forecast),
      waveHeight: this.scoreWaveHeight(spot, forecast),
      wind: this.scoreWind(spot, forecast),
      period: this.scorePeriod(forecast),
    };

    const score = Math.round(
      breakdown.swellDirection * WEIGHTS.swellDirection +
        breakdown.waveHeight * WEIGHTS.waveHeight +
        breakdown.wind * WEIGHTS.wind +
        breakdown.period * WEIGHTS.period,
    );

    return { score, breakdown, conditions: this.toConditions(score) };
  }

  private toConditions(score: number): Conditions {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 35) return 'fair';
    return 'poor';
  }

  private scoreSwellDirection(spot: SpotProfile, forecast: ForecastSnapshot): number {
    if (forecast.swellDirection == null) {
      return 0;
    }
    if (spot.optimalSwellDirMin == null || spot.optimalSwellDirMax == null) {
      return NEUTRAL_SCORE;
    }
    const distance = distanceToRange(
      forecast.swellDirection,
      spot.optimalSwellDirMin,
      spot.optimalSwellDirMax,
    );
    return linearFalloff(distance, SWELL_PENALTY_RANGE_DEG);
  }

  private scoreWaveHeight(spot: SpotProfile, forecast: ForecastSnapshot): number {
    if (forecast.waveHeight == null) {
      return 0;
    }
    if (spot.optimalWaveMin == null || spot.optimalWaveMax == null) {
      return NEUTRAL_SCORE;
    }
    const { waveHeight } = forecast;
    const { optimalWaveMin, optimalWaveMax } = spot;
    if (waveHeight >= optimalWaveMin && waveHeight <= optimalWaveMax) {
      return 100;
    }
    const distance =
      waveHeight < optimalWaveMin ? optimalWaveMin - waveHeight : waveHeight - optimalWaveMax;
    return clamp(100 - (distance / WAVE_PENALTY_RANGE_M) * 100);
  }

  /**
   * Direction (offshore vs. onshore) and intensity (light vs. strong) both
   * matter, weighted 60/40. When the spot has no known optimal wind range,
   * direction can't be judged, so this falls back to an intensity-only
   * score - light wind is still better than strong wind regardless of which
   * way it's blowing.
   */
  private scoreWind(spot: SpotProfile, forecast: ForecastSnapshot): number {
    if (forecast.windSpeed == null) {
      return 0;
    }
    const speedScore = clamp(100 - (forecast.windSpeed / WIND_SPEED_FULL_PENALTY_KMH) * 100);

    if (spot.optimalWindDirMin == null || spot.optimalWindDirMax == null) {
      return speedScore;
    }
    if (forecast.windDirection == null) {
      return speedScore;
    }

    const distance = distanceToRange(
      forecast.windDirection,
      spot.optimalWindDirMin,
      spot.optimalWindDirMax,
    );
    const directionScore = linearFalloff(distance, WIND_PENALTY_RANGE_DEG);
    return 0.6 * directionScore + 0.4 * speedScore;
  }

  private scorePeriod(forecast: ForecastSnapshot): number {
    if (forecast.wavePeriod == null) {
      return 0;
    }
    const ratio =
      (forecast.wavePeriod - PERIOD_MIN_S) / (PERIOD_MAX_S - PERIOD_MIN_S);
    return clamp(ratio * 100);
  }
}
