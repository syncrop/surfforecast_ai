import { OpenMeteoProvider } from './open-meteo.provider';

function jsonResponse(body: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(JSON.stringify(body)),
  } as Response;
}

describe('OpenMeteoProvider', () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  describe('getForecast', () => {
    it('merges marine and weather series by timestamp, leaving tideHeight null', async () => {
      fetchMock.mockImplementation((url: string) => {
        if (url.includes('marine-api')) {
          return Promise.resolve(
            jsonResponse({
              hourly: {
                time: ['2026-01-01T00:00', '2026-01-01T01:00'],
                wave_height: [1.2, 1.4],
                wave_period: [10, 11],
                swell_wave_direction: [280, 285],
              },
            }),
          );
        }
        return Promise.resolve(
          jsonResponse({
            hourly: {
              time: ['2026-01-01T00:00', '2026-01-01T01:00'],
              windspeed_10m: [8, 9],
              winddirection_10m: [90, 95],
            },
          }),
        );
      });

      const provider = new OpenMeteoProvider();
      const points = await provider.getForecast(28.6, -14.0);

      expect(points).toHaveLength(2);
      expect(points[0]).toEqual({
        forecastTime: new Date('2026-01-01T00:00Z'),
        waveHeight: 1.2,
        wavePeriod: 10,
        swellDirection: 280,
        windSpeed: 8,
        windDirection: 90,
        tideHeight: null,
        raw: { time: '2026-01-01T00:00', waveHeight: 1.2, wavePeriod: 10, swellDirection: 280, windSpeed: 8, windDirection: 90 },
      });

      // Confirms tide isn't part of this request - fetched separately via getTide().
      const marineUrl = fetchMock.mock.calls.find(([url]) => url.includes('marine-api'))![0] as string;
      expect(marineUrl).not.toContain('sea_level_height_msl');
    });

    it('falls back to null wind when a marine timestamp has no matching weather entry', async () => {
      fetchMock.mockImplementation((url: string) => {
        if (url.includes('marine-api')) {
          return Promise.resolve(
            jsonResponse({
              hourly: {
                time: ['2026-01-01T00:00'],
                wave_height: [1.2],
                wave_period: [10],
                swell_wave_direction: [280],
              },
            }),
          );
        }
        return Promise.resolve(jsonResponse({ hourly: { time: [] } }));
      });

      const provider = new OpenMeteoProvider();
      const [pointResult] = await provider.getForecast(28.6, -14.0);

      expect(pointResult.windSpeed).toBeNull();
      expect(pointResult.windDirection).toBeNull();
    });

    it('throws when the marine endpoint responds non-ok', async () => {
      fetchMock.mockImplementation((url: string) => {
        if (url.includes('marine-api')) {
          return Promise.resolve(jsonResponse({}, false, 503));
        }
        return Promise.resolve(jsonResponse({ hourly: { time: [] } }));
      });

      const provider = new OpenMeteoProvider();

      await expect(provider.getForecast(28.6, -14.0)).rejects.toThrow(
        'Open-Meteo request failed with status 503',
      );
    });
  });

  describe('getTide', () => {
    it('maps the sea_level_height_msl series to tide points', async () => {
      fetchMock.mockImplementation((url: string) => {
        expect(url).toContain('marine-api');
        expect(url).toContain('sea_level_height_msl');
        return Promise.resolve(
          jsonResponse({
            hourly: {
              time: ['2026-01-01T00:00', '2026-01-01T01:00'],
              sea_level_height_msl: [-0.3, -0.1],
            },
          }),
        );
      });

      const provider = new OpenMeteoProvider();
      const points = await provider.getTide(37.0, -7.9);

      expect(points).toEqual([
        { time: new Date('2026-01-01T00:00Z'), tideHeight: -0.3 },
        { time: new Date('2026-01-01T01:00Z'), tideHeight: -0.1 },
      ]);
      // One request only (unlike getForecast, no separate weather call).
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('falls back to null for hours with no reading', async () => {
      fetchMock.mockResolvedValue(
        jsonResponse({
          hourly: {
            time: ['2026-01-01T00:00'],
            sea_level_height_msl: [null],
          },
        }),
      );

      const provider = new OpenMeteoProvider();
      const [point] = await provider.getTide(37.0, -7.9);

      expect(point.tideHeight).toBeNull();
    });

    it('throws when the marine endpoint responds non-ok', async () => {
      fetchMock.mockResolvedValue(jsonResponse({}, false, 503));

      const provider = new OpenMeteoProvider();

      await expect(provider.getTide(37.0, -7.9)).rejects.toThrow(
        'Open-Meteo request failed with status 503',
      );
    });
  });
});
