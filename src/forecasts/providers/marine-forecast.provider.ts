export interface ForecastPoint {
  forecastTime: Date;
  waveHeight: number | null;
  wavePeriod: number | null;
  swellDirection: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  /** Always null here - tide is fetched separately via getTide() and merged in by region, not per spot. */
  tideHeight: number | null;
  raw: Record<string, unknown>;
}

export interface TidePoint {
  time: Date;
  tideHeight: number | null;
}

export interface MarineForecastProvider {
  /** Hourly wave/wind forecast points for a location, nearest-first. */
  getForecast(lat: number, lon: number): Promise<ForecastPoint[]>;
  /**
   * Hourly tide (sea level) points for a location. Tide varies at a much
   * coarser scale than wave/wind - meant to be called once per region using
   * a representative point, not once per spot.
   */
  getTide(lat: number, lon: number): Promise<TidePoint[]>;
}

export const MARINE_FORECAST_PROVIDER = Symbol('MARINE_FORECAST_PROVIDER');
