/**
 * Slovak Republic: the folio's data. Run: npx tsx scripts/build/slovakia.ts
 * Figures: Commission / Eurostat National Tax List (NTL), edition 2026, sheet SK, calendar 2024, EUR million
 * (scripts/build/data/ntl-SK.json). Level placement checked against Eurostat gov_10a_taxag.
 * Rates: PwC Worldwide Tax Summaries (review of 9 September 2026), a professional-firm summary.
 */
import { buildCountry, type CountrySpec, type InstSpec, type Ref } from '../lib/build-country';
import { loadNtl, loadSectors } from '../lib/ntl';

const D = '2026-10-12';
const y = { label: '2024', kind: 'calendar-year' as const, start: '2024-01-01', end: '2024-12-31' };
const ref = (id: string, loc?: string): Ref => (loc ? [id, loc] : [id]);
const n = loadNtl('SK', 'EUR');
const sec = loadSectors('SK');
const NTL = 'ntl-2026';
const EUS = 'eurostat-taxag';
const PWC_CIT = 'pwc-sk-corporate';
const PWC_PIT = 'pwc-sk-individual';
const PWC_OTH = 'pwc-sk-other';
const PWC_NOTE = 'As summarised by PwC (review of 9 September 2026), not checked against the Financial Administration.';

const inst = (i: Omit<InstSpec, 'rev'> & { keys: string[]; group: string }): InstSpec => {
  const { keys, group, ...rest } = i;
  return { ...rest, rev: n.rev(group, keys) };
};

const instruments: InstSpec[] = [
  inst({
    id: 'sk-pit-employment', parent: 'stat', level: 'stat', family: 'income-personal', group: 'state', keys: ['D51A:C01'],
    official: 'Personal income tax on income from dependent activity and functional benefits', native: 'Daň z príjmov fyzických osôb zo závislej činnosti', common: 'Personal income tax on employment',
    base: 'Wages, salaries and other income from dependent activity.',
    payer: 'Employees; the employer withholds.',
    rate: { kind: 'progressive', headline: '19% and 25% in 2024', details: ['2024: 19% on the tax base up to 176.8 times the subsistence level and 25% above. PwC reports EUR 48,441 as the threshold for 2025, and two further rates of 30% and 35% from 2026.', PWC_NOTE] },
    explanation: 'The largest direct tax on persons.',
    exceptions: [], refs: [ref(PWC_PIT, 'Personal income tax rates')], label: 'Income tax: wages', sub: '19% · 25%', glyph: 'person',
  }),
  inst({
    id: 'sk-pit-business', parent: 'stat', level: 'stat', family: 'income-personal', group: 'state', keys: ['D51A:C02'],
    official: 'Personal income tax on business and other independent gainful activities', native: 'Daň z príjmov fyzických osôb z podnikania a inej samostatnej zárobkovej činnosti', common: 'Income tax on business income',
    base: 'Business and other independent income of individuals.',
    payer: 'Self-employed people.',
    rate: { kind: 'progressive', headline: 'Same rates as employment income', details: [PWC_NOTE] },
    explanation: 'EUR 194 million in 2024, against EUR 144 million in 2023.',
    exceptions: [], refs: [ref(PWC_PIT, 'Personal income tax rates')], label: 'Income tax: business', sub: 'Self-employed', glyph: 'person',
  }),
  inst({
    id: 'sk-corporate-income-tax', parent: 'stat', level: 'stat', family: 'income-corporate', group: 'state', keys: ['D51B:C01'],
    official: 'Corporate income tax (resident legal persons)', native: 'Daň z príjmov právnických osôb', common: 'Corporate income tax',
    base: 'Profit of companies and other legal persons.',
    payer: 'Companies.',
    rate: { kind: 'flat', headline: '21% standard in 2024', details: ['The standard CIT rate for 2024 was 21%. From 2025: 10% up to EUR 100,000 of taxable income, 21% from EUR 100,000 to EUR 5 million, and a higher rate above (PwC).', PWC_NOTE] },
    explanation: 'Revenue grew 3% in 2024.',
    exceptions: [], refs: [ref(PWC_CIT, 'Corporate income tax rates')], label: 'Corporate income tax', sub: '21%', glyph: 'factory',
  }),
  inst({
    id: 'sk-special-levies', parent: 'stat', level: 'stat', category: 'special-levy', family: 'income-corporate', group: 'state', keys: ['D51B:C03', 'D51B:C04'],
    official: 'Special levy in regulated industries and the solidarity contribution', native: 'Osobitný odvod v regulovaných odvetviach; solidárny príspevok', common: 'Special levies on regulated industries',
    base: 'As named in the National Tax List: a special levy for regulated industries (EUR 533.6 million) and a solidarity contribution (EUR 55.7 million, a new line in 2024); the list gives no further detail.',
    payer: 'Companies in the regulated industries.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'The special levy rose from EUR 135 million in 2023 to EUR 534 million in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet SK, D51B C03 and C04')], label: 'Special levies', sub: 'Regulated industries', glyph: 'scale',
  }),
  inst({
    id: 'sk-withholding-tax', parent: 'stat', level: 'stat', family: 'income-mixed', group: 'state', keys: ['D51E:C03'],
    official: 'Withholding income tax (dividends, profit, interest and others)', native: 'Dane z príjmov vyberané zrážkou', common: 'Withholding taxes',
    base: 'Dividends, profit shares, interest and similar income. The list splits it into EUR 72.5 million withheld from individuals and EUR 456.6 million from legal persons, which together make the line used here.',
    payer: 'Recipients; the payer withholds.',
    rate: { kind: 'varies', headline: 'By type of income', details: [] },
    explanation: 'EUR 529 million in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet SK, D51E')], label: 'Withholding taxes', sub: 'Dividends · interest', glyph: 'coin',
  }),
  inst({
    id: 'sk-social-employers', parent: 'stat', level: 'stat', category: 'social-contribution', family: 'social-security', group: 'socialer', keys: ['D611:C01'],
    official: 'Employers’ actual social contributions', native: 'Skutočné sociálne príspevky zamestnávateľov', common: 'Employers’ contributions',
    base: 'Gross pay. The list splits it into pension (EUR 5,251 million) and non-pension (EUR 6,818 million) contributions.',
    payer: 'Employers.',
    rate: { kind: 'flat', headline: 'Set by the social insurance laws', details: ['The rates are not extracted here.'] },
    explanation: 'The largest line of the whole list after VAT.',
    exceptions: [], refs: [ref(NTL, 'sheet SK, D611')], label: 'Social: employers', sub: 'Pension · health', glyph: 'heart',
  }),
  inst({
    id: 'sk-social-employees', parent: 'stat', level: 'stat', category: 'social-contribution', family: 'social-security', group: 'socialhh', keys: ['D613CE:C01'],
    official: 'Compulsory social contributions of employees', native: 'Obvezné sociálne príspevky zamestnancov', common: 'Employees’ contributions',
    base: 'Gross pay.',
    payer: 'Employees; the employer withholds.',
    rate: { kind: 'flat', headline: 'Set by the social insurance laws', details: ['The rates are not extracted here.'] },
    explanation: 'EUR 4.5 billion in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet SK, D613CE')], label: 'Social: employees', sub: 'Pension · health', glyph: 'heart',
  }),
  inst({
    id: 'sk-social-others', parent: 'stat', level: 'stat', category: 'social-contribution', family: 'social-security', group: 'socialhh', keys: ['D613CN:C01', 'D613CS:C01'],
    official: 'Compulsory contributions of the non-employed and of the self-employed', native: 'Obvezné príspevky neaktívnych osôb a samostatne zárobkovo činných', common: 'Non-employed and self-employed contributions',
    base: 'As labelled in the National Tax List: contributions of the non-employed (EUR 3,822 million) and of the self-employed (EUR 0.8 million). The list does not say who pays the non-employed contributions.',
    payer: 'Not itemised in the list.',
    rate: { kind: 'varies', headline: 'Set by the social insurance laws', details: [] },
    explanation: 'The second households’ line.',
    exceptions: [], refs: [ref(NTL, 'sheet SK, D613CN and D613CS')], label: 'Non-employed contributions', sub: 'Health insurance', glyph: 'heart',
  }),
  inst({
    id: 'sk-vat', parent: 'stat', level: 'stat', family: 'general-consumption', group: 'state', keys: ['D211:C01'],
    official: 'Value added tax', native: 'Daň z pridanej hodnoty', common: 'VAT', abbr: 'DPH',
    base: 'Goods and services supplied in Slovakia and imports.',
    payer: 'Consumers; businesses charge it and claim input credits.',
    rate: { kind: 'range', headline: '20% standard in 2024; 23% from 2025', details: ['The basic rate was 20% until 31 December 2024, with a reduced rate of 10%; from 1 January 2025 the basic rate is 23% and the reduced rates are 19% and 5% (PwC).', PWC_NOTE] },
    explanation: 'The largest single tax.',
    exceptions: [], refs: [ref(PWC_OTH, 'Value-added tax')], label: 'VAT', sub: '20% → 23%', glyph: 'cart',
  }),
  inst({
    id: 'sk-customs', parent: 'stat', level: 'stat', category: 'customs-duty', family: 'trade', group: 'state', keys: ['D2121:C01', 'D2122A:C01'],
    official: 'Import duty and levies on imported agricultural products', native: 'Dovozné clo', common: 'Customs duties',
    base: 'Goods imported from outside the EU, by the Common Customs Tariff.',
    payer: 'Importers.',
    rate: { kind: 'varies', headline: 'EU Common Customs Tariff', details: ['An EU own resource; Eurostat records it under the EU institutions.'] },
    explanation: 'Collected for the EU budget.',
    exceptions: [], refs: [ref(EUS, 'S.212, D212')], label: 'Customs duties', sub: 'EU tariff', glyph: 'ship',
  }),
  inst({
    id: 'sk-excise-mineral-oils', parent: 'stat', level: 'stat', family: 'specific-consumption', group: 'state', keys: ['D214A:C01'],
    official: 'Excise duty on mineral oils', native: 'Spotrebná daň z minerálnych olejov', common: 'Fuel excise',
    base: 'Petrol, diesel, heating oil and other mineral oils, by quantity.',
    payer: 'Producers and importers; passed on at the pump.',
    rate: { kind: 'specific', headline: 'Per unit of quantity', details: [] },
    explanation: 'The biggest excise.',
    exceptions: [], refs: [ref(NTL, 'sheet SK, D214A C01')], label: 'Fuel excise', sub: 'Mineral oils', glyph: 'flame',
  }),
  inst({
    id: 'sk-excise-tobacco', parent: 'stat', level: 'stat', family: 'specific-consumption', group: 'state', keys: ['D214A:C05'],
    official: 'Excise duty on tobacco and tobacco products', native: 'Spotrebná daň z tabaku a tabakových výrobkov', common: 'Tobacco excise',
    base: 'Cigarettes and other tobacco products.',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'mechanism', headline: 'Fixed by law', details: [] },
    explanation: 'EUR 1,021 million in 2024, up 9%.',
    exceptions: [], refs: [ref(NTL, 'sheet SK, D214A C05')], label: 'Tobacco excise', sub: 'Cigarettes', glyph: 'smoke',
  }),
  inst({
    id: 'sk-excise-alcohol', parent: 'stat', level: 'stat', family: 'specific-consumption', group: 'state', keys: ['D214A:C02', 'D214A:C03', 'D214A:C04'],
    official: 'Excise duty on spirits, beer and wine', native: 'Spotrebná daň z liehu, piva a vína', common: 'Alcohol excise',
    base: 'Spirits (EUR 232 million), beer (EUR 56 million) and wine (EUR 5 million).',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'specific', headline: 'Per litre of alcohol or product', details: [] },
    explanation: 'Three lines.',
    exceptions: [], refs: [ref(NTL, 'sheet SK, D214A C02 to C04')], label: 'Alcohol excise', sub: 'Spirits · beer · wine', glyph: 'wine',
  }),
  inst({
    id: 'sk-energy-taxes', parent: 'stat', level: 'stat', family: 'specific-consumption', group: 'state', keys: ['D214A:C06', 'D214A:C07', 'D214A:C08'],
    official: 'Excise taxes on electricity, coal and natural gas', native: 'Spotrebné dane z elektriny, uhlia a zemného plynu', common: 'Electricity, coal and gas taxes',
    base: 'Electricity (EUR 12.8 million), coal (EUR 0.2 million) and natural gas (EUR 21.1 million).',
    payer: 'Suppliers; passed on in the price.',
    rate: { kind: 'specific', headline: 'Per unit of energy', details: [] },
    explanation: 'Small energy taxes.',
    exceptions: [], refs: [ref(NTL, 'sheet SK, D214A C06 to C08')], label: 'Energy taxes', sub: 'Electricity · gas', glyph: 'bolt',
  }),
  inst({
    id: 'sk-green-energy', parent: 'stat', level: 'stat', category: 'special-levy', family: 'specific-consumption', group: 'state', keys: ['D214A:C09'],
    official: 'Green energy', native: 'Zelená energia', common: 'Green energy charge',
    base: 'As named in the National Tax List ("green energy"); the list gives no further detail.',
    payer: 'Not given in the list.',
    rate: { kind: 'varies', headline: 'Not given in the list', details: ['EUR 183.6 million in 2024, down from EUR 420.8 million in 2023.'] },
    explanation: 'Booked by the statisticians among the excises.',
    exceptions: [], refs: [ref(NTL, 'sheet SK, D214A C09')], label: 'Green energy charge', sub: 'Energy', glyph: 'leaf',
  }),
  inst({
    id: 'sk-lottery-tax', parent: 'stat', level: 'stat', family: 'specific-consumption', group: 'state', keys: ['D214F:C01'],
    official: 'Income from lotteries and similar games', native: 'Príjmy z výťažkov lotérií a iných podobných hier', common: 'Lottery and gambling tax',
    base: 'Takings of lotteries and similar games.',
    payer: 'Operators.',
    rate: { kind: 'varies', headline: 'Set by the Gambling Act', details: [] },
    explanation: 'EUR 360 million in 2024, up 15%.',
    exceptions: [], refs: [ref(NTL, 'sheet SK, D214F C01')], label: 'Lottery tax', sub: 'Gambling', glyph: 'dice',
  }),
  inst({
    id: 'sk-insurance-taxes', parent: 'stat', level: 'stat', family: 'specific-consumption', group: 'state', keys: ['D214G:C01', 'D214G:C02'],
    official: 'Insurance tax and the levy on non-life insurance premiums', native: 'Daň z poistenia; odvod časti poistného', common: 'Insurance taxes',
    base: 'Insurance premiums (EUR 111.9 million) and a part of non-life premiums (EUR 39.2 million).',
    payer: 'Insurers.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Two lines.',
    exceptions: [], refs: [ref(NTL, 'sheet SK, D214G')], label: 'Insurance taxes', sub: 'Premiums', glyph: 'shield',
  }),
  inst({
    id: 'sk-vehicle-taxes', parent: 'stat', level: 'stat', family: 'specific-consumption', group: 'state', keys: ['D214D:C01', 'D29B:C01'],
    official: 'Road tax (domestic vehicles) and the car registration fee', native: 'Cestná daň; poplatok za registráciu automobilov', common: 'Vehicle taxes',
    base: 'Road tax on vehicles used for business (EUR 140.3 million) and the fee for registering cars (EUR 59.6 million).',
    payer: 'Vehicle owners.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Eurostat books both under central government.',
    exceptions: [], refs: [ref(NTL, 'sheet SK, D29B C01, D214D C01')], label: 'Vehicle taxes', sub: 'Road tax', glyph: 'car',
  }),
  inst({
    id: 'sk-environmental-charges', parent: 'stat', level: 'stat', category: 'fee', family: 'resource', group: 'state', keys: ['D29F:C02', 'D29F:C03', 'D29E:C01', 'D29E:C02', 'D29E:C03', 'D214H:C05', 'D214H:C06'],
    official: 'Water and air pollution fees, nuclear installation charges, excavation area tax, gas storage and emergency oil stock fees', native: 'Poplatky za znečisťovanie; daň za umiestnenie jadrového zariadenia', common: 'Environmental and nuclear charges',
    base: 'Water pollution (EUR 8.6 million), air pollution (EUR 10.0 million), siting nuclear equipment (EUR 3.9 million), excavation areas, gas and liquid storage, the emergency oil stock fee, and the electricity consumption tax for decommissioning nuclear facilities.',
    payer: 'Polluters and operators.',
    rate: { kind: 'varies', headline: 'Set by law', details: ['The sale of emission permits (EUR 606.4 million) is not counted.'] },
    explanation: 'Seven lines, together under 1% of the total.',
    exceptions: [], refs: [ref(NTL, 'sheet SK, D29F C02 and C03, D29E C01 to C03, D214H C05 and C06')], label: 'Environmental charges', sub: 'Pollution · nuclear', glyph: 'leaf',
  }),
  inst({
    id: 'sk-administrative-fees', parent: 'stat', level: 'stat', category: 'fee', family: 'other', group: 'state', keys: ['D29E:C06', 'D29E:C07', 'D29E:C08', 'D59D:C06', 'D59D:C07', 'D59D:C08'],
    official: 'Administrative fees, licence fees and TV and radio licence fees', native: 'Administratívne poplatky; koncesionárske poplatky', common: 'Administrative and licence fees',
    base: 'Administrative fees paid by legal persons (EUR 127.6 million) and by individuals (EUR 53.3 million), licence fees, and the TV and radio licence fees, which fell from EUR 44.6 million in 2023 to EUR 2.1 million in 2024.',
    payer: 'Businesses and individuals.',
    rate: { kind: 'varies', headline: 'Set by law', details: ['Eurostat books EUR 57 million of the "other taxes on production" with local government; the list does not say which lines.'] },
    explanation: 'Six lines that the list codes as taxes.',
    exceptions: [], refs: [ref(NTL, 'sheet SK, D29E C06 to C08, D59D C06 to C08')], label: 'Administrative fees', sub: 'Licences', glyph: 'stamp',
  }),
  inst({
    id: 'sk-other-state', parent: 'stat', level: 'stat', category: 'special-levy', family: 'other', group: 'state', keys: ['D29H:C08', 'D29H:C09', 'D214H:C07', 'D29H:C06', 'D214L:C01', 'D214C:C01'],
    official: 'Deposit protection tax, levy on excessive profit and other small taxes', native: 'Daň na ochranu vkladov; odvod z nadmerných príjmov; iné dane', common: 'Deposit insurance, windfall levy and other small taxes',
    base: 'The tax connected to deposit insurance (EUR 8.3 million), the levy on excessive profit (EUR 7.5 million, EUR 37.6 million in 2023), other taxes (EUR 0.9 million), other taxes on products (EUR 3.5 million) and a transfer tax on real estate of legal persons (EUR 0.01 million); the resolution fund line is zero in 2024.',
    payer: 'Banks, energy producers and others.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Six small lines.',
    exceptions: [], refs: [ref(NTL, 'sheet SK, D29H C06, C08, C09, D214H C07, D214L C01, D214C C01')], label: 'Other small taxes', sub: 'Deposits · windfall', glyph: 'stamp',
  }),
  /* ---- local self-government ---- */
  inst({
    id: 'sk-property-tax', parent: 'obce', level: 'obce', family: 'property', group: 'localprop', keys: ['D29A:C01', 'D29A:C02', 'D29A:C03', 'D59A:C01', 'D59A:C03', 'D59A:C05'],
    official: 'Real estate tax on land, buildings and dwellings (companies and households)', native: 'Daň z nehnuteľností (z pozemkov, zo stavieb, z bytov)', common: 'Property tax',
    base: 'Land, buildings and dwellings; the list separates the tax paid by legal persons (land EUR 86.7 million, buildings EUR 433.8 million, dwellings EUR 51.2 million) from households (land EUR 42.7 million, dwellings EUR 4.4 million).',
    payer: 'Owners.',
    rate: { kind: 'range', headline: 'Set by each municipality within limits', details: ['The list does not give rates.'] },
    explanation: 'The main tax of the municipalities in the list; buildings bring in most of it.',
    exceptions: [], refs: [ref(NTL, 'sheet SK, D29A C01 to C03, D59A'), ref(EUS, 'S.1313, D29A and D59A')], label: 'Property tax', sub: 'Municipal', glyph: 'house',
  }),
  inst({
    id: 'sk-local-taxes', parent: 'obce', level: 'obce', category: 'fee', family: 'other', group: 'local', keys: ['D29A:C06', 'D29E:C09', 'D29H:C02', 'D59D:C01', 'D214E:C01', 'D214H:C01', 'D214H:C02', 'D29B:C03', 'D59D:C02'],
    official: 'Taxes on public space, dogs, gaming and vending machines, accommodation, entry to historic centres, and the local development fee', native: 'Miestne dane a poplatky', common: 'Other municipal taxes and fees',
    base: 'Use of public space (EUR 15.2 million), the local fee for development (EUR 39.0 million), dogs (EUR 5.5 million), gaming machines, vending machines, accommodation in recreational facilities, and permits to enter historic city districts with a motor vehicle.',
    payer: 'Residents, businesses and visitors.',
    rate: { kind: 'varies', headline: 'Set by each municipality', details: ['Eurostat books EUR 693 million of taxes on production and EUR 47 million of wealth taxes with local government; the lines here and in the property tax come to a little less.'] },
    explanation: 'Nine small local lines.',
    exceptions: [], refs: [ref(NTL, 'sheet SK, D29A C06, D29E C09, D29H C02, D59D C01 and C02, D214E, D214H C01 and C02, D29B C03')], label: 'Other local taxes', sub: 'Public space · dogs', glyph: 'town',
  }),
];

const part = (g: string) => n.round(instruments.filter((i) => i.rev?.group === g).reduce((a, i) => a + i.rev!.amount, 0));
const sectorSum = (code: string) => ['S1311', 'S1312', 'S1313', 'S1314', 'S212'].reduce((a, s) => a + (sec[`${s}:${code}`] ?? 0), 0);
const vintage = ['D2', 'D5', 'D61'].map((c) => `${c}: NTL ${n.fmt(n.total(c))}, Eurostat July 2026 ${n.fmt(sectorSum(c))}`).join('; ');

const spec: CountrySpec = {
  today: D,
  id: 'slovak-republic',
  iso3: 'SVK',
  isoNumeric: '703',
  names: { en: 'Slovak Republic', native: 'Slovensko', nativeLang: 'sk' },
  currency: { code: 'EUR', symbol: '€', name: 'Euro' },
  summary:
    'The Slovak Republic is a unitary state: the National Council sets all taxes and the Financial Administration collects them. Social contributions are the largest flow, mostly from employers, followed by VAT and the income taxes. Municipalities and regions have one main tax, the real estate tax, and a handful of small local taxes; they also receive a share of the income tax that the national accounts count as a transfer.',
  structureNote:
    'The figures are the Commission’s National Tax List for 2024. The sale of emission permits (EUR 606 million) and the employers’ imputed social contributions (EUR 537 million) are left out. The social contributions are drawn under the State. The list gives the withholding tax both as a total and as a split into individuals and legal persons; only the total is used. Local self-government is the municipalities and the higher territorial units together, as in Eurostat’s accounts.',
  theme: {
    accent: '#4e8bff',
    accent2: '#ee1c25',
    motif: 'topo',
    motifNote: 'Topographic contour lines over the outline of Slovakia (the generic motif; no bespoke art yet).',
    mapLabel: { lon: 19.5, lat: 48.7 },
  },
  rootLabel: { label: 'Slovakia', sub: 'Slovensko · Fiscal folio' },
  levels: [
    {
      id: 'stat', branch: 'national', official: 'The State (Slovak Republic)', native: 'Štát', common: 'State',
      description: 'The National Council legislates all taxes; the Financial Administration collects them. The social contributions are collected for the Social Insurance Agency and the health insurance companies.',
      fiscalPower: 'Taxes are set by national law; municipalities set the real estate tax rates and local fees within the limits of the law.',
      refs: [ref(NTL)], label: 'State', sub: 'Štát',
    },
    {
      id: 'obce', branch: 'local', official: 'Local self-government (municipalities and higher territorial units)', native: 'Samospráva (obce a vyššie územné celky)', common: 'Local government',
      description: 'Municipalities levy the real estate tax and a few small taxes and fees; the eight self-governing regions (higher territorial units) are included with them in Eurostat’s local government sector.',
      fiscalPower: 'Municipal councils set the rates of the real estate tax and local taxes by decree, within the ranges of national law.',
      refs: [ref(EUS)], label: 'Local government', sub: 'Obce',
    },
  ],
  supporting: [],
  denominators: [
    {
      id: 'stat-taxes-2024', label: 'State taxes (National Tax List), 2024',
      definition: 'The taxes on production and imports, on income and on capital that the National Tax List books to the State and the EU, other than the municipal lines and the sale of emission permits.',
      levelIds: ['stat'], amount: part('state'), period: y, sourceId: NTL,
      locator: 'Sheet SK, 2024, the lines listed with each tax',
      calculation: `Sum of the ${instruments.filter((i) => i.rev?.group === 'state').length} tax rows below (EUR million)`,
      caveat: `Calendar 2024; the list's cut-off was 30 October 2025. Vintage check against Eurostat's July 2026 accounts: ${vintage}.`,
    },
    {
      id: 'stat-social-employers-2024', label: 'Social contributions paid by employers, 2024',
      definition: 'The actual compulsory contributions of employers; imputed contributions are left out.',
      levelIds: ['stat'], amount: part('socialer'), period: y, sourceId: NTL,
      locator: 'Sheet SK, 2024, subtotal D611',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'stat-social-households-2024', label: 'Social contributions paid by households, 2024',
      definition: 'The contributions of employees, the self-employed and the non-employed.',
      levelIds: ['stat'], amount: part('socialhh'), period: y, sourceId: NTL,
      locator: 'Sheet SK, 2024, lines D613CE, D613CN, D613CS',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'obce-property-2024', label: 'Real estate tax of the municipalities, 2024',
      definition: 'The tax on land, buildings and dwellings paid by legal persons and households.',
      levelIds: ['obce'], amount: part('localprop'), period: y, sourceId: NTL,
      locator: 'Sheet SK, 2024, lines D29A C01 to C03, D59A C01, C03, C05',
      caveat: `Eurostat books EUR ${n.fmt(sec['S1313:D29A'])} million of land and building taxes (D29A) and EUR ${n.fmt(sec['S1313:D59A'])} million of other wealth taxes (D59A) to local government.`,
    },
    {
      id: 'obce-other-2024', label: 'Other taxes and fees of the municipalities, 2024',
      definition: 'The tax on public space, the local development fee, the dog tax, taxes on gaming and vending machines and accommodation, and entry permits for historic city districts.',
      levelIds: ['obce'], amount: part('local'), period: y, sourceId: NTL,
      locator: 'Sheet SK, 2024, the lines listed with the tax',
      calculation: 'Sum of the local rows below (EUR million)',
      caveat: `Eurostat books EUR ${n.fmt(sec['S1313:D2'])} million of taxes on production to local government; the lines drawn for the municipalities (both parts) come to EUR ${n.fmt(part('localprop') + part('local'))} million, because the list does not say which share of the administrative fees, lottery taxes and pollution fees (EUR 57, 13 and 5 million in Eurostat's local sector) is local.`,
    },
  ],
  sizing: {
    label: 'Taxes and compulsory social contributions of all levels of government',
    definition: 'The taxes of the State and of local self-government plus the actual social contributions, calendar 2024, as listed in the National Tax List. Excludes the sale of emission permits and imputed social contributions.',
    componentIds: ['stat-taxes-2024', 'stat-social-employers-2024', 'stat-social-households-2024', 'obce-property-2024', 'obce-other-2024'],
  },
  fromProfile: 'slovak-republic',
  structureOverride: {
    basis: 'OECD attribution to sub-sectors of general government (Interpretative Guide, section A.12)',
    folioLevels: { central: ['stat'], local: ['obce'] },
    levelNotes: { central: 'The OECD shows the social security funds separately; the folio draws their contributions under the State.' },
  },
  groups: {
    state: { title: 'State taxes 2024 – National Tax List (EUR million)', denominatorId: 'stat-taxes-2024', period: y, basis: 'ESA tax revenue, general government and EU institutions', sourceId: NTL },
    socialer: { title: 'Employers’ social contributions 2024 – National Tax List (EUR million)', denominatorId: 'stat-social-employers-2024', period: y, basis: 'Actual compulsory contributions (subtotal)', sourceId: NTL },
    socialhh: { title: 'Households’ social contributions 2024 – National Tax List (EUR million)', denominatorId: 'stat-social-households-2024', period: y, basis: 'Compulsory contributions', sourceId: NTL },
    localprop: { title: 'Real estate tax 2024 – National Tax List (EUR million)', denominatorId: 'obce-property-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
    local: { title: 'Other local taxes 2024 – National Tax List (EUR million)', denominatorId: 'obce-other-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
  },
  sources: [
    { id: NTL, org: 'European Commission, DG Taxation and Customs Union, with Eurostat', title: 'Data on Taxation Trends: National Tax Lists (NTL), edition 2026', url: 'https://taxation-customs.ec.europa.eu/taxation/economic-analysis/data-taxation-trends_en', kind: 'statistics', language: 'en', publishedDate: '2026-03-31', periodCovered: 'Calendar year 2024 (series from 1995)', accessed: D, nextExpected: '2027-03', note: 'Workbook "NTL edition 2026 web.xlsx", sheet SK: every tax and social contribution by its national name and ESA code, in EUR million. Data cut-off 30 October 2025.' },
    { id: EUS, org: 'Eurostat', title: 'Main national accounts tax aggregates (gov_10a_taxag)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table', kind: 'statistics', language: 'en', publishedDate: '2026-07-21', periodCovered: 'Calendar year 2024', accessed: D, nextExpected: '2027-07', note: 'Taxes and social contributions by sub-sector and ESA item; used to place each tax at a level and to check the totals of the National Tax List.' },
    { id: PWC_CIT, org: 'PwC', title: 'Worldwide Tax Summaries: Slovak Republic – Corporate – Taxes on corporate income', url: 'https://taxsummaries.pwc.com/slovak-republic/corporate/taxes-on-corporate-income', kind: 'guidance', language: 'en', publishedDate: '2026-09-09', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary, not an official source: the standard corporate rate for 2024 was 21%; from 2025 10% up to EUR 100,000, 21% from EUR 100,000 to EUR 5 million.' },
    { id: PWC_PIT, org: 'PwC', title: 'Worldwide Tax Summaries: Slovak Republic – Individual – Taxes on personal income', url: 'https://taxsummaries.pwc.com/slovak-republic/individual/taxes-on-personal-income', kind: 'guidance', language: 'en', publishedDate: '2026-09-09', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary: personal income tax 19% up to 176.8 times the subsistence level (EUR 48,441 in 2025) and 25% above; 30% and 35% rates from 2026.' },
    { id: PWC_OTH, org: 'PwC', title: 'Worldwide Tax Summaries: Slovak Republic – Corporate – Other taxes', url: 'https://taxsummaries.pwc.com/slovak-republic/corporate/other-taxes', kind: 'guidance', language: 'en', publishedDate: '2026-09-09', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary: VAT basic rate 23% from 1 January 2025 (20% before), reduced rates 19% and 5% (previously 10%).' },
  ],
  instruments,
};

buildCountry(spec);
n.reconcile(part('state') + part('socialer') + part('socialhh') + part('localprop') + part('local'), ['T:D612', 'D29F:C04']);
