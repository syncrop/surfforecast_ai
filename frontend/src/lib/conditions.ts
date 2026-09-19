import type { Conditions } from '../api/types';

export const CONDITIONS_COLOR: Record<Conditions | 'unknown', string> = {
  excellent: '#16a34a',
  good: '#65a30d',
  fair: '#eab308',
  poor: '#dc2626',
  unknown: '#94a3b8',
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
