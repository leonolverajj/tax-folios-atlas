/**
 * Slovenia: the folio's data. Run: npx tsx scripts/build/slovenia.ts
 * Figures: Commission / Eurostat National Tax List (NTL), edition 2026, sheet SI, calendar 2024, EUR million
 * (scripts/build/data/ntl-SI.json). Level placement checked against Eurostat gov_10a_taxag.
 * Rates: PwC Worldwide Tax Summaries (review of 15 July 2026), a professional-firm summary.
 */
import { buildCountry, type CountrySpec, type InstSpec, type Ref } from '../lib/build-country';
import { loadNtl, loadSectors } from '../lib/ntl';

const D = '2026-10-12';
const y = { label: '2024', kind: 'calendar-year' as const, start: '2024-01-01', end: '2024-12-31' };
const ref = (id: string, loc?: string): Ref => (loc ? [id, loc] : [id]);
const n = loadNtl('SI', 'EUR');
const sec = loadSectors('SI');
const NTL = 'ntl-2026';
const EUS = 'eurostat-taxag';
const PWC_CIT = 'pwc-si-corporate';
const PWC_PIT = 'pwc-si-individual';
const PWC_OTH = 'pwc-si-other';
const PWC_NOTE = 'As summarised by PwC (review of 15 July 2026), not checked against the Financial Administration (FURS).';

const inst = (i: Omit<InstSpec, 'rev'> & { keys: string[]; group: string }): InstSpec => {
  const { keys, group, ...rest } = i;
  return { ...rest, rev: n.rev(group, keys) };
};
const lineKeys = (code: string) => n.file.lines.filter((l) => l.code === code && typeof l.v2024 === 'number').map((l) => l.key);

const instruments: InstSpec[] = [
  inst({
    id: 'si-personal-income-tax', parent: 'drzava', level: 'drzava', family: 'income-personal', group: 'state', keys: lineKeys('D51A'),
    official: 'Personal income tax (dohodnina): wages, pensions, contract work, awards, activities, net of the annual final assessment', native: 'Dohodnina', common: 'Personal income tax',
    base: 'Wages and salaries (EUR 3,150 million), business and other activities (650 million), pensions, contract work and awards, less the annual final assessment refunds (EUR 383 million).',
    payer: 'Individuals; employers and payers withhold it.',
    rate: { kind: 'progressive', headline: '16% · 26% · 33% · 39% · 50%', details: ['Five brackets: 16% up to EUR 9,721; 26% to EUR 28,592; 33% to EUR 57,185; 39% to EUR 82,346; 50% above. Capital gains, interest, dividends and rents are taxed at a flat 25% (PwC).', PWC_NOTE] },
    explanation: 'The largest direct tax. Municipalities receive a share of it from the central budget, which Eurostat’s accounts count as a transfer; the whole tax is booked as a State tax.',
    exceptions: [], refs: [ref(PWC_PIT, 'Tax rates')], label: 'Personal income tax', sub: '16–50%', glyph: 'person',
  }),
  inst({
    id: 'si-corporate-income-tax', parent: 'drzava', level: 'drzava', family: 'income-corporate', group: 'state', keys: ['D51B:C01', 'D51B:C02'],
    official: 'Corporate income tax and tax on financial-instrument income received for a beneficial holder', native: 'Davek od dohodkov pravnih oseb', common: 'Corporate income tax',
    base: 'Profit of companies; the list adds the tax on income from financial instruments that an intermediary receives for the beneficial holder.',
    payer: 'Companies.',
    rate: { kind: 'flat', headline: '22% for 2024 to 2028', details: ['The corporate income tax rate rose to 22% from 19% for the years 2024 to 2028; investment and pension funds may be taxed at 0% (PwC).', PWC_NOTE] },
    explanation: 'Revenue rose by 20% in 2024, the year of the rate increase.',
    exceptions: [], refs: [ref(PWC_CIT, 'Corporate income tax rates')], label: 'Corporate income tax', sub: '22%', glyph: 'factory',
  }),
  inst({
    id: 'si-other-income-taxes', parent: 'drzava', level: 'drzava', family: 'income-personal', group: 'state', keys: ['D51D:C01', 'D51E:C02', 'D51E:C04'],
    official: 'Taxes on winnings from gambling, on royalties and on profits from changes in land use', native: 'Davki na dobitke pri igrah na srečo; avtorske pravice; dobiček od spremembe namembnosti zemljišč', common: 'Other income taxes',
    base: 'Winnings (EUR 14.1 million), copyrights, patents and trademarks (EUR 3.2 million), and profits on rezoned land (zero in 2024).',
    payer: 'Winners, rights holders and landowners.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Three small income-tax lines.',
    exceptions: [], refs: [ref(NTL, 'sheet SI, D51D C01, D51E C02 and C04')], label: 'Other income taxes', sub: 'Winnings · royalties', glyph: 'coin',
  }),
  inst({
    id: 'si-contract-work-tax', parent: 'drzava', level: 'drzava', family: 'payroll', group: 'state', keys: ['D29C:C02'],
    official: 'Special tax on certain receipts (on contract work)', native: 'Posebni davek na določene prejemke (na pogodbeno delo)', common: 'Tax on contract work',
    base: 'As named in the National Tax List: contract work; no further detail.',
    payer: 'Payers of contract work.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'A payroll-type tax of EUR 32 million.',
    exceptions: [], refs: [ref(NTL, 'sheet SI, D29C C02')], label: 'Tax on contract work', sub: 'Payroll', glyph: 'scroll',
  }),
  inst({
    id: 'si-social-employers', parent: 'drzava', level: 'drzava', category: 'social-contribution', family: 'social-security', group: 'socialer', keys: ['D611:C01', 'D611:C02', 'D611:C03', 'D611:C04'],
    official: 'Employers’ social contributions: pension and disability, health, maternity and employment', native: 'Prispevki delodajalcev', common: 'Employers’ contributions',
    base: 'Gross pay.',
    payer: 'Employers.',
    rate: { kind: 'flat', headline: '16.10% of gross pay', details: ['Pension and disability 8.85%, health 6.56%, unemployment 0.06%, injury at work 0.53%, parental 0.10% (PwC).', PWC_NOTE] },
    explanation: 'Pension and disability insurance (EUR 2,162 million) and health insurance (EUR 1,731 million) make nearly all of it.',
    exceptions: [], refs: [ref(PWC_OTH, 'Social security contributions')], label: 'Social: employers', sub: '16.1%', glyph: 'heart',
  }),
  inst({
    id: 'si-social-employees', parent: 'drzava', level: 'drzava', category: 'social-contribution', family: 'social-security', group: 'socialhh', keys: ['D613CE:C01'],
    official: 'Compulsory social contributions of employees', native: 'Obvezni prispevki zaposlenih', common: 'Employees’ contributions',
    base: 'Gross pay.',
    payer: 'Employees; the employer withholds.',
    rate: { kind: 'flat', headline: '22.10% of gross pay', details: ['Pension and disability 15.50%, health 6.36%, unemployment 0.14%, parental 0.10% (PwC).', PWC_NOTE] },
    explanation: 'The largest social contribution line: EUR 5.7 billion in 2024 against EUR 5.0 billion in 2023.',
    exceptions: [], refs: [ref(PWC_OTH, 'Social security contributions')], label: 'Social: employees', sub: '22.1%', glyph: 'heart',
  }),
  inst({
    id: 'si-social-self-employed', parent: 'drzava', level: 'drzava', category: 'social-contribution', family: 'social-security', group: 'socialhh', keys: ['D613CS:C01'],
    official: 'Compulsory social contributions of the self-employed', native: 'Obvezni prispevki samozaposlenih', common: 'Self-employed contributions',
    base: 'Income of the self-employed.',
    payer: 'Self-employed people.',
    rate: { kind: 'varies', headline: 'Set by the social insurance laws', details: [] },
    explanation: 'EUR 1,710 million in 2024 against EUR 1,317 million in 2023.',
    exceptions: [], refs: [ref(NTL, 'sheet SI, D613CS')], label: 'Social: self-employed', sub: 'Contributions', glyph: 'heart',
  }),
  inst({
    id: 'si-vat', parent: 'drzava', level: 'drzava', family: 'general-consumption', group: 'state', keys: ['D211:C06', 'D211:C05'],
    official: 'Value added tax (time-adjusted, less the negative compensation to farmers in the flat-rate scheme)', native: 'Davek na dodano vrednost', common: 'VAT', abbr: 'DDV',
    base: 'Goods and services supplied in Slovenia and imports.',
    payer: 'Consumers; businesses charge it and claim input credits.',
    rate: { kind: 'range', headline: '22% standard; 9.5% reduced', details: ['Standard 22%; 9.5% on foodstuffs, water, medicines, passenger transport, books, hotel accommodation and other goods (PwC).', PWC_NOTE] },
    explanation: 'The largest tax line.',
    exceptions: [], refs: [ref(PWC_OTH, 'Value-added tax')], label: 'VAT', sub: '22%', glyph: 'cart',
  }),
  inst({
    id: 'si-customs', parent: 'drzava', level: 'drzava', category: 'customs-duty', family: 'trade', group: 'state', keys: ['D2121:C01'],
    official: 'Customs duties revenue', native: 'Prihodki carin', common: 'Customs duties',
    base: 'Goods imported from outside the EU, by the Common Customs Tariff.',
    payer: 'Importers.',
    rate: { kind: 'varies', headline: 'EU Common Customs Tariff', details: ['An EU own resource; Eurostat records it under the EU institutions.'] },
    explanation: 'Collected for the EU budget.',
    exceptions: [], refs: [ref(EUS, 'S.212, D212')], label: 'Customs duties', sub: 'EU tariff', glyph: 'ship',
  }),
  inst({
    id: 'si-excise-fuel', parent: 'drzava', level: 'drzava', family: 'specific-consumption', group: 'state', keys: ['D214A:C02', 'D214A:C06', 'D2122C:C01', 'D214A:C08'],
    official: 'Excise duties on mineral oils and gas, and on electricity and coal', native: 'Trošarine na mineralna olja in plin; električna energija in premog', common: 'Fuel and energy excises',
    base: 'Petrol, diesel, heating oil and gas by quantity; electricity and coal. The import-excise line and its offsetting deduction (EUR 2.8 million) net to zero.',
    payer: 'Fuel suppliers and importers; passed on at the pump.',
    rate: { kind: 'specific', headline: 'Per unit of quantity, fixed by the Excise Duties Act', details: ['EUR 1,107 million on mineral oils and gas and EUR 15 million on electricity and coal in 2024.'] },
    explanation: 'The biggest excise.',
    exceptions: [], refs: [ref(NTL, 'sheet SI, D214A C02, C06, C08, D2122C C01')], label: 'Fuel excises', sub: 'Mineral oil · gas', glyph: 'flame',
  }),
  inst({
    id: 'si-excise-tobacco', parent: 'drzava', level: 'drzava', family: 'specific-consumption', group: 'state', keys: ['D214A:C03'],
    official: 'Excise duty on tobacco products', native: 'Trošarine na tobačne izdelke', common: 'Tobacco excise',
    base: 'Cigarettes and other tobacco products.',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'mechanism', headline: 'Fixed by the Excise Duties Act', details: [] },
    explanation: 'EUR 485 million in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet SI, D214A C03')], label: 'Tobacco excise', sub: 'Cigarettes', glyph: 'smoke',
  }),
  inst({
    id: 'si-excise-alcohol', parent: 'drzava', level: 'drzava', family: 'specific-consumption', group: 'state', keys: ['D214A:C01'],
    official: 'Excise duty on alcohol and alcoholic drinks', native: 'Trošarine na alkohol in alkoholne pijače', common: 'Alcohol excise',
    base: 'Spirits, wine, beer and other alcoholic drinks.',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'specific', headline: 'Per litre of product or pure alcohol', details: [] },
    explanation: 'EUR 124 million in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet SI, D214A C01')], label: 'Alcohol excise', sub: 'Spirits · wine · beer', glyph: 'wine',
  }),
  inst({
    id: 'si-gambling', parent: 'drzava', level: 'drzava', family: 'specific-consumption', group: 'state', keys: ['D214F:C01', 'D214F:C02', 'D214F:C04', 'D29E:C02'],
    official: 'Taxes on special and classical games of chance, lottery tickets, and concession duties on special gambling', native: 'Davki od iger na srečo; koncesijske dajatve', common: 'Gambling taxes and duties',
    base: 'Casinos and other special games (EUR 50.2 million), classical games (4.2), lottery tickets (25.4), and the concession duties from special gambling (43.9).',
    payer: 'Gambling operators.',
    rate: { kind: 'varies', headline: 'Set by the Gaming Act and the tax laws', details: [] },
    explanation: 'Four lines of the list that tax gambling.',
    exceptions: [], refs: [ref(NTL, 'sheet SI, D214F C01, C02, C04, D29E C02')], label: 'Gambling', sub: 'Casinos · lotteries', glyph: 'dice',
  }),
  inst({
    id: 'si-insurance-tax', parent: 'drzava', level: 'drzava', family: 'specific-consumption', group: 'state', keys: ['D214G:C01'],
    official: 'Tax on insurance services turnover', native: 'Davek od prometa zavarovalnih storitev', common: 'Insurance premium tax',
    base: 'Insurance premiums.',
    payer: 'Insurers and policyholders.',
    rate: { kind: 'varies', headline: 'Set by the Act', details: [] },
    explanation: 'EUR 152 million in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet SI, D214G C01')], label: 'Insurance tax', sub: 'Premiums', glyph: 'shield',
  }),
  inst({
    id: 'si-financial-sector-taxes', parent: 'drzava', level: 'drzava', category: 'special-levy', family: 'other', group: 'state', keys: ['D91C:C01', 'D214H:C02', 'D29H:C02'],
    official: 'Tax on the balance sheet total of banks, tax on financial services and the Deposit Guarantee Fund contributions', native: 'Davek na bilančno vsoto bank; davek na finančne storitve; sklad za jamstvo vlog', common: 'Bank and financial-sector taxes',
    base: 'Banks’ balance sheet totals (EUR 106 million, a line that did not exist in 2023), financial services (EUR 80 million) and contributions to the deposit guarantee fund (EUR 38 million).',
    payer: 'Banks and financial institutions.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Three levies on the financial sector.',
    exceptions: [], refs: [ref(NTL, 'sheet SI, D91C, D214H C02, D29H C02')], label: 'Financial-sector taxes', sub: 'Banks', glyph: 'bank',
  }),
  inst({
    id: 'si-property-transfer-tax', parent: 'drzava', level: 'drzava', family: 'property', group: 'state', keys: ['D214C:C01', 'D214C:C02'],
    official: 'Tax on the sale of immovable property (legal entities and individuals)', native: 'Davek na promet nepremičnin', common: 'Property transfer tax',
    base: 'Sales of immovable property.',
    payer: 'Buyers or sellers, by the Act.',
    rate: { kind: 'varies', headline: 'Set by the Act', details: ['EUR 45.4 million from individuals and EUR 6.5 million from legal entities in 2024.'] },
    explanation: 'The State’s tax on property transactions.',
    exceptions: [], refs: [ref(NTL, 'sheet SI, D214C')], label: 'Property transfer tax', sub: 'Sales', glyph: 'stamp',
  }),
  inst({
    id: 'si-vehicle-taxes', parent: 'drzava', level: 'drzava', family: 'specific-consumption', group: 'state', keys: ['D214D:C01', 'D214D:C02', 'D214D:C03', 'D29B:C01', 'D59D:C01', 'D59A:C03', 'D59A:C05'],
    official: 'Tax on motor vehicles, registration fees for motor vehicles, boats and aircraft, and taxes on boats', native: 'Davek od motornih vozil; pristojbine za registracijo; davek od plovil', common: 'Vehicle taxes',
    base: 'New and used motor vehicles (EUR 20.5 million), registration of motor vehicles, boats and aircraft (EUR 136.9 million by individuals and 35.1 million by legal entities), and boats (EUR 0.8 million).',
    payer: 'Vehicle owners and buyers.',
    rate: { kind: 'varies', headline: 'By vehicle', details: [] },
    explanation: 'Most of it is the registration fee paid by individuals.',
    exceptions: [], refs: [ref(NTL, 'sheet SI, D214D, D29B C01, D59D C01, D59A C03 and C05')], label: 'Vehicle taxes', sub: 'Registration', glyph: 'car',
  }),
  inst({
    id: 'si-environmental-charges', parent: 'drzava', level: 'drzava', category: 'tax', family: 'resource', group: 'state', keys: ['D214L:C01', 'D29F:C03', 'D29F:C01', 'D29F:C02', 'D29F:C05', 'D59D:C03'],
    official: 'Air pollution taxes, water charges, waste and water-pollution taxes, and the indemnity for the area around the nuclear power plant', native: 'Takse za obremenjevanje zraka; vodna povračila; okoljska dajatev za odpadne vode', common: 'Environmental taxes and charges',
    base: 'Air pollution (EUR 147 million; EUR 15.7 million from gas and hard fuels), use of water (EUR 31.7 million), special water tax (EUR 21.5 million), nuclear power plant area (EUR 14.5 million), waste (EUR 1.95 million).',
    payer: 'Polluters and water users.',
    rate: { kind: 'varies', headline: 'Set by the environmental protection laws', details: ['The sale of emission permits (EUR 163.8 million) is not counted.'] },
    explanation: 'Air pollution taxes doubled from EUR 77 million in 2023 to EUR 147 million in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet SI, D214L C01, D29F, D59D C03')], label: 'Environmental taxes', sub: 'Air · water', glyph: 'leaf',
  }),
  inst({
    id: 'si-energy-contributions', parent: 'drzava', level: 'drzava', category: 'special-levy', family: 'specific-consumption', group: 'state', keys: ['D214L:C04', 'D214L:C05'],
    official: 'Contribution for renewable and CHP electricity support and the energy efficiency contribution', native: 'Prispevek za podpore OVE in SPTE; prispevek za energetsko učinkovitost', common: 'Electricity-sector contributions',
    base: 'Electricity consumption; the list names them support for electricity from renewable sources and combined heat and power (EUR 106 million) and the energy efficiency contribution (EUR 38 million).',
    payer: 'Electricity consumers.',
    rate: { kind: 'varies', headline: 'Set by regulation', details: [] },
    explanation: 'Compulsory charges that the statisticians book as taxes on products.',
    exceptions: [], refs: [ref(NTL, 'sheet SI, D214L C04 and C05')], label: 'Electricity contributions', sub: 'Renewables', glyph: 'bolt',
  }),
  inst({
    id: 'si-concessions', parent: 'drzava', level: 'drzava', category: 'fee', family: 'other', group: 'state', keys: ['D29E:C01', 'D29E:C03'],
    official: 'Concession revenue and the charge for temporary or part-time work of pensioners', native: 'Koncesijski prihodki; dajatev za začasno ali občasno delo upokojencev', common: 'Concessions and pensioners’ work charge',
    base: 'Concessions (EUR 138 million) and the charge on temporary or part-time work of pensioners (EUR 11 million).',
    payer: 'Concession holders and the payers of pensioners’ work.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Two lines that the list books as other taxes on production.',
    exceptions: [], refs: [ref(NTL, 'sheet SI, D29E C01 and C03')], label: 'Concessions', sub: 'Fees', glyph: 'key',
  }),
  inst({
    id: 'si-rtv-fee', parent: 'drzava', level: 'drzava', category: 'fee', family: 'other', group: 'state', keys: ['D59D:C02'],
    official: 'Radio and television licence fee', native: 'RTV naročnina', common: 'Radio and TV licence fee',
    base: 'As named in the National Tax List: the radio and television licence fee; the list gives no more detail.',
    payer: 'Households and others subject to the fee.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'The fee for the public broadcaster, EUR 99 million.',
    exceptions: [], refs: [ref(NTL, 'sheet SI, D59D C02')], label: 'RTV licence fee', sub: 'Broadcaster', glyph: 'scroll',
  }),
  inst({
    id: 'si-property-and-estate', parent: 'drzava', level: 'drzava', family: 'property', group: 'state', keys: ['D91A:C01', 'D91B:C01', 'D59A:C01', 'D59A:C02', 'D59A:C04', 'D59A:C06'],
    official: 'Inheritance and gift tax, payments for change of use of land, property tax on buildings and weekend cottages, tax on real estate of higher value, easements', native: 'Davek na dediščine in darila; davek od premoženja stavb; davek od vikendov', common: 'Inheritance tax and other property taxes',
    base: 'Inheritance and gifts (EUR 14.0 million), the change of use of agricultural and forest land (EUR 4.3 million), buildings (EUR 8.9 million), weekend cottages (EUR 1.3 million), easements and building rights (EUR 1.0 million); the tax on real estate of higher value is zero.',
    payer: 'Heirs and owners.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Six small lines.',
    exceptions: [], refs: [ref(NTL, 'sheet SI, D91A, D91B, D59A')], label: 'Inheritance and property', sub: 'Small taxes', glyph: 'gem',
  }),
  inst({
    id: 'si-other-state', parent: 'drzava', level: 'drzava', category: 'fee', family: 'other', group: 'state', keys: ['D214L:C02', 'D214L:C03', 'D214H:C03', 'D214H:C04', 'D59F:C01', 'D29G:C01'],
    official: 'Toll markup, Koper port transhipment fee, oil emergency reserves compensation, promotional tax, fire protection tax and the VAT flat-rate compensation', native: 'Pribitek k cestnini; taksa na pretovor v Kopru; promocijska taksa; požarna taksa', common: 'Other State taxes and fees',
    base: 'The smaller lines of the list: toll markup (EUR 13.2 million), transhipment fee in the port of Koper (7.4), promotional tax (6.7), fire protection tax (23.7), the compensation for the public service of keeping emergency oil reserves, and the negative VAT compensation added back (7.3).',
    payer: 'Various.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Six small lines.',
    exceptions: [], refs: [ref(NTL, 'sheet SI, D214L C02 and C03, D214H C03 and C04, D59F C01, D29G C01')], label: 'Other State taxes', sub: 'Tolls · port · fire', glyph: 'stamp',
  }),
  /* ---- municipalities ---- */
  inst({
    id: 'si-building-land-compensation', parent: 'obcine', level: 'obcine', family: 'property', group: 'localland', keys: ['D29A:C01', 'D29A:C02'],
    official: 'Compensation for the use of building land (legal entities and individuals)', native: 'Nadomestilo za uporabo stavbnega zemljišča', common: 'Building land compensation',
    base: 'Building land and buildings; the list shows EUR 201.6 million paid by legal entities and EUR 89.3 million by individuals.',
    payer: 'Owners and users of building land.',
    rate: { kind: 'range', headline: 'Set by each municipality', details: ['The list does not give rates.'] },
    explanation: 'The municipalities’ main own revenue in the list and the closest thing to a property tax; the real property tax on buildings is a small State line.',
    exceptions: [], refs: [ref(NTL, 'sheet SI, D29A C01 and C02'), ref(EUS, 'S.1313, D29A')], label: 'Building land compensation', sub: 'Municipal', glyph: 'house',
  }),
  inst({
    id: 'si-tourist-tax', parent: 'obcine', level: 'obcine', category: 'fee', family: 'specific-consumption', group: 'localtourist', keys: ['D214H:C01'],
    official: 'Tourist tax (sojourn tax)', native: 'Turistična taksa', common: 'Tourist tax',
    base: 'Overnight stays of guests.',
    payer: 'Guests; the accommodation provider collects it.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'EUR 28.4 million in 2024, up from EUR 25.5 million in 2023.',
    exceptions: [], refs: [ref(NTL, 'sheet SI, D214H C01')], label: 'Tourist tax', sub: 'Per night', glyph: 'bed',
  }),
];

const part = (g: string) => n.round(instruments.filter((i) => i.rev?.group === g).reduce((a, i) => a + i.rev!.amount, 0));
const sectorSum = (code: string) => ['S1311', 'S1312', 'S1313', 'S1314', 'S212'].reduce((a, s) => a + (sec[`${s}:${code}`] ?? 0), 0);
const vintage = ['D2', 'D5', 'D61'].map((c) => `${c}: NTL ${n.fmt(n.total(c))}, Eurostat July 2026 ${n.fmt(sectorSum(c))}`).join('; ');

const spec: CountrySpec = {
  today: D,
  id: 'slovenia',
  iso3: 'SVN',
  isoNumeric: '705',
  names: { en: 'Slovenia', native: 'Slovenija', nativeLang: 'sl' },
  currency: { code: 'EUR', symbol: '€', name: 'Euro' },
  summary:
    'Slovenia is a unitary state: the National Assembly sets all taxes and the Financial Administration (FURS) collects them. Social contributions are the largest flow, shared between employers and employees, followed by VAT and the personal income tax. Municipalities have no income tax; they live on a compensation for the use of building land, a tourist tax, and a share of the personal income tax that the national accounts count as a transfer.',
  structureNote:
    'The figures are the Commission’s National Tax List for 2024. Imputed social contributions of employers (EUR 205 million) and the sale of emission permits (EUR 163.8 million) are left out. The social contributions are drawn under the State. The two municipal taxes follow Eurostat’s accounts, which book EUR 319 million of taxes on production to local government; the lines of the list for them add up to the same amount.',
  theme: {
    accent: '#3fa7ff',
    accent2: '#e63946',
    motif: 'topo',
    motifNote: 'Topographic contour lines over the outline of Slovenia (the generic motif; no bespoke art yet).',
    mapLabel: { lon: 14.8, lat: 46.1 },
  },
  rootLabel: { label: 'Slovenia', sub: 'Slovenija · Fiscal folio' },
  levels: [
    {
      id: 'drzava', branch: 'national', official: 'The State (Republic of Slovenia)', native: 'Država', common: 'State',
      description: 'The National Assembly legislates all taxes; the Financial Administration (FURS) collects them and the social contributions, which fund the Health Insurance Institute (ZZZS), the Pension and Disability Insurance Institute (ZPIZ) and the employment service.',
      fiscalPower: 'Taxes are set by national law; municipalities may set only the rates and fees that the law leaves to them.',
      refs: [ref(NTL)], label: 'State', sub: 'Država',
    },
    {
      id: 'obcine', branch: 'local', official: 'Municipalities', native: 'Občine', common: 'Municipalities',
      description: 'The only tier below the State. They set the compensation for the use of building land and the tourist tax within the limits of national law, and receive a share of the personal income tax from the central budget.',
      fiscalPower: 'The law lets municipalities decide the building land compensation and the tourist tax.',
      refs: [ref(EUS)], label: 'Municipalities', sub: 'Občine',
    },
  ],
  supporting: [],
  denominators: [
    {
      id: 'drzava-taxes-2024', label: 'State taxes (National Tax List), 2024',
      definition: 'The taxes on production and imports, on income and wealth, and on capital that the National Tax List books to the State and the EU, other than the two municipal taxes and the sale of emission permits.',
      levelIds: ['drzava'], amount: part('state'), period: y, sourceId: NTL,
      locator: 'Sheet SI, 2024, the lines listed with each tax',
      calculation: `Sum of the ${instruments.filter((i) => i.rev?.group === 'state').length} tax rows below (EUR million)`,
      caveat: `Calendar 2024; the list's cut-off was 30 October 2025. Vintage check against Eurostat's July 2026 accounts: ${vintage}.`,
    },
    {
      id: 'drzava-social-employers-2024', label: 'Social contributions paid by employers, 2024',
      definition: 'The actual compulsory contributions of employers (pension and disability, health, maternity and employment); imputed contributions are left out.',
      levelIds: ['drzava'], amount: part('socialer'), period: y, sourceId: NTL,
      locator: 'Sheet SI, 2024, lines D611 C01 to C04',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'drzava-social-households-2024', label: 'Social contributions paid by households, 2024',
      definition: 'The compulsory contributions of employees and of the self-employed.',
      levelIds: ['drzava'], amount: part('socialhh'), period: y, sourceId: NTL,
      locator: 'Sheet SI, 2024, lines D613CE and D613CS',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'obcine-land-2024', label: 'Compensation for the use of building land, 2024',
      definition: 'The compensation paid by legal entities and by individuals to the municipalities.',
      levelIds: ['obcine'], amount: part('localland'), period: y, sourceId: NTL,
      locator: 'Sheet SI, 2024, lines D29A C01 and C02',
      caveat: `Eurostat books EUR ${n.fmt(sec['S1313:D29A'])} million of land and building taxes to local government.`,
    },
    {
      id: 'obcine-tourist-2024', label: 'Tourist tax, 2024',
      definition: 'The tourist (sojourn) tax.',
      levelIds: ['obcine'], amount: part('localtourist'), period: y, sourceId: NTL,
      locator: 'Sheet SI, 2024, line D214H C01',
      caveat: `Eurostat books EUR ${n.fmt(sec['S1313:D2'])} million of taxes on production to local government in all; the two municipal parts come to EUR ${n.fmt(part('localland') + part('localtourist'))} million.`,
    },
  ],
  sizing: {
    label: 'Taxes and compulsory social contributions of all levels of government',
    definition: 'The taxes of the State and the municipalities plus the actual social contributions, calendar 2024, as listed in the National Tax List. Excludes the sale of emission permits and imputed social contributions.',
    componentIds: ['drzava-taxes-2024', 'drzava-social-employers-2024', 'drzava-social-households-2024', 'obcine-land-2024', 'obcine-tourist-2024'],
  },
  fromProfile: 'slovenia',
  structureOverride: {
    basis: 'OECD attribution to sub-sectors of general government (Interpretative Guide, section A.12)',
    folioLevels: { central: ['drzava'], local: ['obcine'] },
    levelNotes: { central: 'The OECD shows the social security funds separately; the folio draws their contributions under the State.' },
  },
  groups: {
    state: { title: 'State taxes 2024 – National Tax List (EUR million)', denominatorId: 'drzava-taxes-2024', period: y, basis: 'ESA tax revenue, general government and EU institutions', sourceId: NTL },
    socialer: { title: 'Employers’ social contributions 2024 – National Tax List (EUR million)', denominatorId: 'drzava-social-employers-2024', period: y, basis: 'Actual compulsory contributions', sourceId: NTL },
    socialhh: { title: 'Households’ social contributions 2024 – National Tax List (EUR million)', denominatorId: 'drzava-social-households-2024', period: y, basis: 'Compulsory contributions', sourceId: NTL },
    localland: { title: 'Building land compensation 2024 – National Tax List (EUR million)', denominatorId: 'obcine-land-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
    localtourist: { title: 'Tourist tax 2024 – National Tax List (EUR million)', denominatorId: 'obcine-tourist-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
  },
  sources: [
    { id: NTL, org: 'European Commission, DG Taxation and Customs Union, with Eurostat', title: 'Data on Taxation Trends: National Tax Lists (NTL), edition 2026', url: 'https://taxation-customs.ec.europa.eu/taxation/economic-analysis/data-taxation-trends_en', kind: 'statistics', language: 'en', publishedDate: '2026-03-31', periodCovered: 'Calendar year 2024 (series from 1995)', accessed: D, nextExpected: '2027-03', note: 'Workbook "NTL edition 2026 web.xlsx", sheet SI: every tax and social contribution by its national name and ESA code, in EUR million. Data cut-off 30 October 2025.' },
    { id: EUS, org: 'Eurostat', title: 'Main national accounts tax aggregates (gov_10a_taxag)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table', kind: 'statistics', language: 'en', publishedDate: '2026-07-21', periodCovered: 'Calendar year 2024', accessed: D, nextExpected: '2027-07', note: 'Taxes and social contributions by sub-sector and ESA item; used to place each tax at a level and to check the totals of the National Tax List.' },
    { id: PWC_CIT, org: 'PwC', title: 'Worldwide Tax Summaries: Slovenia – Corporate – Taxes on corporate income', url: 'https://taxsummaries.pwc.com/slovenia/corporate/taxes-on-corporate-income', kind: 'guidance', language: 'en', publishedDate: '2026-07-15', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary, not an official source: corporate income tax 22% for 2024 to 2028 (19% before).' },
    { id: PWC_PIT, org: 'PwC', title: 'Worldwide Tax Summaries: Slovenia – Individual – Taxes on personal income', url: 'https://taxsummaries.pwc.com/slovenia/individual/taxes-on-personal-income', kind: 'guidance', language: 'en', publishedDate: '2026-07-15', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary: personal income tax brackets 16/26/33/39/50% and a flat 25% on capital income.' },
    { id: PWC_OTH, org: 'PwC', title: 'Worldwide Tax Summaries: Slovenia – Corporate – Other taxes', url: 'https://taxsummaries.pwc.com/slovenia/corporate/other-taxes', kind: 'guidance', language: 'en', publishedDate: '2026-07-15', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary: VAT 22%, 9.5% and 5%; social contributions employee 22.10% and employer 16.10%.' },
  ],
  instruments,
};

buildCountry(spec);
n.reconcile(part('state') + part('socialer') + part('socialhh') + part('localland') + part('localtourist'), ['T:D612', 'D29F:C06']);
