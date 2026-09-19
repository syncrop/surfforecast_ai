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

  it('merges marine and weather series by timestamp', async () => {
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
