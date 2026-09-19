import { useEffect, useState } from 'react';
import { getRecommendations } from '../api/client';
import type { SpotRecommendation } from '../api/types';

/** Cheap DB + scoring read - safe to call on every map pan, unlike the region summary. */
export function useRecommendations(lat: number, lon: number, radius: number) {
  const [data, setData] = useState<SpotRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getRecommendations(lat, lon, radius)
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
  }, [lat, lon, radius]);

  return { data, loading, error };
}
