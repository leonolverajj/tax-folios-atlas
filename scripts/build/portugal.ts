/**
 * Portugal: the folio's data. Run: npx tsx scripts/build/portugal.ts
 * Figures: Commission / Eurostat National Tax List (NTL), edition 2026, sheet PT, calendar 2024, EUR million
 * (scripts/build/data/ntl-PT.json). The personal and corporate income taxes and the VAT are split between the
 * State and regional and local government with Eurostat gov_10a_taxag (the totals of the two sources agree).
 * Rates: PwC Worldwide Tax Summaries (reviews of July and October 2026), a professional-firm summary.
 */
import { buildCountry, type CountrySpec, type InstSpec, type Ref } from '../lib/build-country';
import { loadNtl, loadSectors } from '../lib/ntl';

const D = '2026-10-12';
const y = { label: '2024', kind: 'calendar-year' as const, start: '2024-01-01', end: '2024-12-31' };
const ref = (id: string, loc?: string): Ref => (loc ? [id, loc] : [id]);
const n = loadNtl('PT', 'EUR');
const sec = loadSectors('PT');
const NTL = 'ntl-2026';
const EUS = 'eurostat-taxag';
const PWC_CIT = 'pwc-pt-corporate';
const PWC_PIT = 'pwc-pt-individual';
const PWC_OTH = 'pwc-pt-other';
const PWC_NOTE = 'As summarised by PwC (reviews of July and October 2026), not checked against the Tax and Customs Authority.';

const inst = (i: Omit<InstSpec, 'rev'> & { keys: string[]; group: string }): InstSpec => {
  const { keys, group, ...rest } = i;
  return { ...rest, rev: n.rev(group, keys) };
};

const irsKeys = ['D51A:C01'];
const ircKeys = ['D51B:C01', 'D51B:C02'];
const irsTotal = n.sum(irsKeys);
const ircTotal = n.sum(ircKeys);
const vatTotal = n.sum(['D211:C01']);
const irsLocal = n.round(sec['S1313:D51A']);
const ircLocal = n.round(sec['S1313:D51B']);
const vatLocal = n.round(sec['S1313:D211']);
const split = (total: number, local: number) => ({ state: n.round(total - local), calc: `${n.fmt(total)} − ${n.fmt(local)} = ${n.fmt(n.round(total - local))} (EUR million)` });

const explicit: InstSpec[] = [
  /* ---- the State: income and consumption taxes with a regional or local part ---- */
  {
    id: 'pt-irs-state', parent: 'estado', level: 'estado', family: 'income-personal',
    official: 'Personal income tax (IRS), State share', native: 'Imposto sobre o Rendimento das Pessoas Singulares (IRS)', common: 'Personal income tax: State share', abbr: 'IRS',
    base: 'Employment, business, pension, capital and property income of residents.',
    payer: 'Individuals; employers withhold part of it.',
    rate: { kind: 'progressive', headline: '12.5% to 48% (2026)', details: ['Residents are taxed at progressive rates varying from 12.5% to 48% for 2026; the first bracket runs to EUR 8,342 and the 48% rate starts above EUR 86,634 (PwC).', PWC_NOTE], asOf: '2026-10-03' },
    explanation: 'The National Tax List gives one total for the personal income tax (EUR 17.7 billion); Eurostat’s accounts record EUR 471 million of it under regional and local government and the rest under the State.',
    exceptions: [], refs: [ref(PWC_PIT, 'Resident income tax rates'), ref(EUS, 'S.1311 and S.1313, D51A')], label: 'Personal income tax (State)', sub: 'IRS · 12.5–48%', glyph: 'person',
    rev: { group: 'state', amount: split(irsTotal, irsLocal).state, locator: 'NTL 2026, sheet PT, D51A Individual income tax, 2024, less the regional and local part from Eurostat gov_10a_taxag (S.1313, D51A)', calculation: split(irsTotal, irsLocal).calc },
  },
  {
    id: 'pt-irc-state', parent: 'estado', level: 'estado', family: 'income-corporate',
    official: 'Corporate income tax (IRC), State share (including the local-government line of the list)', native: 'Imposto sobre o Rendimento das Pessoas Coletivas (IRC)', common: 'Corporate income tax: State share', abbr: 'IRC',
    base: 'Profit of companies and other legal persons.',
    payer: 'Companies.',
    rate: { kind: 'flat', headline: 'Standard rate set by the CIT Code; 13% in Madeira and the Azores', details: ['PwC gives the standard rate of the CIT Code as 20% in its review of July 2026 (its text says 12% is 60% of it) and a standard rate of 13% in the autonomous regions of Madeira and the Azores; the rate for 2024 is not extracted here.', PWC_NOTE], asOf: '2026-07-24' },
    explanation: 'The National Tax List gives CIT for central government (EUR 10.5 billion) and local government (EUR 0.5 billion); Eurostat’s accounts record EUR 799 million under regional and local government. The total is the same in both sources.',
    exceptions: [], refs: [ref(PWC_CIT, 'Corporate income tax rates'), ref(EUS, 'S.1311 and S.1313, D51B')], label: 'Corporate income tax (State)', sub: 'IRC', glyph: 'factory',
    rev: { group: 'state', amount: split(ircTotal, ircLocal).state, locator: 'NTL 2026, sheet PT, D51B C01 and C02 (corporate income tax, central and local lines), 2024, less the regional and local part from Eurostat gov_10a_taxag (S.1313, D51B)', calculation: split(ircTotal, ircLocal).calc },
  },
  {
    id: 'pt-vat-state', parent: 'estado', level: 'estado', family: 'general-consumption',
    official: 'Value added tax (IVA), State share', native: 'Imposto sobre o Valor Acrescentado (IVA)', common: 'VAT: State share', abbr: 'IVA',
    base: 'Goods and services supplied in Portugal and imports.',
    payer: 'Consumers; businesses charge it and claim input credits.',
    rate: { kind: 'range', headline: '23% standard; 13% and 6% reduced', details: ['Mainland rates: standard 23%, reduced 13%, super-reduced 6%; the autonomous regions apply lower rates (22% / 12% / 4% in Madeira from 1 October 2024; 16% / 9% / 4% in the Azores) (PwC).', PWC_NOTE], asOf: '2026-07-24' },
    explanation: 'The largest tax. Eurostat’s accounts record EUR 1,032 million of the VAT under regional and local government; PwC notes that Madeira and the Azores apply lower VAT rates. The rest is booked under the State.',
    exceptions: [], refs: [ref(PWC_OTH, 'Value-added tax'), ref(EUS, 'S.1311 and S.1313, D211')], label: 'VAT (State)', sub: '23%', glyph: 'cart',
    rev: { group: 'state', amount: split(vatTotal, vatLocal).state, locator: 'NTL 2026, sheet PT, D211 Value added tax, 2024, less the regional and local part from Eurostat gov_10a_taxag (S.1313, D211)', calculation: split(vatTotal, vatLocal).calc },
  },
  inst({
    id: 'pt-customs', parent: 'estado', level: 'estado', category: 'customs-duty', family: 'trade', group: 'state', keys: ['D2121:C01'],
    official: 'Import levies (customs duties)', native: 'Direitos aduaneiros', common: 'Customs duties',
    base: 'Goods imported from outside the EU, by the Common Customs Tariff.',
    payer: 'Importers.',
    rate: { kind: 'varies', headline: 'EU Common Customs Tariff', details: ['An EU own resource; Eurostat records it under the EU institutions.'] },
    explanation: 'Collected for the EU budget.',
    exceptions: [], refs: [ref(EUS, 'S.212, D212')], label: 'Customs duties', sub: 'EU tariff', glyph: 'ship',
  }),
  inst({
    id: 'pt-isp', parent: 'estado', level: 'estado', family: 'specific-consumption', group: 'state', keys: ['D214A:C08'],
    official: 'Tax on oil and energy products (ISP)', native: 'Imposto sobre os Produtos Petrolíferos e Energéticos (ISP)', common: 'Fuel and energy tax', abbr: 'ISP',
    base: 'Petrol, diesel, gas and other energy products, by quantity, with a carbon component.',
    payer: 'Producers and importers; passed on at the pump.',
    rate: { kind: 'specific', headline: 'Per litre or per unit of energy', details: [] },
    explanation: 'The biggest excise and the second-largest indirect tax after VAT.',
    exceptions: [], refs: [ref(NTL, 'sheet PT, D214A C08')], label: 'Fuel and energy tax', sub: 'ISP', glyph: 'flame',
  }),
  inst({
    id: 'pt-tobacco', parent: 'estado', level: 'estado', family: 'specific-consumption', group: 'state', keys: ['D2122C:C01', 'D214A:C01'],
    official: 'Excise duty on tobacco (imported and domestic)', native: 'Imposto sobre o Tabaco (IT)', common: 'Tobacco excise',
    base: 'Cigarettes and other tobacco products.',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'mechanism', headline: 'Fixed by the Excise Duty Code', details: ['EUR 1,378.9 million is booked as excise on imported tobacco and EUR 258.3 million on domestic tobacco.'] },
    explanation: 'EUR 1.6 billion in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet PT, D2122C C01, D214A C01')], label: 'Tobacco excise', sub: 'Cigarettes', glyph: 'smoke',
  }),
  inst({
    id: 'pt-alcohol-sugar-drinks', parent: 'estado', level: 'estado', family: 'specific-consumption', group: 'state', keys: ['D2122C:C02', 'D2122C:C03', 'D2122C:C04', 'D2122C:C06', 'D214A:C02', 'D214A:C03', 'D214A:C04', 'D214A:C06'],
    official: 'Excise duties on alcoholic beverages, beer and sugary drinks', native: 'Imposto sobre o Álcool, as Bebidas Alcoólicas e as Bebidas Adicionadas de Açúcar', common: 'Alcohol and sugary drinks excise',
    base: 'Spirits, alcoholic beverages (EUR 99.8 million domestic, EUR 76.7 million imported), beer (EUR 107.2 million and 12.4 million), ethyl alcohol and drinks with added sugar (EUR 40.2 million and 21.8 million).',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'specific', headline: 'Per litre, fixed by the Excise Duty Code', details: [] },
    explanation: 'Eight lines of the list.',
    exceptions: [], refs: [ref(NTL, 'sheet PT, D214A C02 to C04 and C06, D2122C C02 to C04 and C06')], label: 'Alcohol and sugary drinks', sub: 'Spirits · beer · sugar', glyph: 'wine',
  }),
  inst({
    id: 'pt-packaging-taxes', parent: 'estado', level: 'estado', category: 'tax', family: 'specific-consumption', group: 'state', keys: ['D214A:C05', 'D214A:C07', 'D214A:C09'],
    official: 'Excise duties and fees on lightweight plastic bags, single-use packages and non-reusable beverage packaging', native: 'Contribuições sobre sacos de plástico e embalagens', common: 'Plastic and packaging levies',
    base: 'Lightweight plastic bags (EUR 1.2 million), non-reusable beverage packaging (EUR 5.5 million) and single-use packages (EUR 1.3 million).',
    payer: 'Producers and importers of the products.',
    rate: { kind: 'specific', headline: 'Per item', details: [] },
    explanation: 'Small environmental levies.',
    exceptions: [], refs: [ref(NTL, 'sheet PT, D214A C05, C07, C09')], label: 'Plastic and packaging', sub: 'Bags · packaging', glyph: 'leaf',
  }),
  inst({
    id: 'pt-stamp-duty', parent: 'estado', level: 'estado', family: 'property', group: 'state', keys: ['D214B:C02', 'D214B:C03', 'D214B:C04', 'D214B:C05', 'D214B:C06', 'D214B:C07', 'D214B:C08', 'D214B:C10', 'D59F:C02'],
    official: 'Stamp duty on bank transactions, insurance premiums, commercial transactions, entertainment, leasing, debt operations, registrations and interest', native: 'Imposto do Selo', common: 'Stamp duty',
    base: 'Bank transactions (EUR 750.9 million), insurance premiums (EUR 582.2 million), commercial transactions (EUR 462.5 million), entertainment services (EUR 228.5 million), interest (EUR 157.8 million), leasing of buildings, debt operations, registrations and others.',
    payer: 'Parties to the transactions; banks and insurers collect part of it.',
    rate: { kind: 'varies', headline: 'By type of act, per the Stamp Duty Code', details: [] },
    explanation: 'The third-largest indirect tax after VAT and the oil tax, EUR 2.2 billion. Eurostat books EUR 68 million of the stamp duty under regional and local government; the list does not say which lines.',
    exceptions: [], refs: [ref(NTL, 'sheet PT, D214B, D59F C02')], label: 'Stamp duty', sub: 'Imposto do Selo', glyph: 'stamp',
  }),
  inst({
    id: 'pt-vehicle-sales-tax', parent: 'estado', level: 'estado', family: 'specific-consumption', group: 'state', keys: ['D214D:C01'],
    official: 'Tax on motor vehicles (ISV)', native: 'Imposto sobre Veículos (ISV)', common: 'Vehicle tax', abbr: 'ISV',
    base: 'New and imported vehicles, by engine size and emissions, on registration.',
    payer: 'Vehicle buyers and importers.',
    rate: { kind: 'varies', headline: 'By engine size and CO₂ emissions', details: ['The list calls it "tax on motor vehicle sales": EUR 467.8 million in 2024.'] },
    explanation: 'A tax paid once, at registration.',
    exceptions: [], refs: [ref(NTL, 'sheet PT, D214D C01')], label: 'Vehicle tax (ISV)', sub: 'Registration', glyph: 'car',
  }),
  inst({
    id: 'pt-circulation-tax', parent: 'estado', level: 'estado', family: 'specific-consumption', group: 'state', keys: ['D29B:C04', 'D59D:C04'],
    official: 'Unified circulation tax (businesses and households)', native: 'Imposto Único de Circulação (IUC)', common: 'Circulation tax', abbr: 'IUC',
    base: 'The ownership of vehicles, yearly.',
    payer: 'Vehicle owners: businesses (EUR 589.5 million) and households (EUR 279.0 million).',
    rate: { kind: 'varies', headline: 'By vehicle category, engine size and emissions', details: [] },
    explanation: 'Eurostat books EUR 72 million of the taxes on vehicle use under regional and local government; the list does not say which part, so it is drawn here.',
    exceptions: [], refs: [ref(NTL, 'sheet PT, D29B C04, D59D C04')], label: 'Circulation tax', sub: 'IUC', glyph: 'car',
  }),
  inst({
    id: 'pt-insurance-fees', parent: 'estado', level: 'estado', category: 'special-levy', family: 'specific-consumption', group: 'state', keys: ['D214G:C01', 'D214G:C02', 'D214G:C03', 'D214G:C04', 'D214G:C05'],
    official: 'Fees on insurance premiums intended for the emergency medical institute, road safety, the civil protection and the calamities fund', native: 'Taxas sobre prémios de seguros', common: 'Insurance premium fees',
    base: 'Life and non-life premiums (EUR 227.4 million), occupational accident premiums (EUR 122.4 million), motor liability premiums (EUR 31.3 million), motor premiums for road safety (EUR 5.0 million) and agricultural premiums (EUR 1.5 million).',
    payer: 'Insurers and policyholders.',
    rate: { kind: 'varies', headline: 'A percentage of premiums', details: [] },
    explanation: 'Earmarked fees on insurance premiums, named in the list by the body that receives them.',
    exceptions: [], refs: [ref(NTL, 'sheet PT, D214G')], label: 'Insurance premium fees', sub: 'Earmarked', glyph: 'shield',
  }),
  inst({
    id: 'pt-gambling', parent: 'estado', level: 'estado', family: 'specific-consumption', group: 'state', keys: ['D214F:C01', 'D214J:C01'],
    official: 'Special gambling tax and the profits of the mutual betting and gambling agency', native: 'Imposto especial de jogo; resultados líquidos dos jogos sociais do Estado', common: 'Gambling taxes',
    base: 'Gambling operators (EUR 430.6 million) and the State’s mutual betting and gambling agency (EUR 675.9 million, booked as profits of a fiscal monopoly).',
    payer: 'Operators; the agency pays its profits.',
    rate: { kind: 'varies', headline: 'Set by the Gambling Regime', details: [] },
    explanation: 'Two lines.',
    exceptions: [], refs: [ref(NTL, 'sheet PT, D214F C01, D214J C01')], label: 'Gambling', sub: 'Operators · monopoly', glyph: 'dice',
  }),
  inst({
    id: 'pt-travel-charges', parent: 'estado', level: 'estado', category: 'fee', family: 'specific-consumption', group: 'state', keys: ['D214H:C02', 'D59B:C02'],
    official: 'Security fee on air travel passengers and the carbon tax on air and sea travel', native: 'Taxa de segurança aeroportuária; taxa de carbono sobre viagens aéreas e marítimas', common: 'Air passenger and travel carbon charges',
    base: 'Air passengers (EUR 110.9 million) and air and sea travel (EUR 49.5 million).',
    payer: 'Passengers.',
    rate: { kind: 'specific', headline: 'A set amount per passenger', details: [] },
    explanation: 'Two small travel charges.',
    exceptions: [], refs: [ref(NTL, 'sheet PT, D214H C02, D59B C02')], label: 'Travel charges', sub: 'Air · sea', glyph: 'plane',
  }),
  inst({
    id: 'pt-bank-insurance-contributions', parent: 'estado', level: 'estado', category: 'special-levy', family: 'other', group: 'state', keys: ['D29H:C18', 'D29H:C19', 'D29H:C17', 'D29H:C20', 'D29H:C21', 'D29H:C16'],
    official: 'Contribution on the banking industry, Resolution Fund and guarantee-fund contributions, and the pension redemption fee on insurers', native: 'Contribuição sobre o setor bancário; contribuições para o Fundo de Resolução', common: 'Bank and insurer contributions',
    base: 'The bank levy (EUR 223.0 million), the Resolution Fund (EUR 38.2 million), the pension redemption fee on insurance companies (EUR 9.6 million), the deposit guarantee, travel guarantee and investor compensation funds (EUR 2.6 million).',
    payer: 'Banks and insurers.',
    rate: { kind: 'varies', headline: 'A levy on liabilities and off-balance-sheet derivatives', details: ['PwC describes a bank levy on a two-part tax base and a solidarity surcharge (review of July 2026).'] },
    explanation: 'Compulsory levies on the financial sector.',
    exceptions: [], refs: [ref(PWC_OTH, 'Bank levy and solidarity surcharge on the banking sector'), ref(NTL, 'sheet PT, D29H')], label: 'Bank and insurer levies', sub: 'Bank levy', glyph: 'bank',
  }),
  inst({
    id: 'pt-energy-contributions', parent: 'estado', level: 'estado', category: 'special-levy', family: 'resource', group: 'state', keys: ['D29B:C06', 'D29H:C06', 'D214H:C01', 'D29B:C05', 'D29H:C22'],
    official: 'Extraordinary contribution on the energy industry and other energy-sector fees', native: 'Contribuição extraordinária sobre o setor energético', common: 'Energy-sector contributions',
    base: 'The extraordinary contribution on the energy industry (EUR 53.7 million), the contribution of power-grid concessionaires (EUR 14.0 million), the fee on electric installations (EUR 16.6 million) and two small regulatory fees.',
    payer: 'Energy companies.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Sector-specific contributions.',
    exceptions: [], refs: [ref(NTL, 'sheet PT, D29B C05 and C06, D29H C06 and C22, D214H C01')], label: 'Energy-sector contributions', sub: 'Extraordinary', glyph: 'bolt',
  }),
  inst({
    id: 'pt-public-broadcasting-fee', parent: 'estado', level: 'estado', category: 'fee', family: 'other', group: 'state', keys: ['D59F:C01'],
    official: 'Fee to support the public broadcasting service', native: 'Contribuição para o audiovisual', common: 'Public broadcasting fee',
    base: 'As named in the National Tax List: a fee that supports the public broadcasting service; the list gives no more detail.',
    payer: 'Not given in the list.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'EUR 195.6 million in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet PT, D59F C01')], label: 'Broadcasting fee', sub: 'Public service', glyph: 'scroll',
  }),
  /* ---- social contributions ---- */
  inst({
    id: 'pt-social-employers', parent: 'estado', level: 'estado', category: 'social-contribution', family: 'social-security', group: 'socialer', keys: ['D6111:C01'],
    official: 'Employers’ social security contributions', native: 'Contribuições das entidades empregadoras para a Segurança Social', common: 'Employers’ contributions',
    base: 'Gross pay, with no cap.',
    payer: 'Employers.',
    rate: { kind: 'flat', headline: '23.75% of gross pay', details: ['Employers make monthly contributions at the standard rate of 23.75% of employees’ gross pay, with no cap (PwC).', PWC_NOTE], asOf: '2026-07-24' },
    explanation: 'The National Tax List shows all of the actual employers’ contributions as pension contributions, EUR 19.4 billion.',
    exceptions: [], refs: [ref(PWC_OTH, 'Social security contributions'), ref(NTL, 'sheet PT, D6111')], label: 'Social: employers', sub: '23.75%', glyph: 'heart',
  }),
  inst({
    id: 'pt-social-households', parent: 'estado', level: 'estado', category: 'social-contribution', family: 'social-security', group: 'socialhh', keys: ['D6131:C01', 'D6132:C01'],
    official: 'Social security contributions of households (employees and the self-employed)', native: 'Contribuições dos trabalhadores para a Segurança Social', common: 'Employees’ contributions',
    base: 'Pay of employees and income of the self-employed: pension contributions (EUR 10.1 billion) and non-pension contributions (EUR 0.9 billion).',
    payer: 'Employees and the self-employed.',
    rate: { kind: 'flat', headline: 'Set by the Social Security Contributory Code', details: ['The employees’ rate is not extracted here.'] },
    explanation: 'The households’ contributions.',
    exceptions: [], refs: [ref(NTL, 'sheet PT, D6131, D6132')], label: 'Social: households', sub: 'Employees', glyph: 'heart',
  }),
  /* ---- regional and local government ---- */
  {
    id: 'pt-irs-local', parent: 'autarquias', level: 'autarquias', family: 'income-personal',
    official: 'Personal income tax (IRS), part recorded under regional and local government', native: 'IRS (parte das autarquias e regiões)', common: 'Personal income tax: local part',
    base: 'The same tax as the State’s share.',
    payer: 'Individuals.',
    rate: { kind: 'progressive', headline: 'Same rates as the State’s share', details: ['Eurostat’s accounts record this part under regional and local government (S.1313).'] },
    explanation: 'Municipalities receive a share of the personal income tax paid by their residents; the autonomous regions also keep part. Eurostat’s total is EUR 471 million.',
    exceptions: [], refs: [ref(EUS, 'S.1313, D51A')], label: 'Personal income tax (local)', sub: 'Share of IRS', glyph: 'person',
    rev: { group: 'localirs', amount: irsLocal, locator: 'Eurostat gov_10a_taxag, 2024: S.1313 local government, D51A taxes on individual or household income, EUR million', caveat: 'Eurostat July 2026 vintage; it agrees with the National Tax List on the total.' },
  },
  {
    id: 'pt-irc-local', parent: 'autarquias', level: 'autarquias', family: 'income-corporate',
    official: 'Corporate income tax (IRC), part recorded under regional and local government', native: 'IRC (parte das autarquias e regiões)', common: 'Corporate income tax: local part',
    base: 'The same tax as the State’s share; the list gives EUR 481.3 million as the local-government line.',
    payer: 'Companies.',
    rate: { kind: 'flat', headline: 'Same rates as the State’s share', details: ['Eurostat’s accounts record EUR 799 million under regional and local government (S.1313), which is more than the list’s local-government line of EUR 481 million.'] },
    explanation: 'Municipalities receive a surcharge (derrama) on the profit taxed in their area and the autonomous regions receive part of the tax.',
    exceptions: [], refs: [ref(EUS, 'S.1313, D51B'), ref(NTL, 'sheet PT, D51B C02')], label: 'Corporate income tax (local)', sub: 'Derrama · regions', glyph: 'factory',
    rev: { group: 'localirc', amount: ircLocal, locator: 'Eurostat gov_10a_taxag, 2024: S.1313 local government, D51B taxes on the income of corporations, EUR million', caveat: 'Eurostat July 2026 vintage; it agrees with the National Tax List on the total of the two lines.' },
  },
  {
    id: 'pt-vat-local', parent: 'autarquias', level: 'autarquias', family: 'general-consumption',
    official: 'Value added tax (IVA), part recorded under regional and local government', native: 'IVA (parte das regiões autónomas)', common: 'VAT: regional part',
    base: 'The same tax as the State’s share.',
    payer: 'Consumers.',
    rate: { kind: 'range', headline: 'Lower rates in Madeira and the Azores', details: ['Standard 22% in Madeira and 16% in the Azores, against 23% on the mainland (PwC).'] },
    explanation: 'Eurostat’s accounts record EUR 1,032 million of the VAT under regional and local government.',
    exceptions: [], refs: [ref(EUS, 'S.1313, D211'), ref(PWC_OTH, 'Value-added tax')], label: 'VAT (regional)', sub: 'Madeira · Azores', glyph: 'cart',
    rev: { group: 'localvat', amount: vatLocal, locator: 'Eurostat gov_10a_taxag, 2024: S.1313 local government, D211 value added type taxes, EUR million', caveat: 'Eurostat July 2026 vintage; it agrees with the National Tax List on the total.' },
  },
  inst({
    id: 'pt-imi', parent: 'autarquias', level: 'autarquias', family: 'property', group: 'localprop', keys: ['D29A:C01'],
    official: 'Municipal property tax (IMI)', native: 'Imposto Municipal sobre Imóveis (IMI)', common: 'Municipal property tax', abbr: 'IMI',
    base: 'The tax value of buildings and land, yearly.',
    payer: 'Owners.',
    rate: { kind: 'range', headline: 'Set by each municipality within a legal range', details: ['The list does not give rates. Eurostat records EUR 1,489 million of land and building taxes under local government and EUR 185 million under the State.'] },
    explanation: 'The main own tax of the municipalities.',
    exceptions: [], refs: [ref(NTL, 'sheet PT, D29A C01'), ref(EUS, 'S.1313, D29A')], label: 'Municipal property tax', sub: 'IMI', glyph: 'house',
  }),
  inst({
    id: 'pt-imt', parent: 'autarquias', level: 'autarquias', family: 'property', group: 'localimt', keys: ['D214C:C01'],
    official: 'Municipal tax on onerous transfers of real estate (IMT)', native: 'Imposto Municipal sobre as Transmissões Onerosas de Imóveis (IMT)', common: 'Real estate transfer tax', abbr: 'IMT',
    base: 'The price or tax value of real estate transferred for consideration.',
    payer: 'Buyers.',
    rate: { kind: 'progressive', headline: 'By value and use of the property', details: ['EUR 1,675.4 million in 2024; Eurostat books all of it under local government.'] },
    explanation: 'The tax on buying a home or a business property; the proceeds go to the municipalities.',
    exceptions: [], refs: [ref(NTL, 'sheet PT, D214C C01'), ref(EUS, 'S.1313, D214C')], label: 'Real estate transfer tax', sub: 'IMT', glyph: 'stamp',
  }),
  inst({
    id: 'pt-tourist-tax', parent: 'autarquias', level: 'autarquias', category: 'fee', family: 'specific-consumption', group: 'localtourist', keys: ['D59B:C01'],
    official: 'Municipal tax on tourists', native: 'Taxa municipal turística', common: 'Municipal tourist tax',
    base: 'Overnight stays of tourists, in the municipalities that levy it.',
    payer: 'Guests; the accommodation provider collects it.',
    rate: { kind: 'specific', headline: 'A set amount per night, by municipality', details: ['EUR 98.2 million in 2024; Eurostat books it under local government.'] },
    explanation: 'The tourist tax of Lisbon, Porto and other municipalities.',
    exceptions: [], refs: [ref(NTL, 'sheet PT, D59B C01'), ref(EUS, 'S.1313, D59B')], label: 'Tourist tax', sub: 'Per night', glyph: 'bed',
  }),
];

/* ---- every remaining positive line of the list that is a tax (not a social contribution, not the sale of allowances) ---- */
const residualKeys = n
  .unused()
  .filter((l) => /^D(2|5|91)/.test(l.code) && l.key !== 'D29F:C03')
  .map((l) => l.key);
const residual = inst({
  id: 'pt-other-fees', parent: 'estado', level: 'estado', category: 'fee', family: 'other', group: 'state', keys: residualKeys,
  official: 'Regulatory, supervisory and licence fees and other small taxes of the list', native: 'Taxas de regulação, supervisão e licenças, e outros impostos', common: 'Regulatory fees and other small taxes',
  base: `The ${residualKeys.length} smaller lines of the list: regulator and supervisory fees (communications, medicines, water and waste, construction, vehicle inspections, media), licence fees, the pharmaceutical industry contribution, the municipal civil protection tax, noise and water-use fees, the golden-visa fee, the private copying levy, the promotion fees on wine and others.`,
  payer: 'Businesses and individuals.',
  rate: { kind: 'varies', headline: 'Set by law', details: [] },
  explanation: 'The lines are named in the locator of the revenue row.',
  exceptions: [], refs: [ref(NTL, `sheet PT, ${residualKeys.length} smaller lines`)], label: 'Regulatory and other fees', sub: 'Small lines', glyph: 'stamp',
});
const instruments: InstSpec[] = [...explicit, residual];

const part = (g: string) => n.round(instruments.filter((i) => i.rev?.group === g).reduce((a, i) => a + i.rev!.amount, 0));
const sectorSum = (code: string) => ['S1311', 'S1312', 'S1313', 'S1314', 'S212'].reduce((a, s) => a + (sec[`${s}:${code}`] ?? 0), 0);
const vintage = ['D2', 'D5', 'D61'].map((c) => `${c}: NTL ${n.fmt(n.total(c))}, Eurostat July 2026 ${n.fmt(sectorSum(c))}`).join('; ');

const spec: CountrySpec = {
  today: D,
  id: 'portugal',
  iso3: 'PRT',
  isoNumeric: '620',
  names: { en: 'Portugal', native: 'Portugal', nativeLang: 'pt' },
  currency: { code: 'EUR', symbol: '€', name: 'Euro' },
  summary:
    'Portugal is a unitary state with two autonomous regions (the Azores and Madeira) and 308 municipalities. The Assembly of the Republic sets nearly every tax and the Tax and Customs Authority collects them. The largest flows are the social security contributions, VAT, the personal and corporate income taxes, and a large stamp duty. Municipalities levy the property tax (IMI) and the property transfer tax (IMT), receive a share of the personal income tax and collect a tourist tax; the autonomous regions keep part of the VAT at lower rates.',
  structureNote:
    'The figures are the Commission’s National Tax List for 2024. The personal and corporate income taxes and the VAT are each drawn twice, as the State’s part and as the part that Eurostat’s accounts record under regional and local government; the two sources agree on each total. The sale of carbon trading rights (EUR 745 million) and the employers’ imputed social contributions (EUR 5,430 million) are left out. The social contributions are drawn under the State, which collects them for the Social Security.',
  theme: {
    accent: '#2ecc71',
    accent2: '#d62828',
    motif: 'topo',
    motifNote: 'Topographic contour lines over the outline of Portugal (the generic motif; no bespoke art yet).',
    mapLabel: { lon: -8.0, lat: 39.6 },
  },
  rootLabel: { label: 'Portugal', sub: 'Portugal · Fiscal folio' },
  levels: [
    {
      id: 'estado', branch: 'national', official: 'The State (Portuguese Republic)', native: 'Estado', common: 'State',
      description: 'The Assembly of the Republic legislates the taxes; the Tax and Customs Authority collects them and the Social Security Institute collects the contributions.',
      fiscalPower: 'Taxes are set by law of the Assembly; the autonomous regions may adapt national taxes to their area, and municipalities set the rates of the property tax and a few local taxes within legal ranges.',
      refs: [ref(NTL)], label: 'State', sub: 'Estado',
    },
    {
      id: 'autarquias', branch: 'local', official: 'Autonomous regions and municipalities (regional and local government)', native: 'Regiões autónomas e autarquias locais', common: 'Regional and local government',
      description: 'The autonomous regions of the Azores and Madeira, which apply lower VAT and CIT rates and keep part of the taxes collected in their area, and the municipalities, which levy the IMI and the IMT and receive a share of the personal income tax.',
      fiscalPower: 'Municipal assemblies set the IMI rate within the range of the law and decide on the tourist tax; the autonomous regions have their own tax powers under the regional statutes.',
      refs: [ref(EUS)], label: 'Regions and municipalities', sub: 'Autarquias',
    },
  ],
  supporting: [],
  denominators: [
    {
      id: 'estado-taxes-2024', label: 'State taxes (National Tax List), 2024',
      definition: 'The taxes on production and imports, on income and on capital that the National Tax List books to the State and the EU, other than the regional and local taxes and the sale of carbon trading rights; includes the State’s part of the personal and corporate income taxes and of the VAT.',
      levelIds: ['estado'], amount: part('state'), period: y, sourceId: NTL,
      locator: 'Sheet PT, 2024, the lines listed with each tax',
      calculation: `Sum of the ${instruments.filter((i) => i.rev?.group === 'state').length} tax rows below (EUR million)`,
      caveat: `Calendar 2024; the list's cut-off was 30 October 2025. Vintage check against Eurostat's July 2026 accounts: ${vintage}. Eurostat also books EUR ${n.fmt(sec['S1313:D214A'])} million of excise, EUR ${n.fmt(sec['S1313:D214B'])} million of stamp duty and EUR ${n.fmt(sec['S1313:D29B'])} million of vehicle taxes under regional and local government; the list does not say which lines, so they are drawn here.`,
    },
    {
      id: 'estado-social-employers-2024', label: 'Social contributions paid by employers, 2024',
      definition: 'The actual compulsory contributions of employers; imputed contributions are left out.',
      levelIds: ['estado'], amount: part('socialer'), period: y, sourceId: NTL,
      locator: 'Sheet PT, 2024, line D6111',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'estado-social-households-2024', label: 'Social contributions paid by households, 2024',
      definition: 'The actual contributions of employees and the self-employed.',
      levelIds: ['estado'], amount: part('socialhh'), period: y, sourceId: NTL,
      locator: 'Sheet PT, 2024, lines D6131 and D6132',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'autarquias-irs-2024', label: 'Personal income tax received by regional and local government, 2024',
      definition: 'The part of the personal income tax that Eurostat’s accounts record under regional and local government.',
      levelIds: ['autarquias'], amount: part('localirs'), period: y, sourceId: EUS,
      locator: 'gov_10a_taxag, 2024, S.1313, D51A, million EUR',
      caveat: 'Eurostat July 2026 vintage, a different release from the National Tax List.',
    },
    {
      id: 'autarquias-irc-2024', label: 'Corporate income tax received by regional and local government, 2024',
      definition: 'The part of the corporate income tax that Eurostat’s accounts record under regional and local government.',
      levelIds: ['autarquias'], amount: part('localirc'), period: y, sourceId: EUS,
      locator: 'gov_10a_taxag, 2024, S.1313, D51B, million EUR',
      caveat: 'Eurostat July 2026 vintage, a different release from the National Tax List.',
    },
    {
      id: 'autarquias-vat-2024', label: 'VAT recorded under regional and local government, 2024',
      definition: 'The part of the VAT that Eurostat’s accounts record under regional and local government.',
      levelIds: ['autarquias'], amount: part('localvat'), period: y, sourceId: EUS,
      locator: 'gov_10a_taxag, 2024, S.1313, D211, million EUR',
      caveat: 'Eurostat July 2026 vintage, a different release from the National Tax List.',
    },
    {
      id: 'autarquias-imi-2024', label: 'Municipal property tax (IMI), 2024',
      definition: 'The tax on buildings and land.',
      levelIds: ['autarquias'], amount: part('localprop'), period: y, sourceId: NTL,
      locator: 'Sheet PT, 2024, line D29A C01',
      caveat: `Eurostat books EUR ${n.fmt(sec['S1313:D29A'])} million of land and building taxes under local government.`,
    },
    {
      id: 'autarquias-imt-2024', label: 'Municipal real estate transfer tax (IMT), 2024',
      definition: 'The tax on transfers of real estate for consideration.',
      levelIds: ['autarquias'], amount: part('localimt'), period: y, sourceId: NTL,
      locator: 'Sheet PT, 2024, line D214C C01',
      caveat: 'Calendar 2024, same list and cut-off as the State taxes.',
    },
    {
      id: 'autarquias-tourist-2024', label: 'Municipal tourist tax, 2024',
      definition: 'The tax on tourists in the municipalities that levy it.',
      levelIds: ['autarquias'], amount: part('localtourist'), period: y, sourceId: NTL,
      locator: 'Sheet PT, 2024, line D59B C01',
      caveat: 'Calendar 2024, same list and cut-off as the State taxes.',
    },
  ],
  sizing: {
    label: 'Taxes and compulsory social contributions of all levels of government',
    definition: 'The taxes of the State and of regional and local government plus the actual social contributions, calendar 2024, as listed in the National Tax List and split by Eurostat. Excludes the sale of carbon trading rights and imputed social contributions.',
    componentIds: ['estado-taxes-2024', 'estado-social-employers-2024', 'estado-social-households-2024', 'autarquias-irs-2024', 'autarquias-irc-2024', 'autarquias-vat-2024', 'autarquias-imi-2024', 'autarquias-imt-2024', 'autarquias-tourist-2024'],
  },
  fromProfile: 'portugal',
  structureOverride: {
    basis: 'OECD attribution to sub-sectors of general government (Interpretative Guide, section A.12)',
    folioLevels: { central: ['estado'], local: ['autarquias'] },
    levelNotes: { central: 'The OECD shows the social security funds separately; the folio draws their contributions under the State.' },
  },
  groups: {
    state: { title: 'State taxes 2024 – National Tax List (EUR million)', denominatorId: 'estado-taxes-2024', period: y, basis: 'ESA tax revenue, general government and EU institutions', sourceId: NTL },
    socialer: { title: 'Employers’ social contributions 2024 – National Tax List (EUR million)', denominatorId: 'estado-social-employers-2024', period: y, basis: 'Actual compulsory contributions', sourceId: NTL },
    socialhh: { title: 'Households’ social contributions 2024 – National Tax List (EUR million)', denominatorId: 'estado-social-households-2024', period: y, basis: 'Actual contributions', sourceId: NTL },
    localirs: { title: 'Local part of the personal income tax 2024 – Eurostat (EUR million)', denominatorId: 'autarquias-irs-2024', period: y, basis: 'ESA taxes received by local government', sourceId: EUS },
    localirc: { title: 'Local part of the corporate income tax 2024 – Eurostat (EUR million)', denominatorId: 'autarquias-irc-2024', period: y, basis: 'ESA taxes received by local government', sourceId: EUS },
    localvat: { title: 'Regional part of the VAT 2024 – Eurostat (EUR million)', denominatorId: 'autarquias-vat-2024', period: y, basis: 'ESA taxes received by local government', sourceId: EUS },
    localprop: { title: 'IMI 2024 – National Tax List (EUR million)', denominatorId: 'autarquias-imi-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
    localimt: { title: 'IMT 2024 – National Tax List (EUR million)', denominatorId: 'autarquias-imt-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
    localtourist: { title: 'Tourist tax 2024 – National Tax List (EUR million)', denominatorId: 'autarquias-tourist-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
  },
  sources: [
    { id: NTL, org: 'European Commission, DG Taxation and Customs Union, with Eurostat', title: 'Data on Taxation Trends: National Tax Lists (NTL), edition 2026', url: 'https://taxation-customs.ec.europa.eu/taxation/economic-analysis/data-taxation-trends_en', kind: 'statistics', language: 'en', publishedDate: '2026-03-31', periodCovered: 'Calendar year 2024 (series from 1995)', accessed: D, nextExpected: '2027-03', note: 'Workbook "NTL edition 2026 web.xlsx", sheet PT: every tax and social contribution by its national name and ESA code, in EUR million. Data cut-off 30 October 2025.' },
    { id: EUS, org: 'Eurostat', title: 'Main national accounts tax aggregates (gov_10a_taxag)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table', kind: 'statistics', language: 'en', publishedDate: '2026-07-21', periodCovered: 'Calendar year 2024', accessed: D, nextExpected: '2027-07', note: 'Taxes and social contributions by sub-sector and ESA item; used to split the personal income tax (S.1313: EUR 470.5 million), the corporate income tax (EUR 798.8 million) and the VAT (EUR 1,032 million) between the State and regional and local government, and to check totals.' },
    { id: PWC_CIT, org: 'PwC', title: 'Worldwide Tax Summaries: Portugal – Corporate – Taxes on corporate income', url: 'https://taxsummaries.pwc.com/portugal/corporate/taxes-on-corporate-income', kind: 'guidance', language: 'en', publishedDate: '2026-07-24', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary, not an official source: standard corporate income tax rate (12% is stated to be 60% of it) and 13% in Madeira and the Azores.' },
    { id: PWC_PIT, org: 'PwC', title: 'Worldwide Tax Summaries: Portugal – Individual – Taxes on personal income', url: 'https://taxsummaries.pwc.com/portugal/individual/taxes-on-personal-income', kind: 'guidance', language: 'en', publishedDate: '2026-10-03', periodCovered: 'Rates for 2026', accessed: D, note: 'A professional firm’s summary: resident income tax rates from 12.5% to 48% for 2026.' },
    { id: PWC_OTH, org: 'PwC', title: 'Worldwide Tax Summaries: Portugal – Corporate – Other taxes', url: 'https://taxsummaries.pwc.com/portugal/corporate/other-taxes', kind: 'guidance', language: 'en', publishedDate: '2026-07-24', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary: VAT 23%, 13%, 6% (lower in Madeira and the Azores); employers’ social security contribution 23.75%; the bank levy.' },
  ],
  instruments,
};

buildCountry(spec);
n.reconcile(part('state') + part('socialer') + part('socialhh') + part('localirs') + part('localirc') + part('localvat') + part('localprop') + part('localimt') + part('localtourist'), ['T:D612', 'D29F:C03']);
