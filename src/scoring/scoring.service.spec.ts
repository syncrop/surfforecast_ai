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

  describe('wave-height conditions cap', () => {
    // Everything else perfect, so the underlying score alone would be "excellent" -
    // only waveHeight varies, to isolate the cap from the rest of the weighting.
    const perfectExceptWave = (waveHeight: number): ForecastSnapshot => ({
      swellDirection: 280,
      windDirection: 90,
      windSpeed: 5,
      wavePeriod: 14,
      waveHeight,
    });

    it('allows excellent/green when waveHeight is at or above 0.7m', () => {
      const result = scoringService.score(spot, perfectExceptWave(0.7));
      expect(result.conditions).toBe('excellent');
    });

    it('caps conditions at "fair" (yellow) when waveHeight is between 0.4m and 0.7m, even with a high score', () => {
      const result = scoringService.score(spot, perfectExceptWave(0.5));
      expect(result.conditions).toBe('fair');
    });

    it('never caps upward: a naturally poor/fair score in the 0.4-0.7m band stays as-is', () => {
      const badButInRange: ForecastSnapshot = {
        swellDirection: 90, // way outside optimal
        windDirection: 270,
        windSpeed: 35,
        wavePeriod: 5,
        waveHeight: 0.5,
      };
      const result = scoringService.score(spot, badButInRange);
      expect(result.conditions).toBe('poor');
    });

    it('forces "poor" below 0.4m regardless of how good the score is', () => {
      const result = scoringService.score(spot, perfectExceptWave(0.3));
      expect(result.conditions).toBe('poor');
    });

    it('does not apply the cap when waveHeight is null (unknown, not unsurfable)', () => {
      const forecast: ForecastSnapshot = {
        swellDirection: 280,
        windDirection: 90,
        windSpeed: 5,
        wavePeriod: 14,
        waveHeight: null,
      };
      const result = scoringService.score(spot, forecast);
      // waveHeight breakdown scores 0 for null, so the overall bucket is
      // pulled down by the weighting itself - not by the cap.
      expect(result.breakdown.waveHeight).toBe(0);
    });
  });
});
