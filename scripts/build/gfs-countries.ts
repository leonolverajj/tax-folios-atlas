/**
 * Folios at the grain of the IMF's Government Finance Statistics (GFS), for countries without a detailed folio.
 *
 * One definition for all of them: scripts/lib/gfs.ts chooses the year and the government sectors from the IMF series
 * (scripts/build/data/gfs-<CC>.json, extracted by scripts/extract-gfs.cjs), expands the GFS classification of taxes and
 * social contributions into lines, and this script turns the lines into a folio. Nothing here is typed per country except
 * identity data (names, currency) that scripts/build/data/country-meta.json supplies and the small override tables below.
 *
 *   npx tsx scripts/build/gfs-countries.ts            every country that has a gfs-<CC>.json
 *   npx tsx scripts/build/gfs-countries.ts KEN UGA    only these (ISO 3166 alpha-3 codes)
 *
 * What a folio built here is, and is not: each core is a line of the IMF's classification (personal income tax,
 * VAT, excises, customs duties, employer contributions ...) with what it raised in one year, not a separately legislated tax.
 * Rates and legal bases are not recorded; the folio is marked grain "harmonised" so that the Trees page does not
 * compare its number of cores with that of the detailed folios.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCountry, type CountrySpec, type DenSpec, type GroupSpec, type InstSpec, type LevelSpec } from '../lib/build-country';
import type { Category, Family, GlyphName, Source } from '../../src/data/schema';
import { CODE_NAME, extractLeaves, loadGfsFile, makeReader, pickScope, type Leaf, type Scope } from '../lib/gfs';

const TODAY = '2026-10-17';
const DATA = path.join(path.dirname(fileURLToPath(import.meta.url)), 'data');
const ROOT = path.resolve(DATA, '..', '..', '..');
const META = JSON.parse(fs.readFileSync(path.join(DATA, 'country-meta.json'), 'utf8')) as Record<string, MetaEntry>;

interface MetaEntry {
  cca2: string;
  ccn3: string;
  name: { common: string; official: string; native?: Record<string, { official: string; common: string }> };
  currencies?: Record<string, { name: string; symbol?: string }>;
  latlng: [number, number];
}

/* ------------------------------------------------------------------ identity overrides */
/** English names and URL ids where the dataset's common name is not the name used today. */
const NAME_OVERRIDE: Record<string, { en: string; id?: string }> = {
  PSE: { en: 'Palestine', id: 'palestine' },
  CIV: { en: 'Côte d’Ivoire', id: 'cote-d-ivoire' },
  CPV: { en: 'Cabo Verde', id: 'cabo-verde' },
  COG: { en: 'Republic of the Congo', id: 'republic-of-the-congo' },
};
/** Native names where the dataset lists another language first. [name, BCP 47 language] */
const NATIVE_OVERRIDE: Record<string, [string, string]> = {
  PSE: ['فلسطين', 'ar'], ARG: ['Argentina', 'es'], PER: ['Perú', 'es'], PRY: ['Paraguay', 'es'], ISR: ['ישראל', 'he'], IND: ['भारत', 'hi'], ZAF: ['South Africa', 'en'],
  SOM: ['Soomaaliya', 'so'], TCD: ['Tchad', 'fr'], COM: ['Comores', 'fr'], TJK: ['Тоҷикистон', 'tg'], UZB: ['Oʻzbekiston', 'uz'], NAM: ['Namibia', 'en'], BLR: ['Беларусь', 'be'],
};
/** Currency of the IMF series where the dataset lists several (checked against World Bank GDP and exchange rates). */
const CURRENCY_OVERRIDE: Record<string, { code: string; name: string; symbol: string }> = {
  PSE: { code: 'ILS', name: 'Israeli new shekel', symbol: '₪' },
  SLE: { code: 'SLL', name: 'Sierra Leonean leone (before the 2022 redenomination)', symbol: 'Le' },
  BHS: { code: 'BSD', name: 'Bahamian dollar', symbol: '$' },
  BTN: { code: 'BTN', name: 'Bhutanese ngultrum', symbol: 'Nu.' },
  FSM: { code: 'USD', name: 'United States dollar', symbol: '$' },
  KHM: { code: 'KHR', name: 'Cambodian riel', symbol: '៛' },
  KIR: { code: 'AUD', name: 'Australian dollar', symbol: '$' },
  LSO: { code: 'LSL', name: 'Lesotho loti', symbol: 'L' },
  NAM: { code: 'NAD', name: 'Namibian dollar', symbol: '$' },
  PAN: { code: 'PAB', name: 'Panamanian balboa', symbol: 'B/.' },
  SWZ: { code: 'SZL', name: 'Swazi lilangeni', symbol: 'L' },
  TUV: { code: 'AUD', name: 'Australian dollar', symbol: '$' },
};
const LANG2: Record<string, string> = {
  eng: 'en', fra: 'fr', spa: 'es', por: 'pt', ara: 'ar', rus: 'ru', zho: 'zh', sqi: 'sq', cat: 'ca', hye: 'hy', aze: 'az', ben: 'bn', bos: 'bs', dzo: 'dz', ell: 'el',
  amh: 'am', kat: 'ka', ind: 'id', kaz: 'kk', kir: 'ky', khm: 'km', lao: 'lo', sin: 'si', ron: 'ro', div: 'dv', mkd: 'mk', mya: 'my', mon: 'mn', nep: 'ne', srp: 'sr',
  tha: 'th', ukr: 'uk', vie: 'vi', bis: 'bi', afr: 'af', ita: 'it', grn: 'gn', aym: 'ay', swa: 'sw',
};

const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

function hsl(h: number, s: number, l: number): string {
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
    return Math.round(255 * c).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
const hueOf = (cc: string) => [...cc].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 360, 7);

/* ------------------------------------------------------------------ the classification lines */
interface LineInfo {
  common: string;
  label: string;
  sub: string;
  glyph: GlyphName;
  family: Family;
  category?: Category;
  base: string;
  payer: string;
}
const L = (common: string, label: string, sub: string, glyph: GlyphName, family: Family, base: string, payer: string, category?: Category): LineInfo => ({ common, label, sub, glyph, family, base, payer, ...(category ? { category } : {}) });
const SOCIAL: Category = 'social-contribution';
const LINE: Record<string, LineInfo> = {
  G11_T: L('Taxes', 'Taxes', 'One line', 'coin', 'other', 'All taxes of the sector, which the IMF series does not split into lines (GFS 11).', 'Various.'),
  G1111_T: L('Personal income tax', 'Personal income tax', 'Individuals', 'person', 'income-personal', 'Income, profits and capital gains of individuals (GFS 1111).', 'Individuals.'),
  G1112_T: L('Corporate income tax', 'Corporate income tax', 'Companies', 'factory', 'income-corporate', 'Income, profits and capital gains of corporations and other enterprises (GFS 1112).', 'Corporations and other enterprises.'),
  G1113_T: L('Other income taxes', 'Other income taxes', 'Not split by payer', 'coin', 'income-mixed', 'Taxes on income, profits and capital gains that the country does not attribute to individuals or to enterprises (GFS 1113).', 'Individuals or enterprises.'),
  G111_T: L('Income taxes', 'Income taxes', 'Persons and companies', 'coin', 'income-mixed', 'Taxes on income, profits and capital gains, which the country reports as one line (GFS 111).', 'Individuals and enterprises.'),
  G112_T: L('Payroll taxes', 'Payroll taxes', 'Wage bill', 'ledger', 'payroll', 'Taxes levied on the wages and salaries paid or on the number of workers (GFS 112).', 'Employers or employees.'),
  G113_T: L('Property taxes', 'Property taxes', 'Land · wealth · estates', 'house', 'property', 'Taxes on property: recurrent taxes on land, buildings and net wealth, and taxes on estates, inheritances and gifts (GFS 113), reported as one line.', 'Owners of property.'),
  G1131_T: L('Recurrent property tax', 'Property tax', 'Land and buildings', 'house', 'property', 'Recurrent taxes on immovable property: land and buildings (GFS 1131).', 'Owners or users of the property.'),
  G1132_T: L('Net wealth tax', 'Net wealth tax', 'Wealth', 'gem', 'property', 'Recurrent taxes on the net wealth of individuals or enterprises (GFS 1132).', 'Owners of wealth.'),
  G1133_T: L('Estate, inheritance and gift taxes', 'Estate and gift taxes', 'Transfers of wealth', 'scroll', 'property', 'Taxes on the transfer of wealth by inheritance, bequest or gift (GFS 1133).', 'Heirs, estates and recipients of gifts.'),
  G1135_T: L('Capital levies', 'Capital levies', 'One-off', 'key', 'property', 'Occasional taxes on the value of assets or net worth (GFS 1135).', 'Owners of assets.'),
  G114_T: L('Taxes on goods and services', 'Goods and services taxes', 'One line', 'cart', 'general-consumption', 'Taxes on the production, sale, transfer, leasing and delivery of goods and the rendering of services, and on the use of goods (GFS 114), reported as one line.', 'Producers and traders; usually passed on in prices.'),
  G1141_T: L('General taxes on goods and services', 'General consumption taxes', 'One line', 'cart', 'general-consumption', 'General taxes on goods and services (VAT, sales and turnover taxes), reported as one line (GFS 1141).', 'Businesses that collect it; borne by buyers.'),
  G11411_T: L('Value added tax', 'VAT', 'Value added', 'cart', 'general-consumption', 'Taxes charged on the value added at each stage of production and distribution (GFS 11411).', 'Final consumers, through the businesses that collect it.'),
  G11412_T: L('Sales taxes', 'Sales taxes', 'Single stage', 'cart', 'general-consumption', 'Taxes charged at a single stage, generally on the sale of goods and services to the final buyer (GFS 11412).', 'Buyers, through the sellers.'),
  G11413_T: L('Turnover and other general taxes', 'Turnover taxes', 'Other general taxes', 'percent', 'general-consumption', 'Turnover taxes and other general taxes on goods and services (GFS 11413).', 'Businesses.'),
  G11414_T: L('Taxes on financial and capital transactions', 'Financial transaction taxes', 'Transfers · securities', 'stamp', 'property', 'Taxes on the purchase and sale of financial and capital assets, such as securities and property (GFS 11414).', 'Parties to the transactions.'),
  G1142_T: L('Excises', 'Excises', 'Specific goods', 'flame', 'specific-consumption', 'Taxes on specific goods or services, such as alcohol, tobacco and fuel (GFS 1142).', 'Producers and importers; passed on in prices.'),
  G1143_T: L('Profits of fiscal monopolies', 'Fiscal monopoly profits', 'State monopolies', 'bank', 'specific-consumption', 'Profits transferred to the government by monopolies set up to raise revenue (GFS 1143).', 'The monopoly.'),
  G1144_T: L('Taxes on specific services', 'Taxes on services', 'Insurance · lodging · gambling', 'bed', 'specific-consumption', 'Taxes on specific services such as insurance, entertainment, lodging and gambling (GFS 1144).', 'Providers of the services.'),
  G1145_T: L('Taxes on the use of goods', 'Use-of-goods taxes', 'One line', 'car', 'specific-consumption', 'Taxes on the use of goods and on permission to use goods or perform activities (GFS 1145), reported as one line.', 'Owners and users.'),
  G11451_T: L('Motor vehicle taxes', 'Motor vehicle taxes', 'Ownership · use', 'car', 'specific-consumption', 'Taxes on the ownership or use of motor vehicles (GFS 11451).', 'Vehicle owners and users.'),
  G11452_T: L('Licences and other use taxes', 'Licences and use taxes', 'Permissions', 'stamp', 'other', 'Other taxes on the use of goods and on permission to use goods or perform activities (GFS 11452).', 'Holders of the licences.'),
  G1146_T: L('Other taxes on goods and services', 'Other goods and services', 'Not elsewhere classified', 'gear', 'other', 'Other taxes on goods and services (GFS 1146).', 'Producers and traders.'),
  G115_T: L('Taxes on international trade', 'International trade taxes', 'One line', 'ship', 'trade', 'Taxes on international trade and transactions (GFS 115), reported as one line.', 'Importers and exporters.'),
  G1151_T: L('Customs and other import duties', 'Customs duties', 'Imports', 'ship', 'trade', 'Duties on imported goods (GFS 1151).', 'Importers.', 'customs-duty'),
  G1152_T: L('Taxes on exports', 'Export taxes', 'Exports', 'plane', 'trade', 'Duties on exported goods (GFS 1152).', 'Exporters.'),
  G1153_T: L('Profits of export or import monopolies', 'Trade monopoly profits', 'State monopolies', 'bank', 'trade', 'Profits of export or import monopolies transferred to the government (GFS 1153).', 'The monopoly.'),
  G1154_T: L('Exchange profits', 'Exchange profits', 'Foreign exchange', 'coin', 'trade', 'Profits from multiple exchange rates and similar practices (GFS 1154).', 'Users of foreign exchange.'),
  G1155_T: L('Exchange taxes', 'Exchange taxes', 'Foreign exchange', 'coin', 'trade', 'Taxes on foreign exchange transactions (GFS 1155).', 'Users of foreign exchange.'),
  G1156_T: L('Other taxes on international trade', 'Other trade taxes', 'Not elsewhere classified', 'gear', 'trade', 'Other taxes on international trade and transactions (GFS 1156).', 'Importers and exporters.'),
  G116_T: L('Other taxes', 'Other taxes', 'Not elsewhere classified', 'gear', 'other', 'Taxes that the classification does not place elsewhere (GFS 116).', 'Various.'),
  G1211_T: L('Social security contributions of employees', 'Social: employees', 'Contributions', 'shield', 'social-security', 'Compulsory social security contributions paid by employees (GFS 1211).', 'Employees.', SOCIAL),
  G1212_T: L('Social security contributions of employers', 'Social: employers', 'Contributions', 'shield', 'social-security', 'Compulsory social security contributions paid by employers on behalf of employees (GFS 1212).', 'Employers.', SOCIAL),
  G1213_T: L('Social security contributions of the self-employed and non-employed', 'Social: self-employed', 'Contributions', 'shield', 'social-security', 'Compulsory social security contributions paid by the self-employed or the non-employed (GFS 1213).', 'The self-employed and the non-employed.', SOCIAL),
  G121_T: L('Social security contributions', 'Social security contributions', 'One line', 'shield', 'social-security', 'Compulsory social security contributions, reported as one line (GFS 121).', 'Employees, employers and the self-employed.', SOCIAL),
  G122_T: L('Other social contributions', 'Other social contributions', 'Government employee schemes', 'heart', 'social-security', 'Actual contributions to the schemes that government runs for its own employees outside social security; imputed contributions are left out (GFS 122).', 'Government employers and employees.', SOCIAL),
  G1221_T: L('Other social contributions of employees', 'Other social: employees', 'Government schemes', 'heart', 'social-security', 'Contributions of employees to government employee schemes outside social security (GFS 1221).', 'Government employees.', SOCIAL),
  G1222_T: L('Other social contributions of employers', 'Other social: employers', 'Government schemes', 'heart', 'social-security', 'Actual contributions of government as employer to its employee schemes (GFS 1222); imputed contributions are left out.', 'Government as employer.', SOCIAL),
  G12_T: L('Social contributions', 'Social contributions', 'One line', 'shield', 'social-security', 'Compulsory social contributions, reported as one line (GFS 12); imputed contributions are left out.', 'Employees, employers and the self-employed.', SOCIAL),
};
const SHORT: Record<string, string> = {
  G11_T: 'taxes', G111_T: 'income taxes', G113_T: 'property taxes', G114_T: 'goods and services taxes', G1141_T: 'general consumption taxes', G1145_T: 'use-of-goods taxes',
  G115_T: 'trade taxes', G12_T: 'social contributions', G121_T: 'social security contributions', G122_T: 'social contributions (other)',
};
const PARENT_FAMILY: Record<string, Family> = {
  G11_T: 'other', G111_T: 'income-mixed', G113_T: 'property', G114_T: 'general-consumption', G1141_T: 'general-consumption', G1145_T: 'specific-consumption', G115_T: 'trade',
  G12_T: 'social-security', G121_T: 'social-security', G122_T: 'social-security',
};
const PARENT_GLYPH: Partial<Record<string, GlyphName>> = { G12_T: 'shield', G121_T: 'shield', G122_T: 'heart', G115_T: 'ship', G113_T: 'house', G111_T: 'coin' };

/* ------------------------------------------------------------------ helpers */
const n = (x: number, d = 0) => x.toLocaleString('en-GB', { maximumFractionDigits: d });
function money(units: number, cur: string): string {
  const a = Math.abs(units);
  const [div, word] = a >= 1e12 ? [1e12, ' trillion'] : a >= 1e9 ? [1e9, ' billion'] : a >= 1e6 ? [1e6, ' million'] : a >= 1e3 ? [1e3, ' thousand'] : [1, ''];
  const v = units / div;
  return `${cur} ${n(v, v >= 100 ? 0 : v >= 10 ? 1 : 2)}${word}`;
}
const pct = (x: number) => `${n(x * 100, x * 100 < 10 ? 1 : 0)}%`;
const million = (units: number) => Number((units / 1e6).toFixed(6));
const cut = (s: string, k: number) => (s.length <= k ? s : s.slice(0, k - 1).trimEnd() + '…');

/* ------------------------------------------------------------------ building one country */
interface Drawn {
  levelKey: 'central' | 'state' | 'local';
  leaf: Leaf;
  code: string;
  family?: Family;
}

function build(cc: string): { id: string; name: string; scope: Scope; status: string } | null {
  const meta = META[cc];
  if (!meta) throw new Error(`${cc}: no entry in country-meta.json`);
  const file = loadGfsFile(cc);
  const imf = file.country; // the IMF's own country code (it differs from ISO 3166 for the West Bank and Gaza)
  const scope = pickScope(file.sectors);
  if (!scope) return null;
  const r = makeReader(file.sectors);
  const year = scope.year;

  /* identity */
  const nameO = NAME_OVERRIDE[cc];
  const en = nameO?.en ?? meta.name.common;
  const id = nameO?.id ?? slug(en);
  const iso2 = meta.cca2.toLowerCase();
  const nativeEntry = Object.entries(meta.name.native ?? {})[0];
  const [nativeName, nativeLang] = NATIVE_OVERRIDE[cc] ?? (nativeEntry ? [nativeEntry[1].common.replace(/́/g, ''), LANG2[nativeEntry[0]] ?? nativeEntry[0]] : [en, 'en']);
  const curCode = CURRENCY_OVERRIDE[cc] ?? (() => {
    const entries = Object.entries(meta.currencies ?? {});
    if (entries.length !== 1) throw new Error(`${cc}: the dataset lists ${entries.length} currencies; add an override`);
    return { code: entries[0][0], name: entries[0][1].name, symbol: entries[0][1].symbol || entries[0][0] };
  })();
  const cur = curCode.code;
  const hue = hueOf(cc);

  /* leaves per level, merged where small */
  const extractions = scope.parts.map((p) => ({ part: p, ex: extractLeaves(r, p.sectors, year) }));
  const grandDrawn = extractions.reduce((a, e) => a + e.ex.total, 0);
  const SMALL = 0.0015;
  const drawn: Drawn[] = [];
  for (const { part, ex } of extractions) {
    for (const kind of ['tax', 'social'] as const) {
      const ls = ex.leaves.filter((l) => l.kind === kind);
      const small = ls.filter((l) => l.amount / grandDrawn < SMALL);
      const keep = ls.filter((l) => !small.includes(l));
      for (const l of keep) drawn.push({ levelKey: part.level, leaf: l, code: l.code });
      if (small.length >= 2) {
        const total = small.reduce((a, l) => a + l.amount, 0);
        drawn.push({
          levelKey: part.level,
          leaf: { code: `small-${kind}`, name: kind === 'tax' ? 'Other taxes (small lines)' : 'Other social contributions (small lines)', amount: total, kind, merged: small.map((l) => l.code) },
          code: `small-${kind}`,
        });
      } else for (const l of small) drawn.push({ levelKey: part.level, leaf: l, code: l.code });
    }
  }
  drawn.sort((a, b) => b.leaf.amount - a.leaf.amount);

  /* levels */
  const sectorText = (secs: string[]) => secs.join(' + ');
  const hasSsf = (secs: string[]) => secs.includes('S1314');
  const LV: Record<string, { branch: 'national' | 'regional' | 'local'; official: string; common: string; label: string; sub: string; glyph?: GlyphName; text: string }> = {
    central: {
      branch: 'national',
      official: scope.kind === 'budgetary' ? 'Budgetary central government' : scope.parts[0].sectors.includes('S1321') ? 'Central government including social security funds' : hasSsf(scope.parts[0].sectors) ? 'Central government and social security funds' : 'Central government',
      common: scope.kind === 'budgetary' ? 'Budgetary central government' : hasSsf(scope.parts[0].sectors) || scope.parts[0].sectors.includes('S1321') ? 'Central government and social security' : 'Central government',
      label: scope.kind === 'budgetary' ? 'Budgetary central govt' : hasSsf(scope.parts[0].sectors) || scope.parts[0].sectors.includes('S1321') ? 'Central govt and social funds' : 'Central government',
      sub: `IMF ${sectorText(scope.parts[0].sectors)}`,
      text: scope.kind === 'budgetary' ? 'the budgetary central government (the units that the national budget covers)' : hasSsf(scope.parts[0].sectors) ? 'the central government together with its social security funds' : 'the central government',
    },
    state: { branch: 'regional', official: 'State, provincial or regional governments', common: 'Regional governments', label: 'Regional governments', sub: 'IMF S1312', text: 'the state, provincial or regional governments' },
    local: { branch: 'local', official: 'Local governments', common: 'Local governments', label: 'Local governments', sub: 'IMF S1313', text: 'the local governments' },
  };
  const levelKeys = scope.parts.map((p) => p.level);

  /* sources */
  const apiUrl = `https://api.imf.org/external/sdmx/2.1/data/IMF.STA,GFS_SOO/${imf}.*.G1.*.XDC.A?startPeriod=2016`;
  const sources: Source[] = [
    { id: 'imf-gfs-api', org: 'International Monetary Fund', title: `Government Finance Statistics, Statement of Operations (GFS_SOO): revenue series of ${en}, domestic currency, annual`, url: apiUrl, kind: 'statistics', language: 'en', publishedDate: TODAY, periodCovered: `${year}`, accessed: TODAY, note: 'The series used, as the IMF’s SDMX interface returns them (XML). The values are in units of domestic currency.' },
    { id: 'imf-gfs-soo', org: 'International Monetary Fund', title: 'IMF Data: GFS Statement of Operations (GFS_SOO), dataset page', url: 'https://data.imf.org/en/datasets/IMF.STA:GFS_SOO', kind: 'statistics', language: 'en', publishedDate: null, accessed: TODAY, note: 'The dataset page: description, metadata and download.' },
    { id: 'imf-gfs-codes', org: 'International Monetary Fund', title: 'Codelist CL_GFS_INDICATOR (names of the classification lines of GFS_SOO)', url: 'https://api.imf.org/external/sdmx/2.1/codelist/IMF.STA/CL_GFS_INDICATOR/12.0.0', kind: 'statistics', language: 'en', publishedDate: null, accessed: TODAY, note: 'Gives the name of each line (for example G1111_T, taxes on income, profits and capital gains payable by individuals), which follow the Government Finance Statistics Manual 2014.' },
  ];

  /* basis and nature flags of the headline series */
  const first = scope.parts[0].sectors[0];
  const flag = file.sectors[first]?.G11_T?.[String(year)];
  const basis = flag?.basis === 'AC' ? 'Accrual basis, as reported to the IMF (flag AC)' : flag?.basis === 'CA' ? 'Cash basis, as reported to the IMF (flag CA)' : 'As reported to the IMF';
  const nature = flag?.nature === 'P' ? 'The IMF flags the figures for this year as preliminary.' : 'The IMF flags the figures for this year as actual.';
  const period = { label: `${year}`, kind: 'calendar-year' as const, start: `${year}-01-01`, end: `${year}-12-31` };
  const yearNote = `The IMF labels the series ${year}; where the country’s fiscal year is not the calendar year, this is the fiscal year the IMF assigns to ${year}.`;

  /* denominators, groups, instruments */
  const denominators: DenSpec[] = [];
  const groups: Record<string, GroupSpec> = {};
  const instruments: InstSpec[] = [];
  const levels: LevelSpec[] = [];
  const negativeNotes: string[] = [];
  for (const { part, ex } of extractions) {
    const lk = part.level;
    const info = LV[lk];
    const mine = drawn.filter((d) => d.levelKey === lk);
    const sum = mine.reduce((a, d) => a + d.leaf.amount, 0);
    const denId = `${lk}-${year}`;
    const secText = sectorText(part.sectors);
    const lvl: LevelSpec = {
      id: lk,
      branch: info.branch,
      official: info.official,
      common: info.common,
      description: `${info.official} as the IMF’s Government Finance Statistics classify them (sector ${secText}).`,
      fiscalPower: 'This folio records what each line of the IMF’s classification raised; it does not describe which taxes this level may set or keep.',
      refs: [['imf-gfs-api', `sector ${secText}`]],
      label: info.label,
      sub: info.sub,
      glyph: lk === 'central' ? 'landmark' : lk === 'state' ? 'city' : 'town',
    };
    levels.push(lvl);
    const negs = ex.negatives.map((x) => `${x.code} (${money(x.amount, cur)})`);
    if (negs.length) negativeNotes.push(`${info.common}: negative line${negs.length > 1 ? 's' : ''} ${negs.join(', ')} not drawn`);
    const diff = sum - ex.reported;
    denominators.push({
      id: denId,
      label: `Taxes and social contributions of ${info.text}, ${year}`,
      definition: `The taxes (GFS 11) and actual social contributions (GFS 12) of ${info.text} that the IMF reports for ${year}, in ${cur}; imputed social contributions are left out.`,
      levelIds: [lk],
      amount: Number(mine.reduce((a, d) => a + million(d.leaf.amount), 0).toFixed(6)),
      period,
      sourceId: 'imf-gfs-api',
      locator: `Series ${imf}.${secText}.G1, indicators G11_T and G12_T and their sub-lines, XDC, annual, ${year}`,
      calculation: `Sum of the ${mine.length} lines drawn (${cur} million). The IMF reports ${n(ex.reported / 1e6, 3)} million for the sector; the lines drawn differ from it by ${n((diff / 1e6), 3)} million${ex.negatives.length ? ' (negative lines are not drawn)' : ' (rounding between levels of the classification)'}.`,
      caveat: `${nature} ${yearNote}`,
    });
    groups[lk] = { title: `${info.common}: lines of the IMF series, ${year}`, denominatorId: denId, period, basis, sourceId: 'imf-gfs-api', coverage: 'exact' };
    for (const d of mine) {
      const code = d.leaf.code;
      const baseCode = code.replace(':other', '');
      const line: LineInfo | undefined = LINE[code];
      const slugCode = code.toLowerCase().replace(/_t/g, '').replace(':', '-');
      const instId = `${iso2}-${lk}-${slugCode}`;
      const share = d.leaf.amount / grandDrawn;
      let common: string;
      let official: string;
      let label: string;
      let sub: string;
      let glyph: GlyphName;
      let family: Family;
      let category: Category | undefined;
      let base: string;
      let payer: string;
      let locator: string;
      let calculation: string | undefined;
      if (line && !d.leaf.residualOf && !d.leaf.merged) {
        ({ common, label, sub, glyph, family, base, payer } = line);
        category = line.category;
        official = CODE_NAME[code];
        locator = `Series ${imf}.${secText}.G1.${code}.XDC.A, ${year}`;
        if (secText.includes('+')) calculation = `Sum of the sectors ${secText} (${cur} million)`;
      } else if (d.leaf.residualOf) {
        const p = d.leaf.residualOf;
        const sh = SHORT[p] ?? CODE_NAME[p].toLowerCase();
        common = `Other ${sh} (not itemised)`;
        official = `${CODE_NAME[p]}, not itemised in the IMF series`;
        label = cut(`Other ${sh}`, 30);
        sub = 'Not itemised';
        glyph = PARENT_GLYPH[p] ?? 'gear';
        family = PARENT_FAMILY[p] ?? 'other';
        category = family === 'social-security' ? SOCIAL : undefined;
        base = `The part of the line “${CODE_NAME[p]}” (GFS ${p.replace('_T', '')}) that the IMF series does not itemise: the line itself minus its reported sub-lines.`;
        payer = 'Various.';
        locator = `Series ${imf}.${secText}.G1.${p}.XDC.A, ${year}, less its reported sub-lines`;
        calculation = `${p} less the sum of its reported sub-lines (${cur} million)`;
      } else {
        const social = d.leaf.kind === 'social';
        const list = (d.leaf.merged ?? []).map((c) => `${c.replace('_T', '')} ${CODE_NAME[c] ?? c}`).join('; ');
        common = social ? 'Other social contributions (small lines)' : 'Other taxes (small lines)';
        official = common;
        label = social ? 'Other social (small)' : 'Other taxes (small lines)';
        sub = `${d.leaf.merged!.length} lines`;
        glyph = social ? 'heart' : 'gear';
        family = social ? 'social-security' : 'other';
        category = social ? SOCIAL : undefined;
        base = `${d.leaf.merged!.length} lines of the IMF series that are each below 0.15% of the total, folded together: ${list}.`;
        payer = 'Various.';
        locator = `Series ${imf}.${secText}.G1, indicators ${d.leaf.merged!.join(', ')}, XDC, annual, ${year}`;
        calculation = `Sum of ${d.leaf.merged!.length} lines, each below 0.15% of the total (${cur} million)`;
      }
      d.family = family;
      instruments.push({
        id: instId,
        parent: lk,
        level: lk,
        ...(category ? { category } : {}),
        family,
        official,
        common,
        base,
        payer,
        rate: { kind: 'varies', headline: 'Not recorded in this folio', details: ['This folio records what the line raised. Rates, brackets and exemptions are set by the country’s tax laws and are not recorded here.'], asOf: TODAY },
        explanation: `${money(d.leaf.amount, cur)} in ${year}: ${pct(share)} of the taxes and social contributions drawn in this folio.`,
        exceptions: [],
        refs: [['imf-gfs-codes', baseCode.replace('_T', '')], ['imf-gfs-api', locator]],
        label: cut(label, 30),
        sub,
        glyph,
        rev: { group: lk, amount: million(d.leaf.amount), locator, ...(calculation ? { calculation } : {}) },
      });
    }
  }

  /* summary and notes */
  const top = [...drawn].sort((a, b) => b.leaf.amount - a.leaf.amount).slice(0, 3);
  const nameOf = (d: Drawn) => (LINE[d.leaf.code]?.common ?? (d.leaf.residualOf ? `Other ${SHORT[d.leaf.residualOf] ?? ''}`.trim() : d.leaf.name)).toLowerCase();
  const famSum = (fs_: Family[]) => drawn.filter((d) => d.family && fs_.includes(d.family)).reduce((a, d) => a + d.leaf.amount, 0) / grandDrawn;
  const goods = famSum(['general-consumption', 'specific-consumption']);
  const income = famSum(['income-personal', 'income-corporate', 'income-mixed']);
  const social = famSum(['social-security']);
  const scopeText = scope.kind === 'general' ? 'the general government' : scope.kind === 'budgetary' ? 'the budgetary central government' : scope.kind === 'central' ? 'the central government' : 'the central government and its social security funds';
  const summary =
    `${en} is shown at the grain of the IMF’s Government Finance Statistics: ${scopeText}, ${n(drawn.length)} lines of taxes and social contributions for ${year}, in ${cur}. ` +
    `The largest line is ${nameOf(top[0])} (${pct(top[0].leaf.amount / grandDrawn)}), then ${nameOf(top[1])} (${pct(top[1].leaf.amount / grandDrawn)}) and ${nameOf(top[2])} (${pct(top[2].leaf.amount / grandDrawn)}). ` +
    `Taxes on goods and services (VAT, sales taxes, excises, vehicle and similar taxes) make ${pct(goods)} of the total and income taxes ${pct(income)}${social > 0 ? `; social contributions are ${pct(social)}` : '; the IMF series reports no actual social contributions for this sector'}. ` +
    'The folio records what each line raised; it does not describe the country’s tax laws, rates or the names of its individual taxes.';
  const notes: string[] = [
    `This folio is built from one source, the IMF’s Government Finance Statistics (Statement of Operations), for ${year}: ${scope.note}.`,
    scope.kind === 'budgetary' || scope.kind === 'central'
      ? 'Taxes of regional and local governments and of social security funds that are not in this sector are not drawn, so the folio is partial and every line’s share is a share of this sector’s total only.'
      : scope.kind === 'central-ssf'
        ? 'Sub-national governments are not drawn: the IMF series does not report taxes for them in this year.'
        : 'Every level that the IMF series reports with detail in this year is drawn; the sum of the levels equals the general-government total within 1.5%.',
    imputedTotal(extractions) ? `Imputed social contributions (${money(imputedTotal(extractions), cur)}) are not cash taxes and are left out.` : '',
    ...negativeNotes,
    'Lines below 0.15% of the total are folded into one “small lines” core per level; lines that the IMF reports only as a parent are drawn as the parent. Rates, legal bases and the names of the individual taxes are not recorded.',
    yearNote,
    'The figures are the IMF’s and have not been compared with the country’s own statistics. There is no OECD level layer for this country in the atlas.',
  ].filter(Boolean);

  const spec: CountrySpec = {
    today: TODAY,
    id,
    iso3: cc,
    isoNumeric: meta.ccn3,
    names: { en, native: nativeName, nativeLang },
    currency: { code: cur, symbol: curCode.symbol, name: curCode.name },
    summary,
    structureNote: notes.join(' '),
    theme: {
      accent: hsl(hue, 0.62, 0.56),
      accent2: hsl((hue + 40) % 360, 0.5, 0.84),
      motif: 'topo',
      motifNote: `Topographic contour lines over the outline of ${en} (the generic motif).`,
      mapLabel: { lon: meta.latlng[1], lat: meta.latlng[0] },
    },
    rootLabel: { label: en.length > 30 ? en.replace(/ and the /, ' & the ').replace('Saint', 'St') : en, sub: 'Fiscal folio · IMF lines' },
    researchStatus: scope.kind === 'general' ? 'researched' : 'partial',
    grain: 'harmonised',
    levels,
    supporting: ['imf-gfs-soo'],
    denominators,
    sizing: {
      label: `Taxes and actual social contributions reported to the IMF, ${year}`,
      definition: `The taxes (GFS 11) and actual social contributions (GFS 12) of ${levelKeys.map((k) => LV[k].text).join(', ')} for ${year}, as the IMF’s Government Finance Statistics report them in ${cur}. Imputed social contributions are left out; sectors that the IMF series does not report in detail for ${year} are not included.`,
      componentIds: denominators.map((d) => d.id),
    },
    sources,
    groups,
    instruments,
    // An OECD member whose harmonised layer was collected as a profile: the profile becomes the folio's structure.json
    // (and, once the profile is retired, a rerun keeps the structure.json and OECD sources already in the folder).
    ...(fs.existsSync(path.join(ROOT, 'profiles', `${id}.json`)) || fs.existsSync(path.join(ROOT, 'countries', id, 'structure.json'))
      ? {
          fromProfile: id,
          structureOverride: { folioLevels: { central: levelKeys.includes('central') ? ['central'] : [], regional: levelKeys.includes('state') ? ['state'] : [], local: levelKeys.includes('local') ? ['local'] : [] } },
        }
      : {}),
  };
  buildCountry(spec);
  return { id, name: en, scope, status: spec.researchStatus ?? 'researched' };
}

function imputedTotal(extractions: { ex: { imputed: number } }[]): number {
  return extractions.reduce((a, e) => a + e.ex.imputed, 0);
}

/* ------------------------------------------------------------------ run */
const args = process.argv.slice(2);
const all = fs
  .readdirSync(DATA)
  .map((f) => /^gfs-([A-Z]{3})\.json$/.exec(f)?.[1])
  .filter((x): x is string => !!x)
  .sort();
const todo = args.length ? args : all;
const built: string[] = [];
const skipped: string[] = [];
for (const cc of todo) {
  const res = build(cc);
  if (res) built.push(`${cc}:${res.id}`);
  else skipped.push(cc);
}
console.log(`built ${built.length}, skipped ${skipped.length}${skipped.length ? ': ' + skipped.join(' ') : ''}`);
