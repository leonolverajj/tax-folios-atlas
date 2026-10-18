import { queuedCountries, registry } from '../data/loader';
import { esc } from '../util/dom';

export function mountAbout(dialog: HTMLDialogElement) {
  const folios = registry.filter((c) => c.researchStatus !== 'draft');
  const detailed = folios.filter((c) => c.grain !== 'harmonised');
  const harmonised = folios.filter((c) => c.grain === 'harmonised');
  dialog.innerHTML = `
    <form method="dialog" class="about-close"><button class="btn" aria-label="Close about dialog">Close</button></form>
    <h2 id="about-title">About Tax Folios Atlas</h2>
    <p>Two ways to see how countries collect their taxes: the <strong>Atlas</strong>, where every tax is an orb in a country's folio, and the <strong>Trees</strong>, where every folio is drawn as the same kind of small skill tree so that the shape of one tax system can be compared with another.</p>

    <h3>Atlas: how to read a folio</h3>
    <ul>
      <li><strong>Start.</strong> Click an illuminated country on the map, then click any orb. The panel on the right explains it: what it taxes, the rate, the legal source, the latest revenue and where it ranks.</li>
      <li><strong>Size.</strong> The <em>area</em> of a tax orb is its share of everything the country collects (taxes and compulsory social contributions, all levels of government together). The biggest orbs are therefore the biggest revenue sources, whichever government collects them. Very small shares all get the same minimum size so they stay visible.</li>
      <li><strong>Colour and shape.</strong> Colour is the level of government. The plate shape is the kind of charge: taxes, social contributions, insurance premiums, royalties, customs duties and fees are kept apart.</li>
      <li><strong>A dotted inner ring</strong> means the orb has no tax-specific amount, or is not part of the tax total (fees, royalties). It keeps a small neutral size and the panel says why.</li>
      <li><strong>Dashed ring.</strong> The rule is changing, scheduled or repealed; see the banner in the panel.</li>
    </ul>

    <h3>Trees: how to read them</h3>
    <ul>
      <li>The country is the centre, its levels of government are the first ring, and every tax, contribution or duty is a dot on the branch of the government that levies it. All trees use the same scale, so a wider, denser tree means more separate charges.</li>
      <li>Dot area is the share of national revenue, as in the folios; switch to <em>every charge equal</em> to compare the count alone. The numbers under each tree are counts and shares taken from the folios: nothing is scored, and the table lists every one.</li>
      <li>Counts say how many separate charges a reader meets. They do not measure how hard the rules are to comply with.</li>
    </ul>

    <h3>What is here now</h3>
    <p>There are two kinds of folio. A <strong>detailed folio</strong> (${detailed.length} countries) has one orb per separately legislated tax, with its legal basis, rate and revenue. A folio tagged <strong>IMF lines</strong> (${harmonised.length} countries) is built only from the IMF's Government Finance Statistics: each orb is a line of the IMF's classification of taxes (income taxes of individuals, VAT, excises, customs duties, social contributions …) for one year, with no rates or legal bases, and many cover only the central government. The Trees page keeps the two kinds apart because their number of dots cannot be compared.</p>
    <p><strong>Detailed folios (${detailed.length}):</strong> ${detailed.map((c) => esc(c.names.en)).join(' · ')}.</p>
    <p><strong>IMF lines (${harmonised.length}):</strong> ${harmonised.map((c) => esc(c.names.en)).join(' · ')}.</p>
    ${queuedCountries.length ? `<p><strong>Waiting for a folio (${queuedCountries.length}):</strong> OECD members whose harmonised figures are already collected; they are listed at the bottom of the Trees page.</p>` : ''}
    <p class="muted">This is a research aid, not legal or tax advice. Rates and rules change; each core links to its official legal sources and states the date it was checked. Sizes mix the latest figure each source publishes, so shares are approximate to that extent; the panel of each country lists its sources and their periods.</p>`;
}
