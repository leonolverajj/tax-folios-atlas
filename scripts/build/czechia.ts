/**
 * Czechia: the folio's data. Run: npx tsx scripts/build/czechia.ts
 * Figures: Commission / Eurostat National Tax List (NTL), edition 2026, sheet CZ, calendar 2024, CZK million
 * (scripts/build/data/ntl-CZ.json). Level placement checked against Eurostat gov_10a_taxag.
 * Rates: PwC Worldwide Tax Summaries (review of 27 July 2026), a professional-firm summary.
 */
import { buildCountry, type CountrySpec, type InstSpec, type Ref } from '../lib/build-country';
import { loadNtl, loadSectors } from '../lib/ntl';

const D = '2026-10-12';
const y = { label: '2024', kind: 'calendar-year' as const, start: '2024-01-01', end: '2024-12-31' };
const ref = (id: string, loc?: string): Ref => (loc ? [id, loc] : [id]);
const n = loadNtl('CZ', 'CZK');
const sec = loadSectors('CZ');
const NTL = 'ntl-2026';
const EUS = 'eurostat-taxag';
const PWC_CIT = 'pwc-cz-corporate';
const PWC_PIT = 'pwc-cz-individual';
const PWC_OTH = 'pwc-cz-other';
const PWC_NOTE = 'As summarised by PwC (review of 27 July 2026), not checked against the Financial Administration.';

const inst = (i: Omit<InstSpec, 'rev'> & { keys: string[]; group: string }): InstSpec => {
  const { keys, group, ...rest } = i;
  return { ...rest, rev: n.rev(group, keys) };
};

const instruments: InstSpec[] = [
  /* ---- the State: income taxes ---- */
  inst({
    id: 'cz-pit-employment', parent: 'stat', level: 'stat', family: 'income-personal', group: 'state', keys: ['D51A:C01'],
    official: 'Personal income tax on dependent activity and functional benefits', native: 'Daň z příjmů fyzických osob ze závislé činnosti a funkčních požitků', common: 'Personal income tax on employment',
    base: 'Wages and salaries of employees.',
    payer: 'Employees; the employer withholds.',
    rate: { kind: 'progressive', headline: '15% · 23% above CZK 1.76 million', details: ['Gross annual income up to CZK 1,762,812 (36 times the average monthly salary) is taxed at 15%; the excess at 23% (PwC).', PWC_NOTE] },
    explanation: 'The largest direct tax on persons: CZK 238 billion in 2024.',
    exceptions: [], refs: [ref(PWC_PIT, 'Personal income tax rates')], label: 'Income tax: wages', sub: '15% · 23%', glyph: 'person',
  }),
  inst({
    id: 'cz-pit-self-employed', parent: 'stat', level: 'stat', family: 'income-personal', group: 'state', keys: ['D51A:C02'],
    official: 'Personal income tax on independent gainful activity', native: 'Daň z příjmů fyzických osob ze samostatné výdělečné činnosti', common: 'Income tax of the self-employed',
    base: 'Income of the self-employed.',
    payer: 'Self-employed people.',
    rate: { kind: 'progressive', headline: 'Same 15% and 23% rates', details: [PWC_NOTE] },
    explanation: 'CZK 27.7 billion in 2024, up from CZK 21.9 billion.',
    exceptions: [], refs: [ref(PWC_PIT, 'Personal income tax rates')], label: 'Income tax: self-employed', sub: 'Self-employed', glyph: 'person',
  }),
  inst({
    id: 'cz-pit-capital', parent: 'stat', level: 'stat', family: 'income-personal', group: 'state', keys: ['D51A:C03'],
    official: 'Personal income tax on capital income', native: 'Daň z příjmů fyzických osob z kapitálových výnosů', common: 'Income tax on capital income',
    base: 'Dividends, interest and other capital income, including income taxed by final withholding at source.',
    payer: 'Individuals; the payer withholds.',
    rate: { kind: 'flat', headline: '15% withholding on Czech dividends and interest', details: ['Income already taxed by final withholding tax at source (for example dividends or interest from bonds of Czech companies) is excluded from the progressive scale; a 15% rate also applies to selected foreign investment income (PwC).', PWC_NOTE] },
    explanation: 'CZK 46.6 billion in 2024.',
    exceptions: [], refs: [ref(PWC_PIT, 'Separate tax base')], label: 'Income tax: capital', sub: '15%', glyph: 'coin',
  }),
  inst({
    id: 'cz-corporate-income-tax', parent: 'stat', level: 'stat', family: 'income-corporate', group: 'state', keys: ['D51B:C01'],
    official: 'Corporate income tax', native: 'Daň z příjmů právnických osob', common: 'Corporate income tax',
    base: 'Profit of companies and other legal persons.',
    payer: 'Companies.',
    rate: { kind: 'flat', headline: '21% in 2024 and 2025 (19% before)', details: ['The standard CIT rate is 19%, raised to 21% in 2024 and 2025 (PwC).', PWC_NOTE] },
    explanation: 'Revenue grew 14% in 2024 with the rate increase.',
    exceptions: [], refs: [ref(PWC_CIT, 'Corporate income tax rates')], label: 'Corporate income tax', sub: '21%', glyph: 'factory',
  }),
  inst({
    id: 'cz-windfall-topup', parent: 'stat', level: 'stat', category: 'special-levy', family: 'income-corporate', group: 'state', keys: ['D51B:C04', 'D51B:C05'],
    official: 'Tax on excess profits (windfall tax) and the top-up tax', native: 'Daň z nadměrných příjmů; dorovnávací daň', common: 'Windfall tax and top-up tax',
    base: 'Excess profits of large banks and energy-sector companies in 2023–2025, and the top-up tax on large multinational groups.',
    payer: 'Large banks, energy companies and multinational groups.',
    rate: { kind: 'varies', headline: '60% surcharge on excess profit (windfall tax)', details: ['In 2023 through 2025 a 60% CIT surcharge applies on top of the standard CIT, so the total on excess profits is 81% in 2024 and 2025 (PwC).', 'The top-up tax (CZK 1.0 billion) is a new line in 2024.', PWC_NOTE] },
    explanation: 'The windfall tax brought in CZK 40 billion in 2024, about 6% of all income taxes.',
    exceptions: [], refs: [ref(PWC_CIT, 'Windfall tax')], label: 'Windfall tax', sub: 'Banks · energy', glyph: 'scale',
  }),
  /* ---- the State: social contributions ---- */
  inst({
    id: 'cz-social-employers', parent: 'stat', level: 'stat', category: 'social-contribution', family: 'social-security', group: 'socialer', keys: ['D611C:C01', 'D611C:C02', 'D611C:C03', 'D611C:C04', 'D611C:C05', 'D611V:C01'],
    official: 'Employers’ contributions: pension, sickness, employment policy, accident and public health insurance', native: 'Pojistné placené zaměstnavateli', common: 'Employers’ contributions',
    base: 'Gross pay. Pension insurance CZK 481 billion, health insurance CZK 205 billion, sickness insurance CZK 47 billion, employment policy CZK 27 billion, accident insurance CZK 12 billion, voluntary CZK 0.03 billion.',
    payer: 'Employers.',
    rate: { kind: 'flat', headline: 'Set by the social and health insurance laws', details: ['The rates are not extracted here.'] },
    explanation: 'About three-fifths of all social contributions.',
    exceptions: [], refs: [ref(NTL, 'sheet CZ, D611C and D611V')], label: 'Social: employers', sub: 'Pension · health', glyph: 'heart',
  }),
  inst({
    id: 'cz-social-employees', parent: 'stat', level: 'stat', category: 'social-contribution', family: 'social-security', group: 'socialhh', keys: ['D613CE:C01', 'D613CE:C02', 'D613CE:C04'],
    official: 'Employees’ contributions: pension, sickness and public health insurance', native: 'Pojistné placené zaměstnanci', common: 'Employees’ contributions',
    base: 'Gross pay. Pension insurance CZK 145 billion, health insurance CZK 103 billion, sickness insurance CZK 13 billion (a new line in 2024).',
    payer: 'Employees; the employer withholds.',
    rate: { kind: 'flat', headline: 'Set by the social and health insurance laws', details: ['The rates are not extracted here.'] },
    explanation: 'Employees’ sickness insurance appears as a new line in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet CZ, D613CE')], label: 'Social: employees', sub: 'Pension · health', glyph: 'heart',
  }),
  inst({
    id: 'cz-social-self-employed', parent: 'stat', level: 'stat', category: 'social-contribution', family: 'social-security', group: 'socialhh', keys: ['D613CS:C01', 'D613CS:C02', 'D613CS:C03', 'D613V:C01', 'D613V:C02'],
    official: 'Contributions of the self-employed and voluntary contributions', native: 'Pojistné osob samostatně výdělečně činných; dobrovolné pojistné', common: 'Self-employed and voluntary contributions',
    base: 'Pension insurance CZK 42.8 billion, public health insurance CZK 36.2 billion and employment policy CZK 1.8 billion paid by the self-employed, and voluntary contributions of CZK 0.7 billion.',
    payer: 'Self-employed people and voluntarily insured persons.',
    rate: { kind: 'varies', headline: 'Set by the social and health insurance laws', details: [] },
    explanation: 'Five lines.',
    exceptions: [], refs: [ref(NTL, 'sheet CZ, D613CS and D613V')], label: 'Self-employed', sub: 'Contributions', glyph: 'heart',
  }),
  inst({
    id: 'cz-health-insurance-state-paid', parent: 'stat', level: 'stat', category: 'insurance-premium', family: 'social-security', group: 'socialhh', keys: ['D613CN:C01'],
    official: 'Public health insurance paid by the government for the non-employed', native: 'Pojistné na veřejné zdravotní pojištění placené vládou za nezaměstnané', common: 'Health insurance paid by the State for the non-employed',
    base: 'People insured by the State (children, pensioners and others who have no employer).',
    payer: 'The government, on behalf of the insured.',
    rate: { kind: 'flat', headline: 'A fixed monthly amount per insured person', details: ['The List labels it "Public health insurance premium paid by the government for the unemployed". The monthly amount is not itemised in the list.'] },
    explanation: 'The statisticians count it as a contribution of households financed by a government transfer. It is a flow inside government; it is included here because the list includes it.',
    exceptions: [], refs: [ref(NTL, 'sheet CZ, D613CN')], label: 'Health insurance paid by State', sub: 'Non-employed', glyph: 'heart',
  }),
  /* ---- the State: consumption ---- */
  inst({
    id: 'cz-vat', parent: 'stat', level: 'stat', family: 'general-consumption', group: 'state', keys: ['D211:C01'],
    official: 'Value added tax', native: 'Daň z přidané hodnoty', common: 'VAT', abbr: 'DPH',
    base: 'Goods and services supplied in Czechia and imports.',
    payer: 'Consumers; businesses charge it and claim input credits.',
    rate: { kind: 'range', headline: '21% standard; 12% reduced', details: ['21% generally; 12% on groceries (except most drinks), medicines, tap water, hotel accommodation, admission to cultural and sports events, catering, heat and cold (PwC).', PWC_NOTE] },
    explanation: 'The largest consumption tax: CZK 587 billion.',
    exceptions: [], refs: [ref(PWC_OTH, 'Value-added tax')], label: 'VAT', sub: '21%', glyph: 'cart',
  }),
  inst({
    id: 'cz-customs', parent: 'stat', level: 'stat', category: 'customs-duty', family: 'trade', group: 'state', keys: ['D2121:C01'],
    official: 'Customs duties', native: 'Clo', common: 'Customs duties',
    base: 'Goods imported from outside the EU, by the Common Customs Tariff.',
    payer: 'Importers.',
    rate: { kind: 'varies', headline: 'EU Common Customs Tariff', details: ['An EU own resource; Eurostat records it under the EU institutions.'] },
    explanation: 'Collected for the EU budget.',
    exceptions: [], refs: [ref(EUS, 'S.212, D212')], label: 'Customs duties', sub: 'EU tariff', glyph: 'ship',
  }),
  inst({
    id: 'cz-excise-fuel', parent: 'stat', level: 'stat', family: 'specific-consumption', group: 'state', keys: ['D2122C:C01', 'D214A:C01'],
    official: 'Excise duty on mineral oils', native: 'Spotřební daň z minerálních olejů', common: 'Fuel excise',
    base: 'Petrol, diesel and other mineral oils, by quantity. The list gives two lines: CZK 52.7 billion on goods from outside the EU and CZK 39.7 billion on the rest.',
    payer: 'Producers and importers; passed on at the pump.',
    rate: { kind: 'specific', headline: 'Per 1,000 litres, fixed by the Excise Duty Act', details: [] },
    explanation: 'The biggest excise.',
    exceptions: [], refs: [ref(NTL, 'sheet CZ, D2122C C01, D214A C01')], label: 'Fuel excise', sub: 'Mineral oils', glyph: 'flame',
  }),
  inst({
    id: 'cz-excise-tobacco', parent: 'stat', level: 'stat', family: 'specific-consumption', group: 'state', keys: ['D2122C:C05', 'D214A:C05'],
    official: 'Excise duty on tobacco', native: 'Spotřební daň z tabáku', common: 'Tobacco excise',
    base: 'Cigarettes and other tobacco products.',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'mechanism', headline: 'Fixed by the Excise Duty Act', details: [] },
    explanation: 'CZK 59.6 billion in 2024, up 13%.',
    exceptions: [], refs: [ref(NTL, 'sheet CZ, D2122C C05, D214A C05')], label: 'Tobacco excise', sub: 'Cigarettes', glyph: 'smoke',
  }),
  inst({
    id: 'cz-excise-alcohol', parent: 'stat', level: 'stat', family: 'specific-consumption', group: 'state', keys: ['D2122C:C02', 'D2122C:C03', 'D2122C:C04', 'D214A:C02', 'D214A:C03', 'D214A:C04'],
    official: 'Excise duty on spirits, beer and wine', native: 'Spotřební daň z lihu, piva a vína', common: 'Alcohol excise',
    base: 'Spirits, beer and wine; six lines in the list.',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'specific', headline: 'Per litre of product or pure alcohol', details: [] },
    explanation: 'CZK 14.3 billion in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet CZ, D2122C C02 to C04, D214A C02 to C04')], label: 'Alcohol excise', sub: 'Spirits · beer · wine', glyph: 'wine',
  }),
  inst({
    id: 'cz-energy-taxes', parent: 'stat', level: 'stat', family: 'specific-consumption', group: 'state', keys: ['D2122C:C06', 'D2122C:C07', 'D2122C:C08', 'D214A:C07', 'D214A:C08', 'D214A:C09'],
    official: 'Taxes on electricity, natural gas and solid fuels', native: 'Daň z elektřiny, zemního plynu a pevných paliv', common: 'Electricity, gas and solid fuel taxes',
    base: 'Electricity (CZK 1.5 billion), natural gas (CZK 1.6 billion) and solid fuels (CZK 0.3 billion).',
    payer: 'Suppliers; passed on in the price.',
    rate: { kind: 'specific', headline: 'Per unit of energy', details: [] },
    explanation: 'Six lines.',
    exceptions: [], refs: [ref(NTL, 'sheet CZ, D2122C C06 to C08, D214A C07 to C09')], label: 'Energy taxes', sub: 'Electricity · gas', glyph: 'bolt',
  }),
  inst({
    id: 'cz-renewable-levies', parent: 'stat', level: 'stat', category: 'special-levy', family: 'specific-consumption', group: 'state', keys: ['D214A:C10', 'D214A:C11'],
    official: 'Levy on electricity from solar radiation and tax on energy from renewable sources', native: 'Odvod z elektřiny ze slunečního záření; daň na energii z obnovitelných zdrojů', common: 'Levies on renewable electricity',
    base: 'As named in the National Tax List: the solar levy (CZK 4.9 billion) and the tax on energy from renewable sources (CZK 22.5 billion, a line that did not exist in 2023).',
    payer: 'Not given in the list.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'The new line is the largest change among the Czech product taxes in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet CZ, D214A C10 and C11')], label: 'Renewable energy levies', sub: 'Solar · renewables', glyph: 'bolt',
  }),
  inst({
    id: 'cz-lottery', parent: 'stat', level: 'stat', family: 'specific-consumption', group: 'state', keys: ['D214F:C01'],
    official: 'Levy on proceeds of lotteries', native: 'Odvod výtěžku z provozování loterií', common: 'Lottery levy',
    base: 'Proceeds of lotteries and similar games.',
    payer: 'Operators.',
    rate: { kind: 'varies', headline: 'Set by the Gambling Act', details: [] },
    explanation: 'CZK 21.9 billion in 2024, up 18%.',
    exceptions: [], refs: [ref(NTL, 'sheet CZ, D214F C01')], label: 'Lottery levy', sub: 'Gambling', glyph: 'dice',
  }),
  inst({
    id: 'cz-road-tax', parent: 'stat', level: 'stat', family: 'specific-consumption', group: 'state', keys: ['D29B:C01'],
    official: 'Road tax', native: 'Silniční daň', common: 'Road tax',
    base: 'Vehicles used for business.',
    payer: 'Owners of vehicles used for business.',
    rate: { kind: 'varies', headline: 'By engine and vehicle size', details: ['From 2022 the road tax was effectively abolished for cars, buses and trucks up to 12 tons; it remains for heavier vehicles (PwC).', PWC_NOTE] },
    explanation: 'CZK 1.2 billion in 2024.',
    exceptions: [], refs: [ref(PWC_OTH, 'Road tax')], label: 'Road tax', sub: 'Business vehicles', glyph: 'car',
  }),
  inst({
    id: 'cz-environmental-charges', parent: 'stat', level: 'stat', category: 'fee', family: 'resource', group: 'state', keys: ['D29F:C01', 'D29F:C02', 'D29F:C04', 'D214D:C02'],
    official: 'Charges for water and air pollution and for the disposal of end-of-life vehicles', native: 'Poplatky za znečišťování vod a ovzduší; autovraky', common: 'Environmental charges',
    base: 'Discharge of waste water into surface waters (CZK 0.18 billion), air pollution (CZK 0.38 billion), and charges for collecting vehicle wrecks (CZK 0.06 billion).',
    payer: 'Polluters.',
    rate: { kind: 'varies', headline: 'Set by the environmental laws', details: ['The tax on emission permits (CZK 18.6 billion) is the sale of a right and is not counted.'] },
    explanation: 'Small charges.',
    exceptions: [], refs: [ref(NTL, 'sheet CZ, D29F C01, C02, C04, D214D C02')], label: 'Environmental charges', sub: 'Water · air', glyph: 'leaf',
  }),
  inst({
    id: 'cz-land-withdrawal', parent: 'stat', level: 'stat', category: 'fee', family: 'property', group: 'state', keys: ['D214C:C01', 'D214C:C02', 'D29A:C02', 'D29A:C03', 'D29A:C05', 'D214I:C01'],
    official: 'Payments for withdrawing land from the agricultural land fund and forest land, and fees collected by the Wine Fund', native: 'Odvody za odnětí půdy ze zemědělského půdního fondu; poplatky vinařského fondu', common: 'Land withdrawal fees',
    base: 'Taking farmland and forest land out of use (CZK 1.2 billion in all) and the fees of the Wine Fund (CZK 0.03 billion).',
    payer: 'Developers and wine producers.',
    rate: { kind: 'varies', headline: 'Set by law', details: ['Eurostat books CZK 0.33 billion of the transaction taxes (D214C) with local government; the list does not say which lines.'] },
    explanation: 'Six lines.',
    exceptions: [], refs: [ref(NTL, 'sheet CZ, D214C, D29A C02 C03 C05, D214I')], label: 'Land withdrawal fees', sub: 'Farmland · forest', glyph: 'wheat',
  }),
  inst({
    id: 'cz-licence-fees', parent: 'stat', level: 'stat', category: 'fee', family: 'other', group: 'state', keys: ['D59D:C01', 'D29E:C02'],
    official: 'Television and radio licence fees (households and businesses)', native: 'Televizní a rozhlasové poplatky', common: 'TV and radio licence fees',
    base: 'Households and businesses with a television or radio.',
    payer: 'Households (CZK 7.5 billion) and businesses (CZK 0.7 billion).',
    rate: { kind: 'specific', headline: 'A fixed monthly fee per household', details: [] },
    explanation: 'The fees that finance Czech Television and Czech Radio.',
    exceptions: [], refs: [ref(NTL, 'sheet CZ, D59D C01, D29E C02')], label: 'TV and radio fees', sub: 'Licences', glyph: 'scroll',
  }),
  inst({
    id: 'cz-financial-sector-contributions', parent: 'stat', level: 'stat', category: 'special-levy', family: 'other', group: 'state', keys: ['D29H:C02', 'D29H:C03', 'D29H:C04', 'D29H:C05'],
    official: 'Contributions to the Financial Market Guarantee System, the Securities Dealers Fund, the Loss Prevention Fund and the Travel Agencies Fund', native: 'Příspěvky do Garančního systému finančních trhů a dalších fondů', common: 'Financial-sector fund contributions',
    base: 'Financial Market Guarantee System (CZK 4.2 billion, down from CZK 6.4 billion in 2023), Securities Dealers Fund (CZK 0.4 billion), loss prevention fund (CZK 1.0 billion) and travel agencies fund (CZK 0.02 billion).',
    payer: 'Financial institutions, securities dealers and travel agencies.',
    rate: { kind: 'varies', headline: 'Set by the funds', details: [] },
    explanation: 'Compulsory contributions that the statisticians book as taxes on production.',
    exceptions: [], refs: [ref(NTL, 'sheet CZ, D29H C02 to C05')], label: 'Financial-sector funds', sub: 'Guarantee system', glyph: 'bank',
  }),
  inst({
    id: 'cz-admin-fees', parent: 'stat', level: 'stat', category: 'fee', family: 'other', group: 'state', keys: ['D29H:C01', 'D59F:C04', 'D59F:C03', 'D29H:C08', 'D29E:C01'],
    official: 'Administrative fees, other tax revenue and packaging registration fees', native: 'Správní poplatky; ostatní daňové příjmy', common: 'Administrative fees and other tax revenue',
    base: 'Administrative fees booked among taxes on production (CZK 1.4 billion) and among other current taxes (CZK 1.4 billion), other tax revenue and packaging registration fees.',
    payer: 'Businesses and individuals.',
    rate: { kind: 'varies', headline: 'Set by the Administrative Fees Act', details: ['Eurostat books CZK 0.7 billion of the taxes on production under local government; the list does not say which part of these fees is local, so they are drawn here.'] },
    explanation: 'Fees for official services.',
    exceptions: [], refs: [ref(NTL, 'sheet CZ, D29H C01 and C08, D59F C03 and C04, D29E C01')], label: 'Administrative fees', sub: 'Official services', glyph: 'stamp',
  }),
  /* ---- local self-government ---- */
  inst({
    id: 'cz-property-tax', parent: 'samosprava', level: 'samosprava', family: 'property', group: 'localprop', keys: ['D29A:C01', 'D59A:C01'],
    official: 'Real estate tax (buildings and land; businesses and households)', native: 'Daň z nemovitostí', common: 'Real estate tax',
    base: 'Land and buildings. The list gives CZK 19.7 billion for businesses and CZK 3.3 billion for households.',
    payer: 'Owners.',
    rate: { kind: 'range', headline: 'A national base with a municipal coefficient', details: ['The revenue nearly doubled in 2024, from CZK 12.5 billion to CZK 23.0 billion; the list does not give the reason.'] },
    explanation: 'The main tax of the municipalities.',
    exceptions: [], refs: [ref(NTL, 'sheet CZ, D29A C01, D59A C01'), ref(EUS, 'S.1313, D29A and D59A')], label: 'Real estate tax', sub: 'Municipal', glyph: 'house',
  }),
  inst({
    id: 'cz-municipal-cit', parent: 'samosprava', level: 'samosprava', family: 'income-corporate', group: 'localcit', keys: ['D51B:C02', 'D51B:C03'],
    official: 'Corporate income tax for municipalities and for regions', native: 'Daň z příjmů právnických osob za obce a za kraje', common: 'Corporate tax for municipalities and regions',
    base: 'As named in the National Tax List: corporate income tax assigned to municipalities (CZK 10.7 billion) and regions (CZK 1.0 billion); the list gives no more detail.',
    payer: 'Companies, including the municipalities and regions themselves as taxpayers.',
    rate: { kind: 'varies', headline: 'Set by law', details: ['Eurostat books CZK 11.7 billion of corporate income tax under local government (S.1313).'] },
    explanation: 'The only income tax that Eurostat places with local government; the shared personal income tax is booked centrally.',
    exceptions: [], refs: [ref(NTL, 'sheet CZ, D51B C02 and C03'), ref(EUS, 'S.1313, D51B')], label: 'Municipal corporate tax', sub: 'Municipalities · regions', glyph: 'factory',
  }),
  inst({
    id: 'cz-local-fees', parent: 'samosprava', level: 'samosprava', category: 'fee', family: 'other', group: 'local', keys: ['D214H:C01', 'D214H:C06', 'D214E:C02', 'D214D:C01', 'D59F:C01', 'D59F:C02', 'D29A:C04', 'D91B:C01'],
    official: 'Local fees: spa and recreation stay, advertising, admission, vehicle registration, dogs, entry permits and building land appreciation', native: 'Místní poplatky', common: 'Local fees',
    base: 'Spa or recreational stays (CZK 1.7 billion), advertising (CZK 0.2 billion), admission fees (CZK 0.09 billion), vehicle registration (CZK 0.4 billion), dogs (CZK 0.3 billion), permits to enter selected places (CZK 0.02 billion) and the fee for the appreciation of building land (CZK 0.02 billion).',
    payer: 'Residents, visitors and businesses.',
    rate: { kind: 'varies', headline: 'Set by each municipality', details: [] },
    explanation: 'Eight small lines placed with local government.',
    exceptions: [], refs: [ref(NTL, 'sheet CZ, D214H C01 and C06, D214E, D214D C01, D59F C01 and C02, D29A C04, D91B')], label: 'Local fees', sub: 'Spa · dogs · advertising', glyph: 'town',
  }),
];

const part = (g: string) => n.round(instruments.filter((i) => i.rev?.group === g).reduce((a, i) => a + i.rev!.amount, 0));
const sectorSum = (code: string) => ['S1311', 'S1312', 'S1313', 'S1314', 'S212'].reduce((a, s) => a + (sec[`${s}:${code}`] ?? 0), 0);
const vintage = ['D2', 'D5', 'D61'].map((c) => `${c}: NTL ${n.fmt(n.total(c))}, Eurostat July 2026 ${n.fmt(sectorSum(c))}`).join('; ');

const spec: CountrySpec = {
  today: D,
  id: 'czechia',
  iso3: 'CZE',
  isoNumeric: '203',
  names: { en: 'Czechia', native: 'Česko', nativeLang: 'cs' },
  currency: { code: 'CZK', symbol: 'Kč', name: 'Czech koruna' },
  summary:
    'Czechia is a unitary state in which Parliament sets every tax and the Financial Administration collects almost all of them. Social and health insurance contributions are the largest flow, then VAT and the income taxes. Municipalities and regions have little tax of their own: the real estate tax, the corporate income tax assigned to them and a set of local fees; the shared personal income tax is booked with the State in the national accounts.',
  structureNote:
    'The figures are the Commission’s National Tax List for 2024, in CZK million. The sale of emission permits (CZK 18.6 billion) and employers’ imputed social contributions (CZK 3.5 billion) are left out. The social contributions are drawn under the State. The list includes CZK 151 billion of health insurance paid by the government for people with no employer; that is a flow inside government counted as a household contribution, shown as its own line. The national tax list shows two sets of excise lines (goods from outside the EU and the rest) with the same names; both are drawn, merged by tax.',
  theme: {
    accent: '#3f7cff',
    accent2: '#d7141a',
    motif: 'topo',
    motifNote: 'Topographic contour lines over the outline of Czechia (the generic motif; no bespoke art yet).',
    mapLabel: { lon: 15.5, lat: 49.8 },
  },
  rootLabel: { label: 'Czechia', sub: 'Česko · Fiscal folio' },
  levels: [
    {
      id: 'stat', branch: 'national', official: 'The State (Czech Republic)', native: 'Stát', common: 'State',
      description: 'Parliament legislates all taxes; the Financial Administration and Customs Administration collect them, and the Czech Social Security Administration and the health insurance companies receive the contributions.',
      fiscalPower: 'Taxes are set by national law; municipalities set the coefficients and local fees within the limits of the law.',
      refs: [ref(NTL)], label: 'State', sub: 'Stát',
    },
    {
      id: 'samosprava', branch: 'local', official: 'Local self-government (municipalities and regions)', native: 'Samospráva (obce a kraje)', common: 'Local government',
      description: 'Municipalities and the 14 regions. They receive the real estate tax and a share of the corporate income tax, and charge local fees; they also receive a share of the shared taxes, which Eurostat’s accounts book with the State.',
      fiscalPower: 'Municipalities decide the coefficients of the real estate tax and local fees within the limits set by law.',
      refs: [ref(EUS)], label: 'Local government', sub: 'Samospráva',
    },
  ],
  supporting: [],
  denominators: [
    {
      id: 'stat-taxes-2024', label: 'State taxes (National Tax List), 2024',
      definition: 'The taxes on production and imports, on income and on capital that the National Tax List books to the State and the EU, other than the local lines and the sale of emission permits.',
      levelIds: ['stat'], amount: part('state'), period: y, sourceId: NTL,
      locator: 'Sheet CZ, 2024, the lines listed with each tax',
      calculation: `Sum of the ${instruments.filter((i) => i.rev?.group === 'state').length} tax rows below (CZK million)`,
      caveat: `Calendar 2024; the list's cut-off was 30 October 2025. Vintage check against Eurostat's July 2026 accounts: ${vintage}.`,
    },
    {
      id: 'stat-social-employers-2024', label: 'Social contributions paid by employers, 2024',
      definition: 'The actual compulsory contributions of employers (pension, sickness, employment, accident and health insurance); imputed contributions are left out.',
      levelIds: ['stat'], amount: part('socialer'), period: y, sourceId: NTL,
      locator: 'Sheet CZ, 2024, lines D611C C01 to C05 and D611V',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'stat-social-households-2024', label: 'Social contributions paid by households, 2024',
      definition: 'The contributions of employees, the self-employed and voluntary insured persons, and the health insurance paid by the government for the non-employed.',
      levelIds: ['stat'], amount: part('socialhh'), period: y, sourceId: NTL,
      locator: 'Sheet CZ, 2024, lines D613CE, D613CS, D613CN, D613V',
      caveat: 'Calendar 2024, same list and cut-off as the taxes. CZK 151.5 billion of it is health insurance that the government pays for the non-employed.',
    },
    {
      id: 'samosprava-property-2024', label: 'Real estate tax of the municipalities, 2024',
      definition: 'The tax on land and buildings, paid by businesses and by households.',
      levelIds: ['samosprava'], amount: part('localprop'), period: y, sourceId: NTL,
      locator: 'Sheet CZ, 2024, lines D29A C01 and D59A C01',
      caveat: `Eurostat books CZK ${n.fmt(sec['S1313:D29A'])} million of land and building taxes (D29A) and CZK ${n.fmt(sec['S1313:D59A'])} million of other wealth taxes (D59A) to local government.`,
    },
    {
      id: 'samosprava-cit-2024', label: 'Corporate income tax assigned to municipalities and regions, 2024',
      definition: 'The corporate income tax that the National Tax List labels "for municipalities" and "for regions".',
      levelIds: ['samosprava'], amount: part('localcit'), period: y, sourceId: NTL,
      locator: 'Sheet CZ, 2024, lines D51B C02 and C03',
      caveat: `Eurostat books CZK ${n.fmt(sec['S1313:D51B'])} million of corporate income tax to local government.`,
    },
    {
      id: 'samosprava-fees-2024', label: 'Local fees, 2024',
      definition: 'The local fees and small taxes of the municipalities.',
      levelIds: ['samosprava'], amount: part('local'), period: y, sourceId: NTL,
      locator: 'Sheet CZ, 2024, the lines listed with the fee',
      caveat: `Eurostat books CZK ${n.fmt(sec['S1313:D2'])} million of taxes on production to local government in all (CZK ${n.fmt(sec['S1313:D29A'])} million is the real estate tax); the lines drawn as local fees come to CZK ${n.fmt(part('local'))} million, because the list does not say which share of the administrative fees and land withdrawal fees is local.`,
    },
  ],
  sizing: {
    label: 'Taxes and compulsory social contributions of all levels of government',
    definition: 'The taxes of the State and of local self-government plus the actual social contributions, calendar 2024, as listed in the National Tax List. Excludes the sale of emission permits and imputed social contributions.',
    componentIds: ['stat-taxes-2024', 'stat-social-employers-2024', 'stat-social-households-2024', 'samosprava-property-2024', 'samosprava-cit-2024', 'samosprava-fees-2024'],
  },
  fromProfile: 'czechia',
  structureOverride: {
    basis: 'OECD attribution to sub-sectors of general government (Interpretative Guide, section A.12)',
    folioLevels: { central: ['stat'], local: ['samosprava'] },
    levelNotes: { central: 'The OECD shows the social security funds separately; the folio draws their contributions under the State.' },
  },
  groups: {
    state: { title: 'State taxes 2024 – National Tax List (CZK million)', denominatorId: 'stat-taxes-2024', period: y, basis: 'ESA tax revenue, general government and EU institutions', sourceId: NTL },
    socialer: { title: 'Employers’ social contributions 2024 – National Tax List (CZK million)', denominatorId: 'stat-social-employers-2024', period: y, basis: 'Actual compulsory contributions', sourceId: NTL },
    socialhh: { title: 'Households’ social contributions 2024 – National Tax List (CZK million)', denominatorId: 'stat-social-households-2024', period: y, basis: 'Actual contributions', sourceId: NTL },
    localprop: { title: 'Real estate tax 2024 – National Tax List (CZK million)', denominatorId: 'samosprava-property-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
    localcit: { title: 'Corporate tax of municipalities and regions 2024 – National Tax List (CZK million)', denominatorId: 'samosprava-cit-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
    local: { title: 'Local fees 2024 – National Tax List (CZK million)', denominatorId: 'samosprava-fees-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
  },
  sources: [
    { id: NTL, org: 'European Commission, DG Taxation and Customs Union, with Eurostat', title: 'Data on Taxation Trends: National Tax Lists (NTL), edition 2026', url: 'https://taxation-customs.ec.europa.eu/taxation/economic-analysis/data-taxation-trends_en', kind: 'statistics', language: 'en', publishedDate: '2026-03-31', periodCovered: 'Calendar year 2024 (series from 1995)', accessed: D, nextExpected: '2027-03', note: 'Workbook "NTL edition 2026 web.xlsx", sheet CZ: every tax and social contribution by its national name and ESA code, in CZK million. Data cut-off 30 October 2025.' },
    { id: EUS, org: 'Eurostat', title: 'Main national accounts tax aggregates (gov_10a_taxag)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table', kind: 'statistics', language: 'en', publishedDate: '2026-07-21', periodCovered: 'Calendar year 2024', accessed: D, nextExpected: '2027-07', note: 'Taxes and social contributions by sub-sector and ESA item; used to place each tax at a level and to check the totals of the National Tax List.' },
    { id: PWC_CIT, org: 'PwC', title: 'Worldwide Tax Summaries: Czech Republic – Corporate – Taxes on corporate income', url: 'https://taxsummaries.pwc.com/czech-republic/corporate/taxes-on-corporate-income', kind: 'guidance', language: 'en', publishedDate: '2026-07-27', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary, not an official source: corporate income tax 19%, 21% in 2024 and 2025; windfall tax of 60% on excess profits in 2023 through 2025.' },
    { id: PWC_PIT, org: 'PwC', title: 'Worldwide Tax Summaries: Czech Republic – Individual – Taxes on personal income', url: 'https://taxsummaries.pwc.com/czech-republic/individual/taxes-on-personal-income', kind: 'guidance', language: 'en', publishedDate: '2026-07-27', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary: personal income tax 15% up to CZK 1,762,812 and 23% above; final withholding on Czech dividends and interest.' },
    { id: PWC_OTH, org: 'PwC', title: 'Worldwide Tax Summaries: Czech Republic – Corporate – Other taxes', url: 'https://taxsummaries.pwc.com/czech-republic/corporate/other-taxes', kind: 'guidance', language: 'en', publishedDate: '2026-07-27', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary: VAT 21% and 12%; the road tax abolished for lighter vehicles from 2022.' },
  ],
  instruments,
};

buildCountry(spec);
n.reconcile(part('state') + part('socialer') + part('socialhh') + part('localprop') + part('localcit') + part('local'), ['T:D612', 'D29F:C06']);
