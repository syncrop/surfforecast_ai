import type { SpotRecommendation } from '../api/types';
import { CONDITIONS_COLOR, CONDITIONS_LABEL, conditionsKey } from '../lib/conditions';

const FACTOR_LABEL: Record<string, string> = {
  swellDirection: 'Dirección del swell',
  waveHeight: 'Altura de ola',
  wind: 'Viento',
  period: 'Periodo',
};

interface SpotDetailProps {
  recommendation: SpotRecommendation;
  regionSummary: string | null;
  onBack: () => void;
}

export function SpotDetail({ recommendation, regionSummary, onBack }: SpotDetailProps) {
  const { spot, score, breakdown, conditions, forecast } = recommendation;
  const key = conditionsKey(conditions);

  return (
    <div className="spot-detail">
      <button className="back-button" onClick={onBack}>
        ← Volver a la lista
      </button>

      <header className="spot-detail__header">
        <h2>{spot.name}</h2>
        <span className="badge" style={{ backgroundColor: CONDITIONS_COLOR[key] }}>
          {score != null ? `${score} · ${CONDITIONS_LABEL[key]}` : 'Sin forecast todavía'}
        </span>
      </header>

      <p className="spot-detail__meta">
        {spot.region} · {spot.breakType.replace('_', ' ')} · fondo {spot.bottom} · nivel{' '}
        {spot.skillLevel}
      </p>

      {breakdown && (
        <section>
          <h3>Desglose</h3>
          {Object.entries(breakdown).map(([factor, value]) => (
            <div className="factor-bar" key={factor}>
              <span className="factor-bar__label">{FACTOR_LABEL[factor] ?? factor}</span>
              <div className="factor-bar__track">
                <div className="factor-bar__fill" style={{ width: `${value}%` }} />
              </div>
              <span className="factor-bar__value">{Math.round(value)}</span>
            </div>
          ))}
        </section>
      )}

      {forecast && (
        <section>
          <h3>Condiciones actuales</h3>
          <dl className="forecast-grid">
            <dt>Ola</dt>
            <dd>{forecast.waveHeight} m</dd>
            <dt>Periodo</dt>
            <dd>{forecast.wavePeriod} s</dd>
            <dt>Swell</dt>
            <dd>{forecast.swellDirection}°</dd>
            <dt>Viento</dt>
            <dd>
              {forecast.windSpeed} km/h · {forecast.windDirection}°
            </dd>
          </dl>
          <p className="forecast-time">
            Forecast de {new Date(forecast.forecastTime).toLocaleString('es-ES')}
          </p>
        </section>
      )}

      <section>
        <h3>Resumen de la zona</h3>
        <p className="summary-text">
          {regionSummary ?? 'Aún no hay resumen generado para esta zona.'}
        </p>
      </section>

      {spot.sourceUrl && (
        <a className="source-link" href={spot.sourceUrl} target="_blank" rel="noreferrer">
          Más info del spot →
        </a>
      )}
    </div>
  );
}
