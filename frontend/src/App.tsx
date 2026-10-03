import { useEffect, useRef, useState } from 'react';
import { MapView, type FlyToRequest, type MapMoveEnd } from './components/MapView';
import { FavoritesList } from './components/FavoritesList';
import { SearchBox } from './components/SearchBox';
import { SpotList } from './components/SpotList';
import { SpotDetail } from './components/SpotDetail';
import { useAllSpots } from './hooks/useAllSpots';
import { useFavorites } from './hooks/useFavorites';
import { useGeolocation, type GeoLocation } from './hooks/useGeolocation';
import { useRecommendations } from './hooks/useRecommendations';
import { useRegionSummary } from './hooks/useRegionSummary';
import { useSwellGrid } from './hooks/useSwellGrid';
import { useUpcomingRecommendations } from './hooks/useUpcomingRecommendations';
import type { MapBounds, SpotWithLocation } from './api/types';
import type { SearchResult } from './lib/search';
import './App.css';

/** Collapses rapid moveend events (a drag + inertia, a couple of scroll-zooms) into one fetch. */
const MAP_MOVE_DEBOUNCE_MS = 500;

/** Below this Leaflet zoom, the visible area is too wide for a 10-50km radius search to mean anything - stop fetching and ask the user to zoom in instead. */
const MIN_ZOOM_FOR_SEARCH = 8;

/** Zoom level to fly to when jumping to a single spot vs. a whole region from search. */
const SPOT_SEARCH_ZOOM = 13;
const REGION_SEARCH_ZOOM = 10;

/**
 * The detail view always shows a full 7-day outlook for whichever spot is
 * open, regardless of whether the map is in "Ahora" or "Próximos días"
 * mode (and regardless of that mode's own day-count selector) - so it's
 * fetched independently, tight-radius around just that spot (100m is the
 * backend's minimum radius) rather than reusing the map's area-wide query.
 */
const DETAIL_FORECAST_DAYS = 7;
const DETAIL_QUERY_RADIUS_METERS = 100;

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
type View = 'map' | 'favorites';

export default function App() {
  const { location, status, requestLocation } = useGeolocation();
  const allSpots = useAllSpots();
  const { favoriteSlugs, isFavorite, toggleFavorite } = useFavorites();
  const [radius, setRadius] = useState(20_000);
  const [mode, setMode] = useState<Mode>('now');
  const [view, setView] = useState<View>('map');
  const [days, setDays] = useState(3);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [tooZoomedOut, setTooZoomedOut] = useState(false);
  const [flyToRequest, setFlyToRequest] = useState<FlyToRequest | null>(null);
  const [swellLayerEnabled, setSwellLayerEnabled] = useState(false);
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);

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
      setMapBounds(next.bounds);
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

  function handleSelectFavorite(spot: SpotWithLocation) {
    setView('map');
    setTooZoomedOut(false);
    setMapCenter({ lat: spot.lat, lon: spot.lon });
    setFlyToRequest({ lat: spot.lat, lon: spot.lon, zoom: SPOT_SEARCH_ZOOM, requestId: Date.now() });
    setSelectedSlug(spot.slug);
  }

  const swellGrid = useSwellGrid(mapBounds, swellLayerEnabled);

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

  // The detail view is self-sufficient: given a selected slug, look up that
  // spot's coordinates (from the already-fetched full spot list) and fetch
  // its own 7-day outlook directly - independent of mode/days/radius/mapCenter,
  // so opening a spot always shows the same thing no matter how you got there.
  const selectedSpotInfo = allSpots.find((s) => s.slug === selectedSlug) ?? null;
  const selectedDetail = useUpcomingRecommendations(
    selectedSpotInfo?.lat ?? 0,
    selectedSpotInfo?.lon ?? 0,
    DETAIL_QUERY_RADIUS_METERS,
    DETAIL_FORECAST_DAYS,
    selectedSpotInfo != null,
  );
  const selectedRecommendation =
    selectedDetail.data.find((r) => r.spot.slug === selectedSlug) ?? null;

  // Fetched on-demand only while a spot's detail view is open - never on
  // every map pan (see useRecommendations for the frequent path).
  const { summary: regionSummary } = useRegionSummary(
    selectedRecommendation?.spot.region ?? null,
    selectedRecommendation != null,
  );

  function selectMode(next: Mode) {
    setMode(next);
    setSelectedSlug(null);
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__logo">
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path
              d="M2 17c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M2 12c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.5"
            />
          </svg>
          SurfForecast
        </h1>
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
          <button
            className={`mode-switch__option ${swellLayerEnabled ? 'mode-switch__option--active' : ''}`}
            onClick={() => setSwellLayerEnabled((v) => !v)}
            title="Mostrar dirección, altura y periodo del swell sobre el mapa"
          >
            🌊 Swell
          </button>
          <button
            className={`mode-switch__option ${view === 'favorites' ? 'mode-switch__option--active' : ''}`}
            onClick={() => setView((v) => (v === 'favorites' ? 'map' : 'favorites'))}
          >
            {view === 'favorites' ? '★' : '☆'} Favoritos{favoriteSlugs.length > 0 ? ` (${favoriteSlugs.length})` : ''}
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
          swellGrid={swellGrid}
        />
        <button
          className="locate-button"
          onClick={requestLocation}
          disabled={status === 'locating'}
          title="Mi ubicación"
          aria-label="Mi ubicación"
        >
          {status === 'locating' ? (
            '…'
          ) : (
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <circle cx="12" cy="12" r="3" fill="currentColor" />
              <path
                d="M12 2v3M12 19v3M2 12h3M19 12h3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          )}
        </button>
      </div>

      <div className="app__sheet">
        {view === 'favorites' ? (
          <FavoritesList
            allSpots={allSpots}
            favoriteSlugs={favoriteSlugs}
            onSelectSpot={handleSelectFavorite}
            onToggleFavorite={toggleFavorite}
          />
        ) : selectedSlug ? (
          // Always the spot's own 7-day fetch - independent of mode/zoom/list loading.
          <>
            {selectedDetail.loading && <p className="empty-state">Cargando spot…</p>}
            {selectedDetail.error && (
              <p className="empty-state empty-state--error">
                No se pudo conectar con la API: {selectedDetail.error}
              </p>
            )}
            {!selectedDetail.loading && !selectedDetail.error && selectedRecommendation && (
              <SpotDetail
                recommendation={selectedRecommendation}
                regionSummary={regionSummary}
                dailyBest={selectedRecommendation.dailyBest}
                onBack={() => setSelectedSlug(null)}
                isFavorite={isFavorite(selectedRecommendation.spot.slug)}
                onToggleFavorite={() => toggleFavorite(selectedRecommendation.spot.slug)}
              />
            )}
          </>
        ) : tooZoomedOut ? (
          <p className="empty-state">
            🔍 Demasiado alejado para buscar spots. Acércate (zoom +) o usa el buscador.
          </p>
        ) : (
          <>
            {loading && <p className="empty-state">Cargando spots…</p>}
            {error && (
              <p className="empty-state empty-state--error">No se pudo conectar con la API: {error}</p>
            )}
            {!loading && !error && (
              <SpotList
                recommendations={recommendations}
                selectedSlug={selectedSlug}
                onSelect={setSelectedSlug}
                isFavorite={isFavorite}
                onToggleFavorite={toggleFavorite}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
