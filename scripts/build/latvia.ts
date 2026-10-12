/**
 * Latvia: the folio's data. Run: npx tsx scripts/build/latvia.ts
 * Figures: Commission / Eurostat National Tax List (NTL), edition 2026, sheet LV, calendar 2024, EUR million
 * (scripts/build/data/ntl-LV.json); the municipal share of the personal income tax from Eurostat gov_10a_taxag.
 * Rates: Ministry of Finance of Latvia, "Changes in taxation and finances from 2026" (rates by year 2024-2026).
 */
import { buildCountry, type CountrySpec, type InstSpec, type Ref } from '../lib/build-country';
import { loadNtl, loadSectors } from '../lib/ntl';

const D = '2026-10-12';
const y = { label: '2024', kind: 'calendar-year' as const, start: '2024-01-01', end: '2024-12-31' };
const ref = (id: string, loc?: string): Ref => (loc ? [id, loc] : [id]);
const n = loadNtl('LV', 'EUR');
const sec = loadSectors('LV');
const NTL = 'ntl-2026';
const EUS = 'eurostat-taxag';
const FM = 'fm-changes-2026';

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
    id: 'lv-pit-state', parent: 'valsts', level: 'valsts', family: 'income-personal',
    official: 'Personal income tax, share of the State', native: 'Iedzīvotāju ienākuma nodoklis (valsts daļa)', common: 'Personal income tax: State share',
    base: 'Wages, self-employment and other income of residents, and Latvian-source income of non-residents.',
    payer: 'Individuals; employers withhold it.',
    rate: { kind: 'progressive', headline: '20% · 23% · 31% in 2024; 25.5% · 33% from 2025', details: ['2024: 20% up to EUR 20,004 a year, 23% from EUR 20,004 to 78,100, 31% above.', 'From 2025 there are two rates: 25.5% up to EUR 105,300 and 33% above (Ministry of Finance table).'], asOf: '2026-10-12' },
    explanation: 'The National Tax List gives the total tax of EUR 2,870 million; Eurostat’s accounts place EUR 2,167 million of it with local governments and the rest with the State. This row is the State’s part, the next the municipalities’.',
    exceptions: ['The Ministry’s table also shows a minimum not subject to tax and a solidarity tax of 25% above the ceiling of the social contributions.'],
    refs: [ref(FM, 'Changes in labour taxes'), ref(NTL, 'sheet LV, D51A'), ref(EUS, 'S.1311 and S.1313, D51A')], label: 'Income tax (State)', sub: '20–31% (2024)', glyph: 'person',
    rev: { group: 'state', amount: pitState, locator: 'NTL 2026, sheet LV, D51A Personal income tax, 2024, less the local share from Eurostat gov_10a_taxag (S.1313, D51A)', calculation: `${n.fmt(pitTotal)} − ${n.fmt(pitLocal)} = ${n.fmt(pitState)} (EUR million)`, caveat: 'The two sources are different vintages (NTL cut-off October 2025, Eurostat July 2026); Eurostat’s own figure for the State’s share is EUR 703 million.' },
  },
  inst({
    id: 'lv-cit', parent: 'valsts', level: 'valsts', family: 'income-corporate', group: 'state', keys: ['D51B:C01'],
    official: 'Corporate income tax', native: 'Uzņēmumu ienākuma nodoklis', common: 'Corporate income tax',
    base: 'Profit that a company distributes (dividends, deemed distributions) and certain non-business expenses, not the profit it keeps.',
    payer: 'Companies.',
    rate: { kind: 'flat', headline: '20% of the gross amount (20/80 of the net)', details: ['The standard rate; from 1 January 2026 an alternative 15% rate on dividends, with 6% personal income tax on them, is available to companies owned only by individuals (Ministry of Finance).'], asOf: '2026-10-12' },
    explanation: 'Like Estonia, Latvia taxes company profit when it is distributed, not when it is earned. Revenue rose 46% in 2024.',
    exceptions: [], refs: [ref(FM, 'Corporate Income Tax')], label: 'Corporate income tax', sub: '20% of payout', glyph: 'factory',
  }),
  inst({
    id: 'lv-social-employers', parent: 'valsts', level: 'valsts', category: 'social-contribution', family: 'social-security', group: 'social', keys: ['D611:C01'],
    official: 'Mandatory state social insurance contributions, employers’ part', native: 'Darba devēju valsts sociālās apdrošināšanas obligātās iemaksas', common: 'Employers’ social contributions',
    base: 'Gross pay, up to an annual ceiling (EUR 78,100 in 2024, EUR 105,300 from 2025).',
    payer: 'Employers.',
    rate: { kind: 'flat', headline: '23.59% of gross pay', details: ['Total rate 34.09% in 2024, 2025 and 2026: employer 23.59%, employee 10.5% (Ministry of Finance table).'], asOf: '2026-10-12' },
    explanation: 'The biggest social payment. The National Tax List splits it into pension (EUR 2,117 million) and non-pension (EUR 907 million) contributions.',
    exceptions: [], refs: [ref(FM, 'Changes in labour taxes'), ref(NTL, 'sheet LV, D611')], label: 'Social: employers', sub: '23.59%', glyph: 'heart',
  }),
  inst({
    id: 'lv-social-employees', parent: 'valsts', level: 'valsts', category: 'social-contribution', family: 'social-security', group: 'social', keys: ['D613CE:C01'],
    official: 'Mandatory state social insurance contributions, employees’ part', native: 'Darba ņēmēju valsts sociālās apdrošināšanas obligātās iemaksas', common: 'Employees’ social contributions',
    base: 'Gross pay, up to the same annual ceiling.',
    payer: 'Employees; the employer withholds them.',
    rate: { kind: 'flat', headline: '10.5% of gross pay', details: ['Employee rate 10.5% in 2024 to 2026 (Ministry of Finance table).'], asOf: '2026-10-12' },
    explanation: 'Pays for pensions, sickness, maternity, unemployment and other social insurance benefits.',
    exceptions: [], refs: [ref(FM, 'Changes in labour taxes')], label: 'Social: employees', sub: '10.5%', glyph: 'heart',
  }),
  inst({
    id: 'lv-social-self-employed', parent: 'valsts', level: 'valsts', category: 'social-contribution', family: 'social-security', group: 'social', keys: ['D613CS:C01', 'D613V:C01'],
    official: 'Contributions of the self-employed and voluntary contributions', native: 'Pašnodarbināto obligātās un brīvprātīgās iemaksas', common: 'Self-employed and voluntary contributions',
    base: 'The income of self-employed people; voluntary contributions of persons who insure themselves.',
    payer: 'Self-employed people and voluntary insured persons.',
    rate: { kind: 'varies', headline: 'Set by the Law on State Social Insurance', details: ['The National Tax List separates EUR 62.3 million of compulsory contributions of the self-employed from EUR 0.3 million of voluntary ones.'] },
    explanation: 'The remaining part of the households’ actual social contributions.',
    exceptions: [], refs: [ref(NTL, 'sheet LV, D613CS and D613V')], label: 'Self-employed', sub: 'Contributions', glyph: 'heart',
  }),
  inst({
    id: 'lv-vat', parent: 'valsts', level: 'valsts', family: 'general-consumption', group: 'state', keys: ['D211:C01'],
    official: 'Value added tax', native: 'Pievienotās vērtības nodoklis', common: 'VAT', abbr: 'PVN',
    base: 'Goods and services supplied in Latvia, intra-EU acquisitions and imports.',
    payer: 'Consumers; businesses charge it and claim input credits.',
    rate: { kind: 'range', headline: '21% standard; 12% and 5% reduced', details: ['The Ministry of Finance page names the 12% and 5% reduced rates (books and press 5%; a pilot 12% on certain foods from 1 July 2026 to 30 June 2027).'], asOf: '2026-10-12' },
    explanation: 'The largest tax by far.',
    exceptions: [], refs: [ref(FM, 'Value added tax')], label: 'VAT', sub: '21%', glyph: 'cart',
  }),
  inst({
    id: 'lv-customs', parent: 'valsts', level: 'valsts', category: 'customs-duty', family: 'trade', group: 'state', keys: ['D2121:C01'],
    official: 'Customs duties', native: 'Muitas nodevas', common: 'Customs duties',
    base: 'Goods imported from outside the EU, by the Common Customs Tariff.',
    payer: 'Importers.',
    rate: { kind: 'varies', headline: 'EU Common Customs Tariff', details: ['An EU own resource; Eurostat records it under the EU institutions (sector S.212: EUR 63 million).'] },
    explanation: 'Collected by the State Revenue Service for the EU budget.',
    exceptions: [], refs: [ref(EUS, 'S.212, D212')], label: 'Customs duties', sub: 'EU tariff', glyph: 'ship',
  }),
  inst({
    id: 'lv-excise-oil', parent: 'valsts', level: 'valsts', family: 'specific-consumption', group: 'state', keys: ['D214A:C02'],
    official: 'Excise duty on oil products', native: 'Akcīzes nodoklis naftas produktiem', common: 'Fuel excise',
    base: 'Petrol, diesel, heating oil and other oil products, by quantity.',
    payer: 'Producers and importers; passed on at the pump.',
    rate: { kind: 'specific', headline: 'Per 1,000 litres or per tonne', details: ['The rates are fixed in the Law on Excise Duties.'] },
    explanation: 'The biggest excise.',
    exceptions: [], refs: [ref(NTL, 'sheet LV, D214A C02')], label: 'Fuel excise', sub: 'Oil products', glyph: 'flame',
  }),
  inst({
    id: 'lv-excise-tobacco', parent: 'valsts', level: 'valsts', family: 'specific-consumption', group: 'state', keys: ['D214A:C03'],
    official: 'Excise duty on tobacco', native: 'Akcīzes nodoklis tabakai', common: 'Tobacco excise',
    base: 'Cigarettes, cigars and other tobacco products.',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'mechanism', headline: 'Fixed by the Law on Excise Duties', details: [] },
    explanation: 'The second largest excise.',
    exceptions: [], refs: [ref(NTL, 'sheet LV, D214A C03')], label: 'Tobacco excise', sub: 'Cigarettes', glyph: 'smoke',
  }),
  inst({
    id: 'lv-excise-alcohol', parent: 'valsts', level: 'valsts', family: 'specific-consumption', group: 'state', keys: ['D214A:C01', 'D214A:C05'],
    official: 'Excise duty on alcohol and on beer', native: 'Akcīzes nodoklis alkoholam un alum', common: 'Alcohol excise',
    base: 'Spirits, wine, intermediate products, fermented drinks and beer, by volume or pure alcohol.',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'specific', headline: 'Per 100 litres, rising each 1 March', details: ['On 1 March 2026 the rate for wine rose from EUR 134 to EUR 148 per 100 litres and for other alcoholic drinks from EUR 1,955 to EUR 2,084 per 100 litres of absolute alcohol; further steps are fixed for 2027 and 2028 (Ministry of Finance).'], asOf: '2026-10-12' },
    explanation: 'The National Tax List shows alcohol (EUR 210.5 million) and beer (EUR 53.9 million) as separate lines.',
    exceptions: [], refs: [ref(FM, 'Excise tax')], label: 'Alcohol excise', sub: 'Per litre', glyph: 'wine',
  }),
  inst({
    id: 'lv-excise-other', parent: 'valsts', level: 'valsts', family: 'specific-consumption', group: 'state', keys: ['D214A:C04', 'D214A:C06', 'D214A:C07', 'D2122C:C01'],
    official: 'Excise duty on natural gas, electricity and other excise goods; excise on imports', native: 'Akcīzes nodoklis dabasgāzei, elektroenerģijai un pārējām precēm', common: 'Other excises',
    base: 'Natural gas, electricity and the other excise goods, plus excise collected on imports released for free circulation.',
    payer: 'Suppliers and importers.',
    rate: { kind: 'varies', headline: 'Fixed by the Law on Excise Duties', details: ['EUR 41.1 million other excise goods, 13.2 million natural gas, 4.9 million electricity and 1.5 million excise on imports in 2024.'] },
    explanation: 'Smaller lines of the excise family.',
    exceptions: [], refs: [ref(NTL, 'sheet LV, D214A C04, C06, C07 and D2122C C01')], label: 'Other excises', sub: 'Gas · electricity', glyph: 'bolt',
  }),
  inst({
    id: 'lv-gambling', parent: 'valsts', level: 'valsts', family: 'specific-consumption', group: 'state', keys: ['D214F:C01', 'D29E:C02', 'D29E:C05'],
    official: 'Lottery and gambling tax and state duties on lotteries and gambling', native: 'Loteriju un azartspēļu nodoklis un valsts nodevas', common: 'Gambling taxes',
    base: 'Gambling operators’ takings and the organising of lotteries.',
    payer: 'Gambling and lottery operators.',
    rate: { kind: 'varies', headline: 'Set by the Gambling and Lotteries Law', details: ['EUR 54.4 million lottery and gambling tax, EUR 3.4 million state duty on lotteries and gambling and EUR 0.4 million duty on lotteries of goods and services in 2024. The Ministry of Finance lists changes to the gambling tax from 2026.'], asOf: '2026-10-12' },
    explanation: 'Three lines in the National Tax List that tax the same activity.',
    exceptions: [], refs: [ref(FM, 'Gambling Tax')], label: 'Gambling taxes', sub: 'Operators', glyph: 'dice',
  }),
  inst({
    id: 'lv-vehicle-taxes', parent: 'valsts', level: 'valsts', family: 'specific-consumption', group: 'state', keys: ['D29B:C02', 'D29B:C03', 'D59D:C02'],
    official: 'Vehicle operation tax (legal and natural persons) and company car tax', native: 'Transportlīdzekļa ekspluatācijas nodoklis; uzņēmumu vieglo transportlīdzekļu nodoklis', common: 'Vehicle taxes',
    base: 'Registered road vehicles; passenger cars owned by companies.',
    payer: 'Vehicle owners, individuals and companies.',
    rate: { kind: 'varies', headline: 'By engine, mass and emissions', details: ['EUR 71.4 million came from vehicles registered to natural persons, EUR 31.0 million from those registered to legal persons and EUR 28.5 million from the company car tax in 2024. The Ministry of Finance lists changes to the vehicle operation tax from 2026.'], asOf: '2026-10-12' },
    explanation: 'An annual tax on owning a vehicle.',
    exceptions: [], refs: [ref(FM, 'Vehicle Operation Tax (TEN)')], label: 'Vehicle taxes', sub: 'Operation tax', glyph: 'car',
  }),
  inst({
    id: 'lv-natural-resources', parent: 'valsts', level: 'valsts', family: 'resource', group: 'state', keys: ['D29F:C01'],
    official: 'Natural resources tax', native: 'Dabas resursu nodoklis', common: 'Natural resources tax',
    base: 'Use of natural resources, pollution and waste disposal.',
    payer: 'Users and polluters.',
    rate: { kind: 'varies', headline: 'Set by the Natural Resources Tax Law', details: ['Eurostat’s accounts place EUR 17 million of the permit and natural-resource revenue with local government.'] },
    explanation: 'An environmental tax. The sale of emission permits (EUR 90.8 million) is not counted.',
    exceptions: [], refs: [ref(NTL, 'sheet LV, D29F C01')], label: 'Natural resources tax', sub: 'Pollution', glyph: 'leaf',
  }),
  inst({
    id: 'lv-oil-reserve-fee', parent: 'valsts', level: 'valsts', category: 'special-levy', family: 'other', group: 'state', keys: ['D214L:C02'],
    official: 'Security reserve service fee', native: 'Drošības rezervju pakalpojuma maksa', common: 'Oil security reserve fee',
    base: 'As named in the National Tax List: the fee for the service of keeping security reserves (of oil products).',
    payer: 'Not given in the list.',
    rate: { kind: 'varies', headline: 'Not given in the list', details: ['The list shows a "state duty for keeping oil products’ security reserves" of EUR 73.6 million in 2023 and the fee above in 2024.'] },
    explanation: 'A compulsory charge that the statistician books as a tax on products.',
    exceptions: [], refs: [ref(NTL, 'sheet LV, D214L')], label: 'Security reserve fee', sub: 'Oil stocks', glyph: 'oil',
  }),
  inst({
    id: 'lv-financial-levies', parent: 'valsts', level: 'valsts', category: 'special-levy', family: 'other', group: 'state', keys: ['D29H:C03', 'D29H:C06', 'D29H:C05'],
    official: 'Contributions to the Deposit Guarantee Fund and the mortgage borrower protection duty', native: 'Iemaksas noguldījumu garantiju fondā; hipotekārā kredīta ņēmēju aizsardzības nodeva', common: 'Financial-sector levies',
    base: 'As named in the National Tax List (contributions to the Deposit Guarantee Fund; a duty described as protecting mortgage borrowers); the list gives no further detail.',
    payer: 'Not given in the list.',
    rate: { kind: 'varies', headline: 'Set by law', details: ['EUR 97.5 million mortgage borrower protection duty (a new line in 2024), EUR 22.3 million Deposit Guarantee Fund; the Single Resolution Fund line is zero in 2024.'] },
    explanation: 'Compulsory levies on the financial sector.',
    exceptions: [], refs: [ref(NTL, 'sheet LV, D29H C03, C05 and C06')], label: 'Financial-sector levies', sub: 'Guarantee fund', glyph: 'bank',
  }),
  inst({
    id: 'lv-register-duties', parent: 'valsts', level: 'valsts', family: 'property', group: 'state', keys: ['D214C:C01', 'D214C:C02', 'D214C:C03', 'D214C:C04', 'D214C:C05'],
    official: 'Land Register duties on transfers and pledges of property', native: 'Zemesgrāmatas nodevas', common: 'Land Register duties',
    base: 'Registering a change of ownership or a pledge in the Land Register, other than by inheritance or gift.',
    payer: 'Buyers and borrowers; legal and natural persons.',
    rate: { kind: 'varies', headline: 'Set by the Law on Land Register Duties', details: ['EUR 22.4 million from natural persons and EUR 19.9 million from legal persons for the duty on ownership and pledge registration, plus EUR 2.2 million of stamp duties.'] },
    explanation: 'The nearest thing to a property transfer tax.',
    exceptions: [], refs: [ref(NTL, 'sheet LV, D214C')], label: 'Land Register duties', sub: 'Transfers', glyph: 'stamp',
  }),
  inst({
    id: 'lv-inheritance-gift', parent: 'valsts', level: 'valsts', family: 'property', group: 'state', keys: ['D91A:C01', 'D91A:C02', 'D91A:C03'],
    official: 'Duty on inheritances and gifts and the Land Register duties attached to them', native: 'Nodeva par mantojumiem un dāvinājumiem', common: 'Inheritance and gift duty',
    base: 'Property received by inheritance or gift; the Land Register entries that record it.',
    payer: 'Heirs and recipients.',
    rate: { kind: 'varies', headline: 'Set by law', details: ['EUR 9.4 million from the duty itself, EUR 3.6 million from the connected Land Register duties in 2024.'] },
    explanation: 'The National Tax List calls these capital taxes.',
    exceptions: [], refs: [ref(NTL, 'sheet LV, D91A')], label: 'Inheritance and gifts', sub: 'Duty', glyph: 'gem',
  }),
  inst({
    id: 'lv-other-duties', parent: 'valsts', level: 'valsts', category: 'fee', family: 'other', group: 'state', keys: ['D29C:C01', 'D29H:C01', 'D29E:C07', 'D29E:C06', 'D59D:C01', 'D59D:C03', 'D91B:C01'],
    official: 'Other state duties and fees', native: 'Pārējās valsts nodevas', common: 'Other state duties',
    base: 'The small lines: the business risk duty (EUR 3.2 million), other special-purpose state duties (EUR 9.8 million), the foreigners’ payment for a residence permit (EUR 2.3 million), numbering rights (EUR 0.5 million), fishing licences and cards (EUR 1.4 million) and the duty for keeping animals (EUR 0.07 million).',
    payer: 'Businesses, foreigners and licence holders.',
    rate: { kind: 'varies', headline: 'Fixed fees', details: [] },
    explanation: 'Seven small lines of the National Tax List, together under 0.2% of the total.',
    exceptions: [], refs: [ref(NTL, 'sheet LV, D29C, D29H C01, D29E C06 and C07, D59D, D91B')], label: 'Other duties', sub: 'Fees', glyph: 'stamp',
  }),
  /* ---- municipalities ---- */
  {
    id: 'lv-pit-municipal', parent: 'pasvaldibas', level: 'pasvaldibas', family: 'income-personal',
    official: 'Personal income tax, share of the municipalities', native: 'Iedzīvotāju ienākuma nodoklis (pašvaldību daļa)', common: 'Personal income tax: municipal share',
    base: 'The same tax as the State’s share: income of residents.',
    payer: 'Individuals; employers withhold it.',
    rate: { kind: 'progressive', headline: 'Same rates as the State’s share', details: ['Eurostat’s accounts record this part under local government (S.1313).'] },
    explanation: 'Most of the personal income tax goes to the municipalities, which makes it their main revenue. The rates are set by the Saeima and the State Revenue Service collects the tax.',
    exceptions: [], refs: [ref(EUS, 'S.1313, D51A')], label: 'Income tax (municipal)', sub: 'Share of PIT', glyph: 'person',
    rev: { group: 'localpit', amount: pitLocal, locator: 'Eurostat gov_10a_taxag, 2024: S.1313 local government, D51A taxes on individual or household income, EUR million', caveat: 'Eurostat July 2026 vintage; the State’s part in the same source is EUR 703 million.' },
  },
  inst({
    id: 'lv-property-tax', parent: 'pasvaldibas', level: 'pasvaldibas', family: 'property', group: 'local', keys: ['D29A:C01', 'D29A:C03'],
    official: 'Immovable property tax (land, buildings, engineering structures and dwellings)', native: 'Nekustamā īpašuma nodoklis', common: 'Property tax',
    base: 'The cadastral value of land, buildings and engineering structures; dwellings have their own line in the National Tax List.',
    payer: 'Owners of the property.',
    rate: { kind: 'varies', headline: 'Set within a range by the law and the municipality', details: ['EUR 193.9 million "tax on property" and EUR 43.4 million "immovable property tax on dwellings" in 2024 in the National Tax List.'] },
    explanation: 'The only broad tax that municipalities levy themselves.',
    exceptions: [], refs: [ref(NTL, 'sheet LV, D29A C01 and C03')], label: 'Property tax', sub: 'Local', glyph: 'house',
  }),
];

const part = (g: string) => n.round(instruments.filter((i) => i.rev?.group === g).reduce((a, i) => a + i.rev!.amount, 0));
const sectorSum = (code: string) => ['S1311', 'S1312', 'S1313', 'S1314', 'S212'].reduce((a, s) => a + (sec[`${s}:${code}`] ?? 0), 0);
const vintage = ['D2', 'D5', 'D61'].map((c) => `${c}: NTL ${n.fmt(n.total(c))}, Eurostat July 2026 ${n.fmt(sectorSum(c))}`).join('; ');

const spec: CountrySpec = {
  today: D,
  id: 'latvia',
  iso3: 'LVA',
  isoNumeric: '428',
  names: { en: 'Latvia', native: 'Latvija', nativeLang: 'lv' },
  currency: { code: 'EUR', symbol: '€', name: 'Euro' },
  summary:
    'Latvia is a unitary state in which the Saeima sets every tax and the State Revenue Service collects almost all of them. The two largest flows are VAT and the 34.09% social insurance contributions. The personal income tax is a state tax, but most of its revenue goes to the municipalities of residence; the municipalities’ own tax is the property tax. Company profit is taxed only when it is distributed.',
  structureNote:
    'The figures are the Commission’s National Tax List for 2024. The personal income tax is drawn twice, as the State’s and the municipalities’ share, using Eurostat’s split of the same year. The sale of emission permits (EUR 90.8 million), the employers’ imputed social contributions (EUR 248.3 million) and the Riga tourist fee (EUR 1.75 million, the only municipal fee the list itemises) are left out. The social contributions are drawn under the State, which collects them for the State Social Insurance Agency.',
  theme: {
    accent: '#c0394b',
    accent2: '#f5e6c8',
    motif: 'topo',
    motifNote: 'Topographic contour lines over the outline of Latvia (the generic motif; no bespoke art yet).',
    mapLabel: { lon: 25.0, lat: 56.9 },
  },
  rootLabel: { label: 'Latvia', sub: 'Latvija · Fiscal folio' },
  levels: [
    {
      id: 'valsts', branch: 'national', official: 'The State (central government)', native: 'Valsts', common: 'State',
      description: 'The Saeima legislates all taxes; the State Revenue Service (VID) collects them and the mandatory state social insurance contributions, which fund pensions and other benefits through the State Social Insurance Agency.',
      fiscalPower: 'Rates and bases of all taxes are fixed by law in the Saeima; municipalities cannot create taxes.',
      refs: [ref(FM)], label: 'State', sub: 'Valsts',
    },
    {
      id: 'pasvaldibas', branch: 'local', official: 'Local governments (municipalities)', native: 'Pašvaldības', common: 'Municipalities',
      description: 'The only tier below the State. They receive most of the personal income tax paid by their residents, levy the immovable property tax within the range set by law, and charge a few local duties.',
      fiscalPower: 'Municipalities set the property tax rate within the limits fixed by the national law; the share of the personal income tax is fixed by law.',
      refs: [ref(EUS)], label: 'Municipalities', sub: 'Pašvaldības',
    },
  ],
  supporting: [],
  denominators: [
    {
      id: 'valsts-taxes-2024', label: 'State taxes (National Tax List), 2024',
      definition: 'The taxes on production and imports, on income and on capital that the National Tax List books to the State and the EU, other than the municipal lines and the sale of emission permits; includes the State’s part of the personal income tax.',
      levelIds: ['valsts'], amount: part('state'), period: y, sourceId: NTL,
      locator: 'Sheet LV, 2024, the lines listed with each tax',
      calculation: `Sum of the ${instruments.filter((i) => i.rev?.group === 'state').length} tax rows below (EUR million)`,
      caveat: `Calendar 2024; the list's cut-off was 30 October 2025. Vintage check against Eurostat's July 2026 accounts: ${vintage}.`,
    },
    {
      id: 'valsts-social-2024', label: 'Mandatory state social insurance contributions, 2024',
      definition: 'The actual compulsory social contributions of employers, employees and the self-employed, and voluntary contributions; imputed contributions are left out.',
      levelIds: ['valsts'], amount: part('social'), period: y, sourceId: NTL,
      locator: 'Sheet LV, 2024, lines D611, D613CE, D613CS and D613V',
      calculation: 'Sum of the social contribution rows below (EUR million)',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'pasvaldibas-pit-2024', label: 'Personal income tax received by the municipalities, 2024',
      definition: 'The part of the personal income tax that Eurostat’s accounts record under local government.',
      levelIds: ['pasvaldibas'], amount: part('localpit'), period: y, sourceId: EUS,
      locator: 'gov_10a_taxag, 2024, S.1313, D51A, million EUR',
      caveat: 'Eurostat July 2026 vintage, a different release from the National Tax List.',
    },
    {
      id: 'pasvaldibas-taxes-2024', label: 'Own taxes of the municipalities, 2024',
      definition: 'The immovable property tax.',
      levelIds: ['pasvaldibas'], amount: part('local'), period: y, sourceId: NTL,
      locator: 'Sheet LV, 2024, lines D29A C01 and C03',
      calculation: 'Sum of the local rows below (EUR million)',
      caveat: `Eurostat books EUR ${n.fmt(sec['S1313:D2'])} million of taxes on production to local government and the National Tax List itemises EUR ${n.fmt(part('local'))} million; EUR 17 million of the natural resource and permit revenue is attributed to local government by Eurostat but not itemised in the list.`,
    },
  ],
  sizing: {
    label: 'Taxes and compulsory social contributions of all levels of government',
    definition: 'The taxes of the State and the municipalities plus the actual social contributions, calendar 2024, as listed in the National Tax List and split by Eurostat. Excludes the sale of emission permits, imputed social contributions and the Riga tourist fee.',
    componentIds: ['valsts-taxes-2024', 'valsts-social-2024', 'pasvaldibas-pit-2024', 'pasvaldibas-taxes-2024'],
  },
  fromProfile: 'latvia',
  structureOverride: {
    basis: 'OECD attribution to sub-sectors of general government (Interpretative Guide, section A.12)',
    folioLevels: { central: ['valsts'], local: ['pasvaldibas'] },
    levelNotes: { central: 'The OECD shows the social security funds separately; the folio draws their contributions under the State.' },
  },
  groups: {
    state: { title: 'State taxes 2024 – National Tax List (EUR million)', denominatorId: 'valsts-taxes-2024', period: y, basis: 'ESA tax revenue, general government and EU institutions', sourceId: NTL },
    social: { title: 'Social contributions 2024 – National Tax List (EUR million)', denominatorId: 'valsts-social-2024', period: y, basis: 'Actual compulsory and voluntary contributions', sourceId: NTL },
    localpit: { title: 'Municipal share of the personal income tax 2024 – Eurostat (EUR million)', denominatorId: 'pasvaldibas-pit-2024', period: y, basis: 'ESA taxes received by local government', sourceId: EUS },
    local: { title: 'Municipal taxes 2024 – National Tax List (EUR million)', denominatorId: 'pasvaldibas-taxes-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
  },
  sources: [
    { id: NTL, org: 'European Commission, DG Taxation and Customs Union, with Eurostat', title: 'Data on Taxation Trends: National Tax Lists (NTL), edition 2026', url: 'https://taxation-customs.ec.europa.eu/taxation/economic-analysis/data-taxation-trends_en', kind: 'statistics', language: 'en', publishedDate: '2026-03-31', periodCovered: 'Calendar year 2024 (series from 1995)', accessed: D, nextExpected: '2027-03', note: 'Workbook "NTL edition 2026 web.xlsx", sheet LV: every tax and social contribution by its national name and ESA code, in EUR million, for general government plus EU institutions. Data cut-off 30 October 2025.' },
    { id: EUS, org: 'Eurostat', title: 'Main national accounts tax aggregates (gov_10a_taxag)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table', kind: 'statistics', language: 'en', publishedDate: '2026-07-21', periodCovered: 'Calendar year 2024', accessed: D, nextExpected: '2027-07', note: 'Taxes and social contributions by sub-sector and ESA item; used to split the personal income tax between the State (S.1311, EUR 703 million) and local government (S.1313, EUR 2,167 million) and to check the totals.' },
    { id: FM, org: 'Ministry of Finance of Latvia', title: 'Changes in taxation and finances from 2026 (with the rates of 2024, 2025 and 2026)', url: 'https://www.fm.gov.lv/en/changes-taxation-and-finances-2026', kind: 'guidance', language: 'en', publishedDate: '2026-02-24', periodCovered: '2024 to 2026', accessed: D, note: 'Table of social insurance contribution rates (34.09%: employer 23.59%, employee 10.5%) and personal income tax rates (20/23/31% in 2024; 25.5/33% from 2025), plus 2026 changes in corporate income tax, VAT, excise (alcohol rates to 2028), gambling tax and the vehicle operation tax.' },
  ],
  instruments,
};

buildCountry(spec);
n.reconcile(part('state') + part('social') + part('local') + pitLocal, ['D612:C01', 'D29F:C02', 'D214H:C02']);
const left = n.unused().filter((l) => !['D612:C01', 'D29F:C02', 'D214H:C02', 'D51A:C01', 'D611C:C01', 'D6111:C01', 'D6112:C01', 'D613:C01', 'D613C:C01', 'D6131:C01', 'D6132:C01'].includes(l.key));
if (left.length) console.log('NTL lines not used:', left.map((l) => l.key + '=' + l.v2024).join(', '));
