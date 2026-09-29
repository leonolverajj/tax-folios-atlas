/**
 * Writes one "what to check when you update this country" checklist per country, from the data itself,
 * and a staleness summary so nothing quietly becomes obsolete.
 *
 *   npm run checklist                 all countries -> docs/update-checklists/<id>.md and docs/UPDATE-CHECKLIST.md
 *   npm run checklist -- japan        one country
 *
 * Every row is a source URL taken from countries/<id>/sources.json together with what it feeds
 * (revenue figures, national-total parts, rates, legal text, the harmonised OECD layer), the date the
 * figure or rule was last checked, and whether a newer edition is probably out.
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, listCountryIds, loadBundle } from './lib/load';
import type { CountryBundle, Source } from '../src/data/schema';

const TODAY = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const daysBetween = (a: string, b: Date) => Math.round((b.getTime() - Date.parse(a)) / 864e5);
const monthsBetween = (a: string, b: Date) => (b.getFullYear() - Number(a.slice(0, 4))) * 12 + (b.getMonth() - (Number(a.slice(5, 7)) - 1));

interface Use {
  revenue: { nodeId: string; periodEnd: string; periodLabel: string; role: string }[];
  parts: { id: string; label: string; periodEnd: string }[];
  legal: { id: string; name: string; checkedOn: string; rateAsOf?: string }[];
  structure: boolean;
  supporting: boolean;
}

function usesOf(b: CountryBundle): Map<string, Use> {
  const m = new Map<string, Use>();
  const get = (id: string) => {
    if (!m.has(id)) m.set(id, { revenue: [], parts: [], legal: [], structure: false, supporting: false });
    return m.get(id)!;
  };
  b.observations.forEach((o) => get(o.sourceId).revenue.push({ nodeId: o.nodeId, periodEnd: o.period.end, periodLabel: o.period.label, role: o.role }));
  b.meta.denominators.forEach((d) => get(d.sourceId).parts.push({ id: d.id, label: d.label, periodEnd: d.period.end }));
  b.instruments.forEach((i) => i.legalRefs.forEach((r) => get(r.sourceId).legal.push({ id: i.id, name: i.names.common, checkedOn: i.checkedOn, rateAsOf: i.rate.asOf })));
  b.meta.levels.forEach((l) => l.legalRefs.forEach((r) => get(r.sourceId).legal.push({ id: l.id, name: l.names.common, checkedOn: l.checkedOn })));
  b.structure?.sourceIds.forEach((s) => (get(s).structure = true));
  if (b.structure?.subnational?.sourceId) get(b.structure.subnational.sourceId).structure = true;
  b.meta.supportingSourceIds.forEach((s) => (get(s).supporting = true));
  return m;
}

type Group = 'Revenue figures and national-total parts' | 'Harmonised OECD layer' | 'Rate and guidance pages' | 'Legal texts' | 'Context and cross-checks';

function groupOf(s: Source, u: Use): Group {
  if (u.revenue.length || u.parts.length) return 'Revenue figures and national-total parts';
  if (u.structure) return 'Harmonised OECD layer';
  if (s.kind === 'legal') return 'Legal texts';
  if (u.legal.length && (s.kind === 'tax-agency' || s.kind === 'guidance')) return 'Rate and guidance pages';
  if (u.legal.length) return 'Legal texts';
  return 'Context and cross-checks';
}

function status(s: Source, u: Use, g: Group): { flag: string; todo: string } {
  if (g === 'Revenue figures and national-total parts') {
    const latest = [...u.revenue.map((r) => r.periodEnd), ...u.parts.map((p) => p.periodEnd)].sort().pop()!;
    const age = monthsBetween(latest, TODAY);
    const nextMonths = s.nextExpected ? monthsBetween(`${s.nextExpected}-01`, TODAY) : undefined;
    let flag: string;
    if (nextMonths !== undefined) {
      flag =
        nextMonths >= 0
          ? `**DUE** – the next edition was expected ${s.nextExpected}; figures end ${latest}`
          : nextMonths >= -2
            ? `soon – next edition expected ${s.nextExpected}; figures end ${latest}`
            : `current – next edition expected ${s.nextExpected}; figures end ${latest}`;
    } else {
      flag =
        age > 18
          ? `**CHECK** – figures end ${latest} (${age} months ago); a newer edition may exist (record \`nextExpected\` in sources.json once you know)`
          : age > 12
            ? `soon – figures end ${latest} (${age} months ago)`
            : `current – figures end ${latest}`;
    }
    return {
      flag,
      todo: 'Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.',
    };
  }
  if (g === 'Harmonised OECD layer') {
    return {
      flag: 'yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May',
      todo: 'Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.',
    };
  }
  if (g === 'Rate and guidance pages') {
    const oldest = u.legal.map((l) => l.checkedOn).sort()[0];
    const age = daysBetween(oldest, TODAY);
    return {
      flag: age > 365 ? `**DUE** – last checked ${oldest} (${age} days ago)` : age > 180 ? `soon – last checked ${oldest}` : `current – last checked ${oldest}`,
      todo: 'Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.',
    };
  }
  if (g === 'Legal texts') {
    const oldest = u.legal.map((l) => l.checkedOn).sort()[0];
    const age = daysBetween(oldest ?? iso(TODAY), TODAY);
    return {
      flag: age > 365 ? `**DUE** – last checked ${oldest} (${age} days ago)` : `current – last checked ${oldest}`,
      todo: 'Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.',
    };
  }
  return { flag: s.publishedDate ? `published ${s.publishedDate}` : 'no publication date', todo: 'Context only: re-open if a related figure or rule changes.' };
}

const ORDER: Group[] = ['Revenue figures and national-total parts', 'Harmonised OECD layer', 'Rate and guidance pages', 'Legal texts', 'Context and cross-checks'];

function checklist(id: string): { md: string; due: number; soon: number; rows: number } {
  const b = loadBundle(id);
  const uses = usesOf(b);
  const groups = new Map<Group, string[]>();
  let due = 0;
  let soon = 0;
  for (const s of b.sources) {
    const u = uses.get(s.id) ?? { revenue: [], parts: [], legal: [], structure: false, supporting: false };
    const g = groupOf(s, u);
    const st = status(s, u, g);
    if (st.flag.startsWith('**DUE**') || st.flag.startsWith('**CHECK**')) due++;
    else if (st.flag.startsWith('soon')) soon++;
    const feeds: string[] = [];
    if (u.parts.length) feeds.push(`national-total parts: ${u.parts.map((p) => `\`${p.id}\``).join(', ')}`);
    if (u.revenue.length) feeds.push(`revenue of ${u.revenue.length} core(s): ${[...new Set(u.revenue.map((r) => r.nodeId))].slice(0, 8).map((n) => `\`${n}\``).join(', ')}${u.revenue.length > 8 ? ', …' : ''}`);
    if (u.legal.length) feeds.push(`legal/rate basis of ${new Set(u.legal.map((l) => l.id)).size} node(s)`);
    if (u.structure) feeds.push('`structure.json` (cross-country profile)');
    if (u.supporting && !feeds.length) feeds.push('cross-check');
    const block = [
      `- [ ] **${s.title}** – ${s.org}`,
      `  - URL: ${s.url}`,
      `  - Feeds: ${feeds.join('; ') || 'nothing yet (unused source)'}`,
      `  - Status: ${st.flag}. Published ${s.publishedDate ?? 'n/a'}, accessed ${s.accessed}${s.periodCovered ? `, covers ${s.periodCovered}` : ''}.`,
      `  - To do: ${st.todo}`,
      ...(s.note ? [`  - Note: ${s.note}`] : []),
    ].join('\n');
    (groups.get(g) ?? groups.set(g, []).get(g)!).push(block);
  }
  const head = [
    `# Update checklist – ${b.meta.names.en}`,
    '',
    `Generated ${iso(TODAY)} by \`npm run checklist\`. **Do not edit by hand** – edit the sources in \`countries/${id}/sources.json\` and re-run it.`,
    '',
    `Research status: **${b.meta.researchStatus}**. ${due} source(s) to check or due, ${soon} coming up, ${b.sources.length} in total.`,
    '',
    'When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=' + id + '`.',
    '',
  ];
  const body = ORDER.filter((g) => groups.has(g)).flatMap((g) => [`## ${g}`, '', ...groups.get(g)!.flatMap((x) => [x, '']), '']);
  // gaps the researcher should know about
  const gaps = [
    ...b.unavailable.map((u) => `- \`${u.nodeId}\`: ${u.reason}`),
    ...b.instruments.filter((i) => i.status !== 'current').map((i) => `- \`${i.id}\` is **${i.status}**: ${i.statusNote ?? ''}`),
  ];
  const tail = gaps.length ? ['## Known gaps and moving rules (revisit first)', '', ...gaps, ''] : [];
  return { md: [...head, ...body, ...tail].join('\n'), due, soon, rows: b.sources.length };
}

const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const ids = only.length ? only : listCountryIds();
const dir = path.join(ROOT, 'docs', 'update-checklists');
fs.mkdirSync(dir, { recursive: true });
const summary: string[] = [];
for (const id of ids) {
  const r = checklist(id);
  fs.writeFileSync(path.join(dir, `${id}.md`), r.md, 'utf8');
  summary.push(`| [${id}](update-checklists/${id}.md) | ${r.rows} | ${r.due} | ${r.soon} |`);
  console.log(`${r.due ? '!' : '✓'} ${id}: ${r.rows} sources, ${r.due} due, ${r.soon} soon`);
}
if (!only.length) {
  fs.writeFileSync(
    path.join(ROOT, 'docs', 'UPDATE-CHECKLIST.md'),
    [
      '# Update checklist – all countries',
      '',
      `Generated ${iso(TODAY)} by \`npm run checklist\`. Open a country to see every source to re-check, what it feeds, and whether a newer edition is probably out. See [UPDATE-PLAYBOOK.md](UPDATE-PLAYBOOK.md) for the routine.`,
      '',
      '| Country | Sources | Due | Coming due |',
      '|---|---|---|---|',
      ...summary,
      '',
    ].join('\n'),
    'utf8',
  );
}
