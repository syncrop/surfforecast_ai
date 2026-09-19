import { SpotsRepository } from './spots.repository';
import { BottomType, BreakType, SkillLevel } from '../enums/spot.enums';
import { CreateSpotDto } from '../dto/create-spot.dto';

/**
 * Regression guard for the exact bug we hit once already: an INSERT with
 * more/fewer `$N` placeholders in the SQL than values in the params array
 * (Postgres either errors immediately or, worse, silently misaligns values).
 */
function expectPlaceholdersMatchParams(sql: string, params: unknown[]) {
  const placeholders = [...sql.matchAll(/\$(\d+)/g)].map((m) => Number(m[1]));
  const maxPlaceholder = placeholders.length ? Math.max(...placeholders) : 0;
  expect(maxPlaceholder).toBe(params.length);
}

function makeRepository() {
  const query = jest.fn();
  const dataSource = {
    query,
    createEntityManager: jest.fn().mockReturnValue({}),
  };
  const repository = new SpotsRepository(dataSource as any);
  return { repository, query };
}

const createDto: CreateSpotDto = {
  name: 'Test Spot',
  slug: 'test-spot',
  lat: 28.6,
  lon: -14.0,
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
};

describe('SpotsRepository', () => {
  describe('createSpot', () => {
    it('sends one INSERT placeholder per param, including sourceUrl', async () => {
      const { repository, query } = makeRepository();
      query
        .mockResolvedValueOnce([{ id: 'new-id' }]) // INSERT ... RETURNING id
        .mockResolvedValueOnce([{ id: 'new-id', slug: 'test-spot' }]); // findById

      await repository.createSpot(createDto);

      const [insertSql, insertParams] = query.mock.calls[0];
      expectPlaceholdersMatchParams(insertSql, insertParams);
      expect(insertParams).toHaveLength(16); // 15 columns; location consumes 2 (lon, lat)
      expect(insertParams[insertParams.length - 1]).toBeNull(); // sourceUrl defaults to null
    });

    it('looks up the created row by the returned id', async () => {
      const { repository, query } = makeRepository();
      query
        .mockResolvedValueOnce([{ id: 'new-id' }])
        .mockResolvedValueOnce([{ id: 'new-id', slug: 'test-spot' }]);

      const result = await repository.createSpot(createDto);

      expect(query.mock.calls[1][0]).toContain('WHERE "id" = $1');
      expect(query.mock.calls[1][1]).toEqual(['new-id']);
      expect(result).toEqual({ id: 'new-id', slug: 'test-spot' });
    });
  });

  describe.each([
    ['findNearby', (r: SpotsRepository) => r.findNearby(28.6, -14.0, 5000)],
    [
      'findNearbyWithLatestForecast',
      (r: SpotsRepository) => r.findNearbyWithLatestForecast(28.6, -14.0, 5000),
    ],
  ])('%s', (_name, call) => {
    it('passes params as [lon, lat, radius], not [lat, lon, radius]', async () => {
      const { repository, query } = makeRepository();
      query.mockResolvedValue([]);

      await call(repository);

      const [sql, params] = query.mock.calls[0];
      expectPlaceholdersMatchParams(sql, params);
      expect(params).toEqual([-14.0, 28.6, 5000]);
    });
  });

  describe('findNearbyWithForecastWindow', () => {
    it('passes params as [lon, lat, radius, days] and filters forecasts to that window', async () => {
      const { repository, query } = makeRepository();
      query.mockResolvedValue([]);

      await repository.findNearbyWithForecastWindow(28.6, -14.0, 5000, 3);

      const [sql, params] = query.mock.calls[0];
      expectPlaceholdersMatchParams(sql, params);
      expect(params).toEqual([-14.0, 28.6, 5000, 3]);
      expect(sql).toContain(`"forecastTime" BETWEEN now() AND now() + ($4::int * INTERVAL '1 day')`);
    });
  });

  describe('findByRegionWithLatestForecast', () => {
    it('filters by region and hardcodes distance to 0 (no reference point)', async () => {
      const { repository, query } = makeRepository();
      query.mockResolvedValue([]);

      await repository.findByRegionWithLatestForecast('North Shore');

      const [sql, params] = query.mock.calls[0];
      expectPlaceholdersMatchParams(sql, params);
      expect(params).toEqual(['North Shore']);
      expect(sql).toContain('0 AS distance');
      expect(sql).toContain('"spots"."region" = $1');
    });
  });

  describe('findRegionSummary', () => {
    it('returns null when no cached summary exists', async () => {
      const { repository, query } = makeRepository();
      query.mockResolvedValue([]);

      const result = await repository.findRegionSummary('North Shore');

      expect(result).toBeNull();
    });

    it('returns the cached row when present', async () => {
      const { repository, query } = makeRepository();
      const generatedAt = new Date('2026-01-01T00:00:00Z');
      query.mockResolvedValue([{ summary: 'text', generatedAt }]);

      const result = await repository.findRegionSummary('North Shore');

      expect(result).toEqual({ summary: 'text', generatedAt });
    });
  });

  describe('upsertRegionSummary', () => {
    it('upserts on the region unique constraint', async () => {
      const { repository, query } = makeRepository();
      query.mockResolvedValue(undefined);

      await repository.upsertRegionSummary('North Shore', 'text');

      const [sql, params] = query.mock.calls[0];
      expectPlaceholdersMatchParams(sql, params);
      expect(params).toEqual(['North Shore', 'text']);
      expect(sql).toContain('ON CONFLICT ("region")');
    });
  });
});
