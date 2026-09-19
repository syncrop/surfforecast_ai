import { useEffect, useState } from 'react';
import { getAllSpots } from '../api/client';
import type { SpotWithLocation } from '../api/types';

/** Fetches the full spot list once, for the search box's local index - not re-fetched on pan/zoom. */
export function useAllSpots() {
  const [spots, setSpots] = useState<SpotWithLocation[]>([]);

  useEffect(() => {
    let cancelled = false;
    getAllSpots()
      .then((result) => {
        if (!cancelled) setSpots(result);
      })
      .catch(() => {
        // Search box degrades to empty results; the rest of the app doesn't depend on this.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return spots;
}
