/**
 * Reader and selector for the IMF's Government Finance Statistics (Statement of Operations), as extracted by
 * scripts/extract-gfs.cjs into scripts/build/data/gfs-<CC>.json. Used by scripts/build/gfs-countries.ts to turn the
 * IMF's revenue lines into a folio at the grain of the GFS classification.
 *
 * What it guarantees: every leaf amount is a reported value (or a stated residual) of one line of the classification;
 * the leaves of a level add up exactly to that level's taxes (GFS 11) plus actual social contributions (GFS 12,
 * imputed contributions excluded); and the year and sectors are chosen by explicit rules (see `pickScope`).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export interface Obs {
  v: number;
  nature: string;
  basis: string;
}
export type Sectors = Record<string, Record<string, Record<string, Obs>>>;
export interface GfsFile {
  source: string;
  country: string;
  sectors: Sectors;
}

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'build', 'data');
export const loadGfsFile = (cc: string): GfsFile => JSON.parse(fs.readFileSync(path.join(DIR, `gfs-${cc}.json`), 'utf8')) as GfsFile;

/** Data flags the folio accepts: A = actual, P = preliminary. Estimates and "not available" flags are never used. */
const OK_NATURE = new Set(['A', 'P']);
export const FIRST_YEAR = 2017;

/** The classification tree below taxes and social contributions (GFSM 2014 codes, IMF series suffix _T). */
export const TREE: Record<string, string[]> = {
  G11_T: ['G111_T', 'G112_T', 'G113_T', 'G114_T', 'G115_T', 'G116_T'],
  G111_T: ['G1111_T', 'G1112_T', 'G1113_T'],
  G113_T: ['G1131_T', 'G1132_T', 'G1133_T', 'G1135_T'],
  G114_T: ['G1141_T', 'G1142_T', 'G1143_T', 'G1144_T', 'G1145_T', 'G1146_T'],
  G1141_T: ['G11411_T', 'G11412_T', 'G11413_T', 'G11414_T'],
  G1145_T: ['G11451_T', 'G11452_T'],
  G115_T: ['G1151_T', 'G1152_T', 'G1153_T', 'G1154_T', 'G1155_T', 'G1156_T'],
  G12_T: ['G121_T', 'G122_T'],
  G121_T: ['G1211_T', 'G1212_T', 'G1213_T'],
  G122_T: ['G1221_T', 'G1222_T'],
};
/** Imputed contributions are not a revenue flow of the government in cash; they are left out of every total. */
const IMPUTED = 'G1223_T';
const LEVEL2 = TREE.G11_T;

export type SectorKey = string;
export interface Scope {
  kind: 'general' | 'central-ssf' | 'central' | 'budgetary';
  year: number;
  /** Levels drawn, each the sum of the listed IMF sectors. */
  parts: { level: 'central' | 'state' | 'local'; sectors: SectorKey[] }[];
  /** Why this scope, in one sentence. */
  note: string;
}

/** Years in which a series repeats an earlier or later value to the unit: a sign of carried-forward data. */
function repeatedYears(sectors: Sectors, sector: string): Set<string> {
  const out = new Set<string>();
  const s = sectors[sector]?.G11_T ?? {};
  const seen = new Map<number, string>();
  for (const y of Object.keys(s).sort()) {
    const o = s[y];
    if (!(o.v > 0)) continue;
    const prev = seen.get(o.v);
    if (prev) {
      out.add(prev);
      out.add(y);
    }
    seen.set(o.v, y);
  }
  return out;
}

export function makeReader(sectors: Sectors) {
  const bad = new Map<string, Set<string>>();
  const badYears = (sec: string) => {
    if (!bad.has(sec)) bad.set(sec, repeatedYears(sectors, sec));
    return bad.get(sec)!;
  };
  /** Sum of the IMF sectors for one indicator and year; undefined when none reports it. */
  const val = (secs: SectorKey[], ind: string, year: number): number | undefined => {
    let any = false;
    let sum = 0;
    for (const s of secs) {
      const o = sectors[s]?.[ind]?.[String(year)];
      if (!o || !OK_NATURE.has(o.nature) || !Number.isFinite(o.v)) continue;
      if (ind === 'G11_T' && badYears(s).has(String(year))) continue;
      any = true;
      sum += o.v;
    }
    return any ? sum : undefined;
  };
  /** Taxes and actual social contributions of a sector set in a year (0 for a missing line). */
  const grand = (secs: SectorKey[], year: number): number => {
    const t = val(secs, 'G11_T', year) ?? 0;
    const c = val(secs, 'G12_T', year) ?? 0;
    const imp = val(secs, IMPUTED, year) ?? 0;
    return t + c - imp;
  };
  /** True when the sector set reports taxes and its level-2 lines add up to the total within 1%. */
  const consistent = (secs: SectorKey[], year: number): boolean => {
    const t = val(secs, 'G11_T', year);
    if (!(t !== undefined && t > 0)) return false;
    const sum = LEVEL2.reduce((a, i) => a + (val(secs, i, year) ?? 0), 0);
    return Math.abs(sum - t) / t <= 0.01;
  };
  return { val, grand, consistent };
}
export type Reader = ReturnType<typeof makeReader>;

/**
 * Chooses the year and the sectors of a folio. Rule: take the latest year in which some scope passes, then the broadest
 * scope passing in that year or in the two years before it (so that a slightly older general-government series is
 * preferred to a newest year with only the budgetary central government). Scopes, broadest first:
 *  - general: S13 passes and equals central (+ social security funds) + state + local within 1.5%;
 *  - central-ssf: S13 passes and equals central (+ social security funds) within 1.5% (no sub-national taxes are reported),
 *    or S1311 with the social security funds S1314, or S1321;
 *  - central: S1311;
 *  - budgetary: S1311B.
 */
export function pickScope(sectors: Sectors): Scope | null {
  const r = makeReader(sectors);
  const has = (s: string) => !!sectors[s];
  const near = (a: number, b: number, tol: number) => b > 0 && Math.abs(a - b) / b <= tol;
  const candidates: Scope[] = [];
  for (let year = 2025; year >= FIRST_YEAR; year--) {
    const nat: SectorKey[] = has('S1314') && (r.val(['S1314'], 'G12_T', year) ?? 0) + (r.val(['S1314'], 'G11_T', year) ?? 0) > 0 ? ['S1311', 'S1314'] : ['S1311'];
    const stateOk = has('S1312MIXED') && (r.val(['S1312MIXED'], 'G11_T', year) ?? 0) > 0 && r.consistent(['S1312MIXED'], year);
    const localOk = has('S1313MIXED') && (r.val(['S1313MIXED'], 'G11_T', year) ?? 0) > 0 && r.consistent(['S1313MIXED'], year);
    if (r.consistent(['S13'], year)) {
      const s13 = r.grand(['S13'], year);
      const natOk = r.consistent(['S1311'], year);
      const parts: Scope['parts'] = [];
      let sum = 0;
      if (natOk) {
        parts.push({ level: 'central', sectors: nat });
        sum += r.grand(nat, year);
      }
      if (stateOk) {
        parts.push({ level: 'state', sectors: ['S1312MIXED'] });
        sum += r.grand(['S1312MIXED'], year);
      }
      if (localOk) {
        parts.push({ level: 'local', sectors: ['S1313MIXED'] });
        sum += r.grand(['S1313MIXED'], year);
      }
      if (natOk && (stateOk || localOk) && near(sum, s13, 0.015)) {
        candidates.push({ kind: 'general', year, parts, note: 'general government (S13), split by the IMF into central, state and local government' });
        continue;
      }
      if (natOk && near(r.grand(nat, year), s13, 0.015)) {
        candidates.push({ kind: 'central-ssf', year, parts: [{ level: 'central', sectors: nat }], note: 'the IMFâ€™s general-government series equals its central-government series, so no taxes of sub-national governments are reported' });
        continue;
      }
    }
    if (r.consistent(['S1311'], year)) {
      candidates.push({ kind: 'central', year, parts: [{ level: 'central', sectors: nat }], note: 'central government (S1311)' });
      continue;
    }
    if (r.consistent(['S1321'], year)) {
      candidates.push({ kind: 'central-ssf', year, parts: [{ level: 'central', sectors: ['S1321'] }], note: 'central government including social security funds (S1321)' });
      continue;
    }
    if (r.consistent(['S1311B'], year)) {
      candidates.push({ kind: 'budgetary', year, parts: [{ level: 'central', sectors: ['S1311B'] }], note: 'budgetary central government (S1311B)' });
    }
  }
  if (!candidates.length) return null;
  const newest = Math.max(...candidates.map((c) => c.year));
  const rank = { general: 0, 'central-ssf': 1, central: 2, budgetary: 3 } as const;
  const pool = candidates.filter((c) => c.year >= newest - 2);
  pool.sort((a, b) => rank[a.kind] - rank[b.kind] || b.year - a.year);
  return pool[0];
}

export interface Leaf {
  /** Classification code the amount comes from (G1111_T) or a synthetic one (other, merged). */
  code: string;
  /** What the line is, from the IMF's classification. */
  name: string;
  amount: number;
  kind: 'tax' | 'social';
  /** Lines folded into this leaf, when it is a residual or a merge of small lines. */
  merged?: string[];
  /** Set when the amount is the parent minus its reported children, not a reported line. */
  residualOf?: string;
}

export const CODE_NAME: Record<string, string> = {
  G11_T: 'Taxes',
  G111_T: 'Taxes on income, profits and capital gains',
  G1111_T: 'Taxes on income, profits and capital gains payable by individuals',
  G1112_T: 'Taxes on income, profits and capital gains payable by corporations and other enterprises',
  G1113_T: 'Other taxes on income, profits and capital gains',
  G112_T: 'Taxes on payroll and workforce',
  G113_T: 'Taxes on property',
  G1131_T: 'Recurrent taxes on immovable property',
  G1132_T: 'Recurrent taxes on net wealth',
  G1133_T: 'Estate, inheritance and gift taxes',
  G1135_T: 'Capital levies',
  G114_T: 'Taxes on goods and services',
  G1141_T: 'General taxes on goods and services',
  G11411_T: 'Value added taxes',
  G11412_T: 'Sales taxes',
  G11413_T: 'Turnover and other general taxes on goods and services',
  G11414_T: 'Taxes on financial and capital transactions',
  G1142_T: 'Excises',
  G1143_T: 'Profits of fiscal monopolies',
  G1144_T: 'Taxes on specific services',
  G1145_T: 'Taxes on the use of goods and on permission to use goods or perform activities',
  G11451_T: 'Motor vehicle taxes',
  G11452_T: 'Other taxes on the use of goods and on permission to use goods or perform activities',
  G1146_T: 'Other taxes on goods and services',
  G115_T: 'Taxes on international trade and transactions',
  G1151_T: 'Customs and other import duties',
  G1152_T: 'Taxes on exports',
  G1153_T: 'Profits of export or import monopolies',
  G1154_T: 'Exchange profits',
  G1155_T: 'Exchange taxes',
  G1156_T: 'Other taxes on international trade and transactions',
  G116_T: 'Other taxes',
  G12_T: 'Social contributions',
  G121_T: 'Social security contributions',
  G1211_T: 'Social security contributions: employee contributions',
  G1212_T: 'Social security contributions: employer contributions',
  G1213_T: 'Social security contributions: self-employed or non-employed contributions',
  G122_T: 'Other social contributions',
  G1221_T: 'Other social contributions: employee contributions',
  G1222_T: 'Other social contributions: employer contributions',
};

export interface Extraction {
  leaves: Leaf[];
  /** Problems the extraction met and how it handled them. */
  notes: string[];
  /** Taxes + actual social contributions of the sector set, as the IMF reports them. */
  reported: number;
  /** What the leaves add up to: the reported amount plus the absolute value of any negative lines left out. */
  total: number;
  /** Negative lines (refunds exceeding collections) that are not drawn. */
  negatives: { code: string; amount: number }[];
  imputed: number;
}

/**
 * Expands the classification tree for a sector set in a year into leaves. A node with reported children is replaced by
 * them plus a residual leaf when the children fall short of the node by more than 0.5%; a node whose children exceed it
 * by more than 0.5% is kept whole instead (less detail, never a changed total). A negative line (refunds larger than
 * collections) cannot be drawn: it is left out, recorded in `negatives`, and the leaves then add up to the reported amount
 * plus the absolute value of those lines.
 */
export function extractLeaves(r: Reader, secs: SectorKey[], year: number): Extraction {
  const notes: string[] = [];
  const negatives: { code: string; amount: number }[] = [];
  const imputed = r.val(secs, IMPUTED, year) ?? 0;
  const eff = (code: string): number | undefined => {
    const v = r.val(secs, code, year);
    if (v === undefined) return undefined;
    if (code === 'G12_T' || code === 'G122_T') return v - imputed;
    return v;
  };
  const tol = (v: number) => 0.005 * Math.abs(v) + 1;
  const leaves: Leaf[] = [];
  const expand = (code: string, kind: Leaf['kind']): void => {
    const v = eff(code);
    if (v === undefined || v === 0) return;
    if (v < 0) {
      negatives.push({ code, amount: v });
      return;
    }
    const kids = (TREE[code] ?? []).filter((k) => eff(k) !== undefined);
    if (!kids.length) {
      leaves.push({ code, name: CODE_NAME[code] ?? code, amount: v, kind });
      return;
    }
    const vals = kids.map((k) => eff(k) as number);
    const sum = vals.reduce((a, b) => a + b, 0);
    const resid = v - sum;
    if (resid < -tol(v)) {
      notes.push(`${code}: its reported children add up to ${Math.round(sum)} against ${Math.round(v)}, so it is drawn as one line`);
      leaves.push({ code, name: CODE_NAME[code] ?? code, amount: v, kind });
      return;
    }
    for (const k of kids) expand(k, kind);
    if (resid > 1) leaves.push({ code: `${code}:other`, name: `Other ${(CODE_NAME[code] ?? code).toLowerCase()} (not itemised)`, amount: resid, kind, residualOf: code });
  };
  expand('G11_T', 'tax');
  expand('G12_T', 'social');
  const total = leaves.reduce((a, l) => a + l.amount, 0);
  const reported = r.grand(secs, year);
  const negSum = negatives.reduce((a, n) => a - n.amount, 0);
  if (Math.abs(total - (reported + negSum)) > 0.01 * Math.abs(reported) * 0.01 + 2) notes.push(`leaves add up to ${Math.round(total)} but the reported total is ${Math.round(reported)} (negative lines ${Math.round(negSum)})`);
  return { leaves, notes, reported, total, negatives, imputed };
}
