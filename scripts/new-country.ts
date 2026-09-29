/**
 * Scaffolds a new country folder with every file the schema needs, marked researchStatus "draft".
 *
 *   npm run new-country -- chile "Chile" CHL 152 CLP "$" "Chilean peso" "Chile"
 *                          <id>  <English name> <ISO3> <ISO numeric> <currency> <symbol> <currency name> [native name]
 *
 * The placeholders (amount 1, "TODO" texts) make the folder valid so you can open it in `npm run dev`
 * straight away; a draft country is hidden from the public site until you set researchStatus to
 * "partial" or "researched". The routine for filling it in is docs/ADDING-A-COUNTRY.md.
 */
import fs from 'node:fs';
import path from 'node:path';
import { COUNTRIES_DIR } from './lib/load';
import { formatJson } from './lib/format-json';

const [id, name, iso3, isoNumeric, cur, symbol, curName, native] = process.argv.slice(2);
if (!id || !name || !iso3 || !isoNumeric || !cur || !symbol || !curName) {
  console.error('usage: npm run new-country -- <id> "<English name>" <ISO3> <ISO numeric> <currency> "<symbol>" "<currency name>" ["<native name>"]');
  process.exit(1);
}
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) throw new Error('id must be kebab-case (a-z, 0-9, -)');
const dir = path.join(COUNTRIES_DIR, id);
if (fs.existsSync(dir)) throw new Error(`countries/${id} already exists`);
fs.mkdirSync(dir, { recursive: true });

const today = new Date().toISOString().slice(0, 10);
const year = new Date().getFullYear() - 1;
const period = { label: String(year), kind: 'calendar-year', start: `${year}-01-01`, end: `${year}-12-31` };
const w = (f: string, v: unknown) => fs.writeFileSync(path.join(dir, f), formatJson(v), 'utf8');

w('country.json', {
  id,
  iso3: iso3.toUpperCase(),
  isoNumeric: isoNumeric.padStart(3, '0'),
  names: { en: name, native: native ?? name, nativeLang: 'en' },
  currency: { code: cur.toUpperCase(), symbol, name: curName },
  summary: 'TODO: two or three sentences on how the fiscal system is organised (who taxes what, at which level).',
  theme: { accent: '#8ab4ff', accent2: '#5b6ea8', motif: 'topo', motifNote: 'TODO: one line on the geographic reference of the background art.' },
  levels: [
    {
      id: 'national',
      branch: 'national',
      names: { official: 'TODO official name of the national government', common: 'National' },
      description: 'TODO what this level of government is.',
      fiscalPower: 'TODO how it raises revenue.',
      legalRefs: [{ sourceId: 'placeholder-source', locator: 'TODO article or section' }],
      checkedOn: today,
    },
  ],
  supportingSourceIds: [],
  denominators: [
    {
      id: 'national-tax',
      label: 'TODO tax revenue of the national government',
      definition: 'TODO exactly what this total includes and leaves out.',
      levelIds: ['national'],
      amount: 1,
      scale: 'million',
      currency: cur.toUpperCase(),
      period,
      sourceId: 'placeholder-source',
      locator: 'TODO table or line',
      accessed: today,
    },
  ],
  sizing: {
    label: 'TODO taxes and compulsory contributions of all levels of government',
    definition: 'TODO the sum of the parts below, and what is left out (non-tax revenue, transfers between governments).',
    componentIds: ['national-tax'],
  },
  researchStatus: 'draft',
});

w('taxes.json', {
  instruments: [
    {
      id: 'nat-income-tax',
      parentId: 'national',
      levelId: 'national',
      category: 'tax',
      family: 'income-mixed',
      status: 'current',
      names: { official: 'TODO official name', common: 'Income tax' },
      taxes: { base: 'TODO what is taxed', payer: 'TODO who pays' },
      rate: { kind: 'progressive', headline: 'TODO headline rate', details: [], asOf: today },
      explanation: 'TODO plain-language explanation.',
      exceptions: [],
      legalRefs: [{ sourceId: 'placeholder-source', locator: 'TODO' }],
      checkedOn: today,
    },
  ],
});

w('revenue.json', {
  groups: [
    {
      title: 'TODO revenue table used, with its period',
      defaults: {
        denominatorId: 'national-tax',
        scale: 'million',
        currency: cur.toUpperCase(),
        period,
        basis: 'TODO cash / accrual, net of refunds',
        sourceId: 'placeholder-source',
        role: 'sizing',
        coverage: 'exact',
        accessed: today,
      },
      observations: [{ nodeId: 'nat-income-tax', amount: 1, locator: 'TODO line used' }],
    },
  ],
  unavailable: [],
});

w('sources.json', {
  sources: [
    {
      id: 'placeholder-source',
      org: 'TODO publishing organisation',
      title: 'TODO document title',
      url: 'https://example.org/todo',
      kind: 'legal',
      language: 'en',
      publishedDate: null,
      accessed: today,
      note: 'Replace with the real sources, then delete this entry.',
    },
  ],
});

w('presentation.json', {
  nodes: {
    [id]: { label: name, glyph: 'globe' },
    national: { label: 'National', sublabel: 'TODO', glyph: 'landmark' },
    'nat-income-tax': { label: 'Income tax', glyph: 'person' },
  },
});

w('layout.json', {
  version: 1,
  canvas: { width: 1600, height: 1000 },
  positions: { [id]: { x: 800, y: 500 }, national: { x: 480, y: 420 }, 'nat-income-tax': { x: 330, y: 300 } },
  radii: {},
});

console.log(`Created countries/${id}/ (draft).`);
console.log('Next: fill the files, `npm run validate`, `npm run layouts:init -- ' + id + ' --force`, `npm run backgrounds -- ' + id + '`, then arrange the cores in the layout editor (docs/ADDING-A-COUNTRY.md).');
