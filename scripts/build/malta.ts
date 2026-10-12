/**
 * Malta: the folio's data. Run: npx tsx scripts/build/malta.ts
 * Figures: Commission / Eurostat National Tax List (NTL), edition 2026, sheet MT, calendar 2024, EUR million
 * (scripts/build/data/ntl-MT.json). Eurostat's sub-sector accounts (gov_10a_taxag) book every tax under central
 * government: Malta has no local taxes.
 * Rates: PwC Worldwide Tax Summaries (review of 30 September 2026), a professional-firm summary.
 * Malta is not an OECD member, so there is no harmonised OECD layer (structure.json) for it.
 */
import { buildCountry, type CountrySpec, type InstSpec, type Ref } from '../lib/build-country';
import { loadNtl, loadSectors } from '../lib/ntl';

const D = '2026-10-12';
const y = { label: '2024', kind: 'calendar-year' as const, start: '2024-01-01', end: '2024-12-31' };
const ref = (id: string, loc?: string): Ref => (loc ? [id, loc] : [id]);
const n = loadNtl('MT', 'EUR');
const sec = loadSectors('MT');
const NTL = 'ntl-2026';
const EUS = 'eurostat-taxag';
const PWC_CIT = 'pwc-mt-corporate';
const PWC_PIT = 'pwc-mt-individual';
const PWC_OTH = 'pwc-mt-other';
const PWC_NOTE = 'As summarised by PwC (review of 30 September 2026), not checked against the Commissioner for Revenue.';

const inst = (i: Omit<InstSpec, 'rev'> & { keys: string[]; group: string }): InstSpec => {
  const { keys, group, ...rest } = i;
  return { ...rest, rev: n.rev(group, keys) };
};

const instruments: InstSpec[] = [
  inst({
    id: 'mt-income-tax-individuals', parent: 'gvern', level: 'gvern', family: 'income-personal', group: 'state', keys: ['D51A:C01'],
    official: 'Income tax paid by individuals', native: 'Taxxa fuq id-dħul tal-individwi', common: 'Personal income tax',
    base: 'Income of individuals taxable in Malta: employment, business and other income.',
    payer: 'Individuals; employers withhold tax from wages.',
    rate: { kind: 'progressive', headline: '0% to 35%', details: ['Income is taxable at graduated progressive rates ranging from 0% to 35% (PwC).', PWC_NOTE], asOf: '2026-09-30' },
    explanation: 'EUR 1.6 billion in 2024: the largest direct tax.',
    exceptions: [], refs: [ref(PWC_PIT, 'Personal income tax rates')], label: 'Personal income tax', sub: '0–35%', glyph: 'person',
  }),
  inst({
    id: 'mt-income-tax-companies', parent: 'gvern', level: 'gvern', family: 'income-corporate', group: 'state', keys: ['D51B:C01'],
    official: 'Income tax paid by companies', native: 'Taxxa fuq id-dħul tal-kumpaniji', common: 'Corporate income tax',
    base: 'Profit of companies.',
    payer: 'Companies.',
    rate: { kind: 'flat', headline: '35% statutory', details: ['Companies are subject to income tax at a flat rate of 35%; entities may elect a 15% rate on their chargeable income under the FITWI Regulations published on 2 September 2025 (PwC). Refunds to shareholders are a feature of the Maltese system; the National Tax List does not say whether this line is before or after them.', PWC_NOTE], asOf: '2026-09-30' },
    explanation: 'EUR 1.3 billion in 2024.',
    exceptions: [], refs: [ref(PWC_CIT, 'Corporate income tax rates')], label: 'Corporate income tax', sub: '35%', glyph: 'factory',
  }),
  inst({
    id: 'mt-holding-gains-taxes', parent: 'gvern', level: 'gvern', family: 'income-mixed', group: 'state', keys: ['D51C1:C01', 'D51C2:C01'],
    official: 'Taxes on holding gains of individuals and of companies', native: 'Taxxa fuq qligħ kapitali', common: 'Taxes on holding gains',
    base: 'As named in the National Tax List: holding gains by individuals (EUR 123.0 million) and by companies (EUR 125.8 million).',
    payer: 'Individuals and companies.',
    rate: { kind: 'varies', headline: 'Set by the Income Tax Act', details: [] },
    explanation: 'Two lines.',
    exceptions: [], refs: [ref(NTL, 'sheet MT, D51C1 and D51C2')], label: 'Holding gains taxes', sub: 'Individuals · companies', glyph: 'coin',
  }),
  inst({
    id: 'mt-income-tax-penalties', parent: 'gvern', level: 'gvern', category: 'fee', family: 'income-mixed', group: 'state', keys: ['D51E:C02', 'D51E:C03', 'D51E:C04'],
    official: 'Penalties paid by individuals, companies and others', native: 'Penali', common: 'Penalties on income tax',
    base: 'As named in the National Tax List: penalties paid by individuals (EUR 4.5 million), companies (EUR 6.9 million) and others (EUR 0.1 million).',
    payer: 'Taxpayers.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'The list books these penalties among taxes on income.',
    exceptions: [], refs: [ref(NTL, 'sheet MT, D51E C02–C04')], label: 'Income tax penalties', sub: 'Penalties', glyph: 'scale',
  }),
  inst({
    id: 'mt-investor-programme', parent: 'gvern', level: 'gvern', category: 'fee', family: 'other', group: 'state', keys: ['D59F:C01'],
    official: 'Individual (International) Investor Programme', native: 'Programm tal-Investituri Individwali', common: 'Individual Investor Programme',
    base: 'As named in the National Tax List: the fees of the Individual Investor Programme (citizenship by investment).',
    payer: 'Applicants.',
    rate: { kind: 'varies', headline: 'Set by the programme', details: [] },
    explanation: 'EUR 148.5 million in 2024, about 2% of the taxes and contributions.',
    exceptions: [], refs: [ref(NTL, 'sheet MT, D59F C01')], label: 'Investor Programme', sub: 'Citizenship fees', glyph: 'key',
  }),
  inst({
    id: 'mt-social-employers', parent: 'gvern', level: 'gvern', category: 'social-contribution', family: 'social-security', group: 'socialer', keys: ['D611:C01', 'D611:C02', 'D611:C03'],
    official: 'Employers’ social contributions (private sector and government) and penalties on employers', native: 'Kontribuzzjonijiet tas-sigurtà soċjali tas-sid tax-xogħol', common: 'Employers’ contributions',
    base: 'The employee’s basic weekly wage, within a minimum and maximum. Private sector EUR 410.6 million, government as employer EUR 84.3 million, penalties EUR 5.1 million.',
    payer: 'Employers.',
    rate: { kind: 'flat', headline: '10% of the basic weekly wage', details: ['Social security contributions amount to 10% of the employee’s basic weekly wage, payable by both the employee and the employer, subject to a minimum and maximum contribution (PwC).', PWC_NOTE], asOf: '2026-09-30' },
    explanation: 'The Treasury Department’s service pension (EUR 106.7 million), which the list treats as an imputed contribution, is not counted.',
    exceptions: [], refs: [ref(PWC_OTH, 'Social security contributions')], label: 'Social: employers', sub: '10%', glyph: 'heart',
  }),
  inst({
    id: 'mt-social-employees', parent: 'gvern', level: 'gvern', category: 'social-contribution', family: 'social-security', group: 'socialhh', keys: ['D613CE:C01'],
    official: 'Employees’ social contributions', native: 'Kontribuzzjonijiet tas-sigurtà soċjali tal-impjegati', common: 'Employees’ contributions',
    base: 'The employee’s basic weekly wage, within a minimum and maximum.',
    payer: 'Employees; the employer withholds.',
    rate: { kind: 'flat', headline: '10% of the basic weekly wage', details: ['The maximum weekly contribution is EUR 49.04 for employees born before 1 January 1962 and EUR 55.93 for those born later (PwC).', PWC_NOTE], asOf: '2026-09-30' },
    explanation: 'EUR 494.9 million.',
    exceptions: [], refs: [ref(PWC_OTH, 'Social security contributions')], label: 'Social: employees', sub: '10%', glyph: 'heart',
  }),
  inst({
    id: 'mt-social-self-employed', parent: 'gvern', level: 'gvern', category: 'social-contribution', family: 'social-security', group: 'socialoth', keys: ['D613CS:C01', 'D613CS:C02'],
    official: 'Social contributions of the self-employed and penalties', native: 'Kontribuzzjonijiet tas-sigurtà soċjali tal-ħaddiema għal rashom', common: 'Self-employed contributions',
    base: 'Annual net income of the self-employed, within a minimum and maximum.',
    payer: 'Self-employed people.',
    rate: { kind: 'flat', headline: '15% of net annual income', details: ['Contributions amount to 15% of the self-employed person’s annual net income of the previous year, within a minimum and maximum (PwC).', PWC_NOTE], asOf: '2026-09-30' },
    explanation: 'EUR 71.0 million.',
    exceptions: [], refs: [ref(PWC_OTH, 'Social security contributions')], label: 'Social: self-employed', sub: '15%', glyph: 'heart',
  }),
  inst({
    id: 'mt-vat', parent: 'gvern', level: 'gvern', family: 'general-consumption', group: 'state', keys: ['D211:C01'],
    official: 'Value added tax', native: 'Taxxa fuq il-Valur Miżjud (VAT)', common: 'VAT', abbr: 'VAT',
    base: 'Goods and services supplied in Malta and imports.',
    payer: 'Consumers; businesses charge it and claim input credits.',
    rate: { kind: 'range', headline: '18% standard; 7% and 5% reduced', details: ['The standard VAT rate is 18%; 7% applies to eligible accommodation and entrance to sports facilities, 5% to electricity, printed matter and other supplies (PwC).', PWC_NOTE], asOf: '2026-09-30' },
    explanation: 'EUR 1.4 billion: the largest indirect tax.',
    exceptions: [], refs: [ref(PWC_OTH, 'Value-added tax')], label: 'VAT', sub: '18%', glyph: 'cart',
  }),
  inst({
    id: 'mt-customs', parent: 'gvern', level: 'gvern', category: 'customs-duty', family: 'trade', group: 'state', keys: ['D2121:C13'],
    official: 'Import duties paid to EU institutions', native: 'Dazji fuq l-importazzjoni', common: 'Customs duties',
    base: 'Goods imported from outside the EU, by the Common Customs Tariff.',
    payer: 'Importers.',
    rate: { kind: 'varies', headline: 'EU Common Customs Tariff', details: ['An EU own resource; Eurostat records it under the EU institutions.'] },
    explanation: 'Collected for the EU budget.',
    exceptions: [], refs: [ref(EUS, 'S.212, D212')], label: 'Customs duties', sub: 'EU tariff', glyph: 'ship',
  }),
  inst({
    id: 'mt-excise-petroleum', parent: 'gvern', level: 'gvern', family: 'specific-consumption', group: 'state', keys: ['D214A:C04'],
    official: 'Excise levies on petroleum', native: 'Aċċiża fuq il-petrol', common: 'Fuel excise',
    base: 'Petrol, diesel and other petroleum products, by quantity.',
    payer: 'Fuel suppliers; passed on at the pump.',
    rate: { kind: 'specific', headline: 'Per 1,000 litres', details: [] },
    explanation: 'EUR 105.1 million.',
    exceptions: [], refs: [ref(NTL, 'sheet MT, D214A C04')], label: 'Fuel excise', sub: 'Petroleum', glyph: 'flame',
  }),
  inst({
    id: 'mt-excise-tobacco', parent: 'gvern', level: 'gvern', family: 'specific-consumption', group: 'state', keys: ['D214A:C01', 'D214A:C05'],
    official: 'Excise levies on machine-made cigarettes and other tobacco', native: 'Aċċiża fuq is-sigaretti u t-tabakk', common: 'Tobacco excise',
    base: 'Cigarettes (EUR 95.4 million) and other tobacco (EUR 8.3 million).',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'mechanism', headline: 'Fixed by the Excise Duty Act', details: [] },
    explanation: 'EUR 103.7 million.',
    exceptions: [], refs: [ref(NTL, 'sheet MT, D214A C01 and C05')], label: 'Tobacco excise', sub: 'Cigarettes', glyph: 'smoke',
  }),
  inst({
    id: 'mt-excise-other', parent: 'gvern', level: 'gvern', family: 'specific-consumption', group: 'state', keys: ['D214A:C02', 'D214A:C03', 'D214A:C06', 'D214A:C07', 'D214A:C08', 'D214A:C10', 'D214A:C11', 'D214A:C13', 'D214A:C14', 'D214A:C15', 'D214A:C16', 'D214A:C18', 'D214A:C19', 'D214A:C09'],
    official: 'Excise levies and duties on alcohol, cement, electricity, mobile telephony services and a range of products', native: 'Aċċiżi oħra', common: 'Alcohol, cement and other excises',
    base: 'Spirits (EUR 18.0 million), cement (EUR 20.7 million), beer, wines, electricity (EUR 4.3 million), mobile telephony (EUR 4.2 million), non-alcoholic beverages, tyres, plastic bags, bottled water, toiletries, construction components, chewing gum and the eco contribution.',
    payer: 'Producers and importers.',
    rate: { kind: 'specific', headline: 'Per unit', details: [] },
    explanation: 'Fourteen lines of the list.',
    exceptions: [], refs: [ref(NTL, 'sheet MT, D214A C02–C03, C06–C11, C13–C16, C18–C19')], label: 'Other excises', sub: 'Alcohol · cement · others', glyph: 'wine',
  }),
  inst({
    id: 'mt-duty-on-documents-property', parent: 'gvern', level: 'gvern', family: 'property', group: 'state', keys: ['D214C:C01', 'D91A:C03'],
    official: 'Duty on documents: immovable property and property transfers', native: 'Dritt fuq id-dokumenti (proprjetà immobbli)', common: 'Duty on documents: property',
    base: 'Documents transferring immovable property (EUR 141.7 million) and other property transfers (EUR 37.5 million, booked as a capital tax).',
    payer: 'Buyers and recipients.',
    rate: { kind: 'varies', headline: 'A percentage of the value', details: [] },
    explanation: 'Malta’s tax on property transactions.',
    exceptions: [], refs: [ref(NTL, 'sheet MT, D214C C01, D91A C03')], label: 'Duty on property documents', sub: 'Property', glyph: 'stamp',
  }),
  inst({
    id: 'mt-duty-on-documents-other', parent: 'gvern', level: 'gvern', family: 'property', group: 'state', keys: ['D214G:C01', 'D214C:C02', 'D214B:C03'],
    official: 'Duty on documents: insurance policies, shares and legal fees', native: 'Dritt fuq id-dokumenti (polza, ishma, drittijiet legali)', common: 'Duty on documents: insurance and shares',
    base: 'Insurance policies (EUR 39.2 million), shares (EUR 6.5 million) and legal fees.',
    payer: 'Policyholders and parties to the share deals.',
    rate: { kind: 'varies', headline: 'A percentage of the value or premium', details: [] },
    explanation: 'Three lines.',
    exceptions: [], refs: [ref(NTL, 'sheet MT, D214G C01, D214C C02, D214B C03')], label: 'Duty on other documents', sub: 'Insurance · shares', glyph: 'stamp',
  }),
  inst({
    id: 'mt-vehicle-taxes', parent: 'gvern', level: 'gvern', family: 'specific-consumption', group: 'state', keys: ['D214D:C01', 'D59D:C03', 'D29B:C02', 'D214D:C02', 'D214D:C03', 'D29B:C01', 'D214H:C04'],
    official: 'Motor vehicle registration tax, motor vehicle licences (households and business), number plates and test administration charge', native: 'Taxxa tar-reġistrazzjoni u liċenzji tal-vetturi', common: 'Vehicle taxes',
    base: 'Registration (EUR 37.6 million), licences for households (EUR 62.1 million) and business (EUR 20.7 million), number plates and the test administration charge.',
    payer: 'Vehicle owners.',
    rate: { kind: 'varies', headline: 'By vehicle', details: [] },
    explanation: 'Seven lines.',
    exceptions: [], refs: [ref(NTL, 'sheet MT, D214D, D59D C03, D29B, D214H C04')], label: 'Vehicle taxes', sub: 'Registration · licence', glyph: 'car',
  }),
  inst({
    id: 'mt-gaming', parent: 'gvern', level: 'gvern', family: 'specific-consumption', group: 'state', keys: ['D214F:C01', 'D214F:C02'],
    official: 'Gaming taxes and the Malta Gaming Authority service fees', native: 'Taxxi fuq il-logħob', common: 'Gaming taxes',
    base: 'Gaming operators (EUR 74.2 million) and the Authority’s service charges (EUR 11.3 million).',
    payer: 'Gaming operators.',
    rate: { kind: 'varies', headline: 'Set by the gaming regulations', details: [] },
    explanation: 'Two lines.',
    exceptions: [], refs: [ref(NTL, 'sheet MT, D214F C01 and C02')], label: 'Gaming taxes', sub: 'Operators', glyph: 'dice',
  }),
  inst({
    id: 'mt-bunkering-environment', parent: 'gvern', level: 'gvern', category: 'special-levy', family: 'resource', group: 'state', keys: ['D214H:C05', 'D214H:C06'],
    official: 'Bunkering tax and environmental contribution', native: 'Taxxa fuq il-bunkering; kontribuzzjoni ambjentali', common: 'Bunkering tax and environmental contribution',
    base: 'Ships’ fuel supplies in Maltese waters (EUR 2.2 million) and the environmental contribution (EUR 6.1 million).',
    payer: 'Suppliers and users.',
    rate: { kind: 'varies', headline: 'Set by law', details: ['The sale of emission trading permits (EUR 44.6 million) is not counted.'] },
    explanation: 'Two small lines.',
    exceptions: [], refs: [ref(NTL, 'sheet MT, D214H C05 and C06')], label: 'Bunkering and environment', sub: 'Small', glyph: 'water',
  }),
  inst({
    id: 'mt-licences-fees', parent: 'gvern', level: 'gvern', category: 'fee', family: 'other', group: 'state', keys: ['D29E:C01', 'D29E:C02', 'D29E:C03', 'D29E:C05', 'D29E:C12', 'D29E:C15', 'D29E:C16', 'D29E:C17', 'D29E:C18', 'D29E:C19', 'D59D:C01', 'D59D:C02', 'D59D:C05'],
    official: 'Licences, concessions, rights of use and authority service charges', native: 'Liċenzji, konċessjonijiet u drittijiet', common: 'Licences, concessions and authority fees',
    base: 'Fees for the right of use by business (EUR 9.2 million), concession fees (EUR 10.6 million), authority services of the Malta Communications and Malta Resources authorities (EUR 6.5 million), driving licences, hotel and catering licences, wines and spirits licences and others.',
    payer: 'Businesses and individuals.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Thirteen small lines.',
    exceptions: [], refs: [ref(NTL, 'sheet MT, D29E and D59D')], label: 'Licences and concessions', sub: 'Fees', glyph: 'key',
  }),
  inst({
    id: 'mt-protection-funds', parent: 'gvern', level: 'gvern', category: 'special-levy', family: 'other', group: 'state', keys: ['D29H:C01'],
    official: 'Contributions to Protection Funds', native: 'Kontribuzzjonijiet għall-fondi ta’ protezzjoni', common: 'Protection fund contributions',
    base: 'As named in the National Tax List; no further detail.',
    payer: 'Not given in the list.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'EUR 20.7 million.',
    exceptions: [], refs: [ref(NTL, 'sheet MT, D29H C01')], label: 'Protection funds', sub: 'Contributions', glyph: 'shield',
  }),
];

const part = (g: string) => n.round(instruments.filter((i) => i.rev?.group === g).reduce((a, i) => a + i.rev!.amount, 0));
const sectorSum = (code: string) => ['S1311', 'S1312', 'S1313', 'S1314', 'S212'].reduce((a, s) => a + (sec[`${s}:${code}`] ?? 0), 0);
const vintage = ['D2', 'D5', 'D61'].map((c) => `${c}: NTL ${n.fmt(n.total(c))}, Eurostat July 2026 ${n.fmt(sectorSum(c))}`).join('; ');

const spec: CountrySpec = {
  today: D,
  id: 'malta',
  iso3: 'MLT',
  isoNumeric: '470',
  names: { en: 'Malta', native: 'Malta', nativeLang: 'mt' },
  currency: { code: 'EUR', symbol: '€', name: 'Euro' },
  summary:
    'Malta is a small unitary state in which every tax is national: the Commissioner for Revenue collects the income taxes and the VAT, the Customs Department the excises, and the Department of Social Security the contributions. The local councils levy no taxes of their own. The income taxes of individuals and companies, VAT and the social security contributions make most of the total; unusual lines are the fees of the Individual Investor Programme and the duty on documents.',
  structureNote:
    'The figures are the Commission’s National Tax List for 2024. Eurostat’s accounts record every tax under central government, so the folio has one level. The sale of emission trading permits (EUR 44.6 million) and the Treasury Department’s service pension (EUR 106.7 million, an imputed contribution) are left out. Malta is not an OECD member, so this folio has no harmonised OECD layer.',
  theme: {
    accent: '#cf142b',
    accent2: '#f4f1de',
    motif: 'topo',
    motifNote: 'Topographic contour lines over the outline of Malta (the generic motif; no bespoke art yet).',
    mapLabel: { lon: 14.4, lat: 35.9 },
  },
  rootLabel: { label: 'Malta', sub: 'Malta · Fiscal folio' },
  levels: [
    {
      id: 'gvern', branch: 'national', official: 'The Government of Malta', native: 'Gvern ta’ Malta', common: 'Government',
      description: 'Parliament legislates all taxes; the Commissioner for Revenue, the Customs Department and the Department of Social Security collect them. The local councils have no tax power of their own.',
      fiscalPower: 'All taxes are set by Act of Parliament.',
      refs: [ref(NTL), ref(EUS, 'S.1311')], label: 'Government', sub: 'Gvern',
    },
  ],
  supporting: [],
  denominators: [
    {
      id: 'gvern-taxes-2024', label: 'Taxes (National Tax List), 2024',
      definition: 'The taxes on production and imports, on income and wealth, and on capital that the National Tax List books to the Government and the EU, other than the sale of emission trading permits.',
      levelIds: ['gvern'], amount: part('state'), period: y, sourceId: NTL,
      locator: 'Sheet MT, 2024, the lines listed with each tax',
      calculation: `Sum of the ${instruments.filter((i) => i.rev?.group === 'state').length} tax rows below (EUR million)`,
      caveat: `Calendar 2024; the list's cut-off was 30 October 2025. Vintage check against Eurostat's July 2026 accounts: ${vintage}.`,
    },
    {
      id: 'gvern-social-employers-2024', label: 'Social contributions paid by employers, 2024',
      definition: 'The actual contributions of private-sector employers and of the Government as employer, with penalties; imputed contributions are left out.',
      levelIds: ['gvern'], amount: part('socialer'), period: y, sourceId: NTL,
      locator: 'Sheet MT, 2024, lines D611 C01 to C03',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'gvern-social-employees-2024', label: 'Social contributions paid by employees, 2024',
      definition: 'The employees’ contributions.',
      levelIds: ['gvern'], amount: part('socialhh'), period: y, sourceId: NTL,
      locator: 'Sheet MT, 2024, line D613CE C01',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'gvern-social-self-employed-2024', label: 'Social contributions of the self-employed, 2024',
      definition: 'The contributions of the self-employed and penalties on them.',
      levelIds: ['gvern'], amount: part('socialoth'), period: y, sourceId: NTL,
      locator: 'Sheet MT, 2024, lines D613CS C01 and C02',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
  ],
  sizing: {
    label: 'Taxes and compulsory social contributions of the Government',
    definition: 'The taxes of the Government plus the actual social contributions, calendar 2024, as listed in the National Tax List. Excludes the sale of emission trading permits and imputed contributions.',
    componentIds: ['gvern-taxes-2024', 'gvern-social-employers-2024', 'gvern-social-employees-2024', 'gvern-social-self-employed-2024'],
  },
  groups: {
    state: { title: 'Taxes 2024 – National Tax List (EUR million)', denominatorId: 'gvern-taxes-2024', period: y, basis: 'ESA tax revenue, general government and EU institutions', sourceId: NTL },
    socialer: { title: 'Employers’ social contributions 2024 – National Tax List (EUR million)', denominatorId: 'gvern-social-employers-2024', period: y, basis: 'Actual contributions', sourceId: NTL },
    socialhh: { title: 'Employees’ social contributions 2024 – National Tax List (EUR million)', denominatorId: 'gvern-social-employees-2024', period: y, basis: 'Actual contributions', sourceId: NTL },
    socialoth: { title: 'Self-employed contributions 2024 – National Tax List (EUR million)', denominatorId: 'gvern-social-self-employed-2024', period: y, basis: 'Actual contributions', sourceId: NTL },
  },
  sources: [
    { id: NTL, org: 'European Commission, DG Taxation and Customs Union, with Eurostat', title: 'Data on Taxation Trends: National Tax Lists (NTL), edition 2026', url: 'https://taxation-customs.ec.europa.eu/taxation/economic-analysis/data-taxation-trends_en', kind: 'statistics', language: 'en', publishedDate: '2026-03-31', periodCovered: 'Calendar year 2024 (series from 1995)', accessed: D, nextExpected: '2027-03', note: 'Workbook "NTL edition 2026 web.xlsx", sheet MT: every tax and social contribution by its national name and ESA code, in EUR million. Data cut-off 30 October 2025.' },
    { id: EUS, org: 'Eurostat', title: 'Main national accounts tax aggregates (gov_10a_taxag)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table', kind: 'statistics', language: 'en', publishedDate: '2026-07-21', periodCovered: 'Calendar year 2024', accessed: D, nextExpected: '2027-07', note: 'Taxes and social contributions by sub-sector and ESA item; for Malta everything is under central government (S.1311) or the EU institutions (S.212).' },
    { id: PWC_CIT, org: 'PwC', title: 'Worldwide Tax Summaries: Malta – Corporate – Taxes on corporate income', url: 'https://taxsummaries.pwc.com/malta/corporate/taxes-on-corporate-income', kind: 'guidance', language: 'en', publishedDate: '2026-09-30', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary, not an official source: company income tax a flat 35%; an optional 15% rate under the FITWI Regulations of 2 September 2025.' },
    { id: PWC_PIT, org: 'PwC', title: 'Worldwide Tax Summaries: Malta – Individual – Taxes on personal income', url: 'https://taxsummaries.pwc.com/malta/individual/taxes-on-personal-income', kind: 'guidance', language: 'en', publishedDate: '2026-09-30', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary: graduated progressive rates from 0% to 35%.' },
    { id: PWC_OTH, org: 'PwC', title: 'Worldwide Tax Summaries: Malta – Corporate – Other taxes', url: 'https://taxsummaries.pwc.com/malta/corporate/other-taxes', kind: 'guidance', language: 'en', publishedDate: '2026-09-30', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary: VAT 18%, 7% and 5%; social security contributions 10% from the employee and 10% from the employer on the basic weekly wage, 15% for the self-employed.' },
  ],
  instruments,
};

buildCountry(spec);
n.reconcile(part('state') + part('socialer') + part('socialhh') + part('socialoth'), ['T:D612', 'D29F:C02']);
