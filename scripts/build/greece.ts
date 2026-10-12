/**
 * Greece: the folio's data. Run: npx tsx scripts/build/greece.ts
 * Figures: Commission / Eurostat National Tax List (NTL), edition 2026, sheet EL, calendar 2024, EUR million
 * (scripts/build/data/ntl-EL.json). Level placement checked against Eurostat gov_10a_taxag.
 * Rates: PwC Worldwide Tax Summaries (review of 8 September 2026), a professional-firm summary.
 */
import { buildCountry, type CountrySpec, type InstSpec, type Ref } from '../lib/build-country';
import { loadNtl, loadSectors } from '../lib/ntl';

const D = '2026-10-12';
const y = { label: '2024', kind: 'calendar-year' as const, start: '2024-01-01', end: '2024-12-31' };
const ref = (id: string, loc?: string): Ref => (loc ? [id, loc] : [id]);
const n = loadNtl('EL', 'EUR');
const sec = loadSectors('EL');
const NTL = 'ntl-2026';
const EUS = 'eurostat-taxag';
const PWC_CIT = 'pwc-el-corporate';
const PWC_PIT = 'pwc-el-individual';
const PWC_OTH = 'pwc-el-other';
const PWC_NOTE = 'As summarised by PwC (review of 8 September 2026), not checked against the Independent Authority for Public Revenue (AADE).';

const inst = (i: Omit<InstSpec, 'rev'> & { keys: string[]; group: string }): InstSpec => {
  const { keys, group, ...rest } = i;
  return { ...rest, rev: n.rev(group, keys) };
};

/* the line "taxes on household buildings" is split by Eurostat's local figure for D59A (refuse fees of households are local) */
const hhBuildings = n.sum(['D59A:C02']);
const hhRefuse = n.value('D59A:C01');
const hhBuildingsLocal = n.round(sec['S1313:D59A'] - hhRefuse);
const hhBuildingsState = n.round(hhBuildings - hhBuildingsLocal);

const instruments: InstSpec[] = [
  /* ---- the State: income taxes ---- */
  inst({
    id: 'gr-income-tax-individuals', parent: 'kratos', level: 'kratos', family: 'income-personal', group: 'state', keys: ['D51A:C01'],
    official: 'Income tax on individuals', native: 'Φόρος εισοδήματος φυσικών προσώπων', common: 'Personal income tax',
    base: 'Employment, pension and business income of individuals.',
    payer: 'Individuals; employers and pension funds withhold it.',
    rate: { kind: 'progressive', headline: '9% to 44% (2026 scale)', details: ['2026 scale for salaries, pensions and business profits: 9% on the first EUR 10,000, 20% on the next 10,000, 26% on the next 10,000, 34% on the next 10,000, 39% on the next 20,000 and 44% above EUR 60,000; lower scales apply by number of children and for people under 30 (PwC).', 'The scale of 2024, the year of the revenue, was different.', PWC_NOTE], asOf: '2026-09-08' },
    explanation: 'The largest direct tax.',
    exceptions: [], refs: [ref(PWC_PIT, 'Personal income tax rates')], label: 'Personal income tax', sub: '9–44%', glyph: 'person',
  }),
  inst({
    id: 'gr-income-tax-other-individuals', parent: 'kratos', level: 'kratos', family: 'income-personal', group: 'state', keys: ['D51A:C02', 'D51A:C03'],
    official: 'Taxes on interest and other taxes on individuals, and the tax on pensions (AGAGE)', native: 'Φόρος τόκων και λοιποί φόροι φυσικών προσώπων', common: 'Interest and pension taxes',
    base: 'As named in the National Tax List: taxes on interest and other taxes on individuals (EUR 760 million) and a tax on pensions (AGAGE, EUR 627 million).',
    payer: 'Individuals.',
    rate: { kind: 'varies', headline: 'Set by the Income Tax Code', details: ['Eurostat records EUR 126 million of income taxes under the social security funds; the list does not say which line.'] },
    explanation: 'Two lines.',
    exceptions: [], refs: [ref(NTL, 'sheet EL, D51A C02 and C03')], label: 'Interest and pension taxes', sub: 'Individuals', glyph: 'coin',
  }),
  inst({
    id: 'gr-corporate-income-tax', parent: 'kratos', level: 'kratos', family: 'income-corporate', group: 'state', keys: ['D51B:C01'],
    official: 'Income tax on corporations', native: 'Φόρος εισοδήματος νομικών προσώπων', common: 'Corporate income tax',
    base: 'Profit of companies and other legal entities.',
    payer: 'Companies.',
    rate: { kind: 'flat', headline: '22% standard (credit institutions 29%)', details: ['The standard corporate income tax rate is 22% for entities other than credit institutions; 29% applies to credit institutions in certain cases (PwC).', PWC_NOTE], asOf: '2026-09-08' },
    explanation: 'Revenue was EUR 6.9 billion in 2024.',
    exceptions: [], refs: [ref(PWC_CIT, 'Corporate income tax rates')], label: 'Corporate income tax', sub: '22%', glyph: 'factory',
  }),
  inst({
    id: 'gr-shipowners-tax', parent: 'kratos', level: 'kratos', family: 'income-corporate', group: 'state', keys: ['D51B:C02'],
    official: 'Taxes on shipowners', native: 'Φόρος πλοιοκτητών', common: 'Shipowners’ tax',
    base: 'Ships in the Greek tonnage tax regime, as named in the National Tax List.',
    payer: 'Shipowners.',
    rate: { kind: 'varies', headline: 'Set by the tonnage tax regime', details: [] },
    explanation: 'EUR 240 million in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet EL, D51B C02')], label: 'Shipowners’ tax', sub: 'Tonnage', glyph: 'ship',
  }),
  inst({
    id: 'gr-other-income-taxes', parent: 'kratos', level: 'kratos', family: 'income-mixed', group: 'state', keys: ['D51E:C02', 'D51D:C01'],
    official: 'Various taxes on income and taxes on winnings from lotteries and gambling', native: 'Διάφοροι φόροι εισοδήματος· φόρος κερδών από τυχερά παιχνίδια', common: 'Other income taxes and winnings tax',
    base: 'As named in the National Tax List: "Various" taxes on income (EUR 1,074 million) and taxes on winnings (EUR 346 million); the list gives no more detail on the first.',
    payer: 'Taxpayers and winners.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Two lines.',
    exceptions: [], refs: [ref(NTL, 'sheet EL, D51E C02, D51D C01')], label: 'Other income taxes', sub: 'Various · winnings', glyph: 'coin',
  }),
  /* ---- social contributions ---- */
  inst({
    id: 'gr-social-employers', parent: 'kratos', level: 'kratos', category: 'social-contribution', family: 'social-security', group: 'socialer', keys: ['D611:C01'],
    official: 'Employers’ social security contributions', native: 'Εισφορές εργοδοτών', common: 'Employers’ contributions',
    base: 'Gross pay up to a monthly ceiling (EUR 7,761.94 from 1 January 2026).',
    payer: 'Employers.',
    rate: { kind: 'flat', headline: '21.79% of gross pay', details: ['Since 1 January 2025 contributions are 21.79% for the employer and 13.37% for the employee, 35.16% in all (PwC).', PWC_NOTE], asOf: '2026-09-08' },
    explanation: 'Pension contributions EUR 9.8 billion and other contributions EUR 3.2 billion in 2024.',
    exceptions: [], refs: [ref(PWC_OTH, 'Social security contributions'), ref(NTL, 'sheet EL, D611')], label: 'Social: employers', sub: '21.79%', glyph: 'heart',
  }),
  inst({
    id: 'gr-social-employees', parent: 'kratos', level: 'kratos', category: 'social-contribution', family: 'social-security', group: 'socialhh', keys: ['D613CE:C01'],
    official: 'Employees’ social security contributions', native: 'Εισφορές εργαζομένων', common: 'Employees’ contributions',
    base: 'Gross pay up to the same ceiling.',
    payer: 'Employees; the employer withholds.',
    rate: { kind: 'flat', headline: '13.37% of gross pay', details: ['See the employers’ line for the sources (PwC).', PWC_NOTE], asOf: '2026-09-08' },
    explanation: 'The list gives the households’ contributions as one amount, all by employees: pension EUR 10.1 billion, other EUR 4.5 billion.',
    exceptions: [], refs: [ref(PWC_OTH, 'Social security contributions'), ref(NTL, 'sheet EL, D613CE')], label: 'Social: employees', sub: '13.37%', glyph: 'heart',
  }),
  /* ---- the State: consumption ---- */
  inst({
    id: 'gr-vat', parent: 'kratos', level: 'kratos', family: 'general-consumption', group: 'state', keys: ['D211:C01'],
    official: 'Value added tax', native: 'Φόρος προστιθέμενης αξίας (ΦΠΑ)', common: 'VAT', abbr: 'ΦΠΑ',
    base: 'Goods and services supplied in Greece and imports.',
    payer: 'Consumers; businesses charge it and claim input credits.',
    rate: { kind: 'range', headline: '24% standard; 13% reduced', details: ['24% for everything not listed as reduced or super-reduced; 13% on ready-to-eat food, non-alcoholic drinks, basic foodstuffs and other goods (PwC).', PWC_NOTE], asOf: '2026-09-08' },
    explanation: 'The largest tax: EUR 21.4 billion.',
    exceptions: [], refs: [ref(PWC_OTH, 'Value-added tax')], label: 'VAT', sub: '24%', glyph: 'cart',
  }),
  inst({
    id: 'gr-customs', parent: 'kratos', level: 'kratos', category: 'customs-duty', family: 'trade', group: 'state', keys: ['D2121:C01'],
    official: 'Import duties', native: 'Δασμοί εισαγωγής', common: 'Customs duties',
    base: 'Goods imported from outside the EU, by the Common Customs Tariff.',
    payer: 'Importers.',
    rate: { kind: 'varies', headline: 'EU Common Customs Tariff', details: ['An EU own resource; Eurostat records it under the EU institutions.'] },
    explanation: 'Collected for the EU budget.',
    exceptions: [], refs: [ref(EUS, 'S.212, D212')], label: 'Customs duties', sub: 'EU tariff', glyph: 'ship',
  }),
  inst({
    id: 'gr-excise-fuel', parent: 'kratos', level: 'kratos', family: 'specific-consumption', group: 'state', keys: ['D214A:C02', 'D2122C:C01'],
    official: 'Excise duties on oil products and natural gas', native: 'Ειδικός φόρος κατανάλωσης σε πετρελαιοειδή και φυσικό αέριο', common: 'Fuel excise',
    base: 'Petrol, diesel, heating oil and natural gas, by quantity.',
    payer: 'Producers and importers; passed on at the pump.',
    rate: { kind: 'specific', headline: 'Per 1,000 litres', details: [] },
    explanation: 'The biggest excise: EUR 3.9 billion on domestic and EUR 0.2 billion on imported.',
    exceptions: [], refs: [ref(NTL, 'sheet EL, D214A C02, D2122C C01')], label: 'Fuel excise', sub: 'Oil products', glyph: 'flame',
  }),
  inst({
    id: 'gr-excise-tobacco', parent: 'kratos', level: 'kratos', family: 'specific-consumption', group: 'state', keys: ['D214A:C03', 'D2122C:C03'],
    official: 'Excise duties on tobacco products', native: 'Ειδικός φόρος κατανάλωσης σε προϊόντα καπνού', common: 'Tobacco excise',
    base: 'Cigarettes and other tobacco products.',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'mechanism', headline: 'Fixed by law', details: [] },
    explanation: 'EUR 2.3 billion in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet EL, D214A C03, D2122C C03')], label: 'Tobacco excise', sub: 'Cigarettes', glyph: 'smoke',
  }),
  inst({
    id: 'gr-excise-alcohol-other', parent: 'kratos', level: 'kratos', family: 'specific-consumption', group: 'state', keys: ['D214A:C05', 'D214A:C04', 'D2122C:C02', 'D214A:C06', 'D2122C:C05'],
    official: 'Taxes on alcoholic drinks and beer, and on coffee and electronic cigarettes', native: 'Φόρος σε αλκοολούχα ποτά και μπίρα· καφέ και ηλεκτρονικά τσιγάρα', common: 'Alcohol, coffee and e-cigarette taxes',
    base: 'Alcoholic drinks (EUR 368 million and 2 million), beer (EUR 203 million), coffee and electronic cigarettes (EUR 108 million and 60 million).',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'specific', headline: 'Per unit', details: [] },
    explanation: 'Five lines.',
    exceptions: [], refs: [ref(NTL, 'sheet EL, D214A C04 to C06, D2122C C02 and C05')], label: 'Alcohol, coffee, e-cigarettes', sub: 'Excises', glyph: 'wine',
  }),
  inst({
    id: 'gr-energy-taxes', parent: 'kratos', level: 'kratos', category: 'special-levy', family: 'specific-consumption', group: 'state', keys: ['D214A:C08', 'D214A:C07', 'D214A:C09'],
    official: 'Tax on electricity for public services benefits (YKO), new tax on electricity and new green tax on diesel', native: 'Ειδικό τέλος ΥΚΩ· νέος φόρος ηλεκτρικής ενέργειας· νέος πράσινος φόρος πετρελαίου', common: 'Electricity and green diesel levies',
    base: 'Electricity consumers (the public service obligations levy EUR 643 million, the new tax on electricity EUR 164 million) and diesel (the new green tax, EUR 115 million).',
    payer: 'Electricity and fuel consumers.',
    rate: { kind: 'specific', headline: 'Per unit of energy', details: [] },
    explanation: 'Three levies that the list books among taxes on products.',
    exceptions: [], refs: [ref(NTL, 'sheet EL, D214A C07 to C09')], label: 'Electricity and diesel levies', sub: 'YKO · green', glyph: 'bolt',
  }),
  inst({
    id: 'gr-stamp-taxes', parent: 'kratos', level: 'kratos', family: 'property', group: 'state', keys: ['D214B:C01', 'D214B:C02'],
    official: 'Stamp taxes on products and on legal documents', native: 'Χαρτόσημο', common: 'Stamp taxes',
    base: 'Legal documents and certain products.',
    payer: 'Parties to the documents.',
    rate: { kind: 'varies', headline: 'By type of document', details: [] },
    explanation: 'EUR 575 million.',
    exceptions: [], refs: [ref(NTL, 'sheet EL, D214B')], label: 'Stamp taxes', sub: 'Documents', glyph: 'stamp',
  }),
  inst({
    id: 'gr-asset-sale-taxes', parent: 'kratos', level: 'kratos', family: 'property', group: 'state', keys: ['D214C:C01', 'D214C:C02'],
    official: 'Taxes on the sale of non-financial and financial assets', native: 'Φόρος μεταβίβασης ακινήτων· φόρος συναλλαγών επί μετοχών', common: 'Taxes on asset sales',
    base: 'Non-financial assets such as real estate (EUR 648 million) and financial assets (EUR 43 million).',
    payer: 'Sellers or buyers, by the law.',
    rate: { kind: 'varies', headline: 'By type of asset', details: [] },
    explanation: 'Two lines.',
    exceptions: [], refs: [ref(NTL, 'sheet EL, D214C')], label: 'Asset sale taxes', sub: 'Real estate · shares', glyph: 'stamp',
  }),
  inst({
    id: 'gr-vehicle-taxes', parent: 'kratos', level: 'kratos', family: 'specific-consumption', group: 'state', keys: ['D214D:C01', 'D59D:C01', 'D29E:C03'],
    official: 'Car registration taxes, car circulation licences and vehicle licences for businesses', native: 'Τέλος ταξινόμησης· τέλη κυκλοφορίας', common: 'Vehicle taxes',
    base: 'Registration of cars (EUR 446 million), annual circulation fees (EUR 810 million) and vehicle licences of businesses (EUR 397 million).',
    payer: 'Vehicle owners.',
    rate: { kind: 'varies', headline: 'By engine size and emissions', details: [] },
    explanation: 'Three lines.',
    exceptions: [], refs: [ref(NTL, 'sheet EL, D214D C01, D59D C01, D29E C03')], label: 'Vehicle taxes', sub: 'Registration · circulation', glyph: 'car',
  }),
  inst({
    id: 'gr-insurance-tax', parent: 'kratos', level: 'kratos', family: 'specific-consumption', group: 'state', keys: ['D214G:C01'],
    official: 'Taxes on insurance premiums', native: 'Φόρος ασφαλίστρων', common: 'Insurance premium tax',
    base: 'Insurance premiums.',
    payer: 'Policyholders.',
    rate: { kind: 'varies', headline: 'A percentage of premiums', details: [] },
    explanation: 'EUR 591 million.',
    exceptions: [], refs: [ref(NTL, 'sheet EL, D214G')], label: 'Insurance tax', sub: 'Premiums', glyph: 'shield',
  }),
  inst({
    id: 'gr-gambling', parent: 'kratos', level: 'kratos', family: 'specific-consumption', group: 'state', keys: ['D214H:C04', 'D214H:C09', 'D214F:C01'],
    official: 'Taxes on the profits of OPAP, on casino profits and on lotteries', native: 'Φόρος κερδών ΟΠΑΠ· φόρος καζίνο', common: 'Gambling taxes',
    base: 'As named in the National Tax List: the profits of OPAP (the gaming operator; EUR 664 million), the profits of casinos (EUR 57 million) and lotteries (EUR 1 million).',
    payer: 'Gambling operators.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Three lines.',
    exceptions: [], refs: [ref(NTL, 'sheet EL, D214H C04 and C09, D214F C01')], label: 'Gambling taxes', sub: 'OPAP · casinos', glyph: 'dice',
  }),
  inst({
    id: 'gr-telecom-taxes', parent: 'kratos', level: 'kratos', family: 'specific-consumption', group: 'state', keys: ['D214H:C03', 'D214H:C05', 'D214H:C06'],
    official: 'Taxes on mobile phone use, fixed telephony and subscription pay television', native: 'Φόρος κινητής, σταθερής τηλεφωνίας και συνδρομητικής τηλεόρασης', common: 'Telecommunications taxes',
    base: 'Mobile phones (EUR 158 million), fixed network telephony (EUR 67 million) and subscription pay television (EUR 22 million).',
    payer: 'Users.',
    rate: { kind: 'varies', headline: 'A percentage of the bill', details: [] },
    explanation: 'Three lines.',
    exceptions: [], refs: [ref(NTL, 'sheet EL, D214H C03, C05, C06')], label: 'Telecom taxes', sub: 'Mobile · pay TV', glyph: 'bolt',
  }),
  inst({
    id: 'gr-hotels-advertising', parent: 'kratos', level: 'kratos', family: 'specific-consumption', group: 'state', keys: ['D214H:C02', 'D214H:C01', 'D214H:C10'],
    official: 'Taxes on hotels, restaurants and similar services, on advertising and on air tickets', native: 'Φόροι ξενοδοχείων, εστιατορίων, διαφήμισης και αεροπορικών εισιτηρίων', common: 'Hotel, restaurant and advertising taxes',
    base: 'Hotels, restaurants and similar services (EUR 490 million), advertising (EUR 85 million) and air tickets (EUR 1 million).',
    payer: 'Users and advertisers.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Three lines.',
    exceptions: [], refs: [ref(NTL, 'sheet EL, D214H C01, C02, C10')], label: 'Hotel and advertising taxes', sub: 'Services', glyph: 'bed',
  }),
  inst({
    id: 'gr-wholesale-sales-tax', parent: 'kratos', level: 'kratos', family: 'general-consumption', group: 'state', keys: ['D214I:C01', 'D214I:C02'],
    official: 'Wholesale sales taxes and other general sales taxes', native: 'Φόροι χονδρικής πώλησης', common: 'Wholesale sales taxes',
    base: 'As named in the National Tax List; no further detail.',
    payer: 'Not given in the list.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'EUR 178 million.',
    exceptions: [], refs: [ref(NTL, 'sheet EL, D214I')], label: 'Wholesale sales taxes', sub: 'Wholesale', glyph: 'cart',
  }),
  /* ---- property, environment and others at the State level ---- */
  inst({
    id: 'gr-property-tax-enfia', parent: 'kratos', level: 'kratos', family: 'property', group: 'state', keys: ['D29A:C04', 'D29A:C03', 'D59A:C03', 'D59F:C01'],
    official: 'Tax on buildings (ENFIA) and the new tax on household buildings', native: 'Ενιαίος Φόρος Ιδιοκτησίας Ακινήτων (ΕΝΦΙΑ)', common: 'Property tax (ENFIA)', abbr: 'ENFIA',
    base: 'As named in the National Tax List: the new tax on buildings (ENFIA, EUR 2,364 million), the new tax on household buildings (EETHDE, EUR 11 million) and a tax on buildings (EUR 6 million).',
    payer: 'Owners of property.',
    rate: { kind: 'varies', headline: 'Set by the ENFIA law', details: [] },
    explanation: 'The State’s property tax. Eurostat books it under central government.',
    exceptions: [], refs: [ref(NTL, 'sheet EL, D29A C03 and C04, D59A C03, D59F C01')], label: 'Property tax (ENFIA)', sub: 'Buildings', glyph: 'house',
  }),
  {
    id: 'gr-household-buildings-tax-state', parent: 'kratos', level: 'kratos', family: 'property',
    official: 'Taxes on household buildings, part not recorded under local government', native: 'Φόροι κτιρίων νοικοκυριών', common: 'Household buildings taxes: State part',
    base: 'As named in the National Tax List: taxes on household buildings; the list gives one amount of EUR 516 million.',
    payer: 'Owners of homes.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Eurostat’s accounts book EUR 1,258 million of the "other current taxes" on property under local government; after the refuse fees of households (EUR 970 million) the rest, EUR 288 million, is assigned to the household buildings line, and the remainder to the State.',
    exceptions: [], refs: [ref(NTL, 'sheet EL, D59A C02'), ref(EUS, 'S.1311 and S.1313, D59A')], label: 'Household buildings (State)', sub: 'State part', glyph: 'house',
    rev: { group: 'state', amount: hhBuildingsState, locator: 'NTL 2026, sheet EL, D59A C02 Taxes on household buildings, 2024, less the part recorded under local government', calculation: `${n.fmt(hhBuildings)} − ${n.fmt(hhBuildingsLocal)} = ${n.fmt(hhBuildingsState)} (EUR million)`, caveat: 'The local part is Eurostat’s total for local government (S.1313, D59A) less the refuse fees of households; the allocation to this line is an inference from the amounts.' },
  },
  inst({
    id: 'gr-pollution-taxes', parent: 'kratos', level: 'kratos', category: 'tax', family: 'resource', group: 'state', keys: ['D29F:C01', 'D29F:C02'],
    official: 'Taxes on pollution and other pollution-related taxes received by LAGIE', native: 'Φόροι ρύπανσης· εισπράξεις ΛΑΓΗΕ', common: 'Pollution taxes',
    base: 'As named in the National Tax List: "taxes on pollution" (EUR 1,466 million) and other pollution-related taxes received by LAGIE (the electricity market operator; EUR 725 million). The list does not say whether the first line includes revenue from the auction of emission allowances.',
    payer: 'Polluters and electricity producers.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Two lines.',
    exceptions: [], refs: [ref(NTL, 'sheet EL, D29F')], label: 'Pollution taxes', sub: 'Environment', glyph: 'leaf',
  }),
  inst({
    id: 'gr-licences-fees', parent: 'kratos', level: 'kratos', category: 'fee', family: 'other', group: 'state', keys: ['D29E:C02', 'D29E:C01', 'D29H:C03', 'D29H:C06', 'D29H:C01', 'D29H:C02', 'D29H:C04', 'D91A:C01', 'D214L:C01', 'D214A:C10'],
    official: 'Professional licences, taxes paid by farmers, taxes on the balance of loans, inheritance and capital transfers, and other small taxes', native: 'Επαγγελματικές άδειες· εισφορά αγροτών προς ΕΛΓΑ· φόρος κληρονομιών', common: 'Licences, farmers’ levy and other small taxes',
    base: 'Professional licences (EUR 487 million), taxes on the balance of loans and credit balances (EUR 263 million), taxes paid by farmers to ELGA (EUR 143 million), inheritance and capital transfer taxes (EUR 236 million), plastic bags (EUR 30 million), and small lines.',
    payer: 'Professionals, farmers, banks, heirs.',
    rate: { kind: 'varies', headline: 'Set by law', details: ['Eurostat books EUR 4 million of the "Various" licence line under local government; the list does not say which part, so it is drawn here.'] },
    explanation: 'Ten lines.',
    exceptions: [], refs: [ref(NTL, 'sheet EL, D29E, D29H, D91A, D214L, D214A C10')], label: 'Licences and other levies', sub: 'ELGA · inheritance', glyph: 'stamp',
  }),
  /* ---- local government ---- */
  inst({
    id: 'gr-municipal-refuse-fees', parent: 'ota', level: 'ota', category: 'fee', family: 'property', group: 'localrefuse', keys: ['D59A:C01', 'D29A:C02'],
    official: 'Municipal refuse fees paid by households and by professionals', native: 'Δημοτικά τέλη καθαριότητας και φωτισμού', common: 'Municipal refuse fees',
    base: 'Households (EUR 970 million) and professionals (EUR 415 million); the fees are charged on the area of the property.',
    payer: 'Households and businesses.',
    rate: { kind: 'varies', headline: 'Set by each municipality', details: [] },
    explanation: 'The largest source of own revenue in the list for municipalities. Eurostat books both lines under local government.',
    exceptions: [], refs: [ref(NTL, 'sheet EL, D59A C01, D29A C02'), ref(EUS, 'S.1313, D29A and D59A')], label: 'Municipal refuse fees', sub: 'Households · professionals', glyph: 'town',
  }),
  {
    id: 'gr-household-buildings-tax-local', parent: 'ota', level: 'ota', family: 'property',
    official: 'Taxes on household buildings, part recorded under local government', native: 'Φόροι κτιρίων νοικοκυριών (ΟΤΑ)', common: 'Household buildings taxes: local part',
    base: 'The same line as the State part: taxes on household buildings.',
    payer: 'Owners of homes.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'The part of the line that Eurostat’s accounts record under local government.',
    exceptions: [], refs: [ref(NTL, 'sheet EL, D59A C02'), ref(EUS, 'S.1313, D59A')], label: 'Household buildings (local)', sub: 'Local part', glyph: 'house',
    rev: { group: 'localhh', amount: hhBuildingsLocal, locator: 'Eurostat gov_10a_taxag, 2024: S.1313 local government, D59A other current taxes, less the refuse fees of households (NTL D59A C01), EUR million', calculation: `${n.fmt(n.round(sec['S1313:D59A']))} − ${n.fmt(hhRefuse)} = ${n.fmt(hhBuildingsLocal)} (EUR million)`, caveat: 'The allocation of the remainder to the household buildings line is an inference from the amounts; Eurostat and the list agree on the total of the line.' },
  },
  inst({
    id: 'gr-municipal-land-fees', parent: 'ota', level: 'ota', family: 'property', group: 'local', keys: ['D29A:C01', 'D29B:C01', 'D91B:C01'],
    official: 'Taxes on land and buildings, on the use of streets, and capital levies', native: 'Τέλη ακινήτων και κοινόχρηστων χώρων', common: 'Municipal land and street fees',
    base: 'As named in the National Tax List: taxes on land, buildings or other structures (EUR 164 million), on the use of decks, streets and lighting (EUR 8 million) and capital levies (EUR 32 million).',
    payer: 'Property owners and users of public space.',
    rate: { kind: 'varies', headline: 'Set by each municipality', details: [] },
    explanation: 'Three small local lines.',
    exceptions: [], refs: [ref(NTL, 'sheet EL, D29A C01, D29B C01, D91B C01'), ref(EUS, 'S.1313, D29A, D29B, D91')], label: 'Land and street fees', sub: 'Local', glyph: 'town',
  }),
];

const part = (g: string) => n.round(instruments.filter((i) => i.rev?.group === g).reduce((a, i) => a + i.rev!.amount, 0));
const sectorSum = (code: string) => ['S1311', 'S1312', 'S1313', 'S1314', 'S212'].reduce((a, s) => a + (sec[`${s}:${code}`] ?? 0), 0);
const vintage = ['D2', 'D5', 'D61'].map((c) => `${c}: NTL ${n.fmt(n.total(c))}, Eurostat July 2026 ${n.fmt(sectorSum(c))}`).join('; ');

const spec: CountrySpec = {
  today: D,
  id: 'greece',
  iso3: 'GRC',
  isoNumeric: '300',
  names: { en: 'Greece', native: 'Ελλάδα', nativeLang: 'el' },
  currency: { code: 'EUR', symbol: '€', name: 'Euro' },
  summary:
    'Greece is a unitary state: Parliament sets every tax and the Independent Authority for Public Revenue (AADE) collects them. The largest flows are VAT, the social security contributions, the personal income tax, the excises on fuel and tobacco, and a unified property tax (ENFIA). Municipalities live on refuse fees charged with the electricity bill and a few small local taxes.',
  structureNote:
    'The figures are the Commission’s National Tax List for 2024. The employers’ imputed social contributions (EUR 3,931 million) are left out. The social contributions are drawn under the State. The refuse fees of municipalities and a part of the household buildings line are placed under local government following Eurostat’s accounts. The list does not say whether the pollution tax line includes revenue from the auction of emission allowances; it is drawn as named.',
  theme: {
    accent: '#0d5eaf',
    accent2: '#ffffff',
    motif: 'topo',
    motifNote: 'Topographic contour lines over the outline of Greece (the generic motif; no bespoke art yet).',
    mapLabel: { lon: 22.8, lat: 39.3 },
  },
  rootLabel: { label: 'Greece', sub: 'Ελλάδα · Fiscal folio' },
  levels: [
    {
      id: 'kratos', branch: 'national', official: 'The State (Hellenic Republic)', native: 'Κράτος', common: 'State',
      description: 'Parliament legislates all taxes; the Independent Authority for Public Revenue (AADE) collects them and EFKA, the unified social security fund, receives the contributions.',
      fiscalPower: 'Taxes are set by law; local authorities set only the fees that the law lets them charge.',
      refs: [ref(NTL)], label: 'State', sub: 'Κράτος',
    },
    {
      id: 'ota', branch: 'local', official: 'Local government (municipalities and regions)', native: 'Αυτοδιοίκηση (ΟΤΑ)', common: 'Local government',
      description: 'Municipalities and regions. They charge refuse and street fees and receive a part of a building tax; most of their revenue comes from State transfers.',
      fiscalPower: 'Municipal councils set fees within the limits of national law.',
      refs: [ref(EUS)], label: 'Local government', sub: 'ΟΤΑ',
    },
  ],
  supporting: [],
  denominators: [
    {
      id: 'kratos-taxes-2024', label: 'State taxes (National Tax List), 2024',
      definition: 'The taxes on production and imports, on income and on capital that the National Tax List books to the State and the EU, other than the local lines; includes the State part of the taxes on household buildings.',
      levelIds: ['kratos'], amount: part('state'), period: y, sourceId: NTL,
      locator: 'Sheet EL, 2024, the lines listed with each tax',
      calculation: `Sum of the ${instruments.filter((i) => i.rev?.group === 'state').length} tax rows below (EUR million)`,
      caveat: `Calendar 2024; the list's cut-off was 30 October 2025. Vintage check against Eurostat's July 2026 accounts: ${vintage}.`,
    },
    {
      id: 'kratos-social-employers-2024', label: 'Social contributions paid by employers, 2024',
      definition: 'The actual compulsory contributions of employers; imputed contributions are left out.',
      levelIds: ['kratos'], amount: part('socialer'), period: y, sourceId: NTL,
      locator: 'Sheet EL, 2024, line D611 C01',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'kratos-social-households-2024', label: 'Social contributions paid by households, 2024',
      definition: 'The compulsory contributions of employees.',
      levelIds: ['kratos'], amount: part('socialhh'), period: y, sourceId: NTL,
      locator: 'Sheet EL, 2024, line D613CE',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'ota-refuse-2024', label: 'Municipal refuse fees, 2024',
      definition: 'The refuse fees paid by households and by professionals.',
      levelIds: ['ota'], amount: part('localrefuse'), period: y, sourceId: NTL,
      locator: 'Sheet EL, 2024, lines D59A C01 and D29A C02',
      caveat: 'Calendar 2024, same list and cut-off as the State taxes.',
    },
    {
      id: 'ota-household-buildings-2024', label: 'Household buildings taxes recorded under local government, 2024',
      definition: 'The part of the taxes on household buildings that Eurostat’s accounts record under local government.',
      levelIds: ['ota'], amount: part('localhh'), period: y, sourceId: EUS,
      locator: 'gov_10a_taxag, 2024, S.1313, D59A, less the refuse fees of households, million EUR',
      caveat: 'Eurostat July 2026 vintage; the allocation to the household buildings line is an inference from the amounts.',
    },
    {
      id: 'ota-other-2024', label: 'Land, street and capital fees of local government, 2024',
      definition: 'The taxes on land and buildings, the use of streets and capital levies of local government.',
      levelIds: ['ota'], amount: part('local'), period: y, sourceId: NTL,
      locator: 'Sheet EL, 2024, lines D29A C01, D29B C01, D91B C01',
      caveat: `Eurostat books EUR ${n.fmt(sec['S1313:D2'])} million of taxes on production and EUR ${n.fmt(sec['S1313:D5'])} million of taxes on income and wealth to local government, together with EUR ${n.fmt(sec['S1313:D91'])} million of capital taxes; the local rows drawn here come to EUR ${n.fmt(part('localrefuse') + part('localhh') + part('local'))} million in all.`,
    },
  ],
  sizing: {
    label: 'Taxes and compulsory social contributions of all levels of government',
    definition: 'The taxes of the State and of local government plus the actual social contributions, calendar 2024, as listed in the National Tax List and split by Eurostat. Excludes the employers’ imputed social contributions.',
    componentIds: ['kratos-taxes-2024', 'kratos-social-employers-2024', 'kratos-social-households-2024', 'ota-refuse-2024', 'ota-household-buildings-2024', 'ota-other-2024'],
  },
  fromProfile: 'greece',
  structureOverride: {
    basis: 'OECD attribution to sub-sectors of general government (Interpretative Guide, section A.12)',
    folioLevels: { central: ['kratos'], local: ['ota'] },
    levelNotes: { central: 'The OECD shows the social security funds separately; the folio draws their contributions under the State.' },
  },
  groups: {
    state: { title: 'State taxes 2024 – National Tax List (EUR million)', denominatorId: 'kratos-taxes-2024', period: y, basis: 'ESA tax revenue, general government and EU institutions', sourceId: NTL },
    socialer: { title: 'Employers’ social contributions 2024 – National Tax List (EUR million)', denominatorId: 'kratos-social-employers-2024', period: y, basis: 'Actual compulsory contributions', sourceId: NTL },
    socialhh: { title: 'Employees’ social contributions 2024 – National Tax List (EUR million)', denominatorId: 'kratos-social-households-2024', period: y, basis: 'Actual compulsory contributions', sourceId: NTL },
    localrefuse: { title: 'Municipal refuse fees 2024 – National Tax List (EUR million)', denominatorId: 'ota-refuse-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
    localhh: { title: 'Household buildings taxes (local part) 2024 – Eurostat (EUR million)', denominatorId: 'ota-household-buildings-2024', period: y, basis: 'ESA taxes received by local government', sourceId: EUS },
    local: { title: 'Local land and street fees 2024 – National Tax List (EUR million)', denominatorId: 'ota-other-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
  },
  sources: [
    { id: NTL, org: 'European Commission, DG Taxation and Customs Union, with Eurostat', title: 'Data on Taxation Trends: National Tax Lists (NTL), edition 2026', url: 'https://taxation-customs.ec.europa.eu/taxation/economic-analysis/data-taxation-trends_en', kind: 'statistics', language: 'en', publishedDate: '2026-03-31', periodCovered: 'Calendar year 2024 (series from 1995)', accessed: D, nextExpected: '2027-03', note: 'Workbook "NTL edition 2026 web.xlsx", sheet EL: every tax and social contribution by its national name and ESA code, in EUR million. Data cut-off 30 October 2025.' },
    { id: EUS, org: 'Eurostat', title: 'Main national accounts tax aggregates (gov_10a_taxag)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table', kind: 'statistics', language: 'en', publishedDate: '2026-07-21', periodCovered: 'Calendar year 2024', accessed: D, nextExpected: '2027-07', note: 'Taxes and social contributions by sub-sector and ESA item; used to place each tax at a level and to check the totals of the National Tax List.' },
    { id: PWC_CIT, org: 'PwC', title: 'Worldwide Tax Summaries: Greece – Corporate – Taxes on corporate income', url: 'https://taxsummaries.pwc.com/greece/corporate/taxes-on-corporate-income', kind: 'guidance', language: 'en', publishedDate: '2026-09-08', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary, not an official source: corporate income tax 22%; 29% for credit institutions in certain cases.' },
    { id: PWC_PIT, org: 'PwC', title: 'Worldwide Tax Summaries: Greece – Individual – Taxes on personal income', url: 'https://taxsummaries.pwc.com/greece/individual/taxes-on-personal-income', kind: 'guidance', language: 'en', publishedDate: '2026-09-08', periodCovered: 'Scale of 2026', accessed: D, note: 'A professional firm’s summary: income tax scale 9/20/26/34/39/44%.' },
    { id: PWC_OTH, org: 'PwC', title: 'Worldwide Tax Summaries: Greece – Corporate – Other taxes', url: 'https://taxsummaries.pwc.com/greece/corporate/other-taxes', kind: 'guidance', language: 'en', publishedDate: '2026-09-08', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary: VAT 24% and 13%; social security contributions 13.37% employee and 21.79% employer from 1 January 2025.' },
  ],
  instruments,
};

buildCountry(spec);
n.reconcile(part('state') + part('socialer') + part('socialhh') + part('localrefuse') + part('localhh') + part('local'), ['T:D612']);
