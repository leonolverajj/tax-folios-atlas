/**
 * Bulgaria: the folio's data. Run: npx tsx scripts/build/bulgaria.ts
 * Figures: Commission / Eurostat National Tax List (NTL), edition 2026, sheet BG, calendar 2024, BGN million
 * (scripts/build/data/ntl-BG.json). Level placement checked against Eurostat gov_10a_taxag, whose July 2026
 * release gives Bulgaria in euro (BGN 1.95583 per euro; the NTL leva divided by that rate give the same figures).
 * Rates: PwC Worldwide Tax Summaries (review of 2 August 2026), a professional-firm summary.
 * Bulgaria is not an OECD member, so there is no harmonised OECD layer (structure.json) for it.
 */
import { buildCountry, type CountrySpec, type InstSpec, type Ref } from '../lib/build-country';
import { loadNtl, loadSectors } from '../lib/ntl';

const D = '2026-10-12';
const y = { label: '2024', kind: 'calendar-year' as const, start: '2024-01-01', end: '2024-12-31' };
const ref = (id: string, loc?: string): Ref => (loc ? [id, loc] : [id]);
const n = loadNtl('BG', 'BGN');
const sec = loadSectors('BG');
const RATE = 1.95583;
const eurToBgn = (eur: number) => n.round(eur * RATE);
const NTL = 'ntl-2026';
const EUS = 'eurostat-taxag';
const PWC_CIT = 'pwc-bg-corporate';
const PWC_PIT = 'pwc-bg-individual';
const PWC_OTH = 'pwc-bg-other';
const PWC_NOTE = 'As summarised by PwC (review of 2 August 2026), not checked against the National Revenue Agency.';

const inst = (i: Omit<InstSpec, 'rev'> & { keys: string[]; group: string }): InstSpec => {
  const { keys, group, ...rest } = i;
  return { ...rest, rev: n.rev(group, keys) };
};

const instruments: InstSpec[] = [
  inst({
    id: 'bg-pit-wages', parent: 'darzhava', level: 'darzhava', family: 'income-personal', group: 'state', keys: ['D51A:C01'],
    official: 'Personal income tax on wages and salaries', native: 'Данък върху доходите на физическите лица (трудови доходи)', common: 'Personal income tax on wages',
    base: 'Wages and salaries of employees.',
    payer: 'Employees; the employer withholds.',
    rate: { kind: 'flat', headline: '10%', details: ['A flat tax rate of 10% applies to all personal income, with some exceptions (PwC).', PWC_NOTE], asOf: '2026-08-02' },
    explanation: 'BGN 5.9 billion in 2024.',
    exceptions: [], refs: [ref(PWC_PIT, 'Personal income tax rates')], label: 'Income tax: wages', sub: '10% flat', glyph: 'person',
  }),
  inst({
    id: 'bg-pit-other', parent: 'darzhava', level: 'darzhava', family: 'income-personal', group: 'state', keys: ['D51A:C02', 'D51C1:C01', 'D51C1:C02', 'D51A:C04'],
    official: 'Personal income tax on sole traders, free professions and civil contracts; final taxes on dividends and on other income', native: 'ДДФЛ от самостоятелна дейност; окончателен данък върху дивиденти', common: 'Income tax on other income and dividends',
    base: 'Sole traders, freelancers and civil-contract income (BGN 437 million); dividends and liquidation dividends of residents and non-residents (BGN 618 million); other final taxes (BGN 30 million); the final tax on interest on deposits is zero in 2024.',
    payer: 'Individuals; payers withhold the final taxes.',
    rate: { kind: 'flat', headline: '10%', details: [PWC_NOTE], asOf: '2026-08-02' },
    explanation: 'Four lines.',
    exceptions: [], refs: [ref(PWC_PIT, 'Personal income tax rates'), ref(NTL, 'sheet BG, D51A C02 and C04, D51C1 C01 and C02')], label: 'Income tax: other', sub: 'Dividends · traders', glyph: 'coin',
  }),
  inst({
    id: 'bg-corporate-income-tax', parent: 'darzhava', level: 'darzhava', family: 'income-corporate', group: 'state', keys: ['D51B:C01'],
    official: 'Corporate income tax', native: 'Корпоративен данък', common: 'Corporate income tax',
    base: 'Profit of companies.',
    payer: 'Companies.',
    rate: { kind: 'flat', headline: '10%', details: ['In general, corporate income is subject to CIT at a flat rate of 10% (PwC).', PWC_NOTE], asOf: '2026-08-02' },
    explanation: 'BGN 5.4 billion in 2024.',
    exceptions: [], refs: [ref(PWC_CIT, 'Corporate income tax rates')], label: 'Corporate income tax', sub: '10% flat', glyph: 'factory',
  }),
  inst({
    id: 'bg-other-corporate-taxes', parent: 'darzhava', level: 'darzhava', family: 'income-corporate', group: 'state', keys: ['D51B:C03', 'D51C2:C01', 'D51E:C01'],
    official: 'Top-up tax on multinational groups, taxes on income and dividends of corporations, and the income tax of budgetary enterprises', native: 'Данък върху печалбата на мултинационални групи; дивиденти на юридически лица', common: 'Other corporate taxes',
    base: 'The top-up tax from multinational enterprise groups and large domestic groups (BGN 400 million, a new line in 2024), taxes on income and dividends of corporations (BGN 123.5 million) and the budgetary enterprises’ income tax (BGN 29.5 million).',
    payer: 'Large groups, corporations and budgetary enterprises.',
    rate: { kind: 'varies', headline: 'Set by the Corporate Income Tax Act', details: [] },
    explanation: 'Three lines.',
    exceptions: [], refs: [ref(NTL, 'sheet BG, D51B C03, D51C2, D51E')], label: 'Other corporate taxes', sub: 'Top-up · dividends', glyph: 'factory',
  }),
  inst({
    id: 'bg-social-employers', parent: 'darzhava', level: 'darzhava', category: 'social-contribution', family: 'social-security', group: 'socialer', keys: ['D611:C01'],
    official: 'Employers’ compulsory social contributions (pensions, sickness and maternity, injuries, unemployment and health)', native: 'Осигурителни вноски на работодателите', common: 'Employers’ contributions',
    base: 'Gross pay up to a ceiling. Pension fund BGN 6.1 billion, health insurance BGN 3.0 billion, sickness and maternity BGN 1.2 billion, injuries BGN 0.4 billion, unemployment BGN 0.3 billion.',
    payer: 'Employers.',
    rate: { kind: 'flat', headline: 'Set by the Social Insurance Code', details: ['The rates are not extracted here.'] },
    explanation: 'The largest social line.',
    exceptions: [], refs: [ref(NTL, 'sheet BG, D611, D6111, D6112')], label: 'Social: employers', sub: 'Pensions · health', glyph: 'heart',
  }),
  inst({
    id: 'bg-social-employees', parent: 'darzhava', level: 'darzhava', category: 'social-contribution', family: 'social-security', group: 'socialhh', keys: ['D613CE:C01', 'D613CE:C02', 'D613CE:C03', 'D613CE:C04'],
    official: 'Employees’ compulsory social contributions (pensions, sickness and maternity, unemployment and health)', native: 'Осигурителни вноски на работниците и служителите', common: 'Employees’ contributions',
    base: 'Gross pay up to a ceiling. Pension fund BGN 3.5 billion, health insurance BGN 1.7 billion, sickness and maternity BGN 0.7 billion, unemployment BGN 0.2 billion.',
    payer: 'Employees; the employer withholds.',
    rate: { kind: 'flat', headline: 'Set by the Social Insurance Code', details: ['The rates are not extracted here.'] },
    explanation: 'BGN 6.1 billion.',
    exceptions: [], refs: [ref(NTL, 'sheet BG, D613CE')], label: 'Social: employees', sub: 'Pensions · health', glyph: 'heart',
  }),
  inst({
    id: 'bg-social-self-employed', parent: 'darzhava', level: 'darzhava', category: 'social-contribution', family: 'social-security', group: 'socialoth', keys: ['D613CS:C01', 'D613CS:C02', 'D613CS:C03'],
    official: 'Contributions of the self-employed (pensions, sickness and maternity, health)', native: 'Осигурителни вноски на самоосигуряващите се', common: 'Self-employed contributions',
    base: 'The income of the self-employed. Pension fund BGN 482 million, health insurance BGN 314 million, sickness and maternity BGN 75 million.',
    payer: 'Self-employed people.',
    rate: { kind: 'varies', headline: 'Set by the Social Insurance Code', details: [] },
    explanation: 'BGN 0.9 billion.',
    exceptions: [], refs: [ref(NTL, 'sheet BG, D613CS')], label: 'Social: self-employed', sub: 'Contributions', glyph: 'heart',
  }),
  inst({
    id: 'bg-vat', parent: 'darzhava', level: 'darzhava', family: 'general-consumption', group: 'state', keys: ['D211:C01'],
    official: 'Value added tax', native: 'Данък върху добавената стойност (ДДС)', common: 'VAT', abbr: 'ДДС',
    base: 'Goods and services supplied in Bulgaria and imports.',
    payer: 'Consumers; businesses charge it and claim input credits.',
    rate: { kind: 'range', headline: '20% standard; 9% reduced', details: ['The standard VAT rate is 20% and the reduced rate is 9% (baby foods, hygiene products, books and periodicals, among others) (PwC).', PWC_NOTE], asOf: '2026-08-02' },
    explanation: 'The largest tax: BGN 19.1 billion.',
    exceptions: [], refs: [ref(PWC_OTH, 'Value-added tax')], label: 'VAT', sub: '20%', glyph: 'cart',
  }),
  inst({
    id: 'bg-customs', parent: 'darzhava', level: 'darzhava', category: 'customs-duty', family: 'trade', group: 'state', keys: ['D2121:C01', 'D2122A:C01', 'D2122A:C02', 'D2122C:C01', 'D2122C:C02', 'D2122C:C03', 'D2122C:C04', 'D2122C:C07'],
    official: 'Import duties, veterinary and sanitary levies and excise duties collected on imports', native: 'Мита и други вземания при внос', common: 'Customs duties and import levies',
    base: 'Goods imported from outside the EU: import duties (BGN 329.7 million), veterinary and sanitary levies (BGN 22.9 million) and small excise lines on imported tobacco, fuel, alcohol and beer.',
    payer: 'Importers.',
    rate: { kind: 'varies', headline: 'EU Common Customs Tariff', details: ['The import duties are an EU own resource; Eurostat records them under the EU institutions.'] },
    explanation: 'Eight lines.',
    exceptions: [], refs: [ref(EUS, 'S.212, D212')], label: 'Customs duties', sub: 'EU tariff', glyph: 'ship',
  }),
  inst({
    id: 'bg-excise-tobacco', parent: 'darzhava', level: 'darzhava', family: 'specific-consumption', group: 'state', keys: ['D214A:C01'],
    official: 'Excise duties on tobacco products', native: 'Акцизи върху тютюневите изделия', common: 'Tobacco excise',
    base: 'Cigarettes and other tobacco products.',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'mechanism', headline: 'Fixed by the Excise Duties and Tax Warehouses Act', details: [] },
    explanation: 'BGN 3.7 billion: more than the excise on fuel.',
    exceptions: [], refs: [ref(NTL, 'sheet BG, D214A C01')], label: 'Tobacco excise', sub: 'Cigarettes', glyph: 'smoke',
  }),
  inst({
    id: 'bg-excise-fuel', parent: 'darzhava', level: 'darzhava', family: 'specific-consumption', group: 'state', keys: ['D214A:C02', 'D214A:C06', 'D214A:C07'],
    official: 'Excise duties on fuel, electric power, and coal and coke', native: 'Акцизи върху горивата, електроенергията и въглищата', common: 'Fuel and energy excise',
    base: 'Fuels (BGN 2,647 million), electric power (BGN 35 million) and coal and coke (BGN 5.5 million).',
    payer: 'Fuel suppliers; passed on at the pump.',
    rate: { kind: 'specific', headline: 'Per 1,000 litres', details: [] },
    explanation: 'Three lines.',
    exceptions: [], refs: [ref(NTL, 'sheet BG, D214A C02, C06, C07')], label: 'Fuel and energy excise', sub: 'Fuel', glyph: 'flame',
  }),
  inst({
    id: 'bg-excise-alcohol-other', parent: 'darzhava', level: 'darzhava', family: 'specific-consumption', group: 'state', keys: ['D214A:C03', 'D214A:C04', 'D214A:C08'],
    official: 'Excise duties on alcohol, beer and other products', native: 'Акцизи върху алкохола, бирата и други стоки', common: 'Alcohol and other excises',
    base: 'Alcohol (BGN 269 million), beer (BGN 73 million) and other products (BGN 82 million).',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'specific', headline: 'Per litre of pure alcohol or of beer', details: [] },
    explanation: 'Three lines.',
    exceptions: [], refs: [ref(NTL, 'sheet BG, D214A C03, C04, C08')], label: 'Alcohol excise', sub: 'Spirits · beer', glyph: 'wine',
  }),
  inst({
    id: 'bg-gambling-insurance', parent: 'darzhava', level: 'darzhava', family: 'specific-consumption', group: 'state', keys: ['D214F:C01', 'D214G:C01', 'D214D:C01'],
    official: 'Taxes on lotteries, gambling and betting, on insurance premiums, and on the registration of motor vehicles', native: 'Данък върху хазарта; данък върху застрахователните премии; такси за регистрация', common: 'Gambling, insurance and registration taxes',
    base: 'Gambling and betting (BGN 115 million), insurance premiums (BGN 71 million) and state taxes on the registration of motor vehicles (BGN 12 million).',
    payer: 'Operators, insurers and vehicle owners.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Three small lines.',
    exceptions: [], refs: [ref(NTL, 'sheet BG, D214F, D214G, D214D')], label: 'Gambling and insurance taxes', sub: 'Small', glyph: 'dice',
  }),
  inst({
    id: 'bg-electric-power-fund', parent: 'darzhava', level: 'darzhava', category: 'special-levy', family: 'specific-consumption', group: 'state', keys: ['D214H:C02'],
    official: 'Contributions to the Electric Power System Security Fund', native: 'Вноски във Фонд „Сигурност на електроенергийната система“', common: 'Electric Power System fund',
    base: 'As named in the National Tax List: contributions in the Electric Power System fund; no further detail.',
    payer: 'Not given in the list.',
    rate: { kind: 'varies', headline: 'Set by regulation', details: [] },
    explanation: 'BGN 560 million, booked as a tax on specific services.',
    exceptions: [], refs: [ref(NTL, 'sheet BG, D214H C02')], label: 'Electric power fund', sub: 'Levy', glyph: 'bolt',
  }),
  inst({
    id: 'bg-environmental-fees', parent: 'darzhava', level: 'darzhava', category: 'fee', family: 'resource', group: 'state', keys: ['D29F:C01', 'D29F:C02', 'D29F:C03', 'D29F:C06'],
    official: 'Water Act, Waste Management Act and Protected Areas Act fees, and greenhouse gas emissions licence fees', native: 'Такси по Закона за водите и Закона за управление на отпадъците', common: 'Environmental fees',
    base: 'Water (BGN 43.0 million), waste management (BGN 7.8 million), protected areas and emissions licence fees.',
    payer: 'Water users, waste producers and permit holders.',
    rate: { kind: 'varies', headline: 'Set by the environmental laws', details: ['The revenue of emission trading permits (BGN 2,293 million) is not counted.'] },
    explanation: 'Four lines.',
    exceptions: [], refs: [ref(NTL, 'sheet BG, D29F C01–C03 and C06')], label: 'Environmental fees', sub: 'Water · waste', glyph: 'leaf',
  }),
  inst({
    id: 'bg-bank-contributions', parent: 'darzhava', level: 'darzhava', category: 'special-levy', family: 'other', group: 'state', keys: ['D29H:C06'],
    official: 'Banks’ contributions to the Deposit Guarantee Fund and the National Resolution Fund', native: 'Вноски на банките във Фонда за гарантиране на влоговете', common: 'Bank fund contributions',
    base: 'Banks.',
    payer: 'Banks.',
    rate: { kind: 'varies', headline: 'Set by the funds', details: [] },
    explanation: 'BGN 217 million in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet BG, D29H C06')], label: 'Bank fund contributions', sub: 'Guarantee fund', glyph: 'bank',
  }),
  inst({
    id: 'bg-small-taxes', parent: 'darzhava', level: 'darzhava', category: 'fee', family: 'other', group: 'state', keys: ['D29C:C01', 'D29H:C01', 'D29H:C02', 'D29H:C04', 'D29E:C03', 'D59D:C01', 'D59F:C03'],
    official: 'Taxes on social expenditure and on luxury expenditure of companies, tonnage tax, fishing and hunting licences and others', native: 'Данък върху социалните разходи; данък върху представителните разходи', common: 'Other small taxes',
    base: 'The tax on social expenditures made by employers for their employees (BGN 29.6 million), the tax on corporate luxury expenditures (BGN 37.7 million), the tax on the net tonnage of ships, fishing and hunting licences and small lines.',
    payer: 'Companies and licence holders.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Seven lines, together under 0.3% of the total.',
    exceptions: [], refs: [ref(NTL, 'sheet BG, D29C, D29H, D29E C03, D59D, D59F C03')], label: 'Other small taxes', sub: 'Small', glyph: 'stamp',
  }),
  /* ---- municipalities ---- */
  inst({
    id: 'bg-real-estate-tax', parent: 'obshtini', level: 'obshtini', family: 'property', group: 'localprop', keys: ['D29A:C01'],
    official: 'Real estate tax', native: 'Данък върху недвижимите имоти', common: 'Real estate tax',
    base: 'The tax value of buildings and land.',
    payer: 'Owners of real estate.',
    rate: { kind: 'range', headline: 'Set by each municipality within a legal range', details: ['The list does not give rates. Eurostat books the amount under local government.'] },
    explanation: 'BGN 425 million.',
    exceptions: [], refs: [ref(NTL, 'sheet BG, D29A C01'), ref(EUS, 'S.1313, D29A')], label: 'Real estate tax', sub: 'Municipal', glyph: 'house',
  }),
  inst({
    id: 'bg-vehicle-tax', parent: 'obshtini', level: 'obshtini', family: 'specific-consumption', group: 'localveh', keys: ['D29B:C01', 'D59F:C01'],
    official: 'Motor vehicles tax (paid by producers and by households)', native: 'Данък върху превозните средства', common: 'Vehicle tax',
    base: 'Registered motor vehicles: those held by businesses (BGN 208 million) and by households (BGN 235 million).',
    payer: 'Vehicle owners.',
    rate: { kind: 'varies', headline: 'By engine power, age and emissions', details: ['Eurostat books these amounts under local government.'] },
    explanation: 'The annual vehicle tax is a municipal tax.',
    exceptions: [], refs: [ref(NTL, 'sheet BG, D29B C01, D59F C01'), ref(EUS, 'S.1313, D29B and D59F')], label: 'Vehicle tax', sub: 'Municipal', glyph: 'car',
  }),
  inst({
    id: 'bg-donations-inheritance', parent: 'obshtini', level: 'obshtini', family: 'property', group: 'local', keys: ['D91A:C02', 'D91A:C01'],
    official: 'Taxes on donations, sponsorships and acquisitions for consideration, and the inheritance tax', native: 'Данък върху даренията и наследствата; данък при възмездно придобиване', common: 'Donation, acquisition and inheritance taxes',
    base: 'Taxes on donations, taxes on sponsorships and taxes on acquisition of property for consideration (BGN 644 million) and the inheritance tax (BGN 0.9 million), as named in the National Tax List.',
    payer: 'Recipients and buyers.',
    rate: { kind: 'varies', headline: 'Set by the Local Taxes and Fees Act', details: ['Eurostat books these amounts as capital taxes under local government.'] },
    explanation: 'The tax on transfers of property is a municipal revenue.',
    exceptions: [], refs: [ref(NTL, 'sheet BG, D91A'), ref(EUS, 'S.1313, D91')], label: 'Donation and transfer taxes', sub: 'Municipal', glyph: 'stamp',
  }),
  inst({
    id: 'bg-local-small-taxes', parent: 'obshtini', level: 'obshtini', category: 'tax', family: 'other', group: 'localsmall', keys: ['D51A:C03', 'D214H:C01', 'D59F:C02'],
    official: 'Final annual (patent) tax, visitor tax and the dog ownership tax', native: 'Патентен данък; туристически данък; данък за притежание на куче', common: 'Patent, visitor and dog taxes',
    base: 'The patent tax on small businesses (BGN 18.0 million), the visitor tax (BGN 25.8 million) and the dog ownership tax (BGN 0.8 million).',
    payer: 'Small businesses, visitors and dog owners.',
    rate: { kind: 'varies', headline: 'Set by each municipality', details: [] },
    explanation: 'Three small municipal taxes.',
    exceptions: [], refs: [ref(NTL, 'sheet BG, D51A C03, D214H C01, D59F C02')], label: 'Patent and visitor taxes', sub: 'Municipal', glyph: 'town',
  }),
];

const part = (g: string) => n.round(instruments.filter((i) => i.rev?.group === g).reduce((a, i) => a + i.rev!.amount, 0));
const eurSum = (code: string) => ['S1311', 'S1312', 'S1313', 'S1314', 'S212'].reduce((a, s) => a + (sec[`${s}:${code}`] ?? 0), 0);
const vintage = ['D2', 'D5', 'D61'].map((c) => `${c}: NTL ${n.fmt(n.total(c))}, Eurostat July 2026 ${n.fmt(eurToBgn(eurSum(c)))} (converted from euro)`).join('; ');

const spec: CountrySpec = {
  today: D,
  id: 'bulgaria',
  iso3: 'BGR',
  isoNumeric: '100',
  names: { en: 'Bulgaria', native: 'България', nativeLang: 'bg' },
  currency: { code: 'BGN', symbol: 'лв', name: 'Bulgarian lev' },
  summary:
    'Bulgaria is a unitary state with a flat 10% personal income tax, a flat 10% corporate income tax and a 20% VAT. The State collects almost everything, and the social contributions, paid by employers and employees, are the second-largest flow after VAT. Municipalities levy the real estate tax, the vehicle tax and a tax on donations and property acquisitions.',
  structureNote:
    'The figures are the Commission’s National Tax List for 2024, in leva. The sale of emission trading permits (BGN 2,293 million) is left out. The social contributions are drawn under the State. The list’s Eurostat counterpart for Bulgaria in July 2026 is in euro; converted at BGN 1.95583 per euro its totals match the list. Bulgaria is not an OECD member, so this folio has no harmonised OECD layer.',
  theme: {
    accent: '#00966e',
    accent2: '#d62612',
    motif: 'topo',
    motifNote: 'Topographic contour lines over the outline of Bulgaria (the generic motif; no bespoke art yet).',
    mapLabel: { lon: 25.2, lat: 42.7 },
  },
  rootLabel: { label: 'Bulgaria', sub: 'България · Fiscal folio' },
  levels: [
    {
      id: 'darzhava', branch: 'national', official: 'The State (Republic of Bulgaria)', native: 'Държава', common: 'State',
      description: 'The National Assembly legislates all taxes; the National Revenue Agency (NRA) and the Customs Agency collect them, and the NRA collects the social contributions for the National Social Security Institute and the National Health Insurance Fund.',
      fiscalPower: 'Taxes are set by law; municipalities set rates only within the ranges of the Local Taxes and Fees Act.',
      refs: [ref(NTL)], label: 'State', sub: 'Държава',
    },
    {
      id: 'obshtini', branch: 'local', official: 'Municipalities', native: 'Общини', common: 'Municipalities',
      description: 'The only tier of local self-government. They levy the real estate tax, the vehicle tax, the tax on donations and on acquisitions of property for consideration, and small taxes.',
      fiscalPower: 'Municipal councils set the tax rates within the ranges fixed by the Local Taxes and Fees Act.',
      refs: [ref(EUS)], label: 'Municipalities', sub: 'Общини',
    },
  ],
  supporting: [],
  denominators: [
    {
      id: 'darzhava-taxes-2024', label: 'State taxes (National Tax List), 2024',
      definition: 'The taxes on production and imports, on income and on capital that the National Tax List books to the State and the EU, other than the municipal taxes and the sale of emission trading permits.',
      levelIds: ['darzhava'], amount: part('state'), period: y, sourceId: NTL,
      locator: 'Sheet BG, 2024, the lines listed with each tax',
      calculation: `Sum of the ${instruments.filter((i) => i.rev?.group === 'state').length} tax rows below (BGN million)`,
      caveat: `Calendar 2024; the list's cut-off was 30 October 2025. Vintage check against Eurostat's July 2026 accounts: ${vintage}.`,
    },
    {
      id: 'darzhava-social-employers-2024', label: 'Social contributions paid by employers, 2024',
      definition: 'The actual compulsory contributions of employers.',
      levelIds: ['darzhava'], amount: part('socialer'), period: y, sourceId: NTL,
      locator: 'Sheet BG, 2024, line D611 C01',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'darzhava-social-employees-2024', label: 'Social contributions paid by employees, 2024',
      definition: 'The employees’ compulsory contributions.',
      levelIds: ['darzhava'], amount: part('socialhh'), period: y, sourceId: NTL,
      locator: 'Sheet BG, 2024, lines D613CE C01 to C04',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'darzhava-social-self-employed-2024', label: 'Social contributions of the self-employed, 2024',
      definition: 'The self-employed people’s contributions.',
      levelIds: ['darzhava'], amount: part('socialoth'), period: y, sourceId: NTL,
      locator: 'Sheet BG, 2024, lines D613CS C01 to C03',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'obshtini-real-estate-2024', label: 'Real estate tax of the municipalities, 2024',
      definition: 'The real estate tax.',
      levelIds: ['obshtini'], amount: part('localprop'), period: y, sourceId: NTL,
      locator: 'Sheet BG, 2024, line D29A C01',
      caveat: `Eurostat's July 2026 release books EUR 217 million of land and building taxes (D29A), BGN ${n.fmt(eurToBgn(sec['S1313:D29A']))} million, under local government.`,
    },
    {
      id: 'obshtini-vehicles-2024', label: 'Vehicle tax of the municipalities, 2024',
      definition: 'The motor vehicle tax paid by businesses and by households.',
      levelIds: ['obshtini'], amount: part('localveh'), period: y, sourceId: NTL,
      locator: 'Sheet BG, 2024, lines D29B C01 and D59F C01',
      caveat: 'Calendar 2024, same list and cut-off as the State taxes.',
    },
    {
      id: 'obshtini-transfers-2024', label: 'Donation and transfer taxes of the municipalities, 2024',
      definition: 'The taxes on donations and acquisitions of property and the inheritance tax.',
      levelIds: ['obshtini'], amount: part('local'), period: y, sourceId: NTL,
      locator: 'Sheet BG, 2024, lines D91A C01 and C02',
      caveat: 'Calendar 2024, same list and cut-off as the State taxes.',
    },
    {
      id: 'obshtini-small-2024', label: 'Patent, visitor and dog taxes of the municipalities, 2024',
      definition: 'The patent tax, the visitor tax and the dog ownership tax.',
      levelIds: ['obshtini'], amount: part('localsmall'), period: y, sourceId: NTL,
      locator: 'Sheet BG, 2024, lines D51A C03, D214H C01, D59F C02',
      caveat: 'Calendar 2024, same list and cut-off as the State taxes.',
    },
  ],
  sizing: {
    label: 'Taxes and compulsory social contributions of all levels of government',
    definition: 'The taxes of the State and the municipalities plus the actual social contributions, calendar 2024, as listed in the National Tax List. Excludes the sale of emission trading permits.',
    componentIds: ['darzhava-taxes-2024', 'darzhava-social-employers-2024', 'darzhava-social-employees-2024', 'darzhava-social-self-employed-2024', 'obshtini-real-estate-2024', 'obshtini-vehicles-2024', 'obshtini-transfers-2024', 'obshtini-small-2024'],
  },
  groups: {
    state: { title: 'State taxes 2024 – National Tax List (BGN million)', denominatorId: 'darzhava-taxes-2024', period: y, basis: 'ESA tax revenue, general government and EU institutions', sourceId: NTL },
    socialer: { title: 'Employers’ social contributions 2024 – National Tax List (BGN million)', denominatorId: 'darzhava-social-employers-2024', period: y, basis: 'Actual compulsory contributions', sourceId: NTL },
    socialhh: { title: 'Employees’ social contributions 2024 – National Tax List (BGN million)', denominatorId: 'darzhava-social-employees-2024', period: y, basis: 'Actual compulsory contributions', sourceId: NTL },
    socialoth: { title: 'Self-employed contributions 2024 – National Tax List (BGN million)', denominatorId: 'darzhava-social-self-employed-2024', period: y, basis: 'Actual compulsory contributions', sourceId: NTL },
    localprop: { title: 'Real estate tax 2024 – National Tax List (BGN million)', denominatorId: 'obshtini-real-estate-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
    localveh: { title: 'Vehicle tax 2024 – National Tax List (BGN million)', denominatorId: 'obshtini-vehicles-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
    local: { title: 'Donation and transfer taxes 2024 – National Tax List (BGN million)', denominatorId: 'obshtini-transfers-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
    localsmall: { title: 'Patent, visitor and dog taxes 2024 – National Tax List (BGN million)', denominatorId: 'obshtini-small-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
  },
  sources: [
    { id: NTL, org: 'European Commission, DG Taxation and Customs Union, with Eurostat', title: 'Data on Taxation Trends: National Tax Lists (NTL), edition 2026', url: 'https://taxation-customs.ec.europa.eu/taxation/economic-analysis/data-taxation-trends_en', kind: 'statistics', language: 'en', publishedDate: '2026-03-31', periodCovered: 'Calendar year 2024 (series from 1995)', accessed: D, nextExpected: '2027-03', note: 'Workbook "NTL edition 2026 web.xlsx", sheet BG: every tax and social contribution by its national name and ESA code, in BGN million. Data cut-off 30 October 2025.' },
    { id: EUS, org: 'Eurostat', title: 'Main national accounts tax aggregates (gov_10a_taxag)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table', kind: 'statistics', language: 'en', publishedDate: '2026-07-21', periodCovered: 'Calendar year 2024', accessed: D, nextExpected: '2027-07', note: 'Taxes and social contributions by sub-sector and ESA item. For Bulgaria the July 2026 release is in euro; dividing the National Tax List’s leva by 1.95583 gives the same totals. Used to place each tax at a level.' },
    { id: PWC_CIT, org: 'PwC', title: 'Worldwide Tax Summaries: Bulgaria – Corporate – Taxes on corporate income', url: 'https://taxsummaries.pwc.com/bulgaria/corporate/taxes-on-corporate-income', kind: 'guidance', language: 'en', publishedDate: '2026-08-02', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary, not an official source: corporate income tax a flat 10%.' },
    { id: PWC_PIT, org: 'PwC', title: 'Worldwide Tax Summaries: Bulgaria – Individual – Taxes on personal income', url: 'https://taxsummaries.pwc.com/bulgaria/individual/taxes-on-personal-income', kind: 'guidance', language: 'en', publishedDate: '2026-08-02', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary: a flat tax rate of 10% on all personal income, with some exceptions.' },
    { id: PWC_OTH, org: 'PwC', title: 'Worldwide Tax Summaries: Bulgaria – Corporate – Other taxes', url: 'https://taxsummaries.pwc.com/bulgaria/corporate/other-taxes', kind: 'guidance', language: 'en', publishedDate: '2026-08-02', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary: VAT standard rate 20%, reduced rate 9%.' },
  ],
  instruments,
};

buildCountry(spec);
n.reconcile(part('state') + part('socialer') + part('socialhh') + part('socialoth') + part('localprop') + part('localveh') + part('local') + part('localsmall'), ['D29F:C07']);
