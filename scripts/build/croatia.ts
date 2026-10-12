/**
 * Croatia: the folio's data. Run: npx tsx scripts/build/croatia.ts
 * Figures: Commission / Eurostat National Tax List (NTL), edition 2026, sheet HR, calendar 2024, EUR million
 * (scripts/build/data/ntl-HR.json). Level placement checked against Eurostat gov_10a_taxag (the line amounts
 * add up to the sector totals almost exactly).
 * Rates: PwC Worldwide Tax Summaries (review of 27 August 2026), a professional-firm summary.
 * Croatia is not an OECD member, so there is no harmonised OECD layer (structure.json) for it.
 */
import { buildCountry, type CountrySpec, type InstSpec, type Ref } from '../lib/build-country';
import { loadNtl, loadSectors } from '../lib/ntl';

const D = '2026-10-12';
const y = { label: '2024', kind: 'calendar-year' as const, start: '2024-01-01', end: '2024-12-31' };
const ref = (id: string, loc?: string): Ref => (loc ? [id, loc] : [id]);
const n = loadNtl('HR', 'EUR');
const sec = loadSectors('HR');
const NTL = 'ntl-2026';
const EUS = 'eurostat-taxag';
const PWC_CIT = 'pwc-hr-corporate';
const PWC_PIT = 'pwc-hr-individual';
const PWC_OTH = 'pwc-hr-other';
const PWC_NOTE = 'As summarised by PwC (review of 27 August 2026), not checked against the Tax Administration.';

const inst = (i: Omit<InstSpec, 'rev'> & { keys: string[]; group: string }): InstSpec => {
  const { keys, group, ...rest } = i;
  return { ...rest, rev: n.rev(group, keys) };
};

const instruments: InstSpec[] = [
  inst({
    id: 'hr-cit', parent: 'drzava', level: 'drzava', family: 'income-corporate', group: 'state', keys: ['D51B:C01'],
    official: 'Corporate income tax (profit tax)', native: 'Porez na dobit', common: 'Corporate income tax',
    base: 'Profit of companies.',
    payer: 'Companies.',
    rate: { kind: 'flat', headline: '18%; 10% below EUR 1 million of revenue', details: ['CIT is generally paid at 18%; taxpayers with revenue below EUR 1 million pay 10% (PwC).', PWC_NOTE], asOf: '2026-08-27' },
    explanation: 'EUR 2.7 billion in 2024: all of it a State tax.',
    exceptions: [], refs: [ref(PWC_CIT, 'Corporate income tax')], label: 'Corporate income tax', sub: '18% · 10%', glyph: 'factory',
  }),
  inst({
    id: 'hr-vat', parent: 'drzava', level: 'drzava', family: 'general-consumption', group: 'state', keys: ['D211:C01', 'D211:C02', 'D211:C03'],
    official: 'Value added tax (domestic, on imports of goods and on services of foreign entrepreneurs)', native: 'Porez na dodanu vrijednost (PDV)', common: 'VAT', abbr: 'PDV',
    base: 'Goods and services supplied in Croatia and imports.',
    payer: 'Consumers; businesses charge it and claim input credits.',
    rate: { kind: 'range', headline: '25% standard; 13% and 5% reduced', details: ['The general VAT rate is 25%; 13% applies to accommodation, newspapers and magazines, among others (PwC).', PWC_NOTE], asOf: '2026-08-27' },
    explanation: 'The largest tax: EUR 11.4 billion.',
    exceptions: [], refs: [ref(PWC_OTH, 'Value-added tax')], label: 'VAT', sub: '25%', glyph: 'cart',
  }),
  inst({
    id: 'hr-customs', parent: 'drzava', level: 'drzava', category: 'customs-duty', family: 'trade', group: 'state', keys: ['D2121:C01'],
    official: 'Customs', native: 'Carina', common: 'Customs duties',
    base: 'Goods imported from outside the EU, by the Common Customs Tariff.',
    payer: 'Importers.',
    rate: { kind: 'varies', headline: 'EU Common Customs Tariff', details: ['An EU own resource; Eurostat records it under the EU institutions.'] },
    explanation: 'Collected for the EU budget.',
    exceptions: [], refs: [ref(EUS, 'S.212, D212')], label: 'Customs duties', sub: 'EU tariff', glyph: 'ship',
  }),
  inst({
    id: 'hr-excise-fuel', parent: 'drzava', level: 'drzava', family: 'specific-consumption', group: 'state', keys: ['D214A:C02', 'D214A:C12', 'D214A:C13', 'D214A:C14'],
    official: 'Excise taxes on mineral oils, electricity, natural gas and solid fuels', native: 'Trošarina na energente', common: 'Fuel and energy excise',
    base: 'Mineral oils (EUR 1,401.7 million), electricity (EUR 5.0 million), natural gas (EUR 3.7 million) and solid fuels.',
    payer: 'Fuel suppliers; passed on at the pump.',
    rate: { kind: 'specific', headline: 'Per 1,000 litres', details: [] },
    explanation: 'The largest excise.',
    exceptions: [], refs: [ref(NTL, 'sheet HR, D214A C02, C12–C14')], label: 'Fuel excise', sub: 'Mineral oils', glyph: 'flame',
  }),
  inst({
    id: 'hr-excise-tobacco', parent: 'drzava', level: 'drzava', family: 'specific-consumption', group: 'state', keys: ['D214A:C06'],
    official: 'Excise taxes on tobacco products', native: 'Trošarina na duhanske proizvode', common: 'Tobacco excise',
    base: 'Cigarettes and other tobacco products.',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'mechanism', headline: 'Fixed by the Excise Duties Act', details: [] },
    explanation: 'EUR 1.0 billion.',
    exceptions: [], refs: [ref(NTL, 'sheet HR, D214A C06')], label: 'Tobacco excise', sub: 'Cigarettes', glyph: 'smoke',
  }),
  inst({
    id: 'hr-excise-drinks', parent: 'drzava', level: 'drzava', family: 'specific-consumption', group: 'state', keys: ['D214A:C03', 'D214A:C04', 'D214A:C05', 'D214A:C07'],
    official: 'Excise taxes on alcohol, beer, non-alcoholic drinks and coffee', native: 'Trošarina na alkohol, pivo, bezalkoholna pića i kavu', common: 'Alcohol, soft drink and coffee excises',
    base: 'Beer (EUR 90.7 million), alcohol (EUR 63.7 million), non-alcoholic drinks (EUR 36.1 million) and coffee (EUR 16.9 million).',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'specific', headline: 'Per litre or per kilogram', details: [] },
    explanation: 'Four lines.',
    exceptions: [], refs: [ref(NTL, 'sheet HR, D214A C03–C05, C07')], label: 'Alcohol and drinks excises', sub: 'Alcohol · beer · coffee', glyph: 'wine',
  }),
  inst({
    id: 'hr-excise-cars', parent: 'drzava', level: 'drzava', family: 'specific-consumption', group: 'state', keys: ['D214A:C11', 'D214A:C01'],
    official: 'Excise taxes on motor vehicles, vessels and aircraft', native: 'Posebni porez na motorna vozila', common: 'Motor vehicle excise',
    base: 'New and imported motor vehicles on registration (EUR 176.2 million), and a very small tax on vessels and aircraft.',
    payer: 'Buyers and importers of vehicles.',
    rate: { kind: 'varies', headline: 'By price and emissions', details: [] },
    explanation: 'Paid once, at registration.',
    exceptions: [], refs: [ref(NTL, 'sheet HR, D214A C01 and C11')], label: 'Vehicle excise', sub: 'Registration', glyph: 'car',
  }),
  inst({
    id: 'hr-renewable-fee', parent: 'drzava', level: 'drzava', category: 'special-levy', family: 'specific-consumption', group: 'state', keys: ['D214A:C15'],
    official: 'Fee for incentivising electricity production from renewable energy sources', native: 'Naknada za poticanje proizvodnje električne energije iz obnovljivih izvora', common: 'Renewable energy fee',
    base: 'Electricity consumption.',
    payer: 'Electricity consumers.',
    rate: { kind: 'varies', headline: 'Set by regulation', details: [] },
    explanation: 'EUR 213.7 million in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet HR, D214A C15')], label: 'Renewable energy fee', sub: 'Electricity', glyph: 'bolt',
  }),
  inst({
    id: 'hr-waste-fees', parent: 'drzava', level: 'drzava', category: 'fee', family: 'resource', group: 'state', keys: ['D214A:C16', 'D214A:C17', 'D214A:C18', 'D214A:C19', 'D214A:C20'],
    official: 'Waste management fees: packaging and deposit, electronic equipment, end-of-life vehicles, tyres and lubricating oils', native: 'Naknade za gospodarenje otpadom', common: 'Waste management fees',
    base: 'Packaging (EUR 120.7 million), WEEE (EUR 31.2 million), end-of-life vehicles (EUR 18.5 million), waste tyres (EUR 5.3 million) and waste lubricating oils (EUR 3.5 million).',
    payer: 'Producers and importers.',
    rate: { kind: 'varies', headline: 'Set by the waste regulations', details: [] },
    explanation: 'Five lines that the list books among taxes on products.',
    exceptions: [], refs: [ref(NTL, 'sheet HR, D214A C16–C20')], label: 'Waste management fees', sub: 'Packaging · WEEE', glyph: 'leaf',
  }),
  inst({
    id: 'hr-gambling', parent: 'drzava', level: 'drzava', family: 'specific-consumption', group: 'state', keys: ['D214F:C01', 'D214F:C02', 'D214F:C03', 'D214F:C04', 'D214F:C06', 'D29E:C03', 'D29E:C04', 'D29E:C05', 'D51D:C01', 'D51D:C02'],
    official: 'Levies on games of chance (monthly and annual) and the tax on winnings', native: 'Naknade za priređivanje igara na sreću; porez na dobitke', common: 'Gambling levies and winnings tax',
    base: 'Monthly levies on slot machines (EUR 92.5 million), betting (EUR 60.0 million), casinos (EUR 64.0 million) and lotteries (EUR 17.3 million), annual levies (EUR 31.0 million) and the tax on winnings from lottery and betting games (EUR 78.5 million).',
    payer: 'Gambling operators and winners.',
    rate: { kind: 'varies', headline: 'Set by the Gambling Act and the Income Tax Act', details: [] },
    explanation: 'Ten lines.',
    exceptions: [], refs: [ref(NTL, 'sheet HR, D214F, D29E C03–C05, D51D')], label: 'Gambling', sub: 'Levies · winnings', glyph: 'dice',
  }),
  inst({
    id: 'hr-insurance-tax', parent: 'drzava', level: 'drzava', family: 'specific-consumption', group: 'state', keys: ['D214G:C01', 'D214G:C02'],
    official: 'Taxes on liability and comprehensive road vehicle insurance premiums', native: 'Porez na premije osiguranja', common: 'Vehicle insurance premium tax',
    base: 'Premiums for liability insurance (EUR 66.8 million) and comprehensive insurance (EUR 30.8 million) of road vehicles.',
    payer: 'Policyholders.',
    rate: { kind: 'varies', headline: 'A percentage of premiums', details: [] },
    explanation: 'Two lines.',
    exceptions: [], refs: [ref(NTL, 'sheet HR, D214G')], label: 'Insurance premium tax', sub: 'Vehicles', glyph: 'shield',
  }),
  inst({
    id: 'hr-water-fees', parent: 'drzava', level: 'drzava', category: 'fee', family: 'resource', group: 'state', keys: ['D29H:C03', 'D29H:C04', 'D59F:C01', 'D59F:C02', 'D59F:C03', 'D59F:C05', 'D29F:C09', 'D29A:C04'],
    official: 'Water management (regulation) fee, water use charge, water contribution and water protection fee', native: 'Naknada za uređenje voda; naknada za korištenje voda; vodni doprinos; naknada za zaštitu voda', common: 'Water fees',
    base: 'Water regulation fees (EUR 133.8 million from legal and natural persons), water use (EUR 94.5 million), the water protection fee (EUR 34.9 million) and the water contribution (EUR 8.8 million).',
    payer: 'Water users, households and businesses.',
    rate: { kind: 'varies', headline: 'Set by the Waters Act', details: ['The list codes the household lines under other current taxes and the company lines under other taxes on production.'] },
    explanation: 'Eight lines of the list.',
    exceptions: [], refs: [ref(NTL, 'sheet HR, D29H C03–C04, D59F C01–C03 and C05, D29F C09, D29A C04')], label: 'Water fees', sub: 'Use · regulation', glyph: 'water',
  }),
  inst({
    id: 'hr-hrt-fee', parent: 'drzava', level: 'drzava', category: 'fee', family: 'other', group: 'state', keys: ['D59D:C03', 'D29E:C02'],
    official: 'Fee for Croatian Radiotelevision (HRT), households and legal persons', native: 'Pristojba HRT-a', common: 'Public broadcaster fee',
    base: 'Households (EUR 131.1 million) and legal persons (EUR 24.2 million).',
    payer: 'Households and businesses.',
    rate: { kind: 'specific', headline: 'A fixed monthly amount', details: [] },
    explanation: 'The fee that finances the public broadcaster.',
    exceptions: [], refs: [ref(NTL, 'sheet HR, D59D C03, D29E C02')], label: 'HRT fee', sub: 'Broadcaster', glyph: 'scroll',
  }),
  inst({
    id: 'hr-maritime-forest', parent: 'drzava', level: 'drzava', category: 'fee', family: 'resource', group: 'state', keys: ['D29A:C03', 'D29A:C06', 'D59D:C05'],
    official: 'Forest contributions, compensation for the public-use functions of forests, and the maritime safety charge', native: 'Doprinos za šume; naknada za korištenje općekorisnih funkcija šuma; pristojba za sigurnost pomorske plovidbe', common: 'Forest and maritime charges',
    base: 'Contributions for forests (EUR 35.7 million), compensation for the public-use functions of forests (EUR 35.1 million) and the maritime safety charge paid by natural persons (EUR 5.8 million).',
    payer: 'Forest users, businesses and boat owners.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Three small lines.',
    exceptions: [], refs: [ref(NTL, 'sheet HR, D29A C03 and C06, D59D C05')], label: 'Forest and maritime charges', sub: 'Small', glyph: 'leaf',
  }),
  inst({
    id: 'hr-environmental-levies', parent: 'drzava', level: 'drzava', category: 'special-levy', family: 'resource', group: 'state', keys: ['D29F:C01', 'D29F:C03', 'D29F:C07', 'D59F:C06', 'D29H:C09'],
    official: 'Levies on industrial waste, CO₂ emissions and motor vehicles, and the energy windfall surtax', native: 'Naknade za okoliš; dodatni porez na energiju', common: 'Environmental levies and windfall surtax',
    base: 'The levy on the environment on motor vehicles (EUR 26.6 million in two lines), CO₂ emissions (EUR 0.7 million), non-hazardous industrial waste (EUR 0.4 million) and energy surtaxes, named in the list as windfall taxes (EUR 10.5 million).',
    payer: 'Vehicle owners, emitters and energy companies.',
    rate: { kind: 'varies', headline: 'Set by law', details: ['The sale of emission permits (EUR 197.0 million) is not counted.'] },
    explanation: 'Five small lines.',
    exceptions: [], refs: [ref(NTL, 'sheet HR, D29F C01, C03, C07, D59F C06, D29H C09')], label: 'Environmental levies', sub: 'Vehicles · CO₂', glyph: 'leaf',
  }),
  inst({
    id: 'hr-small-state-fees', parent: 'drzava', level: 'drzava', category: 'fee', family: 'other', group: 'state', keys: ['D29H:C08', 'D29C:C01', 'D29H:C05', 'D29H:C06', 'D29H:C07', 'D29E:C01', 'D214H:C01', 'D214H:C04', 'D214I:C01', 'D214I:C02', 'D51E:C01'],
    official: 'Membership fee for tourism communities, allowance for not employing persons with disabilities, regulator fees and other small lines', native: 'Članarina turističkim zajednicama; naknada zbog neizvršavanja obveze zapošljavanja osoba s invaliditetom', common: 'Tourism membership, disability allowance and small fees',
    base: 'The tourism communities’ membership fee (EUR 49.2 million), the allowance for failing to employ persons with disabilities (EUR 23.7 million), regulator fees (EUR 12.3 million in three lines), the passenger compensation of the civil aviation agency (EUR 8.6 million) and small lines.',
    payer: 'Businesses.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Eleven small lines.',
    exceptions: [], refs: [ref(NTL, 'sheet HR, D29H C05–C08, D29C C01, D29E C01, D214H C01 and C04, D214I, D51E')], label: 'Small fees', sub: 'Tourism · regulators', glyph: 'stamp',
  }),
  /* ---- social contributions ---- */
  inst({
    id: 'hr-social-employers', parent: 'drzava', level: 'drzava', category: 'social-contribution', family: 'social-security', group: 'socialer', keys: ['D611C:C01'],
    official: 'Employers’ compulsory social contributions (health insurance)', native: 'Doprinos za zdravstveno osiguranje na plaću', common: 'Employers’ contributions',
    base: 'Gross salary, with no cap.',
    payer: 'Employers.',
    rate: { kind: 'flat', headline: '16.5% of gross salary for health insurance', details: ['Employers make social contributions at the rate of 16.5% for health insurance, on gross pay that is not capped (PwC).', PWC_NOTE], asOf: '2026-08-27' },
    explanation: 'EUR 4.8 billion; the employees pay the pension contributions.',
    exceptions: [], refs: [ref(PWC_OTH, 'Social security contributions')], label: 'Social: employers', sub: '16.5% health', glyph: 'heart',
  }),
  inst({
    id: 'hr-social-employees', parent: 'drzava', level: 'drzava', category: 'social-contribution', family: 'social-security', group: 'socialhh', keys: ['T:D613'],
    official: 'Households’ compulsory social contributions (employees, the self-employed and others)', native: 'Doprinosi za mirovinsko osiguranje', common: 'Employees’ and self-employed contributions',
    base: 'Gross salary (employees, EUR 4,508 million, withheld by the employer) and the income of the self-employed (EUR 347 million); the list’s subtotal of EUR 5,003 million also holds EUR 148 million that it does not itemise.',
    payer: 'Employees (withheld), the self-employed and others.',
    rate: { kind: 'flat', headline: 'Set by the pension insurance laws', details: ['PwC states that the Croatian social security system covers pension and health and that the charges are borne by the employee and the employer; the employees’ rate is not extracted here.'] },
    explanation: 'The pension insurance contributions are collected from the employee.',
    exceptions: [], refs: [ref(PWC_OTH, 'Social security contributions'), ref(NTL, 'sheet HR, D613CE and D613CS')], label: 'Social: households', sub: 'Pension', glyph: 'heart',
  }),
  /* ---- local and regional self-government ---- */
  inst({
    id: 'hr-pit', parent: 'lokalne', level: 'lokalne', family: 'income-personal', group: 'localpit', keys: ['D51A:C01'],
    official: 'Personal income tax and local surtax', native: 'Porez na dohodak', common: 'Personal income tax',
    base: 'Wages, self-employment, rental and other income of residents; the progressive scale depends on the place of residence.',
    payer: 'Individuals; employers withhold it.',
    rate: { kind: 'range', headline: 'Two progressive rates chosen by each local unit between 15% and 33%', details: ['Progressive rates depend on the place of residence: each local self-government unit chooses two progressive rates between a lowest possible 15% and a highest possible 33%, within bounds that depend on its size; other income is taxed at flat rates (PwC).', PWC_NOTE], asOf: '2026-08-27' },
    explanation: 'EUR 3.4 billion, 45% of the taxes and contributions in this folio. Eurostat’s accounts book all of the personal income tax under local government: the local units set the rates and the proceeds are shared between them, the counties and the State through the fiscal equalisation system.',
    exceptions: [], refs: [ref(PWC_PIT, 'Personal income tax rates'), ref(EUS, 'S.1313, D51A')], label: 'Personal income tax', sub: '15–33% local', glyph: 'person',
  }),
  inst({
    id: 'hr-transfer-tax', parent: 'lokalne', level: 'lokalne', family: 'property', group: 'local', keys: ['D214C:C01', 'D91A:C01'],
    official: 'Real estate transfer tax and the inheritance and gift tax', native: 'Porez na promet nekretnina; porez na nasljedstva i darove', common: 'Property transfer and inheritance taxes',
    base: 'Real estate transfers (EUR 228.0 million) and inheritances and gifts (EUR 2.8 million).',
    payer: 'Buyers, heirs and donees.',
    rate: { kind: 'varies', headline: 'Set by the Real Estate Transfer Tax Act', details: ['Eurostat books both under local government.'] },
    explanation: 'Two lines.',
    exceptions: [], refs: [ref(NTL, 'sheet HR, D214C C01, D91A C01'), ref(EUS, 'S.1313, D214C and D91')], label: 'Property transfer tax', sub: 'Local', glyph: 'stamp',
  }),
  inst({
    id: 'hr-communal-charges', parent: 'lokalne', level: 'lokalne', category: 'fee', family: 'property', group: 'localcomm', keys: ['D29A:C02', 'D29A:C05', 'D59F:C04', 'D29A:C01', 'D29A:C07'],
    official: 'Utility charges, the municipal (communal) contribution, public land use taxes and the monumental annuity', native: 'Komunalna naknada; komunalni doprinos; porez na korištenje javnih površina; spomenička renta', common: 'Communal charges',
    base: 'Utility charges (EUR 407.5 million), the communal contribution (EUR 153.3 million from natural persons in two lines), the monumental annuity (EUR 14.2 million) and public land use taxes (EUR 12.4 million).',
    payer: 'Owners and users of property.',
    rate: { kind: 'varies', headline: 'Set by each municipality', details: [] },
    explanation: 'The communal charges are the main source of own revenue for municipalities outside the income tax.',
    exceptions: [], refs: [ref(NTL, 'sheet HR, D29A C01, C02, C05, C07, D59F C04'), ref(EUS, 'S.1313, D29A and D59F')], label: 'Communal charges', sub: 'Utility · contribution', glyph: 'town',
  }),
  inst({
    id: 'hr-local-vehicle-taxes', parent: 'lokalne', level: 'lokalne', family: 'specific-consumption', group: 'localveh', keys: ['D29B:C01', 'D29B:C02', 'D29B:C03', 'D29B:C04', 'D29B:C05', 'D59D:C01', 'D59D:C02', 'D59D:C04'],
    official: 'Motor vehicle taxes, boat taxes and the annual levy on public road use (legal and natural persons), and the maritime safety charge of legal persons', native: 'Porez na cestovna motorna vozila; porez na plovila; godišnja naknada za korištenje javnih cesta', common: 'Local vehicle taxes and road levy',
    base: 'The annual levy on public road use at registration (EUR 171.2 million from both groups), motor vehicle taxes (EUR 43.0 million), boat taxes and tractors, the maritime safety charge of legal persons.',
    payer: 'Vehicle and boat owners.',
    rate: { kind: 'varies', headline: 'By engine, age and emissions', details: ['Eurostat books these amounts under local government.'] },
    explanation: 'Eight lines.',
    exceptions: [], refs: [ref(NTL, 'sheet HR, D29B, D59D C01, C02, C04'), ref(EUS, 'S.1313, D29B and D59D')], label: 'Vehicle taxes and road levy', sub: 'Local', glyph: 'car',
  }),
  inst({
    id: 'hr-visitors-consumption-houses', parent: 'lokalne', level: 'lokalne', category: 'tax', family: 'specific-consumption', group: 'localtour', keys: ['D214H:C02', 'D214A:C09', 'D59A:C01', 'D59A:C03', 'D59A:C04'],
    official: 'Visitors’ (tourist) taxes, local consumption taxes, taxes on holiday houses and on unused real estate', native: 'Turistička pristojba; porez na potrošnju; porez na kuće za odmor', common: 'Tourist, consumption and holiday-house taxes',
    base: 'Visitors’ taxes (EUR 122.2 million), taxes on holiday houses (EUR 52.4 million), local consumption taxes (EUR 29.1 million) and small taxes on unused entrepreneurial real estate and construction land.',
    payer: 'Visitors, owners of holiday houses and consumers.',
    rate: { kind: 'varies', headline: 'Set by each municipality', details: ['Eurostat books EUR 100 million of the taxes on specific services under local government.'] },
    explanation: 'Five lines.',
    exceptions: [], refs: [ref(NTL, 'sheet HR, D214H C02, D214A C09, D59A'), ref(EUS, 'S.1313, D214H, D214A and D59A')], label: 'Tourist and holiday houses', sub: 'Local', glyph: 'bed',
  }),
];

const part = (g: string) => n.round(instruments.filter((i) => i.rev?.group === g).reduce((a, i) => a + i.rev!.amount, 0));
const sectorSum = (code: string) => ['S1311', 'S1312', 'S1313', 'S1314', 'S212'].reduce((a, s) => a + (sec[`${s}:${code}`] ?? 0), 0);
const vintage = ['D2', 'D5', 'D61'].map((c) => `${c}: NTL ${n.fmt(n.total(c))}, Eurostat July 2026 ${n.fmt(sectorSum(c))}`).join('; ');

const spec: CountrySpec = {
  today: D,
  id: 'croatia',
  iso3: 'HRV',
  isoNumeric: '191',
  names: { en: 'Croatia', native: 'Hrvatska', nativeLang: 'hr' },
  currency: { code: 'EUR', symbol: '€', name: 'Euro' },
  summary:
    'Croatia is a unitary state with a large local income tax: municipalities, cities and counties choose the rates of the personal income tax within bands set by law, and Eurostat’s accounts book all of it under local government. The State collects the VAT, the corporate profit tax, the excises and the social contributions. VAT and the personal income tax are the two largest flows.',
  structureNote:
    'The figures are the Commission’s National Tax List for 2024, in EUR million (Croatia adopted the euro in 2023). The sale of emission permits (EUR 197 million) is left out. The social contributions are drawn under the State. The personal income tax is drawn under local government because Eurostat’s accounts record it there. Croatia is not an OECD member, so this folio has no harmonised OECD layer.',
  theme: {
    accent: '#4f7cff',
    accent2: '#e9232d',
    motif: 'topo',
    motifNote: 'Topographic contour lines over the outline of Croatia (the generic motif; no bespoke art yet).',
    mapLabel: { lon: 16.2, lat: 45.2 },
  },
  rootLabel: { label: 'Croatia', sub: 'Hrvatska · Fiscal folio' },
  levels: [
    {
      id: 'drzava', branch: 'national', official: 'The State (Republic of Croatia)', native: 'Država', common: 'State',
      description: 'The Sabor legislates the taxes; the Tax Administration and the Customs Administration collect them and the Croatian Pension Insurance Institute and the Health Insurance Fund receive the contributions.',
      fiscalPower: 'Taxes are set by law; local self-government units set the rates of the personal income tax within a band and several local taxes and charges.',
      refs: [ref(NTL)], label: 'State', sub: 'Država',
    },
    {
      id: 'lokalne', branch: 'local', official: 'Local and regional self-government (municipalities, cities and counties)', native: 'Lokalna i područna (regionalna) samouprava', common: 'Local government',
      description: 'The municipalities, towns and counties. They choose the personal income tax rates within the national bands, levy the communal charges, the tourist tax and others, and receive the real estate transfer tax.',
      fiscalPower: 'Each unit chooses two progressive personal income tax rates between 15% and 33%, within bounds that depend on its size (PwC).',
      refs: [ref(PWC_PIT, 'Personal income tax rates'), ref(EUS)], label: 'Local government', sub: 'Samouprava',
    },
  ],
  supporting: [],
  denominators: [
    {
      id: 'drzava-taxes-2024', label: 'State taxes (National Tax List), 2024',
      definition: 'The taxes on production and imports, on income and on capital that the National Tax List books to the State and the EU, other than the local taxes and the sale of emission permits.',
      levelIds: ['drzava'], amount: part('state'), period: y, sourceId: NTL,
      locator: 'Sheet HR, 2024, the lines listed with each tax',
      calculation: `Sum of the ${instruments.filter((i) => i.rev?.group === 'state').length} tax rows below (EUR million)`,
      caveat: `Calendar 2024; the list's cut-off was 30 October 2025. Vintage check against Eurostat's July 2026 accounts: ${vintage}.`,
    },
    {
      id: 'drzava-social-employers-2024', label: 'Social contributions paid by employers, 2024',
      definition: 'The actual compulsory contributions of employers.',
      levelIds: ['drzava'], amount: part('socialer'), period: y, sourceId: NTL,
      locator: 'Sheet HR, 2024, line D611C C01',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'drzava-social-employees-2024', label: 'Social contributions paid by households, 2024',
      definition: 'The compulsory contributions of employees, the self-employed and others.',
      levelIds: ['drzava'], amount: part('socialhh'), period: y, sourceId: NTL,
      locator: 'Sheet HR, 2024, subtotal D613 (lines D613CE C01 and D613CS C01 plus EUR 148 million not itemised)',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'lokalne-pit-2024', label: 'Personal income tax, 2024',
      definition: 'The personal income tax and local surtax, which Eurostat’s accounts record under local government.',
      levelIds: ['lokalne'], amount: part('localpit'), period: y, sourceId: NTL,
      locator: 'Sheet HR, 2024, line D51A C01',
      caveat: `Eurostat's July 2026 release books EUR ${n.fmt(n.round(sec['S1313:D51A']))} million of personal income tax under local government and none under central government.`,
    },
    {
      id: 'lokalne-transfer-2024', label: 'Property transfer and inheritance taxes, 2024',
      definition: 'The real estate transfer tax and the inheritance and gift tax.',
      levelIds: ['lokalne'], amount: part('local'), period: y, sourceId: NTL,
      locator: 'Sheet HR, 2024, lines D214C C01 and D91A C01',
      caveat: 'Calendar 2024, same list and cut-off as the State taxes.',
    },
    {
      id: 'lokalne-communal-2024', label: 'Communal charges, 2024',
      definition: 'The utility charges, the communal contribution, the public land use taxes and the monumental annuity.',
      levelIds: ['lokalne'], amount: part('localcomm'), period: y, sourceId: NTL,
      locator: 'Sheet HR, 2024, lines D29A C01, C02, C05, C07, D59F C04',
      caveat: `Eurostat books EUR ${n.fmt(n.round(sec['S1313:D29A']))} million of taxes on land and buildings (D29A) and EUR ${n.fmt(n.round(sec['S1313:D59F']))} million of other current taxes (D59F) under local government.`,
    },
    {
      id: 'lokalne-vehicles-2024', label: 'Local vehicle taxes and road levy, 2024',
      definition: 'The motor vehicle taxes, boat taxes and the annual levy on public road use.',
      levelIds: ['lokalne'], amount: part('localveh'), period: y, sourceId: NTL,
      locator: 'Sheet HR, 2024, lines D29B C01–C05, D59D C01, C02, C04',
      caveat: `Eurostat books EUR ${n.fmt(n.round(sec['S1313:D29B'] + sec['S1313:D59D']))} million of vehicle-related taxes under local government.`,
    },
    {
      id: 'lokalne-tourist-2024', label: 'Tourist, consumption and holiday-house taxes, 2024',
      definition: 'The visitors’ taxes, the local consumption taxes and the taxes on holiday houses and unused real estate.',
      levelIds: ['lokalne'], amount: part('localtour'), period: y, sourceId: NTL,
      locator: 'Sheet HR, 2024, lines D214H C02, D214A C09, D59A C01, C03, C04',
      caveat: 'Calendar 2024, same list and cut-off as the State taxes.',
    },
  ],
  sizing: {
    label: 'Taxes and compulsory social contributions of all levels of government',
    definition: 'The taxes of the State and of local and regional self-government plus the actual social contributions, calendar 2024, as listed in the National Tax List. Excludes the sale of emission permits.',
    componentIds: ['drzava-taxes-2024', 'drzava-social-employers-2024', 'drzava-social-employees-2024', 'lokalne-pit-2024', 'lokalne-transfer-2024', 'lokalne-communal-2024', 'lokalne-vehicles-2024', 'lokalne-tourist-2024'],
  },
  groups: {
    state: { title: 'State taxes 2024 – National Tax List (EUR million)', denominatorId: 'drzava-taxes-2024', period: y, basis: 'ESA tax revenue, general government and EU institutions', sourceId: NTL },
    socialer: { title: 'Employers’ social contributions 2024 – National Tax List (EUR million)', denominatorId: 'drzava-social-employers-2024', period: y, basis: 'Actual compulsory contributions', sourceId: NTL },
    socialhh: { title: 'Employees’ social contributions 2024 – National Tax List (EUR million)', denominatorId: 'drzava-social-employees-2024', period: y, basis: 'Actual compulsory contributions', sourceId: NTL },
    localpit: { title: 'Personal income tax 2024 – National Tax List (EUR million)', denominatorId: 'lokalne-pit-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
    local: { title: 'Property transfer and inheritance taxes 2024 – National Tax List (EUR million)', denominatorId: 'lokalne-transfer-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
    localcomm: { title: 'Communal charges 2024 – National Tax List (EUR million)', denominatorId: 'lokalne-communal-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
    localveh: { title: 'Local vehicle taxes 2024 – National Tax List (EUR million)', denominatorId: 'lokalne-vehicles-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
    localtour: { title: 'Tourist and holiday-house taxes 2024 – National Tax List (EUR million)', denominatorId: 'lokalne-tourist-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
  },
  sources: [
    { id: NTL, org: 'European Commission, DG Taxation and Customs Union, with Eurostat', title: 'Data on Taxation Trends: National Tax Lists (NTL), edition 2026', url: 'https://taxation-customs.ec.europa.eu/taxation/economic-analysis/data-taxation-trends_en', kind: 'statistics', language: 'en', publishedDate: '2026-03-31', periodCovered: 'Calendar year 2024 (series from 1995)', accessed: D, nextExpected: '2027-03', note: 'Workbook "NTL edition 2026 web.xlsx", sheet HR: every tax and social contribution by its national name and ESA code, in EUR million. Data cut-off 30 October 2025.' },
    { id: EUS, org: 'Eurostat', title: 'Main national accounts tax aggregates (gov_10a_taxag)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table', kind: 'statistics', language: 'en', publishedDate: '2026-07-21', periodCovered: 'Calendar year 2024', accessed: D, nextExpected: '2027-07', note: 'Taxes and social contributions by sub-sector and ESA item; used to place each tax at a level (all the personal income tax, EUR 3,389 million, is S.1313) and to check the totals of the National Tax List.' },
    { id: PWC_CIT, org: 'PwC', title: 'Worldwide Tax Summaries: Croatia – Corporate – Taxes on corporate income', url: 'https://taxsummaries.pwc.com/croatia/corporate/taxes-on-corporate-income', kind: 'guidance', language: 'en', publishedDate: '2026-08-27', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary, not an official source: corporate income tax 18%, 10% for revenue below EUR 1 million.' },
    { id: PWC_PIT, org: 'PwC', title: 'Worldwide Tax Summaries: Croatia – Individual – Taxes on personal income', url: 'https://taxsummaries.pwc.com/croatia/individual/taxes-on-personal-income', kind: 'guidance', language: 'en', publishedDate: '2026-08-27', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary: progressive personal income tax rates chosen by each local self-government unit between 15% and 33%; flat rates for other income.' },
    { id: PWC_OTH, org: 'PwC', title: 'Worldwide Tax Summaries: Croatia – Corporate – Other taxes', url: 'https://taxsummaries.pwc.com/croatia/corporate/other-taxes', kind: 'guidance', language: 'en', publishedDate: '2026-08-27', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary: VAT 25% general, 13% reduced; employers’ health insurance contribution 16.5% of gross salary.' },
  ],
  instruments,
};

buildCountry(spec);
n.reconcile(part('state') + part('socialer') + part('socialhh') + part('localpit') + part('local') + part('localcomm') + part('localveh') + part('localtour'), ['D29F:C08']);
