/**
 * Hungary: the folio's data. Run: npx tsx scripts/build/hungary.ts
 * Figures: Commission / Eurostat National Tax List (NTL), edition 2026, sheet HU, calendar 2024, HUF million
 * (scripts/build/data/ntl-HU.json). Level placement checked against Eurostat gov_10a_taxag.
 * Rates: PwC Worldwide Tax Summaries (reviews of July 2026), a professional-firm summary.
 */
import { buildCountry, type CountrySpec, type InstSpec, type Ref } from '../lib/build-country';
import { loadNtl, loadSectors } from '../lib/ntl';

const D = '2026-10-12';
const y = { label: '2024', kind: 'calendar-year' as const, start: '2024-01-01', end: '2024-12-31' };
const ref = (id: string, loc?: string): Ref => (loc ? [id, loc] : [id]);
const n = loadNtl('HU', 'HUF');
const sec = loadSectors('HU');
const NTL = 'ntl-2026';
const EUS = 'eurostat-taxag';
const PWC_CIT = 'pwc-hu-corporate';
const PWC_PIT = 'pwc-hu-individual';
const PWC_OTH = 'pwc-hu-other';
const PWC_NOTE = 'As summarised by PwC (review of 1 July 2026), not checked against the National Tax and Customs Administration (NAV).';

const inst = (i: Omit<InstSpec, 'rev'> & { keys: string[]; group: string }): InstSpec => {
  const { keys, group, ...rest } = i;
  return { ...rest, rev: n.rev(group, keys) };
};

const instruments: InstSpec[] = [
  inst({
    id: 'hu-pit', parent: 'allam', level: 'allam', family: 'income-personal', group: 'state', keys: ['D51M:C01'],
    official: 'Personal income tax', native: 'Személyi jövedelemadó (szja)', common: 'Personal income tax',
    base: 'Employment income, independent activity (including rents), capital income and other income of residents.',
    payer: 'Individuals; employers withhold it.',
    rate: { kind: 'flat', headline: '15%', details: ['The PIT rate is 15% for nearly all types of income (PwC).', PWC_NOTE], asOf: '2026-07-01' },
    explanation: 'The largest direct tax: HUF 4.6 trillion in 2024. Eurostat books all of it under central government.',
    exceptions: ['Allowances for dependent children and young couples reduce the tax base.'], refs: [ref(PWC_PIT, 'Personal income tax rate')], label: 'Personal income tax', sub: '15% flat', glyph: 'person',
  }),
  inst({
    id: 'hu-cit', parent: 'allam', level: 'allam', family: 'income-corporate', group: 'state', keys: ['D51O:C01'],
    official: 'Corporate income tax', native: 'Társasági adó', common: 'Corporate income tax',
    base: 'Profit of companies; a minimum tax base of 2% of total revenue applies.',
    payer: 'Companies.',
    rate: { kind: 'flat', headline: '9%', details: ['From 1 January 2017 the CIT rate is a flat 9% of the positive tax base (PwC).', PWC_NOTE], asOf: '2026-07-01' },
    explanation: 'HUF 1.1 trillion in 2024.',
    exceptions: [], refs: [ref(PWC_CIT, 'Corporate income tax rate')], label: 'Corporate income tax', sub: '9%', glyph: 'factory',
  }),
  inst({
    id: 'hu-sector-special-taxes', parent: 'allam', level: 'allam', category: 'special-levy', family: 'income-corporate', group: 'state', keys: ['D51O:C03', 'D51E:C02', 'D29H:C03', 'D29H:C04', 'D214I:C11'],
    official: 'Sector special taxes: extra tax on financial institutions, income tax and surtax on energy suppliers, surtax on pharmaceutical companies, special tax on retailers', native: 'Különadók (pénzügyi intézmények, energiaellátók, gyógyszercégek, kiskereskedők)', common: 'Sector special taxes',
    base: 'Named in the National Tax List: extra tax on financial institutions (HUF 158.7 billion), income tax on energy suppliers (203.2 billion), surtax on energy suppliers (76.0 billion), surtax on pharmaceutical companies (28.7 billion) and a special tax on retailers (265.0 billion).',
    payer: 'Financial institutions, energy suppliers, pharmaceutical companies and large retailers.',
    rate: { kind: 'varies', headline: 'Set by the special-tax laws', details: ['PwC refers to the regulation on the extra-profit tax and to higher mining royalty rates for the tax years 2023 and 2024.'] },
    explanation: 'Five sector-specific taxes of the list, together HUF 732 billion, more than the corporate income tax’s HUF 1.1 trillion would suggest for a single sector.',
    exceptions: [], refs: [ref(NTL, 'sheet HU, D51O C03, D51E C02, D29H C03 and C04, D214I C11'), ref(PWC_OTH, 'Mining royalty')], label: 'Sector special taxes', sub: 'Banks · energy · retail', glyph: 'scale',
  }),
  inst({
    id: 'hu-social-contribution-tax', parent: 'allam', level: 'allam', category: 'social-contribution', family: 'social-security', group: 'socialer', keys: ['D611C:C01', 'D611C:C02', 'D611C:C03', 'D611C:C04', 'D611C:C05', 'D611C:C06'],
    official: 'Social contribution tax and other employers’ contributions', native: 'Szociális hozzájárulási adó és munkáltatói járulékok', common: 'Employers’ contributions',
    base: 'The gross income paid to the employee. The list gives the social contribution tax (HUF 3.27 trillion), the contribution on simplified employment (58.0 billion), sick leave contributions (58.1 billion) and small lines.',
    payer: 'Employers.',
    rate: { kind: 'flat', headline: '13% of gross pay', details: ['The social tax base is the gross income paid to the employee and the rate is 13% (PwC).', PWC_NOTE], asOf: '2026-07-01' },
    explanation: 'The second largest flow after the employees’ contributions.',
    exceptions: [], refs: [ref(PWC_OTH, 'Employment-related tax and social security contributions payable by employers')], label: 'Social contribution tax', sub: '13%', glyph: 'heart',
  }),
  inst({
    id: 'hu-social-employees', parent: 'allam', level: 'allam', category: 'social-contribution', family: 'social-security', group: 'socialhh', keys: ['D613CE:C01', 'D613CE:C02', 'D613CE:C03'],
    official: 'Employees’ pension and non-pension contributions', native: 'Munkavállalói járulékok', common: 'Employees’ contributions',
    base: 'Gross pay. Pension contributions HUF 2.71 trillion, non-pension contributions HUF 2.25 trillion.',
    payer: 'Employees; the employer withholds.',
    rate: { kind: 'flat', headline: 'Set by the social security laws', details: ['The rate is not extracted here.'] },
    explanation: 'The largest line of all, HUF 5.0 trillion.',
    exceptions: [], refs: [ref(NTL, 'sheet HU, D613CE')], label: 'Social: employees', sub: 'Pension · health', glyph: 'heart',
  }),
  inst({
    id: 'hu-social-others', parent: 'allam', level: 'allam', category: 'social-contribution', family: 'social-security', group: 'socialoth', keys: ['D613CS:C01', 'D613CS:C02', 'D613CS:C03', 'D613CS:C04', 'D613CN:C01', 'D613CN:C03', 'D613V:C01'],
    official: 'Contributions of the self-employed and the non-employed, and voluntary contributions', native: 'Egyéni vállalkozók, nem foglalkoztatottak és önkéntes járulékok', common: 'Self-employed, non-employed and voluntary',
    base: 'Self-employed people (HUF 58.9 billion), the non-employed including the pension contribution on unemployment benefits (HUF 53.9 billion) and voluntary contributions (HUF 1.4 billion).',
    payer: 'Self-employed, non-employed and voluntarily insured persons.',
    rate: { kind: 'varies', headline: 'Set by the social security laws', details: [] },
    explanation: 'Seven lines.',
    exceptions: [], refs: [ref(NTL, 'sheet HU, D613CS, D613CN, D613V')], label: 'Other contributions', sub: 'Self-employed', glyph: 'heart',
  }),
  inst({
    id: 'hu-vat', parent: 'allam', level: 'allam', family: 'general-consumption', group: 'state', keys: ['D211:C01'],
    official: 'Value added tax', native: 'Általános forgalmi adó (áfa)', common: 'VAT', abbr: 'áfa',
    base: 'Goods and services supplied in Hungary, intra-EU acquisitions and imports.',
    payer: 'Consumers; businesses charge it and claim input credits.',
    rate: { kind: 'range', headline: '27% standard; 18% and 5% reduced', details: ['The general VAT rate is 27%; 18% on certain dairy and cereal products and on admission to musical and dancing events; 5% on new residential property and certain pharmaceutical products (PwC).', PWC_NOTE], asOf: '2026-07-01' },
    explanation: 'The largest tax by far: HUF 7.5 trillion.',
    exceptions: [], refs: [ref(PWC_OTH, 'Value-added tax')], label: 'VAT', sub: '27%', glyph: 'cart',
  }),
  inst({
    id: 'hu-customs', parent: 'allam', level: 'allam', category: 'customs-duty', family: 'trade', group: 'state', keys: ['D2121:C01'],
    official: 'Import duty', native: 'Vám', common: 'Customs duties',
    base: 'Goods imported from outside the EU, by the Common Customs Tariff.',
    payer: 'Importers.',
    rate: { kind: 'varies', headline: 'EU Common Customs Tariff', details: ['An EU own resource; Eurostat records it under the EU institutions.'] },
    explanation: 'Collected for the EU budget.',
    exceptions: [], refs: [ref(EUS, 'S.212, D212')], label: 'Customs duties', sub: 'EU tariff', glyph: 'ship',
  }),
  inst({
    id: 'hu-excise-fuel', parent: 'allam', level: 'allam', family: 'specific-consumption', group: 'state', keys: ['D214A:C01_4', 'D214A:C01_6'],
    official: 'Excise duties on fuels and on energy', native: 'Jövedéki adó (üzemanyag, energia)', common: 'Fuel and energy excise',
    base: 'Fuels (HUF 917.5 billion) and energy products (HUF 19.6 billion), by quantity.',
    payer: 'Producers and importers; passed on at the pump.',
    rate: { kind: 'specific', headline: 'Per unit of quantity', details: [] },
    explanation: 'The list splits the excises of the central budget into four lines by product; fuels are the biggest.',
    exceptions: [], refs: [ref(NTL, 'sheet HU, D214A C01_4 and C01_6')], label: 'Fuel excise', sub: 'Fuels · energy', glyph: 'flame',
  }),
  inst({
    id: 'hu-excise-tobacco', parent: 'allam', level: 'allam', family: 'specific-consumption', group: 'state', keys: ['D214A:C01_3'],
    official: 'Excise duty on tobacco', native: 'Jövedéki adó (dohány)', common: 'Tobacco excise',
    base: 'Cigarettes and other tobacco products.',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'mechanism', headline: 'Fixed by the Excise Tax Act', details: [] },
    explanation: 'HUF 565 billion in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet HU, D214A C01_3')], label: 'Tobacco excise', sub: 'Cigarettes', glyph: 'smoke',
  }),
  inst({
    id: 'hu-excise-alcohol', parent: 'allam', level: 'allam', family: 'specific-consumption', group: 'state', keys: ['D214A:C01_2', 'D214L:C01'],
    official: 'Excise duty on alcohol and the alcohol production duty', native: 'Jövedéki adó (alkohol)', common: 'Alcohol excise',
    base: 'Spirits, wine, beer and other alcoholic drinks.',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'specific', headline: 'Per litre of pure alcohol', details: [] },
    explanation: 'HUF 135 billion in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet HU, D214A C01_2, D214L C01')], label: 'Alcohol excise', sub: 'Spirits · wine · beer', glyph: 'wine',
  }),
  inst({
    id: 'hu-financial-transaction-duty', parent: 'allam', level: 'allam', family: 'property', group: 'state', keys: ['D214H:C05'],
    official: 'Financial transaction fee', native: 'Pénzügyi tranzakciós illeték', common: 'Financial transaction duty',
    base: 'Payment transactions of banks and other payment service providers.',
    payer: 'Payers of the transactions, through financial institutions.',
    rate: { kind: 'varies', headline: 'A percentage of the transaction with a cap', details: [] },
    explanation: 'HUF 437 billion in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet HU, D214H C05')], label: 'Financial transaction duty', sub: 'Payments', glyph: 'bank',
  }),
  inst({
    id: 'hu-insurance-communications', parent: 'allam', level: 'allam', family: 'specific-consumption', group: 'state', keys: ['D214G:C02', 'D214H:C02'],
    official: 'Insurance tax and the telephone (communications) tax', native: 'Biztosítási adó; hírközlési adó', common: 'Insurance and communications taxes',
    base: 'Insurance premiums (HUF 268.6 billion) and telephone and communications services (HUF 113.1 billion).',
    payer: 'Insurers and policyholders; telecommunications providers.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Two lines.',
    exceptions: [], refs: [ref(NTL, 'sheet HU, D214G C02, D214H C02')], label: 'Insurance and telecom taxes', sub: 'Premiums · phones', glyph: 'shield',
  }),
  inst({
    id: 'hu-duties-conveyances', parent: 'allam', level: 'allam', family: 'property', group: 'state', keys: ['D214C:C01', 'D91A:C01'],
    official: 'Duties on conveyances, inheritance and gifts', native: 'Visszterhes vagyonátruházási illeték; öröklési és ajándékozási illeték', common: 'Duties on property transfers',
    base: 'Property transfers for consideration, inheritances and gifts; the list gives HUF 216.9 billion under taxes on products and HUF 14.4 billion under capital taxes.',
    payer: 'Buyers, heirs and donees.',
    rate: { kind: 'varies', headline: 'Set by the Duties Act', details: [] },
    explanation: 'Eurostat books both under central government.',
    exceptions: [], refs: [ref(NTL, 'sheet HU, D214C C01, D91A C01')], label: 'Transfer duties', sub: 'Property', glyph: 'stamp',
  }),
  inst({
    id: 'hu-gambling', parent: 'allam', level: 'allam', family: 'specific-consumption', group: 'state', keys: ['D214F:C01'],
    official: 'Gambling tax', native: 'Játékadó', common: 'Gambling tax',
    base: 'Gambling operators.',
    payer: 'Operators.',
    rate: { kind: 'varies', headline: 'By type of game', details: [] },
    explanation: 'HUF 78 billion.',
    exceptions: [], refs: [ref(NTL, 'sheet HU, D214F C01')], label: 'Gambling tax', sub: 'Operators', glyph: 'dice',
  }),
  inst({
    id: 'hu-vehicle-taxes', parent: 'allam', level: 'allam', family: 'specific-consumption', group: 'state', keys: ['D214D:C01', 'D29B:C01', 'D29B:C03', 'D29B:C05', 'D59D:C01'],
    official: 'Registration duty, tax on domestically registered vehicles, company car tax and overweight fee', native: 'Regisztrációs adó; gépjárműadó; cégautóadó', common: 'Vehicle taxes',
    base: 'Registration (HUF 14.9 billion), the tax on domestically registered vehicles (HUF 55.9 billion marked central and HUF 42.2 billion in the households line), the company car tax (HUF 79.2 billion) and the overweight vehicle fee (HUF 1.9 billion).',
    payer: 'Vehicle owners and companies.',
    rate: { kind: 'varies', headline: 'By engine and vehicle', details: [] },
    explanation: 'Five lines; Eurostat books all of them under central government.',
    exceptions: [], refs: [ref(NTL, 'sheet HU, D214D C01, D29B C01, C03, C05, D59D C01')], label: 'Vehicle taxes', sub: 'Registration · company cars', glyph: 'car',
  }),
  inst({
    id: 'hu-innovation-health-levies', parent: 'allam', level: 'allam', category: 'special-levy', family: 'other', group: 'state', keys: ['D214I:C03', 'D214I:C04', 'D214I:C07', 'D214I:C09'],
    official: 'Innovation tax, tax on publicly financed medical products, public health product tax and surtaxes on distributors', native: 'Innovációs járulék; népegészségügyi termékadó', common: 'Innovation and health-product levies',
    base: 'As named in the National Tax List: the innovation tax (HUF 159.9 billion), the tax on publicly financed medical products (123.7 billion), the public health product tax (89.9 billion) and the surtaxes payable by distributors and investment funds (8.3 billion).',
    payer: 'Businesses.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Four lines that the list books as other taxes on products.',
    exceptions: [], refs: [ref(NTL, 'sheet HU, D214I C03, C04, C07, C09')], label: 'Innovation and health levies', sub: 'Businesses', glyph: 'gear',
  }),
  inst({
    id: 'hu-energy-sector-payments', parent: 'allam', level: 'allam', category: 'special-levy', family: 'resource', group: 'state', keys: ['D214I:C08', 'D214L:C07', 'D29H:C05'],
    official: 'Hydrocarbons stockholding fee, payments by energy-sector companies (MAVIR) and Water Supply Fund revenues', native: 'Szénhidrogén-készletezési díj; MAVIR-befizetések; Vízgazdálkodási Alap', common: 'Energy and water fund payments',
    base: 'The stockholding fee (HUF 77.7 billion), payments by energy-sector companies (HUF 40.3 billion) and the revenues of the Water Supply Fund (HUF 16.6 billion).',
    payer: 'Energy and water companies.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Three lines.',
    exceptions: [], refs: [ref(NTL, 'sheet HU, D214I C08, D214L C07, D29H C05')], label: 'Energy and water funds', sub: 'Stockholding', glyph: 'oil',
  }),
  inst({
    id: 'hu-environmental-taxes', parent: 'allam', level: 'allam', category: 'tax', family: 'resource', group: 'state', keys: ['D29F:C03', 'D29F:C01', 'D214A:C02', 'D214H:C03'],
    official: 'Carbon-dioxide tax, environmental pollution tax, environment protection fees and the waste disposal contribution', native: 'Szén-dioxid adó; környezetterhelési díj; hulladékártalmatlanítási hozzájárulás', common: 'Environmental taxes and fees',
    base: 'Carbon dioxide (HUF 64.2 billion), environment protection product fees (HUF 15.1 billion), waste disposal (HUF 16.7 billion) and the environmental pollution tax (HUF 5.3 billion).',
    payer: 'Polluters and producers of the products.',
    rate: { kind: 'varies', headline: 'Set by the environmental laws', details: ['The sale of emission allowances (HUF 167.6 billion) is not counted. Eurostat books HUF 0.4 billion of the pollution tax under local government; the list does not say which line.'] },
    explanation: 'Four lines.',
    exceptions: [], refs: [ref(NTL, 'sheet HU, D29F C01 and C03, D214A C02, D214H C03')], label: 'Environmental taxes', sub: 'CO₂ · products', glyph: 'leaf',
  }),
  inst({
    id: 'hu-tourism-airlines', parent: 'allam', level: 'allam', category: 'special-levy', family: 'specific-consumption', group: 'state', keys: ['D214H:C04', 'D214H:C06'],
    official: 'Tourism development contribution and the airlines levy', native: 'Turisztikai fejlesztési hozzájárulás; légitársasági adó', common: 'Tourism and airline levies',
    base: 'The tourism development contribution (HUF 85.2 billion) and a levy on airlines (HUF 38.5 billion).',
    payer: 'Tourism businesses and airlines.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Two central levies; the municipal tourism tax is a separate local tax.',
    exceptions: [], refs: [ref(NTL, 'sheet HU, D214H C04 and C06')], label: 'Tourism and airline levies', sub: 'Central', glyph: 'plane',
  }),
  inst({
    id: 'hu-small-business-taxes', parent: 'allam', level: 'allam', family: 'payroll', group: 'state', keys: ['D29C:C05', 'D29C:C06'],
    official: 'Itemised tax of small taxpayers (KATA) and tax of small enterprises (KIVA)', native: 'Kisadózók tételes adója (KATA); kisvállalati adó (KIVA)', common: 'Small-taxpayer taxes',
    base: 'Small businesses that opt for a simplified flat-sum tax: the itemised tax of small taxpayers (HUF 67.5 billion) and the tax of small enterprises (HUF 218.9 billion).',
    payer: 'Small taxpayers and small enterprises.',
    rate: { kind: 'varies', headline: 'A flat sum or a percentage, by regime', details: [] },
    explanation: 'The list books both regimes among taxes on payroll.',
    exceptions: [], refs: [ref(NTL, 'sheet HU, D29C C05 and C06')], label: 'Small-taxpayer taxes', sub: 'KATA · KIVA', glyph: 'gear',
  }),
  inst({
    id: 'hu-rehabilitation-contribution', parent: 'allam', level: 'allam', family: 'payroll', group: 'state', keys: ['D29C:C01', 'D29C:C04'],
    official: 'Rehabilitation contribution and the tax on sales representatives of medical companies', native: 'Rehabilitációs hozzájárulás', common: 'Rehabilitation contribution',
    base: 'Employers, in proportion to the wage bill; the rehabilitation contribution is HUF 187.7 billion and the sales representatives’ tax HUF 9.3 billion.',
    payer: 'Employers.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Payroll-based contributions that the list books apart from the social security contributions.',
    exceptions: [], refs: [ref(NTL, 'sheet HU, D29C C01 and C04')], label: 'Rehabilitation contribution', sub: 'Payroll', glyph: 'scroll',
  }),
  inst({
    id: 'hu-utility-tax', parent: 'allam', level: 'allam', family: 'property', group: 'state', keys: ['D29A:C04'],
    official: 'Tax of the public utility system', native: 'Közműadó', common: 'Utility network tax',
    base: 'As named in the National Tax List: the public utility system; Eurostat books it under central government.',
    payer: 'Owners of utility networks.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'HUF 41.4 billion in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet HU, D29A C04'), ref(EUS, 'S.1311, D29A')], label: 'Utility network tax', sub: 'Central', glyph: 'bolt',
  }),
  inst({
    id: 'hu-capital-protection-fees', parent: 'allam', level: 'allam', category: 'fee', family: 'other', group: 'state', keys: ['D29E:C03', 'D29E:C04', 'D29E:C05', 'D29E:C06', 'D29E:C07', 'D29E:C08', 'D29E:C01', 'D29E:C02', 'D59D:C02', 'D29E:C09', 'D91B:C01', 'D59D:C03', 'D51E:C01'],
    official: 'Extra capital taxes, protection fund levies, licence and concession fees, stamp duties and others', native: 'Extra tőkeadók; védelmi alapok; engedélydíjak; illetékek', common: 'Capital taxes, fund levies, fees and stamp duties',
    base: 'Extra capital taxes (HUF 99.4 billion), five protection fund levy lines (HUF 37.2 billion), tobacco shop concession fees (HUF 20.1 billion), stamp duties (HUF 30.2 billion in two lines), licence fees (HUF 7.1 billion), land protection contributions (HUF 8.7 billion) and other small lines.',
    payer: 'Businesses and individuals.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Thirteen lines that the list codes as taxes.',
    exceptions: [], refs: [ref(NTL, 'sheet HU, D29E, D59D C02 and C03, D91B C01, D51E C01')], label: 'Capital taxes and fees', sub: 'Funds · stamps', glyph: 'stamp',
  }),
  /* ---- municipalities ---- */
  inst({
    id: 'hu-local-business-tax', parent: 'onkormanyzat', level: 'onkormanyzat', family: 'general-consumption', group: 'localbt', keys: ['D214I:C01'],
    official: 'Local business tax (local tax on company sales)', native: 'Helyi iparűzési adó', common: 'Local business tax',
    base: 'The net sales of businesses in the municipality, less certain costs.',
    payer: 'Businesses.',
    rate: { kind: 'range', headline: 'Set by each municipality up to a ceiling', details: ['The National Tax List books it as a general tax on sales; HUF 1.35 trillion in 2024.'] },
    explanation: 'By far the main tax of the local governments: 81% of their taxes in the list.',
    exceptions: [], refs: [ref(NTL, 'sheet HU, D214I C01'), ref(EUS, 'S.1313, D2')], label: 'Local business tax', sub: 'Municipal', glyph: 'factory',
  }),
  inst({
    id: 'hu-local-property-taxes', parent: 'onkormanyzat', level: 'onkormanyzat', family: 'property', group: 'localprop', keys: ['D29A:C01', 'D29A:C02'],
    official: 'Building tax and development land tax', native: 'Építményadó; telekadó', common: 'Local property taxes',
    base: 'Buildings (HUF 175.6 billion) and development land (HUF 34.6 billion).',
    payer: 'Owners.',
    rate: { kind: 'range', headline: 'Set by each municipality up to a ceiling', details: [] },
    explanation: 'Eurostat books all of the building and land taxes except the utility network tax under local government.',
    exceptions: [], refs: [ref(NTL, 'sheet HU, D29A C01 and C02'), ref(EUS, 'S.1313, D29A')], label: 'Property taxes', sub: 'Buildings · land', glyph: 'house',
  }),
  inst({
    id: 'hu-local-other-taxes', parent: 'onkormanyzat', level: 'onkormanyzat', category: 'tax', family: 'other', group: 'local', keys: ['D59F:C02', 'D59F:C01', 'D59F:C03', 'D59A:C01', 'D91B:C02'],
    official: 'Tourism tax, communal tax on households and other municipal taxes', native: 'Idegenforgalmi adó; kommunális adó; egyéb helyi adók', common: 'Tourism and communal taxes',
    base: 'Tourism (HUF 24.1 billion), communal tax on households (HUF 16.8 billion), the environmental pollution tax (HUF 0.7 billion) and two other municipal taxes.',
    payer: 'Visitors, households and others.',
    rate: { kind: 'range', headline: 'Set by each municipality up to a ceiling', details: [] },
    explanation: 'Eurostat books HUF 41.9 billion of taxes on income and wealth under local government.',
    exceptions: [], refs: [ref(NTL, 'sheet HU, D59F, D59A C01, D91B C02'), ref(EUS, 'S.1313, D5')], label: 'Tourism and communal taxes', sub: 'Local', glyph: 'town',
  }),
];

const part = (g: string) => n.round(instruments.filter((i) => i.rev?.group === g).reduce((a, i) => a + i.rev!.amount, 0));
const sectorSum = (code: string) => ['S1311', 'S1312', 'S1313', 'S1314', 'S212'].reduce((a, s) => a + (sec[`${s}:${code}`] ?? 0), 0);
const vintage = ['D2', 'D5', 'D61'].map((c) => `${c}: NTL ${n.fmt(n.total(c))}, Eurostat July 2026 ${n.fmt(sectorSum(c))}`).join('; ');

const spec: CountrySpec = {
  today: D,
  id: 'hungary',
  iso3: 'HUN',
  isoNumeric: '348',
  names: { en: 'Hungary', native: 'Magyarország', nativeLang: 'hu' },
  currency: { code: 'HUF', symbol: 'Ft', name: 'Hungarian forint' },
  summary:
    'Hungary is a unitary state: Parliament sets the taxes and the National Tax and Customs Administration (NAV) collects them. It has a 27% standard VAT rate, a 15% flat personal income tax, a 9% corporate tax, and a set of sector-specific special taxes on banks, energy companies, retailers and others. Municipalities live on the local business tax, which brings in four-fifths of their taxes, and on property taxes.',
  structureNote:
    'The figures are the Commission’s National Tax List for 2024, in HUF million. The sale of emission allowances (HUF 167.6 billion) and the employers’ imputed contributions for sick leave (HUF 49.1 billion) are left out. The social contributions are drawn under the State. The list splits the excises of the central budget into four lines by product; those are drawn and not the total, which they add up to. The local business tax is booked in the list as a general tax on sales, which is why it appears among the taxes on products.',
  theme: {
    accent: '#477050',
    accent2: '#ce2939',
    motif: 'topo',
    motifNote: 'Topographic contour lines over the outline of Hungary (the generic motif; no bespoke art yet).',
    mapLabel: { lon: 19.4, lat: 47.1 },
  },
  rootLabel: { label: 'Hungary', sub: 'Magyarország · Fiscal folio' },
  levels: [
    {
      id: 'allam', branch: 'national', official: 'The State (Hungary)', native: 'Állam', common: 'State',
      description: 'Parliament legislates all taxes; the National Tax and Customs Administration (NAV) collects them and the social contributions, which fund the pension insurance and the health insurance funds.',
      fiscalPower: 'Taxes are set by law; municipalities may impose local taxes up to the ceilings in the Local Taxes Act.',
      refs: [ref(NTL)], label: 'State', sub: 'Állam',
    },
    {
      id: 'onkormanyzat', branch: 'local', official: 'Local governments (municipalities)', native: 'Önkormányzatok', common: 'Local governments',
      description: 'The municipalities (settlements and towns). They levy the local business tax, the building and land taxes, the tourism tax and the communal tax within the legal ceilings.',
      fiscalPower: 'The Local Taxes Act lets municipal councils decide which local taxes to levy and at what rate, up to a ceiling.',
      refs: [ref(EUS)], label: 'Local governments', sub: 'Önkormányzat',
    },
  ],
  supporting: [],
  denominators: [
    {
      id: 'allam-taxes-2024', label: 'State taxes (National Tax List), 2024',
      definition: 'The taxes on production and imports, on income and on capital that the National Tax List books to the State and the EU, other than the municipal taxes and the sale of emission allowances.',
      levelIds: ['allam'], amount: part('state'), period: y, sourceId: NTL,
      locator: 'Sheet HU, 2024, the lines listed with each tax',
      calculation: `Sum of the ${instruments.filter((i) => i.rev?.group === 'state').length} tax rows below (HUF million)`,
      caveat: `Calendar 2024; the list's cut-off was 30 October 2025. Vintage check against Eurostat's July 2026 accounts: ${vintage}.`,
    },
    {
      id: 'allam-social-employers-2024', label: 'Social contributions paid by employers, 2024',
      definition: 'The actual compulsory contributions of employers (social contribution tax and others); imputed contributions are left out.',
      levelIds: ['allam'], amount: part('socialer'), period: y, sourceId: NTL,
      locator: 'Sheet HU, 2024, lines D611C C01 to C06',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'allam-social-households-2024', label: 'Social contributions paid by employees, 2024',
      definition: 'The compulsory contributions of employees (pension and non-pension).',
      levelIds: ['allam'], amount: part('socialhh'), period: y, sourceId: NTL,
      locator: 'Sheet HU, 2024, line D613CE C01 to C03',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'allam-social-others-2024', label: 'Social contributions of the self-employed, the non-employed and voluntary, 2024',
      definition: 'The contributions of the self-employed, the non-employed (including the pension contribution on unemployment benefits) and voluntary contributions.',
      levelIds: ['allam'], amount: part('socialoth'), period: y, sourceId: NTL,
      locator: 'Sheet HU, 2024, lines D613CS, D613CN and D613V',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'onkormanyzat-business-tax-2024', label: 'Local business tax, 2024',
      definition: 'The local business tax, which the National Tax List books as a general tax on sales.',
      levelIds: ['onkormanyzat'], amount: part('localbt'), period: y, sourceId: NTL,
      locator: 'Sheet HU, 2024, line D214I C01',
      caveat: `Eurostat books HUF ${n.fmt(sec['S1313:D2'])} million of taxes on production to local government, which includes this tax and the property taxes.`,
    },
    {
      id: 'onkormanyzat-property-2024', label: 'Building and land taxes of the municipalities, 2024',
      definition: 'The building tax and the development land tax.',
      levelIds: ['onkormanyzat'], amount: part('localprop'), period: y, sourceId: NTL,
      locator: 'Sheet HU, 2024, lines D29A C01 and C02',
      caveat: `Eurostat books HUF ${n.fmt(sec['S1313:D29A'])} million of land and building taxes under local government.`,
    },
    {
      id: 'onkormanyzat-other-2024', label: 'Tourism, communal and other municipal taxes, 2024',
      definition: 'The tourism tax, the communal tax on households and other small municipal taxes.',
      levelIds: ['onkormanyzat'], amount: part('local'), period: y, sourceId: NTL,
      locator: 'Sheet HU, 2024, lines D59F C01 to C03, D59A C01, D91B C02',
      caveat: `Eurostat books HUF ${n.fmt(sec['S1313:D5'])} million of taxes on income and wealth to local government; HUF ${n.fmt(sec['S1313:D29F'])} million of the pollution taxes (D29F) in Eurostat's local sector stay in the State's environmental line because the list does not assign them.`,
    },
  ],
  sizing: {
    label: 'Taxes and compulsory social contributions of all levels of government',
    definition: 'The taxes of the State and the municipalities plus the actual social contributions, calendar 2024, as listed in the National Tax List. Excludes the sale of emission allowances and imputed social contributions.',
    componentIds: ['allam-taxes-2024', 'allam-social-employers-2024', 'allam-social-households-2024', 'allam-social-others-2024', 'onkormanyzat-business-tax-2024', 'onkormanyzat-property-2024', 'onkormanyzat-other-2024'],
  },
  fromProfile: 'hungary',
  structureOverride: {
    basis: 'OECD attribution to sub-sectors of general government (Interpretative Guide, section A.12)',
    folioLevels: { central: ['allam'], local: ['onkormanyzat'] },
    levelNotes: { central: 'The OECD shows the social security funds separately; the folio draws their contributions under the State.' },
  },
  groups: {
    state: { title: 'State taxes 2024 – National Tax List (HUF million)', denominatorId: 'allam-taxes-2024', period: y, basis: 'ESA tax revenue, general government and EU institutions', sourceId: NTL },
    socialer: { title: 'Employers’ social contributions 2024 – National Tax List (HUF million)', denominatorId: 'allam-social-employers-2024', period: y, basis: 'Actual compulsory contributions', sourceId: NTL },
    socialhh: { title: 'Employees’ social contributions 2024 – National Tax List (HUF million)', denominatorId: 'allam-social-households-2024', period: y, basis: 'Actual compulsory contributions', sourceId: NTL },
    socialoth: { title: 'Other households’ social contributions 2024 – National Tax List (HUF million)', denominatorId: 'allam-social-others-2024', period: y, basis: 'Actual contributions', sourceId: NTL },
    localbt: { title: 'Local business tax 2024 – National Tax List (HUF million)', denominatorId: 'onkormanyzat-business-tax-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
    localprop: { title: 'Building and land taxes 2024 – National Tax List (HUF million)', denominatorId: 'onkormanyzat-property-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
    local: { title: 'Other municipal taxes 2024 – National Tax List (HUF million)', denominatorId: 'onkormanyzat-other-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
  },
  sources: [
    { id: NTL, org: 'European Commission, DG Taxation and Customs Union, with Eurostat', title: 'Data on Taxation Trends: National Tax Lists (NTL), edition 2026', url: 'https://taxation-customs.ec.europa.eu/taxation/economic-analysis/data-taxation-trends_en', kind: 'statistics', language: 'en', publishedDate: '2026-03-31', periodCovered: 'Calendar year 2024 (series from 1995)', accessed: D, nextExpected: '2027-03', note: 'Workbook "NTL edition 2026 web.xlsx", sheet HU: every tax and social contribution by its national name and ESA code, in HUF million. Data cut-off 30 October 2025.' },
    { id: EUS, org: 'Eurostat', title: 'Main national accounts tax aggregates (gov_10a_taxag)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table', kind: 'statistics', language: 'en', publishedDate: '2026-07-21', periodCovered: 'Calendar year 2024', accessed: D, nextExpected: '2027-07', note: 'Taxes and social contributions by sub-sector and ESA item; used to place each tax at a level and to check the totals of the National Tax List.' },
    { id: PWC_CIT, org: 'PwC', title: 'Worldwide Tax Summaries: Hungary – Corporate – Taxes on corporate income', url: 'https://taxsummaries.pwc.com/hungary/corporate/taxes-on-corporate-income', kind: 'guidance', language: 'en', publishedDate: '2026-07-01', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary, not an official source: corporate income tax a flat 9% since 2017; minimum tax base 2% of revenue.' },
    { id: PWC_PIT, org: 'PwC', title: 'Worldwide Tax Summaries: Hungary – Individual – Taxes on personal income', url: 'https://taxsummaries.pwc.com/hungary/individual/taxes-on-personal-income', kind: 'guidance', language: 'en', publishedDate: '2026-07-01', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary: personal income tax 15% on nearly all types of income.' },
    { id: PWC_OTH, org: 'PwC', title: 'Worldwide Tax Summaries: Hungary – Corporate – Other taxes', url: 'https://taxsummaries.pwc.com/hungary/corporate/other-taxes', kind: 'guidance', language: 'en', publishedDate: '2026-07-01', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary: VAT 27%, 18% and 5%; social tax 13% of gross income paid by the employer; the extra-profit taxes and mining royalty.' },
  ],
  instruments,
};

buildCountry(spec);
n.reconcile(part('state') + part('socialer') + part('socialhh') + part('socialoth') + part('localbt') + part('localprop') + part('local'), ['T:D612', 'D29F:C02']);
