/**
 * Pixel-art fighters, drawn procedurally on a 32x48 grid (original artwork; only the colours and a
 * small emblem allude to each country's flag). Two things on the sprite are DATA:
 *   - the belt is the country's tax mix (six OECD headings, in the chart colours);
 *   - the aura is the colour of its biggest tax heading.
 * Everything else (hair, clothes) is identity, not measurement.
 */
import type { OecdHeading } from '../data/schema';
import { HEADING_COLOR, HEADING_ORDER } from '../ui/charts';

export const W = 32;
export const H = 48;
const OUTLINE = '#0b1026';

type Px = (string | null)[][];
type HatStyle = 'short' | 'toque' | 'bandana' | 'topknot' | 'mask' | 'curls' | 'chullo' | 'brim';

export interface Look {
  skin: string;
  hair: string;
  hat: HatStyle;
  hatColors: [string, string, string];
  cloth: string;
  trim: string;
  pants: string;
  boots: string;
  glove: string;
  emblem?: { rows: string[]; colors: Record<string, string> };
  /** Cape bands, top to bottom, drawn behind the body. */
  cape?: string[];
  /** Horizontal poncho stripes replacing the plain shirt. */
  poncho?: string[];
}

const MAPLE = ['..#..', '.#.#.', '#####', '.###.', '..#..'];
const STAR = ['..#..', '#####', '.###.', '.#.#.', '#...#'];
const SUN = ['.###.', '#####', '#####', '#####', '.###.'];
const BALL = ['.###.', '#####', 'wwwww', '#####', '.###.'];
const TRICOLOUR = ['yyyyy', 'yyyyy', 'bbbbb', 'rrrrr', 'rrrrr'];
const DIAMOND = ['..#..', '.###.', '#####', '.###.', '..#..'];

export const LOOKS: Record<string, Look> = {
  canada: {
    skin: '#f0c9a4', hair: '#6b3f22', hat: 'toque', hatColors: ['#d8262c', '#ffffff', '#ffffff'],
    cloth: '#d8262c', trim: '#ffffff', pants: '#2a3352', boots: '#4a2f1e', glove: '#ffffff',
    emblem: { rows: MAPLE, colors: { '#': '#ffffff' } },
  },
  'united-states': {
    skin: '#e9b98f', hair: '#e8c56a', hat: 'bandana', hatColors: ['#d8262c', '#ffffff', '#ffffff'],
    cloth: '#1f3a8a', trim: '#ffffff', pants: '#1a2550', boots: '#8a1c22', glove: '#d8262c',
    emblem: { rows: STAR, colors: { '#': '#ffffff' } },
    cape: ['#1f3a8a', '#1f3a8a', '#1f3a8a', '#c4242b', '#ffffff', '#c4242b', '#ffffff'],
  },
  japan: {
    skin: '#f3d2ae', hair: '#15151d', hat: 'topknot', hatColors: ['#ffffff', '#d8262c', '#ffffff'],
    cloth: '#f4f4f0', trim: '#c9c9c2', pants: '#1f2a52', boots: '#5a3a26', glove: '#f4f4f0',
    emblem: { rows: SUN, colors: { '#': '#d8262c' } },
  },
  brazil: {
    skin: '#b57a52', hair: '#1a1210', hat: 'curls', hatColors: ['#1a1210', '#1a1210', '#1a1210'],
    cloth: '#f2c500', trim: '#0a8a3a', pants: '#0a8a3a', boots: '#f4f4f0', glove: '#0a8a3a',
    emblem: { rows: BALL, colors: { '#': '#1b3f9a', w: '#ffffff' } },
  },
  mexico: {
    skin: '#c58b5f', hair: '#1a1210', hat: 'mask', hatColors: ['#0a7a3c', '#ffffff', '#d8262c'],
    cloth: '#ffffff', trim: '#d8262c', pants: '#0a7a3c', boots: '#d8262c', glove: '#d8262c',
    emblem: { rows: DIAMOND, colors: { '#': '#0a7a3c' } },
  },
  colombia: {
    skin: '#c99468', hair: '#15151d', hat: 'brim', hatColors: ['#15151d', '#f4f4f0', '#15151d'],
    cloth: '#f2c500', trim: '#1b3f9a', pants: '#1b3f9a', boots: '#7a1c22', glove: '#c4242b',
    emblem: { rows: TRICOLOUR, colors: { y: '#f2c500', b: '#1b3f9a', r: '#c4242b' } },
    cape: ['#f2c500', '#f2c500', '#f2c500', '#f2c500', '#1b3f9a', '#1b3f9a', '#c4242b'],
  },
  bolivia: {
    skin: '#b98055', hair: '#15151d', hat: 'chullo', hatColors: ['#c4242b', '#f2c500', '#f4f4f0'],
    cloth: '#c4242b', trim: '#f2c500', pants: '#3a2a52', boots: '#5a3a26', glove: '#f2c500',
    poncho: ['#c4242b', '#c4242b', '#f2c500', '#f2c500', '#0a8a3a', '#0a8a3a'],
  },
};

const hashOf = (s: string) => [...s].reduce((a, c) => (Math.imul(a, 31) + c.charCodeAt(0)) >>> 0, 7);
const lum = (hex: string) => {
  const [r, g, b] = parse(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/**
 * A costume for a country without a hand-made one: deterministic (the same id always gives the same
 * fighter), dressed in the flag's colours. Skin, hair and hat are varied by the id and carry no meaning.
 */
function generated(id: string, flag: string[] = ['#8592b4', '#ffffff', '#2a3352']): Look {
  const h = hashOf(id);
  const skins = ['#f0c9a4', '#e9b98f', '#d9a577', '#c58b5f', '#a8714b', '#8a5a3a', '#f3d2ae'];
  const hairs = ['#15151d', '#3a2418', '#6b3f22', '#a5622b', '#e8c56a', '#c8c8d0'];
  const hats: HatStyle[] = ['short', 'bandana', 'curls', 'topknot', 'brim', 'toque', 'chullo'];
  // shirt = the flag colour that is neither near-white nor near-black, so the emblem and belt stay readable
  const mids = flag.filter((c) => lum(c) > 0.03 && lum(c) < 0.6);
  const cloth = mids[0] ?? flag[1] ?? flag[0];
  const trim = flag.find((c) => c !== cloth && lum(c) > 0.5) ?? '#ffffff';
  const pants = mix(cloth, '#0b1026', 0.62);
  const emblemColor = lum(cloth) > 0.35 ? '#0b1026' : '#ffffff';
  const hat = hats[h % hats.length];
  return {
    skin: skins[h % skins.length],
    hair: hairs[(h >>> 3) % hairs.length],
    hat,
    hatColors: [mids[1] ?? cloth, trim, flag[2] ?? trim],
    cloth,
    trim,
    pants,
    boots: mix(cloth, '#000000', 0.55),
    glove: trim,
    emblem: { rows: (h >>> 5) % 2 ? STAR : DIAMOND, colors: { '#': emblemColor } },
  };
}

export const lookFor = (id: string, flag?: string[]): Look => LOOKS[id] ?? generated(id, flag);

/* ------------------------------------------------------------- colour maths */
const parse = (hex: string): [number, number, number] => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};
const toHex = (c: number[]) => `#${c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')}`;
const mix = (hex: string, to: string, t: number) => {
  const a = parse(hex);
  const b = parse(to);
  return toHex(a.map((v, i) => v + (b[i] - v) * t));
};

/* ------------------------------------------------------------------- belt */
/** 12 pixel colours proportional to the tax mix; any heading with >= 2 % keeps at least one pixel. */
export function beltColors(mixShare: Record<OecdHeading, number>, width = 12): string[] {
  const order = HEADING_ORDER;
  const exact = order.map((h) => mixShare[h] * width);
  const px = exact.map((v) => Math.floor(v));
  let left = width - px.reduce((a, b) => a + b, 0);
  const rema = exact.map((v, i) => [v - Math.floor(v), i] as [number, number]).sort((a, b) => b[0] - a[0]);
  for (const [, i] of rema) {
    if (left <= 0) break;
    px[i]++;
    left--;
  }
  order.forEach((h, i) => {
    if (mixShare[h] >= 0.02 && px[i] === 0) {
      const big = px.indexOf(Math.max(...px));
      if (px[big] > 1) {
        px[big]--;
        px[i] = 1;
      }
    }
  });
  const out: string[] = [];
  order.forEach((h, i) => {
    for (let k = 0; k < px[i]; k++) out.push(HEADING_COLOR[h]);
  });
  return out;
}

/* --------------------------------------------------------------- sprite build */
function buffer(): Px {
  return Array.from({ length: H }, () => Array<string | null>(W).fill(null));
}
const put = (b: Px, x: number, y: number, c: string) => {
  if (x >= 0 && x < W && y >= 0 && y < H) b[y][x] = c;
};
const rect = (b: Px, x: number, y: number, w: number, h: number, c: string) => {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(b, x + i, y + j, c);
};

function build(look: Look, belt: string[], frame: 0 | 1): Px {
  const b = buffer();
  const dy = frame; // the upper body sinks a pixel on the second frame
  const dyArm = frame ? -1 : 0;
  // cape (behind everything)
  if (look.cape) {
    const bands = look.cape.length;
    for (let y = 20; y <= 42; y++) {
      const c = look.cape[Math.min(bands - 1, Math.floor(((y - 20) / 23) * bands))];
      rect(b, 4 - Math.floor((y - 20) / 9), y + (y < 30 ? dy : 0), 7 + Math.floor((y - 20) / 9), 1, c);
    }
  }
  // back arm
  rect(b, 7, 21 + dy, 3, 8, look.cloth);
  rect(b, 6, 28 + dy, 4, 4, look.glove);
  // legs and boots
  rect(b, 10, 31, 5, 10, look.pants);
  rect(b, 17, 31, 5, 10, look.pants);
  rect(b, 9, 41, 7, 3, look.boots);
  rect(b, 16, 41, 8, 3, look.boots);
  // torso
  rect(b, 10, 19 + dy, 12, 12, look.cloth);
  if (look.poncho) {
    for (let y = 19; y < 30; y++) rect(b, 10, y + dy, 12, 1, look.poncho[Math.floor((y - 19) / 2) % look.poncho.length]);
    for (let x = 10; x < 22; x += 2) put(b, x, 30 + dy, look.trim); // fringe
  } else {
    rect(b, 10, 19 + dy, 12, 1, look.trim); // collar
    rect(b, 10, 27 + dy, 12, 1, mix(look.cloth, '#000000', 0.18));
  }
  // belt = tax mix
  belt.forEach((c, i) => {
    put(b, 10 + i, 28 + dy, c);
    put(b, 10 + i, 29 + dy, mix(c, '#000000', 0.22));
  });
  rect(b, 10, 30 + dy, 12, 1, look.pants);
  // emblem
  if (look.emblem) {
    look.emblem.rows.forEach((row, j) => {
      [...row].forEach((ch, i) => {
        const c = look.emblem!.colors[ch];
        if (c) put(b, 13 + i, 21 + j + dy, c);
      });
    });
  }
  // front arm, extended into a guard
  rect(b, 21, 22 + dy + dyArm, 4, 3, look.cloth);
  rect(b, 25, 21 + dy + dyArm, 5, 5, look.glove);
  put(b, 26, 22 + dy + dyArm, mix(look.glove, '#ffffff', 0.35));
  // neck and head
  rect(b, 13, 18 + dy, 5, 2, look.skin);
  rect(b, 9, 6 + dy, 13, 12, look.skin);
  head(b, look, dy);
  return b;
}

function head(b: Px, look: Look, dy: number) {
  const [m, s, t] = look.hatColors;
  const Y = (y: number) => y + dy;
  switch (look.hat) {
    case 'short':
      rect(b, 9, Y(6), 13, 4, look.hair);
      rect(b, 9, Y(10), 3, 4, look.hair);
      break;
    case 'toque':
      rect(b, 9, Y(4), 13, 5, m);
      rect(b, 9, Y(8), 13, 2, s);
      rect(b, 14, Y(1), 4, 3, t);
      rect(b, 9, Y(10), 2, 4, look.hair);
      break;
    case 'bandana':
      rect(b, 9, Y(6), 13, 3, look.hair);
      rect(b, 9, Y(9), 13, 2, m);
      rect(b, 5, Y(9), 4, 2, m);
      rect(b, 4, Y(11), 3, 3, m);
      rect(b, 9, Y(11), 2, 3, look.hair);
      break;
    case 'topknot':
      rect(b, 9, Y(6), 13, 3, look.hair);
      rect(b, 9, Y(9), 2, 4, look.hair);
      rect(b, 14, Y(3), 4, 3, look.hair);
      rect(b, 9, Y(9), 13, 2, m);
      rect(b, 15, Y(9), 2, 2, s);
      break;
    case 'curls':
      rect(b, 8, Y(4), 15, 5, look.hair);
      for (const x of [9, 12, 15, 18, 21]) put(b, x, Y(3), look.hair);
      rect(b, 8, Y(9), 3, 5, look.hair);
      break;
    case 'chullo':
      rect(b, 9, Y(5), 13, 4, m);
      rect(b, 9, Y(7), 13, 1, s);
      for (let x = 9; x < 22; x += 2) put(b, x, Y(8), t);
      rect(b, 14, Y(2), 4, 3, s);
      rect(b, 8, Y(9), 3, 6, m);
      rect(b, 21, Y(9), 2, 5, m);
      put(b, 9, Y(11), t);
      put(b, 9, Y(13), t);
      break;
    case 'brim':
      rect(b, 12, Y(2), 8, 5, m);
      for (let y = 2; y <= 6; y++) for (let x = 12; x < 20; x += 2) put(b, x + (y % 2), Y(y), s);
      rect(b, 6, Y(7), 20, 2, m);
      for (let x = 6; x < 26; x += 2) put(b, x, Y(7), s);
      rect(b, 9, Y(9), 2, 4, look.hair);
      break;
    case 'mask':
      rect(b, 9, Y(6), 13, 12, m);
      rect(b, 14, Y(6), 3, 10, s);
      rect(b, 13, Y(9), 9, 5, t);
      rect(b, 16, Y(15), 5, 3, look.skin); // mouth and chin show
      rect(b, 5, Y(10), 4, 2, t); // laces
      rect(b, 4, Y(12), 3, 3, t);
      break;
  }
  // face (the mask draws its own eye holes)
  const eyeWhite = look.hat === 'mask' ? '#ffffff' : '#ffffff';
  rect(b, 15, Y(11), 1, 2, eyeWhite);
  rect(b, 16, Y(11), 1, 2, OUTLINE);
  rect(b, 19, Y(11), 1, 2, eyeWhite);
  rect(b, 20, Y(11), 1, 2, OUTLINE);
  if (look.hat !== 'mask') {
    rect(b, 15, Y(10), 2, 1, mix(look.hair, '#000000', 0.2));
    rect(b, 19, Y(10), 2, 1, mix(look.hair, '#000000', 0.2));
  }
  rect(b, 18, Y(15), 2, 1, mix(look.skin, '#7a1c22', 0.7));
  put(b, 13, Y(14), mix(look.skin, '#ff6a7a', 0.35));
}

/** Outline, then a simple top-left light: highlight top/left edges, shade bottom/right edges. */
function finish(src: Px): Px {
  const out = buffer();
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= W || y >= H ? null : src[y][x]);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const c = src[y][x];
      if (c) {
        let v = c;
        const up = at(x, y - 1);
        const down = at(x, y + 1);
        const left = at(x - 1, y);
        const right = at(x + 1, y);
        if (!up) v = mix(v, '#ffffff', 0.16);
        else if (!down) v = mix(v, '#000000', 0.24);
        if (!left) v = mix(v, '#ffffff', 0.08);
        if (!right) v = mix(v, '#000000', 0.14);
        out[y][x] = v;
      } else if (at(x - 1, y) || at(x + 1, y) || at(x, y - 1) || at(x, y + 1)) {
        out[y][x] = OUTLINE;
      }
    }
  }
  return out;
}

export interface PaintOptions {
  frame: 0 | 1;
  /** 1 = faces right, -1 = faces left */
  facing: 1 | -1;
  aura: string;
  belt: string[];
  /** false draws no aura and no ground shadow (portraits) */
  stage?: boolean;
}

export function paintFighter(ctx: CanvasRenderingContext2D, look: Look, opts: PaintOptions) {
  ctx.clearRect(0, 0, W, H);
  const flip = opts.facing === -1;
  const X = (x: number) => (flip ? W - 1 - x : x);
  if (opts.stage !== false) {
    // pixel-banded aura, then a ground shadow
    const [cx, cy, rx, ry] = [16, 26, 16, 23];
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const d = Math.hypot((x - cx) / rx, (y - cy) / ry);
        const a = d < 0.5 ? 0.2 : d < 0.72 ? 0.13 : d < 0.95 ? 0.07 : 0;
        if (a > 0) {
          ctx.globalAlpha = a;
          ctx.fillStyle = opts.aura;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = '#000000';
    for (let x = 8; x <= 24; x++) {
      const w = (x - 16) / 8;
      if (w * w < 1) ctx.fillRect(X(x), 44, 1, 1);
      if (w * w < 0.6) ctx.fillRect(X(x), 45, 1, 1);
    }
    ctx.globalAlpha = 1;
  }
  const px = finish(build(look, opts.belt, opts.frame));
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const c = px[y][x];
      if (c) {
        ctx.fillStyle = c;
        ctx.fillRect(X(x), y, 1, 1);
      }
    }
  }
}
