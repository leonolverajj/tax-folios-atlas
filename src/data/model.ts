/**
 * Turns a validated CountryBundle into the graph the renderer draws.
 * Pure functions only (no DOM) so the same code runs in tests and in the
 * validation script.
 */
import {
  SCALES,
  type Branch,
  type Category,
  type CountryBundle,
  type Denominator,
  type GlyphName,
  type Instrument,
  type Level,
  type Observation,
  type Status,
} from './schema';

export type NodeKind = 'country' | 'level' | 'instrument';
export type NodeBranch = 'country' | Branch;

/**
 * Core sizes. A tax core's AREA is proportional to its share of the national total, so radius
 * = k * sqrt(share) with k = taxMax / sqrt(shareCap). Two honest limits:
 *  - below `floorShare` every core is drawn at taxMin so it stays visible and clickable;
 *  - at `shareCap` and above the radius stops growing so one giant tax cannot swallow the folio.
 * `taxNeutral` is used only for cores that have no tax-specific amount; it is deliberately
 * small, so "unknown" never looks bigger than a real small tax.
 */
export const SIZE = {
  countryRadius: 100,
  levelRadius: 68,
  taxMin: 18,
  taxMax: 64,
  taxNeutral: 22,
  shareCap: 0.3,
} as const;
/** Shares below this are drawn at the minimum radius (radius k*sqrt(share) would fall under taxMin). */
export const FLOOR_SHARE = (SIZE.taxMin / (SIZE.taxMax / Math.sqrt(SIZE.shareCap))) ** 2;

export interface DerivedRevenue {
  observation: Observation;
  /** Absent for informational amounts that lie outside every declared total. */
  denominator?: Denominator;
  /** amount / the level's own denominator, both in base units (only when a denominator exists). */
  share?: number;
  /** amount / the national total: the share that sets the core's size (only for sizing cores). */
  nationalShare?: number;
  amountBase: number;
  denominatorBase?: number;
}

/** The single total every sized core is measured against. */
export interface NationalTotal {
  label: string;
  definition: string;
  components: Denominator[];
  /** Sum of the components in base currency units. */
  amountBase: number;
  currency: string;
  /** Months between the earliest and the latest period end among the components. */
  periodSpreadMonths: number;
}

export interface FolioNode {
  id: string;
  kind: NodeKind;
  parentId: string | null;
  levelId: string | null;
  branch: NodeBranch;
  depth: number;
  childIds: string[];
  label: string;
  sublabel?: string;
  glyph: GlyphName;
  labelSide?: 'below' | 'above' | 'left' | 'right';
  category?: Category;
  status?: Status;
  x: number;
  y: number;
  r: number;
  radiusSource: 'structural' | 'revenue' | 'neutral' | 'override';
  revenue?: DerivedRevenue;
  unavailableReason?: string;
  level?: Level;
  instrument?: Instrument;
}

export interface FolioEdge {
  id: string;
  from: string;
  to: string;
  branch: NodeBranch;
}

export interface FolioModel {
  bundle: CountryBundle;
  nodes: Map<string, FolioNode>;
  /** Depth-first display order (used by outline + keyboard traversal). */
  order: string[];
  edges: FolioEdge[];
  rootId: string;
  canvas: { width: number; height: number };
  sizing: { national: NationalTotal; maxShare: number };
}

export const toBase = (amount: number, scale: keyof typeof SCALES): number => amount * SCALES[scale];

/** Area-proportional size scale: radius = k*sqrt(share), floored at taxMin and capped at taxMax. */
export function radiusForShare(share: number): number {
  const k = SIZE.taxMax / Math.sqrt(SIZE.shareCap);
  const r = k * Math.sqrt(Math.max(0, Math.min(share, SIZE.shareCap)));
  return Math.max(SIZE.taxMin, r);
}

const monthIndex = (iso: string) => {
  const [y, m] = iso.split('-').map(Number);
  return y * 12 + (m - 1);
};

/** Builds the national total from the components listed in country.json. */
export function nationalTotalOf(meta: CountryBundle['meta']): NationalTotal {
  const byId = new Map(meta.denominators.map((d) => [d.id, d]));
  const components = meta.sizing.componentIds.map((id) => {
    const d = byId.get(id);
    if (!d) throw new Error(`sizing.componentIds: denominator "${id}" not found`);
    return d;
  });
  const ends = components.map((d) => monthIndex(d.period.end));
  return {
    label: meta.sizing.label,
    definition: meta.sizing.definition,
    components,
    amountBase: components.reduce((s, d) => s + toBase(d.amount, d.scale), 0),
    currency: components[0].currency,
    periodSpreadMonths: Math.max(...ends) - Math.min(...ends),
  };
}

export function buildModel(bundle: CountryBundle): FolioModel {
  const { meta, instruments, observations, unavailable, presentation, layout } = bundle;
  const nodes = new Map<string, FolioNode>();
  const denominators = new Map(meta.denominators.map((d) => [d.id, d]));
  const national = nationalTotalOf(meta);
  const componentIds = new Set(meta.sizing.componentIds);

  const pos = (id: string) => layout.positions[id] ?? { x: layout.canvas.width / 2, y: layout.canvas.height / 2 };
  const pres = (id: string, fallbackLabel: string, fallbackGlyph: GlyphName) => {
    const p = presentation.nodes[id];
    return {
      label: p?.label ?? fallbackLabel,
      sublabel: p?.sublabel,
      glyph: p?.glyph ?? fallbackGlyph,
      labelSide: p?.labelSide,
    };
  };

  // Country core
  nodes.set(meta.id, {
    id: meta.id,
    kind: 'country',
    parentId: null,
    levelId: null,
    branch: 'country',
    depth: 0,
    childIds: [],
    ...pres(meta.id, meta.names.en, 'globe'),
    ...pos(meta.id),
    r: layout.radii[meta.id] ?? SIZE.countryRadius,
    radiusSource: layout.radii[meta.id] ? 'override' : 'structural',
  });

  for (const level of meta.levels) {
    nodes.set(level.id, {
      id: level.id,
      kind: 'level',
      parentId: meta.id,
      levelId: level.id,
      branch: level.branch,
      depth: 1,
      childIds: [],
      ...pres(level.id, level.names.common, 'landmark'),
      ...pos(level.id),
      r: layout.radii[level.id] ?? SIZE.levelRadius,
      radiusSource: layout.radii[level.id] ? 'override' : 'structural',
      level,
    });
    nodes.get(meta.id)!.childIds.push(level.id);
  }

  const levelBranch = new Map(meta.levels.map((l) => [l.id, l.branch]));
  const obsByNode = new Map(observations.map((o) => [o.nodeId, o]));
  const unavailableByNode = new Map(unavailable.map((u) => [u.nodeId, u.reason]));
  const defaultGlyph: Record<Category, GlyphName> = {
    tax: 'coin',
    'social-contribution': 'shield',
    'insurance-premium': 'heart',
    royalty: 'gem',
    'customs-duty': 'ship',
    fee: 'stamp',
    'special-levy': 'bolt',
  };

  // Instruments need their parents to exist first; resolve depth iteratively.
  const pending = [...instruments];
  let guard = pending.length * pending.length + 5;
  while (pending.length && guard-- > 0) {
    const inst = pending.shift()!;
    const parent = nodes.get(inst.parentId);
    if (!parent) {
      pending.push(inst);
      continue;
    }
    const obs = obsByNode.get(inst.id);
    const den = obs?.denominatorId ? denominators.get(obs.denominatorId) : undefined;
    let revenue: DerivedRevenue | undefined;
    if (obs) {
      const amountBase = toBase(obs.amount, obs.scale);
      if (den) {
        const denominatorBase = toBase(den.amount, den.scale);
        const isSizing = obs.role === 'sizing' && componentIds.has(den.id);
        revenue = {
          observation: obs,
          denominator: den,
          share: amountBase / denominatorBase,
          nationalShare: isSizing ? amountBase / national.amountBase : undefined,
          amountBase,
          denominatorBase,
        };
      } else {
        revenue = { observation: obs, amountBase };
      }
    }
    const sized = revenue?.nationalShare !== undefined;
    let r: number;
    let radiusSource: FolioNode['radiusSource'];
    if (sized) {
      r = radiusForShare(revenue!.nationalShare!);
      radiusSource = 'revenue';
    } else if (layout.radii[inst.id]) {
      r = layout.radii[inst.id];
      radiusSource = 'override';
    } else {
      r = meta.sizing.neutralRadius ?? SIZE.taxNeutral;
      radiusSource = 'neutral';
    }
    nodes.set(inst.id, {
      id: inst.id,
      kind: 'instrument',
      parentId: inst.parentId,
      levelId: inst.levelId,
      branch: levelBranch.get(inst.levelId) ?? 'national',
      depth: parent.depth + 1,
      childIds: [],
      ...pres(inst.id, inst.names.abbreviation ?? inst.names.common, defaultGlyph[inst.category]),
      category: inst.category,
      status: inst.status,
      ...pos(inst.id),
      r,
      radiusSource,
      revenue,
      unavailableReason: unavailableByNode.get(inst.id),
      instrument: inst,
    });
    parent.childIds.push(inst.id);
  }
  if (pending.length) throw new Error(`Unresolvable parents for: ${pending.map((p) => p.id).join(', ')}`);

  const order: string[] = [];
  const edges: FolioEdge[] = [];
  const walk = (id: string) => {
    order.push(id);
    const n = nodes.get(id)!;
    for (const c of n.childIds) {
      edges.push({ id: `${id}>${c}`, from: id, to: c, branch: nodes.get(c)!.branch });
      walk(c);
    }
  };
  walk(meta.id);

  const sized = [...nodes.values()].filter((n) => n.radiusSource === 'revenue');
  const maxShare = sized.reduce((m, n) => Math.max(m, n.revenue!.nationalShare!), 0);

  return {
    bundle,
    nodes,
    order,
    edges,
    rootId: meta.id,
    canvas: layout.canvas,
    sizing: { national, maxShare },
  };
}

/** Ids from the root down to `id`, inclusive. */
export function pathTo(model: FolioModel, id: string): string[] {
  const out: string[] = [];
  let cur: FolioNode | undefined = model.nodes.get(id);
  while (cur) {
    out.unshift(cur.id);
    cur = cur.parentId ? model.nodes.get(cur.parentId) : undefined;
  }
  return out;
}

export function descendantsOf(model: FolioModel, id: string): string[] {
  const out: string[] = [];
  const walk = (nid: string) => {
    for (const c of model.nodes.get(nid)!.childIds) {
      out.push(c);
      walk(c);
    }
  };
  walk(id);
  return out;
}

/** Amount of `share` per level, used for the level summary line. */
export function levelRevenueSummary(model: FolioModel, levelId: string) {
  const members = [...model.nodes.values()].filter((n) => n.levelId === levelId && n.kind === 'instrument');
  const withRev = members.filter((n) => n.radiusSource === 'revenue');
  const share = withRev.reduce((s, n) => s + n.revenue!.nationalShare!, 0);
  return { count: members.length, sized: withRev.length, share };
}
