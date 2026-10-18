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
  { name: 'Australia', id: 'australia', wave: 0, why: 'Done.' },
  { name: 'Austria', id: 'austria', wave: 0, why: 'Done (partial).' },
  { name: 'Belgium', id: 'belgium', wave: 0, why: 'Done.' },
  { name: 'Canada', id: 'canada', wave: 0, why: 'Done.' },
  { name: 'Chile', id: 'chile', wave: 0, why: 'Done (partial: one income-tax core, municipal taxes from the OECD).' },
  { name: 'Colombia', id: 'colombia', wave: 0, why: 'Done (partial).' },
  { name: 'Costa Rica', id: 'costa-rica', wave: 3, why: 'Small unitary state with sizeable social contributions.' },
  { name: 'Czechia', id: 'czechia', wave: 0, why: 'Done.' },
  { name: 'Denmark', id: 'denmark', wave: 0, why: 'Done.' },
  { name: 'Estonia', id: 'estonia', wave: 0, why: 'Done.' },
  { name: 'Finland', id: 'finland', wave: 0, why: 'Done.' },
  { name: 'France', id: 'france', wave: 0, why: 'Done.' },
  { name: 'Germany', id: 'germany', wave: 0, why: 'Done.' },
  { name: 'Greece', id: 'greece', wave: 0, why: 'Done.' },
  { name: 'Hungary', id: 'hungary', wave: 0, why: 'Done.' },
  { name: 'Iceland', id: 'iceland', wave: 0, why: 'Done.' },
  { name: 'Ireland', id: 'ireland', wave: 0, why: 'Done.' },
  { name: 'Israel', id: 'israel', wave: 3, why: 'Unitary, weak local tax base.' },
  { name: 'Italy', id: 'italy', wave: 0, why: 'Done (partial).' },
  { name: 'Japan', id: 'japan', wave: 0, why: 'Done.' },
  { name: 'South Korea', id: 'south-korea', wave: 0, why: 'Done.' },
  { name: 'Latvia', id: 'latvia', wave: 0, why: 'Done.' },
  { name: 'Lithuania', id: 'lithuania', wave: 0, why: 'Done.' },
  { name: 'Luxembourg', id: 'luxembourg', wave: 0, why: 'Done.' },
  { name: 'Mexico', id: 'mexico', wave: 0, why: 'Done (partial).' },
  { name: 'Netherlands', id: 'netherlands', wave: 0, why: 'Done.' },
  { name: 'New Zealand', id: 'new-zealand', wave: 0, why: 'Done.' },
  { name: 'Norway', id: 'norway', wave: 0, why: 'Done.' },
  { name: 'Poland', id: 'poland', wave: 0, why: 'Done.' },
  { name: 'Portugal', id: 'portugal', wave: 0, why: 'Done.' },
  { name: 'Slovak Republic', id: 'slovak-republic', wave: 0, why: 'Done.' },
  { name: 'Slovenia', id: 'slovenia', wave: 0, why: 'Done.' },
  { name: 'Spain', id: 'spain', wave: 0, why: 'Done (partial).' },
  { name: 'Sweden', id: 'sweden', wave: 0, why: 'Done.' },
  { name: 'Switzerland', id: 'switzerland', wave: 0, why: 'Done.' },
  { name: 'Türkiye', id: 'turkiye', wave: 0, why: 'Done (partial: central-budget taxes only; no social security premiums or municipal taxes).' },
  { name: 'United Kingdom', id: 'united-kingdom', wave: 0, why: 'Done.' },
  { name: 'United States', id: 'united-states', wave: 0, why: 'Done.' },
];

interface UnRow {
  iso3: string;
  name: string;
  status: 'member' | 'observer';
  reason?: string;
}
const un = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'build', 'data', 'un-members.json'), 'utf8')) as UnRow[];

const metas = new Map(listCountryIds().map((id) => [id, loadBundle(id).meta]));
const byIso = new Map([...metas.values()].map((m) => [m.iso3, m]));
const profile = new Set(listProfileIds());
const kind = (m: { grain: string }) => (m.grain === 'harmonised' ? 'IMF lines' : 'detailed');
const status = (id: string) => {
  const m = metas.get(id);
  return m ? `Folio (${kind(m)}, ${m.researchStatus})` : profile.has(id) ? 'Profile only' : 'Not started';
};

const rows = OECD.map((c) => `| ${c.name} | ${status(c.id)} |`);
const done = OECD.filter((c) => metas.has(c.id)).length;
const prof = OECD.filter((c) => !metas.has(c.id) && profile.has(c.id)).length;
const detailed = [...metas.values()].filter((m) => m.grain !== 'harmonised');
const imf = [...metas.values()].filter((m) => m.grain === 'harmonised');
const members = un.filter((u) => u.status === 'member');
const coveredMembers = members.filter((u) => byIso.has(u.iso3));
const unRows = un.map((u) => {
  const m = byIso.get(u.iso3);
  const cover = m ? `Folio (${kind(m)}, ${m.researchStatus}${m.grain === 'harmonised' ? `, ${m.denominators[0].period.label}` : ''})` : 'None';
  return `| ${u.name}${u.status === 'observer' ? ' (observer state)' : ''} | ${cover} | ${m ? '' : u.reason ?? ''} |`;
});
const out: string[] = [
  '# Country roadmap',
  '',
  `Generated ${new Date().toISOString().slice(0, 10)} by \`npm run roadmap\` from the data folders. **${metas.size} folios**: ${detailed.length} detailed (one core per legislated tax) and ${imf.length} at the grain of the IMF's classification (one core per line of the IMF's Government Finance Statistics; see [METHODOLOGY](METHODOLOGY.md)). They cover **${coveredMembers.length} of the ${members.length} UN member states**, and Palestine, an observer state; ${members.length - coveredMembers.length} members have no folio (table below). **${done}** of the 38 OECD members have a folio, ${prof} have the harmonised profile only, ${38 - done - prof} are not started.`,
  '',
  '## Kinds of coverage',
  '',
  '1. **Detailed folio**: `countries/<id>/` built from the country\'s own statistics (or the European Commission\'s National Tax Lists), one core per separately legislated charge, with legal basis, rate and latest revenue. It takes days of research per country (hours with the National Tax Lists).',
  '2. **IMF lines**: the same folder, built by `scripts/build/gfs-countries.ts` from the IMF\'s Government Finance Statistics. Minutes per country; no rates or legal bases; central government only unless the IMF reports sub-national taxes. Tagged `grain: harmonised`.',
  '3. **Profile only**: `profiles/<id>.json`, the OECD 2023 tax mix and level split of a country that has no folio yet. None is left.',
  '',
  '## The 38 OECD members',
  '',
  '| Country | Status |',
  '|---|---|',
  ...rows,
  '',
  '## The 193 UN member states and the two observer states',
  '',
  'A country without a folio is not covered because the IMF series does not give usable taxes by line for it (reasons below); a detailed folio would need that country\'s own statistics.',
  '',
  '| Country | Coverage | Why none |',
  '|---|---|---|',
  ...unRows,
  '',
  '## How to add one',
  '',
  '- An IMF-lines folio: [ADDING-A-COUNTRY.md](ADDING-A-COUNTRY.md), section C.',
  '- A detailed folio: write a builder script `scripts/build/<id>.ts` (or scaffold with `npm run new-country`), then follow section B of the same guide. A detailed folio replaces the IMF-lines folio of the same country.',
  '- A profile: copy an existing `profiles/<id>.json`, replace the numbers with those of the OECD table, `npm run validate`.',
  '',
];
fs.writeFileSync(path.join(ROOT, 'docs', 'COUNTRY-ROADMAP.md'), out.join('\n'), 'utf8');
void loadProfileFile;
console.log(`roadmap written: ${metas.size} folios (${detailed.length} detailed, ${imf.length} IMF lines); ${coveredMembers.length} of ${members.length} UN members covered`);