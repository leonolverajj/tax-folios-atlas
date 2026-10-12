/**
 * Luxembourg: the folio's data. Run: npx tsx scripts/build/luxembourg.ts
 * Figures: Commission / Eurostat National Tax List (NTL), edition 2026, sheet LU, calendar 2024, EUR million
 * (scripts/build/data/ntl-LU.json). Level placement checked against Eurostat gov_10a_taxag.
 * Rates: PwC Worldwide Tax Summaries (reviews of July and August 2026), a professional-firm summary.
 */
import { buildCountry, type CountrySpec, type InstSpec, type Ref } from '../lib/build-country';
import { loadNtl, loadSectors } from '../lib/ntl';

const D = '2026-10-12';
const y = { label: '2024', kind: 'calendar-year' as const, start: '2024-01-01', end: '2024-12-31' };
const ref = (id: string, loc?: string): Ref => (loc ? [id, loc] : [id]);
const n = loadNtl('LU', 'EUR');
const sec = loadSectors('LU');
const NTL = 'ntl-2026';
const EUS = 'eurostat-taxag';
const PWC_CIT = 'pwc-lu-corporate';
const PWC_PIT = 'pwc-lu-individual';
const PWC_OTH = 'pwc-lu-other';
const PWC_NOTE = 'Rate as summarised by PwC (review of July–August 2026), not checked against the Luxembourg tax administrations.';

const inst = (i: Omit<InstSpec, 'rev'> & { keys: string[]; group: string }): InstSpec => {
  const { keys, group, ...rest } = i;
  return { ...rest, rev: n.rev(group, keys) };
};

const instruments: InstSpec[] = [
  /* ---- the State: income and wealth ---- */
  inst({
    id: 'lu-wage-tax', parent: 'etat', level: 'etat', family: 'income-personal', group: 'state', keys: ['D51A:C01'],
    official: 'Tax withheld on wages and salaries', native: 'Impôt retenu sur les traitements et salaires', common: 'Wage tax',
    base: 'Wages and salaries; withheld each month by the employer using the tax tables.',
    payer: 'Employees; the employer withholds.',
    rate: { kind: 'progressive', headline: '0% to 42% progressive', details: ['The scale rises from 8% on taxable income above EUR 13,230 to 42% above EUR 234,870, after the 2025 indexation of 2.5 brackets (PwC).', PWC_NOTE] },
    explanation: 'The largest direct tax. Luxembourg also collects a solidarity surcharge on top (next row). All of it is a State tax; communes receive none of it in the national accounts.',
    exceptions: [], refs: [ref(PWC_PIT, 'Income tax rates')], label: 'Wage tax', sub: '8–42%', glyph: 'person',
  }),
  inst({
    id: 'lu-income-tax-assessed', parent: 'etat', level: 'etat', family: 'income-personal', group: 'state', keys: ['D51A:C03'],
    official: 'Personal income tax fixed by assessment', native: 'Impôt sur le revenu des personnes physiques fixé par voie d’assiette', common: 'Income tax by assessment',
    base: 'Income that is assessed after a tax return: self-employment, rents, and other income not taxed by withholding.',
    payer: 'Individuals.',
    rate: { kind: 'progressive', headline: 'Same progressive scale as the wage tax', details: [PWC_NOTE] },
    explanation: 'Assessed on the same scale as wages.',
    exceptions: [], refs: [ref(PWC_PIT, 'Income tax rates')], label: 'Income tax (assessed)', sub: 'Returns', glyph: 'person',
  }),
  inst({
    id: 'lu-solidarity-individuals', parent: 'etat', level: 'etat', family: 'income-personal', group: 'state', keys: ['D51A:C04'],
    official: 'Solidarity surcharge on personal income tax', native: 'Impôt de solidarité (majoration) des personnes physiques', common: 'Solidarity surcharge (persons)',
    base: 'A surcharge calculated on the income tax of individuals.',
    payer: 'Individuals.',
    rate: { kind: 'mechanism', headline: 'A percentage added to the income tax', details: ['The National Tax List calls it "Supplementary solidarity income tax"; the rate is not itemised there.'] },
    explanation: 'The surcharge brings in EUR 608 million in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet LU, D51A C04')], label: 'Solidarity surcharge', sub: 'On income tax', glyph: 'person',
  }),
  inst({
    id: 'lu-capital-income-withholding', parent: 'etat', level: 'etat', family: 'income-personal', group: 'state', keys: ['D51A:C05', 'D51A:C06', 'D51A:C08', 'D51A:C02', 'D51A:C10', 'D51A:C11'],
    official: 'Withholding taxes on capital income, directors’ fees and interest, and smaller withholding taxes', native: 'Impôt retenu sur les revenus de capitaux; tantièmes; retenue libératoire sur les intérêts', common: 'Capital income withholding taxes',
    base: 'Dividends and other capital income (EUR 1,053 million), directors’ fees (EUR 74 million), interest of residents (EUR 171 million, final withholding), certain income of non-residents (EUR 1 million), contributions to a supplementary pension plan for the self-employed (EUR 6 million) and a temporary balancing tax (EUR 0.01 million).',
    payer: 'Recipients of the income; the payer withholds.',
    rate: { kind: 'varies', headline: 'By type of income', details: [] },
    explanation: 'Six lines of the National Tax List that tax investment income at source.',
    exceptions: [], refs: [ref(NTL, 'sheet LU, D51A C02, C05, C06, C08, C10, C11')], label: 'Capital income withholding', sub: 'Dividends · interest', glyph: 'coin',
  }),
  inst({
    id: 'lu-corporation-tax', parent: 'etat', level: 'etat', family: 'income-corporate', group: 'state', keys: ['D51B:C01', 'D51B:C02', 'D51B:C04'],
    official: 'Corporation tax, its solidarity surcharge and the real estate levy', native: 'Impôt sur le revenu des collectivités; impôt de solidarité; prélèvement immobilier', common: 'Corporation tax',
    base: 'Taxable profit of companies; the surcharge (EUR 262 million) is added to the tax; the real estate levy is EUR 8 million.',
    payer: 'Companies.',
    rate: { kind: 'progressive', headline: '15% to EUR 175,000 of income; 17% above EUR 200,000', details: ['Plus a solidarity surtax of 7% of the tax; the overall rate with the municipal business tax is 24.94% in Luxembourg City (PwC).', PWC_NOTE] },
    explanation: 'The State’s corporate income tax. The municipal business tax (trade tax) is drawn under the communes.',
    exceptions: [], refs: [ref(PWC_CIT, 'Corporate income tax rates')], label: 'Corporation tax', sub: '15% · 17%', glyph: 'factory',
  }),
  inst({
    id: 'lu-net-wealth-tax', parent: 'etat', level: 'etat', family: 'property', group: 'state', keys: ['D59A:C01'],
    official: 'Net wealth tax', native: 'Impôt sur la fortune', common: 'Net wealth tax',
    base: 'The net assets of companies (since 2006 the tax no longer applies to individuals).',
    payer: 'Companies.',
    rate: { kind: 'varies', headline: 'Set by law', details: ['The National Tax List shows EUR 1,101.5 million in 2024, about the same as in 2023.'] },
    explanation: 'A significant revenue source for Luxembourg.',
    exceptions: [], refs: [ref(NTL, 'sheet LU, D59A C01')], label: 'Net wealth tax', sub: 'Companies', glyph: 'gem',
  }),
  inst({
    id: 'lu-subscription-tax', parent: 'etat', level: 'etat', category: 'tax', family: 'other', group: 'state', keys: ['D29H:C03'],
    official: 'Subscription tax on company securities ("holding tax")', native: 'Taxe d’abonnement sur les titres de société', common: 'Subscription tax',
    base: 'As named in the National Tax List: company securities, booked as a tax on production.',
    payer: 'Not given in the list.',
    rate: { kind: 'varies', headline: 'Set by the Law on the taxe d’abonnement', details: ['EUR 1,317.3 million in 2024 and EUR 1,216.7 million in 2023.'] },
    explanation: 'The fourth largest tax line in the State’s list.',
    exceptions: [], refs: [ref(NTL, 'sheet LU, D29H C03')], label: 'Subscription tax', sub: 'Securities', glyph: 'ledger',
  }),
  inst({
    id: 'lu-inheritance', parent: 'etat', level: 'etat', family: 'property', group: 'state', keys: ['D91A:C01'],
    official: 'Inheritance duty', native: 'Droits de succession', common: 'Inheritance duty',
    base: 'Inheritances other than those in direct line.',
    payer: 'Heirs.',
    rate: { kind: 'varies', headline: 'By relationship to the deceased', details: [] },
    explanation: 'EUR 134 million in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet LU, D91A C01')], label: 'Inheritance duty', sub: 'Succession', glyph: 'gem',
  }),
  /* ---- the State: consumption ---- */
  inst({
    id: 'lu-vat', parent: 'etat', level: 'etat', family: 'general-consumption', group: 'state', keys: ['D211:C01'],
    official: 'Value added tax', native: 'Taxe sur la valeur ajoutée', common: 'VAT', abbr: 'TVA',
    base: 'Goods and services supplied in Luxembourg and imports.',
    payer: 'Consumers; businesses charge it and claim input credits.',
    rate: { kind: 'range', headline: '17% standard; 14%, 8% and 3% reduced', details: ['The standard rate of 17% is the lowest in the EU; 14% on certain wines and advertising pamphlets; 8% on gas and electricity; 3% on food, books, pharmaceuticals and children’s clothing (PwC).', 'The pre-2023 rates were reinstated on 1 January 2024 after a temporary one-point cut in 2023 (Luxembourg Chronicle).', PWC_NOTE] },
    explanation: 'The second largest tax line after the wage tax.',
    exceptions: ['Banking, financial and insurance services are generally exempt.'], refs: [ref(PWC_OTH, 'Value-added tax'), ref('chronicle-lu-vat')], label: 'VAT', sub: '17%', glyph: 'cart',
  }),
  inst({
    id: 'lu-customs', parent: 'etat', level: 'etat', category: 'customs-duty', family: 'trade', group: 'state', keys: ['D2121:C01', 'D2122A:C01'],
    official: 'Import duties and levies on imported agricultural products', native: 'Droits sur les importations; prélèvements agricoles', common: 'Customs duties',
    base: 'Goods imported from outside the EU, by the Common Customs Tariff.',
    payer: 'Importers.',
    rate: { kind: 'varies', headline: 'EU Common Customs Tariff', details: ['An EU own resource; Eurostat records it under the EU institutions.'] },
    explanation: 'Collected for the EU budget.',
    exceptions: [], refs: [ref(EUS, 'S.212, D212')], label: 'Customs duties', sub: 'EU tariff', glyph: 'ship',
  }),
  inst({
    id: 'lu-tobacco-excise', parent: 'etat', level: 'etat', family: 'specific-consumption', group: 'state', keys: ['D2122C:C08', 'D214A:C04'],
    official: 'Excise duty on tobacco (on imports and on national production)', native: 'Droits d’accise sur le tabac', common: 'Tobacco excise',
    base: 'Cigarettes and other tobacco products.',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'mechanism', headline: 'Fixed by law', details: ['EUR 1,152.3 million is booked as excise on imports of tobacco and EUR 103.5 million on national production in 2024.'] },
    explanation: 'The excise on imports of tobacco is the larger part of the line.',
    exceptions: [], refs: [ref(NTL, 'sheet LU, D2122C C08, D214A C04')], label: 'Tobacco excise', sub: 'Cigarettes', glyph: 'smoke',
  }),
  inst({
    id: 'lu-fuel-excise', parent: 'etat', level: 'etat', family: 'specific-consumption', group: 'state', keys: ['D2122C:C02', 'D2122C:C03', 'D2122C:C04', 'D2122C:C05', 'D2122C:C06', 'D2122C:C16', 'D214L:C06'],
    official: 'Excise duties on mineral oils and gases, the supplementary fuel tax and the CO₂ tax', native: 'Droits d’accise sur les huiles minérales; taxe complémentaire; taxe CO₂', common: 'Fuel excises and CO₂ tax',
    base: 'Petrol, diesel and heating oil by volume; liquefied gas; the CO₂ tax on fuels (EUR 228 million) and on gas (EUR 29 million).',
    payer: 'Fuel importers and suppliers; passed on at the pump.',
    rate: { kind: 'specific', headline: 'Per litre or per tonne, fixed by law', details: ['EUR 387 million excise on mineral oils, EUR 150 million autonomous excise, EUR 115 million supplementary tax, EUR 228 million CO₂ tax (fuels) and EUR 29 million CO₂ tax (gas) in 2024.'] },
    explanation: 'Seven lines that tax energy products.',
    exceptions: [], refs: [ref(NTL, 'sheet LU, D2122C C02 to C06 and C16, D214L C06')], label: 'Fuel excises and CO₂ tax', sub: 'Mineral oils · CO₂', glyph: 'flame',
  }),
  inst({
    id: 'lu-alcohol-excise', parent: 'etat', level: 'etat', family: 'specific-consumption', group: 'state', keys: ['D2122C:C01', 'D2122C:C07', 'D2122C:C09', 'D2122C:C10', 'D2122C:C14', 'D214A:C01', 'D214A:C02', 'D214A:C03'],
    official: 'Excise duties and consumption tax on alcoholic beverages, beer and intermediate products', native: 'Droits d’accises et taxe de consommation sur les alcools', common: 'Alcohol excise',
    base: 'Alcoholic beverages, imported and nationally produced.',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'specific', headline: 'Per litre, fixed by law', details: [] },
    explanation: 'Eight small lines of the list, together EUR 76 million.',
    exceptions: [], refs: [ref(NTL, 'sheet LU, D2122C C01, C07, C09, C10, C14, D214A C01 to C03')], label: 'Alcohol excise', sub: 'Spirits · beer', glyph: 'wine',
  }),
  inst({
    id: 'lu-energy-water-taxes', parent: 'etat', level: 'etat', category: 'tax', family: 'specific-consumption', group: 'state', keys: ['D214L:C01', 'D214L:C02', 'D214L:C03', 'D214L:C04', 'D214L:C05'],
    official: 'Taxes on electricity, natural gas and water', native: 'Taxes sur l’électricité, le gaz naturel et le prélèvement d’eau', common: 'Electricity, gas and water taxes',
    base: 'Electricity (supplementary tax, distribution and production taxes), natural gas consumption and water abstraction.',
    payer: 'Suppliers and consumers.',
    rate: { kind: 'varies', headline: 'Set by law', details: ['EUR 13.4 million water, 4.6 million production of electricity, 3.9 million natural gas, 1.7 million supplementary electricity tax and 1.2 million electricity distribution in 2024.'] },
    explanation: 'Five lines.',
    exceptions: [], refs: [ref(NTL, 'sheet LU, D214L C01 to C05')], label: 'Energy and water taxes', sub: 'Electricity · gas · water', glyph: 'bolt',
  }),
  inst({
    id: 'lu-insurance-taxes', parent: 'etat', level: 'etat', family: 'specific-consumption', group: 'state', keys: ['D214G:C01', 'D214G:C02'],
    official: 'Insurance premiums tax and the special tax in aid of the rescue service', native: 'Taxe sur les assurances; impôt spécial en charge des assureurs', common: 'Insurance taxes',
    base: 'Insurance premiums; the special tax is borne by insurers for the rescue service.',
    payer: 'Insurers and policyholders.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'A small tax on insurance contracts.',
    exceptions: [], refs: [ref(NTL, 'sheet LU, D214G')], label: 'Insurance taxes', sub: 'Premiums', glyph: 'shield',
  }),
  inst({
    id: 'lu-registration-duties', parent: 'etat', level: 'etat', family: 'property', group: 'state', keys: ['D214C:C02', 'D214C:C03', 'D214C:C04'],
    official: 'Registration duties, mortgage duties and the mortgage duty on salaries', native: 'Droits d’enregistrement; droits d’hypothèques', common: 'Registration and mortgage duties',
    base: 'Deeds and transfers of immovable property, and mortgages.',
    payer: 'Buyers and borrowers.',
    rate: { kind: 'varies', headline: 'Set by law', details: ['The communes receive a surtax on property transfers, drawn in their part. Registration duties fell from EUR 233.8 million in 2023 to EUR 170.3 million in 2024.'] },
    explanation: 'The State’s taxes on property transactions.',
    exceptions: [], refs: [ref(NTL, 'sheet LU, D214C C02 to C04')], label: 'Registration duties', sub: 'Property deeds', glyph: 'stamp',
  }),
  inst({
    id: 'lu-vehicle-taxes', parent: 'etat', level: 'etat', family: 'specific-consumption', group: 'state', keys: ['D214D:C01', 'D29B:C01', 'D29B:C02', 'D59F:C05', 'D59F:C06'],
    official: 'Vehicle registration and motor vehicle taxes (enterprises and households) and ship taxes', native: 'Taxe d’immatriculation; taxe sur véhicules automoteurs; taxe sur les navires', common: 'Vehicle taxes',
    base: 'The registration and ownership of motor vehicles and boats.',
    payer: 'Vehicle and boat owners.',
    rate: { kind: 'varies', headline: 'By engine and emissions', details: ['EUR 41.0 million paid by households and EUR 27.9 million by enterprises on motor vehicles; EUR 10.2 million registration; EUR 0.9 million ships and boats.'] },
    explanation: 'Five lines.',
    exceptions: [], refs: [ref(NTL, 'sheet LU, D214D C01, D29B C01 and C02, D59F C05 and C06')], label: 'Vehicle taxes', sub: 'Motor vehicles', glyph: 'car',
  }),
  inst({
    id: 'lu-guarantee-funds', parent: 'etat', level: 'etat', category: 'special-levy', family: 'other', group: 'state', keys: ['D29H:C05', 'D29H:C06'],
    official: 'Contributions to the Deposit Guarantee Fund (FGDL) and the Resolution Fund (FRL)', native: 'Contributions au FGDL et au FRL', common: 'Bank fund contributions',
    base: 'As named in the National Tax List; no further detail.',
    payer: 'Credit institutions.',
    rate: { kind: 'varies', headline: 'Set by the funds', details: ['The Resolution Fund line fell from EUR 243.4 million in 2023 to EUR 0.07 million in 2024.'] },
    explanation: 'Compulsory contributions that the statisticians book as taxes on production.',
    exceptions: [], refs: [ref(NTL, 'sheet LU, D29H C05 and C06')], label: 'Bank fund contributions', sub: 'FGDL · FRL', glyph: 'bank',
  }),
  inst({
    id: 'lu-other-state', parent: 'etat', level: 'etat', category: 'fee', family: 'other', group: 'state', keys: ['D214F:C01', 'D29H:C04', 'D59F:C01', 'D59F:C02', 'D59F:C03', 'D59F:C04'],
    official: 'Casino levy (State part), stamp duties, chancellery fees, dog tax and others', native: 'Prélèvements sur les jeux de casino; droits de timbre; timbres de chancellerie; taxe sur les chiens', common: 'Other State taxes and duties',
    base: 'Casino gambling (EUR 20.1 million), stamp duties (10.6), fees concerning foreign affairs (6.5), dog tax (1.5), chancellery stamps (1.0) and reclassified VAT (2.2).',
    payer: 'Various.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'The smaller State lines of the list.',
    exceptions: [], refs: [ref(NTL, 'sheet LU, D214F C01, D29H C04, D59F C01 to C04')], label: 'Other State taxes', sub: 'Casino · stamps', glyph: 'stamp',
  }),
  /* ---- social contributions (drawn under the State) ---- */
  inst({
    id: 'lu-social-employers', parent: 'etat', level: 'etat', category: 'social-contribution', family: 'social-security', group: 'socialer', keys: ['D611:C01'],
    official: 'Employers’ actual social contributions', native: 'Cotisations sociales des employeurs', common: 'Employers’ contributions',
    base: 'Gross pay. The National Tax List gives it as a subtotal split into pension (EUR 2,404 million) and non-pension (EUR 1,369 million) contributions.',
    payer: 'Employers.',
    rate: { kind: 'varies', headline: 'Set by the Social Security Code', details: ['Employee contributions are listed by PwC (sickness 2.80%, pension 8%); the employer’s rates are not extracted here.'] },
    explanation: 'The list does not itemise below the subtotal.',
    exceptions: [], refs: [ref(NTL, 'sheet LU, D611')], label: 'Social: employers', sub: 'Pension · health', glyph: 'heart',
  }),
  inst({
    id: 'lu-social-employees', parent: 'etat', level: 'etat', category: 'social-contribution', family: 'social-security', group: 'socialhh', keys: ['D613CE:C01'],
    official: 'Compulsory social contributions of employees', native: 'Cotisations sociales des salariés', common: 'Employees’ contributions',
    base: 'Gross pay up to a monthly ceiling.',
    payer: 'Employees; the employer withholds.',
    rate: { kind: 'flat', headline: 'Sickness 2.80% and pension 8% of gross pay, among others', details: ['PwC lists 2.80% for sickness and 8% for pension, each limited to a monthly ceiling of EUR 13,518.68 from May 2025, and a dependency contribution on gross income.', PWC_NOTE], asOf: '2026-08-03' },
    explanation: 'The largest social contribution line.',
    exceptions: [], refs: [ref(PWC_OTH, 'Social security contributions')], label: 'Social: employees', sub: '8% + 2.8% + …', glyph: 'heart',
  }),
  inst({
    id: 'lu-social-others', parent: 'etat', level: 'etat', category: 'social-contribution', family: 'social-security', group: 'socialhh', keys: ['D613CN:C01', 'D613CS:C01', 'D613V:C01'],
    official: 'Contributions of the non-employed, the self-employed and voluntary contributions', native: 'Cotisations des non-salariés, des indépendants et volontaires', common: 'Non-employed, self-employed and voluntary',
    base: 'As labelled in the National Tax List: compulsory contributions by the non-employed (EUR 1,227 million), by the self-employed (EUR 4 million) and voluntary households’ contributions (EUR 72 million).',
    payer: 'Insured persons.',
    rate: { kind: 'varies', headline: 'Set by the Social Security Code', details: [] },
    explanation: 'The remaining households’ contributions.',
    exceptions: [], refs: [ref(NTL, 'sheet LU, D613CN, D613CS, D613V')], label: 'Other contributions', sub: 'Non-employed', glyph: 'heart',
  }),
  /* ---- communes ---- */
  inst({
    id: 'lu-trade-tax', parent: 'communes', level: 'communes', family: 'income-corporate', group: 'localtt', keys: ['D51B:C03'],
    official: 'Municipal business (trade) tax', native: 'Impôt commercial communal', common: 'Municipal business tax',
    base: 'Business profit of companies and of self-employed people, calculated like the State tax and then multiplied by a municipal rate.',
    payer: 'Businesses.',
    rate: { kind: 'range', headline: 'About 6.75% in Luxembourg City', details: ['The rate varies by commune; PwC gives 6.75% in Luxembourg City, which with the corporation tax and the surtax makes 24.94%.', PWC_NOTE] },
    explanation: 'The communes’ main tax: EUR 1.63 billion, 96% of their taxes in the list.',
    exceptions: [], refs: [ref(PWC_CIT, 'Municipal business tax')], label: 'Municipal business tax', sub: 'Trade tax', glyph: 'factory',
  }),
  inst({
    id: 'lu-communal-property', parent: 'communes', level: 'communes', family: 'property', group: 'local', keys: ['D29A:C01', 'D29A:C02', 'D59A:C02'],
    official: 'Property tax (land and buildings), tax on secondary residences and tax on land without buildings', native: 'Impôt foncier; taxe sur les résidences secondaires', common: 'Communal property taxes',
    base: 'Land and buildings by assessed value; secondary residences.',
    payer: 'Owners.',
    rate: { kind: 'range', headline: 'A municipal multiplier on a State base', details: ['The list does not give rates.'] },
    explanation: 'Small in Luxembourg: EUR 45.6 million.',
    exceptions: [], refs: [ref(NTL, 'sheet LU, D29A C01 and C02, D59A C02')], label: 'Property tax', sub: 'Communal', glyph: 'house',
  }),
  inst({
    id: 'lu-communal-other', parent: 'communes', level: 'communes', category: 'fee', family: 'other', group: 'local', keys: ['D214C:C01', 'D214F:C02', 'D214H:C01', 'D214H:C02', 'D214H:C03', 'D214E:C01'],
    official: 'Surtax on property transfers, casino levy (communal part), tourist tax, construction tax in dense sectors, cabaret and entertainment taxes', native: 'Surtaxe sur les mutations immobilières; taxe de séjour; taxe sur les amusements publics', common: 'Other communal taxes',
    base: 'Property transfers (EUR 6.9 million), casinos (5.2), tourist stays (3.8), construction in dense sectors (2.0), licensed premises (0.5) and public entertainment (0.9).',
    payer: 'Various.',
    rate: { kind: 'varies', headline: 'Set by law and by commune', details: [] },
    explanation: 'Six small lines that Eurostat’s accounts place with local government.',
    exceptions: [], refs: [ref(NTL, 'sheet LU, D214C C01, D214E, D214F C02, D214H')], label: 'Other communal taxes', sub: 'Tourist · casino', glyph: 'town',
  }),
];

const part = (g: string) => n.round(instruments.filter((i) => i.rev?.group === g).reduce((a, i) => a + i.rev!.amount, 0));
const sectorSum = (code: string) => ['S1311', 'S1312', 'S1313', 'S1314', 'S212'].reduce((a, s) => a + (sec[`${s}:${code}`] ?? 0), 0);
const vintage = ['D2', 'D5', 'D61'].map((c) => `${c}: NTL ${n.fmt(n.total(c))}, Eurostat July 2026 ${n.fmt(sectorSum(c))}`).join('; ');

const spec: CountrySpec = {
  today: D,
  id: 'luxembourg',
  iso3: 'LUX',
  isoNumeric: '442',
  names: { en: 'Luxembourg', native: 'Lëtzebuerg', nativeLang: 'lb' },
  currency: { code: 'EUR', symbol: '€', name: 'Euro' },
  summary:
    'Luxembourg is a unitary state in which the State legislates and collects nearly everything. The social contributions are the largest flow, followed by the personal income tax, VAT, corporation tax and some unusual lines: a tax on company securities and a net wealth tax on companies. The communes live on one tax, the municipal business (trade) tax, which brings in 96% of their taxes.',
  structureNote:
    'The figures are the Commission’s National Tax List for 2024. Imputed social contributions of employers (EUR 1,101 million) and the sale of emission permits (EUR 13.5 million) are left out. The social contributions are drawn under the State. The level of each tax follows Eurostat’s accounts: only the municipal business tax, the property taxes and a few small taxes are communal.',
  theme: {
    accent: '#00a3e0',
    accent2: '#ed2939',
    motif: 'topo',
    motifNote: 'Topographic contour lines over the outline of Luxembourg (the generic motif; no bespoke art yet).',
    mapLabel: { lon: 6.1, lat: 49.8 },
  },
  rootLabel: { label: 'Luxembourg', sub: 'Lëtzebuerg · Fiscal folio' },
  levels: [
    {
      id: 'etat', branch: 'national', official: 'The State (Grand Duchy)', native: 'État', common: 'State',
      description: 'The Chamber of Deputies legislates all taxes. The direct tax administration (ACD), the indirect tax administration (AED) and customs collect them, and the Joint Social Security Centre (CCSS) collects the social contributions.',
      fiscalPower: 'All taxes are set by law; communes may only apply the municipal multipliers and the few taxes the law gives them.',
      refs: [ref(NTL)], label: 'State', sub: 'État',
    },
    {
      id: 'communes', branch: 'local', official: 'Communes (municipalities)', native: 'Gemengen · Communes', common: 'Communes',
      description: 'The only tier below the State. They levy the municipal business tax and the property tax with municipal multipliers and a few small taxes.',
      fiscalPower: 'The law lets each commune set the multiplier of the municipal business tax and of the property tax.',
      refs: [ref(EUS)], label: 'Communes', sub: 'Gemengen',
    },
  ],
  supporting: [],
  denominators: [
    {
      id: 'etat-taxes-2024', label: 'State taxes (National Tax List), 2024',
      definition: 'The taxes on production and imports, on income and wealth, and on capital that the National Tax List books to the State and the EU, other than the communal taxes and the sale of emission permits.',
      levelIds: ['etat'], amount: part('state'), period: y, sourceId: NTL,
      locator: 'Sheet LU, 2024, the lines listed with each tax',
      calculation: `Sum of the ${instruments.filter((i) => i.rev?.group === 'state').length} tax rows below (EUR million)`,
      caveat: `Calendar 2024; the list's cut-off was 30 October 2025. Vintage check against Eurostat's July 2026 accounts: ${vintage}.`,
    },
    {
      id: 'etat-social-employers-2024', label: 'Social contributions paid by employers, 2024',
      definition: 'The actual compulsory contributions of employers; imputed contributions are left out.',
      levelIds: ['etat'], amount: part('socialer'), period: y, sourceId: NTL,
      locator: 'Sheet LU, 2024, subtotal D611',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'etat-social-households-2024', label: 'Social contributions paid by households, 2024',
      definition: 'The actual contributions of employees, the self-employed, the non-employed and voluntary insured persons.',
      levelIds: ['etat'], amount: part('socialhh'), period: y, sourceId: NTL,
      locator: 'Sheet LU, 2024, lines D613CE, D613CN, D613CS, D613V',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'communes-business-tax-2024', label: 'Municipal business tax, 2024',
      definition: 'The municipal business (trade) tax, which the National Tax List books with the taxes on the income of corporations.',
      levelIds: ['communes'], amount: part('localtt'), period: y, sourceId: NTL,
      locator: 'Sheet LU, 2024, line D51B C03',
      caveat: `Eurostat books EUR ${n.fmt(sec['S1313:D5'])} million of taxes on income to local government.`,
    },
    {
      id: 'communes-other-taxes-2024', label: 'Property taxes and small taxes of the communes, 2024',
      definition: 'The property taxes and the small communal taxes (tourist tax, casino levy, surtax on property transfers and others).',
      levelIds: ['communes'], amount: part('local'), period: y, sourceId: NTL,
      locator: 'Sheet LU, 2024, the lines listed with each tax',
      calculation: 'Sum of the communal rows below (EUR million)',
      caveat: `Eurostat books EUR ${n.fmt(sec['S1313:D2'] + sec['S1313:D59A'])} million of taxes on production and on wealth (D2 + D59A) to local government; the lines here come to EUR ${n.fmt(part('local'))} million.`,
    },
  ],
  sizing: {
    label: 'Taxes and compulsory social contributions of all levels of government',
    definition: 'The taxes of the State and the communes plus the actual social contributions, calendar 2024, as listed in the National Tax List. Excludes the sale of emission permits and imputed social contributions.',
    componentIds: ['etat-taxes-2024', 'etat-social-employers-2024', 'etat-social-households-2024', 'communes-business-tax-2024', 'communes-other-taxes-2024'],
  },
  fromProfile: 'luxembourg',
  structureOverride: {
    basis: 'OECD attribution to sub-sectors of general government (Interpretative Guide, section A.12)',
    folioLevels: { central: ['etat'], local: ['communes'] },
    levelNotes: { central: 'The OECD shows the social security funds separately; the folio draws their contributions under the State.' },
  },
  groups: {
    state: { title: 'State taxes 2024 – National Tax List (EUR million)', denominatorId: 'etat-taxes-2024', period: y, basis: 'ESA tax revenue, general government and EU institutions', sourceId: NTL },
    socialer: { title: 'Employers’ social contributions 2024 – National Tax List (EUR million)', denominatorId: 'etat-social-employers-2024', period: y, basis: 'Actual compulsory contributions (subtotal)', sourceId: NTL },
    socialhh: { title: 'Households’ social contributions 2024 – National Tax List (EUR million)', denominatorId: 'etat-social-households-2024', period: y, basis: 'Actual contributions', sourceId: NTL },
    localtt: { title: 'Municipal business tax 2024 – National Tax List (EUR million)', denominatorId: 'communes-business-tax-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
    local: { title: 'Other communal taxes 2024 – National Tax List (EUR million)', denominatorId: 'communes-other-taxes-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
  },
  sources: [
    { id: NTL, org: 'European Commission, DG Taxation and Customs Union, with Eurostat', title: 'Data on Taxation Trends: National Tax Lists (NTL), edition 2026', url: 'https://taxation-customs.ec.europa.eu/taxation/economic-analysis/data-taxation-trends_en', kind: 'statistics', language: 'en', publishedDate: '2026-03-31', periodCovered: 'Calendar year 2024 (series from 1995)', accessed: D, nextExpected: '2027-03', note: 'Workbook "NTL edition 2026 web.xlsx", sheet LU: every tax and social contribution by its national name and ESA code, in EUR million. Data cut-off 30 October 2025.' },
    { id: EUS, org: 'Eurostat', title: 'Main national accounts tax aggregates (gov_10a_taxag)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table', kind: 'statistics', language: 'en', publishedDate: '2026-07-21', periodCovered: 'Calendar year 2024', accessed: D, nextExpected: '2027-07', note: 'Taxes and social contributions by sub-sector and ESA item; used to place each tax at a level (the municipal business tax is S.1313 D51B, EUR 1,633 million) and to check totals.' },
    { id: PWC_CIT, org: 'PwC', title: 'Worldwide Tax Summaries: Luxembourg – Corporate – Taxes on corporate income', url: 'https://taxsummaries.pwc.com/luxembourg/corporate/taxes-on-corporate-income', kind: 'guidance', language: 'en', publishedDate: '2026-07-31', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary, not an official source: corporate income tax 15% to EUR 175,000, 17% above EUR 200,000, solidarity surtax 7%, overall 24.94% in Luxembourg City with the 6.75% municipal business tax.' },
    { id: PWC_PIT, org: 'PwC', title: 'Worldwide Tax Summaries: Luxembourg – Individual – Taxes on personal income', url: 'https://taxsummaries.pwc.com/luxembourg/individual/taxes-on-personal-income', kind: 'guidance', language: 'en', publishedDate: '2026-08-03', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary: progressive scale from 8% above EUR 13,230 to 42% above EUR 234,870, adapted as of 2025.' },
    { id: PWC_OTH, org: 'PwC', title: 'Worldwide Tax Summaries: Luxembourg – Corporate – Other taxes', url: 'https://taxsummaries.pwc.com/luxembourg/corporate/other-taxes', kind: 'guidance', language: 'en', publishedDate: null, periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary: VAT 17%, 14%, 8% and 3%; employee social contributions (sickness 2.80%, pension 8%).' },
    { id: 'chronicle-lu-vat', org: 'Luxembourg Chronicle', title: 'Pre-2023 VAT rates reinstated in Luxembourg', url: 'https://chronicle.lu/category/taxation-audit/48000-pre-2023-vat-rates-reinstated-in-luxembourg', kind: 'guidance', language: 'en', publishedDate: null, periodCovered: '2024', accessed: D, note: 'News report: the VAT rates of 17%, 14% and 8% were reinstated on 1 January 2024 after the temporary cut of 2023.' },
  ],
  instruments,
};

buildCountry(spec);
n.reconcile(part('state') + part('socialer') + part('socialhh') + part('local') + part('localtt'), ['T:D612', 'D29F:C01']);
