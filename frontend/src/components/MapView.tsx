import { useEffect } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import type { SpotRecommendation } from '../api/types';
import { CONDITIONS_COLOR, conditionsKey } from '../lib/conditions';
import type { GeoLocation } from '../hooks/useGeolocation';

interface RecenterProps {
  center: [number, number];
}

function Recenter({ center }: RecenterProps) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1]]);
  return null;
}

interface MapViewProps {
  recommendations: SpotRecommendation[];
  userLocation: GeoLocation;
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
}

export function MapView({ recommendations, userLocation, selectedSlug, onSelect }: MapViewProps) {
  const center: [number, number] = [userLocation.lat, userLocation.lon];

  return (
    <MapContainer center={center} zoom={11} scrollWheelZoom className="map">
      <Recenter center={center} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <CircleMarker
        center={center}
        radius={7}
        pathOptions={{ color: '#2563eb', fillColor: '#2563eb', fillOpacity: 1, weight: 2 }}
      />

      {recommendations.map((rec) => {
        const isSelected = rec.spot.slug === selectedSlug;
        const color = CONDITIONS_COLOR[conditionsKey(rec.conditions)];
        return (
          <CircleMarker
            key={rec.spot.id}
            center={[rec.spot.lat, rec.spot.lon]}
            radius={isSelected ? 12 : 9}
            pathOptions={{
              color: isSelected ? '#0f172a' : '#ffffff',
              weight: isSelected ? 3 : 2,
              fillColor: color,
              fillOpacity: 0.9,
            }}
            eventHandlers={{ click: () => onSelect(rec.spot.slug) }}
          >
            <Popup>
              <strong>{rec.spot.name}</strong>
              <br />
              {rec.score != null ? `Score: ${rec.score}` : 'Sin forecast todavía'}
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
