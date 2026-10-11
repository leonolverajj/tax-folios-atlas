import { describe, expect, it } from 'vitest';
import { listCountryIds, loadBundle } from '../scripts/lib/load';
import { buildModel } from '../src/data/model';
import { MAIN_SHARE, REACH, treeMetrics } from '../src/trees/metrics';
import { TREE, chargeRadius, layoutTree } from '../src/trees/shape';

const ids = listCountryIds();

describe('chargeRadius (same area scale as the folio)', () => {
  it('is bounded and never decreases as the share grows', () => {
    expect(chargeRadius(0, 'revenue')).toBe(TREE.chargeMin);
    expect(chargeRadius(TREE.shareCap, 'revenue')).toBeCloseTo(TREE.chargeMax, 9);
    expect(chargeRadius(0.9, 'revenue')).toBeCloseTo(TREE.chargeMax, 9);
    let prev = -Infinity;
    for (let s = 0; s <= 0.5; s += 0.005) {
      const r = chargeRadius(s, 'revenue');
      expect(r).toBeGreaterThanOrEqual(prev);
      prev = r;
    }
  });

  it('is area-proportional above the floor: four times the share, twice the radius', () => {
    expect(chargeRadius(0.12, 'revenue') / chargeRadius(0.03, 'revenue')).toBeCloseTo(2, 9);
  });

  it('draws every charge the same size in "equal" mode and a charge with no share at the minimum', () => {
    expect(chargeRadius(0.2, 'equal')).toBe(TREE.equalR);
    expect(chargeRadius(null, 'equal')).toBe(TREE.equalR);
    expect(chargeRadius(null, 'revenue')).toBe(TREE.chargeMin);
  });
});

describe.each(ids)('%s skill tree', (id) => {
  const model = buildModel(loadBundle(id));
  const instruments = [...model.nodes.values()].filter((n) => n.kind === 'instrument');

  for (const mode of ['revenue', 'equal'] as const) {
    describe(`${mode} dots`, () => {
      const shape = layoutTree(model, mode);

      it('draws every node of the folio exactly once, joined to its real parent', () => {
        expect(shape.nodes.map((n) => n.id).sort()).toEqual([...model.nodes.keys()].sort());
        expect(shape.edges).toHaveLength(model.nodes.size - 1);
        for (const e of shape.edges) expect(model.nodes.get(e.to)!.parentId).toBe(e.from);
      });

      it('lets no two dots overlap', () => {
        const ns = shape.nodes;
        for (let i = 0; i < ns.length; i++) {
          for (let j = i + 1; j < ns.length; j++) {
            const d = Math.hypot(ns[i].x - ns[j].x, ns[i].y - ns[j].y);
            expect(d, `${ns[i].id} / ${ns[j].id}`).toBeGreaterThanOrEqual(ns[i].r + ns[j].r - 1e-6);
          }
        }
      });

      it('puts every charge on one of the shared ring radii, so trees are comparable', () => {
        for (const n of shape.nodes.filter((x) => x.kind === 'charge')) {
          const d = Math.hypot(n.x, n.y);
          expect(d).toBeCloseTo(TREE.ring0 + n.ring * TREE.ringStep, 6);
        }
        for (const n of shape.nodes.filter((x) => x.kind === 'level')) expect(Math.hypot(n.x, n.y)).toBeCloseTo(TREE.levelRing, 6);
      });

      it('keeps the whole tree inside the reported extent', () => {
        for (const n of shape.nodes) expect(Math.hypot(n.x, n.y) + n.r).toBeLessThanOrEqual(shape.extent);
      });
    });
  }

  it('sizes dots by area in proportion to the national share', () => {
    const shape = layoutTree(model, 'revenue');
    const sized = shape.nodes.filter((n) => n.share !== null && n.r > TREE.chargeMin + 1e-6 && n.r < TREE.chargeMax - 1e-6);
    for (const n of sized) {
      const k = (n.r * n.r) / n.share!;
      expect(k).toBeCloseTo((TREE.chargeMax * TREE.chargeMax) / TREE.shareCap, 6);
    }
  });

  it('counts consistently', () => {
    const m = treeMetrics(model);
    expect(m.charges).toBe(instruments.length);
    expect(m.byLevel.reduce((s, l) => s + l.charges, 0)).toBe(m.charges);
    expect(m.sized + m.unsized).toBe(m.charges);
    expect(m.main).toBeLessThanOrEqual(m.sized);
    expect(m.coverage).toBeLessThanOrEqual(1 + 1e-9);
    expect(m.levels).toBe(model.bundle.meta.levels.length);
    if (m.toReach !== null) {
      const shares = instruments.filter((n) => n.radiusSource === 'revenue').map((n) => n.revenue!.nationalShare!).sort((a, b) => b - a);
      const top = shares.slice(0, m.toReach).reduce((a, b) => a + b, 0);
      const fewer = shares.slice(0, m.toReach - 1).reduce((a, b) => a + b, 0);
      expect(top).toBeGreaterThanOrEqual(REACH - 1e-9);
      expect(fewer).toBeLessThan(REACH);
    } else {
      expect(m.coverage).toBeLessThan(REACH);
    }
    expect(MAIN_SHARE).toBe(0.01);
  });
});
