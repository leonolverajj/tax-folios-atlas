import { registry } from '../data/loader';
import { esc } from '../util/dom';

export function mountAbout(dialog: HTMLDialogElement) {
  dialog.innerHTML = `
    <form method="dialog" class="about-close"><button class="btn" aria-label="Close about dialog">Close</button></form>
    <h2 id="about-title">About Tax Folios Atlas</h2>
    <p>An interactive atlas of how tax systems are organised. Each illuminated country opens a <em>folio</em>: the country core, its levels of government, and the taxes and other fiscal instruments that belong to each level. Every line in a folio is a real parent–child relationship in the data.</p>
    <h3>How to read the data</h3>
    <ul>
      <li><strong>Revenue-sized cores.</strong> National-level tax cores are sized by their share of one clearly defined total (for example "total federal revenues, FY2024-25"). The size, the amount and the percentage all come from the same documented figures.</li>
      <li><strong>Different kinds of charge</strong> – taxes, social contributions, insurance premiums, royalties, customs duties and fees – are labelled and drawn with different plate shapes, even when they sit in the same folio.</li>
      <li><strong>Sub-national cores</strong> carry an aggregate national amount only where an official statistical table exists; they are not sized by revenue and rates are shown as "varies by jurisdiction" rather than invented.</li>
      <li><strong>Changing law.</strong> Transitional, scheduled and repealed rules are marked in the detail panel with a dashed ring on the core.</li>
    </ul>
    <h3>Folios available now</h3>
    <p>${registry.map((c) => esc(c.names.en)).join(' · ')}</p>
    <p class="muted">This is a research aid, not legal or tax advice. Rates and rules change; each core links to its official legal sources and states the date it was checked.</p>`;
}
