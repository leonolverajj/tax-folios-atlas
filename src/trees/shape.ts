/**
 * The skill tree of one country: the folio's hierarchy (country, levels of government, charges)
 * laid out the same way for every country, so shapes can be compared by eye.
 *
 * Pure functions only (no DOM). The layout is a radial tidy tree:
 *  - the country sits in the middle and each level of government gets a sector of the circle
 *    whose angle is proportional to the room its charges need;
 *  - charges fill rings around the middle, biggest first, so the inner ring holds the biggest
 *    revenue sources and a sprawling tree simply grows more rings;
 *  - every country uses the same ring radii and the same size scale, so a bigger tree on the
 *    page is a bigger tree in the data.
 */
import { FAMILY_TO_HEADING, type Category, type Family, type OecdHeading } from '../data/schema';
import type { FolioModel, FolioNode, NodeBranch } from '../data/model';

export type SizeMode = 'revenue' | 'equal';

export const TREE = {
  rootR: 9,
  levelR: 6,
  chargeMin: 2.3,
  chargeMax: 10.5,
  /** Same cap as the folio: at 30% of the national total a node stops growing. */
  shareCap: 0.3,
  equalR: 4.2,
  gap: 2.4,
  levelRing: 36,
  ring0: 66,
  ringStep: 23,
  /** Smallest sector (degrees) a level of government may get, so its node and spokes stay readable. */
  minSector: 40,
  edgePad: 3,
} as const;

export interface TreeNode {
  id: string;
  parentId: string | null;
  kind: 'root' | 'level' | 'charge';
  branch: NodeBranch;
  levelId: string | null;
  x: number;
  y: number;
  r: number;
  label: string;
  /** Share of the national total, only for charges that are sized by revenue. */
  share: number | null;
  family: Family | null;
  heading: OecdHeading | null;
  category: Category | null;
  /** 0 = country, 1 = level, 2 = charge, 3 = charge that hangs from another charge, … */
  depth: number;
  /** Angle from the centre, radians (0 = east, clockwise on screen). */
  angle: number;
  ring: number;
}

export interface TreeEdge {
  from: string;
  to: string;
  branch: NodeBranch;
}

export interface TreeShape {
  nodes: TreeNode[];
  edges: TreeEdge[];
  /** Distance from the centre to the outer edge of the furthest node. */
  extent: number;
  rings: number;
}

/** Same area-proportional scale as the folio (radius = k × √share), with the same floor and cap. */
export function chargeRadius(share: number | null, mode: SizeMode): number {
  if (mode === 'equal') return TREE.equalR;
  if (share === null) return TREE.chargeMin;
  const k = TREE.chargeMax / Math.sqrt(TREE.shareCap);
  return Math.max(TREE.chargeMin, Math.min(TREE.chargeMax, k * Math.sqrt(Math.max(0, share))));
}

const shareOf = (n: FolioNode): number | null => (n.radiusSource === 'revenue' && n.revenue?.nationalShare !== undefined ? n.revenue.nationalShare : null);

const bySize = (a: FolioNode, b: FolioNode) => {
  const sa = shareOf(a) ?? -1;
  const sb = shareOf(b) ?? -1;
  return sb - sa || a.label.localeCompare(b.label);
};

const rad = (deg: number) => (deg * Math.PI) / 180;

export function layoutTree(model: FolioModel, mode: SizeMode = 'revenue'): TreeShape {
  const root = model.nodes.get(model.rootId)!;
  const levels = root.childIds.map((id) => model.nodes.get(id)!);

  const make = (n: FolioNode, kind: TreeNode['kind'], r: number, extra: Partial<TreeNode> = {}): TreeNode => ({
    id: n.id,
    parentId: n.parentId,
    kind,
    branch: n.branch,
    levelId: n.levelId,
    x: 0,
    y: 0,
    r,
    label: n.label,
    share: null,
    family: n.instrument?.family ?? null,
    heading: n.instrument ? FAMILY_TO_HEADING[n.instrument.family] : null,
    category: n.instrument?.category ?? null,
    depth: n.depth,
    angle: 0,
    ring: -1,
    ...extra,
  });

  const out: TreeNode[] = [make(root, 'root', TREE.rootR)];

  // Depth-first sequence of the charges of each level: parents before their own children, siblings biggest first.
  const sequence = (levelId: string): FolioNode[] => {
    const seq: FolioNode[] = [];
    const walk = (id: string) => {
      const kids = model.nodes
        .get(id)!
        .childIds.map((c) => model.nodes.get(c)!)
        .sort(bySize);
      for (const k of kids) {
        seq.push(k);
        walk(k.id);
      }
    };
    walk(levelId);
    return seq;
  };

  const seqs = levels.map((l) => sequence(l.id));
  const radii = seqs.map((seq) => seq.map((n) => chargeRadius(shareOf(n), mode)));
  const mass = radii.map((rs) => rs.reduce((s, r) => s + 2 * r + TREE.gap, 0));

  // Sector angles: proportional to the room the charges need, never below the minimum.
  const weights = mass.map((m) => Math.max(m, 70));
  const total = weights.reduce((a, b) => a + b, 0);
  let angles = weights.map((w) => (w / total) * 360);
  for (let pass = 0; pass < 4; pass++) {
    const small = angles.map((a) => a < TREE.minSector);
    if (!small.some(Boolean)) break;
    const fixed = small.reduce((s, f) => s + (f ? TREE.minSector : 0), 0);
    const rest = angles.reduce((s, a, i) => s + (small[i] ? 0 : a), 0);
    angles = angles.map((a, i) => (small[i] ? TREE.minSector : (a * (360 - fixed)) / rest));
  }

  // The first level (the national government) is centred at the top; the others follow clockwise.
  let cursor = -90 - angles[0] / 2;
  let maxRing = -1;
  let extent: number = TREE.rootR;

  levels.forEach((lvl, li) => {
    const a0 = rad(cursor);
    const span = rad(angles[li]);
    cursor += angles[li];
    const mid = a0 + span / 2;
    const lnode = make(lvl, 'level', TREE.levelR, {
      x: Math.cos(mid) * TREE.levelRing,
      y: Math.sin(mid) * TREE.levelRing,
      angle: mid,
    });
    out.push(lnode);
    extent = Math.max(extent, TREE.levelRing + TREE.levelR);

    // Fill rings: biggest charges on the inner ring, spilling outward when a ring is full.
    const rings: { n: FolioNode; r: number }[][] = [];
    let ring = 0;
    let used = 0;
    seqs[li].forEach((n, i) => {
      const r = radii[li][i];
      const w = 2 * r + TREE.gap;
      const arc = span * (TREE.ring0 + ring * TREE.ringStep) - 2 * TREE.edgePad;
      if (used > 0 && used + w > arc) {
        ring++;
        used = 0;
      }
      (rings[ring] ??= []).push({ n, r });
      used += w;
    });

    rings.forEach((group, k) => {
      if (!group) return;
      const R = TREE.ring0 + k * TREE.ringStep;
      const arc = span * R - 2 * TREE.edgePad;
      const widths = group.reduce((s, g) => s + 2 * g.r + TREE.gap, 0);
      // Spread the leftover room a little, then centre the block inside the sector.
      const extra = Math.min(Math.max(0, arc - widths) / group.length, 9);
      const block = widths + extra * group.length;
      let offset = (arc - block) / 2 + TREE.edgePad;
      for (const g of group) {
        const w = 2 * g.r + TREE.gap + extra;
        const ang = a0 + (offset + w / 2) / R;
        offset += w;
        const sh = shareOf(g.n);
        out.push(
          make(g.n, 'charge', g.r, {
            x: Math.cos(ang) * R,
            y: Math.sin(ang) * R,
            angle: ang,
            share: sh,
            ring: k,
          }),
        );
        extent = Math.max(extent, R + g.r);
      }
      maxRing = Math.max(maxRing, k);
    });
  });

  const edges: TreeEdge[] = out.filter((n) => n.parentId).map((n) => ({ from: n.parentId!, to: n.id, branch: n.branch }));
  return { nodes: out, edges, extent: Math.ceil(extent + 3), rings: maxRing + 1 };
}
