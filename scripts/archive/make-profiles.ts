/* One-off: writes profiles/<id>.json for the OECD members that have no folio yet. Kept for provenance only: it records how the first data was imported. Do NOT re-run it, it would overwrite later edits.
   Numbers were read from OECD Revenue Statistics 2025 (Tables 3.1 and 6.x); every row carries a checksum
   from the source page, so a transcription slip fails loudly. */
import fs from 'node:fs';
import path from 'node:path';
import { formatJson } from '../lib/format-json';

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any
const ROOT = process.cwd();
const outDir = path.join(ROOT, 'profiles');
fs.mkdirSync(outDir, { recursive: true });

/** name|currency|scale|central;regional;local;social  (each: income,ssc,payroll,property,goods,other,total,beneficiary)|checksum */
const RAW = `Australia|AUD|Million|495494,0,1912,15,147306,0,644727,_;0,0,38822,54177,37483,0,130482,_;0,0,0,23100,0,0,23100,_;0,0,0,0,0,0,0,_|1596618
Austria|EUR|Million|60036,9979,6875,1327,53581,549,132347,_;951,977,1316,54,488,112,3898,_;0,218,4649,816,532,82,6297,_;0,60201,0,0,0,0,60201,_|405486
Belgium|EUR|Million|75376,62,0,2534,53339,0,131311,_;12341,295,0,8476,3567,0,24678,_;3991,20,0,7040,747,0,11798,_;1367,76718,6,365,1853,0,80308,_|496192
Chile|CLP|Million|20433071,610121,0,1456116,28832960,-854527,50477740,_;_,_,_,_,_,_,_,_;0,0,0,2337996,2666421,0,5004416,_;0,2671858,0,0,0,0,2671858,_|116308030
Costa Rica|CRC|Million|2486519,554243,0,65393,3746704,222541,7075402,_;_,_,_,_,_,_,_,_;0,0,0,155404,169947,78,325429,_;0,3637837,693618,0,0,0,4331455,_|23464570
Czechia|CZK|Million|587607,0,0,37,763353,633,1351630,_;_,_,_,_,_,_,_,_;0,0,0,12452,11640,0,24092,_;0,1159768,0,0,0,0,1159768,_|5070980
Denmark|DKK|Million|523852,1565,7309,14362,347597,5855,900540,_;_,_,_,_,_,_,_,_;297251,0,0,33549,0,0,330800,_;0,542,0,0,0,0,542,_|2463764
Estonia|EUR|Million|3108,2481,0,0,5073,0,10661,_;_,_,_,_,_,_,_,_;0,0,0,59,15,0,74,_;0,2098,0,0,0,0,2098,_|25667
Finland|EUR|Million|31612,0,0,1751,35799,79,69241,_;_,_,_,_,_,_,_,_;10960,0,0,2083,1,0,13044,_;0,33911,0,0,0,0,33911,_|232392
France|EUR|Million|176204,7957,16532,27236,139084,3742,370755,_;_,_,_,_,_,_,_,_;48,0,11391,70426,83977,11538,177380,_;157121,405533,27201,0,90279,9164,689298,_|2474866
Germany|EUR|Million|201410,0,0,1622,244742,0,447774,_;192485,0,0,23056,157616,0,373157,_;116200,0,0,13927,9517,407,140051,_;0,604323,0,0,0,0,604323,_|3130610
Greece|EUR|Million|20976,64,0,3917,34815,0,59772,_;_,_,_,_,_,_,_,_;0,0,0,1814,151,0,1965,_;8,25181,0,0,262,0,25451,_|174376
Hungary|HUF|Million|5739936,357425,423168,340244,10490214,89751,17440738,_;_,_,_,_,_,_,_,_;63,0,0,212076,1280936,0,1493075,_;1,7108476,9659,0,200494,16086,7334716,_|52537058
Iceland|ISK|Million|463737,131613,11563,13670,493843,15804,1130230,_;_,_,_,_,_,_,_,_;344990,0,0,82302,10042,0,437335,_;0,0,0,0,0,0,0,_|3135129
Ireland|EUR|Million|58748,1784,1058,3473,28470,14,93548,_;_,_,_,_,_,_,_,_;0,113,0,1663,0,0,1775,_;0,15476,0,0,0,0,15476,_|221598
Israel|ILS|Million|207587,0,17600,14416,179766,0,419369,_;_,_,_,_,_,_,_,_;0,0,0,45450,1751,0,47202,_;0,93818,0,0,0,0,93818,_|1120777
Italy|EUR|Million|287674,0,0,27791,210712,0,526177,_;_,_,_,_,_,_,_,_;19191,0,0,19813,28181,29088,96273,_;0,263046,0,0,0,0,263046,_|1770992
Korea|KRW|Billion|197639,0,0,31028,109705,5700,344072,_;_,_,_,_,_,_,_,_;23244,0,2138,43280,36386,7415,112463,_;0,188692,0,0,0,0,188692,_|1290454
Latvia|EUR|Million|1167,140,3,48,5351,0,6710,_;_,_,_,_,_,_,_,_;1899,0,0,237,15,0,2151,_;0,3932,0,8,0,0,3940,_|25601
Lithuania|EUR|Million|7695,0,0,15,8088,0,15798,_;_,_,_,_,_,_,_,_;0,0,0,205,45,0,250,_;0,7527,0,0,8,0,7534,_|47165
Luxembourg|EUR|Million|11846,274,0,2741,7303,24,22187,_;_,_,_,_,_,_,_,_;1295,0,0,67,11,1,1374,_;0,8878,0,0,0,0,8878,_|64879
Netherlands|EUR|Million|148221,0,0,6053,110230,1326,265830,_;_,_,_,_,_,_,_,_;0,0,0,7220,5738,53,13011,_;0,129202,0,0,0,0,129202,_|816086
New Zealand|NZD|Million|83614,0,0,198,48682,0,132494,_;_,_,_,_,_,_,_,_;0,0,0,8199,1002,0,9201,_;0,0,0,0,0,0,0,_|283390
Norway|NOK|Million|872729,471103,2589,22220,487082,0,1855723,_;_,_,_,_,_,_,_,_;228921,0,0,37526,1652,0,268099,_;0,0,0,0,0,0,0,_|4247644
Poland|PLN|Million|164334,0,19547,0,429086,0,612967,_;_,_,_,_,_,_,_,_;76039,0,0,39245,4452,1670,121406,_;0,456088,0,0,1743,0,457831,_|2384408
Portugal|EUR|Million|26999,2394,0,627,33428,355,63803,_;_,_,_,_,_,_,_,_;699,0,0,3199,1614,10,5523,_;0,25333,0,0,235,0,25568,_|189787
Slovak Republic|EUR|Million|9607,475,0,0,14338,0,24420,_;_,_,_,_,_,_,_,_;0,0,0,510,278,0,788,_;0,18027,0,0,0,0,18027,_|86470
Slovenia|EUR|Million|4750,101,28,79,8058,0,13015,_;_,_,_,_,_,_,_,_;0,0,0,273,26,0,298,_;0,9885,0,0,0,0,9885,_|46398
Spain|EUR|Million|104588,3516,0,1115,117319,150,226688,_;62971,0,0,15145,8566,11,86693,_;8901,0,0,17467,16518,1,42887,_;0,185502,0,0,0,0,185502,_|1083540
Sweden|SEK|Million|14824,234667,323725,28228,719561,2057,1323061,_;_,_,_,_,_,_,_,_;893371,0,0,22427,0,0,915797,_;0,315412,0,0,0,0,315412,_|5108542
Switzerland|CHF|Million|32548,0,0,1383,38669,69,72669,_;42956,0,0,9515,3166,449,56086,_;28308,0,0,5650,271,546,34776,_;0,53663,0,0,0,0,53663,_|434387
Türkiye|TRY|Million|1314497,0,0,134633,2497878,27895,3974902,_;_,_,_,_,_,_,_,_;165866,0,0,49298,311653,29932,556749,_;0,1631425,0,0,0,0,1631425,_|12326153
United Kingdom|GBP|Million|377468,0,3794,54127,286113,0,721502,_;_,_,_,_,_,_,_,_;0,0,0,45550,0,0,45550,_;0,180922,0,0,0,0,180922,_|1895948`;

interface Ident { id: string; iso3: string; num: string; native: string; lang: string; accent: string; flag: string[]; gdp: number; sng: [number, number, number, number, number, number]; sngSlug: string; table: string }
// gdp = total tax revenue as % of GDP, 2023 (Table 3.1). sng = [tax, grants, fees, property, other, year] (SNG-WOFI, % of subnational revenue)
const I: Record<string, Ident> = {
  Australia: { id: 'australia', iso3: 'AUS', num: '036', native: 'Australia', lang: 'en', accent: '#5fa8ff', flag: ['#00247d', '#ffffff', '#cf142b'], gdp: 29.9, sng: [32.6, 45.7, 12.8, 9.0, 0, 2020], sngSlug: 'australia', table: '6.1' },
  Austria: { id: 'austria', iso3: 'AUT', num: '040', native: 'Österreich', lang: 'de', accent: '#ff5a66', flag: ['#ed2939', '#ffffff', '#ed2939'], gdp: 42.6, sng: [11.3, 72.8, 11.8, 2.0, 2.2, 2020], sngSlug: 'austria', table: '6.2' },
  Belgium: { id: 'belgium', iso3: 'BEL', num: '056', native: 'België / Belgique', lang: 'nl', accent: '#ffd23f', flag: ['#000000', '#fdda24', '#ef3340'], gdp: 41.9, sng: [27.3, 56.4, 8.1, 1.6, 6.7, 2020], sngSlug: 'belgium', table: '6.3' },
  Chile: { id: 'chile', iso3: 'CHL', num: '152', native: 'Chile', lang: 'es', accent: '#6aa0ff', flag: ['#0039a6', '#ffffff', '#d52b1e'], gdp: 20.6, sng: [41.0, 56.1, 2.6, 0.28, 0, 2020], sngSlug: 'chile', table: '6.5' },
  'Costa Rica': { id: 'costa-rica', iso3: 'CRI', num: '188', native: 'Costa Rica', lang: 'es', accent: '#6aa0ff', flag: ['#002b7f', '#ffffff', '#ce1126'], gdp: 24.9, sng: [39.5, 24.0, 32.6, 2.6, 1.3, 2020], sngSlug: 'costa_rica', table: '6.7' },
  Czechia: { id: 'czechia', iso3: 'CZE', num: '203', native: 'Česko', lang: 'cs', accent: '#7aa2ff', flag: ['#11457e', '#ffffff', '#d7141a'], gdp: 33.2, sng: [41.4, 46.7, 10.5, 1.1, 0.3, 2020], sngSlug: 'czech_republic', table: '6.8' },
  Denmark: { id: 'denmark', iso3: 'DNK', num: '208', native: 'Danmark', lang: 'da', accent: '#ff5a66', flag: ['#c8102e', '#ffffff', '#c8102e'], gdp: 44.0, sng: [36.5, 58.6, 4.6, 0.3, 0.1, 2020], sngSlug: 'denmark', table: '6.9' },
  Estonia: { id: 'estonia', iso3: 'EST', num: '233', native: 'Eesti', lang: 'et', accent: '#6aa0ff', flag: ['#0072ce', '#000000', '#ffffff'], gdp: 33.6, sng: [2.4, 88.8, 7.8, 0.73, 0.22, 2019], sngSlug: 'estonia', table: '6.10' },
  Finland: { id: 'finland', iso3: 'FIN', num: '246', native: 'Suomi', lang: 'fi', accent: '#7aa2ff', flag: ['#ffffff', '#003580', '#ffffff'], gdp: 42.8, sng: [45.2, 33.2, 19.4, 2.3, 0, 2020], sngSlug: 'finland', table: '6.11' },
  France: { id: 'france', iso3: 'FRA', num: '250', native: 'France', lang: 'fr', accent: '#6aa0ff', flag: ['#0055a4', '#ffffff', '#ef4135'], gdp: 43.9, sng: [50.5, 33.4, 14.7, 1.0, 0.3, 2020], sngSlug: 'france', table: '6.12' },
  Germany: { id: 'germany', iso3: 'DEU', num: '276', native: 'Deutschland', lang: 'de', accent: '#ffcc33', flag: ['#000000', '#dd0000', '#ffce00'], gdp: 37.3, sng: [52.0, 32.5, 10.9, 0.8, 3.8, 2020], sngSlug: 'germany', table: '6.13' },
  Greece: { id: 'greece', iso3: 'GRC', num: '300', native: 'Ελλάδα', lang: 'el', accent: '#6ab0ff', flag: ['#0d5eaf', '#ffffff', '#0d5eaf'], gdp: 38.9, sng: [24.8, 64.1, 10.3, 0.8, 0, 2020], sngSlug: 'greece', table: '6.14' },
  Hungary: { id: 'hungary', iso3: 'HUN', num: '348', native: 'Magyarország', lang: 'hu', accent: '#5fd18a', flag: ['#ce2939', '#ffffff', '#477050'], gdp: 35.0, sng: [29.0, 58.6, 11.5, 0.8, 0.2, 2020], sngSlug: 'hungary', table: '6.15' },
  Iceland: { id: 'iceland', iso3: 'ISL', num: '352', native: 'Ísland', lang: 'is', accent: '#6aa0ff', flag: ['#02529c', '#ffffff', '#dc1e35'], gdp: 35.9, sng: [77.9, 10.1, 8.5, 3.5, 0, 2020], sngSlug: 'iceland', table: '6.16' },
  Ireland: { id: 'ireland', iso3: 'IRL', num: '372', native: 'Éire', lang: 'ga', accent: '#4fd18a', flag: ['#169b62', '#ffffff', '#ff883e'], gdp: 21.3, sng: [8.3, 75.8, 11.7, 0.2, 4.0, 2020], sngSlug: 'ireland', table: '6.17' },
  Israel: { id: 'israel', iso3: 'ISR', num: '376', native: 'ישראל', lang: 'he', accent: '#6aa0ff', flag: ['#0038b8', '#ffffff', '#0038b8'], gdp: 29.8, sng: [39.7, 54.0, 4.1, 0.8, 1.5, 2020], sngSlug: 'israel', table: '6.18' },
  Italy: { id: 'italy', iso3: 'ITA', num: '380', native: 'Italia', lang: 'it', accent: '#4fd18a', flag: ['#009246', '#ffffff', '#ce2b37'], gdp: 41.5, sng: [26.8, 60.8, 10.6, 1.4, 0.5, 2020], sngSlug: 'italy', table: '6.19' },
  Korea: { id: 'korea', iso3: 'KOR', num: '410', native: '대한민국', lang: 'ko', accent: '#ff5a66', flag: ['#ffffff', '#cd2e3a', '#0047a0'], gdp: 26.9, sng: [29.7, 63.7, 5.0, 0.7, 0.9, 2020], sngSlug: 'korea', table: '6.21' },
  Latvia: { id: 'latvia', iso3: 'LVA', num: '428', native: 'Latvija', lang: 'lv', accent: '#d05a6a', flag: ['#9e3039', '#ffffff', '#9e3039'], gdp: 32.5, sng: [50.5, 41.2, 7.1, 0.4, 0.9, 2020], sngSlug: 'latvia', table: '6.22' },
  Lithuania: { id: 'lithuania', iso3: 'LTU', num: '440', native: 'Lietuva', lang: 'lt', accent: '#ffd23f', flag: ['#fdb913', '#006a44', '#c1272d'], gdp: 32.1, sng: [3.6, 89.7, 5.5, 0.9, 0.4, 2020], sngSlug: 'lithuania', table: '6.23' },
  Luxembourg: { id: 'luxembourg', iso3: 'LUX', num: '442', native: 'Lëtzebuerg', lang: 'lb', accent: '#5fc3ff', flag: ['#ed2939', '#ffffff', '#00a1de'], gdp: 39.8, sng: [32.3, 52.1, 14.4, 1.1, 0.1, 2020], sngSlug: 'luxembourg', table: '6.24' },
  Netherlands: { id: 'netherlands', iso3: 'NLD', num: '528', native: 'Nederland', lang: 'nl', accent: '#ff8a5a', flag: ['#ae1c28', '#ffffff', '#21468b'], gdp: 39.3, sng: [9.9, 74.9, 11.9, 1.8, 1.6, 2020], sngSlug: 'netherlands', table: '6.26' },
  'New Zealand': { id: 'new-zealand', iso3: 'NZL', num: '554', native: 'Aotearoa', lang: 'mi', accent: '#6aa0ff', flag: ['#00247d', '#ffffff', '#cc142b'], gdp: 33.7, sng: [55.8, 22.0, 18.0, 4.1, 0, 2020], sngSlug: 'new_zealand', table: '6.27' },
  Norway: { id: 'norway', iso3: 'NOR', num: '578', native: 'Norge', lang: 'no', accent: '#ff5a66', flag: ['#ba0c2f', '#ffffff', '#00205b'], gdp: 41.6, sng: [36.2, 47.5, 13.4, 2.5, 0.4, 2020], sngSlug: 'norway', table: '6.28' },
  Poland: { id: 'poland', iso3: 'POL', num: '616', native: 'Polska', lang: 'pl', accent: '#ff5a66', flag: ['#ffffff', '#dc143c', '#ffffff'], gdp: 34.9, sng: [29.3, 63.5, 6.1, 0.7, 0.4, 2020], sngSlug: 'poland', table: '6.29' },
  Portugal: { id: 'portugal', iso3: 'PRT', num: '620', native: 'Portugal', lang: 'pt', accent: '#4fd18a', flag: ['#006600', '#ff0000', '#ffe000'], gdp: 35.3, sng: [38.6, 37.1, 16.2, 2.8, 5.3, 2020], sngSlug: 'portugal', table: '6.30' },
  'Slovak Republic': { id: 'slovak-republic', iso3: 'SVK', num: '703', native: 'Slovensko', lang: 'sk', accent: '#6aa0ff', flag: ['#ffffff', '#0b4ea2', '#ee1c25'], gdp: 35.1, sng: [7.0, 81.2, 10.4, 0.6, 0.7, 2020], sngSlug: 'slovak_republic', table: '6.31' },
  Slovenia: { id: 'slovenia', iso3: 'SVN', num: '705', native: 'Slovenija', lang: 'sl', accent: '#6aa0ff', flag: ['#ffffff', '#005da5', '#ed1c24'], gdp: 36.4, sng: [39.7, 44.6, 14.1, 0.36, 1.2, 2020], sngSlug: 'slovenia', table: '6.32' },
  Spain: { id: 'spain', iso3: 'ESP', num: '724', native: 'España', lang: 'es', accent: '#ffcc33', flag: ['#aa151b', '#f1bf00', '#aa151b'], gdp: 36.4, sng: [37.5, 55.1, 6.8, 0.3, 0.2, 2020], sngSlug: 'spain', table: '6.33' },
  Sweden: { id: 'sweden', iso3: 'SWE', num: '752', native: 'Sverige', lang: 'sv', accent: '#ffd23f', flag: ['#006aa7', '#fecc00', '#006aa7'], gdp: 41.7, sng: [50.4, 38.8, 8.7, 1.2, 1.0, 2020], sngSlug: 'sweden', table: '6.34' },
  Switzerland: { id: 'switzerland', iso3: 'CHE', num: '756', native: 'Schweiz / Suisse / Svizzera', lang: 'de', accent: '#ff5a66', flag: ['#d52b1e', '#ffffff', '#d52b1e'], gdp: 26.9, sng: [53.3, 24.3, 17.7, 4.5, 0.4, 2020], sngSlug: 'switzerland', table: '6.35' },
  Türkiye: { id: 'turkiye', iso3: 'TUR', num: '792', native: 'Türkiye', lang: 'tr', accent: '#ff5a66', flag: ['#e30a17', '#ffffff', '#e30a17'], gdp: 23.2, sng: [10.4, 75.2, 11.3, 1.4, 1.8, 2020], sngSlug: 'republic_of_turkiye', table: '6.36' },
  'United Kingdom': { id: 'united-kingdom', iso3: 'GBR', num: '826', native: 'United Kingdom', lang: 'en', accent: '#6aa0ff', flag: ['#012169', '#ffffff', '#c8102e'], gdp: 35.0, sng: [16.8, 67.7, 13.4, 0.8, 1.4, 2020], sngSlug: 'united_kingdom', table: '6.37' },
};
const FEDERAL_LABEL = new Set(['Australia', 'Austria', 'Belgium', 'Germany', 'Spain', 'Switzerland']);

let written = 0;
for (const line of RAW.split('\n')) {
  const [name, cur, unit, body, ck] = line.split('|');
  const meta = I[name];
  if (!meta) throw new Error(`no identity for ${name}`);
  const parse = (s: string): (number | null)[] => s.split(',').map((x) => (x === '_' ? null : Number(x)));
  const L = body.split(';').map(parse);
  const sum = L.flat().reduce<number>((a, x) => a + (x ?? 0), 0);
  if (String(sum) !== ck) throw new Error(`${name}: checksum ${sum} != ${ck} (transcription error)`);
  const mk = (row: (number | null)[], key: string, label: string, ids: string[] = []) => {
    const total = row[6];
    if (total === null || total === 0) return null;
    const v = row.slice(0, 6).map((x) => x ?? 0);
    const s = v.reduce((a, b) => a + b, 0);
    if (Math.abs(s - total) > Math.max(3, Math.abs(total) * 0.002)) throw new Error(`${name}/${key}: ${s} vs ${total}`);
    return { key, label, folioLevelIds: ids, total, byType: { income: v[0], socialSecurity: v[1], payroll: v[2], property: v[3], goodsServices: v[4], other: v[5] } };
  };
  const levels = [
    mk(L[0], 'central', FEDERAL_LABEL.has(name) ? 'Federal government' : 'Central government'),
    mk(L[1], 'regional', 'State / regional governments'),
    mk(L[2], 'local', 'Local governments'),
    mk(L[3], 'social-security', 'Social security funds'),
  ].filter(Boolean);
  const [tax, grants, fees, prop, other, year] = meta.sng;
  const catSum = tax + grants + fees + prop + other;
  if (Math.abs(catSum - 100) > 0.7) throw new Error(`${name}: subnational categories add up to ${catSum}`);
  const structure: Any = {
    version: 1,
    referenceYear: 2023,
    currency: cur,
    scale: unit.toLowerCase(),
    taxToGdp: meta.gdp,
    basis: 'Collecting government',
    levels,
    sourceIds: ['oecd-rs-2025-subsectors', 'oecd-rs-2025-levels'],
    subnational: { ownSourceTaxShareOfRevenue: tax, grantsShareOfRevenue: grants, year, sourceId: 'sng-wofi-profile', note: `Tariffs and fees ${fees}%, property income ${prop}%, other ${other}% of subnational revenue.` },
    notes: [],
  };
  if (name === 'Chile') structure.notes.push('The OECD source nets unallocated adjustments into "other taxes", which is therefore slightly negative.');
  if (name === 'Chile' || name === 'Costa Rica') structure.notes.push('This is a unitary state: the source reports no regional tax collection.');
  const sources = [
    {
      id: 'oecd-rs-2025-subsectors',
      org: 'OECD',
      title: `Revenue Statistics 2025, Table ${meta.table}: ${name}, tax revenues by sub-sectors of government`,
      url: 'https://www.oecd.org/en/publications/revenue-statistics-2025_3a264267-en/full-report/tax-revenues-by-subsectors-of-general-government_f9e88332.html',
      kind: 'international',
      language: 'en',
      publishedDate: '2025-12-09',
      periodCovered: 'Calendar year 2023 (national currency)',
      accessed: '2026-09-29',
      note: 'Harmonised OECD classification of taxes (1000–6000) split by collecting sub-sector of general government.',
    },
    {
      id: 'oecd-rs-2025-levels',
      org: 'OECD',
      title: 'Revenue Statistics 2025, Chapter 3: Tax levels and tax structures (Table 3.1)',
      url: 'https://www.oecd.org/en/publications/revenue-statistics-2025_3a264267-en/full-report/tax-levels-and-tax-structures-1965-2024_2033f3ea.html',
      kind: 'international',
      language: 'en',
      publishedDate: '2025-12-09',
      periodCovered: 'Calendar year 2023',
      accessed: '2026-09-29',
      note: 'Total tax revenue as % of GDP.',
    },
    {
      id: 'sng-wofi-profile',
      org: 'OECD and United Cities and Local Governments (SNG-WOFI)',
      title: `World Observatory on Subnational Government Finance and Investment – country profile: ${name}`,
      url: `https://www.sng-wofi.org/country_profiles/${meta.sngSlug}.html`,
      kind: 'international',
      language: 'en',
      publishedDate: '2022-10-24',
      periodCovered: String(year),
      accessed: '2026-09-29',
      note: 'Subnational government revenue by category as % of total subnational revenue, 2022 edition.',
    },
  ];
  const out = {
    version: 1,
    id: meta.id,
    iso3: meta.iso3,
    isoNumeric: meta.num,
    names: { en: name, native: meta.native, nativeLang: meta.lang },
    accent: meta.accent,
    flag: meta.flag,
    structure,
    sources,
  };
  fs.writeFileSync(path.join(outDir, `${meta.id}.json`), formatJson(out), 'utf8');
  written++;
}
console.log(`wrote ${written} profiles`);
