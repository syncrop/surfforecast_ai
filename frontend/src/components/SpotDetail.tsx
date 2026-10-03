import { useState } from 'react';
import type { DayScore, SpotRecommendation } from '../api/types';
import { CONDITIONS_COLOR, CONDITIONS_LABEL, conditionsKey } from '../lib/conditions';
import { formatDirection } from '../lib/direction';
import { formatWindSpeed } from '../lib/units';

const FACTOR_LABEL: Record<string, string> = {
  swellDirection: 'Dirección del swell',
  waveHeight: 'Altura de ola',
  wind: 'Viento',
  period: 'Periodo',
};

const WEEKDAY_FORMAT = new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric' });
const WEEKDAY_FORMAT_LONG = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

interface SpotDetailProps {
  recommendation: SpotRecommendation;
  regionSummary: string | null;
  onBack: () => void;
  /** Best score/forecast reached each day over the next 7 days - always fetched for whichever spot is open, regardless of the map's Ahora/Próximos días mode. */
  dailyBest: DayScore[];
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function SpotDetail({
  recommendation,
  regionSummary,
  onBack,
  dailyBest,
  isFavorite,
  onToggleFavorite,
}: SpotDetailProps) {
  const { spot } = recommendation;
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Clicking a day in "Por día" drills into that day's own forecast/breakdown;
  // by default (no click yet) the section shows the best moment overall.
  const activeDay = dailyBest.find((d) => d.date === selectedDate) ?? null;
  const score = activeDay?.score ?? recommendation.score;
  const breakdown = activeDay?.breakdown ?? recommendation.breakdown;
  const conditions = activeDay?.conditions ?? recommendation.conditions;
  const forecast = activeDay?.forecast ?? recommendation.forecast;
  const key = conditionsKey(conditions);

  return (
    <div className="spot-detail">
      <button className="back-button" onClick={onBack}>
        ← Volver a la lista
      </button>

      <header className="spot-detail__header">
        <h2>{spot.name}</h2>
        <span className="spot-detail__header-right">
          <span className="badge" style={{ backgroundColor: CONDITIONS_COLOR[key] }}>
            {score != null ? `${score} · ${CONDITIONS_LABEL[key]}` : 'Sin forecast todavía'}
          </span>
          <button
            type="button"
            className={`favorite-star ${isFavorite ? 'favorite-star--active' : ''}`}
            onClick={onToggleFavorite}
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
            title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
          >
            {isFavorite ? '★' : '☆'}
          </button>
        </span>
      </header>

      <p className="spot-detail__meta">
        {spot.region} · {spot.breakType.replace('_', ' ')} · fondo {spot.bottom} · nivel{' '}
        {spot.skillLevel}
      </p>

      {dailyBest.length > 0 && (
        <section>
          <h3>Por día</h3>
          <ul className="daily-best">
            {dailyBest.map((day) => {
              const dayKey = conditionsKey(day.conditions);
              const isSelected = day.date === selectedDate;
              return (
                <li key={day.date}>
                  <button
                    type="button"
                    className={`daily-best__item ${isSelected ? 'daily-best__item--selected' : ''}`}
                    onClick={() => setSelectedDate(isSelected ? null : day.date)}
                  >
                    <span className="daily-best__date">
                      {WEEKDAY_FORMAT.format(new Date(`${day.date}T12:00:00Z`))}
                    </span>
                    <span
                      className="daily-best__dot"
                      style={{ backgroundColor: CONDITIONS_COLOR[dayKey] }}
                    />
                    <span className="daily-best__score">{day.score}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

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
          <h3>
            {activeDay
              ? WEEKDAY_FORMAT_LONG.format(new Date(`${activeDay.date}T12:00:00Z`))
              : 'Mejor momento'}
          </h3>
          <dl className="forecast-grid">
            <dt>Ola</dt>
            <dd>{forecast.waveHeight} m</dd>
            <dt>Periodo</dt>
            <dd>{forecast.wavePeriod} s</dd>
            <dt>Swell</dt>
            <dd>{formatDirection(forecast.swellDirection)}</dd>
            <dt>Viento</dt>
            <dd>
              {formatWindSpeed(forecast.windSpeed)} · {formatDirection(forecast.windDirection)}
            </dd>
            <dt>Marea</dt>
            <dd>{forecast.tideHeight != null ? `${forecast.tideHeight} m` : 'No disponible'}</dd>
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
    </div>
  );
}
