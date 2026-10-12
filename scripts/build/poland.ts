/**
 * Poland: the folio's data. Run: npx tsx scripts/build/poland.ts
 * Figures: Commission / Eurostat National Tax List (NTL), edition 2026, sheet PL, calendar 2024, PLN million
 * (scripts/build/data/ntl-PL.json). The personal and corporate income taxes are split between the State and
 * local government with Eurostat gov_10a_taxag (the NTL totals equal the two sub-sectors' sum exactly).
 * Rates: PwC Worldwide Tax Summaries (review of 11 August 2026), a professional-firm summary.
 */
import { buildCountry, type CountrySpec, type InstSpec, type Ref } from '../lib/build-country';
import { loadNtl, loadSectors } from '../lib/ntl';

const D = '2026-10-12';
const y = { label: '2024', kind: 'calendar-year' as const, start: '2024-01-01', end: '2024-12-31' };
const ref = (id: string, loc?: string): Ref => (loc ? [id, loc] : [id]);
const n = loadNtl('PL', 'PLN');
const sec = loadSectors('PL');
const NTL = 'ntl-2026';
const EUS = 'eurostat-taxag';
const PWC_CIT = 'pwc-pl-corporate';
const PWC_PIT = 'pwc-pl-individual';
const PWC_OTH = 'pwc-pl-other';
const PWC_NOTE = 'As summarised by PwC (review of 11 August 2026), not checked against the National Revenue Administration.';

const inst = (i: Omit<InstSpec, 'rev'> & { keys: string[]; group: string }): InstSpec => {
  const { keys, group, ...rest } = i;
  return { ...rest, rev: n.rev(group, keys) };
};

const pitKeys = ['D51A:C01', 'D51A:C02', 'D51A:C03', 'D51A:C04', 'D51A:C05'];
const citKeys = ['D51O:C01', 'D51O:C02'];
const pitTotal = n.sum(pitKeys);
const pitLocal = n.round(sec['S1313:D51A']);
const pitState = n.round(pitTotal - pitLocal);
const citTotal = n.sum(citKeys);
const citLocal = n.round(sec['S1313:D51B']);
const citState = n.round(citTotal - citLocal);

const instruments: InstSpec[] = [
  /* ---- the State: income taxes ---- */
  {
    id: 'pl-pit-state', parent: 'panstwo', level: 'panstwo', family: 'income-personal',
    official: 'Personal income tax (PIT), State share', native: 'Podatek dochodowy od osób fizycznych (część państwa)', common: 'Personal income tax: State share',
    base: 'Employment income (PLN 85.2 billion), self-employment (58.8 billion), social benefits (28.3 billion), capital gains (9.0 billion) and the solidarity contribution (2.1 billion).',
    payer: 'Individuals; employers and payers withhold it.',
    rate: { kind: 'progressive', headline: '12% · 32% above PLN 120,000', details: ['12% of the base less a deduction of PLN 3,600 (tax-free amount PLN 30,000) up to PLN 120,000, then PLN 10,800 plus 32% of the excess (PwC).', PWC_NOTE] },
    explanation: 'The National Tax List gives one total for the personal income tax (PLN 183.5 billion); Eurostat’s accounts place PLN 101.8 billion of it with local government and the rest with the State. This row is the State’s part, the next the local governments’.',
    exceptions: [], refs: [ref(PWC_PIT, 'Personal income tax rates'), ref(EUS, 'S.1311 and S.1313, D51A')], label: 'Personal income tax (State)', sub: '12% · 32%', glyph: 'person',
    rev: { group: 'state', amount: pitState, locator: 'NTL 2026, sheet PL, D51A C01 to C05 (personal income tax), 2024, less the local part from Eurostat gov_10a_taxag (S.1313, D51A)', calculation: `${n.fmt(pitTotal)} − ${n.fmt(pitLocal)} = ${n.fmt(pitState)} (PLN million)`, caveat: `Eurostat’s own State figure is PLN ${n.fmt(sec['S1311:D51A'])} million; the two sources agree on the total.` },
  },
  inst({
    id: 'pl-cit-state', parent: 'panstwo', level: 'panstwo', family: 'income-corporate', group: 'state', keys: ['D51O:C01'],
    official: 'Corporate income tax (CIT), State share', native: 'Podatek dochodowy od osób prawnych (część państwa)', common: 'Corporate income tax: State share',
    base: 'Profit of companies and other legal persons.',
    payer: 'Companies.',
    rate: { kind: 'flat', headline: '19% standard; 9% for small taxpayers', details: ['The standard CIT rate is 19% and a reduced 9% applies to small taxpayers; from 2026 banks pay 23% (PwC).', PWC_NOTE] },
    explanation: 'The National Tax List gives one total for the corporate income tax (PLN 87.5 billion); Eurostat places PLN 26.5 billion with local government and the rest with the State.',
    exceptions: [], refs: [ref(PWC_CIT, 'Corporate income tax rates'), ref(EUS, 'S.1311 and S.1313, D51B')], label: 'Corporate income tax (State)', sub: '19%', glyph: 'factory',
  }),
  inst({
    id: 'pl-winnings-tax', parent: 'panstwo', level: 'panstwo', family: 'income-personal', group: 'state', keys: ['D51D:C01'],
    official: 'Tax on winnings in contests, games and mutual bets', native: 'Podatek od wygranych w konkursach, grach i zakładach wzajemnych', common: 'Tax on winnings',
    base: 'Prizes and winnings.',
    payer: 'Winners; the organiser withholds.',
    rate: { kind: 'varies', headline: 'Set by the Personal Income Tax Act', details: [] },
    explanation: 'PLN 279 million.',
    exceptions: [], refs: [ref(NTL, 'sheet PL, D51D C01')], label: 'Tax on winnings', sub: 'Games', glyph: 'dice',
  }),
  /* ---- the State: social contributions ---- */
  inst({
    id: 'pl-social-employers', parent: 'panstwo', level: 'panstwo', category: 'social-contribution', family: 'social-security', group: 'socialer', keys: ['D611:C01'],
    official: 'Employers’ compulsory social security contributions', native: 'Składki na ubezpieczenia społeczne płacone przez pracodawców', common: 'Employers’ contributions',
    base: 'Gross pay. The list splits it into pension contributions (PLN 147.7 billion) and others (PLN 30.4 billion).',
    payer: 'Employers.',
    rate: { kind: 'flat', headline: 'Set by the Social Insurance System Act', details: ['The rates are not extracted here.'] },
    explanation: 'Collected by the Social Insurance Institution (ZUS).',
    exceptions: [], refs: [ref(NTL, 'sheet PL, D611')], label: 'Social: employers', sub: 'ZUS', glyph: 'heart',
  }),
  inst({
    id: 'pl-social-households', parent: 'panstwo', level: 'panstwo', category: 'social-contribution', family: 'social-security', group: 'socialhh', keys: ['D613CE:C01', 'D613CS:C01', 'D613V:C01'],
    official: 'Compulsory social security contributions of employees and of the self-employed, and voluntary contributions', native: 'Składki na ubezpieczenia społeczne płacone przez gospodarstwa domowe', common: 'Employees’ and self-employed contributions',
    base: 'Gross pay (employees, PLN 230.3 billion) and the income of the self-employed (PLN 111.5 billion); voluntary contributions PLN 0.06 billion.',
    payer: 'Employees and the self-employed.',
    rate: { kind: 'flat', headline: 'Set by the Social Insurance System Act and the Act on health care benefits', details: ['The rates are not extracted here.'] },
    explanation: 'Pension, disability, sickness and health insurance contributions, collected by ZUS and KRUS.',
    exceptions: [], refs: [ref(NTL, 'sheet PL, D613CE, D613CS, D613V')], label: 'Social: households', sub: 'Employees · self-employed', glyph: 'heart',
  }),
  /* ---- the State: consumption ---- */
  inst({
    id: 'pl-vat', parent: 'panstwo', level: 'panstwo', family: 'general-consumption', group: 'state', keys: ['D211:C01'],
    official: 'Value added tax', native: 'Podatek od towarów i usług (VAT)', common: 'VAT', abbr: 'VAT',
    base: 'Goods and services supplied in Poland, intra-EU acquisitions and imports.',
    payer: 'Consumers; businesses charge it and claim input credits.',
    rate: { kind: 'range', headline: '23% standard; 8% and 5% reduced', details: ['23%, 8%, 5%, 0% and exemption (PwC).', PWC_NOTE] },
    explanation: 'The largest tax: PLN 290.7 billion.',
    exceptions: [], refs: [ref(PWC_OTH, 'Value-added tax')], label: 'VAT', sub: '23%', glyph: 'cart',
  }),
  inst({
    id: 'pl-customs', parent: 'panstwo', level: 'panstwo', category: 'customs-duty', family: 'trade', group: 'state', keys: ['D2121:C01'],
    official: 'Import duties', native: 'Opłaty celne', common: 'Customs duties',
    base: 'Goods imported from outside the EU, by the Common Customs Tariff.',
    payer: 'Importers.',
    rate: { kind: 'varies', headline: 'EU Common Customs Tariff', details: ['An EU own resource; Eurostat records it under the EU institutions.'] },
    explanation: 'Collected for the EU budget.',
    exceptions: [], refs: [ref(EUS, 'S.212, D212')], label: 'Customs duties', sub: 'EU tariff', glyph: 'ship',
  }),
  inst({
    id: 'pl-excise-fuel', parent: 'panstwo', level: 'panstwo', family: 'specific-consumption', group: 'state', keys: ['D214A:C01', 'D2122C:C01', 'D214A:C15', 'D2122C:C16'],
    official: 'Excise duty on petrol and other motor fuels, and the fuel fee', native: 'Podatek akcyzowy od paliw silnikowych; opłata paliwowa', common: 'Fuel excise and fuel fee',
    base: 'Motor fuels by quantity (PLN 35.3 billion domestic and 1.5 billion on imports) and the fuel fee (PLN 11.7 billion and 0.5 billion).',
    payer: 'Fuel producers and importers; passed on at the pump.',
    rate: { kind: 'specific', headline: 'Per 1,000 litres, fixed by the Excise Duty Act', details: [] },
    explanation: 'The biggest excise.',
    exceptions: [], refs: [ref(NTL, 'sheet PL, D214A C01 and C15, D2122C C01 and C16')], label: 'Fuel excise and fee', sub: 'Motor fuels', glyph: 'flame',
  }),
  inst({
    id: 'pl-excise-tobacco', parent: 'panstwo', level: 'panstwo', family: 'specific-consumption', group: 'state', keys: ['D214A:C03', 'D2122C:C03', 'D214A:C13', 'D214A:C19', 'D2122C:C17', 'D214A:C20', 'D2122C:C18'],
    official: 'Excise duty on tobacco products, dried tobacco, e-cigarette liquid and novel products', native: 'Podatek akcyzowy od wyrobów tytoniowych, suszu tytoniowego, płynu do e-papierosów i wyrobów nowatorskich', common: 'Tobacco excise',
    base: 'Cigarettes and other tobacco products (PLN 30.7 billion), e-cigarette liquid (0.6 billion), novel products (1.3 billion) and dried tobacco leaf.',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'mechanism', headline: 'Fixed by the Excise Duty Act', details: [] },
    explanation: 'PLN 32.6 billion in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet PL, D214A C03, C13, C19, C20, D2122C C03, C17, C18')], label: 'Tobacco excise', sub: 'Cigarettes · e-liquid', glyph: 'smoke',
  }),
  inst({
    id: 'pl-excise-alcohol', parent: 'panstwo', level: 'panstwo', family: 'specific-consumption', group: 'state', keys: ['D214A:C02', 'D2122C:C02', 'D214A:C04', 'D2122C:C04', 'D214A:C05', 'D2122C:C05'],
    official: 'Excise duty on spirits, beer, and wine and other fermented drinks', native: 'Podatek akcyzowy od alkoholu etylowego, piwa i wina', common: 'Alcohol excise',
    base: 'Spirits (PLN 9.7 billion), beer (3.5 billion), wine, other fermented beverages and intermediate products (0.3 billion).',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'specific', headline: 'Per litre of pure alcohol or of product', details: [] },
    explanation: 'Six lines.',
    exceptions: [], refs: [ref(NTL, 'sheet PL, D214A C02, C04, C05, D2122C C02, C04, C05')], label: 'Alcohol excise', sub: 'Spirits · beer · wine', glyph: 'wine',
  }),
  inst({
    id: 'pl-excise-cars', parent: 'panstwo', level: 'panstwo', family: 'specific-consumption', group: 'state', keys: ['D2122C:C07', 'D214A:C07'],
    official: 'Excise duty on passenger cars', native: 'Podatek akcyzowy od samochodów osobowych', common: 'Car excise',
    base: 'Passenger cars on first registration in Poland, including imported used cars.',
    payer: 'Buyers and importers of cars.',
    rate: { kind: 'varies', headline: 'By engine capacity and emissions', details: ['PLN 4.5 billion in 2024, up from PLN 3.6 billion; almost all of it is booked on imports.'] },
    explanation: 'A vehicle tax paid once, at registration.',
    exceptions: [], refs: [ref(NTL, 'sheet PL, D2122C C07, D214A C07')], label: 'Car excise', sub: 'Registration', glyph: 'car',
  }),
  inst({
    id: 'pl-excise-energy', parent: 'panstwo', level: 'panstwo', family: 'specific-consumption', group: 'state', keys: ['D214A:C06', 'D2122C:C06', 'D214A:C08', 'D2122C:C08', 'D214A:C09', 'D2122C:C09', 'D214A:C11', 'D2122C:C12', 'D214A:C12', 'D2122C:C13', 'D214A:C14'],
    official: 'Excise duty on electricity, fuel oils, gas, lubricants, coal products and gas products', native: 'Podatek akcyzowy od energii elektrycznej, olejów opałowych, gazu, olejów smarowych i wyrobów węglowych', common: 'Other energy excises',
    base: 'Gas for engines (PLN 0.9 billion), electricity (PLN 0.6 billion), lubricants (0.4 billion), fuel oils, coal products and gas products.',
    payer: 'Suppliers; passed on in the price.',
    rate: { kind: 'specific', headline: 'Per unit of energy', details: [] },
    explanation: 'Eleven lines of the list.',
    exceptions: [], refs: [ref(NTL, 'sheet PL, D214A C06, C08, C09, C11, C12, C14, D2122C C06, C08, C09, C12, C13')], label: 'Other energy excises', sub: 'Electricity · gas', glyph: 'bolt',
  }),
  inst({
    id: 'pl-energy-fees', parent: 'panstwo', level: 'panstwo', category: 'special-levy', family: 'specific-consumption', group: 'state', keys: ['D214A:C22', 'D214A:C18', 'D214A:C17', 'D214A:C16', 'D29F:C06'],
    official: 'Power fee, emission fee, cogeneration fee, transitional fee and substitute fee', native: 'Opłata mocowa; opłata emisyjna; opłata kogeneracyjna; opłata przejściowa; opłata zastępcza', common: 'Energy-sector fees',
    base: 'Compulsory fees on electricity consumers, named in the list: the power (capacity market) fee PLN 6.9 billion, the emission fee 2.3 billion, the cogeneration fee 0.8 billion, the transitional fee 0.2 billion and the substitute fee 0.1 billion.',
    payer: 'Electricity consumers.',
    rate: { kind: 'varies', headline: 'Set by regulation', details: [] },
    explanation: 'Booked by the statisticians as taxes on products.',
    exceptions: [], refs: [ref(NTL, 'sheet PL, D214A C16 to C18 and C22, D29F C06')], label: 'Energy-sector fees', sub: 'Power · cogeneration', glyph: 'bolt',
  }),
  inst({
    id: 'pl-price-fund-write-offs', parent: 'panstwo', level: 'panstwo', category: 'special-levy', family: 'other', group: 'state', keys: ['D29H:C15', 'D29H:C16'],
    official: 'Gas and electricity write-offs to the Price Difference Payment Fund', native: 'Odpis gazowy i elektryczny – Fundusz Wypłaty Różnicy Cen', common: 'Price Difference Payment Fund write-offs',
    base: 'As named in the National Tax List: write-offs for gas (PLN 15.4 billion) and electricity (PLN 0.7 billion) to the Fund; no further detail.',
    payer: 'Energy companies, as the list names it a write-off.',
    rate: { kind: 'varies', headline: 'Set by the law on the Fund', details: ['The electricity line fell from PLN 16.2 billion in 2023 to PLN 0.7 billion in 2024 as the price caps ended.'] },
    explanation: 'Compulsory payments that financed the energy price caps.',
    exceptions: [], refs: [ref(NTL, 'sheet PL, D29H C15 and C16')], label: 'Price Fund write-offs', sub: 'Gas · electricity', glyph: 'oil',
  }),
  inst({
    id: 'pl-retail-tax', parent: 'panstwo', level: 'panstwo', family: 'general-consumption', group: 'state', keys: ['D214I:C01'],
    official: 'Retail sales tax', native: 'Podatek od sprzedaży detalicznej', common: 'Retail tax',
    base: 'Retail sales above a threshold.',
    payer: 'Retailers.',
    rate: { kind: 'varies', headline: 'Set by the Retail Tax Act', details: [] },
    explanation: 'PLN 4.4 billion in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet PL, D214I C01')], label: 'Retail tax', sub: 'Retailers', glyph: 'cart',
  }),
  inst({
    id: 'pl-gambling', parent: 'panstwo', level: 'panstwo', family: 'specific-consumption', group: 'state', keys: ['D214F:C01', 'D214L:C01'],
    official: 'Tax on games and the extra charges on stakes in State-monopoly games', native: 'Podatek od gier; dopłaty do stawek w grach losowych', common: 'Gambling tax and charges',
    base: 'Gambling operators (PLN 5.2 billion) and stakes in the games of the State monopoly (PLN 1.6 billion).',
    payer: 'Operators.',
    rate: { kind: 'varies', headline: 'Set by the Gambling Act', details: [] },
    explanation: 'Two lines.',
    exceptions: [], refs: [ref(NTL, 'sheet PL, D214F C01, D214L C01')], label: 'Gambling', sub: 'Games · lotteries', glyph: 'dice',
  }),
  inst({
    id: 'pl-food-levy', parent: 'panstwo', level: 'panstwo', category: 'special-levy', family: 'specific-consumption', group: 'state', keys: ['D214L:C04', 'D214L:C03'],
    official: 'Levy on foodstuffs and legal fees paid to State funds', native: 'Opłata od środków spożywczych; wpływy państwowych funduszy', common: 'Food levy',
    base: 'As named in the National Tax List: the levy on foodstuffs (PLN 1.5 billion) and receipts of State funds from statutory fees (PLN 25 million).',
    payer: 'Producers and sellers of the foodstuffs covered.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Two small lines.',
    exceptions: [], refs: [ref(NTL, 'sheet PL, D214L C03 and C04')], label: 'Food levy', sub: 'Foodstuffs', glyph: 'wheat',
  }),
  /* ---- the State: payroll-type and sector levies ---- */
  inst({
    id: 'pl-payroll-funds', parent: 'panstwo', level: 'panstwo', family: 'payroll', group: 'state', keys: ['D29C:C01', 'D29C:C02', 'D29C:C03'],
    official: 'Employers’ compulsory payments to the PFRON, the Guaranteed Employee Benefits Fund and the Solidarity Fund', native: 'Wpłaty pracodawców na PFRON, FGŚP i Fundusz Solidarnościowy', common: 'Employers’ payments to funds',
    base: 'The wage bill: PFRON (disabled persons’ rehabilitation fund) PLN 7.5 billion, the Solidarity Fund PLN 13.8 billion and the Guaranteed Employee Benefits Fund PLN 0.7 billion.',
    payer: 'Employers.',
    rate: { kind: 'varies', headline: 'Set by the laws of the funds', details: [] },
    explanation: 'Payroll-based contributions that the list books apart from the social security contributions.',
    exceptions: [], refs: [ref(NTL, 'sheet PL, D29C')], label: 'Employers’ fund payments', sub: 'PFRON · Solidarity Fund', glyph: 'scroll',
  }),
  inst({
    id: 'pl-financial-sector', parent: 'panstwo', level: 'panstwo', category: 'special-levy', family: 'other', group: 'state', keys: ['D29H:C10', 'D29E:C04', 'D29E:C05', 'D29E:C07', 'D29E:C09'],
    official: 'Tax on certain financial institutions and the obligatory payments to guarantee funds', native: 'Podatek od niektórych instytucji finansowych; wpłaty do Bankowego Funduszu Gwarancyjnego i innych funduszy', common: 'Financial-sector levies',
    base: 'The tax on certain financial institutions (PLN 6.5 billion), the Bank Guarantee Fund (PLN 1.6 billion), the Insurance Guarantee Fund (0.2 billion), the Polish Motor Insurers’ Bureau (0.05 billion) and the fire services (0.04 billion).',
    payer: 'Banks, insurers and other financial institutions.',
    rate: { kind: 'varies', headline: 'Set by law', details: ['Corporate income tax on banks rises to 23% from 2026 (PwC).'] },
    explanation: 'Five lines.',
    exceptions: [], refs: [ref(NTL, 'sheet PL, D29H C10, D29E C04, C05, C07, C09')], label: 'Financial-sector levies', sub: 'Banks · insurers', glyph: 'bank',
  }),
  inst({
    id: 'pl-environmental', parent: 'panstwo', level: 'panstwo', category: 'fee', family: 'resource', group: 'state', keys: ['D29F:C01', 'D29F:C03', 'D29H:C12'],
    official: 'Levies for the use of the environment, plastic bag fees and fees for ozone-depleting substances', native: 'Opłaty za korzystanie ze środowiska; opłaty za torby z tworzywa sztucznego', common: 'Environmental levies',
    base: 'Use of the environment (PLN 1.6 billion), plastic shopping bags (PLN 0.2 billion) and ozone-depleting substances.',
    payer: 'Polluters and sellers of plastic bags.',
    rate: { kind: 'varies', headline: 'Set by the Environmental Protection Law', details: ['The sale of emission allowances (PLN 18.3 billion plus PLN 6.1 billion for the Indirect Emission Costs Compensation Fund) is not counted. Eurostat books PLN 0.9 billion of these levies with local government; the list does not say which lines.'] },
    explanation: 'Three lines.',
    exceptions: [], refs: [ref(NTL, 'sheet PL, D29F C01 and C03, D29H C12')], label: 'Environmental levies', sub: 'Pollution · bags', glyph: 'leaf',
  }),
  inst({
    id: 'pl-licences-and-funds', parent: 'panstwo', level: 'panstwo', category: 'fee', family: 'other', group: 'state', keys: ['D29E:C02', 'D29E:C03', 'D29E:C06', 'D29E:C08', 'D59D:C03', 'D29E:C10', 'D29E:C11', 'D29H:C01', 'D29H:C04', 'D29H:C05', 'D29H:C09', 'D29H:C13', 'D29H:C14', 'D59D:C04', 'D59D:C05', 'D214B:C02', 'D91A:C02'],
    official: 'Licence and concession fees, public broadcasting fee, fees to State funds and agencies, and smaller levies', native: 'Opłaty koncesyjne, abonament, wpłaty na fundusze i agencje', common: 'Licences, fees to funds and others',
    base: 'Environmental fund fees (PLN 1.2 billion), frequency rights (0.3 and 0.05 billion), energy regulator concessions (0.3 billion), public broadcasting (0.4 and 0.2 billion), the Film Art Institute (0.4 billion), tourism organisers (0.2 billion), the Developer Guarantee Fund (0.1 billion), driving licences (0.1 billion), and other small lines including the part of the wholesale alcohol permit fee (0.6 billion).',
    payer: 'Businesses and individuals.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Seventeen lines that the list codes as taxes.',
    exceptions: [], refs: [ref(NTL, 'sheet PL, D29E, D29H, D59D, D214B C02, D91A C02')], label: 'Licences and fund fees', sub: 'Concessions · funds', glyph: 'stamp',
  }),
  /* ---- local government ---- */
  {
    id: 'pl-pit-local', parent: 'jst', level: 'jst', family: 'income-personal',
    official: 'Personal income tax (PIT), local government share', native: 'Podatek dochodowy od osób fizycznych (część jednostek samorządu terytorialnego)', common: 'Personal income tax: local share',
    base: 'The same income as the State’s share: wages, business income, benefits, capital gains.',
    payer: 'Individuals; employers and payers withhold it.',
    rate: { kind: 'progressive', headline: 'Same rates as the State’s share', details: ['Eurostat’s accounts record this part under local government (S.1313).'] },
    explanation: 'More than half of the personal income tax goes to local governments (municipalities, counties and voivodeships), which makes it their main revenue. The rates are set by Parliament; local governments do not choose them.',
    exceptions: [], refs: [ref(EUS, 'S.1313, D51A')], label: 'Personal income tax (local)', sub: 'Share of PIT', glyph: 'person',
    rev: { group: 'localpit', amount: pitLocal, locator: 'Eurostat gov_10a_taxag, 2024: S.1313 local government, D51A taxes on individual or household income, PLN million', caveat: `Eurostat July 2026 vintage; it agrees with the National Tax List on the total of PLN ${n.fmt(pitTotal)} million.` },
  },
  {
    id: 'pl-cit-local', parent: 'jst', level: 'jst', family: 'income-corporate',
    official: 'Corporate income tax (CIT), local government share', native: 'Podatek dochodowy od osób prawnych (część jednostek samorządu terytorialnego)', common: 'Corporate income tax: local share',
    base: 'The same profit as the State’s share.',
    payer: 'Companies.',
    rate: { kind: 'flat', headline: 'Same rate as the State’s share', details: ['Eurostat’s accounts record this part under local government (S.1313).'] },
    explanation: 'About 30% of the corporate income tax goes to local governments.',
    exceptions: [], refs: [ref(EUS, 'S.1313, D51B')], label: 'Corporate income tax (local)', sub: 'Share of CIT', glyph: 'factory',
    rev: { group: 'localcit', amount: citLocal, locator: 'Eurostat gov_10a_taxag, 2024: S.1313 local government, D51B taxes on the income of corporations, PLN million', caveat: `Eurostat July 2026 vintage; it agrees with the National Tax List on the total of PLN ${n.fmt(citTotal)} million.` },
  },
  inst({
    id: 'pl-property-tax', parent: 'jst', level: 'jst', family: 'property', group: 'localprop', keys: ['D29A:C01', 'D59A:C01', 'D59A:C02', 'D59A:C03'],
    official: 'Real estate tax (businesses and households), agricultural tax and forest tax', native: 'Podatek od nieruchomości; podatek rolny; podatek leśny', common: 'Property taxes',
    base: 'Land, buildings and structures (businesses PLN 26.0 billion, households PLN 8.9 billion), agricultural land (PLN 2.2 billion) and forests (PLN 0.5 billion).',
    payer: 'Owners.',
    rate: { kind: 'range', headline: 'Set by each municipality up to a statutory ceiling', details: ['The list does not give rates.'] },
    explanation: 'The local governments’ main own tax.',
    exceptions: [], refs: [ref(NTL, 'sheet PL, D29A C01, D59A C01 to C03'), ref(EUS, 'S.1313, D29A and D59A')], label: 'Property taxes', sub: 'Real estate · agricultural', glyph: 'house',
  }),
  inst({
    id: 'pl-civil-law-transactions', parent: 'jst', level: 'jst', family: 'property', group: 'local', keys: ['D214C:C01'],
    official: 'Tax on civil-law transactions', native: 'Podatek od czynności cywilnoprawnych', common: 'Civil-law transactions tax',
    base: 'Sales and exchanges of property and loans between individuals, and other civil-law transactions.',
    payer: 'Parties to the transaction.',
    rate: { kind: 'varies', headline: 'By type of transaction', details: ['PLN 4.1 billion in 2024; Eurostat books it all under local government.'] },
    explanation: 'The tax on transfers of property and similar deals.',
    exceptions: [], refs: [ref(NTL, 'sheet PL, D214C C01'), ref(EUS, 'S.1313, D214C')], label: 'Civil-law transactions tax', sub: 'Transfers', glyph: 'stamp',
  }),
  inst({
    id: 'pl-vehicle-transport', parent: 'jst', level: 'jst', family: 'specific-consumption', group: 'local', keys: ['D29B:C01', 'D214D:C01'],
    official: 'Tax on means of transport and the transportation levy', native: 'Podatek od środków transportu; opłata komunikacyjna', common: 'Transport taxes',
    base: 'Commercial vehicles (PLN 1.5 billion) and the transportation levy (PLN 0.8 billion).',
    payer: 'Owners of commercial vehicles.',
    rate: { kind: 'varies', headline: 'Set by each municipality up to a ceiling', details: [] },
    explanation: 'Two local lines.',
    exceptions: [], refs: [ref(NTL, 'sheet PL, D29B C01, D214D C01')], label: 'Transport taxes', sub: 'Local', glyph: 'car',
  }),
  inst({
    id: 'pl-alcohol-permits', parent: 'jst', level: 'jst', category: 'fee', family: 'other', group: 'local', keys: ['D29E:C01'],
    official: 'Fees for permits to sell alcohol', native: 'Opłaty za zezwolenia na sprzedaż alkoholu', common: 'Alcohol sales permit fees',
    base: 'Permits for retail and catering sale of alcohol.',
    payer: 'Sellers of alcohol.',
    rate: { kind: 'varies', headline: 'Set by the Act on upbringing in sobriety', details: ['PLN 1.3 billion; Eurostat books it under local government.'] },
    explanation: 'A fee that municipalities collect.',
    exceptions: [], refs: [ref(NTL, 'sheet PL, D29E C01'), ref(EUS, 'S.1313, D29E')], label: 'Alcohol permit fees', sub: 'Local', glyph: 'wine',
  }),
  inst({
    id: 'pl-stamp-inheritance', parent: 'jst', level: 'jst', family: 'property', group: 'local', keys: ['D214B:C01', 'D91A:C01'],
    official: 'Stamp duty and the tax on inheritance and gifts', native: 'Opłata skarbowa; podatek od spadków i darowizn', common: 'Stamp duty and inheritance tax',
    base: 'Official acts and documents (PLN 0.7 billion) and inherited or donated property (PLN 0.6 billion).',
    payer: 'Applicants, heirs and donees.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Eurostat books both under local government.',
    exceptions: [], refs: [ref(NTL, 'sheet PL, D214B C01, D91A C01'), ref(EUS, 'S.1313, D214B and D91')], label: 'Stamp and inheritance', sub: 'Local', glyph: 'stamp',
  }),
  inst({
    id: 'pl-local-fees', parent: 'jst', level: 'jst', category: 'fee', family: 'other', group: 'local', keys: ['D59F:C02', 'D59D:C01', 'D59D:C02', 'D59F:C01', 'D29H:C07', 'D29H:C02'],
    official: 'Local levies: other levies of local governments, location levy, health resort fee, dog tax, tree removal and product fees', native: 'Opłaty lokalne; opłata miejscowa; opłata uzdrowiskowa; podatek od posiadania psów', common: 'Local levies',
    base: 'Other local levies under separate acts (PLN 1.4 billion), the location levy (PLN 76 million), the health resort fee (PLN 125 million), the dog tax (PLN 4 million), fees for removing trees and shrubs (PLN 67 million) and the product fee (PLN 4 million).',
    payer: 'Residents, visitors and businesses.',
    rate: { kind: 'varies', headline: 'Set by each local government', details: [] },
    explanation: 'Six small lines.',
    exceptions: [], refs: [ref(NTL, 'sheet PL, D59F, D59D C01 and C02, D29H C02 and C07')], label: 'Local levies', sub: 'Resort · dogs · other', glyph: 'town',
  }),
];
// the State's corporate tax row needs the computed amount (its list of lines is the whole tax, less the local part)
const citRow = instruments.find((i) => i.id === 'pl-cit-state')!;
citRow.rev = { group: 'state', amount: citState, locator: 'NTL 2026, sheet PL, D51O C01 and C02 (corporation income tax and solidarity contribution), 2024, less the local part from Eurostat gov_10a_taxag (S.1313, D51B)', calculation: `${n.fmt(citTotal)} − ${n.fmt(citLocal)} = ${n.fmt(citState)} (PLN million)`, caveat: `Eurostat’s own State figure is PLN ${n.fmt(sec['S1311:D51B'])} million; the two sources agree on the total.` };

const localD2 = n.sum(['D29A:C01', 'D29B:C01', 'D214D:C01', 'D29E:C01', 'D214B:C01', 'D214C:C01', 'D29H:C07', 'D29H:C02']);
const part = (g: string) => n.round(instruments.filter((i) => i.rev?.group === g).reduce((a, i) => a + i.rev!.amount, 0));
const sectorSum = (code: string) => ['S1311', 'S1312', 'S1313', 'S1314', 'S212'].reduce((a, s) => a + (sec[`${s}:${code}`] ?? 0), 0);
const vintage = ['D2', 'D5', 'D61'].map((c) => `${c}: NTL ${n.fmt(n.total(c))}, Eurostat July 2026 ${n.fmt(sectorSum(c))}`).join('; ');

const spec: CountrySpec = {
  today: D,
  id: 'poland',
  iso3: 'POL',
  isoNumeric: '616',
  names: { en: 'Poland', native: 'Polska', nativeLang: 'pl' },
  currency: { code: 'PLN', symbol: 'zł', name: 'Polish złoty' },
  summary:
    'Poland is a unitary state in which the Sejm sets every tax and the National Revenue Administration collects most of them. Social security contributions are the largest flow, followed by VAT, then the income taxes. Local governments (municipalities, counties and voivodeships) keep more than half of the personal income tax and about a third of the corporate income tax by law, and levy the property taxes and the tax on civil-law transactions.',
  structureNote:
    'The figures are the Commission’s National Tax List for 2024, in PLN million. The personal and corporate income taxes are drawn twice, as the State’s and the local governments’ part, using Eurostat’s split of the same year; the National Tax List and Eurostat agree on the totals. The sale of emission allowances (PLN 24.4 billion in two lines) and the employers’ imputed social contributions (PLN 35.1 billion) are left out. The social contributions are drawn under the State. The fund levies of the energy price caps are among the largest changes between 2023 and 2024.',
  theme: {
    accent: '#dc143c',
    accent2: '#f5f5f5',
    motif: 'topo',
    motifNote: 'Topographic contour lines over the outline of Poland (the generic motif; no bespoke art yet).',
    mapLabel: { lon: 19.4, lat: 52.1 },
  },
  rootLabel: { label: 'Poland', sub: 'Polska · Fiscal folio' },
  levels: [
    {
      id: 'panstwo', branch: 'national', official: 'The State (Republic of Poland)', native: 'Państwo', common: 'State',
      description: 'The Sejm legislates all taxes; the National Revenue Administration collects them, and the Social Insurance Institution (ZUS) and the Agricultural Social Insurance Fund (KRUS) collect the social contributions.',
      fiscalPower: 'Taxes are set by statute; local governments may set rates only within the ceilings that the law fixes.',
      refs: [ref(NTL)], label: 'State', sub: 'Państwo',
    },
    {
      id: 'jst', branch: 'local', official: 'Local government units (municipalities, counties and voivodeships)', native: 'Jednostki samorządu terytorialnego', common: 'Local government',
      description: 'Municipalities (gminy), counties (powiaty) and voivodeships. They keep fixed shares of the personal and corporate income taxes, levy the property taxes and local fees, and receive the proceeds of the tax on civil-law transactions.',
      fiscalPower: 'Municipal councils set the rates of the property tax and of local levies up to the ceilings in the statutes; the shares of the income taxes are fixed by law.',
      refs: [ref(EUS)], label: 'Local government', sub: 'Samorząd',
    },
  ],
  supporting: [],
  denominators: [
    {
      id: 'panstwo-taxes-2024', label: 'State taxes (National Tax List), 2024',
      definition: 'The taxes on production and imports, on income and on capital that the National Tax List books to the State and the EU, other than the local taxes and the sale of emission allowances; includes the State’s part of the two income taxes.',
      levelIds: ['panstwo'], amount: part('state'), period: y, sourceId: NTL,
      locator: 'Sheet PL, 2024, the lines listed with each tax',
      calculation: `Sum of the ${instruments.filter((i) => i.rev?.group === 'state').length} tax rows below (PLN million)`,
      caveat: `Calendar 2024; the list's cut-off was 30 October 2025. Vintage check against Eurostat's July 2026 accounts: ${vintage}.`,
    },
    {
      id: 'panstwo-social-employers-2024', label: 'Social contributions paid by employers, 2024',
      definition: 'The actual compulsory contributions of employers; imputed contributions are left out.',
      levelIds: ['panstwo'], amount: part('socialer'), period: y, sourceId: NTL,
      locator: 'Sheet PL, 2024, subtotal D611',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'panstwo-social-households-2024', label: 'Social contributions paid by households, 2024',
      definition: 'The compulsory contributions of employees and of the self-employed, and voluntary contributions.',
      levelIds: ['panstwo'], amount: part('socialhh'), period: y, sourceId: NTL,
      locator: 'Sheet PL, 2024, lines D613CE, D613CS and D613V',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'jst-pit-2024', label: 'Personal income tax received by local government, 2024',
      definition: 'The part of the personal income tax that Eurostat’s accounts record under local government.',
      levelIds: ['jst'], amount: part('localpit'), period: y, sourceId: EUS,
      locator: 'gov_10a_taxag, 2024, S.1313, D51A, million PLN',
      caveat: 'Eurostat July 2026 vintage, a different release from the National Tax List.',
    },
    {
      id: 'jst-cit-2024', label: 'Corporate income tax received by local government, 2024',
      definition: 'The part of the corporate income tax that Eurostat’s accounts record under local government.',
      levelIds: ['jst'], amount: part('localcit'), period: y, sourceId: EUS,
      locator: 'gov_10a_taxag, 2024, S.1313, D51B, million PLN',
      caveat: 'Eurostat July 2026 vintage, a different release from the National Tax List.',
    },
    {
      id: 'jst-property-2024', label: 'Property taxes of local government, 2024',
      definition: 'The real estate tax, the agricultural tax and the forest tax.',
      levelIds: ['jst'], amount: part('localprop'), period: y, sourceId: NTL,
      locator: 'Sheet PL, 2024, lines D29A C01, D59A C01 to C03',
      caveat: `Eurostat books PLN ${n.fmt(sec['S1313:D29A'])} million of land and building taxes and PLN ${n.fmt(sec['S1313:D59A'])} million of other wealth taxes to local government, which are the same lines.`,
    },
    {
      id: 'jst-other-2024', label: 'Other taxes and fees of local government, 2024',
      definition: 'The tax on civil-law transactions, the transport taxes, the alcohol permit fees, the stamp duty, the inheritance tax and the local levies.',
      levelIds: ['jst'], amount: part('local'), period: y, sourceId: NTL,
      locator: 'Sheet PL, 2024, the lines listed with each tax',
      calculation: 'Sum of the local rows below (PLN million)',
      caveat: `Eurostat books PLN ${n.fmt(sec['S1313:D2'])} million of taxes on production (D2) to local government; the lines of that class drawn for local government (the real estate tax of businesses in the property part and the lines in this part) come to PLN ${n.fmt(localD2)} million. The difference is mostly the PLN ${n.fmt(sec['S1313:D29F'])} million of environmental levies and part of the stamp duty, which the list does not assign by line; they stay under the State.`,
    },
  ],
  sizing: {
    label: 'Taxes and compulsory social contributions of all levels of government',
    definition: 'The taxes of the State and of local government plus the actual social contributions, calendar 2024, as listed in the National Tax List and split by Eurostat. Excludes the sale of emission allowances and imputed social contributions.',
    componentIds: ['panstwo-taxes-2024', 'panstwo-social-employers-2024', 'panstwo-social-households-2024', 'jst-pit-2024', 'jst-cit-2024', 'jst-property-2024', 'jst-other-2024'],
  },
  fromProfile: 'poland',
  structureOverride: {
    basis: 'OECD attribution to sub-sectors of general government (Interpretative Guide, section A.12)',
    folioLevels: { central: ['panstwo'], local: ['jst'] },
    levelNotes: { central: 'The OECD shows the social security funds separately; the folio draws their contributions under the State.' },
  },
  groups: {
    state: { title: 'State taxes 2024 – National Tax List (PLN million)', denominatorId: 'panstwo-taxes-2024', period: y, basis: 'ESA tax revenue, general government and EU institutions', sourceId: NTL },
    socialer: { title: 'Employers’ social contributions 2024 – National Tax List (PLN million)', denominatorId: 'panstwo-social-employers-2024', period: y, basis: 'Actual compulsory contributions (subtotal)', sourceId: NTL },
    socialhh: { title: 'Households’ social contributions 2024 – National Tax List (PLN million)', denominatorId: 'panstwo-social-households-2024', period: y, basis: 'Compulsory and voluntary contributions', sourceId: NTL },
    localpit: { title: 'Local share of the personal income tax 2024 – Eurostat (PLN million)', denominatorId: 'jst-pit-2024', period: y, basis: 'ESA taxes received by local government', sourceId: EUS },
    localcit: { title: 'Local share of the corporate income tax 2024 – Eurostat (PLN million)', denominatorId: 'jst-cit-2024', period: y, basis: 'ESA taxes received by local government', sourceId: EUS },
    localprop: { title: 'Property taxes 2024 – National Tax List (PLN million)', denominatorId: 'jst-property-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
    local: { title: 'Other local taxes 2024 – National Tax List (PLN million)', denominatorId: 'jst-other-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
  },
  sources: [
    { id: NTL, org: 'European Commission, DG Taxation and Customs Union, with Eurostat', title: 'Data on Taxation Trends: National Tax Lists (NTL), edition 2026', url: 'https://taxation-customs.ec.europa.eu/taxation/economic-analysis/data-taxation-trends_en', kind: 'statistics', language: 'en', publishedDate: '2026-03-31', periodCovered: 'Calendar year 2024 (series from 1995)', accessed: D, nextExpected: '2027-03', note: 'Workbook "NTL edition 2026 web.xlsx", sheet PL: every tax and social contribution by its national name and ESA code, in PLN million. Data cut-off 30 October 2025.' },
    { id: EUS, org: 'Eurostat', title: 'Main national accounts tax aggregates (gov_10a_taxag)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table', kind: 'statistics', language: 'en', publishedDate: '2026-07-21', periodCovered: 'Calendar year 2024', accessed: D, nextExpected: '2027-07', note: 'Taxes and social contributions by sub-sector and ESA item; used to split the income taxes between the State (S.1311: PIT PLN 81,722 million, CIT PLN 60,956 million) and local government (S.1313: PIT PLN 101,792 million, CIT PLN 26,519 million) and to check the totals.' },
    { id: PWC_CIT, org: 'PwC', title: 'Worldwide Tax Summaries: Poland – Corporate – Taxes on corporate income', url: 'https://taxsummaries.pwc.com/poland/corporate/taxes-on-corporate-income', kind: 'guidance', language: 'en', publishedDate: '2026-08-11', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary, not an official source: standard CIT 19%, reduced 9% for small taxpayers, 23% for banks from 2026.' },
    { id: PWC_PIT, org: 'PwC', title: 'Worldwide Tax Summaries: Poland – Individual – Taxes on personal income', url: 'https://taxsummaries.pwc.com/poland/individual/taxes-on-personal-income', kind: 'guidance', language: 'en', publishedDate: '2026-08-11', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary: personal income tax 12% up to PLN 120,000 less a deduction of PLN 3,600, then PLN 10,800 plus 32% of the excess.' },
    { id: PWC_OTH, org: 'PwC', title: 'Worldwide Tax Summaries: Poland – Corporate – Other taxes', url: 'https://taxsummaries.pwc.com/poland/corporate/other-taxes', kind: 'guidance', language: 'en', publishedDate: '2026-08-11', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary: VAT 23%, 8%, 5%, 0% and exemption.' },
  ],
  instruments,
};

buildCountry(spec);
n.reconcile(part('state') + part('socialer') + part('socialhh') + part('localpit') + part('localcit') + part('localprop') + part('local'), ['T:D612', 'D29F:C02', 'D29F:C05']);
