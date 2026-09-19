/** The subset of Spot fields the scoring engine needs. */
export interface SpotProfile {
  optimalSwellDirMin: number | null;
  optimalSwellDirMax: number | null;
  optimalWindDirMin: number | null;
  optimalWindDirMax: number | null;
  optimalWaveMin: number | null;
  optimalWaveMax: number | null;
}

/** The subset of Forecast fields the scoring engine needs. */
export interface ForecastSnapshot {
  waveHeight: number | null;
  wavePeriod: number | null;
  swellDirection: number | null;
  windSpeed: number | null;
  windDirection: number | null;
}

export type Conditions = 'poor' | 'fair' | 'good' | 'excellent';

export interface ScoreBreakdown {
  swellDirection: number;
  waveHeight: number;
  wind: number;
  period: number;
}

export interface ScoreResult {
  score: number;
  breakdown: ScoreBreakdown;
  conditions: Conditions;
}
