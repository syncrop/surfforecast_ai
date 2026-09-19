import { ScoringService } from './scoring.service';
import { ForecastSnapshot, SpotProfile } from './scoring.types';

describe('ScoringService', () => {
  const scoringService = new ScoringService();

  const spot: SpotProfile = {
    optimalSwellDirMin: 260,
    optimalSwellDirMax: 300,
    optimalWindDirMin: 70,
    optimalWindDirMax: 110,
    optimalWaveMin: 0.5,
    optimalWaveMax: 2.5,
  };

  it('scores high (>80) when swell and wind are within the optimal range', () => {
    const forecast: ForecastSnapshot = {
      swellDirection: 280, // inside [260, 300]
      waveHeight: 1.5, // inside [0.5, 2.5]
      windDirection: 90, // inside [70, 110]
      windSpeed: 8, // light
      wavePeriod: 14, // groundswell
    };

    const result = scoringService.score(spot, forecast);

    expect(result.score).toBeGreaterThan(80);
    expect(result.conditions).toBe('excellent');
  });

  it('scores low (<35) when swell is out of range and wind is strong onshore', () => {
    const forecast: ForecastSnapshot = {
      swellDirection: 90, // ~150-170° from [260, 300]
      waveHeight: 4.5, // well above optimalWaveMax
      windDirection: 270, // opposite of offshore [70, 110]
      windSpeed: 35, // strong
      wavePeriod: 5, // windswell
    };

    const result = scoringService.score(spot, forecast);

    expect(result.score).toBeLessThan(35);
    expect(result.conditions).toBe('poor');
  });

  it('falls back to intensity-only wind scoring when the spot has no optimal wind direction', () => {
    const spotWithoutWindDir: SpotProfile = {
      ...spot,
      optimalWindDirMin: null,
      optimalWindDirMax: null,
    };
    const forecast: ForecastSnapshot = {
      swellDirection: 280,
      waveHeight: 1.5,
      windDirection: 200, // would normally be penalized, must be ignored
      windSpeed: 5, // light -> high intensity-only score
      wavePeriod: 14,
    };

    const result = scoringService.score(spotWithoutWindDir, forecast);

    // 5 km/h against a 40 km/h full-penalty scale -> 100 - (5/40)*100 = 87.5
    expect(result.breakdown.wind).toBeCloseTo(87.5);
  });

  it('scores swellDirection as 0 without throwing when the forecast has no swellDirection', () => {
    const forecast: ForecastSnapshot = {
      swellDirection: null,
      waveHeight: 1.5,
      windDirection: 90,
      windSpeed: 8,
      wavePeriod: 14,
    };

    expect(() => scoringService.score(spot, forecast)).not.toThrow();

    const result = scoringService.score(spot, forecast);
    expect(result.breakdown.swellDirection).toBe(0);
    expect(Number.isFinite(result.score)).toBe(true);
  });
});
