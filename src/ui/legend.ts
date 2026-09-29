/** Compact legend / "how to read this folio" panel. Built from the live model so numbers can never disagree with the cores. */
import { FLOOR_SHARE, SIZE, radiusForShare, type FolioModel } from '../data/model';
import { formatMoney, formatShare } from '../data/format';
import { esc } from '../util/dom';
import { BRANCH_COLOR } from '../folio/palette';
import { plateShape } from '../folio/glyphs';

function plate(kind: string, color: string): string {
  return `<svg width="34" height="34" viewBox="-17 -17 34 34" aria-hidden="true"><circle r="15" fill="none" stroke="${color}" stroke-opacity=".5"/><path d="${plateShape(kind, 9)}" fill="${color}" fill-opacity=".55" stroke="${color}" stroke-width="1.2"/></svg>`;
}

export function renderLegend(root: HTMLElement, model: FolioModel) {
  const nat = model.sizing.national;
  const meta = model.bundle.meta;
  const levelRows = meta.levels
    .map(
      (l) =>
        `<li><span class="sw" style="background:${BRANCH_COLOR[l.branch]}"></span><span>${esc(l.names.common)} <small>(${esc(({ national: 'national', regional: 'regional', local: 'local' } as Record<string, string>)[l.branch])} branch)</small></span></li>`,
    )
    .join('');
  const sample = [0.02, 0.1, 0.3]
    .map((s) => {
      const r = radiusForShare(s);
      const d = Math.ceil(r * 2 + 4);
      return `<span class="size-sample"><svg width="${d}" height="${d}" viewBox="${-d / 2} ${-d / 2} ${d} ${d}" aria-hidden="true"><circle r="${r}" fill="none" stroke="var(--gold)" stroke-width="2"/></svg><small>${formatShare(s)}</small></span>`;
    })
    .join('');
  root.innerHTML = `
    <h2 id="legend-title">How to read this folio</h2>
    <section><h3>Colour = level of government</h3>
      <ul class="lg-list"><li><span class="sw" style="background:${BRANCH_COLOR.country}"></span><span>${esc(meta.names.en)} (country core)</span></li>${levelRows}</ul>
    </section>
    <section><h3>Shape of the plate = kind of charge</h3>
      <ul class="lg-shapes">
        <li>${plate('tax', '#9db4d9')}<span>Tax</span></li>
        <li>${plate('social-contribution', '#9db4d9')}<span>Social contribution / insurance premium</span></li>
        <li>${plate('royalty', '#9db4d9')}<span>Royalty</span></li>
        <li>${plate('customs-duty', '#9db4d9')}<span>Customs duty</span></li>
        <li>${plate('fee', '#9db4d9')}<span>Fee or charge</span></li>
        <li>${plate('special-levy', '#9db4d9')}<span>Earmarked levy</span></li>
      </ul>
    </section>
    <section><h3>Size of a core</h3>
      <p>Every tax core has an <strong>area proportional to its share</strong> of <strong>${esc(nat.label)}</strong> (${esc(formatMoney(nat.amountBase, 'units', nat.currency))}), so the biggest orbs are the country's biggest revenue sources whatever level of government collects them.</p>
      <p class="muted">Two limits keep the folio readable: cores below ${esc(formatShare(FLOOR_SHARE))} of the total are all drawn at the minimum size (${SIZE.taxMin} units), and cores of ${esc(formatShare(SIZE.shareCap))} or more stop growing (${SIZE.taxMax} units).</p>
      <div class="size-samples">${sample}</div>
      <p class="muted">A <strong>dotted inner ring</strong> and a small size mean the core has no revenue-based size: either no tax-specific amount is available, or it is not part of the national total (fees, royalties). Country and government-level cores have fixed structural sizes and do not encode revenue.</p>
    </section>
    <section><h3>Lines and glow</h3>
      <p class="muted">Every line joins a core to its actual parent in the data. Selecting a core lights the path back to the country; its direct children glow softly.</p>
      <p class="muted"><strong>Dashed outer ring</strong> = the rule is transitional, scheduled to change, or repealed – see the banner in the detail panel.</p>
    </section>`;
}
