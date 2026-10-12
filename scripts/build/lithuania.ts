/**
 * Lithuania: the folio's data. Run: npx tsx scripts/build/lithuania.ts
 * Figures: Commission / Eurostat National Tax List (NTL), edition 2026, sheet LT, calendar 2024, EUR million
 * (scripts/build/data/ntl-LT.json). The list gives the social contributions only as subtotals.
 * Rates: Grant Thornton Baltic, "Key tax changes in Lithuania 2024" (the State Tax Inspectorate site refuses automated access).
 */
import { buildCountry, type CountrySpec, type InstSpec, type Ref } from '../lib/build-country';
import { loadNtl, loadSectors } from '../lib/ntl';

const D = '2026-10-12';
const y = { label: '2024', kind: 'calendar-year' as const, start: '2024-01-01', end: '2024-12-31' };
const ref = (id: string, loc?: string): Ref => (loc ? [id, loc] : [id]);
const n = loadNtl('LT', 'EUR');
const sec = loadSectors('LT');
const NTL = 'ntl-2026';
const EUS = 'eurostat-taxag';
const GT = 'gt-lt-2024';
const RATES_NOTE = 'Rate from the Grant Thornton Baltic summary for 2024; not checked against the State Tax Inspectorate, whose site refused automated access.';

const inst = (i: Omit<InstSpec, 'rev'> & { keys: string[]; group: string }): InstSpec => {
  const { keys, group, ...rest } = i;
  return { ...rest, rev: n.rev(group, keys) };
};

const instruments: InstSpec[] = [
  inst({
    id: 'lt-pit-employment', parent: 'valstybe', level: 'valstybe', family: 'income-personal', group: 'state', keys: ['D51A:C01'],
    official: 'Personal income tax on employment and similar income ("tax on payroll and workforce")', native: 'Gyventojų pajamų mokestis (darbo jėgos ir atlyginimo mokesčiai)', common: 'Personal income tax on employment',
    base: 'Wages and similar employment income; withheld by the employer.',
    payer: 'Employees; the employer withholds.',
    rate: { kind: 'progressive', headline: '20% · 32% (also 5% · 15% on certain income)', details: ['2024 rates: 5%, 15%, 20% and 32%; basic exemption up to EUR 747 a month (EUR 8,964 a year) if pay does not exceed the minimum wage of EUR 924.', RATES_NOTE], asOf: '2024-12-31' },
    explanation: 'The largest direct tax and the biggest line after VAT. Eurostat’s accounts book all of the personal income tax under central government.',
    exceptions: [], refs: [ref(GT, 'Key Lithuanian tax rates; PIT law changes from 1 January 2024')], label: 'Income tax: wages', sub: '20% · 32%', glyph: 'person',
  }),
  inst({
    id: 'lt-pit-self-employed', parent: 'valstybe', level: 'valstybe', family: 'income-personal', group: 'state', keys: ['D51A:C02'],
    official: 'Personal income tax on income from individual activities', native: 'Individualios veiklos pajamų mokestis', common: 'Income tax on individual activities',
    base: 'Income of self-employed people from individual activity.',
    payer: 'The self-employed.',
    rate: { kind: 'progressive', headline: 'Personal income tax rates', details: ['The National Tax List gives it its own line; revenue fell from EUR 193.8 million in 2023 to EUR 163.7 million in 2024.'] },
    explanation: 'The tax on the self-employed, separate from the tax withheld on wages.',
    exceptions: [], refs: [ref(NTL, 'sheet LT, D51A C02')], label: 'Income tax: self-employed', sub: 'Individual activity', glyph: 'person',
  }),
  inst({
    id: 'lt-pit-capital', parent: 'valstybe', level: 'valstybe', family: 'income-personal', group: 'state', keys: ['D51A:C03'],
    official: 'Personal income tax on capital income', native: 'Kapitalo pajamų mokestis', common: 'Income tax on capital income',
    base: 'Dividends, interest, rents, and gains from the sale of assets of individuals.',
    payer: 'Individuals.',
    rate: { kind: 'progressive', headline: '15% · 20% · 32% (2024)', details: ['The National Tax List shows EUR 651.2 million in 2024 against EUR 600.4 million in 2023. The exact rates by type of income are in the Law on Personal Income Tax and are not itemised here.'] },
    explanation: 'The part of the personal income tax that falls on returns to capital.',
    exceptions: [], refs: [ref(NTL, 'sheet LT, D51A C03')], label: 'Income tax: capital', sub: 'Dividends · interest', glyph: 'coin',
  }),
  inst({
    id: 'lt-profit-tax', parent: 'valstybe', level: 'valstybe', family: 'income-corporate', group: 'state', keys: ['D51B:C01'],
    official: 'Corporate profit tax', native: 'Pelno mokestis', common: 'Profit tax',
    base: 'Profit of companies and other legal persons.',
    payer: 'Companies.',
    rate: { kind: 'flat', headline: '15% standard; 20% for credit institutions', details: ['2024 rates: 15% standard, 20% for credit institutions, reduced rates of 5% and 0%.', RATES_NOTE], asOf: '2024-12-31' },
    explanation: 'The corporate income tax. Revenue was EUR 1.78 billion in 2024, slightly more than in 2023.',
    exceptions: [], refs: [ref(GT, 'Key Lithuanian tax rates')], label: 'Profit tax', sub: '15%', glyph: 'factory',
  }),
  inst({
    id: 'lt-bank-solidarity-tax', parent: 'valstybe', level: 'valstybe', family: 'income-corporate', group: 'state', keys: ['D51B:C02'],
    official: 'Temporary bank solidarity tax', native: 'Laikinasis bankų solidarumo mokestis', common: 'Temporary bank solidarity tax',
    base: 'As named in the National Tax List: a temporary tax on banks; the list gives no more detail.',
    payer: 'Banks.',
    rate: { kind: 'varies', headline: 'Temporary; set by law', details: ['EUR 219.9 million in 2024 and EUR 249.8 million in 2023 in the list.'] },
    explanation: 'A temporary levy on the banking sector that the list books with the corporate income tax.',
    exceptions: [], refs: [ref(NTL, 'sheet LT, D51B C02')], label: 'Bank solidarity tax', sub: 'Temporary', glyph: 'bank',
  }),
  inst({
    id: 'lt-social-employees', parent: 'valstybe', level: 'valstybe', category: 'social-contribution', family: 'social-security', group: 'socialhh', keys: ['T:D613'],
    official: 'Social insurance contributions paid by households (employees and the self-employed)', native: 'Valstybinio socialinio draudimo ir privalomojo sveikatos draudimo įmokos (gyventojų)', common: 'Contributions paid by households',
    base: 'Gross pay and the income of the self-employed. The National Tax List gives this line only as the subtotal "households’ actual social contributions".',
    payer: 'Employees (withheld by the employer) and the self-employed.',
    rate: { kind: 'flat', headline: '19.5% of gross pay (employee)', details: ['The 2024 rate on the employee’s pay is 19.5%, withheld; the employer pays 1.77% on top.', RATES_NOTE], asOf: '2024-12-31' },
    explanation: 'Since the 2019 reform nearly all of the contributions are paid by employees, so this line is the big one; the list shows only EUR 629 million for employers. Collected by the State Tax Inspectorate and paid to Sodra, the social insurance fund.',
    exceptions: [], refs: [ref(GT, 'Key Lithuanian tax rates'), ref(NTL, 'sheet LT, D613')], label: 'Social: employees', sub: '19.5%', glyph: 'heart',
  }),
  inst({
    id: 'lt-social-employers', parent: 'valstybe', level: 'valstybe', category: 'social-contribution', family: 'social-security', group: 'socialer', keys: ['T:D611'],
    official: 'Social insurance contributions paid by employers', native: 'Darbdavių socialinio draudimo įmokos', common: 'Employers’ contributions',
    base: 'Gross pay. The National Tax List gives this line only as the subtotal "employers’ actual social contributions".',
    payer: 'Employers.',
    rate: { kind: 'flat', headline: '1.77% of gross pay on top', details: ['2024 rate of the employer’s contribution, per the Grant Thornton summary.', RATES_NOTE], asOf: '2024-12-31' },
    explanation: 'A small line since the 2019 reform moved most contributions to the employee.',
    exceptions: [], refs: [ref(GT, 'Key Lithuanian tax rates'), ref(NTL, 'sheet LT, D611')], label: 'Social: employers', sub: '1.77%', glyph: 'heart',
  }),
  inst({
    id: 'lt-vat', parent: 'valstybe', level: 'valstybe', family: 'general-consumption', group: 'state', keys: ['D211:C01'],
    official: 'Value added tax', native: 'Pridėtinės vertės mokestis', common: 'VAT', abbr: 'PVM',
    base: 'Goods and services supplied in Lithuania, intra-EU acquisitions and imports.',
    payer: 'Consumers; businesses charge it and claim input credits.',
    rate: { kind: 'range', headline: '21% standard; 9% and 5% reduced', details: ['2024: standard rate 21%; the 9% rate was abolished for restaurant and catering services at the end of 2023. Registration threshold EUR 45,000.', RATES_NOTE], asOf: '2024-12-31' },
    explanation: 'The largest single tax, at about 8% of GDP.',
    exceptions: [], refs: [ref(GT, 'VAT changes')], label: 'VAT', sub: '21%', glyph: 'cart',
  }),
  inst({
    id: 'lt-customs', parent: 'valstybe', level: 'valstybe', category: 'customs-duty', family: 'trade', group: 'state', keys: ['D2121:C01'],
    official: 'Taxes on international trade and transactions (customs duties)', native: 'Tarptautinės prekybos ir sandorių mokestis', common: 'Customs duties',
    base: 'Goods imported from outside the EU, by the Common Customs Tariff.',
    payer: 'Importers.',
    rate: { kind: 'varies', headline: 'EU Common Customs Tariff', details: ['An EU own resource; Eurostat records it under the EU institutions.'] },
    explanation: 'Collected by customs for the EU budget.',
    exceptions: [], refs: [ref(EUS, 'S.212, D212')], label: 'Customs duties', sub: 'EU tariff', glyph: 'ship',
  }),
  inst({
    id: 'lt-excise-fuel', parent: 'valstybe', level: 'valstybe', family: 'specific-consumption', group: 'state', keys: ['D214A:C05', 'D2122C:C03', 'D214A:C06'],
    official: 'Excise duty on oil products and on electricity', native: 'Akcizai už naftos produktus ir elektros energiją', common: 'Fuel and energy excise',
    base: 'Petrol, diesel and other oil products, and electricity, by quantity.',
    payer: 'Producers, importers and suppliers; passed on in the price.',
    rate: { kind: 'specific', headline: 'Per unit of quantity, fixed by the Law on Excise Duties', details: ['EUR 1,056.5 million on oil products, EUR 1.2 million on oil-product imports and EUR 2.5 million on electricity in 2024.'] },
    explanation: 'The biggest excise.',
    exceptions: [], refs: [ref(NTL, 'sheet LT, D214A C05 and C06, D2122C C03')], label: 'Fuel excise', sub: 'Oil products', glyph: 'flame',
  }),
  inst({
    id: 'lt-excise-tobacco', parent: 'valstybe', level: 'valstybe', family: 'specific-consumption', group: 'state', keys: ['D214A:C04', 'D2122C:C02'],
    official: 'Excise duty on manufactured tobacco', native: 'Akcizai už apdorotą tabaką', common: 'Tobacco excise',
    base: 'Cigarettes and other manufactured tobacco.',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'mechanism', headline: 'Fixed by the Law on Excise Duties', details: ['EUR 409.4 million on domestic and intra-EU tobacco and EUR 10.4 million on imports in 2024.'] },
    explanation: 'The second largest excise.',
    exceptions: [], refs: [ref(NTL, 'sheet LT, D214A C04, D2122C C02')], label: 'Tobacco excise', sub: 'Cigarettes', glyph: 'smoke',
  }),
  inst({
    id: 'lt-excise-alcohol', parent: 'valstybe', level: 'valstybe', family: 'specific-consumption', group: 'state', keys: ['D214A:C01', 'D214A:C02', 'D214A:C03', 'D2122C:C01'],
    official: 'Excise duty on alcoholic beverages (wine, beer and other alcohol)', native: 'Akcizai už alkoholinius gėrimus', common: 'Alcohol excise',
    base: 'Wine, beer and other alcoholic beverages (mainly spirits), by volume or pure alcohol.',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'specific', headline: 'Per litre, fixed by the Law on Excise Duties', details: ['EUR 316.7 million on other alcoholic beverages, EUR 119.3 million on beer, EUR 68.0 million on wine and EUR 6.3 million on alcohol imports in 2024.'] },
    explanation: 'Other alcoholic beverages (spirits) bring in most of it.',
    exceptions: [], refs: [ref(NTL, 'sheet LT, D214A C01 to C03, D2122C C01')], label: 'Alcohol excise', sub: 'Spirits · beer · wine', glyph: 'wine',
  }),
  inst({
    id: 'lt-gambling', parent: 'valstybe', level: 'valstybe', family: 'specific-consumption', group: 'state', keys: ['D214F:C01'],
    official: 'Tax on lotteries and gambling', native: 'Loterijų ir azartinių lošimų mokestis', common: 'Gambling tax',
    base: 'Gambling and lottery operators’ takings.',
    payer: 'Operators.',
    rate: { kind: 'varies', headline: 'Set by the Law on Gaming', details: ['EUR 73.9 million in 2024 and EUR 67.0 million in 2023 in the list.'] },
    explanation: 'The gambling tax.',
    exceptions: [], refs: [ref(NTL, 'sheet LT, D214F')], label: 'Gambling tax', sub: 'Operators', glyph: 'dice',
  }),
  inst({
    id: 'lt-vehicle-taxes', parent: 'valstybe', level: 'valstybe', family: 'specific-consumption', group: 'state', keys: ['D214D:C01', 'D214D:C02', 'D29B:C01'],
    official: 'Car and motor vehicle registration taxes and conveyance (vehicle) taxes', native: 'Automobilių ir motorinių transporto priemonių registracijos mokesčiai; transporto priemonių mokesčiai', common: 'Vehicle taxes',
    base: 'The registration of cars and motor vehicles; conveyances.',
    payer: 'Vehicle owners.',
    rate: { kind: 'varies', headline: 'Set by law', details: ['EUR 37.1 million motor vehicle registration tax, EUR 19.1 million car registration taxes and EUR 23.0 million conveyance taxes in 2024.'] },
    explanation: 'Three lines of the list that tax the owning and registering of vehicles.',
    exceptions: [], refs: [ref(NTL, 'sheet LT, D214D C01 and C02, D29B C01')], label: 'Vehicle taxes', sub: 'Registration', glyph: 'car',
  }),
  inst({
    id: 'lt-environmental', parent: 'valstybe', level: 'valstybe', category: 'fee', family: 'resource', group: 'state', keys: ['D29F:C01', 'D29F:C02'],
    official: 'Pollution taxes and Modernisation Fund taxes', native: 'Mokestis už aplinkos teršimą; Modernizavimo fondo mokesčiai', common: 'Environmental taxes',
    base: 'Emissions and pollution; the Modernisation Fund line is named in the list without further detail.',
    payer: 'Polluters.',
    rate: { kind: 'varies', headline: 'Set by the Law on Pollution Tax', details: ['EUR 52.2 million pollution tax and EUR 55.4 million Modernisation Fund taxes in 2024. The sale of emission permits (EUR 113.7 million) is not counted.'] },
    explanation: 'Eurostat records EUR 17 million of the pollution taxes with local government; the list does not say which line.',
    exceptions: [], refs: [ref(NTL, 'sheet LT, D29F C01 and C02')], label: 'Environmental taxes', sub: 'Pollution', glyph: 'leaf',
  }),
  inst({
    id: 'lt-forestry-deductions', parent: 'valstybe', level: 'valstybe', category: 'special-levy', family: 'resource', group: 'state', keys: ['D214I:C02'],
    official: 'Deductions from revenue under the Forestry Law', native: 'Atskaitymai nuo pajamų pagal Miškų įstatymą', common: 'Forestry Law deductions',
    base: 'As named in the National Tax List: deductions from revenue under the Republic of Lithuania Forestry Law; no further detail.',
    payer: 'Not given in the list.',
    rate: { kind: 'varies', headline: 'Set by the Forestry Law', details: ['EUR 44.0 million in 2024 and EUR 49.7 million in 2023.'] },
    explanation: 'Booked by the statisticians as a tax on products.',
    exceptions: [], refs: [ref(NTL, 'sheet LT, D214I C02')], label: 'Forestry deductions', sub: 'Forestry Law', glyph: 'leaf',
  }),
  inst({
    id: 'lt-financial-levies', parent: 'valstybe', level: 'valstybe', category: 'special-levy', family: 'other', group: 'state', keys: ['D29E:C02', 'D29E:C03', 'D29E:C04'],
    official: 'Deposit and investment insurance tax, Resolution Fund contributions and health care institutions’ contributions', native: 'Indėlių ir investicijų draudimo mokestis; įmokos į Pertvarkymo fondą; sveikatos priežiūros įstaigų įmokos', common: 'Insurance fund levies',
    base: 'As named in the National Tax List; no further detail.',
    payer: 'Financial institutions and health care institutions.',
    rate: { kind: 'varies', headline: 'Set by law', details: ['EUR 48.5 million deposit and investment insurance tax, EUR 7.8 million health care institutions’ contributions in 2024; the Resolution Fund line is zero in 2024 (EUR 6.1 million in 2023).'] },
    explanation: 'Compulsory contributions that the statisticians book as taxes on production.',
    exceptions: [], refs: [ref(NTL, 'sheet LT, D29E C02 to C04')], label: 'Insurance fund levies', sub: 'Deposits', glyph: 'bank',
  }),
  inst({
    id: 'lt-other-state', parent: 'valstybe', level: 'valstybe', category: 'fee', family: 'other', group: 'state', keys: ['D29H:C01', 'D214B:C01', 'D214C:C01', 'D214H:C01', 'D59D:C01'],
    official: 'Other taxes on production, State fees and registration taxes, other taxes on products and households’ licence payments', native: 'Kiti gamybos mokesčiai; valstybės rinkliavos; registracijos mokesčiai; kiti mokesčiai gaminiams; licencijų mokėjimai', common: 'Other taxes and State fees',
    base: 'The list’s residual lines: other taxes on production n.e.c. (EUR 57.5 million), registration taxes (EUR 29.5 million), State-imposed fees and charges (EUR 9.8 million), other taxes on products (EUR 1.7 million) and households’ licence payments (EUR 3.3 million).',
    payer: 'Various.',
    rate: { kind: 'varies', headline: 'Various', details: ['Eurostat’s accounts record EUR 34 million of the "other taxes on production" with local government; the list does not say which.'] },
    explanation: 'Five lines that the list does not break down further.',
    exceptions: [], refs: [ref(NTL, 'sheet LT, D29H C01, D214B, D214C, D214H, D59D')], label: 'Other taxes and fees', sub: 'Residual', glyph: 'stamp',
  }),
  /* ---- municipalities ---- */
  inst({
    id: 'lt-real-estate-tax', parent: 'savivaldybes', level: 'savivaldybes', family: 'property', group: 'local', keys: ['D29A:C02'],
    official: 'Immovable property tax', native: 'Nekilnojamojo turto mokestis', common: 'Property tax',
    base: 'The value of immovable property (buildings, premises) of companies and some individuals.',
    payer: 'Owners.',
    rate: { kind: 'range', headline: 'Set by each municipality within limits', details: ['The Law on Immovable Property Tax lets each municipality set the rate within a legal range; the planned 2024 reform to widen the tax was put on hold (Grant Thornton).'] },
    explanation: 'The main tax of Lithuania’s municipalities and the largest of their taxes.',
    exceptions: [], refs: [ref(GT, 'Tax reform postponed'), ref(NTL, 'sheet LT, D29A C02')], label: 'Property tax', sub: 'Municipal', glyph: 'house',
  }),
  inst({
    id: 'lt-land-tax', parent: 'savivaldybes', level: 'savivaldybes', family: 'property', group: 'local', keys: ['D29A:C01', 'D59A:C01'],
    official: 'Land tax (companies and households)', native: 'Žemės mokestis', common: 'Land tax',
    base: 'The value of land; the list separates the tax paid by corporations (EUR 26.4 million) from households (EUR 50.5 million).',
    payer: 'Landowners.',
    rate: { kind: 'range', headline: 'Set by each municipality within limits', details: ['The list does not give rates. Eurostat records EUR 34 million of the households’ land tax with local government and EUR 16 million with central government.'] },
    explanation: 'The second municipal property tax.',
    exceptions: [], refs: [ref(NTL, 'sheet LT, D29A C01, D59A C01'), ref(EUS, 'S.1311 and S.1313, D59A')], label: 'Land tax', sub: 'Municipal', glyph: 'town',
  }),
  inst({
    id: 'lt-inheritance-tax', parent: 'savivaldybes', level: 'savivaldybes', family: 'property', group: 'local', keys: ['D91A:C01'],
    official: 'Inheritance tax', native: 'Paveldimo turto mokestis', common: 'Inheritance tax',
    base: 'Inherited property.',
    payer: 'Heirs.',
    rate: { kind: 'varies', headline: 'Set by the Law on Inheritance Tax', details: ['EUR 4.3 million in 2024; Eurostat records the capital taxes with local government.'] },
    explanation: 'The only wealth transfer tax; tiny.',
    exceptions: [], refs: [ref(NTL, 'sheet LT, D91A'), ref(EUS, 'S.1313, D91')], label: 'Inheritance tax', sub: 'Municipal', glyph: 'gem',
  }),
];

const part = (g: string) => n.round(instruments.filter((i) => i.rev?.group === g).reduce((a, i) => a + i.rev!.amount, 0));
const sectorSum = (code: string) => ['S1311', 'S1312', 'S1313', 'S1314', 'S212'].reduce((a, s) => a + (sec[`${s}:${code}`] ?? 0), 0);
const vintage = ['D2', 'D5', 'D61'].map((c) => `${c}: NTL ${n.fmt(n.total(c))}, Eurostat July 2026 ${n.fmt(sectorSum(c))}`).join('; ');

const spec: CountrySpec = {
  today: D,
  id: 'lithuania',
  iso3: 'LTU',
  isoNumeric: '440',
  names: { en: 'Lithuania', native: 'Lietuva', nativeLang: 'lt' },
  currency: { code: 'EUR', symbol: '€', name: 'Euro' },
  summary:
    'Lithuania is a unitary state: the Seimas sets every tax and the State Tax Inspectorate collects almost all of them. The two biggest flows are the social insurance contributions, now paid almost entirely by employees, and VAT; the personal income tax comes next. Municipalities levy only property taxes (real estate, land and inheritance); they are financed mainly by transfers, including a share of the income tax.',
  structureNote:
    'The figures are the Commission’s National Tax List for 2024. The list gives the social contributions only as subtotals, so they are drawn as two lines. The sale of emission permits (EUR 113.7 million) and the employers’ imputed social contributions (EUR 291.0 million) are left out. The social contributions are drawn under the State: they are collected by the State Tax Inspectorate for the social insurance fund Sodra. Eurostat’s accounts record all the personal income tax under central government.',
  theme: {
    accent: '#ffb703',
    accent2: '#0b6e4f',
    motif: 'topo',
    motifNote: 'Topographic contour lines over the outline of Lithuania (the generic motif; no bespoke art yet).',
    mapLabel: { lon: 23.9, lat: 55.3 },
  },
  rootLabel: { label: 'Lithuania', sub: 'Lietuva · Fiscal folio' },
  levels: [
    {
      id: 'valstybe', branch: 'national', official: 'The State (central government)', native: 'Valstybė', common: 'State',
      description: 'The Seimas legislates all taxes; the State Tax Inspectorate (VMI) collects them and the social insurance contributions, which fund the State Social Insurance Fund Board (Sodra) and the compulsory health insurance fund.',
      fiscalPower: 'Rates and bases of all taxes are fixed by law in the Seimas; municipalities cannot create taxes.',
      refs: [ref(GT)], label: 'State', sub: 'Valstybė',
    },
    {
      id: 'savivaldybes', branch: 'local', official: 'Municipalities', native: 'Savivaldybės', common: 'Municipalities',
      description: 'The only tier below the State. They levy the real estate tax and the land tax within limits set by law and receive the inheritance tax; they also receive a share of the income tax and state grants, which Eurostat’s accounts do not count as their taxes.',
      fiscalPower: 'Municipal councils set the real estate and land tax rates within the range fixed by the national laws.',
      refs: [ref(EUS)], label: 'Municipalities', sub: 'Savivaldybės',
    },
  ],
  supporting: [],
  denominators: [
    {
      id: 'valstybe-taxes-2024', label: 'State taxes (National Tax List), 2024',
      definition: 'The taxes on production and imports and on income that the National Tax List books to the State and the EU, other than the municipal property taxes and the sale of emission permits.',
      levelIds: ['valstybe'], amount: part('state'), period: y, sourceId: NTL,
      locator: 'Sheet LT, 2024, the lines listed with each tax',
      calculation: `Sum of the ${instruments.filter((i) => i.rev?.group === 'state').length} tax rows below (EUR million)`,
      caveat: `Calendar 2024; the list's cut-off was 30 October 2025. Vintage check against Eurostat's July 2026 accounts: ${vintage}.`,
    },
    {
      id: 'valstybe-social-households-2024', label: 'Social contributions paid by households, 2024',
      definition: 'The actual compulsory social contributions of households (employees and the self-employed).',
      levelIds: ['valstybe'], amount: part('socialhh'), period: y, sourceId: NTL,
      locator: 'Sheet LT, 2024, subtotal D613',
      caveat: 'Calendar 2024, same list and cut-off as the taxes. The list gives only the subtotal for Lithuania.',
    },
    {
      id: 'valstybe-social-employers-2024', label: 'Social contributions paid by employers, 2024',
      definition: 'The actual compulsory social contributions of employers; imputed contributions are left out.',
      levelIds: ['valstybe'], amount: part('socialer'), period: y, sourceId: NTL,
      locator: 'Sheet LT, 2024, subtotal D611',
      caveat: 'Calendar 2024, same list and cut-off as the taxes. The list gives only the subtotal for Lithuania.',
    },
    {
      id: 'savivaldybes-taxes-2024', label: 'Property and inheritance taxes of the municipalities, 2024',
      definition: 'The real estate tax, the land taxes of companies and households and the inheritance tax.',
      levelIds: ['savivaldybes'], amount: part('local'), period: y, sourceId: NTL,
      locator: 'Sheet LT, 2024, lines D29A C01 and C02, D59A C01, D91A C01',
      calculation: 'Sum of the local rows below (EUR million)',
      caveat: `Eurostat books EUR ${n.fmt(sec['S1313:D2'])} million of taxes on production, EUR ${n.fmt(sec['S1313:D59A'])} million of households' land tax and EUR ${n.fmt(sec['S1313:D91'])} million of capital taxes to local government. The list itemises EUR ${n.fmt(part('local'))} million here; EUR 17 million of pollution taxes and EUR 34 million of other production taxes that Eurostat attributes to local government are not itemised by line and stay under the State. The household land tax is drawn fully here although Eurostat books EUR ${n.fmt(sec['S1311:D59A'])} million of it centrally.`,
    },
  ],
  sizing: {
    label: 'Taxes and compulsory social contributions of all levels of government',
    definition: 'The taxes of the State and the municipalities plus the actual social contributions, calendar 2024, as listed in the National Tax List. Excludes the sale of emission permits and imputed social contributions.',
    componentIds: ['valstybe-taxes-2024', 'valstybe-social-households-2024', 'valstybe-social-employers-2024', 'savivaldybes-taxes-2024'],
  },
  fromProfile: 'lithuania',
  structureOverride: {
    basis: 'OECD attribution to sub-sectors of general government (Interpretative Guide, section A.12)',
    folioLevels: { central: ['valstybe'], local: ['savivaldybes'] },
    levelNotes: { central: 'The OECD shows the social security funds separately; the folio draws their contributions under the State.' },
  },
  groups: {
    state: { title: 'State taxes 2024 – National Tax List (EUR million)', denominatorId: 'valstybe-taxes-2024', period: y, basis: 'ESA tax revenue, general government and EU institutions', sourceId: NTL },
    socialhh: { title: 'Social contributions of households 2024 – National Tax List (EUR million)', denominatorId: 'valstybe-social-households-2024', period: y, basis: 'Actual compulsory contributions (subtotal)', sourceId: NTL },
    socialer: { title: 'Social contributions of employers 2024 – National Tax List (EUR million)', denominatorId: 'valstybe-social-employers-2024', period: y, basis: 'Actual compulsory contributions (subtotal)', sourceId: NTL },
    local: { title: 'Municipal taxes 2024 – National Tax List (EUR million)', denominatorId: 'savivaldybes-taxes-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
  },
  sources: [
    { id: NTL, org: 'European Commission, DG Taxation and Customs Union, with Eurostat', title: 'Data on Taxation Trends: National Tax Lists (NTL), edition 2026', url: 'https://taxation-customs.ec.europa.eu/taxation/economic-analysis/data-taxation-trends_en', kind: 'statistics', language: 'en', publishedDate: '2026-03-31', periodCovered: 'Calendar year 2024 (series from 1995)', accessed: D, nextExpected: '2027-03', note: 'Workbook "NTL edition 2026 web.xlsx", sheet LT: every tax and social contribution by its national name and ESA code, in EUR million, for general government plus EU institutions. Data cut-off 30 October 2025.' },
    { id: EUS, org: 'Eurostat', title: 'Main national accounts tax aggregates (gov_10a_taxag)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table', kind: 'statistics', language: 'en', publishedDate: '2026-07-21', periodCovered: 'Calendar year 2024', accessed: D, nextExpected: '2027-07', note: 'Taxes and social contributions by sub-sector and ESA item; used to place each tax at a level and to check the totals of the National Tax List.' },
    { id: GT, org: 'Grant Thornton Baltic', title: 'Key tax changes in Lithuania 2024', url: 'https://www.grantthornton.lt/globalassets/1.-member-firms/lithuania/pdf/insights/key-tax-changes_lithuania_2024.pdf', kind: 'guidance', language: 'en', publishedDate: null, periodCovered: '2024', accessed: D, note: 'A professional firm’s summary, not an official source: 2024 rates (corporate 15%/20%, personal income 5/15/20/32%, social contributions 19.5% employee and 1.77% employer, VAT 21%/9%/5%). The State Tax Inspectorate, the Ministry of Finance and Sodra sites refuse automated access.' },
  ],
  instruments,
};

buildCountry(spec);
n.reconcile(part('state') + part('socialhh') + part('socialer') + part('local'), ['T:D612', 'D29F:C03']);
