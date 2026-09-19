import type { RecommendationsWithSummary } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function getRecommendationsSummary(
  lat: number,
  lon: number,
  radius: number,
): Promise<RecommendationsWithSummary> {
  const url = new URL('/spots/recommendations/summary', API_URL);
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('radius', String(radius));

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}
