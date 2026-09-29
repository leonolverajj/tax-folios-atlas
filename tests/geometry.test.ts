import { describe, expect, it } from 'vitest';
import { edgeGeometry, hitRadius, nearestNeighbourDistance, socketFacing, type Disc } from '../src/data/geometry';

const near = (a: number, b: number, eps = 1e-9) => Math.abs(a - b) <= eps;

describe('socketFacing', () => {
  it('lies exactly on the rim, facing the partner', () => {
    const core: Disc = { x: 100, y: 200, r: 40 };
    for (const target of [
      { x: 500, y: 200 },
      { x: 100, y: -300 },
      { x: 333.3, y: 77.7 },
      { x: -50, y: 900 },
    ]) {
      const s = socketFacing(core, target);
      expect(near(Math.hypot(s.x - core.x, s.y - core.y), core.r)).toBe(true);
      // the socket, the centre and the target are collinear and the socket lies between them
      const cross = (s.x - core.x) * (target.y - core.y) - (s.y - core.y) * (target.x - core.x);
      expect(Math.abs(cross)).toBeLessThan(1e-6);
      const dot = (s.x - core.x) * (target.x - core.x) + (s.y - core.y) * (target.y - core.y);
      expect(dot).toBeGreaterThan(0);
    }
  });
});

describe('edgeGeometry', () => {
  it('runs socket to socket along the centre-to-centre segment', () => {
    const parent: Disc = { x: 0, y: 0, r: 96 };
    const child: Disc = { x: 300, y: 400, r: 30 };
    const g = edgeGeometry(parent, child);
    expect(g.hidden).toBe(false);
    const len = Math.hypot(child.x - parent.x, child.y - parent.y);
    expect(near(Math.hypot(g.b.x - g.a.x, g.b.y - g.a.y), len - parent.r - child.r, 1e-9)).toBe(true);
    // both sockets stay on the centre line
    for (const p of [g.a, g.b]) {
      const cross = p.x * child.y - p.y * child.x;
      expect(Math.abs(cross)).toBeLessThan(1e-6);
    }
  });

  it('follows the cores when they move (same function, new coordinates)', () => {
    const parent: Disc = { x: 800, y: 500, r: 62 };
    const before = edgeGeometry(parent, { x: 900, y: 500, r: 24 + 40 });
    const after = edgeGeometry(parent, { x: 800, y: 900, r: 24 + 40 });
    expect(near(before.a.angle, 0)).toBe(true);
    expect(near(after.a.angle, Math.PI / 2)).toBe(true);
    expect(near(after.a.x, 800) && near(after.a.y, 500 + 62)).toBe(true);
  });

  it('marks overlapping discs as hidden rather than drawing a negative line', () => {
    expect(edgeGeometry({ x: 0, y: 0, r: 50 }, { x: 60, y: 0, r: 30 }).hidden).toBe(true);
    expect(edgeGeometry({ x: 0, y: 0, r: 50 }, { x: 200, y: 0, r: 30 }).hidden).toBe(false);
  });
});

describe('hitRadius', () => {
  const discs = new Map<string, Disc>([
    ['a', { x: 0, y: 0, r: 20 }],
    ['b', { x: 100, y: 0, r: 20 }],
    ['far', { x: 5000, y: 0, r: 20 }],
  ]);

  it('never falls below the visible radius', () => {
    expect(hitRadius('a', discs, 10)).toBeGreaterThanOrEqual(20);
  });

  it('grows to a minimum touch size on screen when zoomed out', () => {
    // scale 0.5 => 22 px on screen is 44 world units
    expect(hitRadius('far', discs, 0.5)).toBeCloseTo(44, 6);
  });

  it('is capped so it can never swallow a neighbour', () => {
    const gap = nearestNeighbourDistance('a', discs); // 100 - 20 = 80
    expect(gap).toBe(80);
    const h = hitRadius('a', discs, 0.1);
    expect(h).toBeLessThanOrEqual(gap * 0.48 + 1e-9);
    // the two hit circles cannot overlap
    expect(h + hitRadius('b', discs, 0.1)).toBeLessThan(100);
  });
});
