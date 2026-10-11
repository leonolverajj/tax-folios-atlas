/**
 * What can be counted on a tree. Every figure here is a count or a share taken from the folio
 * model (so from the same documented numbers that size the cores). Nothing is scored.
 *
 * Counts describe the charges DRAWN in a folio (docs/METHODOLOGY.md §3 states the rule for what
 * gets a core); they say how many separate things a reader meets, not how hard they are to comply with.
 */
import { FAMILY_TO_HEADING, type Family, type OecdHeading, type Structure } from '../data/schema';
import type { FolioModel, NodeBranch } from '../data/model';
import { levelShares, type LevelShare } from '../data/structureMath';

/** A charge that raises at least this share of the national total counts as a "main" charge. */
export const MAIN_SHARE = 0.01;
/** The share of national revenue used for "charges needed to reach …". */
export const REACH = 0.8;

export interface LevelCount {
  levelId: string;
  branch: NodeBranch;
  label: string;
  charges: number;
  /** Share of the national total raised by this level's sized charges (0–1). */
  share: number;
}

export interface TreeMetrics {
  /** Charges drawn (every core below a level of government). */
  charges: number;
  levels: number;
  byLevel: LevelCount[];
  /** Charges with their own revenue share. */
  sized: number;
  /** Charges drawn without a revenue-based size (no separate amount, or outside the tax total). */
  unsized: number;
  /** Charges that each raise at least MAIN_SHARE of the national total. */
  main: number;
  /** Smallest number of charges whose shares add up to REACH of the national total; null if the drawn charges explain less than that. */
  toReach: number | null;
  /** Share of the national total that the drawn, sized charges explain (0–1). */
  coverage: number;
  topShare: number | null;
  topId: string | null;
  /** Share of the national total raised by the smallest charge that has its own amount: how finely the folio is drawn. */
  smallest: number | null;
  /** Distinct tax families among the drawn charges. */
  families: Family[];
  headings: OecdHeading[];
  /** Levels of the tree: 2 = country → level → charge, 3 = at least one charge hangs from another charge. */
  depth: number;
  /** The number of charges that hang from another charge (surcharges, shares). */
  nested: number;
}

export function treeMetrics(model: FolioModel): TreeMetrics {
  const nodes = [...model.nodes.values()];
  const charges = nodes.filter((n) => n.kind === 'instrument');
  const sizedNodes = charges.filter((n) => n.radiusSource === 'revenue' && n.revenue?.nationalShare !== undefined);
  const shares = sizedNodes.map((n) => n.revenue!.nationalShare!).sort((a, b) => b - a);
  const coverage = shares.reduce((a, b) => a + b, 0);

  let toReach: number | null = null;
  if (coverage >= REACH - 1e-9) {
    let acc = 0;
    toReach = 0;
    for (const s of shares) {
      acc += s;
      toReach++;
      if (acc >= REACH - 1e-9) break;
    }
  }

  const levelNodes = nodes.filter((n) => n.kind === 'level');
  const byLevel: LevelCount[] = levelNodes.map((l) => {
    const mine = charges.filter((c) => c.levelId === l.id);
    const share = mine.reduce((s, c) => s + (c.radiusSource === 'revenue' ? c.revenue!.nationalShare! : 0), 0);
    return { levelId: l.id, branch: l.branch, label: l.label, charges: mine.length, share };
  });

  const top = sizedNodes.slice().sort((a, b) => b.revenue!.nationalShare! - a.revenue!.nationalShare!)[0];
  const families = [...new Set(charges.map((c) => c.instrument!.family))];
  const headings = [...new Set(families.map((f) => FAMILY_TO_HEADING[f]))];
  const maxDepth = charges.reduce((m, c) => Math.max(m, c.depth), 1);

  return {
    charges: charges.length,
    levels: levelNodes.length,
    byLevel,
    sized: sizedNodes.length,
    unsized: charges.length - sizedNodes.length,
    main: shares.filter((s) => s >= MAIN_SHARE).length,
    toReach,
    coverage,
    topShare: top ? top.revenue!.nationalShare! : null,
    topId: top ? top.id : null,
    smallest: shares.length ? shares[shares.length - 1] : null,
    families,
    headings,
    depth: maxDepth,
    nested: charges.filter((c) => c.depth > 2).length,
  };
}

/** Split of all tax and social contributions by sub-sector of government, from the harmonised OECD layer (one reference year). */
export interface CollectedBy {
  year: number;
  central: number;
  regional: number;
  local: number;
  socialSecurity: number;
  /** True when the source gives shares rather than amounts (OECD Latin America tables). */
  fromShares: boolean;
}

export function collectedBy(st: Structure | undefined): CollectedBy | null {
  if (!st) return null;
  const shares = levelShares(st);
  const get = (key: LevelShare['key']) => shares.find((l) => l.key === key)?.share ?? 0;
  return {
    year: st.referenceYear,
    central: get('central'),
    regional: get('regional'),
    local: get('local'),
    socialSecurity: get('social-security'),
    fromShares: st.levels.every((l) => l.total === undefined),
  };
}
