/* One-off: writes countries/<id>/structure.json from figures extracted from OECD Revenue Statistics 2025 (and the LAC 2025 edition) and adds the SNG-WOFI sources. Kept for provenance only: it records how the first data was imported. Do NOT re-run it, it would overwrite later edits. */
import fs from 'node:fs';
import path from 'node:path';
import { formatJson } from '../lib/format-json';

const ROOT = process.cwd();
const rd = (c: string, f: string) => JSON.parse(fs.readFileSync(path.join(ROOT, 'countries', c, f), 'utf8').replace(/^﻿/, ''));
const wr = (c: string, f: string, v: unknown) => fs.writeFileSync(path.join(ROOT, 'countries', c, f), formatJson(v), 'utf8');
type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any

const bt = (income: number, socialSecurity: number, payroll: number, property: number, goodsServices: number, other: number) => ({ income, socialSecurity, payroll, property, goodsServices, other });
const sum = (b: Any) => Object.values(b as Record<string, number>).reduce((s, v) => s + v, 0);

const SNG_DATE = '2022-10-24';
const sngSource = (slug: string, name: string, period: string) => ({
  id: 'sng-wofi-profile',
  org: 'OECD and United Cities and Local Governments (SNG-WOFI)',
  title: `World Observatory on Subnational Government Finance and Investment – country profile: ${name}`,
  url: `https://www.sng-wofi.org/country_profiles/${slug}.html`,
  kind: 'international',
  language: 'en',
  publishedDate: SNG_DATE,
  periodCovered: period,
  accessed: '2026-09-29',
  note: 'Subnational government revenue by category (tax revenue, grants and subsidies, tariffs and fees, property income, other) as % of total subnational revenue, 2022 edition.',
});

interface Spec {
  id: string;
  year: number;
  currency: string;
  scale: 'million' | 'billion';
  taxToGdp: number;
  basis: string;
  levels: Any[];
  totalByType?: Any;
  sourceIds: string[];
  subnational: Any;
  notes: string[];
  sng: { slug: string; name: string; period: string };
}

const specs: Spec[] = [
  {
    id: 'canada',
    year: 2023,
    currency: 'CAD',
    scale: 'million',
    taxToGdp: 34.8,
    basis: 'Collecting government',
    levels: [
      { key: 'central', label: 'Federal government', folioLevelIds: ['federal'], total: 441352, byType: bt(324560, 30294, 0, 0, 86498, 0) },
      { key: 'regional', label: 'Provinces and territories', folioLevelIds: ['provincial'], total: 387821, byType: bt(196036, 16515, 22086, 17661, 135523, 0) },
      { key: 'local', label: 'Municipalities', folioLevelIds: ['municipal'], total: 86192, byType: bt(0, 0, 0, 83173, 1623, 1396) },
      { key: 'social-security', label: 'Social security funds (CPP, QPP and similar)', folioLevelIds: [], total: 105165, byType: bt(0, 105165, 0, 0, 0, 0), note: 'Federal Employment Insurance premiums are attributed to the federal government in this classification; the Canada and Québec Pension Plans are the social security funds.' },
    ],
    sourceIds: ['oecd-rs-2025-subsectors', 'oecd-rs-2025-levels'],
    subnational: { ownSourceTaxShareOfRevenue: 50.3, grantsShareOfRevenue: 30.5, year: 2020, sourceId: 'sng-wofi-profile', note: 'Provinces: tax 55.5%, grants 23.8%. Municipalities: tax 37.3%, grants 47.3%.' },
    notes: [],
    sng: { slug: 'canada', name: 'Canada', period: '2020' },
  },
  {
    id: 'united-states',
    year: 2023,
    currency: 'USD',
    scale: 'million',
    taxToGdp: 25.6,
    basis: 'Collecting government',
    levels: [
      { key: 'central', label: 'Federal government', folioLevelIds: ['federal'], total: 2951123, byType: bt(2741982, 0, 0, 34902, 174239, 0) },
      { key: 'regional', label: 'States', folioLevelIds: ['states'], total: 1456983, byType: bt(644908, 0, 3827, 44987, 763261, 0) },
      { key: 'local', label: 'Local governments', folioLevelIds: ['local'], total: 1027472, byType: bt(61793, 0, 0, 725913, 239765, 0) },
      { key: 'social-security', label: 'Social security funds', folioLevelIds: [], total: 1670315, byType: bt(0, 1670315, 0, 0, 0, 0), note: 'Social Security, Medicare and unemployment insurance payroll taxes are attributed to the social security funds in this classification, although the folio draws them under the federal level.' },
    ],
    sourceIds: ['oecd-rs-2025-subsectors', 'oecd-rs-2025-levels'],
    subnational: { ownSourceTaxShareOfRevenue: 49.5, grantsShareOfRevenue: 27.9, year: 2020, sourceId: 'sng-wofi-profile', note: 'Tariffs and fees are a further 19.7% of subnational revenue; there is no general federal unconditional or equalisation grant.' },
    notes: [],
    sng: { slug: 'united_states_of_america', name: 'United States of America', period: '2020' },
  },
  {
    id: 'japan',
    year: 2023,
    currency: 'JPY',
    scale: 'billion',
    taxToGdp: 33.7,
    basis: 'Collecting government',
    levels: [
      { key: 'central', label: 'National government', folioLevelIds: ['national'], total: 77387, byType: bt(42560, 0, 0, 4579, 30243, 5) },
      { key: 'local', label: 'Prefectures and municipalities', folioLevelIds: ['prefectural', 'municipal'], total: 44621, byType: bt(22084, 0, 0, 11752, 10294, 491), note: 'The OECD classification does not separate prefectures (regional) from municipalities (local) for Japan.' },
      { key: 'social-security', label: 'Social insurance schemes', folioLevelIds: [], total: 78335, byType: bt(0, 78335, 0, 0, 0, 0) },
    ],
    sourceIds: ['oecd-rs-2025-subsectors', 'oecd-rs-2025-levels'],
    subnational: { ownSourceTaxShareOfRevenue: 48.6, grantsShareOfRevenue: 42.7, year: 2019, sourceId: 'sng-wofi-profile', note: 'Municipalities are 55% of subnational revenue and prefectures 45%. Includes the local allocation tax as grants.' },
    notes: [],
    sng: { slug: 'japan', name: 'Japan', period: '2019' },
  },
  {
    id: 'mexico',
    year: 2023,
    currency: 'MXN',
    scale: 'million',
    taxToGdp: 17.7,
    basis: 'Collecting government (taxes shared with states and municipalities stay with the federation)',
    levels: [
      { key: 'central', label: 'Federal government', folioLevelIds: ['federal'], total: 4532837, byType: bt(2514390, 0, 0, 0, 1946058, 72390) },
      { key: 'regional', label: 'States and Mexico City', folioLevelIds: ['states'], total: 256362, byType: bt(0, 0, 170286, 34547, 34018, 17510), note: 'On a beneficiary basis, which adds the federal taxes shared with states (participaciones), state tax revenue would be MXN 1,121,137 million.' },
      { key: 'local', label: 'Municipalities', folioLevelIds: ['municipalities'], total: 97450, byType: bt(0, 0, 2, 77426, 3038, 16984), note: 'On a beneficiary basis municipal tax revenue would be MXN 381,590 million.' },
      { key: 'social-security', label: 'Social security funds (IMSS, ISSSTE)', folioLevelIds: [], total: 761511, byType: bt(0, 761511, 0, 0, 0, 0) },
    ],
    sourceIds: ['oecd-rs-2025-subsectors', 'oecd-rs-2025-levels'],
    subnational: { ownSourceTaxShareOfRevenue: 7.4, grantsShareOfRevenue: 92.2, year: 2020, sourceId: 'sng-wofi-profile', note: 'States: tax 6.1%, grants 93.5%. Municipalities: tax 13.7%, grants 85.4%. Shared federal taxes (participaciones) count as grants.' },
    notes: [],
    sng: { slug: 'mexico', name: 'Mexico', period: '2020' },
  },
  {
    id: 'colombia',
    year: 2023,
    currency: 'COP',
    scale: 'million',
    taxToGdp: 22.1,
    basis: 'Collecting government',
    levels: [
      { key: 'central', label: 'National government', folioLevelIds: ['national'], total: 268969102, byType: bt(140176582, 0, 5025164, 14895042, 107682019, 1190296) },
      { key: 'regional', label: 'Departments', folioLevelIds: ['departmental'], total: 15111585, byType: bt(0, 0, 0, 0, 10712231, 4399354) },
      { key: 'local', label: 'Municipalities and districts', folioLevelIds: ['municipal'], total: 40340654, byType: bt(0, 0, 0, 11007128, 19782614, 9550912) },
      { key: 'social-security', label: 'Social security funds', folioLevelIds: [], total: 25378236, byType: bt(0, 25378236, 0, 0, 0, 0) },
    ],
    sourceIds: ['oecd-rs-2025-subsectors', 'oecd-rs-2025-levels'],
    subnational: { ownSourceTaxShareOfRevenue: 28.6, grantsShareOfRevenue: 60.2, year: 2020, sourceId: 'sng-wofi-profile', note: 'Transfers through the General Participation System (SGP) are the main source; 35% goes to departments and 65% to municipalities.' },
    notes: ['The OECD Latin America edition gives the same 2023 level split: central 76.9%, departments 4.3%, local 11.5%, social security 7.3%.'],
    sng: { slug: 'colombia', name: 'Colombia', period: '2020' },
  },
  {
    id: 'brazil',
    year: 2023,
    currency: 'BRL',
    scale: 'million',
    taxToGdp: 32.0,
    basis: 'Collecting government',
    levels: [
      { key: 'central', label: 'Union', folioLevelIds: ['federal'], share: 45.4 },
      { key: 'regional', label: 'States and Federal District', folioLevelIds: ['states'], share: 23.0 },
      { key: 'local', label: 'Municipalities', folioLevelIds: ['municipalities'], share: 6.4 },
      { key: 'social-security', label: 'Social security funds (INSS and similar)', folioLevelIds: [], share: 25.2 },
    ],
    totalByType: bt(940529, 874486, 0, 167650, 1415025, 76567),
    sourceIds: ['oecd-rs-lac-2025-note', 'oecd-rs-lac-2025-levels'],
    subnational: { ownSourceTaxShareOfRevenue: 43.6, grantsShareOfRevenue: 44.8, year: 2020, sourceId: 'sng-wofi-profile', note: 'States: tax 62.4%, grants 25%. Municipalities: grants 70.2%. Constitutionally shared federal taxes (FPE, FPM) count as grants.' },
    notes: ['The LAC country note folds payroll taxes into "other taxes"; payroll is shown as zero and "other" carries both.', 'OECD LAC 2026 (data for 2024) shows central 44.7%, states 26.6%, local 6.3%, social security 22.4%.'],
    sng: { slug: 'brazil', name: 'Brazil', period: '2020' },
  },
  {
    id: 'bolivia',
    year: 2023,
    currency: 'BOB',
    scale: 'million',
    taxToGdp: 23.9,
    basis: 'All levels of government',
    levels: [
      { key: 'central', label: 'Central government', folioLevelIds: ['central', 'departmental'], share: 71.4, note: 'The source gives no separate regional column; departmental taxes are inside the central figure.' },
      { key: 'local', label: 'Municipalities', folioLevelIds: ['municipal'], share: 4.5 },
      { key: 'social-security', label: 'Social security funds', folioLevelIds: [], share: 24.1 },
    ],
    totalByType: bt(9008, 17908, 0, 570, 38386, 8548),
    sourceIds: ['oecd-rs-lac-2025-note', 'oecd-rs-lac-2025-levels'],
    subnational: {
      ownSourceTaxShareOfRevenue: null,
      grantsShareOfRevenue: null,
      year: 2020,
      sourceId: 'sng-wofi-profile',
      note: 'Not comparable: the observatory counts nationally shared taxes (for example the VAT share, 24.1% of subnational tax revenue) as tax revenue (57.6% tax, 18.2% grants), yet states that more than 80% of subnational revenue corresponds to transfers made by the central government.',
    },
    notes: ['The LAC country note folds payroll taxes into "other taxes"; payroll is shown as zero and "other" carries both.'],
    sng: { slug: 'bolivia', name: 'Bolivia', period: '2020' },
  },
];

for (const s of specs) {
  // consistency checks against the printed totals
  let total = 0;
  for (const l of s.levels) {
    if (l.byType) {
      const d = Math.abs(sum(l.byType) - l.total);
      if (d > Math.max(3, l.total * 0.0005)) throw new Error(`${s.id}/${l.key}: components ${sum(l.byType)} vs total ${l.total}`);
    }
    if (l.total) total += l.total;
  }
  if (s.totalByType) console.log(`${s.id}: totalByType sum ${sum(s.totalByType)}`);
  else console.log(`${s.id}: total ${total} ${s.currency} ${s.scale}`);
  const shares = s.levels.map((l) => l.share).filter((x) => x !== undefined) as number[];
  if (shares.length) console.log(`   shares sum ${shares.reduce((a, b) => a + b, 0).toFixed(1)}`);
  const out: Any = {
    version: 1,
    referenceYear: s.year,
    currency: s.currency,
    scale: s.scale,
    taxToGdp: s.taxToGdp,
    basis: s.basis,
    levels: s.levels,
    ...(s.totalByType ? { totalByType: s.totalByType } : {}),
    sourceIds: s.sourceIds,
    subnational: s.subnational,
    notes: s.notes,
  };
  wr(s.id, 'structure.json', out);
  const src = rd(s.id, 'sources.json');
  if (!src.sources.some((x: Any) => x.id === 'sng-wofi-profile')) src.sources.push(sngSource(s.sng.slug, s.sng.name, s.sng.period));
  wr(s.id, 'sources.json', src);
}
