/**
 * Belgium: the folio's data. Run: npx tsx scripts/build/belgium.ts
 * Figures: Commission / Eurostat National Tax List (NTL), edition 2026, sheet BE, calendar 2024, EUR million
 * (scripts/build/data/ntl-BE.json). Where one national line is shared between levels (personal income tax,
 * advance payments on property, "other taxes on production"), the split is Eurostat gov_10a_taxag's.
 * Rates: PwC Worldwide Tax Summaries (reviews of September 2026), a professional-firm summary.
 */
import { buildCountry, type CountrySpec, type InstSpec, type Ref } from '../lib/build-country';
import { loadNtl, loadSectors } from '../lib/ntl';

const D = '2026-10-12';
const y = { label: '2024', kind: 'calendar-year' as const, start: '2024-01-01', end: '2024-12-31' };
const ref = (id: string, loc?: string): Ref => (loc ? [id, loc] : [id]);
const n = loadNtl('BE', 'EUR');
const sec = loadSectors('BE');
const NTL = 'ntl-2026';
const EUS = 'eurostat-taxag';
const PWC_CIT = 'pwc-be-corporate';
const PWC_PIT = 'pwc-be-individual';
const PWC_OTH = 'pwc-be-other';
const PWC_NOTE = 'As summarised by PwC (review of 10 September 2026), not checked against the Federal Public Service Finance.';

const inst = (i: Omit<InstSpec, 'rev'> & { keys: string[]; group: string }): InstSpec => {
  const { keys, group, ...rest } = i;
  return { ...rest, rev: n.rev(group, keys) };
};

/* ---- lines shared between levels, split with Eurostat ---- */
const pitKeys = ['D51A:C01', 'D51A:C02', 'D51A:C03', 'D51A:C04', 'D51A:C05', 'D51A:C07', 'D51A:C08', 'D51A:C09', 'D51E:C02', 'D51E:C03'];
const pitTotal = n.sum(pitKeys);
const pitRegions = n.round(sec['S1312:D51A']);
const pitLocal = n.round(sec['S1313:D51A']);
const pitFederal = n.round(pitTotal - pitRegions - pitLocal);
const propKeys = ['D29A:C01', 'D29A:C02', 'D29A:C05'];
const propTotal = n.sum(propKeys);
const propLocal = n.round(sec['S1313:D29A']);
const propRegions = n.round(propTotal - propLocal);
const otherProdKey = 'D29H:C16';
const otherProd = n.sum([otherProdKey]);
const otherProdLocal = n.round(sec['S1313:D29H']);
const otherProdRegions = n.round(sec['S1312:D29H']);
const otherProdFederal = n.round(otherProd - otherProdLocal - otherProdRegions);
const calc3 = (t: number, a: number, b: number, r: number) => `${n.fmt(t)} − ${n.fmt(a)} − ${n.fmt(b)} = ${n.fmt(r)} (EUR million)`;

const instruments: InstSpec[] = [
  /* ---- federal: income taxes ---- */
  {
    id: 'be-pit-federal', parent: 'federal', level: 'federal', family: 'income-personal',
    official: 'Personal income tax (federal part): advance payments and withholding on employment income, assessments, non-residents', native: 'Impôt des personnes physiques / Personenbelasting (partie fédérale)', common: 'Personal income tax: federal part',
    base: 'Employment income withheld by employers (business advance payments EUR 63.0 billion), movable income (EUR 6.7 billion), other advance payments and assessments (EUR 3.0 billion), non-residents (EUR 1.1 billion) and others.',
    payer: 'Individuals; employers withhold most of it.',
    rate: { kind: 'progressive', headline: '25% to 50% federal scale (2025)', details: ['For income year 2025 the federal tax rates range between 25% and 50%; the regions retain surcharges on the "reduced" federal tax and grant their own reductions and credits since the 6th State reform (PwC).', PWC_NOTE], asOf: '2026-09-10' },
    explanation: 'The National Tax List gives one set of lines for the personal income tax (EUR 73.9 billion in the lines drawn here). Eurostat’s accounts place EUR 13.3 billion with the regions and communities and EUR 4.1 billion with local government (the municipal surcharges); this row is the rest, under the federal government.',
    exceptions: ['The special social security contribution (EUR 1.4 billion) is drawn separately.'], refs: [ref(PWC_PIT, 'Taxes on personal income'), ref(EUS, 'S.1311, S.1312 and S.1313, D51A')], label: 'Personal income tax (federal)', sub: '25–50%', glyph: 'person',
    rev: { group: 'state', amount: pitFederal, locator: 'NTL 2026, sheet BE, D51A C01–C05, C07–C09 and D51E C02–C03 (personal income tax lines), 2024, less the regional and local parts from Eurostat gov_10a_taxag (S.1312 and S.1313, D51A)', calculation: calc3(pitTotal, pitRegions, pitLocal, pitFederal), caveat: `Different vintages of the two sources; Eurostat’s own federal figure for D51A is EUR ${n.fmt(n.round(sec['S1311:D51A']))} million, plus EUR ${n.fmt(n.round(sec['S1311:D51E']))} million of other income taxes and EUR ${n.fmt(n.round(sec['S212:D51A']))} million of taxes recorded under the EU institutions.` },
  },
  inst({
    id: 'be-special-social-contribution', parent: 'federal', level: 'federal', family: 'income-personal', group: 'state', keys: ['D51A:C06'],
    official: 'Special social contributions', native: 'Cotisation spéciale de sécurité sociale / Bijzondere bijdrage voor de sociale zekerheid', common: 'Special social security contribution',
    base: 'As named in the National Tax List ("special social contributions", booked as a personal income tax); the list gives no further detail.',
    payer: 'Individuals.',
    rate: { kind: 'varies', headline: 'Set by law', details: ['Eurostat records EUR 1,371 million of personal income taxes with the social security funds, which is this line.'] },
    explanation: 'A levy booked among the income taxes that finances social security.',
    exceptions: [], refs: [ref(NTL, 'sheet BE, D51A C06'), ref(EUS, 'S.1314, D51A')], label: 'Special social contribution', sub: 'Social security', glyph: 'heart',
  }),
  inst({
    id: 'be-corporate-income-tax', parent: 'federal', level: 'federal', family: 'income-corporate', group: 'state', keys: ['D51B:C01', 'D51B:C02', 'D51B:C03', 'D51B:C04', 'D51B:C05'],
    official: 'Corporate income tax: advance payments, assessments and non-residents', native: 'Impôt des sociétés / Vennootschapsbelasting', common: 'Corporate income tax',
    base: 'Profit of companies. Advance payments EUR 22.2 billion, assessments EUR 3.8 billion, movable income EUR 1.0 billion, non-residents EUR 0.1 billion.',
    payer: 'Companies.',
    rate: { kind: 'flat', headline: '25% general; 20% on the first EUR 100,000 for small companies', details: ['The general CIT rate is 25%; qualifying small companies pay 20% on the first EUR 100,000 of profit (PwC).', PWC_NOTE], asOf: '2026-09-10' },
    explanation: 'EUR 27.0 billion in 2024, all under the federal government.',
    exceptions: [], refs: [ref(PWC_CIT, 'Corporate income tax rates')], label: 'Corporate income tax', sub: '25%', glyph: 'factory',
  }),
  /* ---- federal: consumption ---- */
  inst({
    id: 'be-vat', parent: 'federal', level: 'federal', family: 'general-consumption', group: 'state', keys: ['D211:C01'],
    official: 'Value added tax', native: 'Taxe sur la valeur ajoutée (TVA) / Belasting over de toegevoegde waarde (BTW)', common: 'VAT', abbr: 'TVA / BTW',
    base: 'Goods and services supplied in Belgium and imports.',
    payer: 'Consumers; businesses charge it and claim input credits.',
    rate: { kind: 'range', headline: '21% standard; 12% and 6% reduced', details: ['The standard VAT rate is 21% and applies to everything that does not qualify for a reduced rate; 12% applies to certain goods, among them some fuels and materials (PwC).', PWC_NOTE], asOf: '2026-09-10' },
    explanation: 'The largest consumption tax: EUR 38.2 billion.',
    exceptions: [], refs: [ref(PWC_OTH, 'Value-added tax')], label: 'VAT', sub: '21%', glyph: 'cart',
  }),
  inst({
    id: 'be-customs', parent: 'federal', level: 'federal', category: 'customs-duty', family: 'trade', group: 'state', keys: ['D2121:C01'],
    official: 'Import duties including ECSC rights', native: 'Droits d’importation / Invoerrechten', common: 'Customs duties',
    base: 'Goods imported from outside the EU, by the Common Customs Tariff.',
    payer: 'Importers.',
    rate: { kind: 'varies', headline: 'EU Common Customs Tariff', details: ['An EU own resource; Eurostat records it under the EU institutions.'] },
    explanation: 'Collected for the EU budget; Antwerp is one of Europe’s largest ports.',
    exceptions: [], refs: [ref(EUS, 'S.212, D212')], label: 'Customs duties', sub: 'EU tariff', glyph: 'ship',
  }),
  inst({
    id: 'be-excise-fuel-energy', parent: 'federal', level: 'federal', family: 'specific-consumption', group: 'state', keys: ['D214A:C01', 'D2122C:C01', 'D214A:C13', 'D214A:C14', 'D214A:C15', 'D214A:C16', 'D214A:C28', 'D214A:C29'],
    official: 'Excise duties on mineral oil and the federal contributions on energy, heating oil and strategic stocks', native: 'Accises sur les huiles minérales; cotisation sur l’énergie; cotisations APETRA et FAPETRO', common: 'Fuel and energy excises and contributions',
    base: 'Mineral oil (EUR 6.8 billion and EUR 0.06 billion on imports), the contribution on energy (EUR 360 million), the contribution for APETRA (strategic oil stocks, EUR 207 million), the federal contribution on electricity and gas (EUR 161 million) and small contributions for fuel oil surveillance and heating oil.',
    payer: 'Fuel and energy suppliers; passed on at the pump.',
    rate: { kind: 'specific', headline: 'Per 1,000 litres', details: [] },
    explanation: 'The biggest excise.',
    exceptions: [], refs: [ref(NTL, 'sheet BE, D214A C01 and C13–C16 and C28–C29, D2122C C01')], label: 'Fuel and energy excise', sub: 'Mineral oil', glyph: 'flame',
  }),
  inst({
    id: 'be-excise-tobacco', parent: 'federal', level: 'federal', family: 'specific-consumption', group: 'state', keys: ['D214A:C03', 'D2122C:C03'],
    official: 'Excise duties on tobacco', native: 'Accises sur le tabac / Accijnzen op tabak', common: 'Tobacco excise',
    base: 'Cigarettes and other tobacco products.',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'mechanism', headline: 'Fixed by law', details: ['EUR 2.1 billion on domestic and EUR 0.4 billion on imported tobacco in 2024.'] },
    explanation: 'EUR 2.5 billion.',
    exceptions: [], refs: [ref(NTL, 'sheet BE, D214A C03, D2122C C03')], label: 'Tobacco excise', sub: 'Cigarettes', glyph: 'smoke',
  }),
  inst({
    id: 'be-excise-drinks', parent: 'federal', level: 'federal', family: 'specific-consumption', group: 'state', keys: ['D214A:C04', 'D214A:C07', 'D214A:C08', 'D214A:C09', 'D214A:C12', 'D2122C:C04', 'D2122C:C06', 'D2122C:C07', 'D2122C:C08', 'D2122C:C09', 'D2122C:C11'],
    official: 'Excise duties on brandy, beer, fermented drinks, soft drinks, intermediary products and coffee', native: 'Accises sur les alcools, la bière, les boissons non alcoolisées et le café', common: 'Alcohol, soft drink and coffee excises',
    base: 'Spirits (EUR 297 million), fermented drinks, beer (EUR 172 million), non-alcoholic beverages (EUR 182 million), intermediary products and coffee (EUR 14 million).',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'specific', headline: 'Per litre', details: [] },
    explanation: 'Eleven lines of the list.',
    exceptions: [], refs: [ref(NTL, 'sheet BE, D214A C04, C07–C09, C12, D2122C C04, C06–C09, C11')], label: 'Alcohol and soft-drink excises', sub: 'Spirits · beer · coffee', glyph: 'wine',
  }),
  inst({
    id: 'be-transaction-taxes', parent: 'federal', level: 'federal', family: 'property', group: 'state', keys: ['D214C:C04', 'D214C:C06', 'D214C:C03', 'D214C:C02'],
    official: 'Tax on stock exchange transactions, duties on written documents, court rights and mortgage rights', native: 'Taxe sur les opérations de bourse; droits d’écriture; droits de greffe; droits d’hypothèque', common: 'Federal transaction taxes',
    base: 'Stock exchange business (EUR 428.7 million), mortgage rights (EUR 79.4 million), written documents (EUR 84.3 million) and court rights (EUR 30.2 million).',
    payer: 'Parties to the transactions.',
    rate: { kind: 'varies', headline: 'Set by the Code of registration duties', details: ['The registration duties on property transfers go to the regions and are drawn in their part.'] },
    explanation: 'Four lines that stay with the federal government.',
    exceptions: [], refs: [ref(NTL, 'sheet BE, D214C C02–C04 and C06'), ref(EUS, 'S.1311, D214C')], label: 'Transaction taxes', sub: 'Exchange · documents', glyph: 'stamp',
  }),
  inst({
    id: 'be-insurance-taxes', parent: 'federal', level: 'federal', family: 'specific-consumption', group: 'state', keys: ['D214G:C01', 'D214G:C06'],
    official: 'Tax on insurance contracts and receipts for the Belgian Red Cross', native: 'Taxe sur les contrats d’assurance; recettes au profit de la Croix-Rouge', common: 'Insurance tax',
    base: 'Insurance premiums (EUR 1,749.7 million) and a small levy for the Red Cross (EUR 9.7 million).',
    payer: 'Insurers and policyholders.',
    rate: { kind: 'varies', headline: 'A percentage of the premium by type of insurance', details: [] },
    explanation: 'The additional levies on premiums that go to the social security funds are drawn in a separate row.',
    exceptions: [], refs: [ref(NTL, 'sheet BE, D214G C01 and C06')], label: 'Insurance tax', sub: 'Premiums', glyph: 'shield',
  }),
  inst({
    id: 'be-insurance-levies-social', parent: 'federal', level: 'federal', category: 'special-levy', family: 'specific-consumption', group: 'state', keys: ['D214G:C02', 'D214G:C03', 'D214G:C04', 'D214G:C05'],
    official: 'Additional levies on premiums for industrial accidents, car insurance, fire insurance and hospitalisation insurance', native: 'Cotisations supplémentaires sur les primes d’assurance', common: 'Insurance premium levies for social security',
    base: 'Car insurance premiums (EUR 823.5 million), fire insurance (EUR 268.6 million), hospitalisation insurance (EUR 219.4 million) and industrial accidents (EUR 40.5 million).',
    payer: 'Insurers and policyholders.',
    rate: { kind: 'varies', headline: 'Set by law', details: ['Eurostat records EUR 1,352 million of insurance taxes with the social security funds, which is these four lines.'] },
    explanation: 'Earmarked levies that finance social security.',
    exceptions: [], refs: [ref(NTL, 'sheet BE, D214G C02–C05'), ref(EUS, 'S.1314, D214G')], label: 'Insurance premium levies', sub: 'Social security', glyph: 'shield',
  }),
  inst({
    id: 'be-lottery-and-airport', parent: 'federal', level: 'federal', family: 'specific-consumption', group: 'state', keys: ['D214J:C01', 'D29H:C03', 'D214H:C01'],
    official: 'Profits of the National Lottery, monopoly interest, and the tax on the embarkation of aircraft passengers', native: 'Bénéfices de la Loterie Nationale; taxe d’embarquement', common: 'National Lottery and embarkation tax',
    base: 'The National Lottery’s profits (EUR 220 million), monopoly interest (EUR 101.5 million) and a tax on embarkation of aircraft passengers (EUR 42.3 million).',
    payer: 'The National Lottery; air passengers.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Three lines.',
    exceptions: [], refs: [ref(NTL, 'sheet BE, D214J C01, D29H C03, D214H C01')], label: 'Lottery and embarkation', sub: 'Monopoly', glyph: 'dice',
  }),
  inst({
    id: 'be-pharma-contribution', parent: 'federal', level: 'federal', category: 'special-levy', family: 'specific-consumption', group: 'state', keys: ['D214L:C02', 'D214L:C03', 'D214L:C01'],
    official: 'Contribution on the turnover of the pharmaceutical industry, levy on particular pharmaceutical products and poster advertising tax', native: 'Cotisation sur le chiffre d’affaires de l’industrie pharmaceutique', common: 'Pharmaceutical industry contribution',
    base: 'The turnover of the pharmaceutical industry (EUR 592.8 million), particular pharmaceutical products (EUR 4.8 million) and poster advertising (EUR 1.6 million).',
    payer: 'Pharmaceutical companies and advertisers.',
    rate: { kind: 'varies', headline: 'A percentage of turnover', details: [] },
    explanation: 'A levy on the pharmaceutical sector.',
    exceptions: [], refs: [ref(NTL, 'sheet BE, D214L C01–C03')], label: 'Pharmaceutical contribution', sub: 'Turnover', glyph: 'gear',
  }),
  inst({
    id: 'be-financial-sector-taxes', parent: 'federal', level: 'federal', category: 'special-levy', family: 'other', group: 'state', keys: ['D29H:C13', 'D29H:C12', 'D29E:C02', 'D29E:C03'],
    official: 'Annual tax on credit institutions, annual tax on unit trusts, credit companies and insurance companies, and the contributions to the guarantee and resolution funds', native: 'Taxe annuelle sur les établissements de crédit; Fonds de garantie', common: 'Financial-sector taxes',
    base: 'Credit institutions (EUR 983.0 million), the Guarantee Fund for financial services (EUR 437.8 million), unit trusts, credit companies and insurers (EUR 223.2 million) and the resolution funds (EUR 2 million).',
    payer: 'Banks, insurers and funds.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Four lines.',
    exceptions: [], refs: [ref(NTL, 'sheet BE, D29H C12–C13, D29E C02–C03')], label: 'Financial-sector taxes', sub: 'Banks · funds', glyph: 'bank',
  }),
  inst({
    id: 'be-nuclear-packaging-others', parent: 'federal', level: 'federal', category: 'special-levy', family: 'other', group: 'state', keys: ['D29H:C08', 'D29H:C04', 'D29H:C15', 'D29H:C05', 'D29H:C01'],
    official: 'Contribution by nuclear operators, contribution to the account of corporations, packaging contribution and others', native: 'Contribution des exploitants nucléaires; cotisation d’emballage', common: 'Nuclear, packaging and other contributions',
    base: 'Nuclear operators (EUR 454.8 million), the contribution to the account of the corporations (EUR 299.7 million), the packaging contribution (EUR 338.1 million), the public mandate contribution (EUR 5.7 million) and annuities for patented entities (EUR 13.1 million).',
    payer: 'Nuclear operators, corporations and packers.',
    rate: { kind: 'varies', headline: 'Set by law', details: ['Eurostat books EUR 312 million of other taxes on production with the social security funds; the list does not say which lines.'] },
    explanation: 'Five lines.',
    exceptions: [], refs: [ref(NTL, 'sheet BE, D29H C01, C04, C05, C08, C15')], label: 'Nuclear and packaging levies', sub: 'Sector levies', glyph: 'oil',
  }),
  {
    id: 'be-other-production-taxes-federal', parent: 'federal', level: 'federal', family: 'other',
    official: 'Other taxes on production, part not recorded under regions or local government', native: 'Autres impôts sur la production / Andere belastingen op de productie', common: 'Other taxes on production: federal part',
    base: 'As named in the National Tax List ("other taxes on production"); the list gives one amount of EUR 956.3 million.',
    payer: 'Not given in the list.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: `Eurostat records EUR ${n.fmt(otherProdLocal)} million of the "other taxes on production" with local government and EUR ${n.fmt(otherProdRegions)} million with the regions; the rest is drawn here.`,
    exceptions: [], refs: [ref(NTL, 'sheet BE, D29H C16'), ref(EUS, 'S.1311, S.1312 and S.1313, D29H')], label: 'Other production taxes', sub: 'Federal part', glyph: 'scroll',
    rev: { group: 'state', amount: otherProdFederal, locator: 'NTL 2026, sheet BE, D29H C16 Other taxes on production, 2024, less the regional and local parts from Eurostat gov_10a_taxag (S.1312 and S.1313, D29H)', calculation: calc3(otherProd, otherProdLocal, otherProdRegions, otherProdFederal) },
  },
  inst({
    id: 'be-securities-savings-taxes', parent: 'federal', level: 'federal', family: 'property', group: 'state', keys: ['D59A:C06', 'D59A:C02', 'D91B:C01', 'D91B:C04', 'D91B:C05', 'D59F:C01'],
    official: 'Tax on securities accounts, tax on non-profit institutions, tax on long-term savings, one-off tax regularisations and other taxes', native: 'Taxe sur les comptes-titres; taxe sur l’épargne à long terme', common: 'Securities account tax and savings taxes',
    base: 'Securities accounts (EUR 462.2 million), long-term savings (EUR 234.1 million), the tax on non-profit institutions (EUR 98.3 million), one-off tax regularisations (EUR 231 million in two lines) and other taxes (EUR 26 million).',
    payer: 'Holders of securities accounts and savers; non-profit institutions.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Six lines of the list that tax wealth.',
    exceptions: [], refs: [ref(NTL, 'sheet BE, D59A C02 and C06, D91B C01, C04, C05, D59F C01')], label: 'Securities and savings taxes', sub: 'Wealth', glyph: 'gem',
  }),
  inst({
    id: 'be-accident-fund-transfer', parent: 'federal', level: 'federal', category: 'special-levy', family: 'other', group: 'state', keys: ['D59A:C05'],
    official: 'Transfer to the Fund for Industrial Accidents of recognised insurers', native: 'Transfert au Fonds des accidents du travail', common: 'Industrial Accidents Fund transfer',
    base: 'As named in the National Tax List; Eurostat records EUR 421 million of other wealth taxes with the social security funds, which is this line.',
    payer: 'Insurers.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'A transfer that the list books as a tax.',
    exceptions: [], refs: [ref(NTL, 'sheet BE, D59A C05'), ref(EUS, 'S.1314, D59A')], label: 'Accident fund transfer', sub: 'Social security', glyph: 'shield',
  }),
  inst({
    id: 'be-other-small-taxes', parent: 'federal', level: 'federal', category: 'fee', family: 'other', group: 'state', keys: ['D214A:C23', 'D214A:C17'],
    official: 'Compulsory contributions from animal producers and taxes on water', native: 'Cotisations obligatoires des producteurs d’animaux; taxes sur l’eau', common: 'Other small contributions',
    base: 'Compulsory contributions from producers of animals and animal products (EUR 12 million) and a small tax on water (EUR 2.9 million).',
    payer: 'Producers and water users.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Two small lines.',
    exceptions: [], refs: [ref(NTL, 'sheet BE, D214A C17 and C23')], label: 'Other contributions', sub: 'Small', glyph: 'stamp',
  }),
  /* ---- federal: social contributions ---- */
  inst({
    id: 'be-social-employers', parent: 'federal', level: 'federal', category: 'social-contribution', family: 'social-security', group: 'socialer', keys: ['D611:C01', 'D611:C02'],
    official: 'Employers’ actual social contributions (to the account of general government and of other sectors)', native: 'Cotisations sociales des employeurs / Werkgeversbijdragen', common: 'Employers’ contributions',
    base: 'Gross pay. The list splits the line by who receives the money: EUR 11.2 billion to the account of general government and EUR 37.3 billion to the account of other sectors.',
    payer: 'Employers.',
    rate: { kind: 'flat', headline: 'Set by the social security laws', details: ['The rates are not extracted here.'] },
    explanation: 'Collected by the National Social Security Office.',
    exceptions: [], refs: [ref(NTL, 'sheet BE, D611')], label: 'Social: employers', sub: 'ONSS / RSZ', glyph: 'heart',
  }),
  inst({
    id: 'be-social-households', parent: 'federal', level: 'federal', category: 'social-contribution', family: 'social-security', group: 'socialhh', keys: ['D613CE:C01', 'D613CS:C01', 'D613CN:C01', 'D613V:C01', 'D61SC:C01', 'D6141:C01'],
    official: 'Social contributions of employees, the self-employed and the non-employed, voluntary contributions and service charges', native: 'Cotisations sociales des travailleurs, indépendants et non-actifs', common: 'Households’ contributions',
    base: 'Employees (EUR 25.2 billion), self-employed (EUR 5.3 billion), non-employed (EUR 2.1 billion), voluntary contributions (EUR 0.07 billion) and small service-charge and supplement lines.',
    payer: 'Employees, the self-employed and the non-employed.',
    rate: { kind: 'flat', headline: 'Set by the social security laws', details: ['The rates are not extracted here.'] },
    explanation: 'Six lines.',
    exceptions: [], refs: [ref(NTL, 'sheet BE, D613CE, D613CS, D613CN, D613V, D61SC, D614')], label: 'Social: households', sub: 'Employees · self-employed', glyph: 'heart',
  }),
  /* ---- regions and communities ---- */
  {
    id: 'be-pit-regions', parent: 'regions', level: 'regions', family: 'income-personal',
    official: 'Personal income tax received by the regions and communities (regional surcharges and the share of the federal tax)', native: 'IPP des régions et communautés / Gewestelijke personenbelasting', common: 'Personal income tax: regional part',
    base: 'The same tax as the federal part, after the 6th State reform: the regions set surcharges on the reduced federal income tax and grant their own reductions and credits.',
    payer: 'Individuals.',
    rate: { kind: 'range', headline: 'Regional surcharges and reductions', details: ['The regions are entitled to retain surcharges on the "reduced federal personal income taxation" and to grant tax reductions and credits (PwC).'] },
    explanation: 'Eurostat’s accounts record EUR 13.3 billion of the personal income tax under the regions and communities.',
    exceptions: [], refs: [ref(PWC_PIT, 'Taxes on personal income'), ref(EUS, 'S.1312, D51A')], label: 'Personal income tax (regions)', sub: 'Surcharges · share', glyph: 'person',
    rev: { group: 'regpit', amount: pitRegions, locator: 'Eurostat gov_10a_taxag, 2024: S.1312 state government (regions and communities), D51A taxes on individual or household income, EUR million', caveat: 'Eurostat July 2026 vintage; the National Tax List has no sector split.' },
  },
  inst({
    id: 'be-registration-rights', parent: 'regions', level: 'regions', family: 'property', group: 'regions', keys: ['D214C:C01'],
    official: 'Registration rights', native: 'Droits d’enregistrement / Registratierechten', common: 'Registration rights',
    base: 'Transfers of real estate and similar acts.',
    payer: 'Buyers.',
    rate: { kind: 'varies', headline: 'Set by each region', details: ['EUR 4.9 billion in 2024; Eurostat books EUR 4.7 billion of the transaction taxes under the regions.'] },
    explanation: 'The tax on buying a home, set by each region.',
    exceptions: [], refs: [ref(NTL, 'sheet BE, D214C C01'), ref(EUS, 'S.1312, D214C')], label: 'Registration rights', sub: 'Property transfers', glyph: 'stamp',
  }),
  inst({
    id: 'be-death-gift-duties', parent: 'regions', level: 'regions', family: 'property', group: 'regions', keys: ['D91A:C01', 'D91A:C02'],
    official: 'Death duties and gift taxes', native: 'Droits de succession et de donation / Successie- en schenkingsrechten', common: 'Inheritance and gift taxes',
    base: 'Inheritances (EUR 2.9 billion) and gifts (EUR 0.9 billion).',
    payer: 'Heirs and donees.',
    rate: { kind: 'varies', headline: 'Set by each region', details: ['Eurostat books EUR 3.8 billion of capital taxes under the regions.'] },
    explanation: 'Regional taxes.',
    exceptions: [], refs: [ref(NTL, 'sheet BE, D91A'), ref(EUS, 'S.1312, D91')], label: 'Inheritance and gift taxes', sub: 'Regional', glyph: 'gem',
  }),
  inst({
    id: 'be-regional-vehicle-taxes', parent: 'regions', level: 'regions', family: 'specific-consumption', group: 'regions', keys: ['D214D:C02', 'D29B:C01', 'D59D:C01'],
    official: 'Taxes on traffic: circulation and registration, paid by corporations and by households', native: 'Taxes de circulation et de mise en circulation / Verkeersbelasting', common: 'Vehicle taxes',
    base: 'Taxes on traffic (EUR 471.9 million), traffic taxes paid by corporations (EUR 682.6 million) and by households (EUR 1,386.1 million).',
    payer: 'Vehicle owners and companies.',
    rate: { kind: 'varies', headline: 'By vehicle, set by each region', details: [] },
    explanation: 'Regional taxes on owning and registering vehicles.',
    exceptions: [], refs: [ref(NTL, 'sheet BE, D214D C02, D29B C01, D59D C01'), ref(EUS, 'S.1312, D214D and D29B')], label: 'Vehicle taxes', sub: 'Regional', glyph: 'car',
  }),
  inst({
    id: 'be-green-certificate-levies', parent: 'regions', level: 'regions', category: 'special-levy', family: 'specific-consumption', group: 'regions', keys: ['D214A:C31', 'D214A:C32', 'D214A:C33', 'D214A:C34', 'D214A:C35'],
    official: 'Green certificate delivery and surtaxes on distribution and transmission prices for green certificates (Flanders, Wallonia, Brussels)', native: 'Certificats verts / Groenestroomcertificaten', common: 'Green certificate levies',
    base: 'Flanders (FC) green certificates EUR 484.0 million and the surtax on distribution prices EUR 387.6 million; Wallonia (WR) EUR 379.7 million and EUR 43.7 million; Brussels (BCR) EUR 87.1 million.',
    payer: 'Electricity consumers.',
    rate: { kind: 'varies', headline: 'Set by each region', details: [] },
    explanation: 'Regional levies on electricity that finance support for renewable electricity.',
    exceptions: [], refs: [ref(NTL, 'sheet BE, D214A C31–C35')], label: 'Green certificate levies', sub: 'Regional', glyph: 'bolt',
  }),
  inst({
    id: 'be-regional-gambling', parent: 'regions', level: 'regions', family: 'specific-consumption', group: 'regions', keys: ['D214F:C01'],
    official: 'Taxes on gambling and bets', native: 'Taxes sur les jeux et paris / Belasting op spelen en weddenschappen', common: 'Gambling tax',
    base: 'Gambling and betting.',
    payer: 'Operators.',
    rate: { kind: 'varies', headline: 'Set by each region', details: [] },
    explanation: 'EUR 151.1 million; Eurostat books all of it under the regions.',
    exceptions: [], refs: [ref(NTL, 'sheet BE, D214F C01'), ref(EUS, 'S.1312, D214F')], label: 'Gambling tax', sub: 'Regional', glyph: 'dice',
  }),
  inst({
    id: 'be-regional-environmental', parent: 'regions', level: 'regions', category: 'tax', family: 'resource', group: 'regions', keys: ['D29F:C01', 'D29F:C02', 'D29F:C03'],
    official: 'Taxes on waste products, manure and water', native: 'Taxes sur les déchets, le fumier et l’eau / Heffingen op afval, mest en water', common: 'Environmental taxes',
    base: 'Waste (EUR 104.5 million, Flanders and Wallonia), manure (EUR 5 million, Flanders) and water (EUR 143 million, in all three regions).',
    payer: 'Polluters and water users.',
    rate: { kind: 'varies', headline: 'Set by each region', details: ['The sale of emission permits (EUR 753.5 million) is not counted.'] },
    explanation: 'Eurostat books EUR 1,006 million of taxes on pollution under the regions, which includes the emission permits.',
    exceptions: [], refs: [ref(NTL, 'sheet BE, D29F'), ref(EUS, 'S.1312, D29F')], label: 'Environmental taxes', sub: 'Waste · water', glyph: 'leaf',
  }),
  {
    id: 'be-property-regions', parent: 'regions', level: 'regions', family: 'property',
    official: 'Advance tax payments on property and the Brussels regional tax, part recorded under the regions', native: 'Précompte immobilier / Onroerende voorheffing (parts régionale)', common: 'Property tax: regional part',
    base: 'The tax on the cadastral income of real estate, paid in advance; the Brussels Capital Region also levies a regional tax.',
    payer: 'Owners of real estate.',
    rate: { kind: 'varies', headline: 'Set by each region', details: [] },
    explanation: `The list gives EUR ${n.fmt(propTotal)} million for the advance payments on property of persons and corporations and the Brussels regional tax. Eurostat books EUR ${n.fmt(propLocal)} million of it under local government (the municipal and provincial surcharges); the rest goes to the regions.`,
    exceptions: [], refs: [ref(NTL, 'sheet BE, D29A C01, C02, C05'), ref(EUS, 'S.1312 and S.1313, D29A')], label: 'Property tax (regions)', sub: 'Regional part', glyph: 'house',
    rev: { group: 'regions', amount: propRegions, locator: 'NTL 2026, sheet BE, D29A C01, C02 and C05 (advance tax payments on property and the Brussels regional tax), 2024, less the local part from Eurostat gov_10a_taxag (S.1313, D29A)', calculation: `${n.fmt(propTotal)} − ${n.fmt(propLocal)} = ${n.fmt(propRegions)} (EUR million)` },
  },
  {
    id: 'be-other-production-taxes-regions', parent: 'regions', level: 'regions', family: 'other',
    official: 'Other taxes on production, part recorded under the regions', native: 'Autres impôts sur la production (régions)', common: 'Other taxes on production: regional part',
    base: 'As named in the National Tax List ("other taxes on production").',
    payer: 'Not given in the list.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: `The part of the line that Eurostat’s accounts record under the regions (EUR ${n.fmt(otherProdRegions)} million).`,
    exceptions: [], refs: [ref(NTL, 'sheet BE, D29H C16'), ref(EUS, 'S.1312, D29H')], label: 'Other production (regions)', sub: 'Regional part', glyph: 'scroll',
    rev: { group: 'regionseus', amount: otherProdRegions, locator: 'Eurostat gov_10a_taxag, 2024: S.1312 (regions and communities), D29H other taxes on production, EUR million', caveat: 'Eurostat July 2026 vintage; the allocation to the single NTL line "other taxes on production" is an inference from the amounts.' },
  },
  /* ---- local government ---- */
  {
    id: 'be-pit-local', parent: 'local', level: 'local', family: 'income-personal',
    official: 'Municipal surcharges on the personal income tax', native: 'Taxe additionnelle communale à l’IPP / Aanvullende gemeentebelasting op de personenbelasting', common: 'Municipal surcharge on income tax',
    base: 'A percentage added to the personal income tax of residents.',
    payer: 'Individuals; collected by the federal administration with the income tax.',
    rate: { kind: 'range', headline: 'Set by each municipality', details: ['Eurostat’s accounts record EUR 4.1 billion of personal income tax under local government.'] },
    explanation: 'The municipalities’ main own tax.',
    exceptions: [], refs: [ref(EUS, 'S.1313, D51A')], label: 'Municipal income tax surcharge', sub: 'Local', glyph: 'person',
    rev: { group: 'localeus', amount: pitLocal, locator: 'Eurostat gov_10a_taxag, 2024: S.1313 local government, D51A taxes on individual or household income, EUR million', caveat: 'Eurostat July 2026 vintage; the National Tax List has no sector split.' },
  },
  {
    id: 'be-property-local', parent: 'local', level: 'local', family: 'property',
    official: 'Municipal and provincial surcharges on the property tax (advance tax payments on property)', native: 'Centimes additionnels au précompte immobilier / Opcentiemen op de onroerende voorheffing', common: 'Property tax: local surcharges',
    base: 'The cadastral income of real estate.',
    payer: 'Owners of real estate.',
    rate: { kind: 'range', headline: 'Set by each municipality and province', details: [] },
    explanation: 'The part of the advance payments on property that Eurostat’s accounts record under local government.',
    exceptions: [], refs: [ref(NTL, 'sheet BE, D29A C01 and C02'), ref(EUS, 'S.1313, D29A')], label: 'Property tax surcharges', sub: 'Municipal · provincial', glyph: 'house',
    rev: { group: 'localeus', amount: propLocal, locator: 'Eurostat gov_10a_taxag, 2024: S.1313 local government, D29A taxes on land, buildings or other structures, EUR million', caveat: 'Eurostat July 2026 vintage.' },
  },
  {
    id: 'be-other-production-taxes-local', parent: 'local', level: 'local', family: 'other',
    official: 'Other taxes on production, part recorded under local government', native: 'Autres impôts sur la production (communes)', common: 'Other taxes on production: local part',
    base: 'As named in the National Tax List ("other taxes on production").',
    payer: 'Not given in the list.',
    rate: { kind: 'range', headline: 'Set by each municipality', details: [] },
    explanation: `The part of the line that Eurostat’s accounts record under local government (EUR ${n.fmt(otherProdLocal)} million); the municipal taxes on businesses, signs and the like are not itemised in the list.`,
    exceptions: [], refs: [ref(NTL, 'sheet BE, D29H C16'), ref(EUS, 'S.1313, D29H')], label: 'Other production taxes (local)', sub: 'Local part', glyph: 'town',
    rev: { group: 'localeus', amount: otherProdLocal, locator: 'Eurostat gov_10a_taxag, 2024: S.1313 local government, D29H other taxes on production, EUR million', caveat: 'Eurostat July 2026 vintage; the allocation to the single NTL line "other taxes on production" is an inference from the amounts.' },
  },
  inst({
    id: 'be-patrimony-and-appliances', parent: 'local', level: 'local', family: 'property', group: 'local', keys: ['D59A:C01', 'D29B:C02'],
    official: 'Taxes on patrimony (grounds and buildings) and on automatic recreation appliances', native: 'Taxes sur le patrimoine; taxe sur les appareils automatiques de divertissement', common: 'Patrimony and appliance taxes',
    base: 'Grounds and buildings (EUR 377.4 million) and automatic recreation appliances (EUR 50 million).',
    payer: 'Owners and operators.',
    rate: { kind: 'varies', headline: 'Set by each municipality', details: ['Eurostat books EUR 381 million of other wealth taxes under local government.'] },
    explanation: 'Two small local lines.',
    exceptions: [], refs: [ref(NTL, 'sheet BE, D59A C01, D29B C02'), ref(EUS, 'S.1313, D59A and D29B')], label: 'Patrimony taxes', sub: 'Local', glyph: 'town',
  }),
];

const part = (g: string) => n.round(instruments.filter((i) => i.rev?.group === g).reduce((a, i) => a + i.rev!.amount, 0));
const sectorSum = (code: string) => ['S1311', 'S1312', 'S1313', 'S1314', 'S212'].reduce((a, s) => a + (sec[`${s}:${code}`] ?? 0), 0);
const vintage = ['D2', 'D5', 'D61'].map((c) => `${c}: NTL ${n.fmt(n.total(c))}, Eurostat July 2026 ${n.fmt(sectorSum(c))}`).join('; ');

const spec: CountrySpec = {
  today: D,
  id: 'belgium',
  iso3: 'BEL',
  isoNumeric: '056',
  names: { en: 'Belgium', native: 'België · Belgique · Belgien', nativeLang: 'nl' },
  currency: { code: 'EUR', symbol: '€', name: 'Euro' },
  summary:
    'Belgium is a federation of three regions (Flanders, Wallonia and Brussels-Capital) and three communities, on top of which sit the municipalities and provinces. The federal government still collects most of the money: the personal and corporate income taxes, VAT, excises and the social contributions. The regions have their own taxes (the registration rights on property transfers, the inheritance and gift taxes, vehicle taxes, a green-certificate levy) and, since the 6th State reform, retain surcharges on the federal income tax. Municipalities levy surcharges on the personal income tax and the property tax.',
  structureNote:
    'The figures are the Commission’s National Tax List for 2024. Three lines of the list are shared between levels and are split with Eurostat’s accounts of the same year: the personal income tax (federal, regions, municipalities), the advance payments on property (regions, municipalities) and the "other taxes on production". The sale of emission permits (EUR 753.5 million) and the employers’ imputed social contributions (EUR 14.4 billion) are left out. The social contributions are drawn under the federal government, which collects them for the social security funds. The communities are drawn with the regions because Eurostat’s accounts record them together.',
  theme: {
    accent: '#ffcc00',
    accent2: '#d6001c',
    motif: 'topo',
    motifNote: 'Topographic contour lines over the outline of Belgium (the generic motif; no bespoke art yet).',
    mapLabel: { lon: 4.6, lat: 50.6 },
  },
  rootLabel: { label: 'Belgium', sub: 'België · Belgique · Fiscal folio' },
  levels: [
    {
      id: 'federal', branch: 'national', official: 'The federal state', native: 'Federale overheid · État fédéral', common: 'Federal government',
      description: 'The federal parliament sets the income taxes, VAT, excises and the social security contributions; the Federal Public Service Finance collects them, and the National Social Security Office (ONSS / RSZ) collects the contributions.',
      fiscalPower: 'The federal level legislates most taxes; since the 6th State reform the regions can set surcharges and reductions on the personal income tax and fully control several regional taxes.',
      refs: [ref(NTL)], label: 'Federal', sub: 'Fédéral',
    },
    {
      id: 'regions', branch: 'regional', official: 'Regions and communities (Flanders, Wallonia, Brussels-Capital; Flemish, French and German-speaking Communities)', native: 'Gewesten en gemeenschappen · Régions et communautés', common: 'Regions and communities',
      description: 'The three regions have their own taxes (registration rights, inheritance and gift taxes, vehicle taxes, environmental taxes and the green-certificate levies) and a share of the personal income tax; the National Tax List does not separate the communities’ taxes.',
      fiscalPower: 'The special financing law lets the regions set the rates and bases of regional taxes and surcharges and reductions on the personal income tax.',
      refs: [ref(PWC_PIT, 'Taxes on personal income'), ref(EUS)], label: 'Regions', sub: 'Gewesten · Régions',
    },
    {
      id: 'local', branch: 'local', official: 'Municipalities and provinces', native: 'Gemeenten en provincies · Communes et provinces', common: 'Local government',
      description: 'The municipalities and the provinces. They levy surcharges on the personal income tax and on the property tax and a few small taxes.',
      fiscalPower: 'Municipal and provincial councils set the surcharge rates within the limits of the regional laws.',
      refs: [ref(EUS)], label: 'Local', sub: 'Gemeenten · Communes',
    },
  ],
  supporting: [],
  denominators: [
    {
      id: 'federal-taxes-2024', label: 'Federal taxes (National Tax List), 2024',
      definition: 'The taxes on production and imports, on income and on capital that the National Tax List books to the federal government, the social security funds and the EU, other than the regional and local taxes and the sale of emission permits; includes the federal part of the personal income tax.',
      levelIds: ['federal'], amount: part('state'), period: y, sourceId: NTL,
      locator: 'Sheet BE, 2024, the lines listed with each tax',
      calculation: `Sum of the ${instruments.filter((i) => i.rev?.group === 'state').length} tax rows below (EUR million)`,
      caveat: `Calendar 2024; the list's cut-off was 30 October 2025. Vintage check against Eurostat's July 2026 accounts: ${vintage}.`,
    },
    {
      id: 'federal-social-employers-2024', label: 'Social contributions paid by employers, 2024',
      definition: 'The actual compulsory contributions of employers; imputed contributions are left out.',
      levelIds: ['federal'], amount: part('socialer'), period: y, sourceId: NTL,
      locator: 'Sheet BE, 2024, lines D611 C01 and C02',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'federal-social-households-2024', label: 'Social contributions paid by households, 2024',
      definition: 'The contributions of employees, the self-employed and the non-employed, voluntary contributions and small service charges.',
      levelIds: ['federal'], amount: part('socialhh'), period: y, sourceId: NTL,
      locator: 'Sheet BE, 2024, lines D613CE, D613CS, D613CN, D613V, D61SC and D6141',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'regions-pit-2024', label: 'Personal income tax received by the regions and communities, 2024',
      definition: 'The part of the personal income tax that Eurostat’s accounts record under the regions and communities.',
      levelIds: ['regions'], amount: part('regpit'), period: y, sourceId: EUS,
      locator: 'gov_10a_taxag, 2024, S.1312, D51A, million EUR',
      caveat: 'Eurostat July 2026 vintage, a different release from the National Tax List.',
    },
    {
      id: 'regions-taxes-2024', label: 'Taxes of the regions, 2024',
      definition: 'The registration rights, the inheritance and gift taxes, the vehicle taxes, the green-certificate levies, the gambling tax, the environmental taxes and the regional part of the property tax.',
      levelIds: ['regions'], amount: part('regions'), period: y, sourceId: NTL,
      locator: 'Sheet BE, 2024, the lines listed with each tax',
      calculation: `Sum of the ${instruments.filter((i) => i.rev?.group === 'regions').length} regional rows below (EUR million)`,
      caveat: `Eurostat books EUR ${n.fmt(sec['S1312:D2'])} million of taxes on production and EUR ${n.fmt(sec['S1312:D91'])} million of capital taxes to the regions and communities; the National Tax List's regional lines differ from that by small amounts (for example EUR 4,865.6 million registration rights against EUR ${n.fmt(sec['S1312:D214C'])} million of transaction taxes).`,
    },
    {
      id: 'regions-other-production-2024', label: 'Other taxes on production recorded under the regions, 2024',
      definition: 'The part of the "other taxes on production" line that Eurostat’s accounts record under the regions.',
      levelIds: ['regions'], amount: part('regionseus'), period: y, sourceId: EUS,
      locator: 'gov_10a_taxag, 2024, S.1312, D29H, million EUR',
      caveat: 'Eurostat July 2026 vintage; the allocation to the NTL line is an inference from the amounts.',
    },
    {
      id: 'local-eurostat-2024', label: 'Taxes recorded under local government by Eurostat, 2024',
      definition: 'The personal income tax surcharges, the property tax surcharges and the part of the "other taxes on production" that Eurostat’s accounts record under local government.',
      levelIds: ['local'], amount: part('localeus'), period: y, sourceId: EUS,
      locator: 'gov_10a_taxag, 2024, S.1313: D51A, D29A and D29H, million EUR',
      caveat: 'Eurostat July 2026 vintage, a different release from the National Tax List; the National Tax List has no sector split.',
    },
    {
      id: 'local-patrimony-2024', label: 'Patrimony and appliance taxes of local government, 2024',
      definition: 'The taxes on patrimony (grounds and buildings) and on automatic recreation appliances.',
      levelIds: ['local'], amount: part('local'), period: y, sourceId: NTL,
      locator: 'Sheet BE, 2024, lines D59A C01 and D29B C02',
      caveat: 'Calendar 2024, same list and cut-off as the federal taxes.',
    },
  ],
  sizing: {
    label: 'Taxes and compulsory social contributions of all levels of government',
    definition: 'The taxes of the federal government, the regions and communities and local government plus the actual social contributions, calendar 2024, as listed in the National Tax List and split by Eurostat. Excludes the sale of emission permits and imputed social contributions.',
    componentIds: ['federal-taxes-2024', 'federal-social-employers-2024', 'federal-social-households-2024', 'regions-pit-2024', 'regions-taxes-2024', 'regions-other-production-2024', 'local-eurostat-2024', 'local-patrimony-2024'],
  },
  fromProfile: 'belgium',
  structureOverride: {
    basis: 'OECD attribution to sub-sectors of general government (Interpretative Guide, section A.12)',
    folioLevels: { central: ['federal'], regional: ['regions'], local: ['local'] },
    levelNotes: { central: 'The OECD shows the social security funds separately; the folio draws their contributions under the federal government.' },
  },
  groups: {
    state: { title: 'Federal taxes 2024 – National Tax List (EUR million)', denominatorId: 'federal-taxes-2024', period: y, basis: 'ESA tax revenue, general government and EU institutions', sourceId: NTL },
    socialer: { title: 'Employers’ social contributions 2024 – National Tax List (EUR million)', denominatorId: 'federal-social-employers-2024', period: y, basis: 'Actual compulsory contributions', sourceId: NTL },
    socialhh: { title: 'Households’ social contributions 2024 – National Tax List (EUR million)', denominatorId: 'federal-social-households-2024', period: y, basis: 'Actual contributions', sourceId: NTL },
    regpit: { title: 'Regional part of the personal income tax 2024 – Eurostat (EUR million)', denominatorId: 'regions-pit-2024', period: y, basis: 'ESA taxes received by the regions and communities', sourceId: EUS },
    regions: { title: 'Regional taxes 2024 – National Tax List (EUR million)', denominatorId: 'regions-taxes-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
    regionseus: { title: 'Other regional production taxes 2024 – Eurostat (EUR million)', denominatorId: 'regions-other-production-2024', period: y, basis: 'ESA taxes received by the regions and communities', sourceId: EUS },
    localeus: { title: 'Local taxes recorded by Eurostat 2024 (EUR million)', denominatorId: 'local-eurostat-2024', period: y, basis: 'ESA taxes received by local government', sourceId: EUS },
    local: { title: 'Local patrimony taxes 2024 – National Tax List (EUR million)', denominatorId: 'local-patrimony-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
  },
  sources: [
    { id: NTL, org: 'European Commission, DG Taxation and Customs Union, with Eurostat', title: 'Data on Taxation Trends: National Tax Lists (NTL), edition 2026', url: 'https://taxation-customs.ec.europa.eu/taxation/economic-analysis/data-taxation-trends_en', kind: 'statistics', language: 'en', publishedDate: '2026-03-31', periodCovered: 'Calendar year 2024 (series from 1995)', accessed: D, nextExpected: '2027-03', note: 'Workbook "NTL edition 2026 web.xlsx", sheet BE: every tax and social contribution by its national name and ESA code, in EUR million. Data cut-off 30 October 2025.' },
    { id: EUS, org: 'Eurostat', title: 'Main national accounts tax aggregates (gov_10a_taxag)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table', kind: 'statistics', language: 'en', publishedDate: '2026-07-21', periodCovered: 'Calendar year 2024', accessed: D, nextExpected: '2027-07', note: 'Taxes and social contributions by sub-sector (S.1311 federal, S.1312 regions and communities, S.1313 local, S.1314 social security) and ESA item; used to split the lines shared between levels and to check the totals of the National Tax List.' },
    { id: PWC_CIT, org: 'PwC', title: 'Worldwide Tax Summaries: Belgium – Corporate – Taxes on corporate income', url: 'https://taxsummaries.pwc.com/belgium/corporate/taxes-on-corporate-income', kind: 'guidance', language: 'en', publishedDate: '2026-09-10', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary, not an official source: corporate income tax 25%, 20% on the first EUR 100,000 for qualifying small companies.' },
    { id: PWC_PIT, org: 'PwC', title: 'Worldwide Tax Summaries: Belgium – Individual – Taxes on personal income', url: 'https://taxsummaries.pwc.com/belgium/individual/taxes-on-personal-income', kind: 'guidance', language: 'en', publishedDate: '2026-09-10', periodCovered: 'Rates for income year 2025', accessed: D, note: 'A professional firm’s summary: federal income tax rates between 25% and 50%; regional surcharges and reductions since the 6th State reform.' },
    { id: PWC_OTH, org: 'PwC', title: 'Worldwide Tax Summaries: Belgium – Corporate – Other taxes', url: 'https://taxsummaries.pwc.com/belgium/corporate/other-taxes', kind: 'guidance', language: 'en', publishedDate: '2026-09-10', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary: standard VAT rate 21%, reduced rates 12% and 6%.' },
  ],
  instruments,
};

buildCountry(spec);
n.reconcile(part('state') + part('socialer') + part('socialhh') + part('regpit') + part('regions') + part('regionseus') + part('localeus') + part('local'), ['T:D612', 'D29F:C04']);
