import type { Conditions } from '../api/types';

export const CONDITIONS_COLOR: Record<Conditions | 'unknown', string> = {
  excellent: '#22c55e',
  good: '#84cc16',
  fair: '#eab308',
  poor: '#ef4444',
  unknown: '#64748b',
};

export const CONDITIONS_LABEL: Record<Conditions | 'unknown', string> = {
  excellent: 'Excelente',
  good: 'Buena',
  fair: 'Regular',
  poor: 'Mala',
  unknown: 'Sin datos',
};

export function conditionsKey(conditions: Conditions | null): Conditions | 'unknown' {
  return conditions ?? 'unknown';
}
