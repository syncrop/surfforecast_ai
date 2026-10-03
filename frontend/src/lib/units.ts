const KMH_TO_KNOTS = 0.539957;

/** Wind speed is fetched/stored in km/h (Open-Meteo's default unit) - only converted to knots at display time. */
export function formatWindSpeed(windSpeedKmh: number): string {
  return `${Math.round(windSpeedKmh * KMH_TO_KNOTS)} kn`;
}
