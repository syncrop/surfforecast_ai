import type { SpotRecommendation } from '../api/types';
import { CONDITIONS_COLOR, CONDITIONS_LABEL, conditionsKey } from '../lib/conditions';

interface SpotListProps {
  recommendations: SpotRecommendation[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
}

export function SpotList({ recommendations, selectedSlug, onSelect }: SpotListProps) {
  if (recommendations.length === 0) {
    return <p className="empty-state">No hay spots en este radio. Prueba a ampliarlo.</p>;
  }

  return (
    <ul className="spot-list">
      {recommendations.map((rec) => {
        const key = conditionsKey(rec.conditions);
        return (
          <li key={rec.spot.id}>
            <button
              className={`spot-row ${rec.spot.slug === selectedSlug ? 'spot-row--selected' : ''}`}
              onClick={() => onSelect(rec.spot.slug)}
            >
              <span className="spot-row__dot" style={{ backgroundColor: CONDITIONS_COLOR[key] }} />
              <span className="spot-row__info">
                <span className="spot-row__name">{rec.spot.name}</span>
                <span className="spot-row__meta">
                  {rec.spot.region} · {(rec.distance / 1000).toFixed(1)} km
                </span>
              </span>
              <span className="spot-row__score">
                {rec.score != null ? (
                  <>
                    <strong>{rec.score}</strong>
                    <span className="spot-row__conditions">{CONDITIONS_LABEL[key]}</span>
                  </>
                ) : (
                  <span className="spot-row__conditions">Sin datos</span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
