import { useState } from 'react';
import { MapView } from './components/MapView';
import { SpotList } from './components/SpotList';
import { SpotDetail } from './components/SpotDetail';
import { useGeolocation } from './hooks/useGeolocation';
import { useRecommendations } from './hooks/useRecommendations';
import './App.css';

const RADIUS_OPTIONS = [
  { label: '10 km', value: 10_000 },
  { label: '20 km', value: 20_000 },
  { label: '50 km', value: 50_000 },
];

export default function App() {
  const { location, status, requestLocation } = useGeolocation();
  const [radius, setRadius] = useState(20_000);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const { data, loading, error } = useRecommendations(location.lat, location.lon, radius);

  const recommendations = data?.recommendations ?? [];
  const selectedRecommendation = recommendations.find((r) => r.spot.slug === selectedSlug) ?? null;

  return (
    <div className="app">
      <header className="app__header">
        <h1>SurfForecast</h1>
        <div className="app__controls">
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
            regionSummary={data?.summary ?? null}
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
