import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { COUNTRIES_DIR, listCountryIds, loadBundle } from '../scripts/lib/load';
import { FLOOR_SHARE, SIZE, buildModel, descendantsOf, nationalTotalOf, pathTo, radiusForShare, toBase } from '../src/data/model';

const ids = listCountryIds();

describe('radiusForShare (revenue-weighted size scale)', () => {
  it('is bounded by the documented minimum and maximum', () => {
    expect(radiusForShare(0)).toBe(SIZE.taxMin);
    expect(radiusForShare(-1)).toBe(SIZE.taxMin);
    expect(radiusForShare(SIZE.shareCap)).toBeCloseTo(SIZE.taxMax, 9);
    expect(radiusForShare(0.99)).toBeCloseTo(SIZE.taxMax, 9);
  });

  it('is area-proportional above the floor: four times the share means twice the radius', () => {
    expect(FLOOR_SHARE).toBeGreaterThan(0);
    expect(FLOOR_SHARE).toBeLessThan(0.05);
    const a = radiusForShare(0.03);
    const b = radiusForShare(0.12);
    expect(b / a).toBeCloseTo(2, 9);
    // area ratio equals share ratio
    expect((b * b) / (a * a)).toBeCloseTo(4, 9);
  });

  it('draws every share at or below the floor at the minimum radius', () => {
    expect(radiusForShare(FLOOR_SHARE)).toBeCloseTo(SIZE.taxMin, 9);
    expect(radiusForShare(FLOOR_SHARE / 3)).toBe(SIZE.taxMin);
  });

  it('keeps the neutral size below the smallest sized core, so "unknown" never looks bigger than a small tax', () => {
    expect(SIZE.taxNeutral).toBeGreaterThanOrEqual(SIZE.taxMin);
    expect(SIZE.taxNeutral).toBeLessThan(SIZE.taxMin * 1.5);
  });

  it('never decreases as the share grows', () => {
    let prev = -Infinity;
    for (let s = 0; s <= 0.6; s += 0.005) {
      const r = radiusForShare(s);
      expect(r).toBeGreaterThanOrEqual(prev);
      prev = r;
    }
  });
});

describe.each(ids)('%s folio model', (id) => {
  const bundle = loadBundle(id);
  const model = buildModel(bundle);

  it('has one node per country, level and instrument, and a tree of edges', () => {
    const expected = 1 + bundle.meta.levels.length + bundle.instruments.length;
    expect(model.nodes.size).toBe(expected);
    expect(model.edges.length).toBe(expected - 1);
    expect(model.order.length).toBe(expected);
  });

  it('draws an edge only where the data has a parent-child link', () => {
    for (const e of model.edges) {
      const child = model.nodes.get(e.to)!;
      expect(child.parentId).toBe(e.from);
      expect(model.nodes.get(e.from)!.childIds).toContain(e.to);
    }
    // and every non-root node is the child of exactly one edge
    const targets = model.edges.map((e) => e.to);
    expect(new Set(targets).size).toBe(targets.length);
    for (const n of model.nodes.values()) if (n.id !== model.rootId) expect(targets).toContain(n.id);
  });

  it('reaches every node from the country core', () => {
    const reach = new Set([model.rootId, ...descendantsOf(model, model.rootId)]);
    expect(reach.size).toBe(model.nodes.size);
    for (const n of model.nodes.values()) expect(pathTo(model, n.id)[0]).toBe(model.rootId);
  });

  it('sizes every core against ONE national total, computed from amount / total and never stored', () => {
    const nat = nationalTotalOf(bundle.meta);
    expect(model.sizing.national.amountBase).toBeCloseTo(nat.amountBase, 3);
    for (const n of model.nodes.values()) {
      if (n.kind !== 'instrument') continue;
      if (n.radiusSource === 'revenue') {
        const rev = n.revenue!;
        expect(bundle.meta.sizing.componentIds).toContain(rev.denominator!.id);
        const share = toBase(rev.observation.amount, rev.observation.scale) / nat.amountBase;
        expect(rev.nationalShare).toBeCloseTo(share, 12);
        expect(n.r).toBeCloseTo(radiusForShare(share), 9);
        expect(n.r).toBeGreaterThanOrEqual(SIZE.taxMin);
        expect(n.r).toBeLessThanOrEqual(SIZE.taxMax + 1e-9);
      } else if (n.radiusSource === 'neutral') {
        expect(n.r).toBe(SIZE.taxNeutral);
        expect(n.revenue?.nationalShare).toBeUndefined();
      }
    }
  });

  it('makes a bigger amount always a bigger (or equal) core, across every level of government', () => {
    const sized = [...model.nodes.values()].filter((n) => n.radiusSource === 'revenue');
    sized.sort((a, b) => a.revenue!.amountBase - b.revenue!.amountBase);
    for (let i = 1; i < sized.length; i++) expect(sized[i].r).toBeGreaterThanOrEqual(sized[i - 1].r - 1e-9);
  });

  it('keeps the shares of the cores within each part, and within the whole, at or below 100 %', () => {
    const perPart = new Map<string, number>();
    let whole = 0;
    for (const n of model.nodes.values()) {
      const r = n.revenue;
      if (n.radiusSource !== 'revenue' || !r?.denominator || r.share === undefined) continue;
      perPart.set(r.denominator.id, (perPart.get(r.denominator.id) ?? 0) + r.share);
      whole += r.nationalShare!;
    }
    for (const [den, sum] of perPart) expect(sum, den).toBeLessThanOrEqual(1 + 1e-9);
    expect(whole).toBeLessThanOrEqual(1 + 1e-9);
  });

  it('gives aggregate-only parts no cores', () => {
    for (const d of bundle.meta.denominators.filter((x) => x.aggregateOnly)) {
      expect(bundle.observations.some((o) => o.denominatorId === d.id)).toBe(false);
    }
  });

  it('does not store derived shares in the data files', () => {
    const text = fs.readFileSync(path.join(COUNTRIES_DIR, id, 'revenue.json'), 'utf8');
    expect(text).not.toMatch(/"share"\s*:/);
  });
});
