/**
 * Romania: the folio's data. Run: npx tsx scripts/build/romania.ts
 * Figures: Commission / Eurostat National Tax List (NTL), edition 2026, sheet RO, calendar 2024, RON million
 * (scripts/build/data/ntl-RO.json). The list repeats several lines under a parent code (D51M / D51O); the leaf
 * lines (D51A, D51B) are used once. Level placement is checked against Eurostat gov_10a_taxag.
 * Rates: PwC Worldwide Tax Summaries (reviews of 25 September 2026), a professional-firm summary.
 * Romania is not an OECD member, so there is no harmonised OECD layer (structure.json) for it.
 */
import { buildCountry, type CountrySpec, type InstSpec, type Ref } from '../lib/build-country';
import { loadNtl, loadSectors } from '../lib/ntl';

const D = '2026-10-12';
const y = { label: '2024', kind: 'calendar-year' as const, start: '2024-01-01', end: '2024-12-31' };
const ref = (id: string, loc?: string): Ref => (loc ? [id, loc] : [id]);
const n = loadNtl('RO', 'RON');
const sec = loadSectors('RO');
const NTL = 'ntl-2026';
const EUS = 'eurostat-taxag';
const PWC_CIT = 'pwc-ro-corporate';
const PWC_PIT = 'pwc-ro-individual';
const PWC_OTH = 'pwc-ro-other';
const PWC_NOTE = 'As summarised by PwC (review of 25 September 2026), not checked against the National Agency for Fiscal Administration (ANAF).';

const inst = (i: Omit<InstSpec, 'rev'> & { keys: string[]; group: string }): InstSpec => {
  const { keys, group, ...rest } = i;
  return { ...rest, rev: n.rev(group, keys) };
};
const k = (code: string, ...subs: string[]) => subs.map((s) => `${code}:C${s}`);

/* lines shared between the State and local government, split with Eurostat */
const otherFeesKeys = ['D214L:C01', 'D214L:C02'];
const otherFeesTotal = n.sum(otherFeesKeys);
const otherFeesLocal = n.round(sec['S1313:D214L']);
const otherFeesState = n.round(otherFeesTotal - otherFeesLocal);
const transferTotal = n.sum(['D214C:C01']);
const transferLocal = n.round(sec['S1313:D214C']);
const transferState = n.round(transferTotal - transferLocal);
const licenceTotal = n.sum(['D29E:C01']);
const licenceLocal = n.round(sec['S1313:D29E']);
const licenceState = n.round(licenceTotal - licenceLocal);
const calc2 = (t: number, l: number, s: number) => `${n.fmt(t)} − ${n.fmt(l)} = ${n.fmt(s)} (RON million)`;

const pitWages = ['D51A:C17'];
const pitDividends = ['D51A:C03'];
const pitPensions = ['D51A:C06'];
const pitOther = k('D51A', '01', '02', '04', '05', '07', '08', '09', '16', '18', '19', '20', '21', '22');
const citCore = ['D51B:C01'];
const citMicro = ['D51B:C07', 'D51B:C08'];
const citBanks = ['D51B:C02'];
const citSector = ['D51B:C17', 'D51B:C18', 'D51B:C19', 'D51B:C20', 'D51B:C21', 'D51B:C15'];
const citOther = ['D51B:C03', 'D51B:C04', 'D51B:C05', 'D51B:C06', 'D51B:C09', 'D51B:C10', 'D51B:C12'];

const instruments: InstSpec[] = [
  /* ---- the State: income taxes ---- */
  inst({
    id: 'ro-pit-wages', parent: 'statul', level: 'statul', family: 'income-personal', group: 'state', keys: pitWages,
    official: 'Tax on wages', native: 'Impozit pe veniturile din salarii', common: 'Income tax on wages',
    base: 'Wages and salaries of employees.',
    payer: 'Employees; the employer withholds it.',
    rate: { kind: 'flat', headline: '10%', details: ['A flat personal income tax rate of 10% is generally in place (PwC).', PWC_NOTE], asOf: '2025-09-25' },
    explanation: 'RON 30.3 billion in 2024: the largest income tax line.',
    exceptions: [], refs: [ref(PWC_PIT, 'Personal income tax rates')], label: 'Income tax: wages', sub: '10% flat', glyph: 'person',
  }),
  inst({
    id: 'ro-pit-dividends', parent: 'statul', level: 'statul', family: 'income-personal', group: 'state', keys: pitDividends,
    official: 'Tax on income from dividends', native: 'Impozit pe veniturile din dividende', common: 'Income tax on dividends',
    base: 'Dividends paid to individuals.',
    payer: 'Recipients; the payer withholds.',
    rate: { kind: 'flat', headline: 'Set by the Fiscal Code', details: [PWC_NOTE] },
    explanation: 'RON 8.0 billion in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet RO, D51A C03')], label: 'Income tax: dividends', sub: 'Withheld', glyph: 'coin',
  }),
  inst({
    id: 'ro-pit-pensions', parent: 'statul', level: 'statul', family: 'income-personal', group: 'state', keys: pitPensions,
    official: 'Tax on pension income', native: 'Impozit pe veniturile din pensii', common: 'Income tax on pensions',
    base: 'Pension income above the threshold.',
    payer: 'Pensioners; the pension payer withholds.',
    rate: { kind: 'flat', headline: 'Set by the Fiscal Code', details: [] },
    explanation: 'RON 5.8 billion in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet RO, D51A C06')], label: 'Income tax: pensions', sub: 'Withheld', glyph: 'person',
  }),
  inst({
    id: 'ro-pit-other', parent: 'statul', level: 'statul', family: 'income-personal', group: 'state', keys: pitOther,
    official: 'Other personal income taxes: independent activities, rent, interest, non-residents, the unique statement and others', native: 'Alte impozite pe venit (activități independente, chirii, dobânzi, declarația unică, nerezidenți)', common: 'Other personal income taxes',
    base: 'The tax on the unique statement (RON 3.2 billion), non-residents (RON 1.4 billion), interest (RON 0.9 billion), other income (RON 0.5 billion), rent (RON 0.4 billion), independent activities, sale of bonds and intellectual rights, agricultural activities and small lines.',
    payer: 'Individuals.',
    rate: { kind: 'flat', headline: '10% generally', details: ['Thirteen lines in the list.'] },
    explanation: 'The remaining lines of the personal income tax.',
    exceptions: [], refs: [ref(NTL, 'sheet RO, D51A')], label: 'Other income taxes', sub: 'Statement · rent · interest', glyph: 'person',
  }),
  inst({
    id: 'ro-corporate-profit-tax', parent: 'statul', level: 'statul', family: 'income-corporate', group: 'state', keys: citCore,
    official: 'Tax on profits from economic operators', native: 'Impozit pe profit (operatori economici)', common: 'Corporate profit tax',
    base: 'Profit of companies and permanent establishments.',
    payer: 'Companies.',
    rate: { kind: 'flat', headline: '16%', details: ['The standard CIT rate is 16% for Romanian companies and permanent establishments; nightclubs and gambling pay the higher of 5% of revenue or 16% of profit (PwC).', PWC_NOTE], asOf: '2026-09-25' },
    explanation: 'RON 32.6 billion in 2024.',
    exceptions: [], refs: [ref(PWC_CIT, 'Corporate income tax rates')], label: 'Corporate profit tax', sub: '16%', glyph: 'factory',
  }),
  inst({
    id: 'ro-micro-enterprise-tax', parent: 'statul', level: 'statul', family: 'income-corporate', group: 'state', keys: citMicro,
    official: 'Tax on the income of micro-enterprises', native: 'Impozit pe veniturile microîntreprinderilor', common: 'Micro-enterprise tax',
    base: 'Turnover of small companies that opt for the micro-enterprise regime.',
    payer: 'Micro-enterprises.',
    rate: { kind: 'flat', headline: 'A percentage of turnover', details: ['The rate is not extracted here.'] },
    explanation: 'RON 3.4 billion in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet RO, D51B C07 and C08')], label: 'Micro-enterprise tax', sub: 'On turnover', glyph: 'factory',
  }),
  inst({
    id: 'ro-bank-tax', parent: 'statul', level: 'statul', family: 'income-corporate', group: 'state', keys: citBanks,
    official: 'Tax on profits from commercial banks', native: 'Impozit pe profitul băncilor comerciale', common: 'Profit tax of banks',
    base: 'Profit of commercial banks.',
    payer: 'Banks.',
    rate: { kind: 'flat', headline: 'As the corporate rate', details: ['The turnover tax on credit institutions is a separate line in the sector taxes.'] },
    explanation: 'RON 3.0 billion in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet RO, D51B C02')], label: 'Bank profit tax', sub: 'Banks', glyph: 'bank',
  }),
  inst({
    id: 'ro-sector-solidarity-taxes', parent: 'statul', level: 'statul', category: 'special-levy', family: 'income-corporate', group: 'state', keys: citSector,
    official: 'Additional income tax, monopoly tax in electricity and gas, turnover taxes on credit institutions and on other sectors, and the tax on natural resources', native: 'Impozit adițional; taxa pe cifra de afaceri a instituțiilor de credit; taxa de solidaritate', common: 'Sector and solidarity taxes',
    base: 'The additional income tax (RON 1.8 billion), the tax on turnover achieved by credit institutions (RON 975 million), a specific tax on turnover of economic agents in a sector (RON 475 million), the monopoly tax in the electricity and gas sector (RON 152 million), revenues from natural resources (RON 98 million) and a small negative line.',
    payer: 'Banks, energy companies and other sectors.',
    rate: { kind: 'varies', headline: 'Set by the sector tax laws', details: ['PwC describes a supplementary turnover tax on credit institutions with rates depending on market share.'] },
    explanation: 'Six lines.',
    exceptions: [], refs: [ref(NTL, 'sheet RO, D51B C15, C17–C21'), ref(PWC_CIT, 'Supplementary tax on credit institutions')], label: 'Sector and solidarity taxes', sub: 'Banks · energy', glyph: 'scale',
  }),
  inst({
    id: 'ro-other-profit-taxes', parent: 'statul', level: 'statul', family: 'income-corporate', group: 'state', keys: citOther,
    official: 'Other taxes on profits and dividends of legal persons', native: 'Alte impozite pe profit și dividende', common: 'Other profit taxes',
    base: 'The tax on dividends from legal persons (RON 1,009 million), payments from the net profit of companies (RON 399 million), amounts collected for the State budget in the unique account (RON 174 million) and small lines.',
    payer: 'Companies and non-residents.',
    rate: { kind: 'varies', headline: 'Set by the Fiscal Code', details: [] },
    explanation: 'Seven lines.',
    exceptions: [], refs: [ref(NTL, 'sheet RO, D51B C03–C06, C09, C10, C12')], label: 'Other profit taxes', sub: 'Dividends · net profit', glyph: 'factory',
  }),
  inst({
    id: 'ro-gambling-taxes', parent: 'statul', level: 'statul', family: 'specific-consumption', group: 'state', keys: ['D51D:C01', 'D51D:C02', 'D214F:C02'],
    official: 'Taxes on gambling and on revenues from lotteries, gambling and betting, and the tax for the promotion of gambling', native: 'Impozit pe venituri din jocuri de noroc', common: 'Gambling taxes',
    base: 'Gambling (RON 4.3 billion), revenues from lotteries, gambling and betting (RON 1.0 billion) and the promotion tax (RON 12 million).',
    payer: 'Operators and winners.',
    rate: { kind: 'varies', headline: 'Set by the Fiscal Code', details: [] },
    explanation: 'RON 5.4 billion in 2024, about as much as the income tax on pensions. The list books most of it among the taxes on income.',
    exceptions: [], refs: [ref(NTL, 'sheet RO, D51D, D214F C02')], label: 'Gambling taxes', sub: 'Operators · winners', glyph: 'dice',
  }),
  /* ---- the State: social contributions ---- */
  inst({
    id: 'ro-social-employers', parent: 'statul', level: 'statul', category: 'social-contribution', family: 'social-security', group: 'socialer', keys: k('D611', '01', '02', '03', '04', '05', '06', '07', '09', '10', '11', '12', '13'),
    official: 'Employers’ contributions: insurance contribution for work, unemployment, health, accidents, guarantee funds and the contribution for disabled persons', native: 'Contribuția asiguratorie pentru muncă și alte contribuții ale angajatorilor', common: 'Employers’ contributions',
    base: 'The insurance contribution for work (RON 5.7 billion, RON 3.7 billion for holidays and allowances), unemployment (RON 2.1 billion), the contribution of legal persons for disabled persons not employed (RON 3.1 billion), state social insurance (RON 0.96 billion) and small lines.',
    payer: 'Employers.',
    rate: { kind: 'flat', headline: 'Set by the Fiscal Code', details: ['The rates are not extracted here.'] },
    explanation: 'Twelve lines. Since 2018 most of the burden is on the employees’ contributions.',
    exceptions: [], refs: [ref(NTL, 'sheet RO, D611')], label: 'Social: employers', sub: 'Work insurance', glyph: 'heart',
  }),
  inst({
    id: 'ro-social-insured', parent: 'statul', level: 'statul', category: 'social-contribution', family: 'social-security', group: 'socialhh', keys: ['D613:C01', 'D613:C02', 'D613:C03', 'D613:C05'],
    official: 'Social security and health insurance contributions due by the insured', native: 'Contribuții de asigurări sociale (CAS) și de sănătate (CASS) datorate de asigurați', common: 'Contributions of the insured',
    base: 'Social security (pension) contributions of the insured (RON 116.5 billion), health insurance contributions (RON 58.8 billion), and small lines.',
    payer: 'Employees, the self-employed and other insured persons.',
    rate: { kind: 'flat', headline: 'Set by the Fiscal Code', details: ['The rates are not extracted here.'] },
    explanation: 'By far the largest flow in the Romanian list: more than the VAT.',
    exceptions: [], refs: [ref(NTL, 'sheet RO, D613')], label: 'Social: the insured', sub: 'Pension · health', glyph: 'heart',
  }),
  /* ---- the State: consumption ---- */
  inst({
    id: 'ro-vat', parent: 'statul', level: 'statul', family: 'general-consumption', group: 'state', keys: ['D211:C01'],
    official: 'Value added tax', native: 'Taxa pe valoarea adăugată (TVA)', common: 'VAT', abbr: 'TVA',
    base: 'Goods and services supplied in Romania and imports.',
    payer: 'Consumers; businesses charge it and claim input credits.',
    rate: { kind: 'range', headline: '21% standard (19% in 2024); 11% reduced', details: ['The 21% standard rate applies to all taxable transactions that do not qualify for a reduced rate; the 11% reduced rate applies to medicines, food and beverages (with exceptions) and other goods (PwC, review of 25 September 2026).', 'The standard rate was 19% in 2024, the year of the revenue; it rose to 21% in 2025.', PWC_NOTE], asOf: '2026-09-25' },
    explanation: 'RON 119.1 billion: the second-largest flow after the insured persons’ contributions.',
    exceptions: [], refs: [ref(PWC_OTH, 'Value-added tax')], label: 'VAT', sub: '19% → 21%', glyph: 'cart',
  }),
  inst({
    id: 'ro-customs', parent: 'statul', level: 'statul', category: 'customs-duty', family: 'trade', group: 'state', keys: ['D2121:C02', 'D2121:C03', 'D2121:C04', 'D2121:C06'],
    official: 'Customs duties and anti-dumping taxes', native: 'Taxe vamale', common: 'Customs duties',
    base: 'Goods imported from outside the EU, by the Common Customs Tariff: duties from legal persons (RON 1,259 million), anti-dumping duties (RON 146 million) and small lines.',
    payer: 'Importers.',
    rate: { kind: 'varies', headline: 'EU Common Customs Tariff', details: ['An EU own resource; Eurostat records it under the EU institutions.'] },
    explanation: 'Collected for the EU budget.',
    exceptions: [], refs: [ref(EUS, 'S.212, D212')], label: 'Customs duties', sub: 'EU tariff', glyph: 'ship',
  }),
  inst({
    id: 'ro-excise-energy', parent: 'statul', level: 'statul', family: 'specific-consumption', group: 'state', keys: ['D214A:C03', 'D214A:C08', 'D2122C:C01'],
    official: 'Excises on energy products and electric energy, domestic and on imports', native: 'Accize pe produse energetice și energie electrică', common: 'Fuel and energy excise',
    base: 'Energy products sold domestically (RON 19.7 billion) and imported (RON 2.8 billion), and electric energy (RON 0.2 billion).',
    payer: 'Fuel suppliers and importers; passed on at the pump.',
    rate: { kind: 'specific', headline: 'Per 1,000 litres', details: ['The excise duty on unleaded gasoline in force as of 1 January 2026 is RON 3,059.80 per 1,000 litres and on leaded gasoline RON 3,598.98; a temporary dynamic mechanism reduces the diesel excise by up to 25% (PwC).'], asOf: '2026-09-25' },
    explanation: 'The largest excise.',
    exceptions: [], refs: [ref(PWC_OTH, 'Excise duties'), ref(NTL, 'sheet RO, D214A C03 and C08, D2122C C01')], label: 'Fuel and energy excise', sub: 'Energy products', glyph: 'flame',
  }),
  inst({
    id: 'ro-excise-tobacco', parent: 'statul', level: 'statul', family: 'specific-consumption', group: 'state', keys: ['D214A:C05', 'D2122C:C03'],
    official: 'Excises on tobacco products, domestic and on imports', native: 'Accize pe produse din tutun', common: 'Tobacco excise',
    base: 'Cigarettes and other tobacco products.',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'mechanism', headline: 'Fixed by the Fiscal Code', details: [] },
    explanation: 'RON 20.0 billion on domestic sales: nearly as much as the energy excise.',
    exceptions: [], refs: [ref(NTL, 'sheet RO, D214A C05, D2122C C03')], label: 'Tobacco excise', sub: 'Cigarettes', glyph: 'smoke',
  }),
  inst({
    id: 'ro-excise-alcohol-other', parent: 'statul', level: 'statul', family: 'specific-consumption', group: 'state', keys: ['D214A:C04', 'D214A:C07', 'D2122C:C02', 'D2122C:C05', 'D2122C:C06'],
    official: 'Excises on ethyl alcohol, intermediate products and other products, domestic and on imports', native: 'Accize pe alcool și alte produse', common: 'Alcohol and other excises',
    base: 'Ethyl alcohol and intermediate products (RON 1.9 billion), other products (RON 0.6 billion) and small import lines.',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'specific', headline: 'Per hectolitre or per unit', details: ['PwC gives the excise level for beer as RON 5.83 per hectolitre per Plato degree and for intermediate products RON 701.83 per hectolitre (2026).'], asOf: '2026-09-25' },
    explanation: 'Five lines.',
    exceptions: [], refs: [ref(NTL, 'sheet RO, D214A C04 and C07, D2122C C02, C05, C06')], label: 'Alcohol and other excises', sub: 'Spirits · others', glyph: 'wine',
  }),
  inst({
    id: 'ro-drug-contribution', parent: 'statul', level: 'statul', category: 'special-levy', family: 'other', group: 'state', keys: ['D214I:C03', 'D214I:C04', 'D214I:C05', 'D214I:C01'],
    official: 'Contributions due for drugs financed from the National Health Insurance Fund (cost-volume contributions)', native: 'Contribuția clawback', common: 'Medicine cost-volume contribution',
    base: 'As named in the National Tax List: the revenue contribution due for drugs financed from the National Fund (RON 3,393 million, less RON 37 million in a second line) and the revenue from the cost-volume / cost-volume-result contracts (RON 1,783 million).',
    payer: 'Pharmaceutical companies.',
    rate: { kind: 'varies', headline: 'Set by the health insurance laws', details: ['Eurostat books these amounts under the social security funds.'] },
    explanation: 'A levy on drug producers that finances the health insurance fund.',
    exceptions: [], refs: [ref(NTL, 'sheet RO, D214I C03–C05'), ref(EUS, 'S.1314, D214I')], label: 'Medicine contribution', sub: 'Clawback', glyph: 'gear',
  }),
  inst({
    id: 'ro-modernization-energy-funds', parent: 'statul', level: 'statul', category: 'special-levy', family: 'resource', group: 'state', keys: ['D29F:C03', 'D29H:C09', 'D29F:C01'],
    official: 'Contribution to the Modernization Fund, income from the contribution to the Energy Transition Fund and environmental fees', native: 'Fondul pentru modernizare; Fondul pentru tranziție energetică', common: 'Modernization and Energy Transition funds',
    base: 'The Modernization Fund (RON 5.3 billion), the Energy Transition Fund (RON 4.5 billion) and environmental fees (RON 26 million).',
    payer: 'Energy companies and polluters.',
    rate: { kind: 'varies', headline: 'Set by the fund laws', details: ['The revenue from the sale of emission permits (RON 2.8 billion) is not counted.'] },
    explanation: 'Three lines that Eurostat books under central government.',
    exceptions: [], refs: [ref(NTL, 'sheet RO, D29F C01 and C03, D29H C09')], label: 'Energy funds', sub: 'Modernization · transition', glyph: 'bolt',
  }),
  {
    id: 'ro-other-fees-state', parent: 'statul', level: 'statul', category: 'fee', family: 'other',
    official: 'Other taxes and fees, and special fees, State part', native: 'Alte taxe și impozite; taxe speciale (partea statului)', common: 'Other taxes and fees: State part',
    base: 'As named in the National Tax List: "other taxes and fees" (RON 1,650.5 million) and "special fees" (RON 1,087 million).',
    payer: 'Businesses and individuals.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: `The two lines come to RON ${n.fmt(otherFeesTotal)} million; Eurostat books RON ${n.fmt(otherFeesLocal)} million of them under local government and the rest, RON ${n.fmt(otherFeesState)} million, under the State.`,
    exceptions: [], refs: [ref(NTL, 'sheet RO, D214L C01 and C02'), ref(EUS, 'S.1311 and S.1313, D214L')], label: 'Other taxes and fees (State)', sub: 'State part', glyph: 'stamp',
    rev: { group: 'state', amount: otherFeesState, locator: 'NTL 2026, sheet RO, D214L C01 and C02 (other taxes and fees; special fees), 2024, less the local part from Eurostat gov_10a_taxag (S.1313, D214L)', calculation: calc2(otherFeesTotal, otherFeesLocal, otherFeesState) },
  },
  {
    id: 'ro-transfer-tax-state', parent: 'statul', level: 'statul', family: 'property',
    official: 'Tax on revenues from the transfer of real estate property from personal patrimony, State part', native: 'Impozit pe veniturile din transferul proprietăților imobiliare (partea statului)', common: 'Real estate transfer tax: State part',
    base: 'Gains from the transfer of real estate property from personal assets.',
    payer: 'Sellers.',
    rate: { kind: 'varies', headline: 'Set by the Fiscal Code', details: [] },
    explanation: `The line is RON ${n.fmt(transferTotal)} million; Eurostat books RON ${n.fmt(transferLocal)} million of the transaction taxes under local government and the rest under the State.`,
    exceptions: [], refs: [ref(NTL, 'sheet RO, D214C C01'), ref(EUS, 'S.1311 and S.1313, D214C')], label: 'Transfer tax (State)', sub: 'State part', glyph: 'stamp',
    rev: { group: 'state', amount: transferState, locator: 'NTL 2026, sheet RO, D214C C01 (tax on revenues from the transfer of real estate property), 2024, less the local part from Eurostat gov_10a_taxag (S.1313, D214C)', calculation: calc2(transferTotal, transferLocal, transferState) },
  },
  {
    id: 'ro-licence-fees-state', parent: 'statul', level: 'statul', category: 'fee', family: 'other',
    official: 'Taxes and tariffs for licences and operating permits, State part', native: 'Taxe pentru licențe și autorizații de funcționare (partea statului)', common: 'Licence fees: State part',
    base: 'Licences and operating permits.',
    payer: 'Businesses.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: `The line is RON ${n.fmt(licenceTotal)} million; Eurostat books RON ${n.fmt(licenceLocal)} million of the "other taxes on production" of this kind under local government.`,
    exceptions: [], refs: [ref(NTL, 'sheet RO, D29E C01'), ref(EUS, 'S.1311 and S.1313, D29E')], label: 'Licence fees (State)', sub: 'State part', glyph: 'key',
    rev: { group: 'state', amount: licenceState, locator: 'NTL 2026, sheet RO, D29E C01 (taxes and tariffs for issuing licenses and operating permits), 2024, less the local part from Eurostat gov_10a_taxag (S.1313, D29E)', calculation: calc2(licenceTotal, licenceLocal, licenceState) },
  },
  inst({
    id: 'ro-small-state-taxes', parent: 'statul', level: 'statul', category: 'fee', family: 'other', group: 'state', keys: ['D29H:C01', 'D29H:C05', 'D29H:C06', 'D29H:C08', 'D214J:C01', 'D214D:C01', 'D29A:C05', 'D51E:C01', 'D214H:C06'],
    official: 'Contributions to the Bank Deposit Guarantee Fund and National Resolution Fund, tax on mineral extraction, special tax on high-value property and other small lines', native: 'Contribuții la Fondul de garantare a depozitelor și Fondul național de rezoluție', common: 'Bank funds and other small taxes',
    base: 'The National Resolution Fund (RON 190 million), the Bank Deposit Guarantee Fund (RON 150 million), the tax on mineral extraction (RON 33 million), the special tax on immovable and movable property of high value (RON 15 million) and small lines.',
    payer: 'Banks and businesses.',
    rate: { kind: 'varies', headline: 'Set by law', details: [] },
    explanation: 'Nine small lines.',
    exceptions: [], refs: [ref(NTL, 'sheet RO, D29H, D214J, D214D, D29A C05, D51E, D214H C06')], label: 'Bank funds and small taxes', sub: 'Small', glyph: 'bank',
  }),
  /* ---- local government ---- */
  inst({
    id: 'ro-building-tax', parent: 'local', level: 'local', family: 'property', group: 'localbuild', keys: ['D29A:C01', 'D59A:C02', 'D29A:C04'],
    official: 'Tax on buildings (held by legal persons and by individuals)', native: 'Impozit pe clădiri', common: 'Building tax',
    base: 'Buildings: those held by legal persons (RON 4,050.6 million) and by individuals (RON 1,664.0 million), and a small building tax line.',
    payer: 'Owners of buildings.',
    rate: { kind: 'range', headline: 'Set by each local council within a range', details: ['The list does not give rates.'] },
    explanation: 'The local governments’ largest tax.',
    exceptions: [], refs: [ref(NTL, 'sheet RO, D29A C01 and C04, D59A C02'), ref(EUS, 'S.1313, D29A and D59A')], label: 'Building tax', sub: 'Local', glyph: 'house',
  }),
  inst({
    id: 'ro-land-tax', parent: 'local', level: 'local', family: 'property', group: 'localland', keys: ['D29A:C02', 'D59A:C01', 'D59A:C03'],
    official: 'Tax on land (legal persons, individuals, land outside towns)', native: 'Impozit pe teren', common: 'Land tax',
    base: 'Land held by legal persons (RON 509.9 million), land held by individuals (RON 766.3 million) and land out of town (RON 735.6 million).',
    payer: 'Landowners.',
    rate: { kind: 'range', headline: 'Set by each local council within a range', details: [] },
    explanation: 'Three lines.',
    exceptions: [], refs: [ref(NTL, 'sheet RO, D29A C02, D59A C01 and C03'), ref(EUS, 'S.1313, D29A and D59A')], label: 'Land tax', sub: 'Local', glyph: 'town',
  }),
  inst({
    id: 'ro-local-vehicle-taxes', parent: 'local', level: 'local', family: 'specific-consumption', group: 'localveh', keys: ['D59D:C01', 'D29B:C01', 'D29B:C03'],
    official: 'Motor vehicle taxes (individuals and legal persons) and other taxes related to the use of goods', native: 'Impozit pe mijloacele de transport', common: 'Vehicle taxes',
    base: 'Vehicles owned by individuals (RON 1,654.9 million) and legal persons (RON 735.1 million) and a line for the use of goods and authorisations (RON 189.3 million).',
    payer: 'Vehicle owners.',
    rate: { kind: 'range', headline: 'By engine capacity, set locally', details: [] },
    explanation: 'Eurostat books these amounts under local government.',
    exceptions: [], refs: [ref(NTL, 'sheet RO, D59D C01, D29B C01 and C03'), ref(EUS, 'S.1313, D29B and D59D')], label: 'Vehicle taxes', sub: 'Local', glyph: 'car',
  }),
  {
    id: 'ro-other-fees-local', parent: 'local', level: 'local', category: 'fee', family: 'other',
    official: 'Other taxes and fees, and special fees, local part', native: 'Alte taxe și impozite locale; taxe speciale (partea autorităților locale)', common: 'Other taxes and fees: local part',
    base: 'The same two lines as the State part.',
    payer: 'Businesses and individuals.',
    rate: { kind: 'varies', headline: 'Set by each local council', details: [] },
    explanation: 'The part of the "other taxes and fees" that Eurostat’s accounts record under local government.',
    exceptions: [], refs: [ref(NTL, 'sheet RO, D214L'), ref(EUS, 'S.1313, D214L')], label: 'Other taxes and fees (local)', sub: 'Local part', glyph: 'town',
    rev: { group: 'localfees', amount: otherFeesLocal, locator: 'Eurostat gov_10a_taxag, 2024: S.1313 local government, D214L other taxes on products n.e.c., RON million', caveat: 'Eurostat July 2026 vintage; the allocation to the two NTL lines is an inference from the amounts.' },
  },
  {
    id: 'ro-transfer-tax-local', parent: 'local', level: 'local', family: 'property',
    official: 'Tax on revenues from the transfer of real estate property, local part', native: 'Impozit pe veniturile din transferul proprietăților imobiliare (partea autorităților locale)', common: 'Real estate transfer tax: local part',
    base: 'The same line as the State part.',
    payer: 'Sellers.',
    rate: { kind: 'varies', headline: 'Set by the Fiscal Code', details: [] },
    explanation: 'The part of the line that Eurostat’s accounts record under local government.',
    exceptions: [], refs: [ref(NTL, 'sheet RO, D214C C01'), ref(EUS, 'S.1313, D214C')], label: 'Transfer tax (local)', sub: 'Local part', glyph: 'stamp',
    rev: { group: 'localtransfer', amount: transferLocal, locator: 'Eurostat gov_10a_taxag, 2024: S.1313 local government, D214C taxes on financial and capital transactions, RON million', caveat: 'Eurostat July 2026 vintage.' },
  },
  {
    id: 'ro-licence-fees-local', parent: 'local', level: 'local', category: 'fee', family: 'other',
    official: 'Taxes and tariffs for licences and operating permits, local part', native: 'Taxe pentru licențe și autorizații (partea autorităților locale)', common: 'Licence fees: local part',
    base: 'The same line as the State part.',
    payer: 'Businesses.',
    rate: { kind: 'varies', headline: 'Set by each local council', details: [] },
    explanation: 'The part of the line that Eurostat’s accounts record under local government.',
    exceptions: [], refs: [ref(NTL, 'sheet RO, D29E C01'), ref(EUS, 'S.1313, D29E')], label: 'Licence fees (local)', sub: 'Local part', glyph: 'key',
    rev: { group: 'locallicence', amount: licenceLocal, locator: 'Eurostat gov_10a_taxag, 2024: S.1313 local government, D29E licences, RON million', caveat: 'Eurostat July 2026 vintage.' },
  },
  inst({
    id: 'ro-local-small-taxes', parent: 'local', level: 'local', category: 'tax', family: 'other', group: 'localsmall', keys: ['D214B:C01', 'D214B:C03', 'D214H:C02', 'D214H:C03', 'D214E:C01', 'D59F:C01'],
    official: 'Stamp taxes, taxes on specific services, hotel and entertainment taxes and other taxes and fees on individuals', native: 'Taxa de timbru; taxa hotelieră; taxa pe spectacole', common: 'Stamp, hotel, entertainment and other local taxes',
    base: 'Stamp taxes (RON 415.5 million), other taxes on specific services (RON 66.6 million), taxes related to hotel activity (RON 11 million), the tax on entertainment (RON 20 million) and other taxes and fees on individuals (RON 133.6 million).',
    payer: 'Residents, visitors and businesses.',
    rate: { kind: 'range', headline: 'Set by each local council', details: [] },
    explanation: 'Six lines.',
    exceptions: [], refs: [ref(NTL, 'sheet RO, D214B C01 and C03, D214H C02 and C03, D214E, D59F C01'), ref(EUS, 'S.1313, D214B and D214H')], label: 'Small local taxes', sub: 'Stamp · hotel · other', glyph: 'stamp',
  }),
];

const part = (g: string) => n.round(instruments.filter((i) => i.rev?.group === g).reduce((a, i) => a + i.rev!.amount, 0));
const sectorSum = (code: string) => ['S1311', 'S1312', 'S1313', 'S1314', 'S212'].reduce((a, s) => a + (sec[`${s}:${code}`] ?? 0), 0);
const vintage = ['D2', 'D5', 'D61'].map((c) => `${c}: NTL ${n.fmt(n.total(c))}, Eurostat July 2026 ${n.fmt(sectorSum(c))}`).join('; ');

const spec: CountrySpec = {
  today: D,
  id: 'romania',
  iso3: 'ROU',
  isoNumeric: '642',
  names: { en: 'Romania', native: 'România', nativeLang: 'ro' },
  currency: { code: 'RON', symbol: 'lei', name: 'Romanian leu' },
  summary:
    'Romania is a unitary state with a flat 10% personal income tax, a 16% corporate profit tax and a standard VAT of 21% from 2025 (19% in 2024). Since a 2018 reform the social contributions are mostly paid by the insured persons, and in the National Tax List they are the largest flow, ahead of VAT. Local councils levy the building, land and vehicle taxes and receive a part of several State taxes. A set of sector taxes on banks, energy companies and others adds to the corporate tax.',
  structureNote:
    'The figures are the Commission’s National Tax List for 2024, in RON million. The list repeats the personal and corporate income tax lines under a parent code; only the leaf lines are used. Three lines shared by the State and local government (other taxes and fees, the transfer of real estate, licences) are split with Eurostat’s accounts of the same year. The sale of emission permits (RON 2,829 million) and the employers’ imputed social contributions (RON 14,962 million) are left out. The social contributions are drawn under the State. Romania is not an OECD member, so this folio has no harmonised OECD layer.',
  theme: {
    accent: '#fcd116',
    accent2: '#002b7f',
    motif: 'topo',
    motifNote: 'Topographic contour lines over the outline of Romania (the generic motif; no bespoke art yet).',
    mapLabel: { lon: 25.0, lat: 45.9 },
  },
  rootLabel: { label: 'Romania', sub: 'România · Fiscal folio' },
  levels: [
    {
      id: 'statul', branch: 'national', official: 'The State (Romania)', native: 'Statul', common: 'State',
      description: 'Parliament legislates the taxes (the Fiscal Code); the National Agency for Fiscal Administration (ANAF) collects them and the social contributions, which fund the pension and health insurance systems.',
      fiscalPower: 'Taxes are set by the Fiscal Code and laws; local councils set rates only within the ranges that the Code allows.',
      refs: [ref(NTL)], label: 'State', sub: 'Statul',
    },
    {
      id: 'local', branch: 'local', official: 'Local administrative-territorial units (communes, towns, municipalities and counties)', native: 'Unitățile administrativ-teritoriale', common: 'Local government',
      description: 'The communes, towns, municipalities and counties. They levy the building, land and vehicle taxes and small local taxes within the ranges of the Fiscal Code.',
      fiscalPower: 'Local councils set the rates of local taxes within the ranges of the Fiscal Code.',
      refs: [ref(EUS)], label: 'Local government', sub: 'Local',
    },
  ],
  supporting: [],
  denominators: [
    {
      id: 'statul-taxes-2024', label: 'State taxes (National Tax List), 2024',
      definition: 'The taxes on production and imports, on income and on capital that the National Tax List books to the State, the social security funds and the EU, other than the local lines and the sale of emission permits.',
      levelIds: ['statul'], amount: part('state'), period: y, sourceId: NTL,
      locator: 'Sheet RO, 2024, the lines listed with each tax',
      calculation: `Sum of the ${instruments.filter((i) => i.rev?.group === 'state').length} tax rows below (RON million)`,
      caveat: `Calendar 2024; the list's cut-off was 30 October 2025. Vintage check against Eurostat's July 2026 accounts: ${vintage}. Eurostat also books RON ${n.fmt(n.round(sec['S1313:D51B']))} million of corporate income tax and RON ${n.fmt(n.round(sec['S1313:D51A']))} million of personal income tax under local government; the list does not say which lines, so they are drawn here.`,
    },
    {
      id: 'statul-social-employers-2024', label: 'Social contributions paid by employers, 2024',
      definition: 'The actual contributions of employers; imputed contributions are left out.',
      levelIds: ['statul'], amount: part('socialer'), period: y, sourceId: NTL,
      locator: 'Sheet RO, 2024, lines D611 C01 to C13',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'statul-social-insured-2024', label: 'Social contributions paid by the insured, 2024',
      definition: 'The social security and health insurance contributions due by the insured persons.',
      levelIds: ['statul'], amount: part('socialhh'), period: y, sourceId: NTL,
      locator: 'Sheet RO, 2024, lines D613 C01, C02, C03 and C05',
      caveat: 'Calendar 2024, same list and cut-off as the taxes.',
    },
    {
      id: 'local-buildings-2024', label: 'Building tax of local government, 2024',
      definition: 'The tax on buildings held by legal persons and by individuals.',
      levelIds: ['local'], amount: part('localbuild'), period: y, sourceId: NTL,
      locator: 'Sheet RO, 2024, lines D29A C01 and C04, D59A C02',
      caveat: `Eurostat books RON ${n.fmt(n.round(sec['S1313:D29A']))} million of land and building taxes (D29A) and RON ${n.fmt(n.round(sec['S1313:D59A']))} million of other wealth taxes (D59A) under local government.`,
    },
    {
      id: 'local-land-2024', label: 'Land tax of local government, 2024',
      definition: 'The tax on land held by legal persons and by individuals, and on land out of town.',
      levelIds: ['local'], amount: part('localland'), period: y, sourceId: NTL,
      locator: 'Sheet RO, 2024, lines D29A C02, D59A C01 and C03',
      caveat: 'Calendar 2024, same list and cut-off as the State taxes.',
    },
    {
      id: 'local-vehicles-2024', label: 'Vehicle taxes of local government, 2024',
      definition: 'The motor vehicle taxes of individuals and legal persons.',
      levelIds: ['local'], amount: part('localveh'), period: y, sourceId: NTL,
      locator: 'Sheet RO, 2024, lines D59D C01, D29B C01 and C03',
      caveat: `Eurostat books RON ${n.fmt(n.round(sec['S1313:D29B'] + sec['S1313:D59D']))} million of vehicle taxes under local government.`,
    },
    {
      id: 'local-other-fees-2024', label: 'Other taxes and fees recorded under local government, 2024',
      definition: 'The part of the "other taxes and fees" lines that Eurostat’s accounts record under local government.',
      levelIds: ['local'], amount: part('localfees'), period: y, sourceId: EUS,
      locator: 'gov_10a_taxag, 2024, S.1313, D214L, million RON',
      caveat: 'Eurostat July 2026 vintage, a different release from the National Tax List.',
    },
    {
      id: 'local-transfer-2024', label: 'Real estate transfer tax recorded under local government, 2024',
      definition: 'The part of the transfer tax that Eurostat’s accounts record under local government.',
      levelIds: ['local'], amount: part('localtransfer'), period: y, sourceId: EUS,
      locator: 'gov_10a_taxag, 2024, S.1313, D214C, million RON',
      caveat: 'Eurostat July 2026 vintage, a different release from the National Tax List.',
    },
    {
      id: 'local-licences-2024', label: 'Licence fees recorded under local government, 2024',
      definition: 'The part of the licence fees that Eurostat’s accounts record under local government.',
      levelIds: ['local'], amount: part('locallicence'), period: y, sourceId: EUS,
      locator: 'gov_10a_taxag, 2024, S.1313, D29E, million RON',
      caveat: 'Eurostat July 2026 vintage, a different release from the National Tax List.',
    },
    {
      id: 'local-small-2024', label: 'Stamp, hotel, entertainment and other small local taxes, 2024',
      definition: 'The stamp taxes, taxes on specific services, hotel, entertainment and other local taxes.',
      levelIds: ['local'], amount: part('localsmall'), period: y, sourceId: NTL,
      locator: 'Sheet RO, 2024, lines D214B C01 and C03, D214H C02 and C03, D214E C01, D59F C01',
      caveat: 'Calendar 2024, same list and cut-off as the State taxes.',
    },
  ],
  sizing: {
    label: 'Taxes and compulsory social contributions of all levels of government',
    definition: 'The taxes of the State and of local government plus the actual social contributions, calendar 2024, as listed in the National Tax List and split by Eurostat. Excludes the sale of emission permits and imputed social contributions.',
    componentIds: ['statul-taxes-2024', 'statul-social-employers-2024', 'statul-social-insured-2024', 'local-buildings-2024', 'local-land-2024', 'local-vehicles-2024', 'local-other-fees-2024', 'local-transfer-2024', 'local-licences-2024', 'local-small-2024'],
  },
  groups: {
    state: { title: 'State taxes 2024 – National Tax List (RON million)', denominatorId: 'statul-taxes-2024', period: y, basis: 'ESA tax revenue, general government and EU institutions', sourceId: NTL },
    socialer: { title: 'Employers’ social contributions 2024 – National Tax List (RON million)', denominatorId: 'statul-social-employers-2024', period: y, basis: 'Actual contributions', sourceId: NTL },
    socialhh: { title: 'Insured persons’ social contributions 2024 – National Tax List (RON million)', denominatorId: 'statul-social-insured-2024', period: y, basis: 'Actual contributions', sourceId: NTL },
    localbuild: { title: 'Building tax 2024 – National Tax List (RON million)', denominatorId: 'local-buildings-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
    localland: { title: 'Land tax 2024 – National Tax List (RON million)', denominatorId: 'local-land-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
    localveh: { title: 'Vehicle taxes 2024 – National Tax List (RON million)', denominatorId: 'local-vehicles-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
    localfees: { title: 'Other local taxes and fees 2024 – Eurostat (RON million)', denominatorId: 'local-other-fees-2024', period: y, basis: 'ESA taxes received by local government', sourceId: EUS },
    localtransfer: { title: 'Local transfer tax 2024 – Eurostat (RON million)', denominatorId: 'local-transfer-2024', period: y, basis: 'ESA taxes received by local government', sourceId: EUS },
    locallicence: { title: 'Local licence fees 2024 – Eurostat (RON million)', denominatorId: 'local-licences-2024', period: y, basis: 'ESA taxes received by local government', sourceId: EUS },
    localsmall: { title: 'Small local taxes 2024 – National Tax List (RON million)', denominatorId: 'local-small-2024', period: y, basis: 'ESA tax revenue', sourceId: NTL },
  },
  sources: [
    { id: NTL, org: 'European Commission, DG Taxation and Customs Union, with Eurostat', title: 'Data on Taxation Trends: National Tax Lists (NTL), edition 2026', url: 'https://taxation-customs.ec.europa.eu/taxation/economic-analysis/data-taxation-trends_en', kind: 'statistics', language: 'en', publishedDate: '2026-03-31', periodCovered: 'Calendar year 2024 (series from 1995)', accessed: D, nextExpected: '2027-03', note: 'Workbook "NTL edition 2026 web.xlsx", sheet RO: every tax and social contribution by its national name and ESA code, in RON million. Data cut-off 30 October 2025.' },
    { id: EUS, org: 'Eurostat', title: 'Main national accounts tax aggregates (gov_10a_taxag)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table', kind: 'statistics', language: 'en', publishedDate: '2026-07-21', periodCovered: 'Calendar year 2024', accessed: D, nextExpected: '2027-07', note: 'Taxes and social contributions by sub-sector and ESA item; used to place each tax at a level, to split three shared lines and to check totals.' },
    { id: PWC_CIT, org: 'PwC', title: 'Worldwide Tax Summaries: Romania – Corporate – Taxes on corporate income', url: 'https://taxsummaries.pwc.com/romania/corporate/taxes-on-corporate-income', kind: 'guidance', language: 'en', publishedDate: '2026-09-25', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary, not an official source: corporate income tax 16%; the supplementary tax on credit institutions.' },
    { id: PWC_PIT, org: 'PwC', title: 'Worldwide Tax Summaries: Romania – Individual – Taxes on personal income', url: 'https://taxsummaries.pwc.com/romania/individual/taxes-on-personal-income', kind: 'guidance', language: 'en', publishedDate: '2026-09-25', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary: a flat personal income tax rate of 10%.' },
    { id: PWC_OTH, org: 'PwC', title: 'Worldwide Tax Summaries: Romania – Corporate – Other taxes', url: 'https://taxsummaries.pwc.com/romania/corporate/other-taxes', kind: 'guidance', language: 'en', publishedDate: '2026-09-25', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary: standard VAT rate 21%, reduced rate 11%; excise duty levels for 2026.' },
  ],
  instruments,
};

buildCountry(spec);
n.reconcile(part('state') + part('socialer') + part('socialhh') + part('localbuild') + part('localland') + part('localveh') + part('localfees') + part('localtransfer') + part('locallicence') + part('localsmall'), ['T:D612', 'D29F:C02']);
