import type { RegionSummary, SpotRecommendation, UpcomingSpotRecommendation } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/** Cheap DB + scoring read, no throttle concerns - safe to call on every map pan. */
export async function getRecommendations(
  lat: number,
  lon: number,
  radius: number,
): Promise<SpotRecommendation[]> {
  const url = new URL('/spots/recommendations', API_URL);
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('radius', String(radius));

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

/** Just the cached summary for a region - fetch on-demand (e.g. opening a spot), not on every pan. */
export async function getRegionSummary(region: string): Promise<RegionSummary> {
  const url = new URL(`/spots/regions/${encodeURIComponent(region)}/summary`, API_URL);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

export async function getUpcomingRecommendations(
  lat: number,
  lon: number,
  radius: number,
  days: number,
): Promise<UpcomingSpotRecommendation[]> {
  const url = new URL('/spots/recommendations/upcoming', API_URL);
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('radius', String(radius));
  url.searchParams.set('days', String(days));

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}
