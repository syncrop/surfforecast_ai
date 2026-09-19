export interface ForecastPoint {
  forecastTime: Date;
  waveHeight: number | null;
  wavePeriod: number | null;
  swellDirection: number | null;
  windSpeed: number | null;
  windDirection: number | null;
  tideHeight: number | null;
  raw: Record<string, unknown>;
}

export interface MarineForecastProvider {
  /** Hourly forecast points for a location, nearest-first. */
  getForecast(lat: number, lon: number): Promise<ForecastPoint[]>;
}

export const MARINE_FORECAST_PROVIDER = Symbol('MARINE_FORECAST_PROVIDER');
