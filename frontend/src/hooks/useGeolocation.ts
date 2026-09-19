import { useCallback, useState } from 'react';

// North Shore, Fuerteventura (El Cotillo) - used until the user grants
// location or explicitly declines. The island's geographic center is empty
// interior with no spots nearby; this is the densest real spot cluster, so
// the map always has something to show by default.
const FALLBACK_LOCATION = { lat: 28.69, lon: -14.0 };

export interface GeoLocation {
  lat: number;
  lon: number;
}

export function useGeolocation() {
  const [location, setLocation] = useState<GeoLocation>(FALLBACK_LOCATION);
  const [status, setStatus] = useState<'idle' | 'locating' | 'granted' | 'denied' | 'unsupported'>(
    'idle',
  );

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('unsupported');
      return;
    }

    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({ lat: position.coords.latitude, lon: position.coords.longitude });
        setStatus('granted');
      },
      () => {
        setStatus('denied');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 },
    );
  }, []);

  return { location, status, requestLocation, isFallback: status !== 'granted' };
}
