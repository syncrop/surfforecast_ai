import { useEffect, useState } from 'react';
import { getUpcomingRecommendations } from '../api/client';
import type { UpcomingSpotRecommendation } from '../api/types';

/** `enabled` skips the fetch entirely - only used once the user switches to the "upcoming days" view. */
export function useUpcomingRecommendations(
  lat: number,
  lon: number,
  radius: number,
  days: number,
  enabled: boolean,
) {
  const [data, setData] = useState<UpcomingSpotRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    getUpcomingRecommendations(lat, lon, radius, days)
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lon, radius, days, enabled]);

  return { data, loading, error };
}
