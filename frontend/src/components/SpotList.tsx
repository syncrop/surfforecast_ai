import type { SpotRecommendation } from '../api/types';
import { CONDITIONS_COLOR, conditionsKey } from '../lib/conditions';
import { degreesToCompass } from '../lib/direction';
import { formatWindSpeed } from '../lib/units';

interface SpotListProps {
  recommendations: SpotRecommendation[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
  isFavorite: (slug: string) => boolean;
  onToggleFavorite: (slug: string) => void;
}

export function SpotList({
  recommendations,
  selectedSlug,
  onSelect,
  isFavorite,
  onToggleFavorite,
}: SpotListProps) {
  if (recommendations.length === 0) {
    return <p className="empty-state">No hay spots en este radio. Prueba a ampliarlo.</p>;
  }

  return (
    <ul className="spot-list">
      {recommendations.map((rec) => {
        const key = conditionsKey(rec.conditions);
        const color = CONDITIONS_COLOR[key];
        const { forecast } = rec;

        return (
          <li key={rec.spot.id}>
            <button
              className={`spot-row ${rec.spot.slug === selectedSlug ? 'spot-row--selected' : ''}`}
              onClick={() => onSelect(rec.spot.slug)}
            >
              <div className="spot-row__top">
                <span className="spot-row__name">🌊 {rec.spot.name}</span>
                <span className="spot-row__top-right">
                  {rec.score != null ? (
                    <span className="spot-row__score" style={{ color }}>
                      {rec.score}
                    </span>
                  ) : (
                    <span className="spot-row__conditions">Sin datos</span>
                  )}
                  <span
                    role="button"
                    tabIndex={0}
                    className={`favorite-star ${isFavorite(rec.spot.slug) ? 'favorite-star--active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(rec.spot.slug);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggleFavorite(rec.spot.slug);
                      }
                    }}
                    aria-label={isFavorite(rec.spot.slug) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                    title={isFavorite(rec.spot.slug) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                  >
                    {isFavorite(rec.spot.slug) ? '★' : '☆'}
                  </span>
                </span>
              </div>
              <span className="spot-row__meta">
                {rec.spot.region} · {(rec.distance / 1000).toFixed(1)} km
              </span>

              {forecast && (
                <div className="spot-row__lines">
                  <span className="spot-row__line">
                    🌊 {forecast.waveHeight}m @ {forecast.wavePeriod}s, {degreesToCompass(forecast.swellDirection)}
                  </span>
                  <span className="spot-row__line">
                    <span
                      className="spot-row__wind-arrow"
                      style={{ transform: `rotate(${forecast.windDirection + 180}deg)` }}
                    >
                      ➤
                    </span>
                    {formatWindSpeed(forecast.windSpeed)}, {degreesToCompass(forecast.windDirection)}
                  </span>
                  {forecast.tideHeight != null && (
                    <span className="spot-row__line spot-row__line--tide">↕ Marea {forecast.tideHeight}m</span>
                  )}
                </div>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
