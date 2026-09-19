import { useEffect, useRef, useState } from 'react';
import { MapView, type FlyToRequest, type MapMoveEnd } from './components/MapView';
import { SearchBox } from './components/SearchBox';
import { SpotList } from './components/SpotList';
import { SpotDetail } from './components/SpotDetail';
import { useAllSpots } from './hooks/useAllSpots';
import { useGeolocation, type GeoLocation } from './hooks/useGeolocation';
import { useRecommendations } from './hooks/useRecommendations';
import { useRegionSummary } from './hooks/useRegionSummary';
import { useUpcomingRecommendations } from './hooks/useUpcomingRecommendations';
import type { SearchResult } from './lib/search';
import './App.css';

/** Collapses rapid moveend events (a drag + inertia, a couple of scroll-zooms) into one fetch. */
const MAP_MOVE_DEBOUNCE_MS = 500;

/** Below this Leaflet zoom, the visible area is too wide for a 10-50km radius search to mean anything - stop fetching and ask the user to zoom in instead. */
const MIN_ZOOM_FOR_SEARCH = 8;

/** Zoom level to fly to when jumping to a single spot vs. a whole region from search. */
const SPOT_SEARCH_ZOOM = 13;
const REGION_SEARCH_ZOOM = 10;

const RADIUS_OPTIONS = [
  { label: '10 km', value: 10_000 },
  { label: '20 km', value: 20_000 },
  { label: '50 km', value: 50_000 },
];

const DAYS_OPTIONS = [3, 5, 7].map((value) => ({
  label: `Próximos ${value} días`,
  value,
}));

type Mode = 'now' | 'upcoming';

export default function App() {
  const { location, status, requestLocation } = useGeolocation();
  const allSpots = useAllSpots();
  const [radius, setRadius] = useState(20_000);
  const [mode, setMode] = useState<Mode>('now');
  const [days, setDays] = useState(3);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [tooZoomedOut, setTooZoomedOut] = useState(false);
  const [flyToRequest, setFlyToRequest] = useState<FlyToRequest | null>(null);

  // Spots are fetched around mapCenter, not the user's physical location, so
  // panning the map updates the results. mapCenter re-syncs to `location`
  // only on an explicit "Mi ubicación" click (or the initial fallback), never
  // while the user is just dragging the map around.
  const [mapCenter, setMapCenter] = useState<GeoLocation>(location);
  useEffect(() => {
    setMapCenter(location);
  }, [location]);

  // Debounced so a drag gesture (which can fire several moveend events via
  // inertia) or a couple of quick scroll-zooms collapse into one fetch
  // instead of one per event. Below MIN_ZOOM_FOR_SEARCH, skip fetching
  // entirely and show a "zoom in" hint instead - searching a 10-50km radius
  // when half a continent is visible doesn't make sense, and would just
  // burn API calls for a result the user can't act on.
  const moveTimeoutRef = useRef<number | null>(null);
  function handleMapMoveEnd(next: MapMoveEnd) {
    if (moveTimeoutRef.current != null) {
      window.clearTimeout(moveTimeoutRef.current);
    }
    moveTimeoutRef.current = window.setTimeout(() => {
      if (next.zoom < MIN_ZOOM_FOR_SEARCH) {
        setTooZoomedOut(true);
        return;
      }
      setTooZoomedOut(false);
      setMapCenter({ lat: next.lat, lon: next.lon });
    }, MAP_MOVE_DEBOUNCE_MS);
  }

  function handleSearchSelect(result: SearchResult) {
    setTooZoomedOut(false);
    setMapCenter({ lat: result.lat, lon: result.lon });
    setFlyToRequest({
      lat: result.lat,
      lon: result.lon,
      zoom: result.type === 'spot' ? SPOT_SEARCH_ZOOM : REGION_SEARCH_ZOOM,
      requestId: Date.now(),
    });
    setSelectedSlug(result.type === 'spot' ? result.key : null);
  }

  const now = useRecommendations(mapCenter.lat, mapCenter.lon, radius);
  const upcoming = useUpcomingRecommendations(
    mapCenter.lat,
    mapCenter.lon,
    radius,
    days,
    mode === 'upcoming',
  );

  const loading = mode === 'now' ? now.loading : upcoming.loading;
  const error = mode === 'now' ? now.error : upcoming.error;
  const recommendations = mode === 'now' ? now.data : upcoming.data;

  const selectedRecommendation = recommendations.find((r) => r.spot.slug === selectedSlug) ?? null;
  const selectedDailyBest =
    mode === 'upcoming' && selectedRecommendation && 'dailyBest' in selectedRecommendation
      ? selectedRecommendation.dailyBest
      : undefined;

  // Fetched on-demand only while a spot's detail view is open in "now" mode -
  // never on every map pan (see useRecommendations for the frequent path).
  const { summary: regionSummary } = useRegionSummary(
    selectedRecommendation?.spot.region ?? null,
    mode === 'now' && selectedRecommendation != null,
  );

  function selectMode(next: Mode) {
    setMode(next);
    setSelectedSlug(null);
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1>SurfForecast</h1>
        <div className="app__controls">
          <div className="mode-switch">
            <button
              className={`mode-switch__option ${mode === 'now' ? 'mode-switch__option--active' : ''}`}
              onClick={() => selectMode('now')}
            >
              Ahora
            </button>
            <select
              className={`mode-switch__option mode-switch__option--select ${
                mode === 'upcoming' ? 'mode-switch__option--active' : ''
              }`}
              value={days}
              onChange={(e) => {
                setDays(Number(e.target.value));
                selectMode('upcoming');
              }}
            >
              {DAYS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <select value={radius} onChange={(e) => setRadius(Number(e.target.value))}>
            {RADIUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <button onClick={requestLocation} disabled={status === 'locating'}>
            {status === 'locating' ? 'Localizando…' : '📍 Mi ubicación'}
          </button>
        </div>
        <div className="app__search-row">
          <SearchBox spots={allSpots} onSelect={handleSearchSelect} />
        </div>
        {status === 'denied' && (
          <p className="geo-error">
            No se pudo obtener tu ubicación: revisa los permisos de ubicación del navegador para
            este sitio e inténtalo de nuevo.
          </p>
        )}
        {status === 'unsupported' && (
          <p className="geo-error">Tu navegador no soporta geolocalización.</p>
        )}
      </header>

      <div className="app__map">
        <MapView
          recommendations={recommendations}
          userLocation={location}
          selectedSlug={selectedSlug}
          onSelect={setSelectedSlug}
          onMoveEnd={handleMapMoveEnd}
          flyToRequest={flyToRequest}
        />
      </div>

      <div className="app__sheet">
        {tooZoomedOut && !selectedRecommendation ? (
          <p className="empty-state">
            🔍 Demasiado alejado para buscar spots. Acércate (zoom +) o usa el buscador.
          </p>
        ) : (
          <>
            {loading && <p className="empty-state">Cargando spots…</p>}
            {error && (
              <p className="empty-state empty-state--error">No se pudo conectar con la API: {error}</p>
            )}
            {!loading && !error && selectedRecommendation && (
              <SpotDetail
                recommendation={selectedRecommendation}
                regionSummary={regionSummary}
                dailyBest={selectedDailyBest}
                onBack={() => setSelectedSlug(null)}
              />
            )}
            {!loading && !error && !selectedRecommendation && (
              <SpotList
                recommendations={recommendations}
                selectedSlug={selectedSlug}
                onSelect={setSelectedSlug}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
