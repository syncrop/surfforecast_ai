import { useEffect } from 'react';
import L from 'leaflet';
import { CircleMarker, MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import type { SpotRecommendation } from '../api/types';
import { CONDITIONS_COLOR, conditionsKey } from '../lib/conditions';
import type { GeoLocation } from '../hooks/useGeolocation';

/** Teardrop pin with the wave height written on it, colored by conditions - built as a divIcon since Leaflet has no built-in labeled-pin marker. */
function spotPinIcon(color: string, label: string | null, isSelected: boolean): L.DivIcon {
  const size = isSelected ? 42 : 34;
  return L.divIcon({
    className: 'map-pin-wrapper',
    html: `
      <div class="map-pin ${isSelected ? 'map-pin--selected' : ''}" style="--pin-color: ${color}">
        ${label ? `<span class="map-pin__value">${label}</span>` : ''}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

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
      {/* Esri's dark gray canvas: free, no API key. Base (muted background) + Reference (labels/roads on top, transparent elsewhere). */}
      <TileLayer
        attribution="&copy; Esri"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
      />
      <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}" />

      <CircleMarker
        center={center}
        radius={7}
        pathOptions={{ color: '#f8fafc', fillColor: '#38bdf8', fillOpacity: 1, weight: 2 }}
      />

      {recommendations.map((rec) => {
        const isSelected = rec.spot.slug === selectedSlug;
        const color = CONDITIONS_COLOR[conditionsKey(rec.conditions)];
        const label = rec.forecast ? `${rec.forecast.waveHeight.toFixed(1)}m` : null;
        return (
          <Marker
            key={rec.spot.id}
            position={[rec.spot.lat, rec.spot.lon]}
            icon={spotPinIcon(color, label, isSelected)}
            eventHandlers={{ click: () => onSelect(rec.spot.slug) }}
          />
        );
      })}
    </MapContainer>
  );
}
