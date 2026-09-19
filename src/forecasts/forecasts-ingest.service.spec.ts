import { ForecastsIngestService } from './forecasts-ingest.service';
import { ForecastPoint } from './providers/marine-forecast.provider';

function expectPlaceholdersMatchParams(sql: string, params: unknown[]) {
  const placeholders = [...sql.matchAll(/\$(\d+)/g)].map((m) => Number(m[1]));
  const maxPlaceholder = placeholders.length ? Math.max(...placeholders) : 0;
  expect(maxPlaceholder).toBe(params.length);
}

const point: ForecastPoint = {
  forecastTime: new Date('2026-01-01T00:00:00Z'),
  waveHeight: 1.5,
  wavePeriod: 12,
  swellDirection: 280,
  windSpeed: 10,
  windDirection: 90,
  tideHeight: null,
  raw: { source: 'test' },
};

function makeService() {
  const query = jest.fn();
  const dataSource = { query };
  const provider = { getForecast: jest.fn() };
  const spotsService = {
    getRegionRecommendations: jest.fn(),
    cacheRegionSummary: jest.fn(),
  };
  const surfSummaryService = { summarize: jest.fn() };

  const service = new ForecastsIngestService(
    dataSource as any,
    provider as any,
    spotsService as any,
    surfSummaryService as any,
  );

  return { service, query, provider, spotsService, surfSummaryService };
}

describe('ForecastsIngestService', () => {
  describe('ingestAll', () => {
    it('ingests every spot independently, skipping (not failing on) a spot whose provider call errors', async () => {
      const { service, query, provider, spotsService, surfSummaryService } = makeService();

      query
        .mockResolvedValueOnce([
          { id: 'spotA', slug: 'spot-a', lat: 28.6, lon: -14.0 },
          { id: 'spotB', slug: 'spot-b', lat: 28.7, lon: -14.1 },
        ]) // spots list
        .mockResolvedValueOnce(undefined) // INSERT for spotA
        .mockResolvedValueOnce([]); // distinct regions (empty, no region refresh needed)

      provider.getForecast
        .mockResolvedValueOnce([point]) // spotA
        .mockRejectedValueOnce(new Error('network down')); // spotB

      const result = await service.ingestAll();

      expect(result).toEqual({ spots: 2, forecasts: 1 });
      expect(spotsService.getRegionRecommendations).not.toHaveBeenCalled();
      expect(surfSummaryService.summarize).not.toHaveBeenCalled();

      const [insertSql, insertParams] = query.mock.calls[1];
      expect(insertSql).toContain('INSERT INTO "forecasts"');
      expectPlaceholdersMatchParams(insertSql, insertParams);
      expect(insertParams[0]).toBe('spotA');
    });

    it('refreshes the cached summary per region, isolating a failure in one region from the rest', async () => {
      const { service, query, provider, spotsService, surfSummaryService } = makeService();

      query
        .mockResolvedValueOnce([]) // no spots to ingest forecasts for
        .mockResolvedValueOnce([{ region: 'X' }, { region: 'Y' }]); // distinct regions

      spotsService.getRegionRecommendations.mockImplementation((region: string) => {
        if (region === 'Y') {
          return Promise.reject(new Error('scoring blew up'));
        }
        return Promise.resolve([{ spot: { region: 'X' } }]);
      });
      surfSummaryService.summarize.mockResolvedValue('summary for X');
      spotsService.cacheRegionSummary.mockResolvedValue(undefined);

      const result = await service.ingestAll();

      expect(result).toEqual({ spots: 0, forecasts: 0 });
      expect(spotsService.cacheRegionSummary).toHaveBeenCalledTimes(1);
      expect(spotsService.cacheRegionSummary).toHaveBeenCalledWith('X', 'summary for X');
      // region Y's failure must not have thrown out of ingestAll or blocked region X
      expect(provider.getForecast).not.toHaveBeenCalled();
    });
  });
});
