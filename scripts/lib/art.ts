/**
 * Small procedural-art toolkit for the background generator: seeded random
 * numbers, value noise, marching-squares contours, smooth curves and ridge
 * fields. Pure functions, no dependencies.
 */
export function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const hashString = (s: string) => [...s].reduce((a, c) => (Math.imul(a, 31) + c.charCodeAt(0)) | 0, 7);
export const f1 = (n: number) => (Math.round(n * 10) / 10).toString();
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Value noise with smooth interpolation; deterministic for a given seed. */
export class Noise2D {
  private perm: number[];
  private vals: number[];
  constructor(seed: number) {
    const rnd = mulberry32(seed);
    this.perm = Array.from({ length: 512 }, (_, i) => i & 255);
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [this.perm[i], this.perm[j]] = [this.perm[j], this.perm[i]];
    }
    for (let i = 0; i < 256; i++) this.perm[i + 256] = this.perm[i];
    this.vals = Array.from({ length: 256 }, () => rnd());
  }
  private lattice(ix: number, iy: number) {
    return this.vals[this.perm[(this.perm[ix & 255] + iy) & 255]];
  }
  at(x: number, y: number): number {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    const fx = x - ix;
    const fy = y - iy;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const a = this.lattice(ix, iy);
    const b = this.lattice(ix + 1, iy);
    const c = this.lattice(ix, iy + 1);
    const d = this.lattice(ix + 1, iy + 1);
    return lerp(lerp(a, b, sx), lerp(c, d, sx), sy);
  }
  fbm(x: number, y: number, octaves = 4): number {
    let amp = 0.5;
    let freq = 1;
    let sum = 0;
    let norm = 0;
    for (let o = 0; o < octaves; o++) {
      sum += this.at(x * freq, y * freq) * amp;
      norm += amp;
      amp *= 0.5;
      freq *= 2;
    }
    return sum / norm;
  }
}

/** Catmull-Rom spline through the points, as an SVG path. */
export function smoothPath(pts: [number, number][], closed = false, tension = 0.5): string {
  if (pts.length < 2) return '';
  const p = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
  let d = `M${f1(p[1][0])} ${f1(p[1][1])}`;
  for (let i = 1; i < p.length - 2; i++) {
    const [x0, y0] = p[i - 1];
    const [x1, y1] = p[i];
    const [x2, y2] = p[i + 1];
    const [x3, y3] = p[i + 2];
    const c1x = x1 + ((x2 - x0) * tension) / 3;
    const c1y = y1 + ((y2 - y0) * tension) / 3;
    const c2x = x2 - ((x3 - x1) * tension) / 3;
    const c2y = y2 - ((y3 - y1) * tension) / 3;
    d += `C${f1(c1x)} ${f1(c1y)} ${f1(c2x)} ${f1(c2y)} ${f1(x2)} ${f1(y2)}`;
  }
  return d + (closed ? 'Z' : '');
}

/** Distance from a point to a polyline. */
export function distToPolyline(x: number, y: number, pts: [number, number][]): number {
  let best = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / len2));
    best = Math.min(best, Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy)));
  }
  return best;
}

/** Sum of Gaussian ridges along polylines (0–1+): the base of every topographic look. */
export function ridgeField(ridges: { pts: [number, number][]; sigma: number; height: number }[]) {
  return (x: number, y: number) => {
    let v = 0;
    for (const r of ridges) {
      const d = distToPolyline(x, y, r.pts);
      v += r.height * Math.exp(-(d * d) / (2 * r.sigma * r.sigma));
    }
    return v;
  };
}

/**
 * Marching squares: line segments for every iso-level of `field` over the box,
 * returned as one SVG path per level (M…L pairs).
 */
export function contours(field: (x: number, y: number) => number, box: [number, number, number, number], step: number, levels: number[]): string[] {
  const [x0, y0, x1, y1] = box;
  const cols = Math.ceil((x1 - x0) / step);
  const rows = Math.ceil((y1 - y0) / step);
  const grid: number[][] = [];
  for (let j = 0; j <= rows; j++) {
    const row: number[] = [];
    for (let i = 0; i <= cols; i++) row.push(field(x0 + i * step, y0 + j * step));
    grid.push(row);
  }
  const out: string[] = [];
  for (const lv of levels) {
    let d = '';
    const interp = (a: number, b: number) => (lv - a) / (b - a || 1e-9);
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const a = grid[j][i];
        const b = grid[j][i + 1];
        const c = grid[j + 1][i + 1];
        const dd = grid[j + 1][i];
        const idx = (a > lv ? 8 : 0) | (b > lv ? 4 : 0) | (c > lv ? 2 : 0) | (dd > lv ? 1 : 0);
        if (idx === 0 || idx === 15) continue;
        const X = x0 + i * step;
        const Y = y0 + j * step;
        const top: [number, number] = [X + interp(a, b) * step, Y];
        const right: [number, number] = [X + step, Y + interp(b, c) * step];
        const bottom: [number, number] = [X + interp(dd, c) * step, Y + step];
        const left: [number, number] = [X, Y + interp(a, dd) * step];
        const seg = (p: [number, number], q: [number, number]) => {
          d += `M${f1(p[0])} ${f1(p[1])}L${f1(q[0])} ${f1(q[1])}`;
        };
        switch (idx) {
          case 1:
          case 14:
            seg(left, bottom);
            break;
          case 2:
          case 13:
            seg(bottom, right);
            break;
          case 3:
          case 12:
            seg(left, right);
            break;
          case 4:
          case 11:
            seg(top, right);
            break;
          case 5:
            seg(left, top);
            seg(bottom, right);
            break;
          case 6:
          case 9:
            seg(top, bottom);
            break;
          case 7:
          case 8:
            seg(left, top);
            break;
          case 10:
            seg(left, bottom);
            seg(top, right);
            break;
        }
      }
    }
    out.push(d);
  }
  return out;
}

/** Ring of radial tick marks as a single path. */
export function tickRing(cx: number, cy: number, r: number, count: number, len: number, every = 5, longLen = len * 2): string {
  let d = '';
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const l = i % every === 0 ? longLen : len;
    d += `M${f1(cx + Math.cos(a) * r)} ${f1(cy + Math.sin(a) * r)}L${f1(cx + Math.cos(a) * (r + l))} ${f1(cy + Math.sin(a) * (r + l))}`;
  }
  return d;
}

/** Four-point star glint as a path. */
export function glint(x: number, y: number, r: number): string {
  const s = r * 0.16;
  return `M${f1(x)} ${f1(y - r)}L${f1(x + s)} ${f1(y - s)}L${f1(x + r)} ${f1(y)}L${f1(x + s)} ${f1(y + s)}L${f1(x)} ${f1(y + r)}L${f1(x - s)} ${f1(y + s)}L${f1(x - r)} ${f1(y)}L${f1(x - s)} ${f1(y - s)}Z`;
}
