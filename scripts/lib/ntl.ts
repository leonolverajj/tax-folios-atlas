/**
 * Reader for the extracted National Tax List (NTL) of one country (see scripts/extract-ntl.cjs and
 * scripts/build/data/ntl-<CC>.json). Lets a build script point at a tax by its NTL key
 * ("D211:C01" = ESA code + the country's own sequence) and get the amount, the locator and a
 * written-out calculation without retyping any figure.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface NtlLine {
  key: string;
  code: string;
  sub: string;
  nat: string;
  en: string;
  fn: string;
  at: string;
  v2024: number | string | null;
  v2023: number | string | null;
  row: number;
}
interface NtlFile {
  country: string;
  totals: Record<string, { name: string; v2024: number | string | null; v2023: number | string | null; row?: number }>;
  lines: NtlLine[];
}

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'build', 'data');

const fmt = (n: number) => n.toLocaleString('en-GB', { maximumFractionDigits: 2 });

export function loadNtl(cc: string, currency: string) {
  const file = JSON.parse(fs.readFileSync(path.join(DIR, `ntl-${cc}.json`), 'utf8')) as NtlFile;
  const byKey = new Map(file.lines.map((l) => [l.key, l]));
  // Subtotal rows can be used as lines when a country gives no detail below them: key "T:D613".
  for (const [code, tot] of Object.entries(file.totals)) byKey.set(`T:${code}`, { key: `T:${code}`, code, sub: '_T', nat: '', en: tot.name, fn: '', at: '', v2024: tot.v2024, v2023: tot.v2023, row: tot.row ?? 0 });
  const used = new Set<string>();
  const value = (k: string) => {
    const l = byKey.get(k);
    if (!l) throw new Error(`${cc}: NTL has no line ${k}`);
    // "M" (does not exist) and a blank cell mean nothing was collected in 2024; "L" (exists, not available) is an error.
    if (l.v2024 === 'L') throw new Error(`${cc}: NTL line ${k} is not available for 2024 (L)`);
    return typeof l.v2024 === 'number' ? l.v2024 : 0;
  };
  const round = (n: number) => Math.round(n * 100) / 100;
  /** Sum of NTL lines for 2024; records the lines as used. */
  const sum = (keys: string[]) => {
    keys.forEach((k) => used.add(k));
    return round(keys.reduce((a, k) => a + value(k), 0));
  };
  /** A revenue row for an instrument: amount, locator and calculation. */
  const rev = (group: string, keys: string[], extra: { caveat?: string; coverage?: 'exact' | 'broader' | 'subset'; coverageNote?: string } = {}) => {
    const amount = sum(keys);
    const names = keys.map((k) => byKey.get(k)!);
    const long = keys.length > 8;
    const locator = long
      ? `NTL 2026, sheet ${cc}, 2024: ${keys.length} lines of the list: ${keys.join(', ')}`
      : keys.length === 1
        ? `NTL 2026, sheet ${cc}, row ${names[0].row}: ${names[0].code} ${names[0].en || names[0].nat}, 2024`
        : `NTL 2026, sheet ${cc}, 2024: ${names.map((l) => `${l.code} ${l.en || l.nat} (row ${l.row})`).join('; ')}`;
    const calculation = long
      ? `Sum of ${keys.length} lines of the list, named in the locator (${currency} million)`
      : keys.length === 1
        ? undefined
        : `${keys.map((k) => fmt(value(k))).join(' + ').replace(/\+ -/g, '− ')} = ${fmt(amount)} (${currency} million)`;
    return { group, amount, locator, ...(calculation ? { calculation } : {}), ...extra };
  };
  /** Lines nobody claimed yet, for the "everything else" check. */
  const unused = () => file.lines.filter((l) => !used.has(l.key) && typeof l.v2024 === 'number' && l.v2024 !== 0);
  const total = (c: string) => (typeof file.totals[c]?.v2024 === 'number' ? (file.totals[c].v2024 as number) : 0);
  /**
   * Checks that the lines drawn plus the lines deliberately left out add up to the list's own totals for
   * taxes on production and imports (D2), taxes on income and wealth (D5), capital taxes (D91) and
   * net social contributions (D61). Throws if they differ by more than rounding. `adjust` is a signed amount that the
   * list subtracts or adds without giving it a line of its own (for example the service charges of social insurance).
   */
  const reconcile = (drawn: number, excludedKeys: string[], adjust = 0) => {
    const excluded = excludedKeys.reduce((a, k) => a + (byKey.has(k) && typeof byKey.get(k)!.v2024 === 'number' ? (byKey.get(k)!.v2024 as number) : 0), 0);
    const listTotal = ['D2', 'D5', 'D91', 'D61'].reduce((a, c) => a + total(c), 0);
    const gap = round(listTotal - drawn - excluded - adjust);
    console.log(`reconcile ${cc}: list total ${fmt(listTotal)} = drawn ${fmt(drawn)} + left out ${fmt(round(excluded))} + gap ${gap}`);
    if (Math.abs(gap) > 0.005 * file.lines.length + 0.02) throw new Error(`${cc}: the lines do not add up to the list's totals (gap ${gap})`);
    return { listTotal, excluded: round(excluded) };
  };
  return { file, byKey, value, sum, rev, unused, round, fmt, total, reconcile };
}

export type Ntl = ReturnType<typeof loadNtl>;

/** Eurostat gov_10a_taxag (2024, national currency, million) by sector and ESA item, saved by scripts/extract-eurostat.cjs. */
export function loadSectors(cc: string): Record<string, number> {
  const all = JSON.parse(fs.readFileSync(path.join(DIR, 'eurostat-taxag-2024.json'), 'utf8')) as Record<string, Record<string, number>>;
  const m = all[cc];
  if (!m) throw new Error(`no Eurostat sector data for ${cc}`);
  return m;
}

