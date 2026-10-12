/**
 * Türkiye: the folio's data. Run: npx tsx scripts/build/turkiye.ts
 * Figures: Ministry of Treasury and Finance, "December 2025 Central Government Budget Realisation Report"
 * (Aralık 2025 Aylık Bütçe Gerçekleşme Raporu, 14 January 2026), cumulative January–December 2025 tax revenues
 * of the central government budget, TRY million. Rates: PwC Worldwide Tax Summaries (review of 9 September 2026).
 * The folio is partial: the premiums of the Social Security Institution and the municipalities' own taxes are not
 * drawn (see structureNote); the OECD layer (structure.json, 2023) covers all three levels.
 */
import { buildCountry, type CountrySpec, type InstSpec, type Ref } from '../lib/build-country';

const D = '2026-10-12';
const y = { label: '2025', kind: 'calendar-year' as const, start: '2025-01-01', end: '2025-12-31' };
const ref = (id: string, loc?: string): Ref => (loc ? [id, loc] : [id]);
const RPT = 'mtf-budget-2025-12';
const PWC_CIT = 'pwc-tr-corporate';
const PWC_PIT = 'pwc-tr-individual';
const PWC_OTH = 'pwc-tr-other';
const PWC_NOTE = 'As summarised by PwC (review of 9 September 2026), not checked against the Revenue Administration.';
const loc = (name: string) => `Report table "Vergi Gelirleri" (tax revenues), cumulative January–December 2025: ${name}`;

interface Row { id: string; name: string; native: string; common: string; abbr?: string; amount: number; family: InstSpec['family']; category?: InstSpec['category']; base: string; payer: string; rate: InstSpec['rate']; explanation: string; refs: Ref[]; label: string; sub: string; glyph: InstSpec['glyph']; line: string }
const rows: Row[] = [
  {
    id: 'tr-income-tax', name: 'Income tax', native: 'Gelir Vergisi', common: 'Income tax', amount: 2813235, family: 'income-personal',
    base: 'Wages, salaries, business and professional income, rents and other income of individuals; employers and payers withhold most of it.',
    payer: 'Individuals; employers withhold it from pay.',
    rate: { kind: 'progressive', headline: '15% to 40% (scale for 2026)', details: ['Scale for non-employment income in 2026: 15% up to TRY 190,000; 20% to 400,000; 27% to 1,500,000; 35% to 5,300,000; 40% above. There are no local taxes on personal income in Türkiye (PwC).', 'The scale for 2025, the year of the revenue, was different.', PWC_NOTE], asOf: '2026-09-09' },
    explanation: 'The largest tax in the central budget: 25% of its tax revenue in 2025, and up 84% on 2024 in the report.',
    refs: [ref(PWC_PIT, 'Personal income tax rates')], label: 'Income tax', sub: '15–40%', glyph: 'person', line: 'Gelir Vergisi',
  },
  {
    id: 'tr-corporate-tax', name: 'Corporate tax', native: 'Kurumlar Vergisi', common: 'Corporate tax', amount: 1223874, family: 'income-corporate',
    base: 'The profit of corporations.',
    payer: 'Corporations.',
    rate: { kind: 'flat', headline: '25% (30% in the financial sector)', details: ['Article 32 of the Corporate Tax Law sets 25% for corporations other than those in the financial sector, and 30% for financial sector companies; a domestic minimum tax of 10% applies from 1 January 2025 (PwC).', PWC_NOTE], asOf: '2026-09-09' },
    explanation: 'TRY 1.2 trillion in 2025.',
    refs: [ref(PWC_CIT, 'Corporate income tax rates')], label: 'Corporate tax', sub: '25%', glyph: 'factory', line: 'Kurumlar Vergisi',
  },
  {
    id: 'tr-vat-domestic', name: 'Value added tax on domestic transactions', native: 'Dahilde Alınan Katma Değer Vergisi', common: 'VAT: domestic', abbr: 'KDV', amount: 1555932, family: 'general-consumption',
    base: 'Deliveries of goods and services in Türkiye.',
    payer: 'Consumers; businesses charge it and offset input VAT.',
    rate: { kind: 'range', headline: '20% general; reduced rates from 1% to 10%', details: ['VAT rates vary from 1% to 20% and the general rate is 20% (PwC).', PWC_NOTE], asOf: '2026-09-09' },
    explanation: 'The report separates VAT on domestic transactions from VAT on imports.',
    refs: [ref(PWC_OTH, 'Value-added tax')], label: 'VAT: domestic', sub: '20%', glyph: 'cart', line: 'Dahilde Alınan Katma Değer Vergisi',
  },
  {
    id: 'tr-vat-imports', name: 'Value added tax on imports', native: 'İthalde Alınan Katma Değer Vergisi', common: 'VAT: imports', abbr: 'KDV', amount: 1724197, family: 'general-consumption',
    base: 'The customs value of imports plus duties and taxes.',
    payer: 'Importers.',
    rate: { kind: 'range', headline: 'The same rates as the domestic VAT', details: ['Collected at the border; offset as input VAT by registered importers (PwC).', PWC_NOTE], asOf: '2026-09-09' },
    explanation: 'TRY 1.7 trillion in 2025: larger than the VAT on domestic transactions (TRY 1.6 trillion).',
    refs: [ref(PWC_OTH, 'Value-added tax')], label: 'VAT: imports', sub: '20%', glyph: 'ship', line: 'İthalde Alınan Katma Değer Vergisi',
  },
  {
    id: 'tr-special-consumption-tax', name: 'Special consumption tax', native: 'Özel Tüketim Vergisi (ÖTV)', common: 'Special consumption tax', abbr: 'ÖTV', amount: 2024315, family: 'specific-consumption',
    base: 'Four product groups: petroleum products, natural gas and lubricants; automobiles and other vehicles; tobacco and alcoholic beverages; luxury products.',
    payer: 'Producers and importers; charged once, passed on in the price.',
    rate: { kind: 'varies', headline: 'By product group', details: ['There are four main product groups subject to the special consumption tax at different rates, depending on the tariff number; unlike VAT it is charged only once (PwC).', PWC_NOTE], asOf: '2026-09-09' },
    explanation: 'TRY 2.0 trillion: the second-largest line. It covers fuels, vehicles, tobacco, alcohol and luxury goods.',
    refs: [ref(PWC_OTH, 'Special consumption tax')], label: 'Special consumption tax', sub: 'Fuel · vehicles · tobacco', glyph: 'flame', line: 'Özel Tüketim Vergisi',
  },
  {
    id: 'tr-banking-insurance-tax', name: 'Banking and insurance transactions tax', native: 'Banka ve Sigorta Muameleleri Vergisi (BSMV)', common: 'Banking and insurance transactions tax', abbr: 'BSMV', amount: 551757, family: 'general-consumption',
    base: 'The receipts of banks, insurers and similar institutions from their transactions, as the name of the tax says.',
    payer: 'Banks and insurers.',
    rate: { kind: 'varies', headline: 'Set by the Banking and Insurance Transactions Tax Law', details: ['The rate is not extracted here.'] },
    explanation: 'TRY 552 billion in 2025.',
    refs: [ref(RPT, 'table Vergi Gelirleri')], label: 'Banking and insurance tax', sub: 'BSMV', glyph: 'bank', line: 'Banka ve Sigorta Muameleleri Vergisi',
  },
  {
    id: 'tr-stamp-duty', name: 'Stamp duty', native: 'Damga Vergisi', common: 'Stamp duty', amount: 225943, family: 'property',
    base: 'Documents such as contracts, wage payrolls and financial papers, as listed in the Stamp Tax Law.',
    payer: 'Parties to the documents.',
    rate: { kind: 'varies', headline: 'A percentage of the amount stated in the document', details: ['The rate is not extracted here.'] },
    explanation: 'TRY 226 billion in 2025.',
    refs: [ref(RPT, 'table Vergi Gelirleri')], label: 'Stamp duty', sub: 'Documents', glyph: 'stamp', line: 'Damga Vergisi',
  },
  {
    id: 'tr-fees', name: 'Fees', native: 'Harçlar', common: 'Fees', amount: 336954, family: 'other', category: 'fee',
    base: 'Fees for official services, as the budget classifies them among tax revenues.',
    payer: 'Users of the services.',
    rate: { kind: 'varies', headline: 'Set by the Fees Law', details: ['The report does not itemise them.'] },
    explanation: 'TRY 337 billion in 2025, up 62% in the report.',
    refs: [ref(RPT, 'table Vergi Gelirleri')], label: 'Fees', sub: 'Harçlar', glyph: 'scroll', line: 'Harçlar',
  },
  {
    id: 'tr-other-taxes', name: 'Other taxes', native: 'Diğer vergiler', common: 'Other taxes', amount: 593261, family: 'other',
    base: 'The remaining tax revenues of the central budget; the monthly report gives them as one line and does not itemise them.',
    payer: 'Various.',
    rate: { kind: 'varies', headline: 'Various', details: ['The detailed budget statistics of the Accounting Directorate name the individual taxes; they were not retrieved for this folio.'] },
    explanation: 'TRY 593 billion: 5% of the tax revenue.',
    refs: [ref(RPT, 'table Vergi Gelirleri')], label: 'Other taxes', sub: 'Not itemised', glyph: 'gear', line: 'Diğer',
  },
];

const instruments: InstSpec[] = rows.map((r) => ({
  id: r.id, parent: 'devlet', level: 'devlet', family: r.family, ...(r.category ? { category: r.category } : {}),
  official: r.name, native: r.native, common: r.common, ...(r.abbr ? { abbr: r.abbr } : {}),
  base: r.base, payer: r.payer, rate: r.rate, explanation: r.explanation, exceptions: [], refs: r.refs,
  label: r.label, sub: r.sub, glyph: r.glyph,
  rev: { group: 'tax', amount: r.amount, locator: loc(r.line) },
}));
const total = rows.reduce((a, r) => a + r.amount, 0);

const spec: CountrySpec = {
  today: D,
  id: 'turkiye',
  iso3: 'TUR',
  isoNumeric: '792',
  names: { en: 'Türkiye', native: 'Türkiye', nativeLang: 'tr' },
  currency: { code: 'TRY', symbol: '₺', name: 'Turkish lira' },
  summary:
    'Türkiye is a unitary state. Parliament sets every tax and the Revenue Administration collects them for the central budget. Indirect taxes dominate: the VAT (domestic and on imports) and the special consumption tax on fuel, vehicles, tobacco and alcohol together bring in nearly half of the central budget’s tax revenue. A share of the central taxes is passed by law to local administrations and funds; the social security premiums go to the Social Security Institution.',
  structureNote:
    'This folio is partial. It draws the tax revenue of the central government budget in 2025 as the Ministry of Treasury and Finance reports it, in nine lines; the last, "other taxes", is one line in the monthly report and is not itemised. The premiums of the Social Security Institution and the municipalities’ own taxes are not drawn, because no 2025 source for them was reached; the OECD layer (calendar 2023, in the Trees table and the charts) covers the central government, the municipalities and the social security institution. The national total of the sizing is therefore the central budget’s taxes only. A high inflation rate makes the Turkish lira figures of different years incomparable.',
  theme: {
    accent: '#e30a17',
    accent2: '#ffffff',
    motif: 'topo',
    motifNote: 'Topographic contour lines over the outline of Türkiye (the generic motif; no bespoke art yet).',
    mapLabel: { lon: 35.0, lat: 39.2 },
  },
  rootLabel: { label: 'Türkiye', sub: 'Fiscal folio · central budget' },
  researchStatus: 'partial',
  levels: [
    {
      id: 'devlet', branch: 'national', official: 'The State (central government)', native: 'Devlet (merkezi yönetim)', common: 'Central government',
      description: 'The Grand National Assembly legislates the taxes; the Revenue Administration (GİB) collects most of them; a share of the central taxes is passed to local administrations and funds by law.',
      fiscalPower: 'Taxes are created and set by law; municipalities may levy only the taxes and fees that the law lists.',
      refs: [ref(RPT)], label: 'Central government', sub: 'Devlet',
    },
  ],
  supporting: [],
  denominators: [
    {
      id: 'merkezi-vergi-2025', label: 'Tax revenue of the central government budget, 2025',
      definition: 'The tax revenues of the central government budget: income tax, corporate tax, domestic and import VAT, the special consumption tax, the banking and insurance transactions tax, stamp duty, fees and other taxes. A share of them is passed to local administrations and funds by law; the amounts are drawn gross, as the report gives them.',
      levelIds: ['devlet'], amount: total, period: y, sourceId: RPT,
      locator: 'Report table "Vergi Gelirleri" (tax revenues), cumulative January–December 2025: total TRY 11,049,467 million',
      calculation: `Sum of the nine lines below = ${total.toLocaleString('en-GB')} (TRY million)`,
      caveat: 'Cash basis, provisional (the report of 14 January 2026). The report’s total of TRY 11,049,467 million equals the sum of its nine lines. The Social Security Institution’s premiums and the municipalities’ own taxes are not part of it.',
    },
  ],
  sizing: {
    label: 'Tax revenue of the central government budget',
    definition: 'The nine tax lines of the central government budget, calendar 2025, before the shares passed to local administrations and funds. Excludes the social security premiums and municipal own taxes.',
    componentIds: ['merkezi-vergi-2025'],
  },
  fromProfile: 'turkiye',
  structureOverride: {
    basis: 'OECD attribution to sub-sectors of general government (Interpretative Guide, section A.12)',
    folioLevels: { central: ['devlet'] },
    notes: ['The folio draws only the central government budget’s taxes (2025); the three levels of this table are the OECD’s figures for 2023.'],
  },
  groups: {
    tax: { title: 'Central government budget tax revenue 2025 – Ministry of Treasury and Finance (TRY million)', denominatorId: 'merkezi-vergi-2025', period: y, basis: 'Cash basis, provisional; gross before the shares passed to local administrations and funds', sourceId: RPT },
  },
  sources: [
    { id: RPT, org: 'Ministry of Treasury and Finance of Türkiye (Kamu Mali Yönetim ve Dönüşüm Genel Müdürlüğü)', title: 'Aralık 2025 Aylık Bütçe Gerçekleşme Raporu (December 2025 monthly central government budget realisation report)', url: 'https://ms.hmb.gov.tr/uploads/sites/23/2026/01/2025-Aralik-Aylik-Butce-Gerceklesme-Raporu_V2_14.01.2026-e6324968422ea9d9.pdf', kind: 'budget-report', language: 'tr', publishedDate: '2026-01-15', periodCovered: 'Calendar year 2025 (cumulative January–December)', accessed: D, nextExpected: '2027-01', note: 'Tax revenues 2025, TRY million: income tax 2,813,235; corporate tax 1,223,874; domestic VAT 1,555,932; special consumption tax 2,024,315; banking and insurance transactions tax 551,757; import VAT 1,724,197; stamp duty 225,943; fees 336,954; other 593,261; total 11,049,467. Announcement page: https://kmyd.hmb.gov.tr/duyuru/2025-aralik-merkezi-yonetim-butce-gerceklesmeleri' },
    { id: PWC_CIT, org: 'PwC', title: 'Worldwide Tax Summaries: Turkey – Corporate – Taxes on corporate income', url: 'https://taxsummaries.pwc.com/turkey/corporate/taxes-on-corporate-income', kind: 'guidance', language: 'en', publishedDate: '2026-09-09', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary, not an official source: corporate income tax 25%, 30% for financial sector companies; domestic minimum tax from 2025.' },
    { id: PWC_PIT, org: 'PwC', title: 'Worldwide Tax Summaries: Turkey – Individual – Taxes on personal income', url: 'https://taxsummaries.pwc.com/turkey/individual/taxes-on-personal-income', kind: 'guidance', language: 'en', publishedDate: '2026-09-09', periodCovered: 'Scale for 2026', accessed: D, note: 'A professional firm’s summary: income tax scale 15%, 20%, 27%, 35% and 40%; no local taxes on personal income.' },
    { id: PWC_OTH, org: 'PwC', title: 'Worldwide Tax Summaries: Turkey – Corporate – Other taxes', url: 'https://taxsummaries.pwc.com/turkey/corporate/other-taxes', kind: 'guidance', language: 'en', publishedDate: '2026-09-09', periodCovered: 'Rates as of the review', accessed: D, note: 'A professional firm’s summary: VAT from 1% to 20%, general rate 20%; the four product groups of the special consumption tax.' },
  ],
  instruments,
};

buildCountry(spec);
console.log('central budget taxes:', total);
