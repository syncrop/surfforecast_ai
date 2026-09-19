function normalizeDeg(deg: number): number {
  return ((deg % 360) + 360) % 360;
}

/** Shortest angular distance between two compass directions, in [0, 180]. */
export function angularDiff(a: number, b: number): number {
  const diff = Math.abs(normalizeDeg(a) - normalizeDeg(b)) % 360;
  return diff > 180 ? 360 - diff : diff;
}

/**
 * Whether `dir` falls within [min, max] going clockwise, supporting ranges
 * that cross the 0°/360° seam (e.g. min=350, max=20 covers 350°..360°,0°..20°).
 */
export function inDirectionRange(dir: number, min: number, max: number): boolean {
  const d = normalizeDeg(dir);
  const lo = normalizeDeg(min);
  const hi = normalizeDeg(max);
  if (lo <= hi) {
    return d >= lo && d <= hi;
  }
  return d >= lo || d <= hi;
}

/** Angular distance from `dir` to the nearest edge of [min, max]; 0 if inside. */
export function distanceToRange(dir: number, min: number, max: number): number {
  if (inDirectionRange(dir, min, max)) {
    return 0;
  }
  return Math.min(angularDiff(dir, min), angularDiff(dir, max));
}
