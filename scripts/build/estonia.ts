/**
 * Estonia: the folio's data. Run: npx tsx scripts/build/estonia.ts
 * Figures: Commission / Eurostat National Tax List (NTL), edition 2026, sheet EE, calendar 2024, EUR million
 * (scripts/build/data/ntl-EE.json, extracted by scripts/extract-ntl.cjs). Rates: Estonian Tax and Customs Board (EMTA).
 */
import { buildCountry, type CountrySpec, type InstSpec, type Ref } from '../lib/build-country';
import { loadNtl, loadSectors } from '../lib/ntl';

const D = '2026-10-12';
const y = { label: '2024', kind: 'calendar-year' as const, start: '2024-01-01', end: '2024-12-31' };
const ref = (id: string, loc?: string): Ref => (loc ? [id, loc] : [id]);
const n = loadNtl('EE', 'EUR');
const sec = loadSectors('EE');
const NTL = 'ntl-2026';
const EMTA = 'emta-rates';

const inst = (i: Omit<InstSpec, 'rev'> & { keys: string[]; group: string; caveat?: string }): InstSpec => {
  const { keys, group, caveat, ...rest } = i;
  return { ...rest, rev: n.rev(group, keys, caveat ? { caveat } : {}) };
};

const instruments: InstSpec[] = [
  /* ---- the State: income taxes ---- */
  inst({
    id: 'ee-income-tax-persons', parent: 'riik', level: 'riik', family: 'income-personal', group: 'state',
    keys: ['D51M:C01'],
    official: 'Income tax on natural persons', native: 'Füüsilise isiku tulumaks', common: 'Personal income tax',
    base: 'Wages, business income of sole proprietors, pensions, rents, interest, dividends and capital gains of residents, and the Estonian-source income of non-residents.',
    payer: 'Individuals; employers and other payers withhold it.',
    rate: { kind: 'flat', headline: 'Flat 20% in 2024; 22% from 2025', details: ['Withheld rate: 20% in 2024, 22% in 2025 and 2026 (EMTA, tax rates page).', 'Basic exemption in 2024: up to EUR 654 a month, depending on income, and up to EUR 776 a month at pensionable age. From 2026 it is EUR 700 a month for everyone and no longer falls as income rises.'], asOf: '2026-10-12' },
    explanation: 'One flat rate on every kind of personal income, with a basic exemption. It is the second largest tax. Local governments receive a share of it through the state budget; the National Tax List and Eurostat record it as a state tax.',
    exceptions: [], refs: [ref(EMTA, '2024, 2025 and 2026 sections')], label: 'Personal income tax', sub: 'Flat 20% (2024)', glyph: 'person',
  }),
  inst({
    id: 'ee-corporate-income-tax-distributions', parent: 'riik', level: 'riik', family: 'income-corporate', group: 'state',
    keys: ['D51C2:C01'],
    official: 'Corporate income tax on distributed profits (dividends and other profit distributions)', native: 'Ettevõtte tulumaks kapitalikasumilt (dividendid ja muud kasumieraldised)', common: 'Corporate income tax on distributions',
    base: 'Profits that a company distributes (dividends, share buy-backs, capital reductions), not profits it earns and keeps.',
    payer: 'The distributing company.',
    rate: { kind: 'flat', headline: '20/80 of the net distribution in 2024 (22/78 from 2025)', details: ['2024: 20/80 on distributions, 14/86 on regularly paid dividends, with 7% additionally withheld when the dividend goes to a natural person.', 'From 1 January 2025 the lower 14/86 rate was abolished and only 22/78 applies (EMTA).'], asOf: '2026-10-12' },
    explanation: 'Estonia taxes company profit only when it is paid out, so reinvested profit is untaxed. The National Tax List splits the corporate tax into this line and the one on fringe benefits and other expenses.',
    exceptions: ['Companies may pass on without further tax certain dividends they received before 2025 that were taxed at the lower 14/86 rate (EMTA).'],
    refs: [ref(EMTA, '2024 and 2025 sections')], label: 'Corporate tax on distributions', sub: '20/80 · on payout', glyph: 'factory',
  }),
  inst({
    id: 'ee-corporate-income-tax-benefits', parent: 'riik', level: 'riik', family: 'income-corporate', group: 'state',
    keys: ['D51B:C01'],
    official: 'Corporate income tax on fringe benefits, gifts, donations and non-business expenses', native: 'Ettevõtte tulumaks erisoodustustelt, kingitustelt, annetustelt ja muult', common: 'Corporate tax on fringe benefits and other expenses',
    base: 'Fringe benefits, gifts, donations, entertainment and expenses unrelated to the business, which the company pays without deducting.',
    payer: 'The company or employer.',
    rate: { kind: 'flat', headline: 'The corporate rate: 20/80 in 2024, 22/78 from 2025', details: ['The National Tax List names the line "Corporate income tax on fringe benefits, gifts, donations and other"; the 2024 EMTA rate page gives the corporate rate of 20/80, the single rate of the Income Tax Act.'], asOf: '2026-10-12' },
    explanation: 'The second part of the Estonian corporate income tax. Fringe benefits also bear social tax.',
    exceptions: [], refs: [ref(NTL, 'sheet EE, D51B'), ref(EMTA, '2024 section')], label: 'Corporate tax on benefits', sub: 'Fringe benefits · gifts', glyph: 'factory',
  }),
  /* ---- the State: social contributions ---- */
  inst({
    id: 'ee-social-tax-pension', parent: 'riik', level: 'riik', category: 'social-contribution', family: 'social-security', group: 'social',
    keys: ['D6111:C01', 'D6111:C02'],
    official: 'Social tax, pension insurance part (20%), net of the 4% allotment to the funded pension', native: 'Sotsiaalmaks, pensionikindlustus', common: 'Social tax: pension',
    base: 'Gross pay and fees (employer pays), the business income of the self-employed, with a monthly minimum.',
    payer: 'Employers (33% of gross pay in all); self-employed people for themselves.',
    rate: { kind: 'flat', headline: '33% social tax: 20% pension + 13% health', details: ['The labels of the National Tax List give 20% for pension insurance and 13% for health insurance.', 'The National Tax List subtracts an allotment for the funded pension of 4% (EUR 324 million in 2024).', 'Monthly minimum obligation in 2024: EUR 725 of pay, i.e. EUR 239.25 of social tax.'] , asOf: '2026-10-12' },
    explanation: 'Paid by the employer on top of the gross pay, not withheld from the worker. The pension part funds the state pension scheme.',
    exceptions: [], refs: [ref('emta-social-tax'), ref(EMTA, '2024 section')], label: 'Social tax: pensions', sub: '20% of pay', glyph: 'heart',
  }),
  inst({
    id: 'ee-social-tax-health', parent: 'riik', level: 'riik', category: 'social-contribution', family: 'social-security', group: 'social',
    keys: ['D6112:C01'],
    official: 'Social tax, health insurance part (13%)', native: 'Sotsiaalmaks, ravikindlustus', common: 'Social tax: health',
    base: 'The same base as the pension part: gross pay and fees.',
    payer: 'Employers; self-employed people for themselves.',
    rate: { kind: 'flat', headline: '13% of gross pay', details: ['The National Tax List labels the line "Health insurance (13%)"; together with the 20% pension part it makes the 33% social tax.'], asOf: '2026-10-12' },
    explanation: 'The part of the social tax that funds the Health Insurance Fund (Tervisekassa).',
    exceptions: [], refs: [ref('emta-social-tax'), ref(NTL, 'sheet EE, D6112')], label: 'Social tax: health', sub: '13% of pay', glyph: 'heart',
  }),
  inst({
    id: 'ee-unemployment-insurance', parent: 'riik', level: 'riik', category: 'insurance-premium', family: 'social-security', group: 'social',
    keys: ['D6112:C02', 'D613CE:C01'],
    official: 'Unemployment insurance premiums (employer’s and employee’s)', native: 'Töötuskindlustusmakse', common: 'Unemployment insurance premiums',
    base: 'Gross pay.',
    payer: 'Employees (withheld) and employers.',
    rate: { kind: 'flat', headline: '1.6% employee + 0.8% employer', details: ['The rates are unchanged from 2024 to 2026 (EMTA). The employee’s premium stops at pensionable age.'], asOf: '2026-10-12' },
    explanation: 'Premiums paid to the Unemployment Insurance Fund (Töötukassa), which pays unemployment benefits and runs job-seeking services.',
    exceptions: [], refs: [ref('emta-unemployment'), ref(EMTA, '2024 section')], label: 'Unemployment insurance', sub: '1.6% + 0.8%', glyph: 'bed',
  }),
  inst({
    id: 'ee-social-contributions-others', parent: 'riik', level: 'riik', category: 'social-contribution', family: 'social-security', group: 'social',
    keys: ['D613CS:C01', 'D613CN:C01'],
    official: 'Social contributions by the self-employed and compulsory contributions by the non-employed', native: 'FIE-de sotsiaalmaksed; mittetöötavate isikute kohustuslikud sotsiaalmaksed', common: 'Self-employed and non-employed contributions',
    base: 'As labelled in the National Tax List: "Social contributions by self-employed" and "Compulsory actual social contributions by the non-employed". The list does not itemise them further.',
    payer: 'Self-employed people and non-employed persons who pay for their own cover.',
    rate: { kind: 'varies', headline: 'Set by the Social Tax Act', details: ['The National Tax List does not give a rate.'] },
    explanation: 'Small contributions classified by the statistician under households rather than employers.',
    exceptions: [], refs: [ref(NTL, 'sheet EE, D613CS and D613CN')], label: 'Self-employed & non-employed', sub: 'Contributions', glyph: 'heart',
  }),
  /* ---- the State: consumption ---- */
  inst({
    id: 'ee-vat', parent: 'riik', level: 'riik', family: 'general-consumption', group: 'state',
    keys: ['D211:C01'],
    official: 'Value added tax', native: 'Käibemaks', common: 'VAT', abbr: 'VAT',
    base: 'Goods and services supplied in Estonia, intra-EU acquisitions and imports.',
    payer: 'Consumers; businesses charge it and claim input credits.',
    rate: { kind: 'range', headline: '24% standard since 1 July 2025 (22% in 2024)', details: ['Rates now: 24%, 13%, 9% and 0% (EMTA).', 'The standard rate was 22% during 2024, the year of the figure; it went to 24% on 1 July 2025.'], asOf: '2026-10-12' },
    explanation: 'The largest single tax.',
    exceptions: ['Some supplies of a social nature are exempt (EMTA).'], refs: [ref('emta-vat')], label: 'VAT', sub: '22% → 24%', glyph: 'cart',
  }),
  inst({
    id: 'ee-customs-duty', parent: 'riik', level: 'riik', category: 'customs-duty', family: 'trade', group: 'state',
    keys: ['D2121:C01'],
    official: 'Customs duty', native: 'Tollimaks', common: 'Customs duty',
    base: 'Goods imported from outside the EU, by the Common Customs Tariff.',
    payer: 'Importers.',
    rate: { kind: 'varies', headline: 'EU Common Customs Tariff', details: ['The duty is an EU own resource; Eurostat records it under the EU institutions, not under Estonian government.'] },
    explanation: 'Collected by the Tax and Customs Board for the EU. The National Tax List adds it because it covers government plus the EU institutions.',
    exceptions: [], refs: [ref('emta-customs')], label: 'Customs duty', sub: 'EU tariff', glyph: 'ship',
  }),
  inst({
    id: 'ee-excise-alcohol', parent: 'riik', level: 'riik', family: 'specific-consumption', group: 'state',
    keys: ['D2122C:C01'],
    official: 'Alcohol excise duty', native: 'Alkoholiaktsiis', common: 'Alcohol excise',
    base: 'Beer, wine, other fermented drinks, intermediate products and spirits, by volume or pure alcohol.',
    payer: 'Producers and importers (excise warehouse keepers); passed on in the price.',
    rate: { kind: 'specific', headline: 'Per litre of product or of pure alcohol', details: ['The rates are fixed in the Alcohol, Tobacco, Fuel and Electricity Excise Duty Act.'] },
    explanation: 'Paid when the goods leave an excise warehouse or are imported; the duty is declared monthly (EMTA).',
    exceptions: [], refs: [ref('emta-alcohol')], label: 'Alcohol excise', sub: 'Per litre', glyph: 'wine',
  }),
  inst({
    id: 'ee-excise-tobacco', parent: 'riik', level: 'riik', family: 'specific-consumption', group: 'state',
    keys: ['D2122C:C02'],
    official: 'Tobacco excise duty', native: 'Tubakaaktsiis', common: 'Tobacco excise',
    base: 'Cigarettes, cigars, smoking tobacco and similar products.',
    payer: 'Producers and importers; passed on in the price.',
    rate: { kind: 'specific', headline: 'Per unit of quantity, fixed by the Act', details: ['The rates are fixed in the Alcohol, Tobacco, Fuel and Electricity Excise Duty Act.'] },
    explanation: 'About the same size as the alcohol excise.',
    exceptions: [], refs: [ref('emta-tobacco')], label: 'Tobacco excise', sub: 'Cigarettes', glyph: 'smoke',
  }),
  inst({
    id: 'ee-excise-fuel', parent: 'riik', level: 'riik', family: 'specific-consumption', group: 'state',
    keys: ['D2122C:C03'],
    official: 'Excise duty on fuel', native: 'Kütuseaktsiis', common: 'Fuel excise',
    base: 'Liquid, solid and gaseous fuels, by quantity (EMTA, fuel and electricity page).',
    payer: 'Fuel producers and importers; passed on at the pump.',
    rate: { kind: 'specific', headline: 'Per unit of fuel, fixed by the Act', details: ['The rates are fixed in the Alcohol, Tobacco, Fuel and Electricity Excise Duty Act (EMTA, fuel and electricity page).'] },
    explanation: 'The biggest excise.',
    exceptions: ['Fuel used for certain purposes is exempt (permit needed).'], refs: [ref('emta-fuel')], label: 'Fuel excise', sub: 'Per litre', glyph: 'flame',
  }),
  inst({
    id: 'ee-excise-other', parent: 'riik', level: 'riik', family: 'specific-consumption', group: 'state',
    keys: ['D2122C:C07', 'D2122C:C08', 'D2122C:C05'],
    official: 'Electricity excise, liquid fuel stockpiling fee and packaging excise', native: 'Elektriaktsiis; vedelkütusevaru makse; pakendiaktsiis', common: 'Electricity and other small excises',
    base: 'Electricity consumed, liquid fuel released for consumption (stockpiling fee) and certain packaging.',
    payer: 'Electricity sellers, fuel suppliers and packagers.',
    rate: { kind: 'varies', headline: 'Set by the excise and stockpiling Acts', details: ['The National Tax List shows three small lines: electricity excise EUR 9.9 million, liquid fuel stockpiling fee EUR 5.3 million and packaging excise EUR 0.2 million.'] },
    explanation: 'Three small levies that the National Tax List books under excises.',
    exceptions: [], refs: [ref('emta-fuel')], label: 'Other excises', sub: 'Electricity · stockpile', glyph: 'bolt',
  }),
  inst({
    id: 'ee-renewable-energy-charge', parent: 'riik', level: 'riik', category: 'special-levy', family: 'other', group: 'state',
    keys: ['D214A:C02'],
    official: 'Renewable energy charge', native: 'Taastuvenergia tasu', common: 'Renewable energy charge',
    base: 'Electricity supplied to consumers.',
    payer: 'Electricity consumers.',
    rate: { kind: 'varies', headline: 'Set by law', details: ['The National Tax List classifies it as a tax on products (D214A).'] },
    explanation: 'A compulsory charge that finances support to producers of renewable electricity.',
    exceptions: [], refs: [ref(NTL, 'sheet EE, D214A C02')], label: 'Renewable energy charge', sub: 'On electricity', glyph: 'bolt',
  }),
  inst({
    id: 'ee-gambling-tax', parent: 'riik', level: 'riik', family: 'specific-consumption', group: 'state',
    keys: ['D214F:C01'],
    official: 'Gambling tax', native: 'Hasartmängumaks', common: 'Gambling tax',
    base: 'Gambling operators’ activity, by type of game; monthly return.',
    payer: 'Gambling operators holding an Estonian licence or permit.',
    rate: { kind: 'varies', headline: 'By type of gambling', details: ['The return has nine annexes, one for each type of gambling (EMTA).'] },
    explanation: 'Revenue rose from EUR 48.6 million in 2023 to EUR 57.1 million in 2024.',
    exceptions: [], refs: [ref('emta-gambling')], label: 'Gambling tax', sub: 'Operators', glyph: 'dice',
  }),
  inst({
    id: 'ee-vehicle-taxes', parent: 'riik', level: 'riik', family: 'specific-consumption', group: 'state',
    keys: ['D214D:C01', 'D29B:C01'],
    official: 'Motor vehicle registration fee and heavy goods vehicle tax', native: 'Autode registreerimistasu; raskeveokimaks', common: 'Vehicle registration and heavy goods vehicle tax',
    base: 'The registration of a motor vehicle, and heavy goods vehicles.',
    payer: 'Vehicle owners.',
    rate: { kind: 'varies', headline: 'Set by law', details: ['EMTA’s road user charge page covers the current charge on heavy vehicles.'] },
    explanation: 'Two vehicle charges of the National Tax List. They do not include the motor vehicle tax introduced in 2025.',
    exceptions: [], refs: [ref('emta-road-charge')], label: 'Vehicle charges', sub: 'Registration · trucks', glyph: 'car',
  }),
  inst({
    id: 'ee-environmental-charges', parent: 'riik', level: 'riik', category: 'fee', family: 'resource', group: 'state',
    keys: ['D29F:C01', 'D29H:C01', 'D29H:C03'],
    official: 'Pollution fee, water abstraction fee and fishing right fee', native: 'Saastetasu; vee erikasutustasu; kalapüügiõiguse tasu', common: 'Environmental charges',
    base: 'Emissions to air and water and waste disposal (pollution fee), the abstraction of water, and the right to fish.',
    payer: 'Polluters, water users and fishers.',
    rate: { kind: 'varies', headline: 'Set by the Environmental Charges Act', details: ['EUR 35.2 million pollution fee, EUR 14.0 million water abstraction fee and EUR 2.2 million fishing right fee in 2024.'] },
    explanation: 'The National Tax List codes these under pollution and resource taxes.',
    exceptions: [], refs: [ref(NTL, 'sheet EE, D29F C01, D29H C01 and C03')], label: 'Environmental charges', sub: 'Pollution · water', glyph: 'leaf',
  }),
  inst({
    id: 'ee-guarantee-fund', parent: 'riik', level: 'riik', category: 'special-levy', family: 'other', group: 'state',
    keys: ['D29H:C06'],
    official: 'Contributions to the Guarantee Fund', native: 'Tagatisfondi osamaksed', common: 'Guarantee Fund contributions',
    base: 'Contributions collected by the Guarantee Fund (Tagatisfond) from covered financial institutions; the National Tax List gives no further detail.',
    payer: 'Covered financial institutions.',
    rate: { kind: 'varies', headline: 'Set by the Fund under the law', details: ['The National Tax List books the contributions as a tax on production (D29H).'] },
    explanation: 'A compulsory contribution that the statisticians book as a tax. It fell from EUR 50.5 million in 2023 to EUR 42.3 million in 2024.',
    exceptions: [], refs: [ref(NTL, 'sheet EE, D29H C06')], label: 'Guarantee Fund', sub: 'Banks’ levy', glyph: 'bank',
  }),
  inst({
    id: 'ee-licences-other', parent: 'riik', level: 'riik', category: 'fee', family: 'other', group: 'state',
    keys: ['D29E:C01', 'D214H:C01'],
    official: 'Business and professional licences, and the postal service payment', native: 'Litsentsid; postiteenuse makse', common: 'Licences and other small levies',
    base: 'Licences to carry on a business or profession, and a payment by postal operators.',
    payer: 'Licence holders and postal operators.',
    rate: { kind: 'varies', headline: 'Fixed fees', details: ['EUR 4.9 million for licences and EUR 0.03 million for the postal payment in 2024.'] },
    explanation: 'The smallest lines the National Tax List books as taxes.',
    exceptions: [], refs: [ref(NTL, 'sheet EE, D29E and D214H')], label: 'Licences and small levies', sub: 'Fees', glyph: 'stamp',
  }),
  /* ---- local governments ---- */
  inst({
    id: 'ee-land-tax', parent: 'kov', level: 'kov', family: 'property', group: 'local',
    keys: ['D29A:C01'],
    official: 'Land tax', native: 'Maamaks', common: 'Land tax',
    base: 'The taxable value of land (not buildings), set by the Land and Spatial Development Board.',
    payer: 'Owners, superficiaries or usufructuaries of the land on 1 January.',
    rate: { kind: 'range', headline: 'Set by each local government within limits', details: ['The Land Tax Act sets the range; each local government fixes its rate and exemptions. The Tax and Customs Board calculates and collects the tax and pays it in full to the local budget (EMTA).'] },
    explanation: 'The main tax of the local governments in the National Tax List. It taxes land, not buildings.',
    exceptions: ['No tax is imposed if the bill in one local government is below EUR 5.'], refs: [ref('emta-land-tax')], label: 'Land tax', sub: 'Local', glyph: 'town',
  }),
  inst({
    id: 'ee-local-taxes', parent: 'kov', level: 'kov', family: 'other', group: 'local',
    keys: ['D29H:C05', 'D29H:C02'],
    official: 'Advertising tax and tax on the closure of roads, streets and squares', native: 'Reklaamimaks; teede ja tänavate sulgemise maks', common: 'Advertising tax and road-closure tax',
    base: 'Advertising in public places, and closing a road or street for private use.',
    payer: 'Advertisers and those who close the road.',
    rate: { kind: 'varies', headline: 'Set by each local government', details: ['Under the Local Taxes Act local governments may introduce a limited list of taxes; EUR 8.1 million came from the advertising tax and EUR 3.1 million from the road-closure tax in 2024.'] },
    explanation: 'The two other local taxes that appear in the National Tax List.',
    exceptions: [], refs: [ref(NTL, 'sheet EE, D29H C05 and C02')], label: 'Advertising · road closure', sub: 'Local', glyph: 'stamp',
  }),
];

/* ---- parts of the national total: the sums of the NTL lines drawn, per level and scheme ---- */
const part = (g: string) => n.round(instruments.filter((i) => i.rev?.group === g).reduce((a, i) => a + i.rev!.amount, 0));
const ntlTotal = (c: string) => (typeof n.file.totals[c]?.v2024 === 'number' ? (n.file.totals[c].v2024 as number) : 0);
const eurostat = (k: string) => sec[k] ?? 0;
const sectorSum = (code: string) => ['S1311', 'S1312', 'S1313', 'S1314', 'S212'].reduce((a, s) => a + eurostat(`${s}:${code}`), 0);
const vintage = ['D2', 'D5', 'D61'].map((c) => `${c}: NTL ${n.fmt(ntlTotal(c))}, Eurostat July 2026 ${n.fmt(sectorSum(c))}`).join('; ');

const spec: CountrySpec = {
  today: D,
  id: 'estonia',
  iso3: 'EST',
  isoNumeric: '233',
  names: { en: 'Estonia', native: 'Eesti', nativeLang: 'et' },
  currency: { code: 'EUR', symbol: '€', name: 'Euro' },
  summary:
    'Estonia is a unitary state with one tax collector, the Tax and Customs Board. Almost every tax is national: a flat income tax on persons, a corporate tax that falls only on profit that is distributed, a 33% social tax paid by employers, VAT and excises. Local governments levy only the land tax and two small taxes; they receive a share of the personal income tax through the state budget, which the statistics count as a transfer.',
  structureNote:
    'The figures come from the Commission’s National Tax List for 2024, which lists each tax by its national name. The sale of emission permits (EUR 360 million in 2024) is left out because it is the sale of a right, not a tax; so are the employers’ imputed social contributions (EUR 134 million), which are no payment. The funded pension share of the social tax is subtracted, as in the list. The social contributions are drawn under the State: the Health Insurance Fund and the Unemployment Insurance Fund are public bodies but the Tax and Customs Board collects the money. The customs duties belong to the EU budget.',
  theme: {
    accent: '#6aa0ff',
    accent2: '#0b0b0b',
    motif: 'topo',
    motifNote: 'Topographic contour lines over the outline of Estonia (the generic motif; no bespoke art yet).',
    mapLabel: { lon: 25.5, lat: 58.7 },
  },
  rootLabel: { label: 'Estonia', sub: 'Eesti · Fiscal folio' },
  levels: [
    {
      id: 'riik', branch: 'national', official: 'The State (central government)', native: 'Riik', common: 'State',
      description: 'The Riigikogu makes the tax laws and the Tax and Customs Board (EMTA) collects the state taxes and the social contributions, which fund the Health Insurance Fund, the Unemployment Insurance Fund and the pension system.',
      fiscalPower: 'Only the Riigikogu can create a tax; municipalities may levy only the taxes listed in the Local Taxes Act.',
      refs: [ref('emta-rates')], label: 'State', sub: 'Riik',
    },
    {
      id: 'kov', branch: 'local', official: 'Local governments (rural municipalities and towns)', native: 'Kohalikud omavalitsused', common: 'Local governments',
      description: 'The only tier of local government. Their taxes in the National Tax List are the land tax (calculated and collected by the Tax and Customs Board), the advertising tax and the road-closure tax. They also receive a share of the income tax through the state budget.',
      fiscalPower: 'The Local Taxes Act lists the taxes that a council may introduce; the Land Tax Act lets each council set the rate within a range.',
      refs: [ref('emta-land-tax'), ref('eurostat-taxag', 'S.1313: no income tax booked to local government')], label: 'Local governments', sub: 'Kohalikud',
    },
  ],
  supporting: [],
  denominators: [
    {
      id: 'riik-taxes-2024', label: 'State taxes (listed in the National Tax List), 2024',
      definition: 'The taxes on production and imports, on income and wealth that the National Tax List books to the State and the EU, other than the three local taxes and the emission permit sales: income taxes, VAT, excises, customs duty and the smaller levies.',
      levelIds: ['riik'], amount: part('state'), period: y, sourceId: NTL,
      locator: 'Sheet EE, 2024, lines D211, D2121, D2122C, D214A, D214D, D214F, D214H, D29B, D29E, D29F, D29H and D51 as listed with each tax',
      calculation: `Sum of the ${instruments.filter((i) => i.rev?.group === 'state').length} tax rows below (EUR million)`,
      caveat: `Calendar 2024. The list's cut-off was 30 October 2025; Eurostat's later accounts differ (${vintage}). The full list (D2, D5 and D61 including imputed contributions) is EUR ${n.fmt(ntlTotal('D2') + ntlTotal('D5') + ntlTotal('D61'))} million.`,
    },
    {
      id: 'riik-social-2024', label: 'Social tax and unemployment insurance premiums, 2024',
      definition: 'The actual compulsory social contributions of employers, employees, the self-employed and the non-employed, net of the funded-pension allotment; imputed contributions are left out.',
      levelIds: ['riik'], amount: part('social'), period: y, sourceId: NTL,
      locator: 'Sheet EE, 2024, lines D6111, D6112 and D613',
      calculation: 'Sum of the social contribution rows below (EUR million)',
      caveat: 'Calendar 2024, same list and cut-off as the taxes. Eurostat records the contributions to the two insurance funds under social security funds (S.1314) and the pension part under central government.',
    },
    {
      id: 'kov-taxes-2024', label: 'Taxes of the local governments, 2024',
      definition: 'The land tax, the advertising tax and the road-closure tax.',
      levelIds: ['kov'], amount: part('local'), period: y, sourceId: NTL,
      locator: 'Sheet EE, 2024, lines D29A C01, D29H C05 and D29H C02',
      calculation: 'Sum of the local rows below (EUR million)',
      caveat: `Eurostat's July 2026 accounts book EUR ${n.fmt(eurostat('S1313:D2'))} million of taxes on production to local government (${n.fmt(eurostat('S1313:D29A'))} on land); the difference of EUR ${n.fmt(eurostat('S1313:D2') - part('local'))} million is not itemised in the list. Municipalities' share of the income tax is a transfer in both sources.`,
    },
  ],
  sizing: {
    label: 'Taxes and compulsory social contributions of all levels of government',
    definition: 'The taxes of the State and the local governments plus the actual social contributions, calendar 2024, as listed in the National Tax List. Excludes the sale of emission permits (EUR 360.0 million) and imputed social contributions (EUR 134.0 million).',
    componentIds: ['riik-taxes-2024', 'riik-social-2024', 'kov-taxes-2024'],
  },
  fromProfile: 'estonia',
  structureOverride: {
    basis: 'OECD attribution to sub-sectors of general government (Interpretative Guide, section A.12)',
    folioLevels: { central: ['riik'], local: ['kov'] },
    levelNotes: { central: 'The OECD shows the social security funds separately; the folio draws their contributions under the State.' },
  },
  groups: {
    state: { title: 'State taxes 2024 – National Tax List (EUR million)', denominatorId: 'riik-taxes-2024', period: y, basis: 'Accrual-based ESA tax revenue, general government and EU institutions', sourceId: NTL },
    social: { title: 'Social contributions 2024 – National Tax List (EUR million)', denominatorId: 'riik-social-2024', period: y, basis: 'Actual compulsory contributions, net of the funded-pension allotment', sourceId: NTL },
    local: { title: 'Local taxes 2024 – National Tax List (EUR million)', denominatorId: 'kov-taxes-2024', period: y, basis: 'Accrual-based ESA tax revenue', sourceId: NTL },
  },
  sources: [
    { id: NTL, org: 'European Commission, DG Taxation and Customs Union, with Eurostat', title: 'Data on Taxation Trends: National Tax Lists (NTL), edition 2026', url: 'https://taxation-customs.ec.europa.eu/taxation/economic-analysis/data-taxation-trends_en', kind: 'statistics', language: 'en', publishedDate: '2026-03-31', periodCovered: 'Calendar year 2024 (series from 1995)', accessed: D, nextExpected: '2027-03', note: 'Workbook "NTL edition 2026 web.xlsx", sheet EE: every tax and social contribution by its national name and ESA code, in EUR million, for general government plus EU institutions. Data cut-off 30 October 2025.' },
    { id: 'eurostat-taxag', org: 'Eurostat', title: 'Main national accounts tax aggregates (gov_10a_taxag)', url: 'https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table', kind: 'statistics', language: 'en', publishedDate: '2026-07-21', periodCovered: 'Calendar year 2024', accessed: D, nextExpected: '2027-07', note: 'Taxes and social contributions by sub-sector and ESA item; used to place each tax at a level and to check the totals of the National Tax List.' },
    { id: EMTA, org: 'Estonian Tax and Customs Board (EMTA)', title: 'Tax rates (income tax, social tax, funded pension, unemployment insurance, VAT), 2024–2026', url: 'https://www.emta.ee/en/private-client/taxes-and-payment/declaration-income/tax-rates', kind: 'tax-agency', language: 'en', publishedDate: '2025-11-11', periodCovered: '2024 to 2026', accessed: D, note: 'Rates by year: income tax 20% (2024), 22% (2025, 2026); corporate 20/80 (2024), 22/78 (2025–); social tax 33%; unemployment insurance 1.6% and 0.8%; VAT 24% standard.' },
    { id: 'emta-social-tax', org: 'Estonian Tax and Customs Board (EMTA)', title: 'Social tax', url: 'https://www.emta.ee/en/business-client/taxes-and-payment/income-and-social-taxes/social-tax', kind: 'tax-agency', language: 'en', publishedDate: null, accessed: D },
    { id: 'emta-unemployment', org: 'Estonian Tax and Customs Board (EMTA)', title: 'Unemployment insurance premiums', url: 'https://www.emta.ee/en/business-client/taxes-and-payment/income-and-social-taxes/unemployment-insurance-premiums', kind: 'tax-agency', language: 'en', publishedDate: null, accessed: D },
    { id: 'emta-vat', org: 'Estonian Tax and Customs Board (EMTA)', title: 'VAT rates and supply exempt from tax', url: 'https://www.emta.ee/en/business-client/taxes-and-payment/value-added-tax/vat-rates-and-supply-exempt-tax', kind: 'tax-agency', language: 'en', publishedDate: null, accessed: D, note: 'VAT rates 24%, 13%, 9% and 0%; the standard rate is 24% from 1 July 2025.' },
    { id: 'emta-alcohol', org: 'Estonian Tax and Customs Board (EMTA)', title: 'Excise duty on alcohol', url: 'https://www.emta.ee/en/business-client/taxes-and-payment/excise-duties/alcohol', kind: 'tax-agency', language: 'en', publishedDate: null, accessed: D },
    { id: 'emta-tobacco', org: 'Estonian Tax and Customs Board (EMTA)', title: 'Excise duty on tobacco products', url: 'https://www.emta.ee/en/business-client/taxes-and-payment/excise-duties/tobacco-products', kind: 'tax-agency', language: 'en', publishedDate: null, accessed: D },
    { id: 'emta-fuel', org: 'Estonian Tax and Customs Board (EMTA)', title: 'Excise duty on fuel and electricity', url: 'https://www.emta.ee/en/business-client/taxes-and-payment/excise-duties/fuel-and-electricity', kind: 'tax-agency', language: 'en', publishedDate: null, accessed: D },
    { id: 'emta-gambling', org: 'Estonian Tax and Customs Board (EMTA)', title: 'Gambling tax', url: 'https://www.emta.ee/en/business-client/taxes-and-payment/other-taxes-and-claims/gambling-tax', kind: 'tax-agency', language: 'en', publishedDate: null, accessed: D },
    { id: 'emta-customs', org: 'Estonian Tax and Customs Board (EMTA)', title: 'Customs duty', url: 'https://www.emta.ee/en/business-client/customs-trade-goods/taxation-goods/customs-duty', kind: 'tax-agency', language: 'en', publishedDate: null, accessed: D },
    { id: 'emta-land-tax', org: 'Estonian Tax and Customs Board (EMTA)', title: 'Land tax', url: 'https://www.emta.ee/en/private-client/taxes-and-payment/other-taxes/land-tax', kind: 'tax-agency', language: 'en', publishedDate: null, accessed: D, note: 'Land tax is a state tax imposed by the Land Tax Act and paid in full to the budget of the local authority; rates are set by the local government.' },
    { id: 'emta-road-charge', org: 'Estonian Tax and Customs Board (EMTA)', title: 'Road user charge', url: 'https://www.emta.ee/en/private-client/taxes-and-payment/other-taxes/road-user-charge', kind: 'tax-agency', language: 'en', publishedDate: null, accessed: D },
  ],
  instruments,
};

buildCountry(spec);
n.reconcile(part('state') + part('social') + part('local'), ['D6121:C01', 'D6122:C01', 'D29F:C02']);
const left = n.unused().filter((l) => !['D6121:C01', 'D6122:C01', 'D51O:C01', 'D29F:C02'].includes(l.key));
if (left.length) console.log('NTL lines not used:', left.map((l) => l.key + '=' + l.v2024).join(', '));
