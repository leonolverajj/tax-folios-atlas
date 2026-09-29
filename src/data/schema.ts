/**
 * Shared data schema for every country folder.
 *
 * A country lives in `countries/<id>/` and is made of six files that a
 * researcher can edit without touching application code:
 *
 *   country.json       identity, currency, government levels, revenue denominators
 *   taxes.json         legal facts: instruments, parent links, rates, legal references
 *   revenue.json       revenue observations (amount, period, source) per instrument
 *   sources.json       registry of every document / dataset cited
 *   presentation.json  labels, glyphs and label placement (no facts here)
 *   layout.json        core positions and size overrides on the country's canvas
 *
 * This module is imported by the browser app AND by the Node validation script,
 * so it must not import anything browser- or Vite-specific.
 */
import { z } from 'zod';

export const GLYPHS = [
  'globe', 'landmark', 'city', 'town', 'person', 'coin', 'factory', 'cart', 'percent', 'flame',
  'drop', 'ship', 'scroll', 'shield', 'gem', 'oil', 'car', 'leaf', 'house', 'key', 'scale',
  'bank', 'bed', 'dice', 'wheat', 'bolt', 'heart', 'book', 'gear', 'wine', 'smoke', 'plane',
  'stamp', 'pickaxe', 'water', 'ledger',
] as const;
export type GlyphName = (typeof GLYPHS)[number];

export const CATEGORIES = [
  'tax',
  'social-contribution',
  'insurance-premium',
  'royalty',
  'customs-duty',
  'fee',
  'special-levy',
] as const;
export type Category = (typeof CATEGORIES)[number];

/**
 * Tax families follow the OECD classification of taxes (headings 1000-6000) but split the
 * two biggest headings the way readers think about them. Every instrument belongs to one;
 * they drive the charts and the country profile.
 */
export const FAMILIES = [
  'income-personal', // 1100
  'income-corporate', // 1200
  'income-mixed', // 1000 where one tax covers persons and companies (or cannot be split)
  'social-security', // 2000 (contributions and insurance premiums)
  'payroll', // 3000
  'property', // 4000 (incl. taxes on financial and capital transactions)
  'general-consumption', // 5110 VAT / sales / turnover taxes
  'specific-consumption', // 5120 excises and 5200 taxes on the use of goods (vehicle taxes)
  'trade', // 5123 customs and import duties
  'resource', // royalties and resource levies
  'other', // fees, licences, everything else
] as const;
export type Family = (typeof FAMILIES)[number];

export const OECD_HEADINGS = ['income', 'socialSecurity', 'payroll', 'property', 'goodsServices', 'other'] as const;
export type OecdHeading = (typeof OECD_HEADINGS)[number];
export const FAMILY_TO_HEADING: Record<Family, OecdHeading> = {
  'income-personal': 'income',
  'income-corporate': 'income',
  'income-mixed': 'income',
  'social-security': 'socialSecurity',
  payroll: 'payroll',
  property: 'property',
  'general-consumption': 'goodsServices',
  'specific-consumption': 'goodsServices',
  trade: 'goodsServices',
  resource: 'other',
  other: 'other',
};
export const FAMILY_LABEL: Record<Family, string> = {
  'income-personal': 'Personal income',
  'income-corporate': 'Corporate income',
  'income-mixed': 'Income (persons and companies)',
  'social-security': 'Social security',
  payroll: 'Payroll',
  property: 'Property',
  'general-consumption': 'General consumption (VAT / sales)',
  'specific-consumption': 'Excises',
  trade: 'Customs and trade',
  resource: 'Natural resources',
  other: 'Fees and other',
};

export const BRANCHES = ['national', 'regional', 'local'] as const;
export type Branch = (typeof BRANCHES)[number];

export const STATUSES = ['current', 'transitional', 'scheduled', 'historical'] as const;
export type Status = (typeof STATUSES)[number];

const idSchema = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'ids must be kebab-case (a-z, 0-9, -)');
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'dates must be YYYY-MM-DD');
const httpsUrl = z.string().url().refine((u) => u.startsWith('https://') || u.startsWith('http://'), 'url must be http(s)');
const text = z.string().min(1);
const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/);

/* -------------------------------------------------------------- sources */
export const sourceSchema = z.object({
  id: idSchema,
  org: text.describe('Publishing organisation'),
  title: text.describe('Document or dataset title'),
  url: httpsUrl,
  kind: z.enum(['legal', 'statistics', 'budget-report', 'tax-agency', 'international', 'guidance']),
  language: z.string().min(2).max(8).default('en'),
  publishedDate: isoDate.nullable().describe('Publication date; null only if the publisher gives none'),
  periodCovered: z.string().optional().describe('Fiscal / calendar period the document covers'),
  accessed: isoDate,
  nextExpected: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'use YYYY-MM')
    .optional()
    .describe('When the publisher is expected to release the next edition (YYYY-MM). Used by the update checklist.'),
  note: z.string().optional(),
});
export const sourcesFileSchema = z.object({ sources: z.array(sourceSchema).min(1) });
export type Source = z.infer<typeof sourceSchema>;

export const legalRefSchema = z.object({
  sourceId: idSchema,
  locator: z.string().optional().describe('Article / section / page within the source'),
  note: z.string().optional(),
});
export type LegalRef = z.infer<typeof legalRefSchema>;

/* ------------------------------------------------------------- periods */
export const periodSchema = z.object({
  label: text.describe('Human label, e.g. "FY2025" or "2024"'),
  kind: z.enum(['fiscal-year', 'calendar-year', 'estimate', 'forecast']),
  start: isoDate,
  end: isoDate,
});
export type Period = z.infer<typeof periodSchema>;

export const SCALES = { units: 1, thousand: 1e3, million: 1e6, billion: 1e9, trillion: 1e12 } as const;
export type Scale = keyof typeof SCALES;
const scaleSchema = z.enum(['units', 'thousand', 'million', 'billion', 'trillion']);

/* ------------------------------------------------------------ country */
export const levelSchema = z.object({
  id: idSchema,
  branch: z.enum(BRANCHES),
  names: z.object({
    official: text,
    native: z.string().optional(),
    common: text,
  }),
  description: text.describe('Plain-language description of what this level of government is'),
  fiscalPower: text.describe('How this level obtains tax revenue: own taxes, shared taxes, transfers'),
  legalRefs: z.array(legalRefSchema).min(1),
  checkedOn: isoDate,
});
export type Level = z.infer<typeof levelSchema>;

export const denominatorSchema = z.object({
  id: idSchema,
  label: text,
  definition: text.describe('Exactly what is included in this total'),
  levelIds: z.array(idSchema).default([]).describe('Government levels whose instruments this total covers'),
  aggregateOnly: z
    .boolean()
    .default(false)
    .describe('true = the level or scheme is part of the national total but its instruments are not drawn as cores (amount only)'),
  amount: z.number().positive(),
  scale: scaleSchema,
  currency: z.string().length(3),
  period: periodSchema,
  sourceId: idSchema,
  locator: text,
  calculation: z.string().optional(),
  caveat: z.string().optional(),
  accessed: isoDate,
});
export type Denominator = z.infer<typeof denominatorSchema>;

export const countrySchema = z.object({
  id: idSchema,
  iso3: z.string().length(3),
  isoNumeric: z.string().regex(/^\d{3}$/),
  names: z.object({ en: text, native: text, nativeLang: z.string() }),
  currency: z.object({ code: z.string().length(3), symbol: text, name: text }),
  summary: text.describe('Two or three sentences introducing the fiscal structure'),
  structureNote: z.string().optional().describe('Why the levels are named/arranged as they are'),
  theme: z.object({
    accent: hex,
    accent2: hex,
    motif: text.describe('Key used by the background generator'),
    motifNote: text.describe('One line explaining the geographic reference behind the motif'),
    mapLabel: z.object({ lon: z.number(), lat: z.number() }).optional().describe('Where to letter the name on the world map'),
  }),
  levels: z.array(levelSchema).min(1),
  supportingSourceIds: z.array(idSchema).default([]).describe('Sources cited for cross-checks and definitions rather than for a specific core'),
  denominators: z.array(denominatorSchema).min(1),
  sizing: z.object({
    label: text.describe('Name of the national total, e.g. "Tax and social-security revenue of all levels of government"'),
    definition: text.describe('Exactly what the national total contains and leaves out'),
    componentIds: z
      .array(idSchema)
      .min(1)
      .describe('Denominators (one per level or scheme) that add up to the national total. Orb size = amount / this sum.'),
    neutralRadius: z.number().positive().optional(),
  }),
  researchStatus: z.enum(['researched', 'partial', 'draft']).default('researched'),
});
export type CountryMeta = z.infer<typeof countrySchema>;

/* ------------------------------------------------------------- taxes */
export const rateSchema = z.object({
  kind: z.enum(['flat', 'progressive', 'range', 'specific', 'mechanism', 'varies']),
  headline: text.describe('Short statement shown on the panel, e.g. "10%–37% (7 brackets)"'),
  details: z.array(z.string()).default([]),
  asOf: isoDate.describe('Date for which the rate statement is valid'),
});
export type Rate = z.infer<typeof rateSchema>;

export const instrumentSchema = z.object({
  id: idSchema,
  parentId: idSchema.describe('A level id, or another instrument id'),
  levelId: idSchema,
  category: z.enum(CATEGORIES),
  family: z.enum(FAMILIES).describe('Tax family (OECD-aligned); drives charts and the country profile'),
  status: z.enum(STATUSES).default('current'),
  statusNote: z.string().optional(),
  names: z.object({
    official: text,
    native: z.string().optional(),
    common: text,
    abbreviation: z.string().optional(),
  }),
  taxes: z.object({
    base: text.describe('What is taxed'),
    payer: text.describe('Who bears / remits it'),
  }),
  rate: rateSchema,
  explanation: text,
  exceptions: z.array(z.string()).default([]),
  legalRefs: z.array(legalRefSchema).min(1),
  checkedOn: isoDate,
});
export type Instrument = z.infer<typeof instrumentSchema>;
export const taxesFileSchema = z.object({ instruments: z.array(instrumentSchema).min(1) });

/* ------------------------------------------------------------ revenue */
export const observationSchema = z.object({
  nodeId: idSchema,
  denominatorId: idSchema.optional().describe('Omit for informational amounts that are outside every declared denominator; no share is then computed'),
  amount: z.number().nonnegative(),
  scale: scaleSchema,
  currency: z.string().length(3),
  period: periodSchema,
  basis: text.describe('Accounting basis: cash receipts, net of refunds, accrual, etc.'),
  sourceId: idSchema,
  locator: text.describe('Table / page / series / line used'),
  calculation: z.string().optional().describe('Any addition or aggregation performed on published figures'),
  coverage: z.enum(['exact', 'broader', 'subset']).describe('exact = same scope as the core; broader = source category is wider than the core; subset = narrower'),
  coverageNote: z.string().optional(),
  aggregateKey: z.string().optional().describe('Set on cores that share one published total, to prevent double-counting'),
  role: z.enum(['sizing', 'informational']).default('sizing'),
  caveat: z.string().optional(),
  accessed: isoDate,
});
export type Observation = z.infer<typeof observationSchema>;

export const unavailableSchema = z.object({
  nodeId: idSchema,
  reason: text,
});
export type Unavailable = z.infer<typeof unavailableSchema>;

/**
 * revenue.json stores observations in groups. Each group may declare
 * `defaults` (period, currency, source, ...) that every row inherits, so the
 * period and source of a table are stated once.
 */
export const revenueGroupSchema = z.object({
  title: z.string().optional(),
  defaults: observationSchema.partial().default({}),
  observations: z.array(observationSchema.partial()).min(1),
});
export const revenueFileSchema = z.object({
  groups: z.array(revenueGroupSchema).min(1),
  unavailable: z.array(unavailableSchema).default([]),
});
export type RevenueFile = z.infer<typeof revenueFileSchema>;

/** Merge group defaults into each row and validate the result. */
export function flattenRevenue(file: RevenueFile): Observation[] {
  const out: Observation[] = [];
  for (const g of file.groups) {
    for (const row of g.observations) {
      out.push(observationSchema.parse({ ...g.defaults, ...row }));
    }
  }
  return out;
}
/* ------------------------------------------------------------ structure */
/**
 * structure.json: the harmonised, cross-country layer. It holds one reference year of the
 * OECD Revenue Statistics (or the OECD Latin America edition) so that seven countries can be
 * compared on the same year and definitions, independently of the newer national figures that
 * size the cores. Amounts are in the file's own currency/scale.
 */
const nonneg = z.number().nonnegative();
export const byTypeSchema = z.object({
  income: nonneg.describe('1000 Taxes on income, profits and capital gains'),
  socialSecurity: nonneg.describe('2000 Social security contributions'),
  payroll: nonneg.describe('3000 Taxes on payroll and workforce'),
  property: nonneg.describe('4000 Taxes on property'),
  goodsServices: nonneg.describe('5000 Taxes on goods and services'),
  other: z.number().describe('6000 Other taxes (may be negative where the source nets unallocated adjustments, as for Chile)'),
});
export type ByType = z.infer<typeof byTypeSchema>;

export const structureLevelSchema = z.object({
  key: z.enum(['central', 'regional', 'local', 'social-security']),
  label: text,
  folioLevelIds: z.array(idSchema).default([]).describe('Drawn levels of the folio this OECD sub-sector covers'),
  total: nonneg.optional().describe('Tax revenue collected by this sub-sector, in the file currency/scale'),
  share: z.number().min(0).max(100).optional().describe('% of total tax revenue, when the source gives only shares'),
  byType: byTypeSchema.optional(),
  note: z.string().optional(),
});
export type StructureLevel = z.infer<typeof structureLevelSchema>;

export const structureSchema = z.object({
  version: z.literal(1),
  referenceYear: z.number().int().min(1990).max(2100),
  currency: z.string().length(3),
  scale: scaleSchema,
  taxToGdp: z.number().min(0).max(100).nullable().describe('Total taxation (incl. social contributions) as % of GDP'),
  basis: text.describe('Attribution basis, e.g. "collecting government"'),
  levels: z.array(structureLevelSchema).min(1),
  totalByType: byTypeSchema.optional().describe('All levels together, when levels carry no byType'),
  sourceIds: z.array(idSchema).min(1),
  subnational: z
    .object({
      ownSourceTaxShareOfRevenue: z.number().min(0).max(100).nullable().describe('Taxes as % of subnational governments\' total revenue'),
      grantsShareOfRevenue: z.number().min(0).max(100).nullable().describe('Grants and transfers as % of subnational governments\' total revenue'),
      year: z.number().int().nullable(),
      sourceId: idSchema.optional(),
      note: z.string().optional(),
    })
    .optional(),
  notes: z.array(z.string()).default([]),
});
export type Structure = z.infer<typeof structureSchema>;

/**
 * profiles/<id>.json: a country that has the harmonised layer but no folio yet. It appears in the
 * Fighters screen only. When its folio is built, the structure moves to countries/<id>/structure.json.
 */
export const profileSchema = z.object({
  version: z.literal(1),
  id: idSchema,
  iso3: z.string().length(3),
  isoNumeric: z.string().regex(/^\d{3}$/),
  names: z.object({ en: text, native: text, nativeLang: z.string() }),
  accent: hex,
  flag: z.array(hex).min(2).max(4).describe('Flag colours, used to dress the fighter (decoration only)'),
  structure: structureSchema,
  sources: z.array(sourceSchema).min(1),
});
export type ProfileFile = z.infer<typeof profileSchema>;

/* ------------------------------------------------------- presentation */
export const presentationSchema = z.object({
  nodes: z.record(
    idSchema,
    z.object({
      label: text.max(30),
      sublabel: z.string().max(40).optional(),
      glyph: z.enum(GLYPHS),
      labelSide: z.enum(['below', 'above', 'left', 'right']).optional(),
    }),
  ),
});
export type Presentation = z.infer<typeof presentationSchema>;

/* ------------------------------------------------------------- layout */
export const layoutSchema = z.object({
  version: z.literal(1),
  canvas: z.object({ width: z.number().min(600).max(4000), height: z.number().min(400).max(3000) }),
  positions: z.record(idSchema, z.object({ x: z.number(), y: z.number() })),
  radii: z.record(idSchema, z.number().min(12).max(160)).default({}),
});
export type Layout = z.infer<typeof layoutSchema>;

export type CountryBundle = {
  meta: CountryMeta;
  instruments: Instrument[];
  observations: Observation[];
  unavailable: Unavailable[];
  sources: Source[];
  presentation: Presentation;
  layout: Layout;
  structure?: Structure;
  backgroundUrl?: string;
};

