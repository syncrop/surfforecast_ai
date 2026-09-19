import { useState } from 'react';
import { MapView } from './components/MapView';
import { SpotList } from './components/SpotList';
import { SpotDetail } from './components/SpotDetail';
import { useGeolocation } from './hooks/useGeolocation';
import { useRecommendations } from './hooks/useRecommendations';
import { useUpcomingRecommendations } from './hooks/useUpcomingRecommendations';
import './App.css';

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
  const [radius, setRadius] = useState(20_000);
  const [mode, setMode] = useState<Mode>('now');
  const [days, setDays] = useState(3);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const now = useRecommendations(location.lat, location.lon, radius);
  const upcoming = useUpcomingRecommendations(
    location.lat,
    location.lon,
    radius,
    days,
    mode === 'upcoming',
  );

  const loading = mode === 'now' ? now.loading : upcoming.loading;
  const error = mode === 'now' ? now.error : upcoming.error;
  const recommendations = mode === 'now' ? now.data?.recommendations ?? [] : upcoming.data;
  const regionSummary = mode === 'now' ? now.data?.summary ?? null : null;

  const selectedRecommendation = recommendations.find((r) => r.spot.slug === selectedSlug) ?? null;
  const selectedDailyBest =
    mode === 'upcoming' && selectedRecommendation && 'dailyBest' in selectedRecommendation
      ? selectedRecommendation.dailyBest
      : undefined;

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
      </header>

      <div className="app__map">
        <MapView
          recommendations={recommendations}
          userLocation={location}
          selectedSlug={selectedSlug}
          onSelect={setSelectedSlug}
        />
      </div>

      <div className="app__sheet">
        {loading && <p className="empty-state">Cargando spots…</p>}
        {error && <p className="empty-state empty-state--error">No se pudo conectar con la API: {error}</p>}
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
      </div>
    </div>
  );
}
