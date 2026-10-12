/**
 * Sweden: the folio's data. Run: npx tsx scripts/build/sweden.ts
 * Figures: Commission / Eurostat National Tax List (NTL), edition 2026, sheet SE, calendar 2024, SEK million
 * (scripts/build/data/ntl-SE.json). The personal income tax is split between the State and the municipalities
 * and regions with Eurostat gov_10a_taxag (S.1313, D51A).
 * Rates: PwC Worldwide Tax Summaries (reviews of August and September 2026), a professional-firm summary.
 */
import { buildCountry, type CountrySpec, type InstSpec, type Ref } from '../lib/build-country';
import { loadNtl, loadSectors } from '../lib/ntl';

const D = '2026-10-12';
const y = { label: '2024', kind: 'calendar-year' as const, start: '2024-01-01', end: '2024-12-31' };
const ref = (id: string, loc?: string): Ref => (loc ? [id, loc] : [id]);
const n = loadNtl('SE', 'SEK');
const sec = loadSectors('SE');
const NTL = 'ntl-2026';
const EUS = 'eurostat-taxag';
const PWC_CIT = 'pwc-se-corporate';
const PWC_PIT = 'pwc-se-individual';
const PWC_OTH = 'pwc-se-other';
const PWC_NOTE = 'As summarised by PwC (reviews of August and September 2026), not checked against the Swedish Tax Agency (Skatteverket).';

const inst = (i: Omit<InstSpec, 'rev'> & { keys: string[]; group: string }): InstSpec => {
  const { keys, group, ...rest } = i;
  return { ...rest, rev: n.rev(group, keys) };
};

const pitTotal = n.sum(['D51A:C01']);
const pitLocal = n.round(sec['S1313:D51A']);
const pitState = n.round(pitTotal - pitLocal);

const instruments: InstSpec[] = [
  /* ---- the State: income taxes ---- */
  {
    id: 'se-income-tax-state', parent: 'staten', level: 'staten', family: 'income-personal',
    official: 'State income tax on individuals (national income tax and tax on capital income)', native: 'Statlig inkomstskatt och skatt på kapital', common: 'Personal income tax: State part',
    base: 'Earned income above a threshold (national income tax) and capital income (a flat tax).',
    payer: 'Individuals.',
    rate: { kind: 'progressive', headline: '20% above SEK 643,000 (2026); 30% on capital income', details: ['Employment income: 0% national income tax to SEK 643,000 and 20% above, on top of the average municipal tax of 32% (2026). Capital income is generally taxed at a flat 30% (PwC).', PWC_NOTE], asOf: '2026-08-11' },
    explanation: 'The National Tax List gives one line for the income taxes of individuals (SEK 854 billion). Eurostat’s accounts place SEK 726 billion of it with the municipalities and regions (their proportional income tax) and the rest with the State.',
    exceptions: [], refs: [ref(PWC_PIT, 'Employment income tax for residents'), ref(EUS, 'S.1311 and S.1313, D51A')], label: 'Income tax (State)', sub: '20% · 30%', glyph: 'person',
    rev: { group: 'state', amount: pitState, locator: 'NTL 2026, sheet SE, D51A Taxes on individual or household income excluding holding gain, 2024, less the local part from Eurostat gov_10a_taxag (S.1313, D51A)', calculation: `${n.fmt(pitTotal)} − ${n.fmt(pitLocal)} = ${n.fmt(pitState)} (SEK million)`, caveat: `Different vintages of the two sources; Eurostat’s own State figure is SEK ${n.fmt(n.round(sec['S1311:D51A']))} million.` },
  },
  inst({
    id: 'se-pension-yield-taxes', parent: 'staten', level: 'staten', family: 'income-personal', group: 'state', keys: ['D51C1:C01', 'D51C1:C02', 'D51C1:C03', 'D51C1:C04', 'D51C1:C05', 'D51C1:C06'],
    official: 'Taxes on occupational and non-occupational pension schemes and pension savings', native: 'Skatt på pensionssparande (avkastningsskatt)', common: 'Taxes on pension schemes',
    base: 'As named in the National Tax List (occupational pensions defined benefit SEK 9.3 billion, defined contribution 8.5 billion, unit-linked 5.8 billion; non-occupational individual life insurance 5.6 billion, unit-linked 2.3 billion, individual pension saving 0.7 billion); the list does not state the tax base.',
    payer: 'Pension institutions and insurers.',
    rate: { kind: 'varies', headline: 'Set by the Yield Tax Act', details: [] },
    explanation: 'Six lines that the list books as taxes on holding gains of households.',
    exceptions: [], refs: [ref(NTL, 'sheet SE, D51C1')], label: 'Taxes on pension schemes', sub: 'Yield taxes', glyph: 'coin',
  }),
  inst({
    id: 'se-corporate-income-tax', parent: 'staten', level: 'staten', family: 'income-corporate', group: 'state', keys: ['D51B:C01'],
    official: 'Corporate income tax', native: 'Bolagsskatt (statlig inkomstskatt för juridiska personer)', common: 'Corporate income tax',
    base: 'Profit of companies and other legal persons.',
    payer: 'Companies.',
    rate: { kind: 'flat', headline: '20.6%', details: ['Taxable income is subject to corporate tax at a flat rate of 20.6% (PwC).', PWC_NOTE], asOf: '2026-09-22' },
    explanation: 'SEK 223.5 billion in 2024.',
    exceptions: [], refs: [ref(PWC_CIT, 'Corporate income tax rate')], label: 'Corporate income tax', sub: '20.6%', glyph: 'factory',
  }),
  /* ---- the State: payroll taxes and employers’ social fees ---- */
  inst({
    id: 'se-general-payroll-tax', parent: 'staten', level: 'staten', family: 'payroll', group: 'payroll', keys: ['D29C:C01'],
    official: 'General payroll tax (the non-earmarked part of the employers’ social fees)', native: 'Allmän löneavgift', common: 'General payroll tax',
    base: 'Remuneration to employees (and the earnings of the self-employed).',
    payer: 'Employers; the self-employed.',
    rate: { kind: 'flat', headline: 'Part of the 31.42% employer fees', details: ['Mandatory social charges payable by employers on remuneration are levied at approximately 31.42% in all (PwC); the shares of the lines in the National Tax List are consistent with the general payroll tax being the largest component of that rate.'], asOf: '2026-09-22' },
    explanation: 'The National Tax List books the employers’ fees as taxes on payroll, not as social contributions; this is the largest line, SEK 274 billion.',
    exceptions: [], refs: [ref(PWC_OTH, 'Social fees'), ref(NTL, 'sheet SE, D29C C01')], label: 'General payroll tax', sub: 'Employer fees', glyph: 'scroll',
  }),
  inst({
    id: 'se-employers-earmarked-fees', parent: 'staten', level: 'staten', category: 'social-contribution', family: 'social-security', group: 'payroll', keys: ['D29C:C06', 'D29C:C08', 'D29C:C09', 'D29C:C14', 'D29C:C07', 'D29C:C16', 'D29C:C17', 'D29C:C19', 'D29C:C22', 'D29C:C11'],
    official: 'Employers’ fees for sickness insurance, the labour market, parental insurance, survivors’ pensions and industrial injuries', native: 'Arbetsgivaravgifter (sjukförsäkring, arbetsmarknad, föräldraförsäkring, efterlevandepension, arbetsskada)', common: 'Earmarked employers’ social fees',
    base: 'Remuneration to employees. Sickness insurance SEK 82.6 billion, parental insurance 60.5 billion, labour market 57.9 billion, survivors’ pension 14.0 billion, industrial injuries 4.7 billion, and small lines including a negative miscellaneous line of SEK 3.5 billion.',
    payer: 'Employers.',
    rate: { kind: 'flat', headline: 'Part of the 31.42% employer fees', details: ['Mandatory social charges payable by employers are levied at approximately 31.42%; since 1 January 2024 the lower rates for young people have been removed (PwC).', PWC_NOTE], asOf: '2026-09-22' },
    explanation: 'Statistically booked as payroll taxes, but in Sweden the money is earmarked for the social insurances.',
    exceptions: [], refs: [ref(PWC_OTH, 'Social fees'), ref(NTL, 'sheet SE, D29C')], label: 'Earmarked employer fees', sub: 'Sickness · parental', glyph: 'heart',
  }),
  inst({
    id: 'se-pension-fee-to-state-budget', parent: 'staten', level: 'staten', category: 'social-contribution', family: 'social-security', group: 'payroll', keys: ['D29C:C02'],
    official: 'Part of the pension fee paid to the State budget', native: 'Del av pensionsavgiften till statsbudgeten', common: 'Pension fee to the State budget',
    base: 'As named in the National Tax List: the part of the employers’ pension fee that goes to the State budget rather than to the pension funds.',
    payer: 'Employers.',
    rate: { kind: 'flat', headline: 'Part of the 31.42% employer fees', details: [] },
    explanation: 'The rest of the pension fee is in the social contributions (the compulsory employers’ pension fees to the pension funds).',
    exceptions: [], refs: [ref(NTL, 'sheet SE, D29C C02')], label: 'Pension fee to State', sub: 'State budget', glyph: 'heart',
  }),
  inst({
    id: 'se-special-payroll-tax', parent: 'staten', level: 'staten', family: 'payroll', group: 'payroll', keys: ['D29C:C04', 'D29C:C03'],
    official: 'Special payroll tax and the tax on salaried employees’ life insurance', native: 'Särskild löneskatt', common: 'Special payroll tax',
    base: 'Pension premiums and pension costs beyond the mandatory system, and life insurance for salaried employees.',
    payer: 'Employers.',
    rate: { kind: 'flat', headline: 'About 24% on additional pension premiums', details: ['A special salary tax is levied at approximately 24% on pension premiums beyond the mandatory system (PwC).', PWC_NOTE], asOf: '2026-09-22' },
    explanation: 'SEK 65 billion in 2024.',
    exceptions: [], refs: [ref(PWC_OTH, 'Social fees'), ref(NTL, 'sheet SE, D29C C03 and C04')], label: 'Special payroll tax', sub: '≈24% on pensions', glyph: 'scroll',
  }),
  /* ---- the State: social contributions ---- */
  inst({
    id: 'se-compulsory-pension-fees', parent: 'staten', level: 'staten', category: 'social-contribution', family: 'social-security', group: 'socialer', keys: ['D611C:C01'],
    official: 'Employers’ compulsory pension fees (to the pension funds)', native: 'Arbetsgivarnas pensionsavgifter', common: 'Compulsory pension fees',
    base: 'Remuneration to employees.',
    payer: 'Employers.',
    rate: { kind: 'flat', headline: 'Part of the 31.42% employer fees', details: [] },
    explanation: 'The part of the mandatory pension fee that the list books as a social contribution (SEK 165 billion); the part paid to the State budget is in the payroll lines above.',
    exceptions: [], refs: [ref(NTL, 'sheet SE, D611C C01')], label: 'Compulsory pension fees', sub: 'Pension funds', glyph: 'heart',
  }),
  inst({
    id: 'se-occupational-pension-premiums', parent: 'staten', level: 'staten', category: 'insurance-premium', family: 'social-security', group: 'socialvol', keys: ['D611V:C01', 'D611V:C02'],
    official: 'Employers’ voluntary pension fees (occupational pensions) and other voluntary contributions', native: 'Arbetsgivarnas avtalspensionsavgifter', common: 'Occupational pension premiums',
    base: 'Premiums for occupational pensions agreed in collective agreements (SEK 52.1 billion) and other voluntary contributions (SEK 0.1 billion).',
    payer: 'Employers.',
    rate: { kind: 'varies', headline: 'Set by collective agreements', details: ['The National Tax List includes them because they are close to compulsory in practice; PwC notes that pension benefits beyond the mandatory system are customary among most Swedish employers.'] },
    explanation: 'Included in the list although they are agreed, not legislated.',
    exceptions: [], refs: [ref(NTL, 'sheet SE, D611V'), ref(PWC_OTH, 'Social fees')], label: 'Occupational pension premiums', sub: 'Agreed', glyph: 'heart',
  }),
  inst({
    id: 'se-self-employed-pension', parent: 'staten', level: 'staten', category: 'social-contribution', family: 'social-security', group: 'socialhh', keys: ['D613CS:C01'],
    official: 'Compulsory pension contributions of the self-employed', native: 'Egenavgifter (pension) för egenföretagare', common: 'Self-employed pension contributions',
    base: 'The income of the self-employed.',
    payer: 'Self-employed people.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'SEK 3.2 billion; the list gives no employees’ contributions for Sweden, because the employees’ pension charge is collected as part of the income tax.',
    exceptions: [], refs: [ref(NTL, 'sheet SE, D613CS C01')], label: 'Self-employed pension', sub: 'Contributions', glyph: 'heart',
  }),
  /* ---- the State: consumption ---- */
  inst({
    id: 'se-vat', parent: 'staten', level: 'staten', family: 'general-consumption', group: 'state', keys: ['D211:C01', 'D211:C02'],
    official: 'Value added tax (central government part and the part passed to the EU)', native: 'Mervärdesskatt (moms)', common: 'VAT', abbr: 'moms',
    base: 'Goods and services supplied in Sweden and imports.',
    payer: 'Consumers; businesses charge it and claim input credits.',
    rate: { kind: 'range', headline: '25% standard; 12% and 6% reduced', details: ['The general VAT rate is 25% on most goods and services; 12% on hotel accommodation, foodstuffs, restaurant meals and low- or non-alcoholic drinks; 6% on newspapers, books, passenger transport and others (PwC).', PWC_NOTE], asOf: '2026-09-22' },
    explanation: 'The largest tax: SEK 548 billion for the central government and SEK 8 billion booked as the EU part.',
    exceptions: [], refs: [ref(PWC_OTH, 'Value-added tax')], label: 'VAT', sub: '25%', glyph: 'cart',
  }),
  inst({
    id: 'se-customs', parent: 'staten', level: 'staten', category: 'customs-duty', family: 'trade', group: 'state', keys: ['D2121:C01', 'D2122C:C01'],
    official: 'Import duties and levies on imported alcoholic beverages', native: 'Tullar', common: 'Customs duties',
    base: 'Goods imported from outside the EU, by the Common Customs Tariff.',
    payer: 'Importers.',
    rate: { kind: 'varies', headline: 'EU Common Customs Tariff', details: ['An EU own resource; Eurostat records it under the EU institutions.'] },
    explanation: 'Collected for the EU budget.',
    exceptions: [], refs: [ref(EUS, 'S.212, D212')], label: 'Customs duties', sub: 'EU tariff', glyph: 'ship',
  }),
  inst({
    id: 'se-energy-tax-fuels', parent: 'staten', level: 'staten', family: 'specific-consumption', group: 'state', keys: ['D214A:C02', 'D214A:C01'],
    official: 'Taxes on fuel (energy and carbon dioxide taxes) and the tax on sulphur', native: 'Energiskatt och koldioxidskatt på bränsle', common: 'Fuel taxes',
    base: 'Petrol, diesel and other fuels, by quantity.',
    payer: 'Fuel suppliers; passed on at the pump.',
    rate: { kind: 'specific', headline: 'Per litre, with an energy and a CO₂ component', details: [] },
    explanation: 'SEK 40.1 billion.',
    exceptions: [], refs: [ref(NTL, 'sheet SE, D214A C01 and C02')], label: 'Fuel taxes', sub: 'Energy · CO₂', glyph: 'flame',
  }),
  inst({
    id: 'se-electricity-tax', parent: 'staten', level: 'staten', family: 'specific-consumption', group: 'state', keys: ['D214A:C03'],
    official: 'Tax on electrical power', native: 'Energiskatt på elektrisk kraft', common: 'Electricity tax',
    base: 'Electricity consumed.',
    payer: 'Electricity suppliers and consumers.',
    rate: { kind: 'specific', headline: 'Öre per kilowatt-hour', details: [] },
    explanation: 'SEK 31.2 billion.',
    exceptions: [], refs: [ref(NTL, 'sheet SE, D214A C03')], label: 'Electricity tax', sub: 'Per kWh', glyph: 'bolt',
  }),
  inst({
    id: 'se-alcohol-tobacco-taxes', parent: 'staten', level: 'staten', family: 'specific-consumption', group: 'state', keys: ['D214A:C04', 'D214A:C05'],
    official: 'Taxes on alcoholic beverages and on tobacco', native: 'Alkoholskatt och tobaksskatt', common: 'Alcohol and tobacco taxes',
    base: 'Alcoholic beverages (SEK 18.0 billion) and tobacco (SEK 14.8 billion).',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'specific', headline: 'Per litre of alcohol; per unit of tobacco', details: [] },
    explanation: 'Two lines.',
    exceptions: [], refs: [ref(NTL, 'sheet SE, D214A C04 and C05')], label: 'Alcohol and tobacco taxes', sub: 'Excises', glyph: 'wine',
  }),
  inst({
    id: 'se-environmental-product-taxes', parent: 'staten', level: 'staten', category: 'tax', family: 'resource', group: 'state', keys: ['D214L:C08', 'D214L:C02', 'D214L:C04', 'D214L:C05', 'D214A:C06', 'D214A:C07', 'D214A:C08'],
    official: 'Taxes on chemicals, pesticides, waste, plastic bags and gravel, and other excise duties', native: 'Skatt på kemikalier, bekämpningsmedel, avfall, plastpåsar och naturgrus', common: 'Chemicals, waste and other environmental taxes',
    base: 'Excise duty on chemicals (SEK 2.5 billion), waste (SEK 0.4 billion), plastic bags (SEK 0.4 billion), pesticides, other chemicals and gravel, and a small negative line of other excises.',
    payer: 'Producers and importers of the products.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Seven small environmental taxes.',
    exceptions: [], refs: [ref(NTL, 'sheet SE, D214L C02, C04, C05, C08, D214A C06–C08')], label: 'Chemicals and waste taxes', sub: 'Environmental', glyph: 'leaf',
  }),
  inst({
    id: 'se-stamp-duty', parent: 'staten', level: 'staten', family: 'property', group: 'state', keys: ['D214C:C01', 'D214C:C02', 'D214C:C03'],
    official: 'Stamp duty on mortgages and registrations of property, aircraft and vessels', native: 'Stämpelskatt (pantbrev och lagfart)', common: 'Stamp duty',
    base: 'Mortgage deeds and the registration of title to property (SEK 10.5 billion), corporate mortgages and registrations (SEK 0.2 billion), aircraft and vessels.',
    payer: 'Buyers and borrowers.',
    rate: { kind: 'varies', headline: 'A percentage of the price or the mortgage', details: [] },
    explanation: 'Sweden’s tax on property transactions: SEK 10.6 billion.',
    exceptions: [], refs: [ref(NTL, 'sheet SE, D214C')], label: 'Stamp duty', sub: 'Property', glyph: 'stamp',
  }),
  inst({
    id: 'se-gambling-monopolies', parent: 'staten', level: 'staten', family: 'specific-consumption', group: 'state', keys: ['D214F:C03', 'D214J:C02', 'D214J:C01', 'D29E:C03'],
    official: 'Tax on gambling, surplus from gambling, profits of the alcohol monopoly and lottery licences', native: 'Lotteriskatt; överskott från spel; Systembolagets vinst', common: 'Gambling and monopoly profits',
    base: 'Tax on gambling (SEK 4.8 billion), the State’s surplus from gambling (SEK 1.6 billion), the profits of the alcohol retail monopoly (SEK 0.4 billion) and lottery licences (SEK 0.05 billion).',
    payer: 'Gambling operators and the monopolies.',
    rate: { kind: 'varies', headline: 'Set by the gambling and alcohol laws', details: [] },
    explanation: 'Four lines.',
    exceptions: [], refs: [ref(NTL, 'sheet SE, D214F C03, D214J, D29E C03')], label: 'Gambling and monopolies', sub: 'Gambling · Systembolaget', glyph: 'dice',
  }),
  inst({
    id: 'se-traffic-insurance-flight', parent: 'staten', level: 'staten', family: 'specific-consumption', group: 'state', keys: ['D214G:C01', 'D214H:C02'],
    official: 'Tax on traffic insurance premiums and the flight tax', native: 'Trafikförsäkringsskatt; skatt på flygresor', common: 'Traffic insurance and flight taxes',
    base: 'Traffic insurance premiums (SEK 2.8 billion) and air passengers (SEK 1.7 billion).',
    payer: 'Insurers and airlines; passed on to customers.',
    rate: { kind: 'varies', headline: 'A percentage of premiums; a set amount per passenger', details: [] },
    explanation: 'Two lines.',
    exceptions: [], refs: [ref(NTL, 'sheet SE, D214G C01, D214H C02')], label: 'Insurance and flight taxes', sub: 'Traffic · air', glyph: 'plane',
  }),
  inst({
    id: 'se-vehicle-taxes', parent: 'staten', level: 'staten', family: 'specific-consumption', group: 'state', keys: ['D59D:C01', 'D59D:C02', 'D29B:C01', 'D29F:C03', 'D29E:C05', 'D29B:C03'],
    official: 'Motor vehicle tax and road tax (households and enterprises), the fee for lorries and electricity capacity fees', native: 'Fordonsskatt; vägavgift; avgift för lastbilar', common: 'Vehicle taxes',
    base: 'Motor vehicles paid by households (SEK 9.6 billion) and enterprises (SEK 5.0 billion), road tax paid by households (SEK 1.5 billion) and enterprises (SEK 1.3 billion), the fee for lorries (SEK 1.5 billion) and a small capacity fee.',
    payer: 'Vehicle owners.',
    rate: { kind: 'varies', headline: 'By vehicle weight, fuel and emissions', details: [] },
    explanation: 'Six lines.',
    exceptions: [], refs: [ref(NTL, 'sheet SE, D59D C01 and C02, D29B C01 and C03, D29F C03, D29E C05')], label: 'Vehicle taxes', sub: 'Motor vehicles · road', glyph: 'car',
  }),
  inst({
    id: 'se-property-tax', parent: 'staten', level: 'staten', family: 'property', group: 'state', keys: ['D29A:C01'],
    official: 'Tax on real estate', native: 'Fastighetsskatt och kommunal fastighetsavgift', common: 'Property tax',
    base: 'Buildings and land by assessed value.',
    payer: 'Owners of real estate.',
    rate: { kind: 'varies', headline: 'A percentage of assessed value, with a cap for homes', details: ['The list does not give rates.'] },
    explanation: 'SEK 41.4 billion. Eurostat books it under central government, although part of the fee for homes is a municipal fee.',
    exceptions: [], refs: [ref(NTL, 'sheet SE, D29A C01'), ref(EUS, 'S.1311, D29A')], label: 'Property tax', sub: 'Real estate', glyph: 'house',
  }),
  inst({
    id: 'se-public-service-fee', parent: 'staten', level: 'staten', category: 'fee', family: 'other', group: 'state', keys: ['D59D:C03'],
    official: 'Public service fee paid by households', native: 'Public service-avgift', common: 'Public service fee',
    base: 'Individuals with income, to finance public service television and radio.',
    payer: 'Households.',
    rate: { kind: 'varies', headline: 'A percentage of income up to a cap', details: [] },
    explanation: 'SEK 8.9 billion in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet SE, D59D C03')], label: 'Public service fee', sub: 'TV and radio', glyph: 'scroll',
  }),
  inst({
    id: 'se-financial-sector-fees', parent: 'staten', level: 'staten', category: 'special-levy', family: 'other', group: 'state', keys: ['D29H:C07', 'D29H:C04', 'D29H:C02', 'D29H:C06', 'D29H:C05', 'D29F:C05'],
    official: 'Risk tax, resolution fee, deposit insurance fee and other small fees', native: 'Riskskatt; resolutionsavgift; insättningsgaranti', common: 'Financial-sector fees and others',
    base: 'The risk tax on credit institutions (SEK 6.7 billion), the resolution fee (SEK 4.3 billion), the deposit insurance fee (SEK 2.3 billion), the fee for the discharge of nitrogen (SEK 0.6 billion), the telecommunications fee and waste incineration.',
    payer: 'Credit institutions and other operators.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Six lines.',
    exceptions: [], refs: [ref(NTL, 'sheet SE, D29H C02, C04–C07, D29F C05')], label: 'Financial-sector fees', sub: 'Risk tax · resolution', glyph: 'bank',
  }),
  /* ---- municipalities and regions ---- */
  {
    id: 'se-income-tax-municipal', parent: 'kommuner', level: 'kommuner', family: 'income-personal',
    official: 'Municipal and regional income tax on individuals', native: 'Kommunal inkomstskatt och regionskatt', common: 'Municipal and regional income tax',
    base: 'The same earned income as the State income tax: wages, pensions and business income of residents.',
    payer: 'Individuals; the employer withholds.',
    rate: { kind: 'range', headline: 'Average 32% (2026), set by each municipality and region', details: ['The average municipal income tax rate is 32% (PwC); municipalities and regions each set their own rate.'], asOf: '2026-08-11' },
    explanation: 'SEK 726 billion, 85% of the income tax on individuals in the list. It is a proportional tax collected with the State tax.',
    exceptions: [], refs: [ref(PWC_PIT, 'Employment income tax for residents'), ref(EUS, 'S.1313, D51A')], label: 'Municipal income tax', sub: '≈32%', glyph: 'person',
    rev: { group: 'localpit', amount: pitLocal, locator: 'Eurostat gov_10a_taxag, 2024: S.1313 local government, D51A taxes on individual or household income, SEK million', caveat: 'Eurostat July 2026 vintage; the National Tax List has no sector split.' },
  },
];

const part = (g: string) => n.round(instruments.filter((i) => i.rev?.group === g).reduce((a, i) => a + i.rev!.amount, 0));
const sectorSum = (code: string) => ['S1311', 'S1312', 'S1313', 'S1314', 'S212'].reduce((a, s) => a + (sec[`${s}:${code}`] ?? 0), 0);
const vintage = ['D2', 'D5', 'D61'].map((c) => `${c}: NTL ${n.fmt(n.total(c))}, Eurostat July 2026 ${n.fmt(sectorSum(c))}`).join('; ');

const spec: CountrySpec = {
  today: D,
  id: 'sweden',
  iso3: 'SWE',
  isoNumeric: '752',
  names: { en: 'Sweden', native: 'Sverige', nativeLang: 'sv' },
  currency: { code: 'SEK', symbol: 'kr', name: 'Swedish krona' },
  summary:
    'Sweden is a unitary state with strong local government. The Riksdag sets the taxes and the Tax Agency collects almost all of them, but the municipalities and regions set their own proportional income tax, which brings in about six times what the State’s income tax brings in. The employers’ social fees are statistically booked as payroll taxes. VAT, the municipal income tax and the employers’ fees are the three biggest flows.',
  structureNote:
    'The figures are the Commission’s National Tax List for 2024, in SEK million. The income tax of individuals is drawn twice, as the State’s and the municipalities’ and regions’ part, using Eurostat’s split of the same year. The employers’ social fees are drawn as the list books them: mostly as taxes on payroll, with the compulsory pension fee and voluntary occupational pensions as social contributions. The sale of emission trade permits (SEK 3.7 billion) and the household pension "supplements" (SEK 14.8 billion, a calculated income attributed to the insured, not a payment) are left out.',
  theme: {
    accent: '#fecc00',
    accent2: '#006aa7',
    motif: 'topo',
    motifNote: 'Topographic contour lines over the outline of Sweden (the generic motif; no bespoke art yet).',
    mapLabel: { lon: 16.0, lat: 62.5 },
  },
  rootLabel: { label: 'Sweden', sub: 'Sverige · Fiscal folio' },
  levels: [
    {
      id: 'staten', branch: 'national', official: 'The State (Kingdom of Sweden)', native: 'Staten', common: 'State',
      description: 'The Riksdag legislates all taxes; the Swedish Tax Agency (Skatteverket) collects them, the employers’ fees and the municipal income tax, and the Social Insurance Agency pays the benefits.',
      fiscalPower: 'Taxes are set by law; municipalities and regions set only the rate of their own income tax.',
      refs: [ref(NTL)], label: 'State', sub: 'Staten',
    },
    {
      id: 'kommuner', branch: 'local', official: 'Municipalities and regions', native: 'Kommuner och regioner', common: 'Municipalities and regions',
      description: 'The municipalities and the regions. They are financed mainly by their own proportional income tax, which each decides, together with state grants and fees.',
      fiscalPower: 'Each municipality and region sets its income tax rate; the tax base is national.',
      refs: [ref(PWC_PIT, 'Employment income tax for residents'), ref(EUS)], label: 'Municipalities and regions', sub: 'Kommuner',
    },
  ],
  supporting: [],
  denominators: [
    {
      id: 'staten-taxes-2024', label: 'State taxes (National Tax List), 2024',
      definition: 'The taxes on production and imports, on income and on capital that the National Tax List books to the State and the EU, other than the payroll taxes and fees drawn separately and the sale of emission permits; includes the State’s part of the income tax of individuals.',
      levelIds: ['staten'], amount: part('state'), period: y, sourceId: NTL,
      locator: 'Sheet SE, 2024, the lines listed with each tax',
      calculation: `Sum of the ${instruments.filter((i) => i.rev?.group === 'state').length} tax rows below (SEK million)`,
      caveat: `Calendar 2024; the list's cut-off was 30 October 2025. Vintage check against Eurostat's July 2026 accounts: ${vintage}.`,
    },
    {
      id: 'staten-payroll-2024', label: 'Payroll taxes and employers’ social fees booked as taxes, 2024',
      definition: 'The general payroll tax, the earmarked employers’ fees, the pension fee to the State budget and the special payroll tax, which the National Tax List books as taxes on the wage bill.',
      levelIds: ['staten'], amount: part('payroll'), period: y, sourceId: NTL,
      locator: 'Sheet SE, 2024, lines D29C',
      calculation: `Sum of the ${instruments.filter((i) => i.rev?.group === 'payroll').length} payroll rows below (SEK million)`,
      caveat: 'Calendar 2024, same list and cut-off as the other taxes. These fees are social in nature but the list books them as taxes on payroll.',
    },
    {
      id: 'staten-pension-fees-2024', label: 'Compulsory employers’ pension fees, 2024',
      definition: 'The mandatory employers’ pension fees to the pension funds, booked as social contributions.',
      levelIds: ['staten'], amount: part('socialer'), period: y, sourceId: NTL,
      locator: 'Sheet SE, 2024, line D611C C01',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'staten-occupational-pensions-2024', label: 'Voluntary occupational pension premiums, 2024',
      definition: 'Employers’ voluntary pension premiums (collectively agreed) and other voluntary employers’ contributions.',
      levelIds: ['staten'], amount: part('socialvol'), period: y, sourceId: NTL,
      locator: 'Sheet SE, 2024, lines D611V C01 and C02',
      caveat: 'Calendar 2024, same list and cut-off as the taxes. Not legislated; included because the National Tax List includes them.',
    },
    {
      id: 'staten-self-employed-pension-2024', label: 'Pension contributions of the self-employed, 2024',
      definition: 'The compulsory pension contributions of the self-employed.',
      levelIds: ['staten'], amount: part('socialhh'), period: y, sourceId: NTL,
      locator: 'Sheet SE, 2024, line D613CS C01',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'kommuner-income-tax-2024', label: 'Income tax received by the municipalities and regions, 2024',
      definition: 'The part of the income tax of individuals that Eurostat’s accounts record under local government.',
      levelIds: ['kommuner'], amount: part('localpit'), period: y, sourceId: EUS,
      locator: 'gov_10a_taxag, 2024, S.1313, D51A, million SEK',
      caveat: 'Eurostat July 2026 vintage, a different release from the National Tax List.',
    },
  ],
  sizing: {
    label: 'Taxes and compulsory social contributions of all levels of government',
    definition: 'The taxes of the State and of the municipalities and regions plus the actual social contributions, calendar 2024, as listed in the National Tax List and split by Eurostat. Excludes the sale of emission permits and the households’ pension contribution supplements.',
    componentIds: ['staten-taxes-2024', 'staten-payroll-2024', 'staten-pension-fees-2024', 'staten-occupational-pensions-2024', 'staten-self-employed-pension-2024', 'kommuner-income-tax-2024'],
  },
  fromProfile: 'sweden',
  structureOverride: {
    basis: 'OECD attribution to sub-sectors of general government (Interpretative Guide, section A.12)',
    folioLevels: { central: ['staten'], local: ['kommuner'] },
    levelNotes: { central: 'The OECD shows the social security funds separately; the folio draws the employers’ fees under the State.' },
  },
  groups: {
    state: { title: 'State taxes 2024 – National Tax List (SEK million)', denominatorId: 'staten-taxes-2024', period: y, basis: 'ESA tax revenue, general government and EU institutions', sourceId: NTL },
    payroll: { title: 'Payroll taxes and employers’ fees 2024 – National Tax List (SEK million)', denominatorId: 'staten-payroll-2024', period: y, basis: 'ESA taxes on the wage bill', sourceId: NTL },
    socialer: { title: 'Compulsory pension fees 2024 – National Tax List (SEK million)', denominatorId: 'staten-pension-fees-2024', period: y, basis: 'Actual compulsory contributions', sourceId: NTL },
    socialvol: { title: 'Occupational pension premiums 2024 – National Tax List (SEK million)', denominatorId: 'staten-occupational-pensions-2024', period: y, basis: 'Actual voluntary contributions', sourceId: NTL },
    socialhh: { title: 'Self-employed pension contributions 2024 – National Tax List (SEK million)', denominatorId: 'staten-self-employed-pension-2024', period: y, basis: 'Actual compulsory contributions', sourceId: NTL },
    localpit: { title: 'Municipal and regional income tax 2024 – Eurostat (SEK million)', denominatorId: 'kommuner-income-tax-2024', period: y, basis: 'ESA taxes received by local government', sourceId: EUS },
  },
  sources: [
    { id: NTL, org: 'European Commission, DG Taxation and Customs Union, with Eurostat', title: 'Data on Taxation Trends: National Tax Lists (NTL), edition 2026', url: 'https://taxation-customs.ec.europa.eu/taxation/economic-analysis/data-taxation-trends_en', kind: 'statistics', language: 'en', publishedDate: '2026-03-31', periodCovered: 'Calendar year 2024 (series from 1995)', accessed: D, nextExpected: '2027-03', note: 'Workbook "NTL edition 2026 web.xlsx", sheet SE: every tax and social contribution by its national name and ESA code, in SEK million. Data cut-off 30 October 2025.' },
    { id: EUS, org: 'Eurostat', title: 'Main national accounts tax aggregates (gov_10a_taxag)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table', kind: 'statistics', language: 'en', publishedDate: '2026-07-21', periodCovered: 'Calendar year 2024', accessed: D, nextExpected: '2027-07', note: 'Taxes and social contributions by sub-sector and ESA item; used to split the income tax of individuals between the State (S.1311: SEK 124,795 million) and local government (S.1313: SEK 725,709 million) and to check the totals.' },
    { id: PWC_CIT, org: 'PwC', title: 'Worldwide Tax Summaries: Sweden – Corporate – Taxes on corporate income', url: 'https://taxsummaries.pwc.com/sweden/corporate/taxes-on-corporate-income', kind: 'guidance', language: 'en', publishedDate: '2026-09-22', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary, not an official source: corporate tax a flat 20.6%.' },
    { id: PWC_PIT, org: 'PwC', title: 'Worldwide Tax Summaries: Sweden – Individual – Taxes on personal income', url: 'https://taxsummaries.pwc.com/sweden/individual/taxes-on-personal-income', kind: 'guidance', language: 'en', publishedDate: '2026-08-11', periodCovered: 'Rates for 2026', accessed: D, note: 'A professional firm’s summary: national income tax 20% above SEK 643,000 (2026), average municipal tax rate 32%, capital income 30%.' },
    { id: PWC_OTH, org: 'PwC', title: 'Worldwide Tax Summaries: Sweden – Corporate – Other taxes', url: 'https://taxsummaries.pwc.com/sweden/corporate/other-taxes', kind: 'guidance', language: 'en', publishedDate: '2026-09-22', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary: VAT 25%, 12% and 6%; employers’ social fees about 31.42% (from 1 January 2024, even for those under 18); special salary tax about 24% on additional pension premiums.' },
  ],
  instruments,
};

buildCountry(spec);
n.reconcile(part('state') + part('payroll') + part('socialer') + part('socialvol') + part('socialhh') + part('localpit'), ['D29F:C04', 'D614:C01'], -19);
