export type BreakType = 'beach_break' | 'reef_break' | 'point_break' | 'river_mouth';
export type BottomType = 'sand' | 'rock' | 'reef' | 'cobblestone' | 'mixed';
export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type Conditions = 'poor' | 'fair' | 'good' | 'excellent';

export interface SpotWithLocation {
  id: string;
  name: string;
  slug: string;
  lat: number;
  lon: number;
  region: string;
  country: string;
  breakType: BreakType;
  bottom: BottomType;
  optimalSwellDirMin: number;
  optimalSwellDirMax: number;
  optimalWindDirMin: number;
  optimalWindDirMax: number;
  optimalWaveMin: number;
  optimalWaveMax: number;
  skillLevel: SkillLevel;
  sourceUrl: string | null;
}

export interface ScoreBreakdown {
  swellDirection: number;
  waveHeight: number;
  wind: number;
  period: number;
}

export interface ForecastUsed {
  forecastTime: string;
  fetchedAt: string;
  waveHeight: number;
  wavePeriod: number;
  swellDirection: number;
  windSpeed: number;
  windDirection: number;
  tideHeight: number | null;
}

export interface SpotRecommendation {
  spot: SpotWithLocation;
  distance: number;
  score: number | null;
  breakdown: ScoreBreakdown | null;
  conditions: Conditions | null;
  forecast: ForecastUsed | null;
}

export interface RecommendationsWithSummary {
  summary: string | null;
  summaryGeneratedAt: string | null;
  recommendations: SpotRecommendation[];
}

export interface DayScore {
  date: string;
  score: number;
  conditions: Conditions;
}

/** Same shape as SpotRecommendation, but score/breakdown/conditions/forecast describe the best window found in the requested range, not "now". */
export interface UpcomingSpotRecommendation extends SpotRecommendation {
  dailyBest: DayScore[];
}
