/* One-off migration: single "national total" per country. Kept for provenance only: it records how the first data was imported. Do NOT re-run it, it would overwrite later edits. */
import fs from 'node:fs';
import path from 'node:path';
import { formatJson } from '../lib/format-json';

const ROOT = process.cwd();
const read = (c: string, f: string) => JSON.parse(fs.readFileSync(path.join(ROOT, 'countries', c, f), 'utf8').replace(/^﻿/, ''));
const write = (c: string, f: string, v: unknown) => fs.writeFileSync(path.join(ROOT, 'countries', c, f), formatJson(v), 'utf8');

const TODAY = '2026-09-29';
type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any

function edit(c: string, fn: (meta: Any, rev: Any, sources: Any) => void) {
  const meta = read(c, 'country.json');
  const rev = read(c, 'revenue.json');
  const src = read(c, 'sources.json');
  fn(meta, rev, src);
  for (const d of meta.denominators) delete d.scope;
  write(c, 'country.json', meta);
  write(c, 'revenue.json', rev);
  write(c, 'sources.json', src);
  console.log('migrated', c);
}

const groupOf = (rev: Any, nodeId: string): Any => rev.groups.find((g: Any) => g.observations.some((o: Any) => o.nodeId === nodeId));
const findObs = (rev: Any, nodeId: string): Any => groupOf(rev, nodeId).observations.find((o: Any) => o.nodeId === nodeId);
/** Moves observations out of their group into a new informational group that has no denominator. */
function makeInformational(rev: Any, nodeIds: string[], title: string, caveat: string) {
  const first = groupOf(rev, nodeIds[0]);
  const defaults = { ...first.defaults, role: 'informational' };
  delete defaults.denominatorId;
  const moved: Any[] = [];
  for (const id of nodeIds) {
    const g = groupOf(rev, id);
    const i = g.observations.findIndex((o: Any) => o.nodeId === id);
    const [o] = g.observations.splice(i, 1);
    moved.push({ ...o, caveat: [caveat, o.caveat].filter(Boolean).join(' ') });
  }
  rev.groups.push({ title, defaults, observations: moved });
  rev.groups = rev.groups.filter((g: Any) => g.observations.length);
}
const setRole = (rev: Any, denominatorId: string, role: 'sizing' | 'informational') => {
  for (const g of rev.groups) if (g.defaults.denominatorId === denominatorId) g.defaults.role = role;
};

const oecdSource = (id: string, o: Any) => ({
  id,
  org: 'OECD',
  language: 'en',
  kind: 'international',
  accessed: TODAY,
  ...o,
});
const OECD_CH6 = 'https://www.oecd.org/en/publications/revenue-statistics-2025_3a264267-en/full-report/tax-revenues-by-subsectors-of-general-government_f9e88332.html';
const OECD_CH3 = 'https://www.oecd.org/en/publications/revenue-statistics-2025_3a264267-en/full-report/tax-levels-and-tax-structures-1965-2024_2033f3ea.html';
const LAC_CH1 = 'https://www.oecd.org/en/publications/revenue-statistics-in-latin-america-and-the-caribbean-2025_7594fbdd-en/full-report/tax-revenue-trends-1990-2023_ee246e3f.html';
const addOecdRs = (src: Any, tableNo: string, country: string) => {
  if (!src.sources.some((s: Any) => s.id === 'oecd-rs-2025-subsectors'))
    src.sources.push(
      oecdSource('oecd-rs-2025-subsectors', {
        title: `Revenue Statistics 2025, Table ${tableNo}: ${country}, tax revenues by sub-sectors of government`,
        url: OECD_CH6,
        publishedDate: '2025-12-09',
        periodCovered: 'Calendar year 2023 (national currency)',
        note: 'Harmonised OECD classification of taxes (1000–6000) split by collecting sub-sector of general government. Used for the cross-country profile and for parts of the national total that have no national-source breakdown.',
      }),
      oecdSource('oecd-rs-2025-levels', {
        title: 'Revenue Statistics 2025, Chapter 3: Tax levels and tax structures (Tables 3.1 and 3.4)',
        url: OECD_CH3,
        publishedDate: '2025-12-09',
        periodCovered: 'Calendar year 2023',
        note: 'Total tax revenue as % of GDP and tax structure as % of total taxation, for all OECD members.',
      }),
    );
};

/* -------------------------------------------------------------- Canada */
edit('canada', (meta, rev) => {
  const fed = meta.denominators.find((d: Any) => d.id === 'federal-total-revenue');
  const prov = meta.denominators.find((d: Any) => d.id === 'provincial-total-revenue');
  const loc = meta.denominators.find((d: Any) => d.id === 'local-total-revenue');
  const fedNew = {
    id: 'federal-tax-contributions',
    label: 'Federal taxes and Employment Insurance premiums, FY2024-25',
    definition:
      'Total tax revenues (income taxes, GST, energy taxes, customs duties, other excise taxes and duties) + Employment Insurance premiums + pollution pricing proceeds, from the consolidated statement of revenues and expenses. Leaves out non-tax revenue (Crown-corporation profits, investment income, fees and other program revenues: C$49,164.4 million) and the Canada and Québec Pension Plan accounts.',
    levelIds: ['federal'],
    amount: 461786.7,
    scale: 'million',
    currency: 'CAD',
    period: fed.period,
    sourceId: 'pac-2025-v2-s1',
    locator: 'Consolidated statement of revenues and expenses – Total tax revenues + Employment insurance premiums + Pollution pricing proceeds',
    calculation: 'Published lines: 416,704.7 + 31,530.2 + 13,551.8 = 461,786.7 (C$ millions). Total revenues 510,951.1 minus other (non-tax) revenues 49,164.4.',
    caveat: 'Accrual-basis consolidated figures; the FY2025-26 audited Public Accounts had not been tabled at the date checked.',
    accessed: TODAY,
  };
  const cpp = {
    id: 'cpp-contributions',
    label: 'Canada Pension Plan contributions, FY2023-24',
    definition: 'Contributions (base and additional CPP) paid into the CPP Account. The plan is outside the federal budgetary accounts; it is the largest social-security scheme in Canada outside Québec.',
    levelIds: ['federal'],
    amount: 81600,
    scale: 'million',
    currency: 'CAD',
    period: { label: 'FY2023-24', kind: 'fiscal-year', start: '2023-04-01', end: '2024-03-31' },
    sourceId: 'esdc-cpp-annual-2024',
    locator: "Annual report highlights: 'CPP contributions totalled $81.6 billion'",
    caveat: 'One year older than the federal tax figures. The Québec Pension Plan and Québec parental insurance contributions are not itemised, so the national total is understated by that amount.',
    accessed: TODAY,
  };
  const provNew = {
    id: 'provincial-tax-contributions',
    label: 'Taxes and social contributions of provincial and territorial governments, 2024 reference year',
    definition:
      "Sum over the 13 provinces and territories of Statistics Canada's 'Taxes [11]' (401,768) and 'Social contributions [12]' (15,228). Leaves out federal transfers, resource royalties and other property income, sales of goods and services.",
    levelIds: ['provincial'],
    amount: 416996,
    scale: 'million',
    currency: 'CAD',
    period: prov.period,
    sourceId: 'statcan-10100017',
    locator: "Rows 'Taxes [11]' and 'Social contributions [12]', 'Transactions and other economic flows', reference year 2024, summed over 13 geographies",
    calculation: 'Sum of the 13 jurisdictions; duplicate rows shown under Stocks were excluded. 401,768 + 15,228 = 416,996 (C$ millions).',
    caveat: prov.caveat,
    accessed: TODAY,
  };
  const locNew = {
    id: 'local-tax-contributions',
    label: 'Taxes of municipal and local governments, 2024 reference year',
    definition: "Sum over the 13 provinces and territories of Statistics Canada's 'Taxes [11]' for municipalities and other local public administrations (there are no local social contributions). Leaves out user fees, transfers and other revenue.",
    levelIds: ['municipal'],
    amount: 80162,
    scale: 'million',
    currency: 'CAD',
    period: loc.period,
    sourceId: 'statcan-10100020',
    locator: "Row 'Taxes [11]', 'Transactions and other economic flows', reference year 2024, summed over 13 geographies",
    calculation: 'Sum of the 13 jurisdictions; duplicate Stocks rows excluded.',
    caveat: loc.caveat,
    accessed: TODAY,
  };
  meta.denominators = [fedNew, cpp, provNew, locNew];
  meta.sizing = {
    label: 'Taxes and compulsory social contributions of all levels of government',
    definition:
      'Federal taxes and EI premiums (FY2024-25) + Canada Pension Plan contributions (FY2023-24) + provincial and territorial taxes and social contributions (2024) + municipal taxes (2024). Excludes non-tax revenue, resource royalties, user fees and transfers between governments.',
    componentIds: ['federal-tax-contributions', 'cpp-contributions', 'provincial-tax-contributions', 'local-tax-contributions'],
  };
  // observations
  for (const g of rev.groups) {
    if (g.defaults.denominatorId === 'federal-total-revenue') g.defaults.denominatorId = 'federal-tax-contributions';
    if (g.defaults.denominatorId === 'provincial-total-revenue') {
      g.defaults.denominatorId = 'provincial-tax-contributions';
      g.defaults.role = 'sizing';
    }
    if (g.defaults.denominatorId === 'local-total-revenue') {
      g.defaults.denominatorId = 'local-tax-contributions';
      g.defaults.role = 'sizing';
    }
  }
  const cppGroup = groupOf(rev, 'fed-cpp');
  cppGroup.defaults.role = 'sizing';
  cppGroup.defaults.denominatorId = 'cpp-contributions';
  const cppObs = cppGroup.observations[0];
  cppObs.caveat = 'One fiscal year earlier than the Public Accounts figures because the FY2024-25 CPP annual report was not yet available. Excludes the Québec Pension Plan.';
  makeInformational(rev, ['prov-royalties'], 'Provincial resource royalties – not part of the tax total', 'Resource royalties are property income in Statistics Canada’s classification, not taxes, so they lie outside the national total and keep the neutral size.');
  makeInformational(rev, ['mun-user-fees'], 'Municipal user fees – not part of the tax total', 'User fees and utility charges are sales of goods and services, not taxes, so they lie outside the national total and keep the neutral size.');
});

/* ------------------------------------------------------- United States */
edit('united-states', (meta, rev, src) => {
  meta.sizing = {
    label: 'Taxes and social insurance contributions of federal, state and local governments',
    definition:
      'Federal receipts (taxes and social insurance, FY2025) + state tax collections (FY2024) + local tax revenue (FY2024). Excludes intergovernmental grants and non-tax revenue such as charges, utilities and insurance-trust income of state and local governments.',
    componentIds: ['federal-total-receipts', 'state-tax-collections', 'local-tax-revenue'],
  };
  setRole(rev, 'state-tax-collections', 'sizing');
  setRole(rev, 'local-tax-revenue', 'sizing');
  addOecdRs(src, '6.38', 'United States');
});

/* --------------------------------------------------------------- Japan */
edit('japan', (meta, rev, src) => {
  meta.denominators.push({
    id: 'social-insurance-premiums',
    label: 'Social insurance premiums (insured persons and employers), FY2023',
    definition: 'Compulsory premiums for health, long-term care, pensions, employment and workers’ accident insurance, in the ILO-standard social security revenue by source: insured persons ¥42.02 trillion + employers ¥38.09 trillion.',
    levelIds: ['national'],
    amount: 80.1101,
    scale: 'trillion',
    currency: 'JPY',
    period: { label: 'FY2023', kind: 'fiscal-year', start: '2023-04-01', end: '2024-03-31' },
    sourceId: 'ipss-ss-cost-2023',
    locator: '概要: 社会保障財源 – 社会保険料 80兆1,101億円',
    caveat: 'Premiums are compulsory contributions, counted in the OECD definition of total taxation. FY2023 is the latest edition and is two fiscal years older than the national tax figures.',
    accessed: TODAY,
  });
  meta.sizing = {
    label: 'Taxes and compulsory social insurance premiums of all levels of government and the social insurance schemes',
    definition:
      'National general-account taxes (FY2025) + prefectural taxes (FY2024) + municipal taxes (FY2024) + social insurance premiums (FY2023). Excludes non-tax revenue, local allocation tax and other transfers.',
    componentIds: ['national-general-account-tax', 'prefectural-tax-total', 'municipal-tax-total', 'social-insurance-premiums'],
  };
  setRole(rev, 'prefectural-tax-total', 'sizing');
  setRole(rev, 'municipal-tax-total', 'sizing');
  const g = groupOf(rev, 'nat-social-insurance');
  g.defaults.role = 'sizing';
  g.defaults.denominatorId = 'social-insurance-premiums';
  const o = g.observations[0];
  o.caveat = 'Premiums are not taxes but are compulsory and are counted in the national total. FY2023 is the latest edition and is two fiscal years older than the tax figures.';
  addOecdRs(src, '6.20', 'Japan');
});

/* -------------------------------------------------------------- Brazil */
edit('brazil', (meta, _rev, src) => {
  const d = meta.denominators[0];
  meta.sizing = {
    label: 'Tax revenue of the Union, states and municipalities (Carga Tributária Bruta)',
    definition: d.definition,
    componentIds: ['total-tax-burden'],
  };
  if (!src.sources.some((s: Any) => s.id === 'oecd-rs-lac-2025-note'))
    src.sources.push(
      oecdSource('oecd-rs-lac-2025-note', {
        title: 'Revenue Statistics in Latin America and the Caribbean 2025: Brazil (country note)',
        url: 'https://www.oecd.org/content/dam/oecd/en/publications/reports/2025/05/revenue-statistics-in-latin-america-and-the-caribbean-2025-country-notes_29961c77/brazil_b08e62db/f6a5cb34-en.pdf',
        publishedDate: '2025-05-27',
        periodCovered: 'Calendar year 2023',
        note: 'Tax-to-GDP ratio and tax structure by OECD heading, national currency.',
      }),
      oecdSource('oecd-rs-lac-2025-levels', {
        title: 'Revenue Statistics in Latin America and the Caribbean 2025, Table 1.4: attribution of tax revenue to sub-sectors of general government',
        url: LAC_CH1,
        publishedDate: '2025-05-27',
        periodCovered: 'Calendar year 2023',
        note: 'Share of central, state, local government and social security funds in total tax revenue.',
      }),
    );
});

/* -------------------------------------------------------------- Mexico */
edit('mexico', (meta, rev, src) => {
  const itemised = ['fed-isr', 'fed-iva', 'fed-ieps-fuels', 'fed-ieps-other', 'fed-importaciones', 'fed-isan', 'fed-cuotas-seguridad-social'];
  const sum = itemised.reduce((s, id) => s + findObs(rev, id).amount, 0);
  const old = meta.denominators[0];
  const fed = {
    id: 'federal-taxes-contributions',
    label: 'Federal taxes and social security contributions itemised in the public account, 2025',
    definition: `Sum of the federal taxes and contributions for which the Cuenta Pública reports an amount: income tax (ISR), VAT (IVA), IEPS on fuels and other goods, import duties, the new-vehicle tax (ISAN) and IMSS/ISSSTE contributions. Leaves out oil revenue, federal fees (derechos), and the non-tax income of PEMEX, CFE and other public entities.`,
    levelIds: ['federal'],
    amount: Math.round(sum * 10) / 10,
    scale: 'million',
    currency: 'MXN',
    period: old.period,
    sourceId: old.sourceId,
    locator: old.locator,
    calculation: `Sum of the itemised lines: ${itemised.map((id) => findObs(rev, id).amount.toLocaleString('en')).join(' + ')} = ${sum.toLocaleString('en', { maximumFractionDigits: 1 })} (MXN millions). For context, total budgetary revenue of the public sector was MXN 8,228,666.3 million including oil and other non-tax income.`,
    caveat: 'Small federal taxes that the source does not itemise (surcharges, accessories, minor levies) are not in this sum, so shares are slightly overstated. Cash basis, 2025 preliminary account.',
    accessed: TODAY,
  };
  const state = {
    id: 'state-taxes-oecd-2023',
    label: 'State taxes (collecting government), 2023',
    definition: 'Tax revenue collected by state governments, OECD classification, before revenue sharing. The taxes themselves (payroll, vehicle ownership, lodging) have no national-source breakdown here, so they are not drawn as cores.',
    levelIds: [],
    aggregateOnly: true,
    amount: 256362,
    scale: 'million',
    currency: 'MXN',
    period: { label: '2023', kind: 'calendar-year', start: '2023-01-01', end: '2023-12-31' },
    sourceId: 'oecd-rs-2025-subsectors',
    locator: 'Table 6.25 Mexico – State/Regional – Total tax revenue (collecting government)',
    caveat: 'Two years older than the federal figures. Federal revenue-sharing transfers to states are not tax collections and are not included.',
    accessed: TODAY,
  };
  const local = {
    id: 'local-taxes-oecd-2023',
    label: 'Municipal taxes (collecting government), 2023',
    definition: 'Tax revenue collected by municipalities, OECD classification. Mostly property taxes; no national-source breakdown here, so no cores.',
    levelIds: [],
    aggregateOnly: true,
    amount: 97450,
    scale: 'million',
    currency: 'MXN',
    period: state.period,
    sourceId: 'oecd-rs-2025-subsectors',
    locator: 'Table 6.25 Mexico – Local government – Total tax revenue (collecting government)',
    caveat: 'Two years older than the federal figures.',
    accessed: TODAY,
  };
  meta.denominators = [fed, state, local];
  meta.sizing = {
    label: 'Taxes and social security contributions of all levels of government',
    definition:
      'Itemised federal taxes and IMSS/ISSSTE contributions (2025) + state taxes (OECD, 2023) + municipal taxes (OECD, 2023). Excludes oil revenue, federal and local fees, and revenue-sharing transfers from the federation to states and municipalities.',
    componentIds: ['federal-taxes-contributions', 'state-taxes-oecd-2023', 'local-taxes-oecd-2023'],
  };
  for (const g of rev.groups) if (g.defaults.denominatorId === 'public-sector-budget-revenue') g.defaults.denominatorId = 'federal-taxes-contributions';
  makeInformational(rev, ['fed-derechos', 'fed-hidrocarburos'], 'Non-tax federal revenue – outside the tax total', 'Federal fees and oil revenue are non-tax income, so they lie outside the national total and keep the neutral size.');
  addOecdRs(src, '6.25', 'Mexico');
});

/* ------------------------------------------------------------ Colombia */
edit('colombia', (meta, rev, src) => {
  const oecd2023 = { label: '2023', kind: 'calendar-year', start: '2023-01-01', end: '2023-12-31' };
  const mk = (id: string, label: string, definition: string, amount: number, locator: string, extra: Any = {}) => ({
    id,
    label,
    definition,
    levelIds: extra.levelIds ?? [],
    aggregateOnly: extra.aggregateOnly ?? false,
    amount,
    scale: 'million',
    currency: 'COP',
    period: oecd2023,
    sourceId: 'oecd-rs-2025-subsectors',
    locator,
    caveat: 'Two years older than the DIAN 2025 figures (about 15% nominal growth since), so the parts taken from the OECD are slightly understated relative to the DIAN total.',
    accessed: TODAY,
  });
  meta.denominators.push(
    mk('regional-taxes-oecd-2023', 'Departmental (regional) taxes, 2023', 'Tax revenue of departments, OECD classification (mainly excise-type consumption taxes and vehicle taxes). No national-source breakdown here, so no cores.', 15111585, 'Table 6.6 Colombia – State/Regional – Total tax revenue', { aggregateOnly: true }),
    mk('local-taxes-oecd-2023', 'Municipal taxes, 2023', 'Tax revenue of municipalities and districts, OECD classification (property, industry and commerce tax, others). No national-source breakdown here, so no cores.', 40340654, 'Table 6.6 Colombia – Local government – Total tax revenue', { aggregateOnly: true }),
    mk('social-security-oecd-2023', 'Social security contributions, 2023', 'Compulsory contributions to the public social-security schemes (OECD heading 2000).', 25378236, 'Table 6.6 Colombia – Social Security Funds – Total tax revenue', { levelIds: ['national'] }),
    mk('parafiscales-oecd-2023', 'Payroll (parafiscal) contributions, 2023', 'Taxes on payroll and workforce (OECD heading 3000): SENA, ICBF and family compensation funds.', 5025164, 'Table 6.6 Colombia – Central government – 3000 Taxes on payroll and workforce', { levelIds: ['national'] }),
  );
  meta.sizing = {
    label: 'Taxes and compulsory contributions of all levels of government',
    definition:
      'DIAN gross collection (2025) + departmental taxes, municipal taxes, social security contributions and payroll contributions (OECD, 2023). Excludes royalties (Sistema General de Regalías), non-tax revenue and transfers.',
    componentIds: ['dian-gross-collection', 'regional-taxes-oecd-2023', 'local-taxes-oecd-2023', 'social-security-oecd-2023', 'parafiscales-oecd-2023'],
  };
  rev.unavailable = rev.unavailable.filter((u: Any) => u.nodeId !== 'nat-seguridad-social' && u.nodeId !== 'nat-parafiscales');
  rev.groups.push({
    title: 'Social security and payroll contributions – OECD Revenue Statistics 2025, calendar year 2023',
    defaults: {
      scale: 'million',
      currency: 'COP',
      period: oecd2023,
      basis: 'OECD classification of taxes; collecting government',
      sourceId: 'oecd-rs-2025-subsectors',
      role: 'sizing',
      coverage: 'exact',
      accessed: TODAY,
    },
    observations: [
      { nodeId: 'nat-seguridad-social', denominatorId: 'social-security-oecd-2023', amount: 25378236, locator: 'Table 6.6 Colombia – Social Security Funds – 2000 Social security contributions', caveat: 'Two years older than the DIAN figures; taken from the OECD because the schemes publish no single comparable total.' },
      { nodeId: 'nat-parafiscales', denominatorId: 'parafiscales-oecd-2023', amount: 5025164, locator: 'Table 6.6 Colombia – Central government – 3000 Taxes on payroll and workforce', caveat: 'Two years older than the DIAN figures.' },
    ],
  });
  addOecdRs(src, '6.6', 'Colombia');
});

/* ------------------------------------------------------------- Bolivia */
edit('bolivia', (meta, rev, src) => {
  const oecd2023 = { label: '2023', kind: 'calendar-year', start: '2023-01-01', end: '2023-12-31' };
  const mk = (id: string, label: string, definition: string, amount: number, locator: string, extra: Any = {}) => ({
    id,
    label,
    definition,
    levelIds: extra.levelIds ?? [],
    aggregateOnly: extra.aggregateOnly ?? false,
    amount,
    scale: 'million',
    currency: 'BOB',
    period: oecd2023,
    sourceId: extra.sourceId ?? 'oecd-rs-lac-2025-note',
    locator,
    calculation: extra.calculation,
    caveat: 'Two years older than the SIN 2025 collection; taken from the OECD because the Bolivian institutions publish no comparable single figure.',
    accessed: TODAY,
  });
  meta.denominators.push(
    mk('customs-oecd-2023', 'Customs and import duties, 2023', 'Customs and import duties (OECD 5123), collected by the Aduana Nacional and not part of the SIN collection.', 4314, 'Country note, Summary of the tax structure: Customs and import duties', { levelIds: ['central'] }),
    mk('social-security-oecd-2023', 'Social security contributions, 2023', 'Compulsory social security contributions (OECD heading 2000).', 17908, 'Country note, Summary of the tax structure: Social security contributions', { levelIds: ['central'] }),
    mk('municipal-taxes-oecd-2023', 'Municipal taxes, 2023', 'Taxes of municipal governments (mainly property, vehicle and transfer taxes). No national-source breakdown here, so no cores.', 3349, 'Table 1.4: local government 4.5% of total tax revenue (BOB 74,419 million)', {
      aggregateOnly: true,
      sourceId: 'oecd-rs-lac-2025-levels',
      calculation: '4.5% × 74,419 = 3,349 (BOB millions), rounded.',
    }),
  );
  meta.sizing = {
    label: 'Taxes and compulsory contributions of all levels of government (partial)',
    definition:
      'SIN tax collection (2025) + customs duties, social security contributions and municipal taxes (OECD, 2023). Departmental hydrocarbon royalties and other central revenue that the OECD also counts as taxes are not included, so shares are somewhat overstated.',
    componentIds: ['sin-total-2025', 'customs-oecd-2023', 'social-security-oecd-2023', 'municipal-taxes-oecd-2023'],
  };
  rev.unavailable = rev.unavailable.filter((u: Any) => u.nodeId !== 'nat-aduana' && u.nodeId !== 'nat-seguridad-social');
  rev.groups.push({
    title: 'Customs and social security – OECD Revenue Statistics in Latin America and the Caribbean 2025, calendar year 2023',
    defaults: {
      scale: 'million',
      currency: 'BOB',
      period: oecd2023,
      basis: 'OECD classification of taxes; all levels of government',
      sourceId: 'oecd-rs-lac-2025-note',
      role: 'sizing',
      coverage: 'exact',
      accessed: TODAY,
    },
    observations: [
      { nodeId: 'nat-aduana', denominatorId: 'customs-oecd-2023', amount: 4314, locator: 'Country note, Summary of the tax structure: Customs and import duties', caveat: 'Two years older than the SIN figures.' },
      { nodeId: 'nat-seguridad-social', denominatorId: 'social-security-oecd-2023', amount: 17908, locator: 'Country note, Summary of the tax structure: Social security contributions', caveat: 'Two years older than the SIN figures.' },
    ],
  });
  if (!src.sources.some((s: Any) => s.id === 'oecd-rs-lac-2025-note'))
    src.sources.push(
      oecdSource('oecd-rs-lac-2025-note', {
        title: 'Revenue Statistics in Latin America and the Caribbean 2025: Bolivia (country note)',
        url: 'https://www.oecd.org/content/dam/oecd/en/publications/reports/2025/05/revenue-statistics-in-latin-america-and-the-caribbean-2025-country-notes_29961c77/bolivia_857aa47b/78b0c38c-en.pdf',
        publishedDate: '2025-05-27',
        periodCovered: 'Calendar year 2023',
        note: 'Tax-to-GDP ratio and tax structure by OECD heading, national currency (BOB millions): income 9,008; social security 17,908; property 570; goods and services 38,386; other 8,548; total 74,419.',
      }),
      oecdSource('oecd-rs-lac-2025-levels', {
        title: 'Revenue Statistics in Latin America and the Caribbean 2025, Table 1.4: attribution of tax revenue to sub-sectors of general government',
        url: LAC_CH1,
        publishedDate: '2025-05-27',
        periodCovered: 'Calendar year 2023',
        note: 'Bolivia: central government 71.4%, local government 4.5%, social security funds 24.1% of total tax revenue (no separate regional column).',
      }),
    );
});

/* ------------------------------------------------------- Canada (OECD) */
edit('canada', (_m, _r, src) => addOecdRs(src, '6.4', 'Canada'));
