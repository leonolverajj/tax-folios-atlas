/**
 * The right-hand detail panel. It only reads from the model, so anything shown
 * here is derived from the same documented data that sizes and labels the cores.
 */
import { FLOOR_SHARE, pathTo, toBase, type FolioModel, type FolioNode } from '../data/model';
import { CATEGORY_HELP, CATEGORY_LABEL, STATUS_LABEL, formatDate, formatMoney, formatPeriod, formatPublished, formatShare } from '../data/format';
import type { LegalRef, Source } from '../data/schema';
import { esc } from '../util/dom';
import { CATEGORY_SHAPE_NAME } from '../folio/glyphs';
import { countryCharts, instrumentCharts, levelCharts as levelChartsHtml } from './charts';
import { BRANCH_COLOR } from '../folio/palette';

const COVERAGE_TEXT: Record<string, string> = {
  exact: 'Same scope as this core',
  broader: 'Source category is broader than this core',
  subset: 'Source category is narrower than this core',
};

export class DetailPanel {
  private model!: FolioModel;
  private sources = new Map<string, Source>();

  constructor(private root: HTMLElement, private onNavigate: (id: string) => void) {
    root.addEventListener('click', (ev) => {
      const btn = (ev.target as Element).closest('[data-goto]') as HTMLElement | null;
      if (btn) this.onNavigate(btn.dataset.goto!);
    });
  }

  setModel(model: FolioModel) {
    this.model = model;
    this.sources = new Map(model.bundle.sources.map((s) => [s.id, s]));
  }

  render(id: string) {
    const n = this.model.nodes.get(id)!;
    const html = n.kind === 'country' ? this.country() : n.kind === 'level' ? this.level(n) : this.instrument(n);
    this.root.innerHTML = html;
    this.root.scrollTop = 0;
    this.root.style.setProperty('--branch', BRANCH_COLOR[n.branch]);
  }

  /* ------------------------------------------------------------ pieces */
  private levelCharts(n: FolioNode): string {
    return levelChartsHtml(this.model, n);
  }

  private crumbs(n: FolioNode): string {
    const ids = pathTo(this.model, n.id);
    return `<nav class="crumbs" aria-label="Position in the hierarchy"><ol>${ids
      .map((pid, i) => {
        const pn = this.model.nodes.get(pid)!;
        const label = pn.kind === 'country' ? pn.label : pn.label;
        return i === ids.length - 1
          ? `<li aria-current="location">${esc(label)}</li>`
          : `<li><button type="button" data-goto="${esc(pid)}">${esc(label)}</button></li>`;
      })
      .join('')}</ol></nav>`;
  }

  private refLinks(refs: LegalRef[]): string {
    return `<ul class="source-list">${refs
      .map((r) => {
        const s = this.sources.get(r.sourceId);
        if (!s) return '';
        return `<li>
          <a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}<span class="ext" aria-hidden="true"> ↗</span><span class="sr-only"> (opens in a new tab)</span></a>
          <span class="src-meta">${esc(s.org)}${r.locator ? ` · <em>${esc(r.locator)}</em>` : ''}${s.publishedDate ? ` · published ${esc(formatDate(s.publishedDate))}` : ''} · accessed ${esc(formatDate(s.accessed))}</span>
          ${r.note ? `<span class="src-note">${esc(r.note)}</span>` : ''}
        </li>`;
      })
      .join('')}</ul>`;
  }

  /* ------------------------------------------------------------ country */
  private country(): string {
    const m = this.model.bundle.meta;
    const nat = this.model.sizing.national;
    const sized = [...this.model.nodes.values()].filter((x) => x.radiusSource === 'revenue');
    const gaps = [...this.model.nodes.values()].filter((x) => x.kind === 'instrument' && !x.revenue);
    const components = nat.components
      .map((c) => {
        const s = this.sources.get(c.sourceId);
        const part = toBase(c.amount, c.scale) / nat.amountBase;
        return `<li><strong>${esc(c.label)}</strong><small>${esc(formatMoney(c.amount, c.scale, c.currency))} · ${esc(formatPeriod(c.period))} · <b>${esc(formatShare(part))}</b> of the national total${c.aggregateOnly ? ' · amount only (its taxes are not drawn as cores)' : ''}${
          s ? ` · <a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.org)}<span class="ext" aria-hidden="true"> ↗</span><span class="sr-only"> (opens in a new tab)</span></a>` : ''
        }</small>${c.caveat ? `<small class="caveat-inline">${esc(c.caveat)}</small>` : ''}</li>`;
      })
      .join('');
    return `<article class="detail kind-country" aria-labelledby="detail-title">
      <header>
        <div class="chips"><span class="chip chip-branch">Country</span><span class="chip">${esc(m.currency.code)}</span>${
          m.researchStatus !== 'researched' ? `<span class="chip chip-warn">Research: ${esc(m.researchStatus)}</span>` : ''
        }</div>
        <h2 id="detail-title" tabindex="-1">${esc(m.names.en)}</h2>
        ${m.names.native !== m.names.en ? `<p class="official" lang="${esc(m.names.nativeLang)}">${esc(m.names.native)}</p>` : ''}
      </header>
      <section class="sec"><h3>How the fiscal system is organised</h3><p>${esc(m.summary)}</p>${m.structureNote ? `<p class="muted">${esc(m.structureNote)}</p>` : ''}</section>
      <section class="sec"><h3>Levels of government</h3>
        <ul class="linklist">${m.levels
          .map((l) => {
            const ln = this.model.nodes.get(l.id)!;
            const count = ln.childIds.length;
            return `<li><button type="button" data-goto="${esc(l.id)}" class="level-btn" style="--c:${BRANCH_COLOR[l.branch]}"><span class="dot"></span><span><strong>${esc(l.names.common)}</strong><small>${esc(l.names.official)} · ${count} direct ${count === 1 ? 'instrument' : 'instruments'}</small></span></button></li>`;
          })
          .join('')}</ul>
      </section>
      <section class="sec"><h3>Core sizes &amp; the national total</h3>
        <p>Every tax core is drawn with an <strong>area proportional to its share</strong> of <strong>${esc(nat.label)}</strong> (${esc(formatMoney(nat.amountBase, 'units', nat.currency))}). The biggest orbs are therefore the biggest revenue sources of the whole country, across all levels of government.</p>
        <p class="muted">${esc(nat.definition)}</p>
        <ul class="components">${components}</ul>
        <p class="muted">${nat.periodSpreadMonths === 0 ? 'All parts refer to the same period.' : `The parts refer to periods that end up to ${nat.periodSpreadMonths} months apart: each level uses the latest figures its source publishes, so shares are approximate to that extent.`}</p>
        <p class="muted">${sized.length} of ${[...this.model.nodes.values()].filter((x) => x.kind === 'instrument').length} instruments are revenue-sized. ${gaps.length ? `${gaps.length} have no tax-specific amount, or are not part of the national total (for example fees and royalties); they use a small neutral size.` : ''}</p>
      </section>
      <section class="sec charts"><h3>Charts</h3>${countryCharts(this.model)}</section>
      <section class="sec"><h3>Background art</h3><p class="muted">${esc(m.theme.motifNote)}</p></section>
    </article>`;
  }

  /* -------------------------------------------------------------- level */
  private level(n: FolioNode): string {
    const lvl = n.level!;
    const items = n.childIds.map((c) => this.model.nodes.get(c)!);
    const sized = items.filter((i) => i.radiusSource === 'revenue');
    const totalShare = sized.reduce((s, i) => s + (i.revenue!.nationalShare ?? 0), 0);
    const own = this.model.sizing.national.components.filter((c) => c.levelIds.includes(n.id));
    const ownBase = own.reduce((s, c) => s + toBase(c.amount, c.scale), 0);
    const ownWeight = ownBase / this.model.sizing.national.amountBase;
    const charts = this.levelCharts(n);
    return `<article class="detail kind-level" aria-labelledby="detail-title">
      <header>
        ${this.crumbs(n)}
        <div class="chips"><span class="chip chip-branch">${esc(({ national: 'National level', regional: 'Regional level', local: 'Local level' } as Record<string, string>)[n.branch])}</span></div>
        <h2 id="detail-title" tabindex="-1">${esc(lvl.names.common)}</h2>
        <p class="official">${esc(lvl.names.official)}</p>
        ${lvl.names.native ? `<p class="native">${esc(lvl.names.native)}</p>` : ''}
      </header>
      <section class="sec"><h3>What this level is</h3><p>${esc(lvl.description)}</p></section>
      <section class="sec"><h3>How it raises revenue</h3><p>${esc(lvl.fiscalPower)}</p></section>
      <section class="sec"><h3>Taxes and instruments (${items.length})</h3>
        <ul class="linklist">${items
          .map(
            (i) => `<li><button type="button" data-goto="${esc(i.id)}" class="level-btn" style="--c:${BRANCH_COLOR[i.branch]}"><span class="dot"></span><span><strong>${esc(i.instrument!.names.common)}</strong><small>${esc(CATEGORY_LABEL[i.category!])}${
              i.revenue?.nationalShare !== undefined ? ` · ${esc(formatShare(i.revenue.nationalShare))} of national total` : ''
            }${i.status && i.status !== 'current' ? ` · ${esc(STATUS_LABEL[i.status])}` : ''}</small></span></button></li>`,
          )
          .join('')}</ul>
        ${
          sized.length
            ? `<p class="muted">Revenue-sized cores at this level add up to ${esc(formatShare(totalShare))} of the national total.${
                own.length ? ` This level's own tax and contribution revenue is ${esc(formatMoney(ownBase, 'units', own[0].currency))} (${esc(formatShare(ownWeight))} of the national total); the difference is revenue that has no core of its own.` : ''
              }</p>`
            : ''
        }
      </section>
      ${charts ? `<section class="sec charts"><h3>Charts</h3>${charts}</section>` : ''}
      <section class="sec"><h3>Legal basis</h3>${this.refLinks(lvl.legalRefs)}</section>
      <footer class="foot">Checked ${esc(formatDate(lvl.checkedOn))}</footer>
    </article>`;
  }

  /* --------------------------------------------------------- instrument */
  private revenueBlock(n: FolioNode): string {
    if (!n.revenue) {
      return `<section class="sec revenue"><h3>Revenue</h3>
        <p class="no-data">No tax-specific amount is shown for this core.</p>
        ${n.unavailableReason ? `<p class="muted">${esc(n.unavailableReason)}</p>` : ''}
        <p class="muted">Its core uses the neutral size and a dotted inner ring.</p></section>`;
    }
    const o = n.revenue.observation;
    const d = n.revenue.denominator;
    const share = n.revenue.share;
    const nat = n.revenue.nationalShare;
    const natTotal = this.model.sizing.national;
    const src = this.sources.get(o.sourceId);
    const sizing = n.radiusSource === 'revenue';
    const hasDen = !!d && share !== undefined;
    return `<section class="sec revenue"><h3>Most recent reliable revenue${sizing ? '' : ' (informational)'}</h3>
      <p class="rev-amount">${esc(formatMoney(o.amount, o.scale, o.currency))}</p>
      ${
        nat !== undefined
          ? `<p class="rev-share"><strong>${esc(formatShare(nat))}</strong> of the national total <span class="muted">(${esc(natTotal.label)})</span></p>
             <div class="bar" role="img" aria-label="${esc(formatShare(nat))} of the national total"><i style="width:${Math.min(100, nat * 100).toFixed(2)}%"></i></div>`
          : ''
      }
      ${
        hasDen
          ? `<p class="${nat !== undefined ? 'muted ' : 'rev-share '}level-share">${nat !== undefined ? '' : '<strong>'}${esc(formatShare(share!))}${nat !== undefined ? '' : '</strong>'} of ${esc(d!.label)}${nat !== undefined ? ' (this level alone)' : ''}</p>`
          : `<p class="muted">No share is shown: this amount lies outside the revenue totals used in this folio.</p>`
      }
      <dl class="rev-meta">
        <dt>Period</dt><dd>${esc(formatPeriod(o.period))}</dd>
        <dt>As published</dt><dd>${esc(formatPublished(o.amount, o.scale, o.currency))}</dd>
        <dt>Basis</dt><dd>${esc(o.basis)}</dd>
        ${hasDen ? `<dt>Share of</dt><dd>${esc(d!.label)} – ${esc(formatMoney(d!.amount, d!.scale, d!.currency))}. ${esc(d!.definition)}</dd>` : ''}
        <dt>Coverage</dt><dd><span class="badge badge-${esc(o.coverage)}">${esc(COVERAGE_TEXT[o.coverage])}</span>${o.coverageNote ? ` ${esc(o.coverageNote)}` : ''}</dd>
        <dt>Line used</dt><dd>${esc(o.locator)}</dd>
        ${o.calculation ? `<dt>Calculation</dt><dd>${esc(o.calculation)}</dd>` : ''}
        ${src ? `<dt>Source</dt><dd><a href="${esc(src.url)}" target="_blank" rel="noopener noreferrer">${esc(src.title)}<span class="ext" aria-hidden="true"> ↗</span><span class="sr-only"> (opens in a new tab)</span></a><br><span class="src-meta">${esc(src.org)}${src.publishedDate ? ` · published ${esc(formatDate(src.publishedDate))}` : ''} · accessed ${esc(formatDate(o.accessed))}</span></dd>` : ''}
      </dl>
      ${o.caveat ? `<p class="caveat"><strong>Caveat.</strong> ${esc(o.caveat)}</p>` : ''}
      <p class="muted size-note">${
        sizing
          ? `Core area is proportional to this share of the national total, computed from the figures shown here (cores under ${esc(formatShare(FLOOR_SHARE))} are drawn at the minimum size so they stay visible).`
          : `This amount does not size the core: it is not part of the national total, so the core keeps the small neutral size.`
      }</p>
    </section>`;
  }

  private instrument(n: FolioNode): string {
    const ins = n.instrument!;
    const lvl = this.model.nodes.get(n.levelId!)!;
    const statusBanner =
      ins.status !== 'current'
        ? `<div class="banner banner-${esc(ins.status)}" role="note"><strong>${esc(STATUS_LABEL[ins.status])}.</strong> ${esc(ins.statusNote ?? '')}</div>`
        : ins.statusNote
          ? `<div class="banner banner-scheduled" role="note"><strong>Note.</strong> ${esc(ins.statusNote)}</div>`
          : '';
    const children = n.childIds.map((c) => this.model.nodes.get(c)!);
    return `<article class="detail kind-instrument" aria-labelledby="detail-title">
      <header>
        ${this.crumbs(n)}
        <div class="chips">
          <span class="chip chip-branch">${esc(lvl.label)}</span>
          <span class="chip chip-cat" title="${esc(CATEGORY_HELP[ins.category])}">${esc(CATEGORY_LABEL[ins.category])}</span>
          ${ins.status !== 'current' ? `<span class="chip chip-status chip-${esc(ins.status)}">${esc(STATUS_LABEL[ins.status])}</span>` : ''}
        </div>
        <h2 id="detail-title" tabindex="-1">${esc(ins.names.common)}</h2>
        <p class="official">${esc(ins.names.official)}</p>
        ${ins.names.native ? `<p class="native">${esc(ins.names.native)}</p>` : ''}
      </header>
      ${statusBanner}
      <section class="sec"><h3>What it taxes</h3><p>${esc(ins.taxes.base)}</p><h4>Who pays</h4><p>${esc(ins.taxes.payer)}</p></section>
      <section class="sec rate"><h3>Rate</h3>
        <p class="rate-head">${esc(ins.rate.headline)}</p>
        ${ins.rate.details.length ? `<ul>${ins.rate.details.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}
        <p class="muted">Rate statement valid as of ${esc(formatDate(ins.rate.asOf))}.</p>
      </section>
      <section class="sec"><h3>In plain language</h3><p>${esc(ins.explanation)}</p><p class="muted kind-note"><strong>${esc(CATEGORY_LABEL[ins.category])}:</strong> ${esc(CATEGORY_HELP[ins.category])} <span class="shape-note">(${esc(CATEGORY_SHAPE_NAME[ins.category])})</span></p></section>
      ${ins.exceptions.length ? `<section class="sec"><h3>Exceptions &amp; variation</h3><ul>${ins.exceptions.map((e) => `<li>${esc(e)}</li>`).join('')}</ul></section>` : ''}
      ${this.revenueBlock(n)}
      ${n.revenue?.nationalShare !== undefined ? `<section class="sec charts"><h3>Chart</h3>${instrumentCharts(this.model, n)}</section>` : ''}
      ${children.length ? `<section class="sec"><h3>Related instruments</h3><ul class="linklist">${children.map((c) => `<li><button type="button" data-goto="${esc(c.id)}" class="level-btn" style="--c:${BRANCH_COLOR[c.branch]}"><span class="dot"></span><span><strong>${esc(c.instrument!.names.common)}</strong></span></button></li>`).join('')}</ul></section>` : ''}
      <section class="sec"><h3>Official legal sources</h3>${this.refLinks(ins.legalRefs)}</section>
      <footer class="foot">Information checked on <time datetime="${esc(ins.checkedOn)}">${esc(formatDate(ins.checkedOn))}</time></footer>
    </article>`;
  }
}
