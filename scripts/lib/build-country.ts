/**
 * Authoring helper: turns one compact definition of a country into the files of `countries/<id>/`
 * (country, taxes, revenue, sources, presentation, structure). The JSON files remain the source of
 * truth; a build script (scripts/build/<id>.ts) is just a convenient, typo-proof way to write them
 * the first time and to regenerate them after a bulk change. See docs/ADDING-A-COUNTRY.md.
 *
 * What it adds for you: today's dates, group defaults for revenue rows, source references written
 * as ["source-id", "locator"], the harmonised structure.json taken from profiles/<id>.json (which it
 * then removes, because the folio replaces the profile).
 */
import fs from 'node:fs';
import path from 'node:path';
import { COUNTRIES_DIR, PROFILES_DIR, readJson } from './load';
import { formatJson } from './format-json';
import type { Category, Family, GlyphName, Source } from '../../src/data/schema';

export type Ref = [sourceId: string] | [sourceId: string, locator: string];
const refs = (rs: Ref[]) => rs.map(([sourceId, locator]) => (locator ? { sourceId, locator } : { sourceId }));

export interface LevelSpec {
  id: string;
  branch: 'national' | 'regional' | 'local';
  official: string;
  native?: string;
  common: string;
  description: string;
  fiscalPower: string;
  refs: Ref[];
  label: string;
  sub?: string;
  glyph?: GlyphName;
}

export interface DenSpec {
  id: string;
  label: string;
  definition: string;
  levelIds?: string[];
  aggregateOnly?: boolean;
  amount: number;
  scale?: 'units' | 'thousand' | 'million' | 'billion' | 'trillion';
  period: PeriodSpec;
  sourceId: string;
  locator: string;
  calculation?: string;
  caveat?: string;
}

export interface PeriodSpec {
  label: string;
  kind?: 'fiscal-year' | 'calendar-year' | 'estimate' | 'forecast';
  start: string;
  end: string;
}

export interface GroupSpec {
  title: string;
  denominatorId?: string;
  period: PeriodSpec;
  basis: string;
  sourceId: string;
  role?: 'sizing' | 'informational';
  coverage?: 'exact' | 'broader' | 'subset';
  accessed?: string;
  scale?: DenSpec['scale'];
}

export interface RevSpec {
  group: string;
  amount: number;
  locator: string;
  calculation?: string;
  caveat?: string;
  coverage?: 'exact' | 'broader' | 'subset';
  coverageNote?: string;
  /** Overrides the group's period for this row (informational amounts that are not for the sizing year). */
  period?: PeriodSpec;
}

export interface InstSpec {
  id: string;
  parent: string;
  level: string;
  category?: Category;
  family: Family;
  status?: 'current' | 'transitional' | 'scheduled' | 'historical';
  statusNote?: string;
  official: string;
  native?: string;
  common: string;
  abbr?: string;
  base: string;
  payer: string;
  rate: { kind: 'flat' | 'progressive' | 'range' | 'specific' | 'mechanism' | 'varies'; headline: string; details?: string[]; asOf?: string };
  explanation: string;
  exceptions?: string[];
  refs: Ref[];
  label: string;
  sub?: string;
  glyph: GlyphName;
  labelSide?: 'below' | 'above' | 'left' | 'right';
  rev?: RevSpec;
  unavailable?: string;
}

export interface CountrySpec {
  id: string;
  iso3: string;
  isoNumeric: string;
  names: { en: string; native: string; nativeLang: string };
  currency: { code: string; symbol: string; name: string };
  summary: string;
  structureNote?: string;
  theme: { accent: string; accent2: string; motif: string; motifNote: string; mapLabel?: { lon: number; lat: number } };
  levels: LevelSpec[];
  supporting?: string[];
  denominators: DenSpec[];
  sizing: { label: string; definition: string; componentIds: string[]; neutralRadius?: number };
  researchStatus?: 'researched' | 'partial' | 'draft';
  rootLabel?: { label: string; sub?: string };
  sources: Source[];
  groups: Record<string, GroupSpec>;
  instruments: InstSpec[];
  /** Id of profiles/<id>.json whose harmonised structure and sources become this folio's structure.json. */
  fromProfile?: string;
  /** Replace the profile's `basis` text and add notes (profile text is generic). */
  structureOverride?: { basis?: string; notes?: string[]; levelNotes?: Record<string, string>; folioLevels?: Record<string, string[]> };
  today: string;
}

const periodOf = (p: PeriodSpec) => ({ label: p.label, kind: p.kind ?? 'calendar-year', start: p.start, end: p.end });

export function buildCountry(spec: CountrySpec): void {
  const dir = path.join(COUNTRIES_DIR, spec.id);
  fs.mkdirSync(dir, { recursive: true });
  const today = spec.today;
  const cur = spec.currency.code;
  const w = (file: string, v: unknown) => fs.writeFileSync(path.join(dir, file), formatJson(v), 'utf8');

  /* ---- sources: the profile's harmonised sources go first ---- */
  let sources: Source[] = [...spec.sources];
  let structure: Record<string, unknown> | undefined;
  if (spec.fromProfile) {
    const pfile = path.join(PROFILES_DIR, `${spec.fromProfile}.json`);
    let prof: { structure: Record<string, unknown>; sources: Source[] };
    if (fs.existsSync(pfile)) prof = readJson(pfile) as typeof prof;
    else {
      // Re-running after the profile was retired: reuse the structure and harmonised sources already in the folder.
      const sFile = path.join(dir, 'structure.json');
      const srcFile = path.join(dir, 'sources.json');
      if (!fs.existsSync(sFile) || !fs.existsSync(srcFile)) throw new Error(`neither profiles/${spec.fromProfile}.json nor countries/${spec.id}/structure.json exists`);
      prof = {
        structure: readJson(sFile) as Record<string, unknown>,
        sources: (readJson(srcFile) as { sources: Source[] }).sources.filter((s) => /^(oecd|sng)-/.test(s.id)),
      };
    }
    structure = { ...prof.structure };
    const o = spec.structureOverride;
    if (o?.basis) structure.basis = o.basis;
    if (o?.notes) structure.notes = [...new Set([...((structure.notes as string[]) ?? []), ...o.notes])];
    if (o?.levelNotes || o?.folioLevels) {
      structure.levels = (structure.levels as { key: string; note?: string; folioLevelIds?: string[] }[]).map((l) => ({
        ...l,
        ...(o.levelNotes?.[l.key] ? { note: o.levelNotes[l.key] } : {}),
        ...(o.folioLevels?.[l.key] ? { folioLevelIds: o.folioLevels[l.key] } : {}),
      }));
    }
    const have = new Set(sources.map((s) => s.id));
    sources = [...prof.sources.filter((s) => !have.has(s.id)), ...sources];
  }

  /* ---- country.json ---- */
  const levelRefs = (l: LevelSpec) => refs(l.refs);
  w('country.json', {
    id: spec.id,
    iso3: spec.iso3,
    isoNumeric: spec.isoNumeric,
    names: spec.names,
    currency: spec.currency,
    summary: spec.summary,
    ...(spec.structureNote ? { structureNote: spec.structureNote } : {}),
    theme: spec.theme,
    levels: spec.levels.map((l) => ({
      id: l.id,
      branch: l.branch,
      names: { official: l.official, ...(l.native ? { native: l.native } : {}), common: l.common },
      description: l.description,
      fiscalPower: l.fiscalPower,
      legalRefs: levelRefs(l),
      checkedOn: today,
    })),
    supportingSourceIds: spec.supporting ?? [],
    denominators: spec.denominators.map((d) => ({
      id: d.id,
      label: d.label,
      definition: d.definition,
      levelIds: d.levelIds ?? [],
      ...(d.aggregateOnly ? { aggregateOnly: true } : {}),
      amount: d.amount,
      scale: d.scale ?? 'million',
      currency: cur,
      period: periodOf(d.period),
      sourceId: d.sourceId,
      locator: d.locator,
      ...(d.calculation ? { calculation: d.calculation } : {}),
      ...(d.caveat ? { caveat: d.caveat } : {}),
      accessed: today,
    })),
    sizing: spec.sizing,
    researchStatus: spec.researchStatus ?? 'researched',
  });

  /* ---- taxes.json ---- */
  w('taxes.json', {
    instruments: spec.instruments.map((i) => ({
      id: i.id,
      parentId: i.parent,
      levelId: i.level,
      category: i.category ?? 'tax',
      family: i.family,
      status: i.status ?? 'current',
      ...(i.statusNote ? { statusNote: i.statusNote } : {}),
      names: { official: i.official, ...(i.native ? { native: i.native } : {}), common: i.common, ...(i.abbr ? { abbreviation: i.abbr } : {}) },
      taxes: { base: i.base, payer: i.payer },
      rate: { kind: i.rate.kind, headline: i.rate.headline, details: i.rate.details ?? [], asOf: i.rate.asOf ?? today },
      explanation: i.explanation,
      exceptions: i.exceptions ?? [],
      legalRefs: refs(i.refs),
      checkedOn: today,
    })),
  });

  /* ---- revenue.json: one group per table, rows inherit the group's defaults ---- */
  const rows = new Map<string, InstSpec[]>();
  for (const i of spec.instruments) if (i.rev) rows.set(i.rev.group, [...(rows.get(i.rev.group) ?? []), i]);
  for (const g of rows.keys()) if (!spec.groups[g]) throw new Error(`revenue group "${g}" is not defined`);
  w('revenue.json', {
    groups: [...rows.entries()].map(([key, insts]) => {
      const g = spec.groups[key];
      return {
        title: g.title,
        defaults: {
          ...(g.denominatorId ? { denominatorId: g.denominatorId } : {}),
          scale: g.scale ?? 'million',
          currency: cur,
          period: periodOf(g.period),
          basis: g.basis,
          sourceId: g.sourceId,
          role: g.role ?? 'sizing',
          coverage: g.coverage ?? 'exact',
          accessed: g.accessed ?? today,
        },
        observations: insts.map((i) => ({
          nodeId: i.id,
          amount: i.rev!.amount,
          locator: i.rev!.locator,
          ...(i.rev!.calculation ? { calculation: i.rev!.calculation } : {}),
          ...(i.rev!.coverage ? { coverage: i.rev!.coverage } : {}),
          ...(i.rev!.coverageNote ? { coverageNote: i.rev!.coverageNote } : {}),
          ...(i.rev!.period ? { period: periodOf(i.rev!.period) } : {}),
          ...(i.rev!.caveat ? { caveat: i.rev!.caveat } : {}),
        })),
      };
    }),
    unavailable: spec.instruments.filter((i) => i.unavailable).map((i) => ({ nodeId: i.id, reason: i.unavailable })),
  });

  /* ---- sources.json ---- */
  w('sources.json', { sources });

  /* ---- presentation.json ---- */
  const nodes: Record<string, unknown> = {
    [spec.id]: { label: spec.rootLabel?.label ?? spec.names.native, sublabel: spec.rootLabel?.sub ?? 'Fiscal folio', glyph: 'globe' },
  };
  for (const l of spec.levels) nodes[l.id] = { label: l.label, ...(l.sub ? { sublabel: l.sub } : {}), glyph: l.glyph ?? (l.branch === 'national' ? 'landmark' : l.branch === 'regional' ? 'city' : 'town') };
  for (const i of spec.instruments) nodes[i.id] = { label: i.label, ...(i.sub ? { sublabel: i.sub } : {}), glyph: i.glyph, ...(i.labelSide ? { labelSide: i.labelSide } : {}) };
  w('presentation.json', { nodes });

  /* ---- structure.json (harmonised layer), then retire the profile ---- */
  if (structure) {
    w('structure.json', structure);
    const pfile = path.join(PROFILES_DIR, `${spec.fromProfile}.json`);
    if (fs.existsSync(pfile)) fs.rmSync(pfile);
  }
  // layout.json is made by `npm run layouts:init -- <id> --force`
  console.log(`Built countries/${spec.id}/ (${spec.instruments.length} instruments, ${sources.length} sources).`);
}
