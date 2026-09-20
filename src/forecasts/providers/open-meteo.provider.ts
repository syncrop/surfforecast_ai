import { Injectable, Logger } from '@nestjs/common';
import { ForecastPoint, MarineForecastProvider, TidePoint } from './marine-forecast.provider';

const MARINE_URL = 'https://marine-api.open-meteo.com/v1/marine';
const WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';
const FORECAST_DAYS = 7;
const REQUEST_TIMEOUT_MS = 10_000;

/** How many days of forecast the ingest cron actually fetches - the hard cap for any "upcoming days" query. */
export const FORECAST_HORIZON_DAYS = FORECAST_DAYS;

interface HourlySeries {
  time: string[];
  [key: string]: (number | null)[] | string[];
}

interface OpenMeteoResponse {
  hourly: HourlySeries;
}

/**
 * Marine data (waves/swell) and standard weather data (wind) live on two
 * separate Open-Meteo endpoints; this provider fetches both and merges them
 * by timestamp. Tide is fetched separately via {@link getTide} - it's a
 * regional-scale phenomenon, not a per-spot one, so the ingest cron calls it
 * once per region rather than once per spot.
 */
@Injectable()
export class OpenMeteoProvider implements MarineForecastProvider {
  private readonly logger = new Logger(OpenMeteoProvider.name);

  async getForecast(lat: number, lon: number): Promise<ForecastPoint[]> {
    const [marine, weather] = await Promise.all([
      this.fetchJson(MARINE_URL, {
        latitude: lat,
        longitude: lon,
        hourly: 'wave_height,wave_period,swell_wave_direction',
        timezone: 'UTC',
        forecast_days: FORECAST_DAYS,
      }),
      this.fetchJson(WEATHER_URL, {
        latitude: lat,
        longitude: lon,
        hourly: 'windspeed_10m,winddirection_10m',
        timezone: 'UTC',
        forecast_days: FORECAST_DAYS,
      }),
    ]);

    const windByTime = new Map<string, { windSpeed: number | null; windDirection: number | null }>();
    weather.hourly.time.forEach((t, i) => {
      windByTime.set(t, {
        windSpeed: (weather.hourly.windspeed_10m as (number | null)[])[i] ?? null,
        windDirection: (weather.hourly.winddirection_10m as (number | null)[])[i] ?? null,
      });
    });

    return marine.hourly.time.map((t, i): ForecastPoint => {
      const wind = windByTime.get(t) ?? { windSpeed: null, windDirection: null };
      const waveHeight = (marine.hourly.wave_height as (number | null)[])[i] ?? null;
      const wavePeriod = (marine.hourly.wave_period as (number | null)[])[i] ?? null;
      const swellDirection = (marine.hourly.swell_wave_direction as (number | null)[])[i] ?? null;

      return {
        forecastTime: new Date(`${t}Z`),
        waveHeight,
        wavePeriod,
        swellDirection,
        windSpeed: wind.windSpeed,
        windDirection: wind.windDirection,
        tideHeight: null,
        raw: { time: t, waveHeight, wavePeriod, swellDirection, ...wind },
      };
    });
  }

  /**
   * Tide (sea level) for one representative point, meant to be shared across
   * every spot in a region. `sea_level_height_msl` is a harmonic tidal
   * model, in meters relative to mean sea level (oscillates around 0, not a
   * port's usual "0 = lowest astronomical tide" datum).
   */
  async getTide(lat: number, lon: number): Promise<TidePoint[]> {
    const marine = await this.fetchJson(MARINE_URL, {
      latitude: lat,
      longitude: lon,
      hourly: 'sea_level_height_msl',
      timezone: 'UTC',
      forecast_days: FORECAST_DAYS,
    });

    return marine.hourly.time.map((t, i) => ({
      time: new Date(`${t}Z`),
      tideHeight: (marine.hourly.sea_level_height_msl as (number | null)[])[i] ?? null,
    }));
  }

  private async fetchJson(
    url: string,
    params: Record<string, string | number>,
  ): Promise<OpenMeteoResponse> {
    const query = new URLSearchParams(
      Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
    );
    const response = await fetch(`${url}?${query.toString()}`, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      this.logger.error(`Open-Meteo request failed (${response.status}): ${body}`);
      throw new Error(`Open-Meteo request failed with status ${response.status}`);
    }

    return response.json() as Promise<OpenMeteoResponse>;
  }
}
