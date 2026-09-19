import { SpotsService } from './spots.service';
import { NearbySpotWithForecastRow } from './repositories/spots.repository';
import { BottomType, BreakType, SkillLevel } from './enums/spot.enums';

function makeRow(overrides: Partial<NearbySpotWithForecastRow> = {}): NearbySpotWithForecastRow {
  return {
    id: 's1',
    name: 'Spot 1',
    slug: 'spot-1',
    region: 'North Shore',
    country: 'Spain',
    breakType: BreakType.BEACH_BREAK,
    bottom: BottomType.SAND,
    optimalSwellDirMin: 260,
    optimalSwellDirMax: 300,
    optimalWindDirMin: 70,
    optimalWindDirMax: 110,
    optimalWaveMin: 0.5,
    optimalWaveMax: 2.5,
    skillLevel: SkillLevel.BEGINNER,
    sourceUrl: null,
    lat: 28.6,
    lon: -14.0,
    distance: 1000,
    forecastId: 'f1',
    forecastTime: new Date('2026-01-01T00:00:00Z'),
    fetchedAt: new Date('2026-01-01T00:00:00Z'),
    waveHeight: 1.5,
    wavePeriod: 12,
    swellDirection: 280,
    windSpeed: 10,
    windDirection: 90,
    tideHeight: 0.4,
    ...overrides,
  };
}

function makeService() {
  const spotsRepository = {
    findNearbyWithLatestForecast: jest.fn(),
    findByRegionWithLatestForecast: jest.fn(),
    findNearbyWithForecastWindow: jest.fn(),
    findRegionSummary: jest.fn(),
    upsertRegionSummary: jest.fn(),
  };
  const scoringService = {
    score: jest.fn(),
  };
  const surfSummaryService = {
    summarize: jest.fn(),
  };

  const service = new SpotsService(
    spotsRepository as any,
    scoringService as any,
    surfSummaryService as any,
  );

  return { service, spotsRepository, scoringService, surfSummaryService };
}

describe('SpotsService', () => {
  describe('getRecommendations', () => {
    it('scores rows that have a forecast and sorts by score descending', async () => {
      const { service, spotsRepository, scoringService } = makeService();
      spotsRepository.findNearbyWithLatestForecast.mockResolvedValue([
        makeRow({ id: 'low', distance: 100 }),
        makeRow({ id: 'high', distance: 200 }),
      ]);
      scoringService.score
        .mockReturnValueOnce({ score: 40, breakdown: {}, conditions: 'fair' }) // low
        .mockReturnValueOnce({ score: 90, breakdown: {}, conditions: 'excellent' }); // high

      const result = await service.getRecommendations(28.6, -14.0, 20_000);

      expect(result.map((r) => r.spot.id)).toEqual(['high', 'low']);
      expect(result[0].score).toBe(90);
      expect(result[0].forecast?.forecastTime).toEqual(new Date('2026-01-01T00:00:00Z'));
    });

    it('leaves score/breakdown/conditions/forecast null when a spot has no forecast yet, and sorts nulls last', async () => {
      const { service, spotsRepository, scoringService } = makeService();
      spotsRepository.findNearbyWithLatestForecast.mockResolvedValue([
        makeRow({ id: 'no-forecast', forecastId: null }),
        makeRow({ id: 'scored' }),
      ]);
      scoringService.score.mockReturnValue({ score: 50, breakdown: {}, conditions: 'good' });

      const result = await service.getRecommendations(28.6, -14.0, 20_000);

      expect(result.map((r) => r.spot.id)).toEqual(['scored', 'no-forecast']);
      const noForecast = result.find((r) => r.spot.id === 'no-forecast')!;
      expect(noForecast.score).toBeNull();
      expect(noForecast.breakdown).toBeNull();
      expect(noForecast.conditions).toBeNull();
      expect(noForecast.forecast).toBeNull();
      expect(scoringService.score).not.toHaveBeenCalledWith(
        expect.objectContaining({ id: 'no-forecast' }),
        expect.anything(),
      );
    });
  });

  describe('getRecommendationsSummary', () => {
    it('reads the cached region summary and never calls Claude when no userQuery is given', async () => {
      const { service, spotsRepository, scoringService, surfSummaryService } = makeService();
      spotsRepository.findNearbyWithLatestForecast.mockResolvedValue([makeRow({ region: 'North Shore' })]);
      scoringService.score.mockReturnValue({ score: 80, breakdown: {}, conditions: 'excellent' });
      spotsRepository.findRegionSummary.mockResolvedValue({
        summary: 'cached text',
        generatedAt: new Date('2026-01-01T00:00:00Z'),
      });

      const result = await service.getRecommendationsSummary(28.6, -14.0, 20_000);

      expect(result.summary).toBe('cached text');
      expect(result.summaryGeneratedAt).toEqual(new Date('2026-01-01T00:00:00Z'));
      expect(spotsRepository.findRegionSummary).toHaveBeenCalledWith('North Shore');
      expect(surfSummaryService.summarize).not.toHaveBeenCalled();
    });

    it('calls Claude live when userQuery is given, bypassing the cache', async () => {
      const { service, spotsRepository, scoringService, surfSummaryService } = makeService();
      spotsRepository.findNearbyWithLatestForecast.mockResolvedValue([makeRow()]);
      scoringService.score.mockReturnValue({ score: 80, breakdown: {}, conditions: 'excellent' });
      surfSummaryService.summarize.mockResolvedValue('personalized text');

      const result = await service.getRecommendationsSummary(28.6, -14.0, 20_000, 'soy principiante');

      expect(result.summary).toBe('personalized text');
      expect(surfSummaryService.summarize).toHaveBeenCalledWith(expect.any(Array), 'soy principiante');
      expect(spotsRepository.findRegionSummary).not.toHaveBeenCalled();
    });

    it('returns a null summary without crashing when there are no nearby spots', async () => {
      const { service, spotsRepository, surfSummaryService } = makeService();
      spotsRepository.findNearbyWithLatestForecast.mockResolvedValue([]);

      const result = await service.getRecommendationsSummary(0, 0, 20_000);

      expect(result.summary).toBeNull();
      expect(result.recommendations).toEqual([]);
      expect(spotsRepository.findRegionSummary).not.toHaveBeenCalled();
      expect(surfSummaryService.summarize).not.toHaveBeenCalled();
    });
  });

  describe('getUpcomingRecommendations', () => {
    it('keeps the best-scoring forecast row per spot and a per-day peak', async () => {
      const { service, spotsRepository, scoringService } = makeService();
      spotsRepository.findNearbyWithForecastWindow.mockResolvedValue([
        makeRow({ id: 'a', forecastId: 'a1', forecastTime: new Date('2026-01-05T10:00:00Z') }),
        makeRow({ id: 'a', forecastId: 'a2', forecastTime: new Date('2026-01-05T18:00:00Z') }),
        makeRow({ id: 'a', forecastId: 'a3', forecastTime: new Date('2026-01-06T09:00:00Z') }),
      ]);
      scoringService.score
        .mockReturnValueOnce({ score: 40, breakdown: {}, conditions: 'fair' }) // a1
        .mockReturnValueOnce({ score: 70, breakdown: {}, conditions: 'good' }) // a2 - best overall
        .mockReturnValueOnce({ score: 55, breakdown: {}, conditions: 'fair' }); // a3 - best for day 2

      const result = await service.getUpcomingRecommendations(28.6, -14.0, 20_000, 3);

      expect(result).toHaveLength(1);
      expect(result[0].score).toBe(70);
      expect(result[0].forecast?.forecastTime).toEqual(new Date('2026-01-05T18:00:00Z'));
      expect(result[0].dailyBest).toEqual([
        { date: '2026-01-05', score: 70, conditions: 'good' },
        { date: '2026-01-06', score: 55, conditions: 'fair' },
      ]);
    });

    it('leaves score null and dailyBest empty when a spot has no forecast rows in the window', async () => {
      const { service, spotsRepository, scoringService } = makeService();
      spotsRepository.findNearbyWithForecastWindow.mockResolvedValue([
        makeRow({ id: 'no-data', forecastId: null, forecastTime: null }),
      ]);

      const result = await service.getUpcomingRecommendations(28.6, -14.0, 20_000, 3);

      expect(result).toEqual([
        {
          spot: expect.objectContaining({ id: 'no-data' }),
          distance: expect.any(Number),
          score: null,
          breakdown: null,
          conditions: null,
          forecast: null,
          dailyBest: [],
        },
      ]);
      expect(scoringService.score).not.toHaveBeenCalled();
    });

    it('sorts spots by their best score across the window, nulls last', async () => {
      const { service, spotsRepository, scoringService } = makeService();
      spotsRepository.findNearbyWithForecastWindow.mockResolvedValue([
        makeRow({ id: 'no-data', forecastId: null, forecastTime: null }),
        makeRow({ id: 'low', forecastId: 'l1', forecastTime: new Date('2026-01-05T10:00:00Z') }),
        makeRow({ id: 'high', forecastId: 'h1', forecastTime: new Date('2026-01-05T10:00:00Z') }),
      ]);
      scoringService.score
        .mockReturnValueOnce({ score: 30, breakdown: {}, conditions: 'poor' }) // low
        .mockReturnValueOnce({ score: 90, breakdown: {}, conditions: 'excellent' }); // high

      const result = await service.getUpcomingRecommendations(28.6, -14.0, 20_000, 3);

      expect(result.map((r) => r.spot.id)).toEqual(['high', 'low', 'no-data']);
    });
  });

  describe('cacheRegionSummary', () => {
    it('delegates to the repository upsert', async () => {
      const { service, spotsRepository } = makeService();
      spotsRepository.upsertRegionSummary.mockResolvedValue(undefined);

      await service.cacheRegionSummary('North Shore', 'text');

      expect(spotsRepository.upsertRegionSummary).toHaveBeenCalledWith('North Shore', 'text');
    });
  });

  describe('getCachedRegionSummary', () => {
    it('reads the cache directly, without touching recommendations or Claude', async () => {
      const { service, spotsRepository, surfSummaryService } = makeService();
      spotsRepository.findRegionSummary.mockResolvedValue({
        summary: 'cached text',
        generatedAt: new Date('2026-01-01T00:00:00Z'),
      });

      const result = await service.getCachedRegionSummary('North Shore');

      expect(result).toEqual({ summary: 'cached text', generatedAt: new Date('2026-01-01T00:00:00Z') });
      expect(spotsRepository.findRegionSummary).toHaveBeenCalledWith('North Shore');
      expect(spotsRepository.findNearbyWithLatestForecast).not.toHaveBeenCalled();
      expect(surfSummaryService.summarize).not.toHaveBeenCalled();
    });

    it('returns nulls when no cached summary exists yet', async () => {
      const { service, spotsRepository } = makeService();
      spotsRepository.findRegionSummary.mockResolvedValue(null);

      const result = await service.getCachedRegionSummary('North Shore');

      expect(result).toEqual({ summary: null, generatedAt: null });
    });
  });
});
