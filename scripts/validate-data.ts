/**
 * Validates every countries/<id>/ folder against the shared schema and the
 * cross-file rules the schema cannot express. Exit code 1 on any error.
 *
 *   npm run validate            all countries
 *   npm run validate -- brazil  one country
 */
import fs from 'node:fs';
import path from 'node:path';
import { FILES, countryDir, listCountryIds, listProfileIds, loadBundle, loadProfileFile } from './lib/load';
import { toBase } from '../src/data/model';
import type { CountryBundle, Structure } from '../src/data/schema';

const TODAY = new Date().toISOString().slice(0, 10);
const EPS = 1e-9;

interface Report {
  errors: string[];
  warnings: string[];
  /** share of each denominator explained by the cores that use it (0–1) */
  coverage: Map<string, number>;
  /** weight of each national-total component in the national total (0–1) */
  weights: Map<string, number>;
}

/**
 * Checks one harmonised structure (countries/<id>/structure.json or the structure inside profiles/<id>.json):
 * tax types add up to each level's total, level shares to 100 %, sources exist, and blank figures are explained.
 */
export function validateStructure(st: Structure, ctx: { sourceIds: Set<string>; folioLevelIds?: Set<string>; currency?: string }): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const err = (m: string) => errors.push(m);
  const warn = (m: string) => warnings.push(m);
  st.sourceIds.forEach((s) => {
    if (!ctx.sourceIds.has(s)) err(`structure.json: source "${s}" is not in sources.json`);
  });
  if (st.subnational?.sourceId && !ctx.sourceIds.has(st.subnational.sourceId)) err(`structure.json: source "${st.subnational.sourceId}" is not in sources.json`);
  if (ctx.currency && st.currency !== ctx.currency) err(`structure.json: currency ${st.currency} differs from the country currency ${ctx.currency}`);
  const seenKeys = new Set<string>();
  for (const l of st.levels) {
    if (seenKeys.has(l.key)) err(`structure.json: level "${l.key}" listed twice`);
    seenKeys.add(l.key);
    if (ctx.folioLevelIds) for (const fid of l.folioLevelIds) if (!ctx.folioLevelIds.has(fid)) err(`structure.json: level "${l.key}" refers to unknown folio level "${fid}"`);
    if (l.total === undefined && l.share === undefined) err(`structure.json: level "${l.key}" needs a total or a share`);
    if (l.byType && l.total !== undefined) {
      const s = Object.values(l.byType).reduce((a, v) => a + v, 0);
      if (Math.abs(s - l.total) > Math.max(3, Math.abs(l.total) * 0.0005)) err(`structure.json: level "${l.key}" tax types add up to ${s}, not its total ${l.total}`);
    }
  }
  const allHaveTotal = st.levels.every((l) => l.total !== undefined);
  const allHaveShare = st.levels.every((l) => l.share !== undefined);
  if (!allHaveTotal && !allHaveShare) err('structure.json: levels must all carry totals, or all carry shares');
  if (allHaveShare) {
    const s = st.levels.reduce((a, l) => a + (l.share ?? 0), 0);
    if (Math.abs(s - 100) > 0.6) err(`structure.json: level shares add up to ${s.toFixed(1)}%, not 100%`);
  }
  if (!st.levels.every((l) => l.byType) && !st.totalByType) err('structure.json: give byType on every level, or totalByType for the whole country');
  if (st.totalByType && allHaveTotal) warn('structure.json: totalByType is ignored because every level has a total');
  if (st.totalByType && allHaveShare) {
    const s = Object.values(st.totalByType).reduce((a, v) => a + v, 0);
    if (s <= 0) err('structure.json: totalByType is empty');
  }
  if (st.subnational) {
    const { ownSourceTaxShareOfRevenue: t, grantsShareOfRevenue: g } = st.subnational;
    if (t != null && g != null && t + g > 100.5) err(`structure.json: subnational tax (${t}%) + grants (${g}%) exceed 100%`);
    if ((t == null || g == null) && !st.subnational.note) err('structure.json: subnational figures left empty need a note explaining why');
  }
  return { errors, warnings };
}

export function validateBundle(b: CountryBundle): Report {
  const errors: string[] = [];
  const warnings: string[] = [];
  const coverage = new Map<string, number>();
  const weights = new Map<string, number>();
  const err = (m: string) => errors.push(m);
  const warn = (m: string) => warnings.push(m);
  const { meta } = b;

  /* ---- ids ---- */
  const kinds = new Map<string, 'country' | 'level' | 'instrument'>();
  const add = (id: string, kind: 'country' | 'level' | 'instrument') => {
    if (kinds.has(id)) err(`duplicate id "${id}" (already used as ${kinds.get(id)})`);
    else kinds.set(id, kind);
  };
  add(meta.id, 'country');
  meta.levels.forEach((l) => add(l.id, 'level'));
  b.instruments.forEach((i) => add(i.id, 'instrument'));

  /* ---- parents, cycles, level consistency ---- */
  const levelIds = new Set(meta.levels.map((l) => l.id));
  const byId = new Map(b.instruments.map((i) => [i.id, i]));
  for (const i of b.instruments) {
    if (!kinds.has(i.parentId)) err(`instrument "${i.id}": parentId "${i.parentId}" does not exist`);
    else if (i.parentId === meta.id) err(`instrument "${i.id}": parent may not be the country core (attach it to a level)`);
    if (!levelIds.has(i.levelId)) err(`instrument "${i.id}": levelId "${i.levelId}" is not a level of ${meta.id}`);
    // walk to the level
    const seen = new Set<string>([i.id]);
    let cur = i.parentId;
    let reached: string | null = null;
    while (cur) {
      if (seen.has(cur)) {
        err(`instrument "${i.id}": parent chain contains a cycle at "${cur}"`);
        break;
      }
      seen.add(cur);
      if (levelIds.has(cur)) {
        reached = cur;
        break;
      }
      const p = byId.get(cur);
      if (!p) break;
      cur = p.parentId;
    }
    if (reached && reached !== i.levelId) err(`instrument "${i.id}": levelId "${i.levelId}" conflicts with its ancestor level "${reached}"`);
    if (i.status !== 'current' && !i.statusNote) err(`instrument "${i.id}": status "${i.status}" requires a statusNote`);
  }

  /* ---- sources ---- */
  const sourceIds = new Set<string>();
  for (const s of b.sources) {
    if (sourceIds.has(s.id)) err(`duplicate source id "${s.id}"`);
    sourceIds.add(s.id);
    if (s.accessed > TODAY) err(`source "${s.id}": accessed date ${s.accessed} is in the future`);
    if (s.publishedDate && s.publishedDate > TODAY) err(`source "${s.id}": publishedDate ${s.publishedDate} is in the future`);
  }
  const usedSources = new Set<string>();
  const needSource = (id: string, where: string) => {
    usedSources.add(id);
    if (!sourceIds.has(id)) err(`${where}: source "${id}" is not in sources.json`);
  };
  meta.levels.forEach((l) => l.legalRefs.forEach((r) => needSource(r.sourceId, `level "${l.id}"`)));
  b.instruments.forEach((i) => i.legalRefs.forEach((r) => needSource(r.sourceId, `instrument "${i.id}"`)));
  meta.supportingSourceIds.forEach((s) => needSource(s, 'supportingSourceIds'));
  meta.denominators.forEach((d) => needSource(d.sourceId, `denominator "${d.id}"`));
  b.observations.forEach((o) => needSource(o.sourceId, `revenue "${o.nodeId}"`));

  /* ---- dates ---- */
  for (const i of b.instruments) {
    if (i.checkedOn > TODAY) err(`instrument "${i.id}": checkedOn ${i.checkedOn} is in the future`);
    if (i.rate.asOf > TODAY) err(`instrument "${i.id}": rate.asOf ${i.rate.asOf} is in the future`);
    const age = (Date.parse(TODAY) - Date.parse(i.checkedOn)) / 864e5;
    if (age > 400) warn(`instrument "${i.id}": last checked ${i.checkedOn} (over 400 days ago)`);
  }

  /* ---- presentation ---- */
  for (const id of kinds.keys()) if (!b.presentation.nodes[id]) err(`presentation.json: no entry for "${id}"`);
  for (const id of Object.keys(b.presentation.nodes)) if (!kinds.has(id)) err(`presentation.json: unknown node "${id}"`);

  /* ---- layout ---- */
  const { width, height } = b.layout.canvas;
  for (const id of kinds.keys()) {
    const p = b.layout.positions[id];
    if (!p) {
      err(`layout.json: no position for "${id}"`);
      continue;
    }
    if (!Number.isFinite(p.x) || !Number.isFinite(p.y)) err(`layout.json: "${id}" has non-finite coordinates`);
    else if (p.x < 0 || p.x > width || p.y < 0 || p.y > height) err(`layout.json: "${id}" (${p.x}, ${p.y}) lies outside the ${width}×${height} canvas`);
  }
  for (const id of Object.keys(b.layout.positions)) if (!kinds.has(id)) err(`layout.json: position for unknown node "${id}"`);
  for (const id of Object.keys(b.layout.radii)) if (!kinds.has(id)) err(`layout.json: radius for unknown node "${id}"`);

  /* ---- denominators ---- */
  const dens = new Map(meta.denominators.map((d) => [d.id, d]));
  if (dens.size !== meta.denominators.length) err('duplicate denominator ids');
  for (const d of meta.denominators) {
    for (const lid of d.levelIds) if (!levelIds.has(lid)) err(`denominator "${d.id}": unknown level "${lid}"`);
    if (d.period.end < d.period.start) err(`denominator "${d.id}": period ends before it starts`);
    if (d.accessed > TODAY) err(`denominator "${d.id}": accessed date in the future`);
    if (d.currency !== meta.currency.code) err(`denominator "${d.id}": currency ${d.currency} differs from the country currency ${meta.currency.code}`);
    if (!d.aggregateOnly && !d.levelIds.length) err(`denominator "${d.id}": needs levelIds (or set aggregateOnly)`);
  }
  /* national total: the sum every sized core is measured against */
  const componentIds = new Set<string>();
  for (const cid of meta.sizing.componentIds) {
    if (componentIds.has(cid)) err(`sizing.componentIds lists "${cid}" twice`);
    componentIds.add(cid);
    if (!dens.has(cid)) err(`sizing.componentIds: "${cid}" is not a denominator`);
  }
  const components = [...componentIds].map((id) => dens.get(id)).filter((d): d is NonNullable<typeof d> => !!d);
  const monthIdx = (iso: string) => Number(iso.slice(0, 4)) * 12 + Number(iso.slice(5, 7)) - 1;
  if (components.length) {
    const ends = components.map((d) => monthIdx(d.period.end));
    const spread = Math.max(...ends) - Math.min(...ends);
    if (spread > 30) err(`national total: component periods end ${spread} months apart (limit 30); refresh the older parts`);
    else if (spread > 12) warn(`national total: component periods end ${spread} months apart – shares are approximate to that extent`);
    const natBase = components.reduce((s, d) => s + toBase(d.amount, d.scale), 0);
    for (const d of components) weights.set(d.id, toBase(d.amount, d.scale) / natBase);
  }
  for (const d of meta.denominators) {
    if (d.aggregateOnly && !componentIds.has(d.id)) err(`denominator "${d.id}": aggregate-only parts must be listed in sizing.componentIds`);
  }

  /* ---- revenue observations ---- */
  const seenNode = new Set<string>();
  const sharesByDen = new Map<string, number>();
  const aggSizing = new Map<string, string[]>();
  for (const o of b.observations) {
    const inst = byId.get(o.nodeId);
    if (!inst) {
      err(`revenue: nodeId "${o.nodeId}" is not an instrument`);
      continue;
    }
    if (seenNode.has(o.nodeId)) err(`revenue: "${o.nodeId}" has more than one observation`);
    seenNode.add(o.nodeId);
    if (o.period.end < o.period.start) err(`revenue "${o.nodeId}": period ends before it starts`);
    if (o.accessed > TODAY) err(`revenue "${o.nodeId}": accessed date in the future`);
    if (o.role === 'sizing' && !o.denominatorId) err(`revenue "${o.nodeId}": sizing observations need a denominatorId`);
    if (o.role === 'sizing' && o.denominatorId && !componentIds.has(o.denominatorId))
      err(`revenue "${o.nodeId}": sizing observations must use a component of the national total (${[...componentIds].join(', ')})`);
    if (o.denominatorId && dens.get(o.denominatorId)?.aggregateOnly) err(`revenue "${o.nodeId}": denominator "${o.denominatorId}" is aggregate-only and has no cores`);
    if (o.aggregateKey && o.role === 'sizing') {
      aggSizing.set(o.aggregateKey, [...(aggSizing.get(o.aggregateKey) ?? []), o.nodeId]);
    }
    if (o.denominatorId) {
      const d = dens.get(o.denominatorId);
      if (!d) {
        err(`revenue "${o.nodeId}": denominator "${o.denominatorId}" does not exist`);
        continue;
      }
      if (o.currency !== d.currency) err(`revenue "${o.nodeId}": currency ${o.currency} differs from denominator ${d.currency}`);
      if (o.period.start !== d.period.start || o.period.end !== d.period.end)
        err(`revenue "${o.nodeId}": period ${o.period.start}…${o.period.end} differs from denominator period ${d.period.start}…${d.period.end}`);
      if (!d.levelIds.includes(inst.levelId)) err(`revenue "${o.nodeId}": level "${inst.levelId}" is not covered by denominator "${d.id}"`);
      const share = toBase(o.amount, o.scale) / toBase(d.amount, d.scale);
      if (share > 1 + EPS) err(`revenue "${o.nodeId}": amount exceeds its denominator (share ${(share * 100).toFixed(1)}%)`);
      if (share > 0.9 && share < 0.999 && o.role === 'sizing') warn(`revenue "${o.nodeId}": unusually large share ${(share * 100).toFixed(1)}%`);
      sharesByDen.set(d.id, (sharesByDen.get(d.id) ?? 0) + share);
    } else if (!o.caveat) {
      err(`revenue "${o.nodeId}": an informational amount with no denominator needs a caveat explaining why no share is shown`);
    }
    if (o.coverage !== 'exact' && !o.coverageNote && !o.caveat) warn(`revenue "${o.nodeId}": coverage "${o.coverage}" has no coverageNote or caveat`);
  }

  /* ---- structure.json: the harmonised cross-country layer ---- */
  if (!b.structure) {
    warn('structure.json is missing: the country cannot appear in the country profile comparison');
  } else {
    const r = validateStructure(b.structure, { sourceIds, folioLevelIds: levelIds, currency: meta.currency.code });
    r.errors.forEach(err);
    r.warnings.forEach(warn);
    b.structure.sourceIds.forEach((s) => usedSources.add(s));
    if (b.structure.subnational?.sourceId) usedSources.add(b.structure.subnational.sourceId);
  }
  for (const [key, nodes] of aggSizing) if (nodes.length > 1) err(`revenue: aggregateKey "${key}" sizes more than one core (${nodes.join(', ')}) – this double-counts`);
  for (const [den, sum] of sharesByDen) {
    if (sum > 1 + 1e-6) err(`denominator "${den}": shares of its cores sum to ${(sum * 100).toFixed(2)}% (> 100%) – possible double counting`);
    coverage.set(den, sum);
  }
  const unavailableIds = new Set<string>();
  for (const u of b.unavailable) {
    if (!byId.has(u.nodeId)) err(`unavailable: "${u.nodeId}" is not an instrument`);
    if (seenNode.has(u.nodeId)) err(`unavailable: "${u.nodeId}" also has a revenue observation`);
    unavailableIds.add(u.nodeId);
  }
  for (const i of b.instruments) {
    if (!seenNode.has(i.id) && !unavailableIds.has(i.id)) warn(`instrument "${i.id}": no revenue observation and no "unavailable" reason`);
  }
  for (const [id, r] of Object.entries(b.layout.radii)) {
    const o = b.observations.find((x) => x.nodeId === id && x.role === 'sizing');
    if (o) warn(`layout radius for "${id}" is ignored because the core is sized by revenue`);
    void r;
  }

  for (const s of b.sources) if (!usedSources.has(s.id)) warn(`source "${s.id}" is never referenced`);

  return { errors, warnings, coverage, weights };
}

function main() {
  const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));
  const allowNoLayout = process.argv.includes('--no-layout');
  const ids = only.length ? only : listCountryIds();
  let failed = false;
  const numerics = new Map<string, string>();
  for (const id of ids) {
    const dir = countryDir(id);
    const missing = FILES.filter((f) => !fs.existsSync(path.join(dir, f)) && !(allowNoLayout && f === 'layout.json'));
    if (missing.length) {
      console.error(`✗ ${id}: missing files: ${missing.join(', ')}`);
      failed = true;
      continue;
    }
    let bundle: CountryBundle;
    try {
      bundle = loadBundle(id, { layoutOptional: allowNoLayout });
    } catch (e) {
      console.error(`✗ ${id}\n${(e as Error).message}`);
      failed = true;
      continue;
    }
    if (bundle.meta.id !== id) {
      console.error(`✗ ${id}: country.json id "${bundle.meta.id}" does not match its folder name`);
      failed = true;
    }
    const clash = numerics.get(bundle.meta.isoNumeric);
    if (clash) {
      console.error(`✗ ${id}: isoNumeric ${bundle.meta.isoNumeric} also used by ${clash}`);
      failed = true;
    }
    numerics.set(bundle.meta.isoNumeric, id);
    const { errors, warnings, coverage, weights } = validateBundle(bundle);
    const n = bundle.instruments.length;
    if (errors.length) {
      failed = true;
      console.error(`✗ ${id} (${n} instruments): ${errors.length} error(s)`);
      errors.forEach((m) => console.error(`    error   ${m}`));
    } else {
      console.log(`✓ ${id} (${n} instruments, ${bundle.observations.length} revenue observations, ${bundle.sources.length} sources)`);
    }
    for (const [den, w] of weights) console.log(`    part ${den}: ${(w * 100).toFixed(1)}% of the national total${coverage.has(den) ? `, its cores explain ${((coverage.get(den) ?? 0) * 100).toFixed(1)}% of the part` : ''}`);
    warnings.forEach((m) => console.warn(`    warning ${m}`));
  }

  /* ---- profile-only countries: harmonised layer without a folio ---- */
  if (!only.length) {
    const folioIds = new Set(listCountryIds());
    const seen = new Set<string>();
    let okProfiles = 0;
    for (const pid of listProfileIds()) {
      try {
        const p = loadProfileFile(pid);
        const problems: string[] = [];
        if (p.id !== pid) problems.push(`id "${p.id}" does not match the file name`);
        if (folioIds.has(pid)) problems.push(`countries/${pid} already exists: delete the profile, the folio's structure.json replaces it`);
        const clash = numerics.get(p.isoNumeric) ?? (seen.has(p.isoNumeric) ? 'another profile' : undefined);
        if (clash) problems.push(`isoNumeric ${p.isoNumeric} also used by ${clash}`);
        seen.add(p.isoNumeric);
        const sourceIds = new Set(p.sources.map((s) => s.id));
        if (sourceIds.size !== p.sources.length) problems.push('duplicate source ids');
        problems.push(...validateStructure(p.structure, { sourceIds, currency: p.structure.currency }).errors);
        if (problems.length) {
          failed = true;
          console.error(`✗ profile ${pid}`);
          problems.forEach((m) => console.error(`    error   ${m}`));
        } else okProfiles++;
      } catch (e) {
        failed = true;
        console.error(`✗ profile ${pid}\n${(e as Error).message}`);
      }
    }
    if (listProfileIds().length) console.log(`✓ ${okProfiles} profile-only countries (harmonised layer, no folio yet)`);
  }

  if (failed) {
    console.error('\nValidation failed.');
    process.exit(1);
  }
  console.log('\nAll country data valid.');
}

if (process.argv[1] && /validate-data/.test(process.argv[1])) main();
