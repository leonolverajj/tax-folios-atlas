import { SCALES, type Period, type Scale } from './schema';

const WORDS: [number, string][] = [
  [1e12, 'trillion'],
  [1e9, 'billion'],
  [1e6, 'million'],
];

/** "BRL 2.65 trillion" — always with the ISO code so currencies are never ambiguous. */
export function formatMoney(amount: number, scale: Scale, currency: string): string {
  const base = amount * SCALES[scale];
  for (const [size, word] of WORDS) {
    if (Math.abs(base) >= size) {
      const v = base / size;
      const digits = v >= 100 ? 0 : v >= 10 ? 1 : 2;
      return `${currency} ${v.toLocaleString('en', { maximumFractionDigits: digits, minimumFractionDigits: digits })} ${word}`;
    }
  }
  return `${currency} ${base.toLocaleString('en', { maximumFractionDigits: 0 })}`;
}

/** Number exactly as published, in the original unit. */
export function formatPublished(amount: number, scale: Scale, currency: string): string {
  const n = amount.toLocaleString('en', { maximumFractionDigits: 3 });
  return scale === 'units' ? `${n} ${currency}` : `${n} ${scale} ${currency}`;
}

export function formatShare(share: number): string {
  const pct = share * 100;
  if (pct >= 10) return `${pct.toFixed(1)}%`;
  if (pct >= 1) return `${pct.toFixed(2)}%`;
  return `${pct.toFixed(2)}%`;
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function formatPeriod(p: Period): string {
  const kind = { 'fiscal-year': 'fiscal year', 'calendar-year': 'calendar year', estimate: 'estimate', forecast: 'forecast' }[p.kind];
  return `${p.label} (${kind}: ${formatDate(p.start)} – ${formatDate(p.end)})`;
}

export const CATEGORY_LABEL: Record<string, string> = {
  tax: 'Tax',
  'social-contribution': 'Social contribution',
  'insurance-premium': 'Insurance premium',
  royalty: 'Royalty',
  'customs-duty': 'Customs duty',
  fee: 'Fee / charge',
  'special-levy': 'Earmarked levy',
};

export const CATEGORY_HELP: Record<string, string> = {
  tax: 'A compulsory payment to government with no specific service in return.',
  'social-contribution': 'A compulsory payment that funds or entitles the payer to social-insurance benefits (pensions, health, unemployment).',
  'insurance-premium': 'A premium paid into a public insurance scheme that pays defined benefits.',
  royalty: 'A payment for extracting publicly owned natural resources.',
  'customs-duty': 'A charge on goods when they cross the border.',
  fee: 'A charge for a specific government service, licence or registration.',
  'special-levy': 'A charge whose proceeds are earmarked for a defined purpose.',
};

export const STATUS_LABEL: Record<string, string> = {
  current: 'In force',
  transitional: 'Transitional regime',
  scheduled: 'Scheduled change',
  historical: 'Repealed / historical',
};

export const BRANCH_LABEL: Record<string, string> = {
  country: 'Country',
  national: 'National level',
  regional: 'Regional level',
  local: 'Local level',
};
