/**
 * Iceland: the folio's data. Run: npx tsx scripts/build/iceland.ts
 * Figures: Commission / Eurostat National Tax List (NTL), edition 2026, sheet IS, calendar 2024, ISK million
 * (scripts/build/data/ntl-IS.json); the municipal part of the income tax from Eurostat gov_10a_taxag.
 * Rates: Skatturinn (Iceland Revenue and Customs), "Key rates and amounts 2024".
 */
import { buildCountry, type CountrySpec, type InstSpec, type Ref } from '../lib/build-country';
import { loadNtl, loadSectors } from '../lib/ntl';

const D = '2026-10-12';
const y = { label: '2024', kind: 'calendar-year' as const, start: '2024-01-01', end: '2024-12-31' };
const ref = (id: string, loc?: string): Ref => (loc ? [id, loc] : [id]);
const n = loadNtl('IS', 'ISK');
const sec = loadSectors('IS');
const NTL = 'ntl-2026';
const EUS = 'eurostat-taxag';
const RATES = 'skatturinn-key-rates-2024';
const RATES_IS = 'skatturinn-business-rates-2024';

const inst = (i: Omit<InstSpec, 'rev'> & { keys: string[]; group: string }): InstSpec => {
  const { keys, group, ...rest } = i;
  return { ...rest, rev: n.rev(group, keys) };
};

const pitTotal = n.value('D51A:C01');
const pitLocal = n.round(sec['S1313:D51A']);
const pitState = n.round(pitTotal - pitLocal);

const instruments: InstSpec[] = [
  /* ---- the State ---- */
  {
    id: 'is-income-tax-state', parent: 'rikid', level: 'rikid', family: 'income-personal',
    official: 'Income tax of individuals and withholding tax, State part', native: 'Tekjuskattur einstaklinga og staðgreiðsla (ríkið)', common: 'Personal income tax: State part',
    base: 'Wages, pensions, business income of individuals; withheld by the payer.',
    payer: 'Individuals; employers withhold it.',
    rate: { kind: 'progressive', headline: '31.48% · 37.98% · 46.28% withheld in 2024', details: ['2024 withholding rates by monthly income: 31.48% to ISK 446,136; 37.98% to ISK 1,252,501; 46.28% above. Personal tax credit ISK 64,926 a month.', 'The Revenue’s page lists these as the withholding rates and refers to the municipal tax rates published by the Association of Local Authorities; the State part and the municipal part are collected together.'], asOf: '2024-12-31' },
    explanation: 'The National Tax List gives one income-tax line for individuals (ISK 626 billion); Eurostat’s accounts place ISK 375 billion of it with the municipalities and the rest with the State. This row is the State’s part.',
    exceptions: [], refs: [ref(RATES, 'Individuals: withholding tax 2024'), ref(NTL, 'sheet IS, D51A'), ref(EUS, 'S.1311 and S.1313, D51A')], label: 'Income tax (State)', sub: '31.5–46.3% withheld', glyph: 'person',
    rev: { group: 'state', amount: pitState, locator: 'NTL 2026, sheet IS, D51A Income taxes on individuals, 2024, less the municipal part from Eurostat gov_10a_taxag (S.1313, D51A)', calculation: `${n.fmt(pitTotal)} − ${n.fmt(pitLocal)} = ${n.fmt(pitState)} (ISK million)`, caveat: 'Different vintages of the two sources (NTL cut-off October 2025, Eurostat July 2026); Eurostat’s own State figure is ISK 250,935 million.' },
  },
  inst({
    id: 'is-capital-income-tax', parent: 'rikid', level: 'rikid', family: 'income-personal', group: 'state', keys: ['D51C1:C01'],
    official: 'Capital gains tax of individuals', native: 'Skattur á fjármagnstekjur einstaklinga', common: 'Capital income tax',
    base: 'Interest, dividends, rents and gains from the sale of assets; half of the rent from up to two residential lettings is taxed.',
    payer: 'Individuals.',
    rate: { kind: 'flat', headline: '22%', details: ['22% on all capital gains such as sales profits, dividends and interest; tax-free limit of ISK 300,000 a person on interest and on dividends and gains from listed companies (Skatturinn).'], asOf: '2024-12-31' },
    explanation: 'A flat tax on investment income, separate from the progressive tax on earnings.',
    exceptions: [], refs: [ref(RATES, 'Capital gains tax')], label: 'Capital income tax', sub: '22%', glyph: 'coin',
  }),
  inst({
    id: 'is-corporate-income-tax', parent: 'rikid', level: 'rikid', family: 'income-corporate', group: 'state', keys: ['D51B:C01', 'D51C2:C01'],
    official: 'Income tax of legal persons, including the tax on their capital income', native: 'Tekjuskattur lögaðila', common: 'Corporate income tax',
    base: 'Profit of companies and other legal persons; the list adds the tax on their capital income (ISK 4.0 billion).',
    payer: 'Companies and other legal persons.',
    rate: { kind: 'flat', headline: '21% for companies in 2024; 38.4% for partnerships and estates', details: ['2024: 21% in the general bracket (public and private limited companies and others) and 38.4% in the upper bracket (partnerships, estates, bankruptcy estates) (Skatturinn, Icelandic page).', 'The 21% rate is the one for 2024.'], asOf: '2024-12-31' },
    explanation: 'The corporate tax; revenue was about the same in 2024 as in 2023.',
    exceptions: [], refs: [ref(RATES_IS, 'Tekjuskattur lögaðila')], label: 'Corporate income tax', sub: '21% (2024)', glyph: 'factory',
  }),
  inst({
    id: 'is-financial-income-tax', parent: 'rikid', level: 'rikid', family: 'income-corporate', group: 'state', keys: ['D51B:C02'],
    official: 'Special income tax on financial institutions', native: 'Sérstakur fjársýsluskattur', common: 'Special tax on financial institutions',
    base: 'As named in the National Tax List; no further detail.',
    payer: 'Financial institutions.',
    rate: { kind: 'varies', headline: 'Set by law', details: ['ISK 7.0 billion in 2024 and ISK 6.1 billion in 2023.'] },
    explanation: 'An additional income tax on the financial sector, separate from the general corporate income tax.',
    exceptions: [], refs: [ref(NTL, 'sheet IS, D51B C02')], label: 'Financial income tax', sub: 'Special', glyph: 'bank',
  }),
  inst({
    id: 'is-social-insurance-levy', parent: 'rikid', level: 'rikid', category: 'social-contribution', family: 'social-security', group: 'social', keys: ['D611:C01'],
    official: 'Social insurance levy (general part)', native: 'Tryggingagjald, almennt', common: 'Social insurance levy',
    base: 'Employers’ payroll (wages paid).',
    payer: 'Employers.',
    rate: { kind: 'flat', headline: '6.35% general payroll tax in 2024', details: ['The Revenue gives the general payroll tax (tryggingagjald) as 6.35% in 2022, 2023 and 2024; the National Tax List shows the general part and the unemployment part (atvinnutryggingagjald) as two lines.'], asOf: '2024-12-31' },
    explanation: 'The list shows no social contributions paid by employees to general government; the occupational pension funds are outside it. The employers’ levy is the main social contribution.',
    exceptions: [], refs: [ref(RATES, 'Payroll tax'), ref(NTL, 'sheet IS, D611 C01')], label: 'Social insurance levy', sub: '6.35% of payroll', glyph: 'heart',
  }),
  inst({
    id: 'is-unemployment-levy', parent: 'rikid', level: 'rikid', category: 'social-contribution', family: 'social-security', group: 'social', keys: ['D611:C02'],
    official: 'Unemployment insurance levy', native: 'Atvinnutryggingagjald', common: 'Unemployment insurance levy',
    base: 'Employers’ payroll.',
    payer: 'Employers.',
    rate: { kind: 'flat', headline: 'Part of the payroll levy', details: ['The Revenue’s 6.35% is the general payroll tax; how the National Tax List splits it between the general and the unemployment line is not given on the page.'] },
    explanation: 'The part of the employers’ levy that funds unemployment insurance.',
    exceptions: [], refs: [ref(NTL, 'sheet IS, D611 C02')], label: 'Unemployment levy', sub: 'Payroll', glyph: 'bed',
  }),
  inst({
    id: 'is-social-other', parent: 'rikid', level: 'rikid', category: 'social-contribution', family: 'social-security', group: 'social', keys: ['D611:C03', 'D611:C04', 'D613CS:C01'],
    official: 'Wage-guarantee levy, sailors’ accident insurance levy and the social contributions of the self-employed', native: 'Ábyrgðargjald; slysatryggingaiðgjald sjómanna; tryggingagjöld sjálfstætt starfandi', common: 'Other social contributions',
    base: 'Wages (guarantee levy), sailors’ pay and catch share, and the income of the self-employed.',
    payer: 'Employers, ship owners and the self-employed.',
    rate: { kind: 'varies', headline: 'Set by law', details: ['ISK 1.2 billion wage guarantee levy for bankruptcies, ISK 0.3 billion for sailors and ISK 2.8 billion paid by the self-employed in 2024.'] },
    explanation: 'The smaller social contribution lines.',
    exceptions: [], refs: [ref(NTL, 'sheet IS, D611 C03 and C04, D613CS')], label: 'Other contributions', sub: 'Self-employed · sailors', glyph: 'heart',
  }),
  inst({
    id: 'is-payroll-taxes', parent: 'rikid', level: 'rikid', family: 'payroll', group: 'state', keys: ['D29C:C01', 'D29C:C05', 'D29C:C06'],
    official: 'Market levy, pension-fund insurance levy and payroll tax on financial institutions', native: 'Markaðsgjald; tryggingargjald lífeyrissjóðir; fjársýsluskattur', common: 'Other payroll taxes',
    base: 'Employers’ wage bill: the market levy (ISK 1.2 billion), the insurance levy for pension funds (ISK 6.9 billion) and the payroll tax on financial institutions (ISK 3.8 billion).',
    payer: 'Employers; financial institutions for the payroll tax.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Three payroll-based levies that the National Tax List books apart from the social insurance levy.',
    exceptions: [], refs: [ref(NTL, 'sheet IS, D29C')], label: 'Payroll taxes', sub: 'Market levy · pensions', glyph: 'scroll',
  }),
  inst({
    id: 'is-vat', parent: 'rikid', level: 'rikid', family: 'general-consumption', group: 'state', keys: ['D211:C01'],
    official: 'Value added tax', native: 'Virðisaukaskattur', common: 'VAT', abbr: 'VSK',
    base: 'Goods and services supplied in Iceland and imports.',
    payer: 'Consumers; businesses charge it and claim input credits.',
    rate: { kind: 'range', headline: '24% standard; 11% reduced', details: ['VAT rates 24% and 11% in 2024 (Skatturinn).'], asOf: '2024-12-31' },
    explanation: 'The largest consumption tax and, with the income tax, one of the two big revenue sources of the State.',
    exceptions: [], refs: [ref(RATES, 'Value added tax')], label: 'VAT', sub: '24%', glyph: 'cart',
  }),
  inst({
    id: 'is-customs', parent: 'rikid', level: 'rikid', category: 'customs-duty', family: 'trade', group: 'state', keys: ['D2121:C01'],
    official: 'Import duties (general)', native: 'Tollar', common: 'Customs duties',
    base: 'Imported goods.',
    payer: 'Importers.',
    rate: { kind: 'varies', headline: 'Set by the Customs Act', details: [] },
    explanation: 'Iceland, outside the EU, keeps its own customs revenue.',
    exceptions: [], refs: [ref(NTL, 'sheet IS, D2121')], label: 'Customs duties', sub: 'Imports', glyph: 'ship',
  }),
  inst({
    id: 'is-fuel-energy-excise', parent: 'rikid', level: 'rikid', category: 'tax', family: 'specific-consumption', group: 'state', keys: ['D214A:C03', 'D214A:C04', 'D214A:C05', 'D214A:C07', 'D214A:C10', 'D214A:C11'],
    official: 'Excise duties on petrol and oil, oil (diesel) levy, transport equalisation, electricity and the carbon tax', native: 'Vörugjald af bensíni og olíu; olíugjald; flutningsjöfnunargjald; vörugjald af rafmagni; kolefnisgjald', common: 'Fuel and energy excises and carbon tax',
    base: 'Petrol, diesel and other fuels by volume, electricity, and fossil fuels by their carbon content.',
    payer: 'Fuel importers and producers; passed on at the pump.',
    rate: { kind: 'specific', headline: 'Per litre or per tonne, fixed by law', details: ['ISK 12.5 billion diesel levy, 7.5 billion carbon tax, 7.2 billion specific petrol excise, 4.6 billion petrol and oil excise, 1.4 billion transport equalisation and 0.6 billion on electricity in 2024.'] },
    explanation: 'Six lines of the list that tax energy. The sale of emission allowances (ISK 1.6 billion) is not counted.',
    exceptions: [], refs: [ref(NTL, 'sheet IS, D214A C03 to C07, C10, C11')], label: 'Fuel and carbon excises', sub: 'Petrol · diesel · CO₂', glyph: 'flame',
  }),
  inst({
    id: 'is-excise-alcohol', parent: 'rikid', level: 'rikid', family: 'specific-consumption', group: 'state', keys: ['D214B:C01'],
    official: 'Excise duty on alcohol', native: 'Vörugjöld af áfengi', common: 'Alcohol excise',
    base: 'Alcoholic drinks.',
    payer: 'Importers and producers; passed on in the price.',
    rate: { kind: 'specific', headline: 'Per litre of alcohol, fixed by law', details: [] },
    explanation: 'The third largest of the excise groups drawn, after fuel and energy and vehicles.',
    exceptions: [], refs: [ref(NTL, 'sheet IS, D214B C01')], label: 'Alcohol excise', sub: 'Spirits · wine · beer', glyph: 'wine',
  }),
  inst({
    id: 'is-excise-tobacco', parent: 'rikid', level: 'rikid', family: 'specific-consumption', group: 'state', keys: ['D214B:C02'],
    official: 'Excise duty on tobacco', native: 'Vörugjöld af tóbaki', common: 'Tobacco excise',
    base: 'Tobacco products.',
    payer: 'Importers; passed on in the price.',
    rate: { kind: 'specific', headline: 'Fixed by law', details: [] },
    explanation: 'ISK 4.8 billion in 2024, slightly less than in 2023.',
    exceptions: [], refs: [ref(NTL, 'sheet IS, D214B C02')], label: 'Tobacco excise', sub: 'Cigarettes', glyph: 'smoke',
  }),
  inst({
    id: 'is-vehicle-taxes', parent: 'rikid', level: 'rikid', family: 'specific-consumption', group: 'state', keys: ['D214A:C02', 'D59D:C01', 'D29B:C03', 'D59D:C03', 'D29B:C04'],
    official: 'Vehicle excise, car tax, kilometre fees and ship fees', native: 'Vörugjald af ökutækjum; bifreiðagjöld; kílómetragjald; skipagjöld', common: 'Vehicle taxes',
    base: 'New vehicles (excise), the ownership of cars (car tax), kilometres driven (kilometre fee, introduced for electric cars in 2024), and ships.',
    payer: 'Vehicle owners.',
    rate: { kind: 'varies', headline: 'Set by law', details: ['ISK 12.9 billion car tax, ISK 10.3 billion vehicle excise, ISK 2.6 billion kilometre fee on electric cars, ISK 1.9 billion kilometre fee and ISK 0.8 billion ship fees in 2024.'] },
    explanation: 'The kilometre fee on electric cars is a new line in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet IS, D214A C02, D59D C01 and C03, D29B C03 and C04')], label: 'Vehicle taxes', sub: 'Excise · car tax · km fee', glyph: 'car',
  }),
  inst({
    id: 'is-other-excises', parent: 'rikid', level: 'rikid', family: 'specific-consumption', group: 'state', keys: ['D214A:C06', 'D214A:C01', 'D214A:C08', 'D214A:C09'],
    official: 'Environmental excise duties and other excise duties', native: 'Vörugjöld, umhverfisskattar; vörugjald almennt', common: 'Environmental and other excises',
    base: 'As named in the National Tax List: excise on environmental grounds (ISK 9.3 billion) and three small general and agricultural excise lines that net to about ISK –3 million.',
    payer: 'Importers and producers.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'The list groups the environmental duties with the smaller excise lines.',
    exceptions: [], refs: [ref(NTL, 'sheet IS, D214A C01, C06, C08 and C09')], label: 'Environmental excises', sub: 'Other duties', glyph: 'leaf',
  }),
  inst({
    id: 'is-financial-transactions', parent: 'rikid', level: 'rikid', family: 'property', group: 'state', keys: ['D214C:C01', 'D214C:C02'],
    official: 'Stamp duty and the supervisory fee of the Financial Supervisory Authority', native: 'Stimpilgjald; eftirlitsgjald Fjármálaeftirlits', common: 'Stamp duty and financial supervision fee',
    base: 'Documents such as property deeds and mortgages (stamp duty) and the supervised financial institutions.',
    payer: 'Parties to the transaction; supervised institutions.',
    rate: { kind: 'varies', headline: 'Set by law', details: ['ISK 8.5 billion stamp duty and ISK 3.2 billion supervisory fee in 2024.'] },
    explanation: 'The nearest thing to a property-transaction tax in the State’s list.',
    exceptions: [], refs: [ref(NTL, 'sheet IS, D214C')], label: 'Stamp duty', sub: 'Transactions', glyph: 'stamp',
  }),
  inst({
    id: 'is-poll-taxes', parent: 'rikid', level: 'rikid', category: 'fee', family: 'other', group: 'state', keys: ['D59B:C01', 'D59B:C02'],
    official: 'Broadcasting fee and the Senior Citizens’ Construction Fund fee', native: 'Útvarpsgjald; gjald í Framkvæmdasjóð aldraðra', common: 'Broadcasting and Construction Fund fees',
    base: 'A fixed amount per person above an income threshold.',
    payer: 'Individuals with income above the threshold (about ISK 2.28 million in the 2024 assessment).',
    rate: { kind: 'specific', headline: 'ISK 20,900 broadcasting fee; ISK 13,749 Construction Fund fee', details: ['Amounts in the 2024 assessment; income threshold ISK 2,276,569 (Skatturinn).'], asOf: '2024-12-31' },
    explanation: 'The National Tax List calls them poll taxes: a fixed amount per person rather than a rate on income.',
    exceptions: [], refs: [ref(RATES, 'Broadcasting fee; Senior Citizen’s Construction Fund fee')], label: 'Poll-tax fees', sub: 'Broadcasting · elderly', glyph: 'scroll',
  }),
  inst({
    id: 'is-bank-levies', parent: 'rikid', level: 'rikid', category: 'special-levy', family: 'other', group: 'state', keys: ['D29H:C08', 'D29H:C09'],
    official: 'Bank tax and the levy on credit institutions for the Debtors’ Ombudsman', native: 'Gjald af bankastarfsemi; gjald á lánastofnanir til umboðsmanns skuldara', common: 'Bank levies',
    base: 'As named in the National Tax List: the banking activities (ISK 6.2 billion) and the credit institutions (ISK 0.3 billion); no further detail.',
    payer: 'Banks and credit institutions.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Levies on the financial sector.',
    exceptions: [], refs: [ref(NTL, 'sheet IS, D29H C08 and C09')], label: 'Bank levies', sub: 'Financial sector', glyph: 'bank',
  }),
  inst({
    id: 'is-accommodation-airport', parent: 'rikid', level: 'rikid', category: 'fee', family: 'specific-consumption', group: 'state', keys: ['D214L:C01', 'D214H:C02'],
    official: 'Hotel accommodation tax and the airport fee', native: 'Gistináttagjald; flugvallargjald', common: 'Accommodation tax and airport fee',
    base: 'Nights in accommodation, and passengers using the airports.',
    payer: 'Guests and passengers.',
    rate: { kind: 'varies', headline: 'Set by law', details: ['ISK 2.9 billion accommodation tax and ISK 1.3 billion airport fee in 2024; the list shows no revenue from either in 2023.'] },
    explanation: 'Tourism-related charges.',
    exceptions: [], refs: [ref(NTL, 'sheet IS, D214L C01 and D214H C02')], label: 'Tourism charges', sub: 'Hotel nights · airport', glyph: 'bed',
  }),
  inst({
    id: 'is-inheritance-tax', parent: 'rikid', level: 'rikid', family: 'property', group: 'state', keys: ['D91A:C02'],
    official: 'Inheritance tax', native: 'Erfðafjárskattur', common: 'Inheritance tax',
    base: 'The estate of the deceased, after an exemption.',
    payer: 'Heirs.',
    rate: { kind: 'flat', headline: '10%', details: ['10%; the first ISK 6,203,409 are exempt, regardless of the number of heirs (Skatturinn, Icelandic page).'], asOf: '2024-12-31' },
    explanation: 'The only wealth transfer tax.',
    exceptions: [], refs: [ref(RATES_IS, 'Erfðafjárskattur')], label: 'Inheritance tax', sub: '10%', glyph: 'gem',
  }),
  inst({
    id: 'is-building-fees', parent: 'rikid', level: 'rikid', category: 'fee', family: 'property', group: 'state', keys: ['D29A:C01', 'D29A:C02', 'D29A:C03', 'D29A:C07', 'D29A:C09'],
    official: 'Charges on buildings collected by State bodies: catastrophe prevention, fire protection, valuation, planning', native: 'Forvarnargjald; brunavarnargjald; umsýslugjald; skipulagsgjald; brunabótamatsgjald', common: 'Building charges to State bodies',
    base: 'Buildings and structures, for natural-catastrophe insurance (ISK 6.0 billion), fire protection (ISK 0.9 billion), property valuation (ISK 0.2 billion), planning (ISK 1.5 billion) and fire insurance valuation (ISK 0.4 billion).',
    payer: 'Owners of buildings.',
    rate: { kind: 'varies', headline: 'Set by law', details: ['The list does not say which body receives each charge; they are drawn at the State level as the charges of national agencies. Eurostat books ISK 8.5 billion of the buildings taxes to the State and ISK 91.6 billion to the municipalities; the lines here and in the municipal part differ from that split by ISK 0.4 billion.'] },
    explanation: 'Five lines of the list that charge owners of buildings.',
    exceptions: [], refs: [ref(NTL, 'sheet IS, D29A C01, C02, C03, C07, C09'), ref(EUS, 'S.1311 and S.1313, D29A')], label: 'Building charges', sub: 'Catastrophe · fire', glyph: 'house',
  }),
  inst({
    id: 'is-licences-small', parent: 'rikid', level: 'rikid', category: 'fee', family: 'other', group: 'state', keys: ['D29E:C01', 'D29E:C02', 'D29E:C03', 'D29E:C04', 'D29H:C01', 'D29H:C02', 'D29H:C06', 'D29H:C10', 'D59D:C02', 'D59A:C02', 'D59A:C05'],
    official: 'Licences, registration and monitoring fees, aquaculture fees, wealth taxes and other small taxes', native: 'Leyfisgjöld; skráningargjöld; eftirlitsgjöld; gjald rekstrarleyfishafa sjókvíaeldis', common: 'Licences, monitoring fees and small taxes',
    base: 'Business and professional licences and registration (ISK 1.3 billion), monitoring fees (0.8 billion), other taxes on the use of goods (0.4 billion), aquaculture licence holders (0.4 billion), post and telecom operating fee (0.2 billion), pet licences, and the net wealth tax and corporate capital tax (under ISK 20 million).',
    payer: 'Various.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Eleven small lines of the list, together less than 0.2% of the total.',
    exceptions: [], refs: [ref(NTL, 'sheet IS, D29E, D29H C01, C02, C06, C10, D59D C02, D59A')], label: 'Licences and small taxes', sub: 'Fees', glyph: 'stamp',
  }),
  /* ---- municipalities ---- */
  {
    id: 'is-income-tax-municipal', parent: 'sveitarfelog', level: 'sveitarfelog', family: 'income-personal',
    official: 'Municipal income tax (útsvar) on individuals', native: 'Útsvar', common: 'Municipal income tax',
    base: 'The same income as the State income tax: wages, pensions and other income of residents.',
    payer: 'Individuals; withheld together with the State tax.',
    rate: { kind: 'range', headline: 'Set by each municipality within the legal range', details: ['Skatturinn’s page refers to the list of municipal rates on the Association of Local Authorities’ website (in Icelandic). The brackets of the withholding tax are combined rates.'] },
    explanation: 'About 60% of the income tax of individuals goes to the municipalities, which makes it their main revenue. It is collected by the Revenue with the State tax.',
    exceptions: [], refs: [ref(RATES, 'Individuals: withholding tax 2024'), ref(EUS, 'S.1313, D51A')], label: 'Municipal income tax', sub: 'Útsvar', glyph: 'person',
    rev: { group: 'localpit', amount: pitLocal, locator: 'Eurostat gov_10a_taxag, 2024: S.1313 local government, D51A taxes on individual or household income, ISK million', caveat: 'Eurostat July 2026 vintage; the State’s part in the same source is ISK 250,935 million.' },
  },
  inst({
    id: 'is-property-tax', parent: 'sveitarfelog', level: 'sveitarfelog', family: 'property', group: 'local', keys: ['D29A:C04'],
    official: 'Property tax on buildings (fasteignaskattur)', native: 'Fasteignaskattur', common: 'Property tax',
    base: 'The assessed value of land and buildings.',
    payer: 'Property owners.',
    rate: { kind: 'range', headline: 'Set by each municipality within the legal ceiling', details: ['The list does not give rates.'] },
    explanation: 'The main own tax of the municipalities after the income tax.',
    exceptions: [], refs: [ref(NTL, 'sheet IS, D29A C04')], label: 'Property tax', sub: 'Fasteignaskattur', glyph: 'house',
  }),
  inst({
    id: 'is-municipal-fees', parent: 'sveitarfelog', level: 'sveitarfelog', category: 'fee', family: 'other', group: 'local', keys: ['D29A:C06', 'D29A:C08'],
    official: 'Waste-collection (sanitation) fees and building-permit fees', native: 'Sorphreinsunargjald; byggingarleyfi', common: 'Sanitation and building-permit fees',
    base: 'Waste collection (ISK 8.4 billion) and permits for the construction of buildings (ISK 10.7 billion).',
    payer: 'Property owners and builders.',
    rate: { kind: 'varies', headline: 'Set by each municipality', details: [] },
    explanation: 'Fees that the National Tax List books as taxes on buildings.',
    exceptions: [], refs: [ref(NTL, 'sheet IS, D29A C06 and C08')], label: 'Municipal fees', sub: 'Waste · permits', glyph: 'town',
  }),
  inst({
    id: 'is-road-construction-fee', parent: 'sveitarfelog', level: 'sveitarfelog', category: 'fee', family: 'property', group: 'local', keys: ['D91B:C02'],
    official: 'Road construction charge on land and buildings', native: 'Gatnagerðargjöld', common: 'Road construction charge',
    base: 'Plots and buildings, to pay for the street system.',
    payer: 'Builders and owners.',
    rate: { kind: 'varies', headline: 'Set by each municipality', details: ['Eurostat records the capital taxes of ISK 12.8 billion with local government.'] },
    explanation: 'A one-off charge when land is built on, booked as a capital tax.',
    exceptions: [], refs: [ref(NTL, 'sheet IS, D91B C02'), ref(EUS, 'S.1313, D91')], label: 'Road construction charge', sub: 'One-off', glyph: 'town',
  }),
];

const part = (g: string) => n.round(instruments.filter((i) => i.rev?.group === g).reduce((a, i) => a + i.rev!.amount, 0));
const sectorSum = (code: string) => ['S1311', 'S1312', 'S1313', 'S1314', 'S212'].reduce((a, s) => a + (sec[`${s}:${code}`] ?? 0), 0);
const vintage = ['D2', 'D5', 'D61'].map((c) => `${c}: NTL ${n.fmt(n.total(c))}, Eurostat July 2026 ${n.fmt(sectorSum(c))}`).join('; ');

const spec: CountrySpec = {
  today: D,
  id: 'iceland',
  iso3: 'ISL',
  isoNumeric: '352',
  names: { en: 'Iceland', native: 'Ísland', nativeLang: 'is' },
  currency: { code: 'ISK', symbol: 'kr', name: 'Icelandic króna' },
  summary:
    'Iceland is a unitary state with two levels that share the income tax: the Althing sets all taxes and Iceland Revenue and Customs (Skatturinn) collects them, but about 60% of the income tax of individuals goes to the municipalities, which set their own rate within a legal range. Social security is financed by an employers’ payroll levy; there are no employee contributions. VAT, the income taxes and the payroll levy are the three biggest flows.',
  structureNote:
    'The figures are the Commission’s National Tax List for 2024, in ISK million. The income tax of individuals is drawn twice, as the State’s and the municipalities’ part, using Eurostat’s split of the same year. The sale of emission allowances (ISK 1.6 billion) is left out. The social contributions are drawn under the State. Eurostat’s accounts record ISK 8.5 billion of the buildings taxes with the State and ISK 91.6 billion with the municipalities; the lines here differ from that by about ISK 0.4 billion because the list does not say which body receives each charge.',
  theme: {
    accent: '#3a86ff',
    accent2: '#d00000',
    motif: 'topo',
    motifNote: 'Topographic contour lines over the outline of Iceland (the generic motif; no bespoke art yet).',
    mapLabel: { lon: -19.0, lat: 64.9 },
  },
  rootLabel: { label: 'Iceland', sub: 'Ísland · Fiscal folio' },
  levels: [
    {
      id: 'rikid', branch: 'national', official: 'The State (central government)', native: 'Ríkið', common: 'State',
      description: 'The Althing legislates the taxes; Iceland Revenue and Customs (Skatturinn) assesses and collects them, including the social insurance levy.',
      fiscalPower: 'Taxes are set by law passed by the Althing; the municipalities may set only the rates that the law leaves to them.',
      refs: [ref(RATES)], label: 'State', sub: 'Ríkið',
    },
    {
      id: 'sveitarfelog', branch: 'local', official: 'Municipalities', native: 'Sveitarfélög', common: 'Municipalities',
      description: 'The only tier below the State. Each municipality sets its own income tax rate (útsvar) within the range fixed by law, levies the property tax, and charges fees for services such as waste collection and building permits.',
      fiscalPower: 'Municipal councils set the income tax and property tax rates within the legal limits (Act on the Revenue Sources of Municipalities).',
      refs: [ref(RATES)], label: 'Municipalities', sub: 'Sveitarfélög',
    },
  ],
  supporting: [],
  denominators: [
    {
      id: 'rikid-taxes-2024', label: 'State taxes (National Tax List), 2024',
      definition: 'The taxes on production and imports, on income and wealth, and on capital that the National Tax List books to the State, other than the sale of emission allowances; includes the State’s part of the income tax of individuals.',
      levelIds: ['rikid'], amount: part('state'), period: y, sourceId: NTL,
      locator: 'Sheet IS, 2024, the lines listed with each tax',
      calculation: `Sum of the ${instruments.filter((i) => i.rev?.group === 'state').length} tax rows below (ISK million)`,
      caveat: `Calendar 2024; the list's cut-off was 30 October 2025. Vintage check against Eurostat's July 2026 accounts: ${vintage}.`,
    },
    {
      id: 'rikid-social-2024', label: 'Social insurance levy and contributions, 2024',
      definition: 'The employers’ social insurance levy and the contributions of the self-employed; the list shows no imputed contributions for Iceland.',
      levelIds: ['rikid'], amount: part('social'), period: y, sourceId: NTL,
      locator: 'Sheet IS, 2024, lines D611 C01 to C04 and D613CS',
      calculation: 'Sum of the social contribution rows below (ISK million)',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'sveitarfelog-income-tax-2024', label: 'Income tax received by the municipalities, 2024',
      definition: 'The part of the income tax of individuals that Eurostat’s accounts record under local government.',
      levelIds: ['sveitarfelog'], amount: part('localpit'), period: y, sourceId: EUS,
      locator: 'gov_10a_taxag, 2024, S.1313, D51A, million ISK',
      caveat: 'Eurostat July 2026 vintage, a different release from the National Tax List.',
    },
    {
      id: 'sveitarfelog-taxes-2024', label: 'Property taxes and fees of the municipalities, 2024',
      definition: 'The property tax, waste-collection and building-permit fees, and the road construction charge.',
      levelIds: ['sveitarfelog'], amount: part('local'), period: y, sourceId: NTL,
      locator: 'Sheet IS, 2024, lines D29A C04, C06 and C08, D91B C02',
      calculation: 'Sum of the local rows below (ISK million)',
      caveat: `Eurostat books ISK ${n.fmt(sec['S1313:D29A'])} million of buildings taxes and ISK ${n.fmt(sec['S1313:D91'])} million of capital taxes to local government (ISK ${n.fmt(sec['S1313:D29A'] + sec['S1313:D91'])} million in all); the lines drawn here come to ISK ${n.fmt(part('local'))} million, a difference of ${n.fmt(sec['S1313:D29A'] + sec['S1313:D91'] - part('local'))} million that comes from how the list's charges are assigned.`,
    },
  ],
  sizing: {
    label: 'Taxes and compulsory social contributions of all levels of government',
    definition: 'The taxes of the State and the municipalities plus the social insurance levy, calendar 2024, as listed in the National Tax List and split by Eurostat. Excludes the sale of emission allowances.',
    componentIds: ['rikid-taxes-2024', 'rikid-social-2024', 'sveitarfelog-income-tax-2024', 'sveitarfelog-taxes-2024'],
  },
  fromProfile: 'iceland',
  structureOverride: {
    basis: 'OECD attribution to sub-sectors of general government (Interpretative Guide, section A.12)',
    folioLevels: { central: ['rikid'], local: ['sveitarfelog'] },
    levelNotes: { central: 'The OECD shows the social security funds separately; the folio draws the employers’ levy under the State.' },
  },
  groups: {
    state: { title: 'State taxes 2024 – National Tax List (ISK million)', denominatorId: 'rikid-taxes-2024', period: y, basis: 'ESA tax revenue, general government', sourceId: NTL },
    social: { title: 'Social contributions 2024 – National Tax List (ISK million)', denominatorId: 'rikid-social-2024', period: y, basis: 'Actual compulsory contributions', sourceId: NTL },
    localpit: { title: 'Municipal income tax 2024 – Eurostat (ISK million)', denominatorId: 'sveitarfelog-income-tax-2024', period: y, basis: 'ESA taxes received by local government', sourceId: EUS },
    local: { title: 'Municipal taxes and fees 2024 – National Tax List (ISK million)', denominatorId: 'sveitarfelog-taxes-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
  },
  sources: [
    { id: NTL, org: 'European Commission, DG Taxation and Customs Union, with Eurostat', title: 'Data on Taxation Trends: National Tax Lists (NTL), edition 2026', url: 'https://taxation-customs.ec.europa.eu/taxation/economic-analysis/data-taxation-trends_en', kind: 'statistics', language: 'en', publishedDate: '2026-03-31', periodCovered: 'Calendar year 2024 (series from 1995)', accessed: D, nextExpected: '2027-03', note: 'Workbook "NTL edition 2026 web.xlsx", sheet IS: every tax and social contribution by its national name and ESA code, in ISK million. Data cut-off 30 October 2025.' },
    { id: EUS, org: 'Eurostat', title: 'Main national accounts tax aggregates (gov_10a_taxag)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table', kind: 'statistics', language: 'en', publishedDate: '2026-07-21', periodCovered: 'Calendar year 2024', accessed: D, nextExpected: '2027-07', note: 'Taxes and social contributions by sub-sector and ESA item; used to split the income tax between the State (S.1311, ISK 250,935 million) and the municipalities (S.1313, ISK 375,445 million) and to check totals.' },
    { id: RATES, org: 'Skatturinn (Iceland Revenue and Customs)', title: 'Key rates and amounts 2024 (individuals)', url: 'https://www.skatturinn.is/english/individuals/key-rates-and-amounts/2024', kind: 'tax-agency', language: 'en', publishedDate: null, periodCovered: '2024', accessed: D, note: 'Withholding rates 31.48/37.98/46.28%, VAT 24% and 11%, payroll tax 6.35%, capital gains tax 22%, broadcasting fee ISK 20,900 and Senior Citizens’ Construction Fund fee ISK 13,749.' },
    { id: RATES_IS, org: 'Skatturinn (Iceland Revenue and Customs)', title: 'Helstu tölur og prósentur 2024 (key rates and percentages, businesses; in Icelandic)', url: 'https://www.skatturinn.is/atvinnurekstur/helstutolur/2024/', kind: 'tax-agency', language: 'is', publishedDate: null, periodCovered: '2024', accessed: D, note: 'Corporate income tax 21% (general) and 38.4% (upper bracket), inheritance tax 10% with the first ISK 6,203,409 exempt.' },
  ],
  instruments,
};

buildCountry(spec);
n.reconcile(part('state') + part('social') + part('local') + part('localpit'), ['D29F:C01']);
