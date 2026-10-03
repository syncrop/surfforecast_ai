import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'surfforecast:favorites';

function readStored(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

/**
 * The app has no accounts/login, so favorites live in this browser only
 * (localStorage) - there's nowhere else to store a "whose favorite is it"
 * relationship without building a whole auth system for it.
 */
export function useFavorites() {
  const [slugs, setSlugs] = useState<string[]>(() => readStored());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs));
    } catch {
      // Private browsing / storage full / blocked - favorites just won't persist this session.
    }
  }, [slugs]);

  const isFavorite = useCallback((slug: string) => slugs.includes(slug), [slugs]);

  const toggleFavorite = useCallback((slug: string) => {
    setSlugs((current) =>
      current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug],
    );
  }, []);

  return { favoriteSlugs: slugs, isFavorite, toggleFavorite };
}
