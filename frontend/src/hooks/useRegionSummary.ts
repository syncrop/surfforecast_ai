import { useEffect, useState } from 'react';
import { getRegionSummary } from '../api/client';

/**
 * Fetches the cached summary for a region on-demand - `enabled` is only true
 * while a spot's detail view is open, so this never fires on map pans (see
 * useRecommendations, which handles the frequent list/map data instead).
 */
export function useRegionSummary(region: string | null, enabled: boolean) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !region) {
      setSummary(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getRegionSummary(region)
      .then((result) => {
        if (!cancelled) setSummary(result.summary);
      })
      .catch(() => {
        if (!cancelled) setSummary(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [region, enabled]);

  return { summary, loading };
}
