/**
 * The Trees screen: every folio country drawn as the same kind of small skill tree, side by side,
 * so the shape of a tax system (how many separate charges, how many levels, how concentrated)
 * can be compared by eye. Details open in a dialog with a large tree and the numbers behind it.
 */
import { buildModel, type FolioModel } from '../data/model';
import { loadTreeBundle, queuedCountries, registry } from '../data/loader';
import { FAMILIES, FAMILY_LABEL, type Family } from '../data/schema';
import { HEADING_COLOR, HEADING_LABEL, HEADING_ORDER } from '../ui/charts';
import { BRANCH_COLOR, BRANCH_NAME } from '../folio/palette';
import { esc } from '../util/dom';
import { REACH, MAIN_SHARE, collectedBy, treeMetrics, type CollectedBy, type TreeMetrics } from './metrics';
import { TREE, layoutTree, type SizeMode, type TreeNode, type TreeShape } from './shape';

interface Entry {
  id: string;
  name: string;
  native: string;
  accent: string;
  partial: boolean;
  model: FolioModel;
  metrics: TreeMetrics;
  collected: CollectedBy | null;
  shapes: Record<SizeMode, TreeShape>;
}

export interface TreesHandle {
  destroy(): void;
  /** Called by the router when the hash changes while the screen is open. */
  setFocus(id?: string): void;
}

type Highlight = { kind: 'family'; value: Family } | { kind: 'branch'; value: 'national' | 'regional' | 'local' } | null;
type SortKey = 'name' | 'charges-desc' | 'charges-asc' | 'reach-asc' | 'main-desc';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'name', label: 'Name (A–Z)' },
  { key: 'charges-desc', label: 'Most charges first' },
  { key: 'charges-asc', label: 'Fewest charges first' },
  { key: 'reach-asc', label: 'Fewest charges for 80% of revenue' },
  { key: 'main-desc', label: 'Most main charges first' },
];

const pct = (x: number, digits?: number) => `${(x * 100).toFixed(digits ?? (x >= 0.1 || x === 0 ? 0 : 1))}%`;
const BRANCHES = ['national', 'regional', 'local'] as const;

/** The same ring guides in every tree: the tiers of the skill tree. */
function guides(extent: number): string {
  const rs: number[] = [TREE.levelRing];
  for (let k = 0; TREE.ring0 + k * TREE.ringStep - TREE.chargeMax <= extent; k++) rs.push(TREE.ring0 + k * TREE.ringStep);
  return rs.map((r) => `<circle class="guide" r="${r}"/>`).join('');
}

function nodeTitle(n: TreeNode): string {
  if (n.kind === 'root') return n.label;
  if (n.kind === 'level') return `${n.label} (${BRANCH_NAME[n.branch].toLowerCase()})`;
  const fam = n.family ? ` · ${FAMILY_LABEL[n.family]}` : '';
  return `${n.label}${fam} · ${n.share !== null ? `${pct(n.share, n.share >= 0.1 ? 1 : 2)} of national revenue` : 'no separate share'}`;
}

function nodeSvg(n: TreeNode, clickable: boolean): string {
  const attrs = `data-id="${esc(n.id)}" data-br="${n.branch}"${n.family ? ` data-fam="${n.family}" data-head="${n.heading}"` : ''}`;
  const title = `<title>${esc(nodeTitle(n))}</title>`;
  const cls = `tn tn-${n.kind}${n.kind === 'charge' && n.share === null ? ' tn-plain' : ''}${clickable ? ' tn-link' : ''}`;
  const core = n.kind === 'charge' && n.share !== null && n.r >= 5 ? `<circle class="tn-core" r="${(n.r * 0.34).toFixed(2)}"/>` : n.kind !== 'charge' ? `<circle class="tn-core" r="${(n.r * 0.36).toFixed(2)}"/>` : '';
  return `<g class="${cls}" ${attrs} transform="translate(${n.x.toFixed(2)} ${n.y.toFixed(2)})">${title}<circle class="tn-body" r="${n.r.toFixed(2)}"/>${core}</g>`;
}

/**
 * Labels for the large tree: the levels, then the biggest charges. Each label tries a few places
 * around its dot (outward first) and is skipped when none is free, so text never covers a dot or another label.
 */
function labelsSvg(shape: TreeShape, max: number, bound: number): string {
  const fs = 4.7;
  type Box = { x0: number; y0: number; x1: number; y1: number };
  const placed: Box[] = shape.nodes.map((n) => ({ x0: n.x - n.r - 0.5, y0: n.y - n.r - 0.5, x1: n.x + n.r + 0.5, y1: n.y + n.r + 0.5 }));
  const order = shape.nodes
    .filter((n) => n.kind !== 'root')
    .sort((a, b) => (b.kind === 'level' ? 1 : 0) - (a.kind === 'level' ? 1 : 0) || (b.share ?? -1) - (a.share ?? -1));
  const out: string[] = [];
  let shown = 0;
  for (const n of order) {
    if (n.kind === 'charge' && shown >= max) break;
    const text = n.label.length > 22 ? `${n.label.slice(0, 21)}…` : n.label;
    const w = text.length * fs * 0.54;
    const cx = Math.cos(n.angle);
    const cy = Math.sin(n.angle);
    const off = n.r + 2.2;
    type Spot = { x: number; y: number; a: 'start' | 'middle' | 'end' };
    const outward: Spot = { x: n.x + cx * off, y: n.y + cy * off + (cy > 0.4 ? fs * 0.8 : cy < -0.4 ? -1 : fs * 0.35), a: cx > 0.3 ? 'start' : cx < -0.3 ? 'end' : 'middle' };
    const spots: Spot[] = [
      ...(n.kind === 'level' ? [] : [outward]),
      { x: n.x, y: n.y + n.r + fs + 1, a: 'middle' },
      { x: n.x, y: n.y - n.r - 2, a: 'middle' },
      { x: n.x + off, y: n.y + fs * 0.35, a: 'start' },
      { x: n.x - off, y: n.y + fs * 0.35, a: 'end' },
    ];
    const boxOf = (s: Spot): Box => {
      const x0 = s.a === 'start' ? s.x : s.a === 'end' ? s.x - w : s.x - w / 2;
      return { x0: x0 - 1, y0: s.y - fs, x1: x0 + w + 1, y1: s.y + 1.2 };
    };
    const free = (b: Box) => b.x0 >= -bound && b.x1 <= bound && b.y0 >= -bound && b.y1 <= bound && !placed.some((p) => b.x0 < p.x1 && b.x1 > p.x0 && b.y0 < p.y1 && b.y1 > p.y0);
    const spot = spots.find((s) => free(boxOf(s)));
    if (!spot) continue;
    if (n.kind === 'charge') shown++;
    placed.push(boxOf(spot));
    out.push(`<text class="tl tl-${n.kind}" x="${spot.x.toFixed(1)}" y="${spot.y.toFixed(1)}" text-anchor="${spot.a}" font-size="${fs}">${esc(text)}</text>`);
  }
  return out.join('');
}

function treeSvg(e: Entry, mode: SizeMode, extent: number, opts: { labels?: number; link?: boolean } = {}): string {
  const shape = e.shapes[mode];
  const edges = shape.edges
    .map((ed) => {
      const a = shape.nodes.find((n) => n.id === ed.from)!;
      const b = shape.nodes.find((n) => n.id === ed.to)!;
      return `<line class="te" data-br="${ed.branch}" x1="${a.x.toFixed(2)}" y1="${a.y.toFixed(2)}" x2="${b.x.toFixed(2)}" y2="${b.y.toFixed(2)}"/>`;
    })
    .join('');
  const order = [...shape.nodes].sort((a, b) => a.depth - b.depth || (a.share ?? 0) - (b.share ?? 0));
  const nodes = order.map((n) => nodeSvg(n, !!opts.link)).join('');
  const s = extent;
  const labels = opts.labels ? labelsSvg(shape, opts.labels, s) : '';
  return `<svg class="tree" viewBox="${-s} ${-s} ${2 * s} ${2 * s}" style="--a:${e.accent}" focusable="false" aria-hidden="true">${guides(extent)}<g>${edges}</g><g>${nodes}</g>${labels}</svg>`;
}

function levelBar(m: TreeMetrics): string {
  return `<span class="lvl-bar" aria-hidden="true">${m.byLevel
    .filter((l) => l.charges)
    .map((l) => `<i data-br="${l.branch}" style="flex:${l.charges}" title="${esc(l.label)}: ${l.charges}"></i>`)
    .join('')}</span>`;
}

function collectedBar(c: CollectedBy): string {
  const segs: [string, number, string][] = [
    ['central', c.central, 'National government'],
    ['regional', c.regional, 'Regional governments'],
    ['local', c.local, 'Local governments'],
    ['social', c.socialSecurity, 'Social security funds'],
  ];
  return `<div class="cbar" role="img" aria-label="${segs.map(([, v, l]) => `${l} ${pct(v)}`).join(', ')}">${segs
    .filter(([, v]) => v > 0)
    .map(([k, v, l]) => `<i data-k="${k}" style="flex:${v}" title="${l}: ${pct(v)}"></i>`)
    .join('')}</div>
    <ul class="cbar-key">${segs.map(([k, v, l]) => `<li><i data-k="${k}"></i>${l} <b>${pct(v)}</b></li>`).join('')}</ul>`;
}

export async function mountTrees(root: HTMLElement, first: { focus?: string }, onFocus: (id?: string) => void): Promise<TreesHandle> {
  root.innerHTML = `<div class="trees-loading">Growing the trees…</div>`;

  const entries: Entry[] = (
    await Promise.all(
      registry.map(async (meta): Promise<Entry | null> => {
        try {
          const bundle = await loadTreeBundle(meta.id);
          const model = buildModel(bundle);
          return {
            id: meta.id,
            name: meta.names.en,
            native: meta.names.native,
            accent: meta.theme.accent,
            partial: meta.researchStatus !== 'researched',
            model,
            metrics: treeMetrics(model),
            collected: collectedBy(bundle.structure),
            shapes: { revenue: layoutTree(model, 'revenue'), equal: layoutTree(model, 'equal') },
          };
        } catch (err) {
          console.error(`Tree for ${meta.id} could not be built`, err);
          return null;
        }
      }),
    )
  ).filter((e): e is Entry => !!e);
  const byId = new Map(entries.map((e) => [e.id, e]));

  let sizeMode: SizeMode = 'revenue';
  let colorBy: 'level' | 'kind' = 'level';
  let sort: SortKey = 'name';
  let hl: Highlight = null;
  let tableSort: { key: string; dir: 1 | -1 } = { key: 'name', dir: 1 };

  const familiesPresent = FAMILIES.filter((f) => entries.some((e) => e.metrics.families.includes(f)));
  const extentOf = (mode: SizeMode) => Math.max(...entries.map((e) => e.shapes[mode].extent), 70);

  root.innerHTML = `
    <div class="trees" data-color="level" style="${HEADING_ORDER.map((h) => `--h-${h}:${HEADING_COLOR[h]}`).join(';')}">
      <header class="trees-head">
        <h1>Skill <em>Trees</em></h1>
        <p class="lead">Every country's tax system drawn as the same kind of tree, all at the same scale. The <strong>country</strong> is the centre; the <strong>levels of government</strong> sit on the first ring; every other dot is a <strong>tax, contribution or duty</strong>, placed on the branch of the government that levies it.</p>
        <details class="how-wrap"${window.innerWidth >= 720 ? ' open' : ''}>
          <summary>How to read these trees</summary>
          <ul class="how">
            <li><b>Shape = complexity of the structure.</b> A wide, dense tree has many separate charges; a small one has few. (How many separate things a reader meets, not how hard they are to comply with.)</li>
            <li><b>Dot area = share of what the whole country collects</b>, as in the folios. The biggest revenue sources sit nearest the centre. Switch to <em>every charge equal</em> to compare the count alone.</li>
            <li><b>Click a tree</b> for a large version and the numbers behind it.</li>
          </ul>
        </details>
      </header>

      <div class="trees-controls" role="group" aria-label="Display options">
        <label class="ctl"><span>Sort</span>
          <select id="tr-sort">${SORTS.map((s) => `<option value="${s.key}">${s.label}</option>`).join('')}</select></label>
        <div class="ctl"><span id="lbl-size">Dot size</span>
          <div class="seg" role="group" aria-labelledby="lbl-size">
            <button type="button" data-size="revenue" aria-pressed="true">By revenue</button>
            <button type="button" data-size="equal" aria-pressed="false">Every charge equal</button>
          </div></div>
        <div class="ctl"><span id="lbl-color">Colour</span>
          <div class="seg" role="group" aria-labelledby="lbl-color">
            <button type="button" data-color="level" aria-pressed="true">Level of government</button>
            <button type="button" data-color="kind" aria-pressed="false">Kind of tax</button>
          </div></div>
      </div>

      <div class="trees-legend" id="tr-legend"></div>

      <div class="trees-hl" role="group" aria-label="Highlight">
        <span class="hl-label">Highlight</span>
        <button type="button" class="hl-chip" data-hl="" aria-pressed="true">Nothing</button>
        ${BRANCHES.map((b) => `<button type="button" class="hl-chip" data-hl="branch:${b}" aria-pressed="false"><i style="background:${BRANCH_COLOR[b]}"></i>${b === 'national' ? 'National level' : b === 'regional' ? 'Regional level' : 'Local level'}</button>`).join('')}
        ${familiesPresent.map((f) => `<button type="button" class="hl-chip" data-hl="family:${f}" aria-pressed="false">${esc(FAMILY_LABEL[f])}</button>`).join('')}
      </div>
      <p class="hl-note muted" id="tr-hl-note" aria-live="polite"></p>

      <ul class="trees-grid" id="tr-grid"></ul>

      <section class="trees-numbers" aria-labelledby="tr-num-title">
        <h2 id="tr-num-title">The numbers behind the trees</h2>
        <p class="muted">Click a column heading to sort. All figures come from the folios (the same documented numbers that size the cores) except the last four columns, which are the OECD's harmonised split of revenue by level of government.</p>
        <div class="table-wrap"><table id="tr-table"></table></div>
      </section>

      <details class="trees-method">
        <summary>How these numbers are made, and what they cannot tell you</summary>
        <div class="method-body">
          <dl>
            <dt>Charges drawn</dt><dd>The number of taxes, social contributions, duties and levies that have a core in the country's folio. One core per separately legislated charge: the ways it is collected (withholding, assessment, import VAT) are folded into it, and very small charges are normally grouped into one "other" core per level. The rule is the same for every country, but how small a charge can be and still be drawn depends on what each country publishes: the column "Smallest charge drawn" shows it. It is a rule about what is drawn, not a legal census.</dd>
            <dt>Main charges</dt><dd>Charges that each raise at least ${pct(MAIN_SHARE)} of the national total. This count rests on revenue figures, not on how finely a folio was drawn, so it is the more robust of the two counts.</dd>
            <dt>Charges for ${pct(REACH)} of revenue</dt><dd>The smallest number of charges whose shares add up to ${pct(REACH)} of the national total: how many things you need to understand to cover most of what the state collects. Shown as n/a when the drawn charges explain less than ${pct(REACH)} (some countries do not publish their subnational taxes one by one).</dd>
            <dt>Itemised</dt><dd>The share of the national total explained by the charges that have their own amount. The rest is revenue the sources only give as a lump sum, or charges with no separate figure.</dd>
            <dt>Kinds of tax</dt><dd>How many of the ${FAMILIES.length} tax families (personal income, corporate income, social security, payroll, property, general consumption, excises, customs, resources, fees and other) appear.</dd>
            <dt>Level of government</dt><dd>The OECD Revenue Statistics split of all tax and social contributions by sub-sector of general government (national, regional, local, social security funds), one reference year for every country. The OECD attributes each tax to the level that receives it (Interpretative Guide, section A.12). It is separate from the folio sizes, which use newer national sources.</dd>
          </dl>
          <p><b>What this cannot say.</b> A tree with fewer dots is not a better tax system, and one with more dots is not necessarily harder to comply with: rates, brackets, exemptions and administration are not drawn. National sources publish different levels of detail, which is why the second count and the itemised share are shown next to the first.</p>
        </div>
      </details>

      ${
        queuedCountries.length
          ? `<section class="trees-queue" aria-labelledby="tr-q-title">
        <h2 id="tr-q-title">Next to be drawn</h2>
        <p class="muted">Countries whose harmonised OECD figures are already collected, waiting for their own folio.</p>
        <ul>${queuedCountries.map((c) => `<li>${esc(c.name)}</li>`).join('')}</ul>
      </section>`
          : ''
      }
    </div>
    <dialog class="tree-dialog" id="tr-dialog" aria-labelledby="tr-dlg-title"></dialog>`;

  const q = <T extends HTMLElement>(sel: string) => root.querySelector(sel) as T;
  const trees = q<HTMLElement>('.trees');
  const grid = q<HTMLUListElement>('#tr-grid');
  const dialog = q<HTMLDialogElement>('#tr-dialog');
  const hlNote = q<HTMLElement>('#tr-hl-note');

  /* ------------------------------------------------------------- legend */
  const renderLegend = () => {
    const items =
      colorBy === 'level'
        ? [
            ...BRANCHES.map((b) => `<li><i style="background:${BRANCH_COLOR[b]}"></i>${esc(BRANCH_NAME[b])}</li>`),
            `<li><i class="plain"></i>No separate amount (small, hollow dot)</li>`,
          ]
        : [
            ...HEADING_ORDER.map((h) => `<li><i style="background:${HEADING_COLOR[h]}"></i>${esc(HEADING_LABEL[h])}</li>`),
            `<li><i class="plain"></i>No separate amount (small, hollow dot)</li>`,
          ];
    q('#tr-legend').innerHTML = `<ul aria-label="Colour key">${items.join('')}</ul>`;
  };

  /* ------------------------------------------------------------- sorting */
  const sorted = (): Entry[] => {
    const list = [...entries];
    const num = (v: number | null, nullHigh = true) => (v === null ? (nullHigh ? Infinity : -Infinity) : v);
    const cmp: Record<SortKey, (a: Entry, b: Entry) => number> = {
      name: (a, b) => a.name.localeCompare(b.name),
      'charges-desc': (a, b) => b.metrics.charges - a.metrics.charges || a.name.localeCompare(b.name),
      'charges-asc': (a, b) => a.metrics.charges - b.metrics.charges || a.name.localeCompare(b.name),
      'reach-asc': (a, b) => num(a.metrics.toReach) - num(b.metrics.toReach) || a.name.localeCompare(b.name),
      'main-desc': (a, b) => b.metrics.main - a.metrics.main || a.name.localeCompare(b.name),
    };
    return list.sort(cmp[sort]);
  };

  /* ---------------------------------------------------------------- grid */
  const matches = (n: TreeNode): boolean => {
    if (!hl || n.kind !== 'charge') return true;
    return hl.kind === 'family' ? n.family === hl.value : n.branch === hl.value;
  };
  const renderGrid = () => {
    const extent = extentOf(sizeMode);
    grid.innerHTML = sorted()
      .map((e) => {
        const m = e.metrics;
        const reach = m.toReach !== null ? `${m.toReach}` : 'n/a';
        const label = `${e.name}: ${m.charges} charges across ${m.levels} levels${m.toReach !== null ? `; ${m.toReach} of them make up ${pct(REACH)} of revenue` : ''}. Open details.`;
        return `<li class="tcard" data-id="${esc(e.id)}" style="--a:${e.accent}">
          <button type="button" class="tcard-hit" data-open="${esc(e.id)}" aria-label="${esc(label)}">${treeSvg(e, sizeMode, extent)}</button>
          <div class="tcard-foot">
            <h3>${esc(e.name)}${e.partial ? ' <abbr class="tag" title="Part of the country’s taxes or contributions is not itemised in this folio (see its note)">partial</abbr>' : ''}</h3>
            <div class="facts">
              <div><b>${m.charges}</b><span>charges</span></div>
              <div><b>${reach}</b><span>for ${pct(REACH)} of revenue</span></div>
              <div><b>${m.levels}</b><span>levels</span></div>
            </div>
            ${levelBar(m)}
            <p class="hl-count" data-count="${esc(e.id)}"></p>
          </div>
        </li>`;
      })
      .join('');
    applyHighlight();
  };

  const applyHighlight = () => {
    grid.querySelectorAll<SVGGElement>('.tn').forEach((g) => {
      const node = g.dataset;
      let on = true;
      if (hl && g.classList.contains('tn-charge')) on = hl.kind === 'family' ? node.fam === hl.value : node.br === hl.value;
      g.classList.toggle('is-dim', !on);
    });
    trees.toggleAttribute('data-hl', !!hl);
    grid.querySelectorAll<HTMLElement>('[data-count]').forEach((p) => {
      const e = byId.get(p.dataset.count!)!;
      if (!hl) {
        p.textContent = '';
        return;
      }
      const hit = e.shapes[sizeMode].nodes.filter((n) => n.kind === 'charge' && matches(n));
      const share = hit.reduce((s, n) => s + (n.share ?? 0), 0);
      p.textContent = hit.length ? `${hit.length} ${hit.length === 1 ? 'charge' : 'charges'}${share > 0 ? ` · ${pct(share, share < 0.1 ? 1 : 0)} of revenue` : ''}` : 'none';
      p.classList.toggle('none', !hit.length);
    });
    if (!hl) hlNote.textContent = '';
    else {
      const what = hl.kind === 'family' ? FAMILY_LABEL[hl.value] : `${BRANCH_NAME[hl.value]} charges`;
      const with_ = entries.filter((e) => e.shapes[sizeMode].nodes.some((n) => n.kind === 'charge' && matches(n))).length;
      hlNote.textContent = `${what}: found in ${with_} of ${entries.length} countries. Under each tree: how many such charges it draws and the share of national revenue they raise.`;
    }
  };

  /* --------------------------------------------------------------- table */
  const COLS: { key: string; label: string; get: (e: Entry) => number | string | null; fmt: (v: number | string | null) => string }[] = [
    { key: 'name', label: 'Country', get: (e) => e.name, fmt: (v) => String(v) },
    { key: 'charges', label: 'Charges drawn', get: (e) => e.metrics.charges, fmt: (v) => String(v) },
    { key: 'main', label: `Main charges (≥ ${pct(MAIN_SHARE)})`, get: (e) => e.metrics.main, fmt: (v) => String(v) },
    { key: 'reach', label: `For ${pct(REACH)} of revenue`, get: (e) => e.metrics.toReach, fmt: (v) => (v === null ? 'n/a' : String(v)) },
    { key: 'top', label: 'Largest charge', get: (e) => e.metrics.topShare, fmt: (v) => (v === null ? 'n/a' : pct(v as number)) },
    { key: 'smallest', label: 'Smallest charge drawn', get: (e) => e.metrics.smallest, fmt: (v) => (v === null ? 'n/a' : pct(v as number, 2)) },
    { key: 'itemised', label: 'Itemised', get: (e) => e.metrics.coverage, fmt: (v) => pct(v as number) },
    { key: 'levels', label: 'Levels', get: (e) => e.metrics.levels, fmt: (v) => String(v) },
    { key: 'kinds', label: 'Kinds of tax', get: (e) => e.metrics.families.length, fmt: (v) => `${v} of ${FAMILIES.length}` },
    { key: 'cen', label: 'OECD level: national', get: (e) => e.collected?.central ?? null, fmt: (v) => (v === null ? 'n/a' : pct(v as number)) },
    { key: 'reg', label: 'regional', get: (e) => e.collected?.regional ?? null, fmt: (v) => (v === null ? 'n/a' : pct(v as number)) },
    { key: 'loc', label: 'local', get: (e) => e.collected?.local ?? null, fmt: (v) => (v === null ? 'n/a' : pct(v as number)) },
    { key: 'soc', label: 'social security funds', get: (e) => e.collected?.socialSecurity ?? null, fmt: (v) => (v === null ? 'n/a' : pct(v as number)) },
  ];
  const renderTable = () => {
    const col = COLS.find((c) => c.key === tableSort.key)!;
    const rows = [...entries].sort((a, b) => {
      const va = col.get(a);
      const vb = col.get(b);
      if (va === null && vb === null) return 0;
      if (va === null) return 1;
      if (vb === null) return -1;
      const r = typeof va === 'string' ? va.localeCompare(vb as string) : (va as number) - (vb as number);
      return r * tableSort.dir || a.name.localeCompare(b.name);
    });
    q('#tr-table').innerHTML = `<thead><tr>${COLS.map((c) => {
      const on = c.key === tableSort.key;
      return `<th scope="col" ${on ? `aria-sort="${tableSort.dir === 1 ? 'ascending' : 'descending'}"` : ''}><button type="button" data-sort="${c.key}">${esc(c.label)}${on ? (tableSort.dir === 1 ? ' ▲' : ' ▼') : ''}</button></th>`;
    }).join('')}</tr></thead>
    <tbody>${rows
      .map((e) => `<tr><th scope="row"><button type="button" class="link" data-open="${esc(e.id)}">${esc(e.name)}</button>${e.partial ? ' <abbr class="tag" title="Partial folio: part of the taxes or contributions is not itemised">partial</abbr>' : ''}</th>${COLS.slice(1).map((c) => `<td>${esc(c.fmt(c.get(e)))}</td>`).join('')}</tr>`)
      .join('')}</tbody>`;
  };

  /* -------------------------------------------------------------- dialog */
  const renderDialog = (id: string) => {
    const e = byId.get(id);
    if (!e) return;
    const m = e.metrics;
    const shape = e.shapes[sizeMode];
    const ext = shape.extent + 14;
    const charges = e.model.nodes;
    const ranked = [...charges.values()]
      .filter((n) => n.kind === 'instrument' && n.radiusSource === 'revenue')
      .sort((a, b) => b.revenue!.nationalShare! - a.revenue!.nationalShare!)
      .slice(0, 10);
    const maxShare = ranked[0]?.revenue!.nationalShare ?? 1;
    const unsized = [...charges.values()].filter((n) => n.kind === 'instrument' && n.radiusSource !== 'revenue');
    dialog.innerHTML = `
      <form method="dialog" class="dlg-close"><button class="btn" aria-label="Close">Close</button></form>
      <div class="dlg-grid">
        <div class="dlg-tree">${treeSvg(e, sizeMode, ext, { labels: 14, link: true })}</div>
        <div class="dlg-info">
          <h2 id="tr-dlg-title">${esc(e.name)}${e.native !== e.name ? ` <small>${esc(e.native)}</small>` : ''}</h2>
          <p class="dlg-sum">${esc(e.model.bundle.meta.summary)}</p>
          <dl class="dlg-facts">
            <div><dt>Charges drawn</dt><dd><b>${m.charges}</b> <span>${m.byLevel.map((l) => `<i class="dot" data-br="${l.branch}"></i>${l.charges} ${esc(l.label)}`).join(' · ')}</span></dd></div>
            <div><dt>Main charges (≥ ${pct(MAIN_SHARE)} each)</dt><dd><b>${m.main}</b></dd></div>
            <div><dt>Charges for ${pct(REACH)} of revenue</dt><dd>${m.toReach !== null ? `<b>${m.toReach}</b>` : `<b>n/a</b> <span>the itemised charges explain only ${pct(m.coverage)}</span>`}</dd></div>
            <div><dt>Itemised</dt><dd><b>${pct(m.coverage)}</b> <span>of national revenue has a charge of its own</span></dd></div>
            <div><dt>Kinds of tax</dt><dd><b>${m.families.length}</b> <span>of ${FAMILIES.length} families</span></dd></div>
            <div><dt>Tiers</dt><dd><b>${m.depth}</b> <span>${m.nested ? `${m.nested} ${m.nested === 1 ? 'charge hangs' : 'charges hang'} from another charge (a surcharge or a share)` : 'country → level → charge'}</span></dd></div>
          </dl>
          ${e.collected ? `<h3>By level of government (OECD ${e.collected.year}${e.collected.fromShares ? ', shares' : ''})</h3>${collectedBar(e.collected)}` : ''}
          <h3>Biggest charges</h3>
          <ol class="rank">${ranked
            .map(
              (n) =>
                `<li><span class="rk-name"><i class="dot" data-br="${n.branch}"></i>${esc(n.instrument!.names.common)}</span><span class="rk-bar"><i style="width:${((n.revenue!.nationalShare! / maxShare) * 100).toFixed(1)}%"></i></span><span class="rk-val">${pct(n.revenue!.nationalShare!, n.revenue!.nationalShare! >= 0.1 ? 1 : 2)}</span></li>`,
            )
            .join('')}</ol>
          ${unsized.length ? `<p class="muted">${unsized.length} further ${unsized.length === 1 ? 'charge is' : 'charges are'} drawn without a share of their own (no separate figure, or outside the tax total).</p>` : ''}
          ${e.partial ? `<p class="muted"><b>Partial folio.</b> Part of the country’s taxes or contributions is not itemised (the folio’s note says which), so the counts are lower bounds and “itemised” is measured against what the folio does include.</p>` : ''}
          <p class="dlg-actions"><a class="btn primary" href="#/${esc(e.id)}">Open the ${esc(e.name)} folio →</a></p>
        </div>
      </div>`;
  };

  let currentFocus: string | undefined;
  let destroyed = false;
  const focusOpen = (id: string) => {
    if (!byId.has(id)) return;
    currentFocus = id;
    renderDialog(id);
    if (!dialog.open) dialog.showModal();
    onFocus(id);
  };
  let leavingForFolio = false;
  dialog.addEventListener('close', () => {
    if (!destroyed && !leavingForFolio) onFocus(undefined);
  });
  dialog.addEventListener('click', (ev) => {
    if (ev.target === dialog) {
      dialog.close();
      return;
    }
    // A node in the large tree opens that charge (or level) in the country's folio.
    const g = (ev.target as Element).closest<SVGGElement>('.tn-link');
    if (g?.dataset.id && currentFocus) {
      const target = g.classList.contains('tn-root') ? `#/${currentFocus}` : `#/${currentFocus}/${g.dataset.id}`;
      leavingForFolio = true;
      dialog.close();
      location.hash = target;
    }
  });

  /* -------------------------------------------------------------- events */
  const onClick = (ev: Event) => {
    const t = ev.target as Element;
    const open = t.closest<HTMLElement>('[data-open]');
    if (open) return focusOpen(open.dataset.open!);
    const size = t.closest<HTMLElement>('[data-size]');
    if (size) {
      sizeMode = size.dataset.size as SizeMode;
      root.querySelectorAll<HTMLElement>('[data-size]').forEach((b) => b.setAttribute('aria-pressed', String(b === size)));
      renderGrid();
      return;
    }
    const color = t.closest<HTMLElement>('[data-color]');
    if (color && color.tagName === 'BUTTON') {
      colorBy = color.dataset.color as 'level' | 'kind';
      trees.dataset.color = colorBy;
      root.querySelectorAll<HTMLElement>('button[data-color]').forEach((b) => b.setAttribute('aria-pressed', String(b === color)));
      renderLegend();
      return;
    }
    const chip = t.closest<HTMLElement>('[data-hl]');
    if (chip && chip.tagName === 'BUTTON') {
      const v = chip.dataset.hl!;
      const [kind, value] = v.split(':');
      const next: Highlight = v ? ({ kind, value } as Highlight) : null;
      hl = hl && next && hl.kind === next.kind && hl.value === next.value ? null : next;
      const key = hl ? `${hl.kind}:${hl.value}` : '';
      root.querySelectorAll<HTMLElement>('.hl-chip').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.hl === key)));
      applyHighlight();
      return;
    }
    const th = t.closest<HTMLElement>('[data-sort]');
    if (th) {
      const key = th.dataset.sort!;
      tableSort = { key, dir: tableSort.key === key ? ((tableSort.dir * -1) as 1 | -1) : key === 'name' ? 1 : -1 };
      renderTable();
    }
  };
  root.addEventListener('click', onClick);
  q<HTMLSelectElement>('#tr-sort').addEventListener('change', (ev) => {
    sort = (ev.target as HTMLSelectElement).value as SortKey;
    renderGrid();
  });

  renderLegend();
  renderGrid();
  renderTable();
  if (first.focus) focusOpen(first.focus);

  return {
    destroy() {
      destroyed = true;
      root.removeEventListener('click', onClick);
      if (dialog.open) dialog.close();
      root.innerHTML = '';
    },
    setFocus(id) {
      if (id) focusOpen(id);
      else if (dialog.open) {
        dialog.close();
      }
    },
  };
}
