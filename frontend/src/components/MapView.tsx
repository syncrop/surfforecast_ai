import { useEffect } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
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

export interface MapMoveEnd extends GeoLocation {
  zoom: number;
}

interface MoveListenerProps {
  onMoveEnd: (center: MapMoveEnd) => void;
}

/** Reports the map's center + zoom once the user finishes panning/zooming, so the parent can fetch spots for that area (or decide it's too zoomed out to bother). */
function MoveListener({ onMoveEnd }: MoveListenerProps) {
  const map = useMapEvents({
    moveend: () => {
      const center = map.getCenter();
      onMoveEnd({ lat: center.lat, lon: center.lng, zoom: map.getZoom() });
    },
  });
  return null;
}

export interface FlyToRequest {
  lat: number;
  lon: number;
  zoom: number;
  /** Bumped on every request so identical coordinates (e.g. searching the same spot twice) still re-trigger the flight. */
  requestId: number;
}

/** Imperative "jump to this location" trigger, distinct from Recenter (physical location) and panning (passive, no forced movement). */
function FlyTo({ request }: { request: FlyToRequest | null }) {
  const map = useMap();
  useEffect(() => {
    if (!request) return;
    map.flyTo([request.lat, request.lon], request.zoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?.requestId]);
  return null;
}

interface MapViewProps {
  recommendations: SpotRecommendation[];
  userLocation: GeoLocation;
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  onMoveEnd: (center: MapMoveEnd) => void;
  flyToRequest: FlyToRequest | null;
}

export function MapView({
  recommendations,
  userLocation,
  selectedSlug,
  onSelect,
  onMoveEnd,
  flyToRequest,
}: MapViewProps) {
  const center: [number, number] = [userLocation.lat, userLocation.lon];

  return (
    <MapContainer center={center} zoom={11} scrollWheelZoom className="map">
      <Recenter center={center} />
      <MoveListener onMoveEnd={onMoveEnd} />
      <FlyTo request={flyToRequest} />
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
