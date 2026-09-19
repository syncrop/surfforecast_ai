const COMPASS_POINTS = [
  'N', 'NNE', 'NE', 'ENE',
  'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW',
  'W', 'WNW', 'NW', 'NNW',
];

export function degreesToCompass(deg: number): string {
  const normalized = ((deg % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % 16;
  return COMPASS_POINTS[index];
}

/** e.g. formatDirection(327) -> "NNW (327°)" */
export function formatDirection(deg: number): string {
  return `${degreesToCompass(deg)} (${Math.round(deg)}°)`;
}
