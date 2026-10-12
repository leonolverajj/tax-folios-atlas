/**
 * Norway: the folio's data. Run: npx tsx scripts/build/norway.ts
 * Figures: Commission / Eurostat National Tax List (NTL), edition 2026, sheet NO, calendar 2024, NOK million
 * (scripts/build/data/ntl-NO.json). The income tax of individuals and the net wealth tax are split between the
 * State and the municipalities and counties with Eurostat gov_10a_taxag (S.1313).
 * Rates: PwC Worldwide Tax Summaries (reviews of June to September 2026), a professional-firm summary.
 */
import { buildCountry, type CountrySpec, type InstSpec, type Ref } from '../lib/build-country';
import { loadNtl, loadSectors } from '../lib/ntl';

const D = '2026-10-12';
const y = { label: '2024', kind: 'calendar-year' as const, start: '2024-01-01', end: '2024-12-31' };
const ref = (id: string, loc?: string): Ref => (loc ? [id, loc] : [id]);
const n = loadNtl('NO', 'NOK');
const sec = loadSectors('NO');
const NTL = 'ntl-2026';
const EUS = 'eurostat-taxag';
const PWC_CIT = 'pwc-no-corporate';
const PWC_PIT = 'pwc-no-individual';
const PWC_OTH = 'pwc-no-other';
const PWC_NOTE = 'As summarised by PwC (reviews of June to September 2026), not checked against the Norwegian Tax Administration (Skatteetaten).';

const inst = (i: Omit<InstSpec, 'rev'> & { keys: string[]; group: string }): InstSpec => {
  const { keys, group, ...rest } = i;
  return { ...rest, rev: n.rev(group, keys) };
};

const pitKeys = ['D51A:C01', 'D51A:C02'];
const pitTotal = n.sum(pitKeys);
const pitLocal = n.round(sec['S1313:D51A']);
const pitState = n.round(pitTotal - pitLocal);
const wealthKeys = ['D59A:C01', 'D59A:C02'];
const wealthTotal = n.sum(wealthKeys);
const wealthLocal = n.round(sec['S1313:D59A']);
const wealthState = n.round(wealthTotal - wealthLocal);

const instruments: InstSpec[] = [
  /* ---- the State: income and wealth ---- */
  {
    id: 'no-income-tax-state', parent: 'staten', level: 'staten', family: 'income-personal',
    official: 'Income tax on individuals, State part (national tax on personal income and surtax)', native: 'Toppskatt og trinnskatt (statlig skatt på personinntekt)', common: 'Personal income tax: State part',
    base: 'Personal income (wages, pensions, self-employment): the bracket tax and the national insurance contribution are charged on it; general income (including capital income) is taxed at a flat rate.',
    payer: 'Individuals; employers withhold it.',
    rate: { kind: 'progressive', headline: '22% on general income; bracket tax on personal income', details: ['General income is taxed at a flat 22%; personal income is charged the bracket tax and the employee’s national insurance contribution (PwC; rates for 2026).', PWC_NOTE], asOf: '2026-09-03' },
    explanation: 'The National Tax List gives two lines for the income tax of individuals (NOK 506 billion in all). Eurostat’s accounts place NOK 240 billion of it with the municipalities and counties and the rest with the State. This row is the State’s part.',
    exceptions: ['The list’s figures for the largest Norwegian taxes are rounded values (for example NOK 350,000 and 156,000 million).'], refs: [ref(PWC_PIT, 'Personal income tax'), ref(EUS, 'S.1311 and S.1313, D51A')], label: 'Income tax (State)', sub: '22% + bracket', glyph: 'person',
    rev: { group: 'state', amount: pitState, locator: 'NTL 2026, sheet NO, D51A C01 and C02 (surtax and local and regional income tax; national tax on income less deductions), 2024, less the local part from Eurostat gov_10a_taxag (S.1313, D51A)', calculation: `${n.fmt(pitTotal)} − ${n.fmt(pitLocal)} = ${n.fmt(pitState)} (NOK million)`, caveat: `Different vintages of the two sources; Eurostat’s own State figure is NOK ${n.fmt(n.round(sec['S1311:D51A']))} million.` },
  },
  {
    id: 'no-wealth-tax-state', parent: 'staten', level: 'staten', family: 'property',
    official: 'Net wealth tax, State part', native: 'Formuesskatt (statlig del)', common: 'Net wealth tax: State part',
    base: 'The net wealth of individuals and households (NOK 31.1 billion) and corporations (NOK 1.1 billion).',
    payer: 'Individuals, households and some corporations.',
    rate: { kind: 'varies', headline: 'Set by the Storting each year', details: ['The rate and the thresholds are not extracted here.'] },
    explanation: `The list gives NOK ${n.fmt(wealthTotal)} million for the net wealth tax in all; Eurostat’s accounts place NOK ${n.fmt(wealthLocal)} million of it with the municipalities and counties and the rest with the State.`,
    exceptions: [], refs: [ref(NTL, 'sheet NO, D59A C01 and C02'), ref(EUS, 'S.1311 and S.1313, D59A')], label: 'Net wealth tax (State)', sub: 'State part', glyph: 'gem',
    rev: { group: 'state', amount: wealthState, locator: 'NTL 2026, sheet NO, D59A C01 and C02 (net wealth tax of individuals and corporations), 2024, less the local part from Eurostat gov_10a_taxag (S.1313, D59A)', calculation: `${n.fmt(wealthTotal)} − ${n.fmt(wealthLocal)} = ${n.fmt(wealthState)} (NOK million)` },
  },
  inst({
    id: 'no-corporate-income-tax', parent: 'staten', level: 'staten', family: 'income-corporate', group: 'state', keys: ['D51B:C01'],
    official: 'Corporate income tax', native: 'Selskapsskatt', common: 'Corporate income tax',
    base: 'Net income of companies, apart from the petroleum sector, which has its own tax.',
    payer: 'Companies.',
    rate: { kind: 'flat', headline: '22% (25% in parts of the financial sector)', details: ['CIT is in general assessed at 22%; certain companies within the financial sector pay 25% (PwC).', PWC_NOTE], asOf: '2026-06-25' },
    explanation: 'NOK 109.5 billion in 2024 (a rounded figure in the list).',
    exceptions: [], refs: [ref(PWC_CIT, 'Corporate income tax rates')], label: 'Corporate income tax', sub: '22%', glyph: 'factory',
  }),
  inst({
    id: 'no-petroleum-income-taxes', parent: 'staten', level: 'staten', family: 'income-corporate', group: 'state', keys: ['D51B:C03', 'D51B:C04'],
    official: 'Ordinary income tax on petroleum revenue and special tax on petroleum income', native: 'Ordinær skatt og særskatt på petroleumsinntekt', common: 'Petroleum income taxes',
    base: 'Net income from the extraction and pipeline transport of petroleum on the Norwegian continental shelf: ordinary income tax NOK 100 billion and the special tax NOK 281 billion in the list.',
    payer: 'Petroleum companies.',
    rate: { kind: 'flat', headline: '78% marginal: 22% ordinary + 56% special', details: ['Taxation is based on net income at a marginal rate of 78%, made up of the ordinary 22% corporate rate and a 56% special tax (PwC).', PWC_NOTE], asOf: '2026-06-25' },
    explanation: 'NOK 381 billion in 2024, about as much as the VAT (NOK 390 billion). These are rounded values in the list.',
    exceptions: [], refs: [ref(PWC_CIT, 'Petroleum tax')], label: 'Petroleum income taxes', sub: '78%', glyph: 'oil',
  }),
  inst({
    id: 'no-resource-rent-taxes', parent: 'staten', level: 'staten', category: 'tax', family: 'resource', group: 'state', keys: ['D51B:C02', 'D51B:C05'],
    official: 'Special tax on hydroelectric income and special tax on aquaculture income', native: 'Grunnrenteskatt på vannkraft og havbruk', common: 'Resource rent taxes',
    base: 'Hydropower income (NOK 15.5 billion) and aquaculture income (NOK 2.0 billion) as named in the National Tax List.',
    payer: 'Hydropower and aquaculture companies.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Two sector taxes.',
    exceptions: [], refs: [ref(NTL, 'sheet NO, D51B C02 and C05')], label: 'Resource rent taxes', sub: 'Hydro · aquaculture', glyph: 'water',
  }),
  inst({
    id: 'no-dividend-withholding', parent: 'staten', level: 'staten', family: 'income-mixed', group: 'state', keys: ['D51E:C01', 'D51E:C02'],
    official: 'Tax on dividends paid to foreign shareholders and taxes paid by residents of Svalbard', native: 'Kildeskatt på utbytte til utenlandske aksjonærer; Svalbard', common: 'Dividend withholding tax and Svalbard',
    base: 'Dividends paid to foreign shareholders (NOK 13.4 billion) and the tax on residents and corporations of Svalbard (NOK 0.2 billion).',
    payer: 'Foreign shareholders; residents of Svalbard.',
    rate: { kind: 'varies', headline: 'By treaty and law', details: [] },
    explanation: 'Two lines.',
    exceptions: [], refs: [ref(NTL, 'sheet NO, D51E')], label: 'Dividend withholding', sub: 'Foreign shareholders', glyph: 'coin',
  }),
  /* ---- the State: social contributions ---- */
  inst({
    id: 'no-social-employers', parent: 'staten', level: 'staten', category: 'social-contribution', family: 'social-security', group: 'socialer', keys: ['D611:C01', 'D611:C02', 'D611:C03'],
    official: 'Employers’ social security contributions (National Insurance, the Public Service Pension Fund and the seamen’s scheme)', native: 'Arbeidsgiveravgift', common: 'Employers’ contributions',
    base: 'Employees’ gross salary. National Insurance NOK 267.9 billion, the Norwegian Public Service Pension Fund NOK 26.5 billion and the seamen’s pension arrangement NOK 0.9 billion.',
    payer: 'Employers.',
    rate: { kind: 'range', headline: '0% to 14.1%, by municipality', details: ['The employers’ contribution rate varies between 0% and 14.1% depending on the municipality of the head office; paid bimonthly (PwC).', PWC_NOTE], asOf: '2026-06-25' },
    explanation: 'The largest line after the VAT, with different rates in different parts of the country.',
    exceptions: [], refs: [ref(PWC_OTH, 'National insurance contributions'), ref(NTL, 'sheet NO, D611')], label: 'Social: employers', sub: '0–14.1%', glyph: 'heart',
  }),
  inst({
    id: 'no-social-employees', parent: 'staten', level: 'staten', category: 'social-contribution', family: 'social-security', group: 'socialhh', keys: ['D613CE:C01', 'D613CE:C02', 'D613CE:C03', 'D613CE:C04'],
    official: 'Employees’ social security contributions (National Insurance, Public Service Pension Fund, seamen and fishermen)', native: 'Trygdeavgift (lønnstakere)', common: 'Employees’ contributions',
    base: 'Personal income. National Insurance NOK 155.4 billion, Public Service Pension Fund NOK 5.7 billion, seamen and fishermen small lines.',
    payer: 'Employees; the employer withholds.',
    rate: { kind: 'flat', headline: 'A percentage of personal income', details: ['The rate is not extracted here.'] },
    explanation: 'NOK 161.7 billion.',
    exceptions: [], refs: [ref(NTL, 'sheet NO, D613CE')], label: 'Social: employees', sub: 'Trygdeavgift', glyph: 'heart',
  }),
  inst({
    id: 'no-social-others', parent: 'staten', level: 'staten', category: 'social-contribution', family: 'social-security', group: 'socialoth', keys: ['D613CS:C01', 'D613CN:C01'],
    official: 'Contributions of the self-employed and of pensioners to the National Insurance', native: 'Trygdeavgift (selvstendig næringsdrivende og pensjonister)', common: 'Self-employed and pensioners’ contributions',
    base: 'The self-employed (NOK 17.1 billion) and pensioners (NOK 15.6 billion).',
    payer: 'Self-employed people and pensioners.',
    rate: { kind: 'flat', headline: 'A percentage of income', details: [] },
    explanation: 'Norwegian pensioners also pay a contribution on their pensions.',
    exceptions: [], refs: [ref(NTL, 'sheet NO, D613CS and D613CN')], label: 'Self-employed and pensioners', sub: 'Trygdeavgift', glyph: 'heart',
  }),
  /* ---- the State: consumption ---- */
  inst({
    id: 'no-vat', parent: 'staten', level: 'staten', family: 'general-consumption', group: 'state', keys: ['D211:C01'],
    official: 'Value added tax', native: 'Merverdiavgift (mva)', common: 'VAT', abbr: 'mva',
    base: 'Goods and services supplied in Norway and imports.',
    payer: 'Consumers; businesses charge it and claim input credits.',
    rate: { kind: 'range', headline: '25% general; 15% on food; 12% on transport and others', details: ['The general VAT rate is 25%; a reduced 15% applies to food and beverages (excluding alcohol, medication and tap water); lower rates apply to some services (PwC).', PWC_NOTE], asOf: '2026-06-25' },
    explanation: 'NOK 390 billion, a rounded value in the list.',
    exceptions: [], refs: [ref(PWC_OTH, 'Value-added tax')], label: 'VAT', sub: '25%', glyph: 'cart',
  }),
  inst({
    id: 'no-customs', parent: 'staten', level: 'staten', category: 'customs-duty', family: 'trade', group: 'state', keys: ['D2121:C01'],
    official: 'Customs duties', native: 'Toll', common: 'Customs duties',
    base: 'Imported goods.',
    payer: 'Importers.',
    rate: { kind: 'varies', headline: 'Set by the Customs Tariff', details: ['Norway is outside the EU and keeps its customs revenue; Eurostat books it under central government.'] },
    explanation: 'NOK 3.6 billion.',
    exceptions: [], refs: [ref(NTL, 'sheet NO, D2121 C01')], label: 'Customs duties', sub: 'Imports', glyph: 'ship',
  }),
  inst({
    id: 'no-fuel-emission-taxes', parent: 'staten', level: 'staten', family: 'specific-consumption', group: 'state', keys: ['D214A:C01', 'D214A:C02', 'D214A:C06', 'D214A:C07', 'D214A:C08', 'D214A:C10', 'D214A:C11', 'D214A:C24', 'D214A:C25', 'D29F:C03', 'D29F:C02'],
    official: 'Taxes on petrol, diesel, CO₂, NOx, greenhouse gases and lubricating oils, including the CO₂ and NOx taxes of the petroleum sector', native: 'Bensinavgift, dieselavgift, CO₂-avgift, NOx-avgift', common: 'Fuel and emission taxes',
    base: 'Petrol (NOK 3.5 billion), diesel (NOK 6.7 billion), CO₂ emissions outside the petroleum sector (NOK 16.3 billion), CO₂ in the petroleum sector (NOK 7.8 billion), NOx, HFC and PFC gases, SF6, lubricating oils, sulphur and the road tax on natural gas.',
    payer: 'Fuel suppliers and emitters.',
    rate: { kind: 'specific', headline: 'Per litre or per tonne of emissions', details: ['The rates are not extracted here.'] },
    explanation: 'Eleven lines that the list books among taxes on products and pollution.',
    exceptions: [], refs: [ref(NTL, 'sheet NO, D214A C01, C02, C06–C08, C10–C11, C24–C25, D29F C02–C03')], label: 'Fuel and emission taxes', sub: 'CO₂ · petrol · diesel', glyph: 'flame',
  }),
  inst({
    id: 'no-electricity-tax', parent: 'staten', level: 'staten', family: 'specific-consumption', group: 'state', keys: ['D214A:C04', 'D214A:C05'],
    official: 'Tax on electricity (including the part paid to the Norwegian Energy Fund)', native: 'Elavgift', common: 'Electricity tax',
    base: 'Electricity consumed: NOK 9.7 billion, and NOK 0.7 billion for the Norwegian Energy Fund.',
    payer: 'Electricity suppliers and consumers.',
    rate: { kind: 'specific', headline: 'Øre per kilowatt-hour', details: [] },
    explanation: 'Two lines.',
    exceptions: [], refs: [ref(NTL, 'sheet NO, D214A C04 and C05')], label: 'Electricity tax', sub: 'Per kWh', glyph: 'bolt',
  }),
  inst({
    id: 'no-alcohol-tobacco', parent: 'staten', level: 'staten', family: 'specific-consumption', group: 'state', keys: ['D214A:C16', 'D214A:C17', 'D29E:C09'],
    official: 'Taxes on alcohol and on tobacco goods, and the tax on the turnover of tobacco products', native: 'Alkoholavgift og tobakksavgift', common: 'Alcohol and tobacco taxes',
    base: 'Alcohol (NOK 16.5 billion), tobacco goods (NOK 7.8 billion) and a small tax on tobacco turnover.',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'specific', headline: 'Per litre of alcohol; per unit of tobacco', details: [] },
    explanation: 'Three lines.',
    exceptions: [], refs: [ref(NTL, 'sheet NO, D214A C16 and C17, D29E C09')], label: 'Alcohol and tobacco', sub: 'Excises', glyph: 'wine',
  }),
  inst({
    id: 'no-product-taxes', parent: 'staten', level: 'staten', category: 'tax', family: 'specific-consumption', group: 'state', keys: ['D214A:C13', 'D214A:C14', 'D214A:C20', 'D214A:C22', 'D214A:C23', 'D29E:C04', 'D29E:C05', 'D29F:C09', 'D29F:C05'],
    official: 'Taxes on beverage packaging, sugar, pharmaceutical products, waste incineration and pesticides', native: 'Engangsemballasje, sukkeravgift, apotekavgift, avfallsforbrenning, plantevernmidler', common: 'Packaging, sugar and other product taxes',
    base: 'Beverage packaging (NOK 3.0 billion in two lines), waste incineration (NOK 0.6 billion), pharmaceutical products and pharmacies (NOK 0.5 billion in four lines), sugar (NOK 0.2 billion) and pesticides.',
    payer: 'Producers, importers and sellers of the products.',
    rate: { kind: 'specific', headline: 'Per unit or by value', details: [] },
    explanation: 'Nine small product taxes.',
    exceptions: [], refs: [ref(NTL, 'sheet NO, D214A C13–C14, C20, C22–C23, D29E C04–C05, D29F C05, C09')], label: 'Product taxes', sub: 'Packaging · sugar', glyph: 'leaf',
  }),
  inst({
    id: 'no-stamp-duty', parent: 'staten', level: 'staten', family: 'property', group: 'state', keys: ['D214C:C01'],
    official: 'Stamp duty on real estate transfers', native: 'Dokumentavgift', common: 'Stamp duty on property',
    base: 'The price of real estate on transfer.',
    payer: 'Buyers.',
    rate: { kind: 'flat', headline: 'A percentage of the price', details: ['The rate is not extracted here.'] },
    explanation: 'NOK 12.7 billion.',
    exceptions: [], refs: [ref(NTL, 'sheet NO, D214C C01')], label: 'Stamp duty', sub: 'Property', glyph: 'stamp',
  }),
  inst({
    id: 'no-vehicle-taxes', parent: 'staten', level: 'staten', family: 'specific-consumption', group: 'state', keys: ['D214D:C01', 'D29B:C01', 'D29B:C02', 'D29B:C03', 'D59D:C01'],
    official: 'Motor vehicle registration tax, annual taxes on motor vehicles (weight-based, enterprises and households) and re-registration tax', native: 'Engangsavgift; årsavgift; omregistreringsavgift', common: 'Vehicle taxes',
    base: 'Registration (NOK 7.9 billion), the annual tax paid by households (NOK 8.8 billion), by enterprises (NOK 1.8 billion), the weight-based tax (NOK 0.3 billion) and re-registration (NOK 1.8 billion).',
    payer: 'Vehicle owners and buyers.',
    rate: { kind: 'varies', headline: 'By weight, emissions and value', details: [] },
    explanation: 'Five lines.',
    exceptions: [], refs: [ref(NTL, 'sheet NO, D214D C01, D29B C01–C03, D59D C01')], label: 'Vehicle taxes', sub: 'Registration · annual', glyph: 'car',
  }),
  inst({
    id: 'no-air-passenger-tax', parent: 'staten', level: 'staten', family: 'specific-consumption', group: 'state', keys: ['D214H:C01'],
    official: 'Tax on air traffic passengers', native: 'Flypassasjeravgift', common: 'Air passenger tax',
    base: 'Passengers on flights from Norwegian airports.',
    payer: 'Passengers.',
    rate: { kind: 'specific', headline: 'A set amount per passenger', details: [] },
    explanation: 'NOK 2.2 billion.',
    exceptions: [], refs: [ref(NTL, 'sheet NO, D214H C01')], label: 'Air passenger tax', sub: 'Per passenger', glyph: 'plane',
  }),
  inst({
    id: 'no-gaming-income', parent: 'staten', level: 'staten', family: 'specific-consumption', group: 'state', keys: ['D214J:C01'],
    official: 'Income from the state gaming company (Norsk Tipping)', native: 'Inntekter fra Norsk Tipping', common: 'State gaming company income',
    base: 'The surplus of the State’s gaming monopoly.',
    payer: 'The state-owned company.',
    rate: { kind: 'varies', headline: 'Set by the gaming laws', details: [] },
    explanation: 'NOK 6.9 billion, booked as the profits of a fiscal monopoly.',
    exceptions: [], refs: [ref(NTL, 'sheet NO, D214J C01')], label: 'Norsk Tipping income', sub: 'Monopoly', glyph: 'dice',
  }),
  inst({
    id: 'no-financial-activities-tax', parent: 'staten', level: 'staten', family: 'payroll', group: 'state', keys: ['D29C:C02'],
    official: 'Financial activity tax on salary', native: 'Finansskatt på lønn', common: 'Financial activities tax',
    base: 'The wage base of entities that mainly provide VAT-exempt financial services.',
    payer: 'Financial entities.',
    rate: { kind: 'flat', headline: '5% of the wage base', details: ['Entities within the financial services sector are subject to a special payroll tax of 5% on the wage base (PwC).', PWC_NOTE], asOf: '2026-06-25' },
    explanation: 'NOK 2.8 billion.',
    exceptions: [], refs: [ref(PWC_OTH, 'Financial activities tax')], label: 'Financial activities tax', sub: '5% of wages', glyph: 'bank',
  }),
  inst({
    id: 'no-primary-industry-levies', parent: 'staten', level: 'staten', category: 'special-levy', family: 'resource', group: 'state', keys: ['D29H:C09', 'D29H:C03', 'D29C:C01', 'D29H:C06', 'D214K:C01', 'D29H:C01', 'D29H:C08', 'D29F:C07', 'D29F:C08', 'D29E:C08'],
    official: 'Levies on fish production, meat and eggs, milk and grain, fishing industry products and research in agriculture and fisheries, aquaculture control, and others', native: 'Avgifter på fiskeri, landbruk og havbruk', common: 'Agriculture and fisheries levies',
    base: 'Excise duties on fish production (NOK 1.4 billion), market regulation levies on meat, eggs, milk, grain and furs (NOK 0.7 billion), the fishing industry product tax (NOK 0.6 billion), export duties for fisheries research (NOK 0.5 billion), research taxes in fisheries (NOK 0.4 billion) and agriculture (NOK 0.2 billion), wild marine resources (NOK 0.1 billion) and small lines.',
    payer: 'Producers and exporters in agriculture, fisheries and aquaculture.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Ten lines.',
    exceptions: [], refs: [ref(NTL, 'sheet NO, D29H C01, C03, C06, C08, C09, D29C C01, D214K, D29F C07–C08, D29E C08')], label: 'Primary industry levies', sub: 'Fish · farm', glyph: 'wheat',
  }),
  inst({
    id: 'no-sector-fees-small', parent: 'staten', level: 'staten', category: 'fee', family: 'other', group: 'state', keys: ['D29H:C04', 'D29H:C05', 'D29H:C07', 'D29H:C10', 'D29H:C11', 'D29E:C06', 'D214E:C02', 'D59F:C03', 'D59F:C04', 'D59F:C05', 'D91A:C01'],
    official: 'Sector fees to regulators, customs quota auctions, tonnage tax, licences and other small lines', native: 'Sektoravgifter og andre småavgifter', common: 'Sector fees and small taxes',
    base: 'Sector fees to the Norwegian Communications Authority, the Water Resources and Energy Directorate, the Petroleum Safety Authority and the Metrology Service, the tonnage tax for shipping companies, proceeds from auctioning customs quotas, fishing and hunting licences, a tax on cinemas, the Svalbard environmental fund and the remainder of the inheritance and gift tax (NOK 30 million).',
    payer: 'Regulated businesses and licence holders.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Eleven small lines, together under 0.2% of the total.',
    exceptions: [], refs: [ref(NTL, 'sheet NO, D29H, D29E C06, D214E C02, D59F, D91A C01')], label: 'Sector fees and small taxes', sub: 'Regulators · licences', glyph: 'stamp',
  }),
  /* ---- municipalities and county authorities ---- */
  {
    id: 'no-income-tax-local', parent: 'kommunene', level: 'kommunene', family: 'income-personal',
    official: 'Local and regional income tax on individuals (municipalities and counties)', native: 'Kommuneskatt og fylkesskatt (skatt på alminnelig inntekt)', common: 'Municipal and county income tax',
    base: 'The same general income as the State’s part of the tax, taxed in the municipality of residence.',
    payer: 'Individuals; the employer withholds.',
    rate: { kind: 'flat', headline: 'Part of the 22% on general income', details: ['General income is taxed at a flat 22% (PwC); the municipalities and counties receive the largest part of that tax. The split between them is not extracted here.'], asOf: '2026-09-03' },
    explanation: 'NOK 240 billion: the main revenue source of the local level in the list.',
    exceptions: [], refs: [ref(PWC_PIT, 'General income tax'), ref(EUS, 'S.1313, D51A')], label: 'Local income tax', sub: 'General income', glyph: 'person',
    rev: { group: 'localpit', amount: pitLocal, locator: 'Eurostat gov_10a_taxag, 2024: S.1313 local government, D51A taxes on individual or household income, NOK million', caveat: 'Eurostat July 2026 vintage; the National Tax List has no sector split.' },
  },
  {
    id: 'no-wealth-tax-local', parent: 'kommunene', level: 'kommunene', family: 'property',
    official: 'Net wealth tax, part recorded under local government', native: 'Formuesskatt (kommunal del)', common: 'Net wealth tax: local part',
    base: 'The same net wealth as the State’s part.',
    payer: 'Individuals, households and some corporations.',
    rate: { kind: 'varies', headline: 'Set by the Storting each year', details: [] },
    explanation: 'Most of the net wealth tax is recorded under the municipalities and counties in Eurostat’s accounts.',
    exceptions: [], refs: [ref(NTL, 'sheet NO, D59A'), ref(EUS, 'S.1313, D59A')], label: 'Net wealth tax (local)', sub: 'Local part', glyph: 'gem',
    rev: { group: 'localwealth', amount: wealthLocal, locator: 'Eurostat gov_10a_taxag, 2024: S.1313 local government, D59A other current taxes (net wealth tax), NOK million', caveat: 'Eurostat July 2026 vintage; the National Tax List has no sector split.' },
  },
  inst({
    id: 'no-real-estate-tax', parent: 'kommunene', level: 'kommunene', family: 'property', group: 'localprop', keys: ['D29A:C01'],
    official: 'Real estate tax', native: 'Eiendomsskatt', common: 'Real estate tax',
    base: 'The assessed value of homes and other property in the municipalities that levy it.',
    payer: 'Owners of property.',
    rate: { kind: 'range', headline: 'Set by each municipality within a ceiling', details: ['The list does not give rates.'] },
    explanation: 'NOK 17.5 billion; municipalities decide whether to levy it.',
    exceptions: [], refs: [ref(NTL, 'sheet NO, D29A C01'), ref(EUS, 'S.1313, D29A')], label: 'Real estate tax', sub: 'Municipal', glyph: 'house',
  }),
  inst({
    id: 'no-natural-resource-tax', parent: 'kommunene', level: 'kommunene', family: 'resource', group: 'localnr', keys: ['D29E:C01'],
    official: 'Natural resource tax', native: 'Naturressursskatt', common: 'Natural resource tax',
    base: 'Hydropower production, charged on the plants’ output.',
    payer: 'Hydropower operators.',
    rate: { kind: 'varies', headline: 'Set by law', details: ['NOK 1.6 billion; Eurostat books the same amount under local government.'] },
    explanation: 'Revenue from power plants goes to the municipalities and counties where they are located.',
    exceptions: [], refs: [ref(NTL, 'sheet NO, D29E C01'), ref(EUS, 'S.1313, D51B')], label: 'Natural resource tax', sub: 'Hydropower', glyph: 'water',
  }),
];

const part = (g: string) => n.round(instruments.filter((i) => i.rev?.group === g).reduce((a, i) => a + i.rev!.amount, 0));
const sectorSum = (code: string) => ['S1311', 'S1312', 'S1313', 'S1314', 'S212'].reduce((a, s) => a + (sec[`${s}:${code}`] ?? 0), 0);
const vintage = ['D2', 'D5', 'D61'].map((c) => `${c}: NTL ${n.fmt(n.total(c))}, Eurostat July 2026 ${n.fmt(sectorSum(c))}`).join('; ');

const spec: CountrySpec = {
  today: D,
  id: 'norway',
  iso3: 'NOR',
  isoNumeric: '578',
  names: { en: 'Norway', native: 'Norge', nativeLang: 'nb' },
  currency: { code: 'NOK', symbol: 'kr', name: 'Norwegian krone' },
  summary:
    'Norway is a unitary state. The Storting sets all taxes and the Tax Administration collects them, but the 22% tax on general income is shared: most of it goes to the municipalities and counties. The State’s own big flows are the VAT, the National Insurance contributions, the income taxes of companies and, uniquely, a petroleum income tax of 78% on net income from oil and gas production, which in the list brings in about as much as the VAT. The net wealth tax is also mostly local.',
  structureNote:
    'The figures are the Commission’s National Tax List for 2024, in NOK million; several of the largest lines are given as round numbers (VAT 390,000, local and regional income tax 350,000, petroleum taxes 100,000 and 281,000), so they are rounded values. The income tax of individuals and the net wealth tax are each drawn twice, as the State’s and the municipalities’ and counties’ part, using Eurostat’s split of the same year. The imputed tax on emission permits (NOK 2.5 billion) and the employers’ imputed social contributions (NOK 8.3 billion) are left out. The social contributions are drawn under the State.',
  theme: {
    accent: '#ba0c2f',
    accent2: '#00205b',
    motif: 'topo',
    motifNote: 'Topographic contour lines over the outline of Norway (the generic motif; no bespoke art yet).',
    mapLabel: { lon: 9.5, lat: 61.0 },
  },
  rootLabel: { label: 'Norway', sub: 'Norge · Fiscal folio' },
  levels: [
    {
      id: 'staten', branch: 'national', official: 'The State (Kingdom of Norway)', native: 'Staten', common: 'State',
      description: 'The Storting legislates all taxes; the Norwegian Tax Administration (Skatteetaten) collects them and the National Insurance contributions, which fund the National Insurance Scheme.',
      fiscalPower: 'The Storting sets the rates and bases of all taxes each year; municipalities set only the real estate tax rate within a ceiling.',
      refs: [ref(NTL)], label: 'State', sub: 'Staten',
    },
    {
      id: 'kommunene', branch: 'local', official: 'Municipalities and county authorities', native: 'Kommuner og fylkeskommuner', common: 'Municipalities and counties',
      description: 'The municipalities and the county authorities. They receive most of the tax on general income and the net wealth tax, and the municipalities that choose to levy it receive the real estate tax; they also receive the natural resource tax from power plants.',
      fiscalPower: 'The Storting fixes the income tax rates for the local level; municipalities decide whether to levy a real estate tax.',
      refs: [ref(EUS)], label: 'Municipalities and counties', sub: 'Kommuner',
    },
  ],
  supporting: [],
  denominators: [
    {
      id: 'staten-taxes-2024', label: 'State taxes (National Tax List), 2024',
      definition: 'The taxes on production and imports, on income and wealth, and on capital that the National Tax List books to the State, other than the local lines and the imputed tax on emission permits; includes the State’s part of the income tax of individuals and of the net wealth tax.',
      levelIds: ['staten'], amount: part('state'), period: y, sourceId: NTL,
      locator: 'Sheet NO, 2024, the lines listed with each tax',
      calculation: `Sum of the ${instruments.filter((i) => i.rev?.group === 'state').length} tax rows below (NOK million)`,
      caveat: `Calendar 2024; the list's cut-off was 30 October 2025. Several large lines are rounded. Vintage check against Eurostat's July 2026 accounts: ${vintage}.`,
    },
    {
      id: 'staten-social-employers-2024', label: 'Social contributions paid by employers, 2024',
      definition: 'The actual employers’ contributions (National Insurance, the Public Service Pension Fund and the seamen’s scheme); imputed contributions are left out.',
      levelIds: ['staten'], amount: part('socialer'), period: y, sourceId: NTL,
      locator: 'Sheet NO, 2024, lines D611 C01 to C03',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'staten-social-employees-2024', label: 'Social contributions paid by employees, 2024',
      definition: 'The employees’ contributions to the National Insurance, the Public Service Pension Fund and the seamen’s and fishermen’s arrangements.',
      levelIds: ['staten'], amount: part('socialhh'), period: y, sourceId: NTL,
      locator: 'Sheet NO, 2024, lines D613CE C01 to C04',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'staten-social-others-2024', label: 'Contributions of the self-employed and pensioners, 2024',
      definition: 'The contributions of the self-employed and of pensioners to the National Insurance.',
      levelIds: ['staten'], amount: part('socialoth'), period: y, sourceId: NTL,
      locator: 'Sheet NO, 2024, lines D613CS and D613CN',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'kommunene-income-tax-2024', label: 'Income tax received by the municipalities and counties, 2024',
      definition: 'The part of the income tax of individuals that Eurostat’s accounts record under local government.',
      levelIds: ['kommunene'], amount: part('localpit'), period: y, sourceId: EUS,
      locator: 'gov_10a_taxag, 2024, S.1313, D51A, million NOK',
      caveat: 'Eurostat July 2026 vintage, a different release from the National Tax List.',
    },
    {
      id: 'kommunene-wealth-tax-2024', label: 'Net wealth tax recorded under local government, 2024',
      definition: 'The part of the net wealth tax that Eurostat’s accounts record under local government.',
      levelIds: ['kommunene'], amount: part('localwealth'), period: y, sourceId: EUS,
      locator: 'gov_10a_taxag, 2024, S.1313, D59A, million NOK',
      caveat: 'Eurostat July 2026 vintage, a different release from the National Tax List.',
    },
    {
      id: 'kommunene-real-estate-tax-2024', label: 'Real estate tax of the municipalities, 2024',
      definition: 'The real estate tax levied by the municipalities that choose to.',
      levelIds: ['kommunene'], amount: part('localprop'), period: y, sourceId: NTL,
      locator: 'Sheet NO, 2024, line D29A C01',
      caveat: `Eurostat books NOK ${n.fmt(sec['S1313:D2'])} million of taxes on production under local government, which is this tax.`,
    },
    {
      id: 'kommunene-natural-resource-tax-2024', label: 'Natural resource tax, 2024',
      definition: 'The tax on hydropower production that goes to the municipalities and counties.',
      levelIds: ['kommunene'], amount: part('localnr'), period: y, sourceId: NTL,
      locator: 'Sheet NO, 2024, line D29E C01',
      caveat: `Eurostat books NOK ${n.fmt(sec['S1313:D51B'])} million of corporate income taxes under local government, which equals this line.`,
    },
  ],
  sizing: {
    label: 'Taxes and compulsory social contributions of all levels of government',
    definition: 'The taxes of the State and of the municipalities and counties plus the actual social contributions, calendar 2024, as listed in the National Tax List and split by Eurostat. Excludes the imputed tax on emission permits and imputed social contributions.',
    componentIds: ['staten-taxes-2024', 'staten-social-employers-2024', 'staten-social-employees-2024', 'staten-social-others-2024', 'kommunene-income-tax-2024', 'kommunene-wealth-tax-2024', 'kommunene-real-estate-tax-2024', 'kommunene-natural-resource-tax-2024'],
  },
  fromProfile: 'norway',
  structureOverride: {
    basis: 'OECD attribution to sub-sectors of general government (Interpretative Guide, section A.12)',
    folioLevels: { central: ['staten'], local: ['kommunene'] },
    levelNotes: { central: 'The National Insurance contributions are drawn under the State; the OECD shows Norway’s social security contributions within central government.' },
  },
  groups: {
    state: { title: 'State taxes 2024 – National Tax List (NOK million)', denominatorId: 'staten-taxes-2024', period: y, basis: 'ESA tax revenue, general government', sourceId: NTL },
    socialer: { title: 'Employers’ social contributions 2024 – National Tax List (NOK million)', denominatorId: 'staten-social-employers-2024', period: y, basis: 'Actual compulsory contributions', sourceId: NTL },
    socialhh: { title: 'Employees’ social contributions 2024 – National Tax List (NOK million)', denominatorId: 'staten-social-employees-2024', period: y, basis: 'Actual compulsory contributions', sourceId: NTL },
    socialoth: { title: 'Self-employed and pensioners’ contributions 2024 – National Tax List (NOK million)', denominatorId: 'staten-social-others-2024', period: y, basis: 'Actual compulsory contributions', sourceId: NTL },
    localpit: { title: 'Local income tax 2024 – Eurostat (NOK million)', denominatorId: 'kommunene-income-tax-2024', period: y, basis: 'ESA taxes received by local government', sourceId: EUS },
    localwealth: { title: 'Local part of the net wealth tax 2024 – Eurostat (NOK million)', denominatorId: 'kommunene-wealth-tax-2024', period: y, basis: 'ESA taxes received by local government', sourceId: EUS },
    localprop: { title: 'Real estate tax 2024 – National Tax List (NOK million)', denominatorId: 'kommunene-real-estate-tax-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
    localnr: { title: 'Natural resource tax 2024 – National Tax List (NOK million)', denominatorId: 'kommunene-natural-resource-tax-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
  },
  sources: [
    { id: NTL, org: 'European Commission, DG Taxation and Customs Union, with Eurostat', title: 'Data on Taxation Trends: National Tax Lists (NTL), edition 2026', url: 'https://taxation-customs.ec.europa.eu/taxation/economic-analysis/data-taxation-trends_en', kind: 'statistics', language: 'en', publishedDate: '2026-03-31', periodCovered: 'Calendar year 2024 (series from 1995)', accessed: D, nextExpected: '2027-03', note: 'Workbook "NTL edition 2026 web.xlsx", sheet NO (Norway is included with the EU countries): every tax and social contribution by its national name and ESA code, in NOK million. Data cut-off 30 October 2025. Several of the largest lines are round numbers.' },
    { id: EUS, org: 'Eurostat', title: 'Main national accounts tax aggregates (gov_10a_taxag)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table', kind: 'statistics', language: 'en', publishedDate: '2026-07-21', periodCovered: 'Calendar year 2024', accessed: D, nextExpected: '2027-07', note: 'Taxes and social contributions by sub-sector and ESA item; used to split the income tax of individuals (S.1313: NOK 239,541 million) and the net wealth tax (S.1313: NOK 21,500 million) between the State and local government and to check the totals.' },
    { id: PWC_CIT, org: 'PwC', title: 'Worldwide Tax Summaries: Norway – Corporate – Taxes on corporate income', url: 'https://taxsummaries.pwc.com/norway/corporate/taxes-on-corporate-income', kind: 'guidance', language: 'en', publishedDate: '2026-06-25', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary, not an official source: corporate tax 22% (25% in parts of the financial sector); petroleum taxation at a marginal 78% (22% plus a 56% special tax).' },
    { id: PWC_PIT, org: 'PwC', title: 'Worldwide Tax Summaries: Norway – Individual – Taxes on personal income', url: 'https://taxsummaries.pwc.com/norway/individual/taxes-on-personal-income', kind: 'guidance', language: 'en', publishedDate: '2026-09-03', periodCovered: 'Rates for 2026', accessed: D, note: 'A professional firm’s summary: general income taxed at a flat 22%, personal income charged bracket tax and national insurance contributions.' },
    { id: PWC_OTH, org: 'PwC', title: 'Worldwide Tax Summaries: Norway – Corporate – Other taxes', url: 'https://taxsummaries.pwc.com/norway/corporate/other-taxes', kind: 'guidance', language: 'en', publishedDate: '2026-06-25', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary: VAT 25% general and 15% on food; employers’ national insurance 0% to 14.1% by municipality; financial activities tax 5%.' },
  ],
  instruments,
};

buildCountry(spec);
n.reconcile(part('state') + part('socialer') + part('socialhh') + part('socialoth') + part('localpit') + part('localwealth') + part('localprop') + part('localnr'), ['T:D612', 'D29F:C04']);
