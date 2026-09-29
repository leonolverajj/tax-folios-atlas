/**
 * Generates an INITIAL layout.json for countries that do not have one yet
 * (or for all countries with --force).
 *
 * Composition
 *  - The country core sits near the centre; each level core sits on a ring
 *    around it at an angle chosen per country (STYLES).
 *  - A level with few taxes becomes a compact constellation around its core.
 *    A level with many taxes fans them into wedge-shaped arcs around the
 *    country core, so large sets spread across the canvas instead of crowding.
 *  - A relaxation pass then separates the rectangles that cores AND their
 *    labels occupy, so every label has room when the whole folio is in view.
 *
 * The result is only a starting point: refine it by dragging cores in the
 * layout editor, which then owns the file.
 *
 *   npm run layouts:init                 only countries without layout.json
 *   npm run layouts:init -- --force      overwrite every layout
 *   npm run layouts:init -- brazil --force
 */
import fs from 'node:fs';
import path from 'node:path';
import { countryDir, listCountryIds, loadBundle, writeJson } from './lib/load';
import { buildModel } from '../src/data/model';

interface Style {
  center: [number, number];
  /** Degrees (0 = east, 90 = south, clockwise on screen) at which the FIRST level's sector is centred. */
  focusAngle: number;
  /** Optional per-level override of the angle of the level core (sectors still decide the wedge). */
  levelAngles: Record<string, number>;
  /** Distance of level cores from the country core (x stretched by `aspect`). */
  levelRadius: number | Record<string, number>;
  aspect: number;
  /** Levels with more than this many direct instruments use wedge arcs around the country core. */
  wedgeFrom: number;
  wedgeInner: number;
  wedgeStep: number;
  /** Radius of the innermost arc of a compact constellation. */
  arcRadius: number;
  fan: number;
  canvas: { width: number; height: number };
}

const DEFAULT: Style = {
  center: [800, 500],
  focusAngle: 200,
  levelAngles: {},
  levelRadius: 200,
  aspect: 1.55,
  wedgeFrom: 6,
  wedgeInner: 330,
  wedgeStep: 118,
  arcRadius: 170,
  fan: 120,
  canvas: { width: 1600, height: 1000 },
};

/** Per-country compositions (initial arrangement only; layout.json is the source of truth afterwards). */
export const STYLES: Record<string, Partial<Style>> = {
  canada: { center: [800, 510], focusAngle: 205, levelRadius: 215 },
  'united-states': { center: [790, 500], focusAngle: 195, levelRadius: 215 },
  brazil: { center: [830, 500], focusAngle: 198, levelRadius: 215, wedgeInner: 322, wedgeStep: 112 },
  mexico: { center: [770, 500], focusAngle: 210, levelRadius: 215 },
  colombia: { center: [830, 510], focusAngle: 200, levelRadius: 215, wedgeInner: 325 },
  japan: { center: [800, 500], focusAngle: 200, levelRadius: 215, wedgeInner: 322, wedgeStep: 112 },
  bolivia: { center: [800, 500], focusAngle: 200, levelRadius: 215 },
};

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rad = (deg: number) => (deg * Math.PI) / 180;
const clampN = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

function generate(id: string, force: boolean) {
  const dir = countryDir(id);
  const file = path.join(dir, 'layout.json');
  if (fs.existsSync(file) && !force) return false;
  const bundle = loadBundle(id, { layoutOptional: true });
  const style: Style = { ...DEFAULT, ...(STYLES[id] ?? {}) };
  const { width: W, height: H } = style.canvas;
  bundle.layout = { version: 1, canvas: style.canvas, positions: {}, radii: {} };
  const model = buildModel(bundle);
  const rnd = mulberry32([...id].reduce((a, c) => a + c.charCodeAt(0), 0));
  const [cx, cy] = style.center;

  type P = { x: number; y: number; r: number; hw: number; hx: number; hy: number; pinned: boolean };
  const pos = new Map<string, P>();
  const halfWidth = (nid: string, r: number) => {
    const n = model.nodes.get(nid)!;
    const text = n.kind === 'country' ? n.label.length * 12 : n.label.length * 8.4;
    return Math.max(r + 6, Math.min(text, 210) / 2 + 6);
  };
  const put = (nid: string, x: number, y: number, pinned = false) => {
    const n = model.nodes.get(nid)!;
    pos.set(nid, { x, y, r: n.r, hw: halfWidth(nid, n.r), hx: x, hy: y, pinned });
  };
  put(model.rootId, cx, cy, true);

  const root = model.nodes.get(model.rootId)!;
  const levels = root.childIds.map((lid) => model.nodes.get(lid)!);
  // Sectors of the circle proportional to how many taxes each level has; the first
  // level's sector is centred on `focusAngle` so big sets land where the canvas is wide.
  const weights = levels.map((l) => Math.pow(Math.max(1, l.childIds.length), 0.85) + 2);
  const totalW = weights.reduce((a, b) => a + b, 0);
  const widths = weights.map((w) => (w / totalW) * 360);
  let cursor = style.focusAngle - widths[0] / 2;
  const sectors = widths.map((w) => {
    const s = { start: cursor, width: w, mid: cursor + w / 2 };
    cursor += w;
    return s;
  });
  levels.forEach((lvl, li) => {
    const sector = sectors[li];
    const angle = style.levelAngles[lvl.id] ?? sector.mid;
    const R = typeof style.levelRadius === 'number' ? style.levelRadius : style.levelRadius[lvl.id] ?? 215;
    const lx = cx + Math.cos(rad(angle)) * R * style.aspect;
    const ly = cy + Math.sin(rad(angle)) * R;
    put(lvl.id, lx, ly, true);

    const tier1 = lvl.childIds.map((c) => model.nodes.get(c)!);
    const n = tier1.length;
    const place = (node: (typeof tier1)[number], x: number, y: number, a: number) => {
      put(node.id, x, y);
      node.childIds.forEach((cid, k) => {
        const a2 = a + (k - (node.childIds.length - 1) / 2) * 0.2;
        put(cid, x + Math.cos(a2) * 150, y + Math.sin(a2) * 150);
      });
    };

    if (n > style.wedgeFrom - 1 + 0 && n >= style.wedgeFrom) {
      // wedge arcs around the country core
      const half = clampN(sector.width / 2 - 6, 26, 120);
      const rings = Math.ceil(n / 6);
      const buckets: (typeof tier1)[] = Array.from({ length: rings }, () => []);
      tier1.forEach((node, i) => buckets[i % rings].push(node));
      buckets.forEach((bucket, ri) => {
        const Rk = style.wedgeInner + ri * style.wedgeStep;
        bucket.forEach((node, i) => {
          const t = bucket.length === 1 ? 0 : i / (bucket.length - 1) - 0.5;
          const step = bucket.length > 1 ? (2 * half) / (bucket.length - 1) : 0;
          const a = rad(sector.mid) + rad(t * 2 * half * 0.96 + (ri % 2 ? step * 0.5 : 0)) + (rnd() - 0.5) * 0.03;
          place(node, cx + Math.cos(a) * Rk * style.aspect, cy + Math.sin(a) * Rk, a);
        });
      });
    } else {
      // compact constellation around the level core, fanning away from the country core
      const out = (Math.atan2(ly - cy, lx - cx) * 180) / Math.PI;
      const rings = n <= 5 ? 1 : 2;
      const buckets: (typeof tier1)[] = Array.from({ length: rings }, () => []);
      tier1.forEach((node, i) => buckets[i % rings].push(node));
      buckets.forEach((bucket, ri) => {
        const ringR = style.arcRadius + ri * 130;
        const span = Math.min(rad(style.fan * 2), Math.max(rad(75), ((bucket.length - 1) * 160) / ringR));
        bucket.forEach((node, i) => {
          const t = bucket.length === 1 ? 0 : i / (bucket.length - 1) - 0.5;
          const a = rad(out) + t * span + (rnd() - 0.5) * 0.04;
          place(node, lx + Math.cos(a) * ringR * 1.1, ly + Math.sin(a) * ringR, a);
        });
      });
    }
  });

  // Relaxation on rectangles: each core owns [x ± hw] × [y − r, y + r + labelHeight].
  const LABEL_H = 46;
  const PAD = 10;
  const items = [...pos.values()];
  for (let iter = 0; iter < 900; iter++) {
    let moved = 0;
    for (let a = 0; a < items.length; a++) {
      for (let b = a + 1; b < items.length; b++) {
        const A = items[a];
        const B = items[b];
        if (A.pinned && B.pinned) continue;
        const ax0 = A.x - A.hw;
        const ax1 = A.x + A.hw;
        const ay0 = A.y - A.r;
        const ay1 = A.y + A.r + LABEL_H;
        const bx0 = B.x - B.hw;
        const bx1 = B.x + B.hw;
        const by0 = B.y - B.r;
        const by1 = B.y + B.r + LABEL_H;
        const ox = Math.min(ax1, bx1) - Math.max(ax0, bx0) + PAD;
        const oy = Math.min(ay1, by1) - Math.max(ay0, by0) + PAD;
        if (ox <= 0 || oy <= 0) continue;
        // also keep the discs themselves apart
        let dx = 0;
        let dy = 0;
        if (ox < oy) dx = (A.x < B.x ? -1 : 1) * ox;
        else dy = (A.y < B.y ? -1 : 1) * oy;
        moved += Math.abs(dx) + Math.abs(dy);
        const wa = A.pinned ? 0 : B.pinned ? 1 : 0.5;
        const wb = B.pinned ? 0 : A.pinned ? 1 : 0.5;
        A.x += dx * wa;
        A.y += dy * wa;
        B.x -= dx * wb;
        B.y -= dy * wb;
      }
    }
    for (const P of items) {
      if (P.pinned) continue;
      P.x += (P.hx - P.x) * 0.012;
      P.y += (P.hy - P.y) * 0.012;
      P.x = clampN(P.x, P.hw + 16, W - P.hw - 16);
      P.y = clampN(P.y, P.r + 14, H - P.r - LABEL_H - 10);
    }
    if (iter > 60 && moved < 0.5) break;
  }

  const positions: Record<string, { x: number; y: number }> = {};
  for (const [nid, P] of pos) positions[nid] = { x: Math.round(P.x), y: Math.round(P.y) };
  writeJson(file, { version: 1, canvas: style.canvas, positions, radii: {} });
  return true;
}

const args = process.argv.slice(2);
const force = args.includes('--force');
const only = args.filter((a) => !a.startsWith('-'));
for (const id of only.length ? only : listCountryIds()) {
  const wrote = generate(id, force);
  console.log(`${wrote ? 'wrote ' : 'kept  '} countries/${id}/layout.json`);
}
