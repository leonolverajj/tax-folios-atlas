/**
 * Charts for the detail panel. Plain HTML/CSS (no chart library): bars are `div`s, so text
 * stays crisp, the panel stays keyboard-navigable, and every chart carries a data table.
 *
 * Every figure is derived from the folio model, i.e. from the same documented numbers that size
 * the cores; nothing here has data of its own.
 */
import { FAMILY_LABEL, FAMILY_TO_HEADING, type OecdHeading } from '../data/schema';
import { toBase, type FolioModel, type FolioNode } from '../data/model';
import { formatMoney, formatShare } from '../data/format';
import { esc } from '../util/dom';
import { BRANCH_COLOR } from '../folio/palette';

/** Categorical colours for the six OECD headings (fixed order; validated on the panel surface). */
export const HEADING_COLOR: Record<OecdHeading, string> = {
  income: '#3987e5',
  goodsServices: '#199e70',
  socialSecurity: '#d95926',
  property: '#c98500',
  payroll: '#d55181',
  other: '#008300',
};
export const HEADING_LABEL: Record<OecdHeading, string> = {
  income: 'Income and profits',
  socialSecurity: 'Social security',
  payroll: 'Payroll',
  property: 'Property',
  goodsServices: 'Goods and services',
  other: 'Other',
};
/** Order in which headings are stacked (largest headings first in most countries). */
export const HEADING_ORDER: OecdHeading[] = ['income', 'socialSecurity', 'goodsServices', 'property', 'payroll', 'other'];
export const NOT_ITEMISED = '#3a4670';

export interface Segment {
  label: string;
  /** 0..1 of the whole bar */
  part: number;
  color: string;
  detail?: string;
  hatch?: boolean;
}

/* ------------------------------------------------------------------ pieces */
function table(headers: string[], rows: string[][], caption: string): string {
  return `<details class="chart-data"><summary>Show as a table</summary>
    <table><caption class="sr-only">${esc(caption)}</caption>
      <thead><tr>${headers.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead>
      <tbody>${rows.map((r) => `<tr>${r.map((c, i) => (i === 0 ? `<th scope="row">${esc(c)}</th>` : `<td>${esc(c)}</td>`)).join('')}</tr>`).join('')}</tbody>
    </table></details>`;
}

/** White or near-black ink, whichever reads better on a fill (labels inside colours are the one place text meets a series colour). */
function inkOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const L = 0.2126 * lin((n >> 16) & 255) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  // contrast of white = 1.05 / (L + 0.05); of dark ink (#061020, L~0.005) = (L + 0.05) / 0.055
  return 1.05 / (L + 0.05) >= (L + 0.05) / 0.055 ? '#ffffff' : '#061020';
}

/** One stacked bar (parts add up to 1) with a legend that carries the identity of every colour. */
export function stackedBar(title: string, subtitle: string, segments: Segment[], aria: string): string {
  const segs = segments.filter((s) => s.part > 0.0005);
  const bar = segs
    .map((s) => {
      const pct = s.part * 100;
      const tip = `${s.label}: ${formatShare(s.part)}${s.detail ? ` · ${s.detail}` : ''}`;
      return `<i class="seg${s.hatch ? ' seg-hatch' : ''}" style="flex:${pct.toFixed(3)} 1 0;--seg:${s.color}" title="${esc(tip)}">${pct >= 11 ? `<b style="color:${inkOn(s.color)}">${esc(pct.toFixed(0))}%</b>` : ''}</i>`;
    })
    .join('');
  const legend = segs
    .map(
      (s) =>
        `<li><span class="sw${s.hatch ? ' sw-hatch' : ''}" style="--seg:${s.color}" aria-hidden="true"></span><span class="lg-name">${esc(s.label)}</span><span class="lg-val">${esc(formatShare(s.part))}</span></li>`,
    )
    .join('');
  return `<figure class="chart chart-stack">
    <figcaption><h4>${esc(title)}</h4>${subtitle ? `<p class="muted">${esc(subtitle)}</p>` : ''}</figcaption>
    <div class="stack" role="img" aria-label="${esc(aria)}">${bar}</div>
    <ul class="chart-legend">${legend}</ul>
    ${table(['Part', 'Share'], segs.map((s) => [s.label, formatShare(s.part) + (s.detail ? ` (${s.detail})` : '')]), title)}
  </figure>`;
}

export interface Bar {
  id?: string;
  label: string;
  sublabel?: string;
  /** 0..1 share that sets the bar length relative to `max` */
  value: number;
  color: string;
  detail?: string;
  selected?: boolean;
}

/** Horizontal bars, one per row; the bar length is relative to `max` (a constant for the whole country). */
export function rankedBars(title: string, subtitle: string, bars: Bar[], max: number, aria: string): string {
  const rows = bars
    .map((b) => {
      const w = Math.max(0.6, Math.min(100, (b.value / max) * 100));
      const inner = `<span class="rk-label"><span>${esc(b.label)}</span>${b.sublabel ? `<small>${esc(b.sublabel)}</small>` : ''}</span>
        <span class="rk-track" aria-hidden="true"><i style="width:${w.toFixed(2)}%;--seg:${b.color}"></i></span>
        <span class="rk-val">${esc(formatShare(b.value))}</span>`;
      const tip = `${b.label}: ${formatShare(b.value)}${b.detail ? ` · ${b.detail}` : ''}`;
      return `<li class="rk-row${b.selected ? ' is-selected' : ''}">${
        b.id && !b.selected
          ? `<button type="button" data-goto="${esc(b.id)}" title="${esc(tip)}">${inner}</button>`
          : `<div class="rk-static" title="${esc(tip)}"${b.selected ? ' aria-current="true"' : ''}>${inner}</div>`
      }</li>`;
    })
    .join('');
  return `<figure class="chart chart-rank">
    <figcaption><h4>${esc(title)}</h4>${subtitle ? `<p class="muted">${esc(subtitle)}</p>` : ''}</figcaption>
    <ol class="rank" aria-label="${esc(aria)}">${rows}</ol>
    ${table(['Source', 'Share', 'Amount'], bars.map((b) => [b.label, formatShare(b.value), b.detail ?? '']), title)}
  </figure>`;
}

/** Same hues as the folio's branches; social security funds get their own green. */
export const LEVEL_KEY_COLOR: Record<'central' | 'regional' | 'local' | 'social-security', string> = {
  central: BRANCH_COLOR.national,
  regional: BRANCH_COLOR.regional,
  local: BRANCH_COLOR.local,
  'social-security': '#58e0a8',
};

/* --------------------------------------------------------------- model glue */
const sizedInstruments = (model: FolioModel) =>
  [...model.nodes.values()].filter((n) => n.kind === 'instrument' && n.revenue?.nationalShare !== undefined);

const barOf = (n: FolioNode, selectedId?: string): Bar => ({
  id: n.id,
  label: n.instrument?.names.common ?? n.label,
  value: n.revenue!.nationalShare!,
  color: BRANCH_COLOR[n.branch],
  detail: formatMoney(n.revenue!.observation.amount, n.revenue!.observation.scale, n.revenue!.observation.currency),
  selected: n.id === selectedId,
});

/** Stacked composition of a set of sized cores by OECD heading, remainder shown as "not itemised". */
function headingSegments(nodes: FolioNode[], wholeBase: number, remainderLabel: string): Segment[] {
  const byHeading = new Map<OecdHeading, number>();
  let used = 0;
  for (const n of nodes) {
    const fam = n.instrument?.family;
    if (!fam) continue;
    const h = FAMILY_TO_HEADING[fam];
    const amount = n.revenue!.amountBase;
    byHeading.set(h, (byHeading.get(h) ?? 0) + amount);
    used += amount;
  }
  const segs: Segment[] = HEADING_ORDER.filter((h) => byHeading.has(h)).map((h) => ({
    label: HEADING_LABEL[h],
    part: byHeading.get(h)! / wholeBase,
    color: HEADING_COLOR[h],
  }));
  const rest = 1 - used / wholeBase;
  if (rest > 0.0005) segs.push({ label: remainderLabel, part: rest, color: NOT_ITEMISED, hatch: true });
  return segs;
}

/* ------------------------------------------------------------------- panels */
export function countryCharts(model: FolioModel): string {
  const nat = model.sizing.national;
  const st = model.bundle.structure;
  const sized = sizedInstruments(model);
  const top = [...sized].sort((a, b) => b.revenue!.nationalShare! - a.revenue!.nationalShare!).slice(0, 10);
  let who = '';
  if (st) {
    // Harmonised OECD split, comparable across countries; colours follow the level of government.
    const raw = st.levels.map((l) => (l.total !== undefined ? l.total : (l.share ?? 0)));
    const whole = raw.reduce((a, b) => a + b, 0);
    const segs: Segment[] = st.levels.map((l, i) => ({
      label: l.label,
      part: raw[i] / whole,
      color: LEVEL_KEY_COLOR[l.key],
      detail: l.total !== undefined ? formatMoney(l.total, st.scale, st.currency) : undefined,
    }));
    who = stackedBar(
      'Who collects it',
      `Share of all tax and social-contribution revenue by collecting government, ${st.referenceYear} (OECD Revenue Statistics). Social security funds are shown apart from the government levels.`,
      segs,
      `Who collects the country's tax revenue: ${segs.map((s) => `${s.label} ${formatShare(s.part)}`).join('; ')}`,
    );
  }
  return [
    who,
    stackedBar(
      'What is taxed',
      'The itemised cores grouped by OECD tax heading, as a share of the national total. Hatched = revenue that has no core of its own.',
      headingSegments(sized, nat.amountBase, 'Not itemised as a core'),
      'Composition of the national total by tax heading',
    ),
    rankedBars('Biggest revenue sources', 'Top 10 cores by share of the national total.', top.map((n) => barOf(n)), model.sizing.maxShare, 'Ranking of the ten largest revenue sources'),
  ].join('');
}

export function levelCharts(model: FolioModel, level: FolioNode): string {
  const nat = model.sizing.national;
  const items = level.childIds.map((c) => model.nodes.get(c)!).filter((n) => n.revenue?.nationalShare !== undefined);
  if (!items.length) return '';
  const own = nat.components.filter((c) => c.levelIds.includes(level.id));
  const ownBase = own.reduce((s, c) => s + toBase(c.amount, c.scale), 0);
  const ranked = [...items].sort((a, b) => b.revenue!.nationalShare! - a.revenue!.nationalShare!);
  const out: string[] = [
    rankedBars(
      `Revenue sources of this level`,
      'Share of the national total, on the same scale as the other charts.',
      ranked.map((n) => barOf(n)),
      model.sizing.maxShare,
      'Ranking of this level’s revenue sources',
    ),
  ];
  if (ownBase > 0) {
    out.push(
      stackedBar(
        'What this level taxes',
        "The level's itemised cores by OECD tax heading, as a share of its own tax and contribution revenue.",
        headingSegments(items, ownBase, 'Not itemised as a core'),
        'Composition of this level’s revenue by tax heading',
      ),
    );
  }
  return out.join('');
}

export function instrumentCharts(model: FolioModel, n: FolioNode): string {
  if (n.revenue?.nationalShare === undefined) return '';
  const sized = sizedInstruments(model).sort((a, b) => b.revenue!.nationalShare! - a.revenue!.nationalShare!);
  const rank = sized.findIndex((x) => x.id === n.id);
  // show the top 6 and the selected core (with its neighbours) so its position is visible
  const picked = new Set<string>(sized.slice(0, 6).map((x) => x.id));
  if (rank >= 0) [rank - 1, rank, rank + 1].forEach((i) => sized[i] && picked.add(sized[i].id));
  const bars = sized.filter((x) => picked.has(x.id)).map((x) => barOf(x, n.id));
  const fam = n.instrument ? FAMILY_LABEL[n.instrument.family] : '';
  return rankedBars(
    `Where it ranks among ${sized.length} revenue sources`,
    `#${rank + 1} of ${sized.length}${fam ? ` · family: ${fam}` : ''}. Bars use the same scale for the whole country.`,
    bars,
    model.sizing.maxShare,
    'Ranking of this core among the country’s revenue sources',
  );
}
