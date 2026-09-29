/**
 * Writes docs/COUNTRY-ROADMAP.md: which countries have a folio, which have only the harmonised
 * profile, and which come next. The status columns are read from the data, so the roadmap can
 * never disagree with what the site shows.
 *
 *   npm run roadmap
 */
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, listCountryIds, listProfileIds, loadBundle, loadProfileFile } from './lib/load';

/** The 38 OECD members, with the wave in which a full folio is proposed. Edit the waves freely. */
const OECD: { name: string; id: string; wave: 0 | 1 | 2 | 3 | 4; why: string }[] = [
  { name: 'Australia', id: 'australia', wave: 1, why: 'Federal, income-tax heavy, no social-security contributions: a sharp contrast with the countries already built.' },
  { name: 'Austria', id: 'austria', wave: 2, why: 'Federal with revenue sharing; social contributions plus payroll taxes.' },
  { name: 'Belgium', id: 'belgium', wave: 2, why: 'Federal with three regions and communities; high income and social charges.' },
  { name: 'Canada', id: 'canada', wave: 0, why: 'Done.' },
  { name: 'Chile', id: 'chile', wave: 3, why: 'Unitary, VAT-led, a Latin American OECD reference next to Colombia and Mexico.' },
  { name: 'Colombia', id: 'colombia', wave: 0, why: 'Done (partial).' },
  { name: 'Costa Rica', id: 'costa-rica', wave: 3, why: 'Small unitary state with sizeable social contributions.' },
  { name: 'Czechia', id: 'czechia', wave: 3, why: 'Central Europe; social contributions and VAT.' },
  { name: 'Denmark', id: 'denmark', wave: 2, why: 'Income-tax financed welfare state; almost no social contributions.' },
  { name: 'Estonia', id: 'estonia', wave: 4, why: 'Distributed-profit corporate tax model.' },
  { name: 'Finland', id: 'finland', wave: 2, why: 'Nordic model with municipal income taxes.' },
  { name: 'France', id: 'france', wave: 1, why: 'Highest tax take among large economies; social contributions and the CSG.' },
  { name: 'Germany', id: 'germany', wave: 1, why: 'Federal with joint taxes shared by Bund and Länder; social insurance dominant.' },
  { name: 'Greece', id: 'greece', wave: 3, why: 'VAT and social contributions; recent reforms.' },
  { name: 'Hungary', id: 'hungary', wave: 3, why: 'Very high VAT share; local business tax.' },
  { name: 'Iceland', id: 'iceland', wave: 4, why: 'Municipal income tax carries local government.' },
  { name: 'Ireland', id: 'ireland', wave: 2, why: 'Corporation-tax concentration.' },
  { name: 'Israel', id: 'israel', wave: 3, why: 'Unitary, weak local tax base.' },
  { name: 'Italy', id: 'italy', wave: 1, why: 'Regional IRAP and municipal taxes on top of a heavy national system.' },
  { name: 'Japan', id: 'japan', wave: 0, why: 'Done.' },
  { name: 'Korea', id: 'korea', wave: 1, why: 'Fast-growing tax system, low subnational autonomy.' },
  { name: 'Latvia', id: 'latvia', wave: 4, why: 'Baltic; municipal income tax share.' },
  { name: 'Lithuania', id: 'lithuania', wave: 4, why: 'Baltic; social contributions.' },
  { name: 'Luxembourg', id: 'luxembourg', wave: 4, why: 'Small; communal business tax.' },
  { name: 'Mexico', id: 'mexico', wave: 0, why: 'Done (partial).' },
  { name: 'Netherlands', id: 'netherlands', wave: 2, why: 'Box system for income tax; strong VAT and social premiums.' },
  { name: 'New Zealand', id: 'new-zealand', wave: 3, why: 'Broad-based GST, no social contributions.' },
  { name: 'Norway', id: 'norway', wave: 2, why: 'Petroleum revenue is outside the tax figures: a good test of the rules.' },
  { name: 'Poland', id: 'poland', wave: 3, why: 'Largest Central European economy.' },
  { name: 'Portugal', id: 'portugal', wave: 3, why: 'Unitary with autonomous regions.' },
  { name: 'Slovak Republic', id: 'slovak-republic', wave: 4, why: 'Social contributions and VAT.' },
  { name: 'Slovenia', id: 'slovenia', wave: 4, why: 'Social contributions and VAT.' },
  { name: 'Spain', id: 'spain', wave: 1, why: 'Regions collect and share large taxes (common and foral regimes).' },
  { name: 'Sweden', id: 'sweden', wave: 2, why: 'Municipal income tax; employer contributions.' },
  { name: 'Switzerland', id: 'switzerland', wave: 1, why: 'Three-tier federal system with the most subnational tax autonomy.' },
  { name: 'Türkiye', id: 'turkiye', wave: 3, why: 'Unitary, indirect-tax heavy.' },
  { name: 'United Kingdom', id: 'united-kingdom', wave: 1, why: 'Westminster system; council tax and devolution.' },
  { name: 'United States', id: 'united-states', wave: 0, why: 'Done.' },
];

const WAVE_TEXT: Record<number, string> = {
  1: 'Wave 1 – the next folios: large economies and the main tax-system archetypes',
  2: 'Wave 2 – high-tax and Nordic/Benelux contrasts',
  3: 'Wave 3 – emerging and mid-size OECD members',
  4: 'Wave 4 – the remaining small economies',
};

const folio = new Map(listCountryIds().map((id) => [id, loadBundle(id).meta.researchStatus]));
const profile = new Set(listProfileIds());
const status = (id: string) => (folio.has(id) ? `Folio (${folio.get(id)})` : profile.has(id) ? 'Profile only' : 'Not started');

const rows = OECD.map((c) => `| ${c.name} | ${status(c.id)} | ${c.wave || '–'} | ${c.why} |`);
const done = OECD.filter((c) => folio.has(c.id)).length;
const prof = OECD.filter((c) => !folio.has(c.id) && profile.has(c.id)).length;
const out: string[] = [
  '# Country roadmap',
  '',
  `Generated ${new Date().toISOString().slice(0, 10)} by \`npm run roadmap\` from the data folders. **${done}** of the 38 OECD members have a full folio, **${prof}** have the harmonised profile only (they already appear as fighters), ${38 - done - prof} are not started. Brazil and Bolivia are also built (outside the OECD).`,
  '',
  '## Two levels of coverage',
  '',
  '1. **Profile only** – `profiles/<id>.json`: the OECD 2023 tax mix, the split by level of government, the tax-to-GDP ratio and the subnational revenue structure. It takes minutes per country and is enough for the Fiscal Fighters comparison.',
  '2. **Folio** – `countries/<id>/`: every tax and levy with its legal basis, rate and latest revenue, laid out as a folio. It takes days of research per country. Building a folio does not lose the profile: its `structure.json` replaces `profiles/<id>.json`.',
  '',
  'The profile layer is what makes covering *all* countries realistic: the OECD publishes the same tables for every member (and for Latin America and the Caribbean, Asia-Pacific and Africa), so the fighters can grow to a hundred countries long before every folio exists.',
  '',
  '## The 38 OECD members',
  '',
  '| Country | Status | Folio wave | Why this wave |',
  '|---|---|---|---|',
  ...rows,
  '',
  ...[1, 2, 3, 4].flatMap((w) => [`### ${WAVE_TEXT[w]}`, '', OECD.filter((c) => c.wave === w).map((c) => `- ${c.name} (${status(c.id).toLowerCase()})`).join('\n'), '']),
  '## Beyond the OECD',
  '',
  'Already built: **Brazil**, **Bolivia**. Suggested next, because the same OECD publications cover them (Latin America and the Caribbean, Asia-Pacific, Africa editions), so their profile can be added the same way: Argentina, Peru, Uruguay, Ecuador, India, Indonesia, South Africa, China, Saudi Arabia.',
  '',
  '## How to add one',
  '',
  '- A profile: copy an existing `profiles/<id>.json`, replace the numbers with those of the OECD table, `npm run validate`.',
  '- A folio: `npm run new-country`, then follow [ADDING-A-COUNTRY.md](ADDING-A-COUNTRY.md).',
  '',
];
fs.writeFileSync(path.join(ROOT, 'docs', 'COUNTRY-ROADMAP.md'), out.join('\n'), 'utf8');
void loadProfileFile;
console.log(`roadmap written: ${done} folios, ${prof} profile-only, ${38 - done - prof} not started`);
