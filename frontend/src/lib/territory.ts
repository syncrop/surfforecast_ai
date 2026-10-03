/**
 * Coarser grouping than `spot.region` ("Corralejo", "La Santa, Lanzarote"),
 * used to sort favorites into a handful of sections. `country` alone isn't
 * enough - Canary Islands and mainland Andalucía spots both have
 * country "España" - so Spain is split further by latitude: the Canaries
 * sit roughly 7° south of the Huelva/Cádiz coast, with open ocean between
 * them, so a simple threshold is reliable with real spot coordinates.
 */
const CANARY_LATITUDE_CEILING = 33;

export const TERRITORY_ORDER = ['Canarias', 'Andalucía', 'Portugal', 'Marruecos'] as const;

export function getTerritory(spot: { country: string; lat: number }): string {
  if (spot.country === 'Marruecos') return 'Marruecos';
  if (spot.country === 'Portugal') return 'Portugal';
  // Anything else is Spain, regardless of exact spelling in `country` (seed
  // data has been inconsistent here - e.g. 'Spain' vs 'España') - the split
  // that actually matters is Canarias vs. mainland, which latitude alone
  // already answers reliably.
  return spot.lat < CANARY_LATITUDE_CEILING ? 'Canarias' : 'Andalucía';
}

export function compareTerritories(a: string, b: string): number {
  const ai = TERRITORY_ORDER.indexOf(a as (typeof TERRITORY_ORDER)[number]);
  const bi = TERRITORY_ORDER.indexOf(b as (typeof TERRITORY_ORDER)[number]);
  if (ai === -1 && bi === -1) return a.localeCompare(b);
  if (ai === -1) return 1;
  if (bi === -1) return -1;
  return ai - bi;
}
