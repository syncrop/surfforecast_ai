import { useEffect, useState } from 'react';
import { getRecommendationsSummary } from '../api/client';
import type { RecommendationsWithSummary } from '../api/types';

export function useRecommendations(lat: number, lon: number, radius: number) {
  const [data, setData] = useState<RecommendationsWithSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getRecommendationsSummary(lat, lon, radius)
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
