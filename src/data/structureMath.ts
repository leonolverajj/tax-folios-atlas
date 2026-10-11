/**
 * Arithmetic on the harmonised layer (structure.json): the tax mix and the split by
 * level of government. Pure functions, shared by the app, the tests and the validation.
 */
import type { OecdHeading, Structure } from './schema';

export const HEADINGS: OecdHeading[] = ['income', 'socialSecurity', 'goodsServices', 'property', 'payroll', 'other'];

/** Share of total tax revenue by OECD heading (sums to 1). Sums the tax types over every sub-sector, or uses the country total when levels carry no split. */
export function mixOf(st: Structure): Record<OecdHeading, number> {
  const out: Record<OecdHeading, number> = { income: 0, socialSecurity: 0, payroll: 0, property: 0, goodsServices: 0, other: 0 };
  const parts = st.levels.every((l) => l.byType) ? st.levels.map((l) => l.byType!) : st.totalByType ? [st.totalByType] : [];
  for (const p of parts) for (const h of HEADINGS) out[h] += p[h];
  const total = HEADINGS.reduce((s, h) => s + out[h], 0);
  if (total <= 0) throw new Error('structure has no tax-type data');
  for (const h of HEADINGS) out[h] /= total;
  return out;
}

export interface LevelShare {
  key: 'central' | 'regional' | 'local' | 'social-security';
  label: string;
  share: number;
}

/** Share of total tax revenue by sub-sector of government (sums to 1), from amounts or from published shares. */
export function levelShares(st: Structure): LevelShare[] {
  const raw = st.levels.map((l) => (l.total !== undefined ? l.total : (l.share ?? 0)));
  const whole = raw.reduce((a, b) => a + b, 0);
  return st.levels.map((l, i) => ({ key: l.key, label: l.label, share: raw[i] / whole }));
}
