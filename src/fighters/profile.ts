/**
 * Country profile: the fighter's stats. Every stat is a MEASURED value taken from the harmonised
 * structure layer (OECD Revenue Statistics, one reference year for every country) and shown on
 * a printed scale. Nothing is scored by opinion. A stat that cannot be measured comparably for a
 * country is `null` and is displayed as "n/a" with the reason, never estimated.
 */
import type { CountryMeta, OecdHeading, ProfileFile, Structure } from '../data/schema';

/** Who a fighter is: enough to name, colour and describe it, whether or not it has a folio. */
export interface Identity {
  id: string;
  name: string;
  native: string;
  accent: string;
  accent2: string;
  flag?: string[];
  researchStatus: CountryMeta['researchStatus'] | 'profile';
  /** The country has a regional tier of government (used to explain a missing regional column). */
  hasRegionalLevel: boolean;
  hasFolio: boolean;
}

export const identityOfMeta = (meta: CountryMeta): Identity => ({
  id: meta.id,
  name: meta.names.en,
  native: meta.names.native,
  accent: meta.theme.accent,
  accent2: meta.theme.accent2,
  researchStatus: meta.researchStatus,
  hasRegionalLevel: meta.levels.some((l) => l.branch === 'regional'),
  hasFolio: true,
});

export const identityOfProfile = (p: ProfileFile): Identity => ({
  id: p.id,
  name: p.names.en,
  native: p.names.native,
  accent: p.accent,
  accent2: p.accent,
  flag: p.flag,
  researchStatus: 'profile',
  hasRegionalLevel: p.structure.levels.some((l) => l.key === 'regional'),
  hasFolio: false,
});

export const HEADINGS: OecdHeading[] = ['income', 'socialSecurity', 'goodsServices', 'property', 'payroll', 'other'];

export interface Stat {
  key: string;
  label: string;
  /** Raw measured number (percent, or 0-100 index); null when not comparable. */
  value: number | null;
  /** Bar fill 0..1 on the printed scale; null when value is null. */
  bar: number | null;
  /** Upper end of the printed scale, in the same unit as `value`. */
  scaleMax: number;
  unit: string;
  display: string;
  how: string;
  caveat?: string;
}

export interface Profile {
  id: string;
  name: string;
  native: string;
  accent: string;
  accent2: string;
  year: number;
  currency: string;
  /** Share of total tax revenue by OECD heading (sums to 1). */
  mix: Record<OecdHeading, number>;
  /** Share of total tax revenue by collecting sub-sector (sums to 1). */
  levels: { key: 'central' | 'regional' | 'local' | 'social-security'; label: string; share: number }[];
  dominant: OecdHeading;
  archetype: string;
  structureClass: 'Decentralised' | 'Mixed' | 'Centralised';
  stats: Stat[];
  notes: string[];
  sourceIds: string[];
  researchStatus: CountryMeta['researchStatus'] | 'profile';
  hasFolio: boolean;
  flag?: string[];
}

const ARCHETYPE: Record<OecdHeading, string> = {
  income: 'Income Striker',
  goodsServices: 'Consumption Guard',
  socialSecurity: 'Social Bulwark',
  property: 'Property Warden',
  payroll: 'Wildcard',
  other: 'Wildcard',
};

const pct = (v: number, d = 1) => `${v.toFixed(d)}%`;

/** Sum of the tax types over every sub-sector (or the country total when levels carry no split). */
export function mixOf(st: Structure): Record<OecdHeading, number> {
  const out: Record<OecdHeading, number> = { income: 0, socialSecurity: 0, payroll: 0, property: 0, goodsServices: 0, other: 0 };
  const parts = st.levels.every((l) => l.byType) ? st.levels.map((l) => l.byType!) : st.totalByType ? [st.totalByType] : [];
  for (const p of parts) for (const h of HEADINGS) out[h] += p[h];
  const total = HEADINGS.reduce((s, h) => s + out[h], 0);
  if (total <= 0) throw new Error('structure has no tax-type data');
  for (const h of HEADINGS) out[h] /= total;
  return out;
}

export function levelShares(st: Structure): Profile['levels'] {
  const raw = st.levels.map((l) => (l.total !== undefined ? l.total : (l.share ?? 0)));
  const whole = raw.reduce((a, b) => a + b, 0);
  return st.levels.map((l, i) => ({ key: l.key, label: l.label, share: raw[i] / whole }));
}

/** 0-100: 100 = tax revenue spread evenly over the six headings, 0 = everything under one heading. */
export function balanceIndex(mix: Record<OecdHeading, number>): number {
  // a slightly negative heading (net adjustments in the source) counts as zero
  const hhi = HEADINGS.reduce((s, h) => s + Math.max(0, mix[h]) ** 2, 0);
  return ((1 - hhi) / (1 - 1 / HEADINGS.length)) * 100;
}

export function buildProfile(input: CountryMeta | Identity, st: Structure): Profile {
  const meta: Identity = 'names' in input ? identityOfMeta(input) : input;
  const mix = mixOf(st);
  const levels = levelShares(st);
  const share = (k: string) => levels.find((l) => l.key === k)?.share ?? 0;
  const sub = (share('regional') + share('local')) * 100;
  const dominantEntries: [OecdHeading, number][] = [
    ['income', mix.income],
    ['goodsServices', mix.goodsServices],
    ['socialSecurity', mix.socialSecurity],
    ['property', mix.property],
    ['other', mix.payroll + mix.other],
  ];
  const dominant = dominantEntries.sort((a, b) => b[1] - a[1])[0][0];
  const structureClass: Profile['structureClass'] = sub >= 25 ? 'Decentralised' : sub >= 10 ? 'Mixed' : 'Centralised';
  const grants = st.subnational?.grantsShareOfRevenue ?? null;
  const own = grants === null ? null : 100 - grants;
  const bal = balanceIndex(mix);
  const mixStat = (key: string, label: string, h: number, max: number, how: string): Stat => ({
    key,
    label,
    value: h * 100,
    bar: Math.max(0, Math.min(1, (h * 100) / max)),
    scaleMax: max,
    unit: '% of tax revenue',
    display: pct(h * 100),
    how,
  });
  const notes = [...st.notes];
  if (levels.some((l) => l.key === 'regional') === false && meta.hasRegionalLevel) {
    notes.push('The source gives no separate regional sub-sector: regional taxes are counted inside the central figure or the local figure.');
  }
  const stats: Stat[] = [
    {
      key: 'take',
      label: 'Tax take',
      value: st.taxToGdp,
      bar: st.taxToGdp === null ? null : Math.min(1, st.taxToGdp / 50),
      scaleMax: 50,
      unit: '% of GDP',
      display: st.taxToGdp === null ? 'n/a' : pct(st.taxToGdp),
      how: `Total tax revenue including compulsory social contributions, as % of GDP, ${st.referenceYear} (OECD definition). Bar scale 0–50% of GDP.`,
    },
    mixStat('income', 'Income taxes', mix.income, 60, 'Taxes on income, profits and capital gains (OECD heading 1000) as % of total tax revenue. Bar scale 0–60%.'),
    mixStat('consumption', 'Consumption taxes', mix.goodsServices, 60, 'Taxes on goods and services (heading 5000: VAT, sales taxes, excises, customs) as % of total tax revenue. Bar scale 0–60%.'),
    mixStat('social', 'Social contributions', mix.socialSecurity, 45, 'Social security contributions (heading 2000) as % of total tax revenue. Bar scale 0–45%.'),
    mixStat('property', 'Property taxes', mix.property, 20, 'Taxes on property (heading 4000, including financial and capital transactions) as % of total tax revenue. Bar scale 0–20%.'),
    mixStat('other', 'Payroll and other', mix.payroll + mix.other, 20, 'Taxes on payroll and workforce (3000) plus other taxes (6000) as % of total tax revenue. Bar scale 0–20%.'),
    {
      key: 'balance',
      label: 'Balance',
      value: bal,
      bar: bal / 100,
      scaleMax: 100,
      unit: 'index 0–100',
      display: bal.toFixed(0),
      how: 'Diversification of the tax mix: (1 − Σ shares²) ÷ (1 − 1/6) × 100 over the six OECD headings. 100 = tax revenue spread evenly, 0 = a single heading raises everything.',
      caveat: st.notes.some((n) => /payroll/i.test(n)) ? 'Payroll taxes are folded into "other" in this country\'s source, so the index is slightly understated.' : undefined,
    },
    {
      key: 'local',
      label: 'Local power',
      value: sub,
      bar: Math.min(1, sub / 50),
      scaleMax: 50,
      unit: '% of tax revenue',
      display: pct(sub),
      how: 'Share of all tax revenue that regional and local governments collect themselves (collecting-government basis, OECD). Revenue shared from the centre does not count. Bar scale 0–50%.',
      caveat: st.basis.toLowerCase().includes('shared') ? 'Federal taxes shared with states stay with the federation on this basis.' : undefined,
    },
    {
      key: 'own',
      label: 'Own resources',
      value: own,
      bar: own === null ? null : own / 100,
      scaleMax: 100,
      unit: '% of subnational revenue',
      display: own === null ? 'n/a' : pct(own, 0),
      how: `Share of regional and local governments' total revenue that is NOT grants or subsidies from other levels of government (${st.subnational?.year ?? '–'}, OECD/UCLG observatory). Higher = less dependent on central transfers.`,
      caveat: own === null ? st.subnational?.note : st.subnational?.note,
    },
  ];
  return {
    id: meta.id,
    name: meta.name,
    native: meta.native,
    accent: meta.accent,
    accent2: meta.accent2,
    flag: meta.flag,
    hasFolio: meta.hasFolio,
    year: st.referenceYear,
    currency: st.currency,
    mix,
    levels,
    dominant,
    archetype: ARCHETYPE[dominant],
    structureClass,
    stats,
    notes,
    sourceIds: [...st.sourceIds, ...(st.subnational?.sourceId ? [st.subnational.sourceId] : [])],
    researchStatus: meta.researchStatus,
  };
}
