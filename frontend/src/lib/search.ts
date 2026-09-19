import type { SpotWithLocation } from '../api/types';

export type SearchResult =
  | { type: 'spot'; key: string; label: string; sublabel: string; lat: number; lon: number }
  | { type: 'region'; key: string; label: string; sublabel: string; lat: number; lon: number };

const MAX_RESULTS = 8;

/** Accent/case-insensitive: "penich" matches "Peniche", "sao lourenco" matches "São Lourenço". */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Matches the query against spot names first, then region names (using that
 * region's first spot as the map anchor point), so searching either a spot
 * or a whole zone works from the same input.
 */
export function searchSpots(spots: SpotWithLocation[], query: string): SearchResult[] {
  const q = normalize(query.trim());
  if (!q) return [];

  const spotMatches: SearchResult[] = spots
    .filter((s) => normalize(s.name).includes(q))
    .map((s) => ({
      type: 'spot',
      key: s.slug, // matches the app's selectedSlug convention, so search can select-and-open a spot directly
      label: s.name,
      sublabel: s.region,
      lat: s.lat,
      lon: s.lon,
    }));

  const seenRegions = new Set<string>();
  const regionMatches: SearchResult[] = [];
  for (const s of spots) {
    if (seenRegions.has(s.region) || !normalize(s.region).includes(q)) continue;
    seenRegions.add(s.region);
    regionMatches.push({
      type: 'region',
      key: s.region,
      label: s.region,
      sublabel: `${s.country} · zona`,
      lat: s.lat,
      lon: s.lon,
    });
  }

  return [...spotMatches, ...regionMatches].slice(0, MAX_RESULTS);
}
