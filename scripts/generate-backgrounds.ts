/**
 * Generates countries/<id>/background.webp: the atmospheric art behind each folio.
 *
 *   npm run backgrounds                # all countries
 *   npm run backgrounds -- brazil      # one country
 *
 * What is in the image (and what is deliberately NOT):
 *  - a faint astrolabe of rings around the country core, soft nebulae behind
 *    each level's constellation (positions read from layout.json), the
 *    country's own silhouette drawn from Natural Earth, and one geographic
 *    motif per country (see MOTIFS);
 *  - NO connections, sockets or labels. Those are always drawn live from the
 *    node coordinates, so moving a core never leaves a stale line in an image.
 *    If you move cores a long way, re-run this script so the nebulae follow.
 *
 * The workflow this script belongs to is described in docs/BACKGROUND-WORKFLOW.md.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import sharp from 'sharp';
import { geoAlbers, geoAzimuthalEqualArea, geoCentroid, geoConicConformal, geoConicEqualArea, geoContains, geoArea, geoMercator, geoPath, geoGraticule, type GeoProjection } from 'd3-geo';
import { Delaunay } from 'd3-delaunay';
import { feature } from 'topojson-client';
import type { Feature, MultiPolygon, Polygon } from 'geojson';
import { countryDir, listCountryIds, loadBundle } from './lib/load';
import { buildModel, descendantsOf } from '../src/data/model';
import { BRANCH_COLOR, lighten, mix } from '../src/folio/palette';
import { Noise2D, contours, glint, hashString, mulberry32, f1, ridgeField, smoothPath, tickRing } from './lib/art';

const require = createRequire(import.meta.url);
const topo = JSON.parse(fs.readFileSync(require.resolve('world-atlas/countries-50m.json'), 'utf8'));
const collection = feature(topo, topo.objects.countries) as unknown as { features: Feature<Polygon | MultiPolygon>[] };
const SCALE = 1.5; // raster pixels per canvas unit

interface Ctx {
  W: number;
  H: number;
  rnd: () => number;
  noise: Noise2D;
  accent: string;
  accent2: string;
  xy: (lon: number, lat: number) => [number, number];
  inside: (x: number, y: number) => boolean;
  bbox: [number, number, number, number];
  core: [number, number];
}
interface Motif {
  defs: string;
  body: string;
}

/* ------------------------------------------------------------- geography */
function keepPolygons(f: Feature<Polygon | MultiPolygon>, keep: (poly: Feature<Polygon>, relArea: number) => boolean): Feature<MultiPolygon> {
  const polys: number[][][][] = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  const feats = polys.map((coordinates) => ({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates } }) as Feature<Polygon>);
  const areas = feats.map((p) => geoArea(p));
  const max = Math.max(...areas);
  const kept = feats.filter((p, i) => keep(p, areas[i] / max));
  return { type: 'Feature', properties: f.properties, geometry: { type: 'MultiPolygon', coordinates: kept.map((p) => p.geometry.coordinates) } };
}

interface GeoSpec {
  projection: () => GeoProjection;
  keep?: (poly: Feature<Polygon>, rel: number) => boolean;
}
const GEO: Record<string, GeoSpec> = {
  canada: { projection: () => geoConicEqualArea().parallels([49, 77]).rotate([96, 0]).center([0, 60]), keep: (_p, rel) => rel > 0.0008 },
  'united-states': {
    projection: () => geoAlbers(),
    keep: (p) => {
      const [lon, lat] = geoCentroid(p);
      return lon > -130 && lon < -60 && lat > 24 && lat < 50;
    },
  },
  brazil: { projection: () => geoAzimuthalEqualArea().rotate([54, 14]), keep: (_p, rel) => rel > 0.01 },
  mexico: { projection: () => geoConicConformal().parallels([17.5, 29.5]).rotate([102, 0]).center([0, 24]), keep: (_p, rel) => rel > 0.02 },
  colombia: { projection: () => geoMercator(), keep: (_p, rel) => rel > 0.05 },
  bolivia: { projection: () => geoMercator() },
  japan: { projection: () => geoMercator().angle(-16), keep: (_p, rel) => rel > 0.0004 },
};

/* --------------------------------------------------------------- motifs */
function ridgeContours(c: Ctx, ridges: { pts: [number, number][]; sigma: number; height: number }[], opts: { levels?: number[]; noiseAmp?: number; step?: number; stroke?: string; clip?: string } = {}): string {
  const base = ridgeField(ridges);
  const amp = opts.noiseAmp ?? 0.28;
  const field = (x: number, y: number) => base(x, y) * 0.92 + (c.noise.fbm(x / 210, y / 210, 4) - 0.5) * amp;
  const levels = opts.levels ?? [0.14, 0.22, 0.3, 0.38, 0.46, 0.54, 0.62, 0.72, 0.84, 0.96];
  const paths = contours(field, [0, 0, c.W, c.H], opts.step ?? 11, levels);
  const stroke = opts.stroke ?? c.accent;
  return `<g ${opts.clip ? `clip-path="url(#${opts.clip})"` : ''} fill="none" stroke="${stroke}" stroke-linecap="round">${paths
    .map((d, i) => `<path d="${d}" stroke-opacity="${(0.16 + (i / levels.length) * 0.3).toFixed(2)}" stroke-width="${i % 3 === 2 ? 1.5 : 0.9}"/>`)
    .join('')}</g>`;
}

const MOTIFS: Record<string, (c: Ctx) => Motif> = {
  /** Generic fallback for any country without a bespoke motif: topographic contours crossing the silhouette. */
  topo(c) {
    const [x0, y0, x1, y1] = c.bbox;
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    const ridges = [
      { pts: [[x0, cy], [cx, cy - 40], [x1, cy + 30]] as [number, number][], sigma: Math.max(60, (y1 - y0) / 3.2), height: 1 },
      { pts: [[cx, y0], [cx + 30, cy], [cx - 20, y1]] as [number, number][], sigma: Math.max(50, (x1 - x0) / 4), height: 0.7 },
    ];
    return { defs: '', body: ridgeContours(c, ridges) };
  },
  /** Canada: auroral curtains over the boreal Shield, scattered glacial lakes. */
  aurora(c) {
    const cols = [c.accent, c.accent2, '#8fffd8'];
    const defs = cols
      .map(
        (col, i) =>
          `<linearGradient id="aur${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}" stop-opacity="0"/><stop offset=".13" stop-color="${col}" stop-opacity=".95"/><stop offset=".55" stop-color="${col}" stop-opacity=".22"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></linearGradient>`,
      )
      .join('');
    const ribbons = [
      { y0: 205, amp: 60, h: 250, a: 0.5, ph: 0.4, seed: 1 },
      { y0: 150, amp: 46, h: 200, a: 0.36, ph: 2.6, seed: 2 },
      { y0: 262, amp: 74, h: 215, a: 0.3, ph: 4.4, seed: 3 },
    ];
    let body = '';
    ribbons.forEach((r, i) => {
      let rects = '';
      for (let x = -10; x <= c.W + 10; x += 3) {
        const y = r.y0 + Math.sin(x / 230 + r.ph) * r.amp + (c.noise.fbm(x / 260 + r.seed * 7, r.seed) - 0.5) * 90;
        // curtain folds: heights swing quickly with x, giving the vertical striations of a real aurora
        const fold = 0.3 + 0.7 * Math.abs(Math.sin(x / 26 + c.noise.at(x / 140 + r.seed * 3, r.seed * 5) * 9));
        const h = r.h * 0.62 * fold * (0.6 + 0.4 * c.noise.at(x / 90 + r.seed * 11, r.seed * 2));
        rects += `<rect x="${x}" y="${f1(y)}" width="2.4" height="${f1(h)}"/>`;
      }
      body += `<g fill="url(#aur${i})" opacity="${(r.a * 0.55).toFixed(2)}" filter="url(#blurS)">${rects}</g><g fill="url(#aur${i})" opacity="${(r.a * 0.85).toFixed(2)}">${rects}</g>`;
    });
    let lakes = '';
    for (let n = 0, tries = 0; n < 340 && tries < 5000; tries++) {
      const x = c.bbox[0] + c.rnd() * (c.bbox[2] - c.bbox[0]);
      const y = c.bbox[1] + c.rnd() * (c.bbox[3] - c.bbox[1]);
      if (!c.inside(x, y)) continue;
      n++;
      lakes += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(2 + c.rnd() * 7)}" ry="${f1(1 + c.rnd() * 3)}" transform="rotate(${f1(25 + c.rnd() * 30)} ${f1(x)} ${f1(y)})"/>`;
    }
    body += `<g fill="${c.accent2}" fill-opacity=".2" stroke="${c.accent}" stroke-opacity=".32" stroke-width=".6">${lakes}</g>`;
    // treeline: a dashed arc following the southern edge of the Arctic
    const tl = [c.xy(-135, 60), c.xy(-115, 58), c.xy(-95, 58.5), c.xy(-78, 55), c.xy(-62, 53)];
    body += `<path d="${smoothPath(tl)}" fill="none" stroke="${c.accent}" stroke-opacity=".26" stroke-width="1.2" stroke-dasharray="2 9"/>`;
    return { defs, body };
  },

  /** United States: township-and-range survey grid over topographic contours and time-zone meridians. */
  'survey-grid'(c) {
    const cell = 64;
    let minor = '';
    let major = '';
    for (let i = 0; i * cell <= c.W; i++) (i % 6 === 0 ? (major += `M${i * cell} 0V${c.H}`) : (minor += `M${i * cell} 0V${c.H}`));
    for (let j = 0; j * cell <= c.H; j++) (j % 6 === 0 ? (major += `M0 ${j * cell}H${c.W}`) : (minor += `M0 ${j * cell}H${c.W}`));
    const rockies: [number, number][] = [c.xy(-115, 49), c.xy(-111.5, 45.5), c.xy(-108, 41), c.xy(-106.5, 36), c.xy(-107, 32)];
    const appalachians: [number, number][] = [c.xy(-85, 34.5), c.xy(-82, 37), c.xy(-79, 39.5), c.xy(-76, 42), c.xy(-72, 44.5)];
    const sierra: [number, number][] = [c.xy(-121.5, 45), c.xy(-120, 39), c.xy(-118, 35)];
    let meridians = '';
    for (const lon of [-120, -105, -90, -75]) {
      const pts: [number, number][] = [];
      for (let lat = 25; lat <= 49; lat += 4) pts.push(c.xy(lon, lat));
      meridians += `<path d="${smoothPath(pts)}"/>`;
    }
    const body =
      `<g clip-path="url(#silClip)"><path d="${minor}" stroke="${c.accent}" stroke-opacity=".17" stroke-width=".9" fill="none"/><path d="${major}" stroke="${c.accent}" stroke-opacity=".34" stroke-width="1.4" fill="none"/></g>` +
      ridgeContours(
        c,
        [
          { pts: rockies, sigma: 74, height: 1 },
          { pts: appalachians, sigma: 46, height: 0.55 },
          { pts: sierra, sigma: 40, height: 0.85 },
        ],
        { clip: 'silClip' },
      ) +
      `<g fill="none" stroke="${c.accent2}" stroke-opacity=".3" stroke-width="1.1" stroke-dasharray="3 8">${meridians}</g>`;
    return { defs: '', body };
  },

  /** Brazil: dendritic river basins (Amazon, Tocantins, São Francisco, Paraná), canopy dots, the Southern Cross. */
  'river-basin'(c) {
    const layers: string[][] = [[], [], [], []];
    const widths = [3.2, 2.1, 1.3, 0.8];
    const walk = (x: number, y: number, ang: number, depth: number, steps: number, len: number) => {
      let d = `M${f1(x)} ${f1(y)}`;
      let cx = x;
      let cy = y;
      let a = ang;
      for (let s = 0; s < steps; s++) {
        a += (c.rnd() - 0.5) * 0.9;
        const nx = cx + Math.cos(a) * len * (0.7 + c.rnd() * 0.6);
        const ny = cy + Math.sin(a) * len * (0.7 + c.rnd() * 0.6);
        if (!c.inside(nx, ny)) break;
        d += `Q${f1(cx + Math.cos(a - 0.3) * len * 0.5)} ${f1(cy + Math.sin(a - 0.3) * len * 0.5)} ${f1(nx)} ${f1(ny)}`;
        if (depth < 3 && c.rnd() < 0.2 - depth * 0.03) walk(nx, ny, a + (c.rnd() < 0.5 ? -1 : 1) * (0.6 + c.rnd() * 0.5), depth + 1, 4 + Math.floor(c.rnd() * 7), len * 0.8);
        cx = nx;
        cy = ny;
      }
      layers[depth].push(d);
    };
    const river = (waypoints: [number, number][]) => {
      // add meanders: subdivide each leg and push the midpoints sideways by noise
      const meandered: [number, number][] = [waypoints[0]];
      for (let i = 1; i < waypoints.length; i++) {
        const [x0, y0] = waypoints[i - 1];
        const [x1, y1] = waypoints[i];
        const len = Math.hypot(x1 - x0, y1 - y0);
        const nx = -(y1 - y0) / (len || 1);
        const ny = (x1 - x0) / (len || 1);
        const segs = Math.max(2, Math.round(len / 34));
        for (let s = 1; s <= segs; s++) {
          const t = s / segs;
          const off = s === segs ? 0 : (c.noise.fbm(x0 + t * 3, y0 + i) - 0.5) * 46;
          meandered.push([x0 + (x1 - x0) * t + nx * off, y0 + (y1 - y0) * t + ny * off]);
        }
      }
      layers[0].push(smoothPath(meandered));
      for (let i = 1; i < waypoints.length; i++) {
        const [x0, y0] = waypoints[i - 1];
        const [x1, y1] = waypoints[i];
        const a = Math.atan2(y1 - y0, x1 - x0);
        for (let k = 0; k < 3; k++) {
          const t = c.rnd();
          const px = x0 + (x1 - x0) * t;
          const py = y0 + (y1 - y0) * t;
          walk(px, py, a + (c.rnd() < 0.5 ? -1 : 1) * (0.7 + c.rnd() * 0.5), 1, 5 + Math.floor(c.rnd() * 6), 20);
        }
      }
    };
    river([c.xy(-50, -1.2), c.xy(-55, -2.3), c.xy(-60, -3.2), c.xy(-65, -3.4), c.xy(-70, -4.2), c.xy(-73.2, -5.2)]);
    river([c.xy(-48.7, -1.6), c.xy(-49.5, -6), c.xy(-48.2, -11), c.xy(-47.8, -15)]);
    river([c.xy(-36.6, -10.6), c.xy(-40.2, -9.6), c.xy(-43.6, -12.8), c.xy(-46, -17.5)]);
    river([c.xy(-57.8, -33.5), c.xy(-58, -28), c.xy(-54.6, -25.2), c.xy(-51.4, -22.6), c.xy(-49, -20)]);
    river([c.xy(-63, -8.8), c.xy(-62.4, -12), c.xy(-60.5, -15.5)]);
    let canopy = '';
    for (let n = 0, tries = 0; n < 650 && tries < 6000; tries++) {
      const x = c.bbox[0] + c.rnd() * (c.bbox[2] - c.bbox[0]);
      const y = c.bbox[1] + c.rnd() * (c.bbox[3] - c.bbox[1]);
      if (!c.inside(x, y)) continue;
      n++;
      canopy += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(0.7 + c.rnd() * 1.3)}"/>`;
    }
    const glow = layers.map((l, i) => `<path d="${l.join('')}" stroke-width="${widths[i] * 2.2}"/>`).join('');
    const lines = layers.map((l, i) => `<path d="${l.join('')}" stroke-width="${widths[i] * 0.8}" stroke-opacity="${(0.5 - i * 0.08).toFixed(2)}"/>`).join('');
    // Southern Cross (Cruzeiro do Sul), top-right sky
    const sx = c.W - 250;
    const sy = 190;
    const stars: [number, number, number][] = [[0, -78, 9], [0, 62, 11], [-50, 6, 7.5], [52, -12, 8], [20, 30, 4]];
    const cross = stars.map(([dx, dy, r]) => `<path d="${glint(sx + dx, sy + dy, r * 1.9)}"/><circle cx="${sx + dx}" cy="${sy + dy}" r="${r * 0.42}" fill="#fff"/>`).join('');
    const body =
      `<g fill="none" stroke="${c.accent}" stroke-linecap="round" filter="url(#blurS)" opacity=".34">${glow}</g>` +
      `<g fill="none" stroke="${c.accent}" stroke-linecap="round">${lines}</g>` +
      `<g fill="${c.accent2}" fill-opacity=".16">${canopy}</g>` +
      `<g fill="#fff8d0" fill-opacity=".55" opacity=".9">${cross}</g>`;
    return { defs: '', body };
  },

  /** Mexico: the two Sierra Madre ranges and the volcanic belt, volcano contours, the Tropic of Cancer. */
  'sierra-belt'(c) {
    const occ: [number, number][] = [c.xy(-109.5, 31.5), c.xy(-108, 28), c.xy(-106, 25.5), c.xy(-104.5, 23), c.xy(-103.5, 20.5)];
    const ori: [number, number][] = [c.xy(-101, 27.5), c.xy(-99.8, 25), c.xy(-99, 22), c.xy(-98, 19.6)];
    const volc: [number, number][] = [c.xy(-105, 19.8), c.xy(-102, 19.5), c.xy(-99, 19.2), c.xy(-96.5, 18.9)];
    const sur: [number, number][] = [c.xy(-104, 18), c.xy(-100, 17), c.xy(-97, 16.6)];
    const baja: [number, number][] = [c.xy(-115.6, 32), c.xy(-113, 28), c.xy(-110.6, 24)];
    let volcanoes = '';
    for (const [lon, lat] of [[-98.62, 19.02], [-97.27, 19.03], [-103.62, 19.51], [-99.76, 19.11]] as [number, number][]) {
      const [x, y] = c.xy(lon, lat);
      for (let i = 1; i <= 5; i++) volcanoes += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${i * 7}" stroke-opacity="${(0.38 - i * 0.05).toFixed(2)}"/>`;
    }
    const tropic: [number, number][] = [];
    for (let lon = -118; lon <= -86; lon += 4) tropic.push(c.xy(lon, 23.4366));
    const body =
      ridgeContours(c, [
        { pts: occ, sigma: 52, height: 1 },
        { pts: ori, sigma: 40, height: 0.85 },
        { pts: volc, sigma: 30, height: 0.9 },
        { pts: sur, sigma: 32, height: 0.6 },
        { pts: baja, sigma: 26, height: 0.5 },
      ], { stroke: c.accent2 }) +
      `<g fill="none" stroke="${c.accent}" stroke-width="1">${volcanoes}</g>` +
      `<path d="${smoothPath(tropic)}" fill="none" stroke="${c.accent2}" stroke-opacity=".42" stroke-width="1.4" stroke-dasharray="10 7"/>`;
    return { defs: '', body };
  },

  /** Colombia: three cordilleras fanning from the Massif, Magdalena and Cauca valleys, the equator. */
  'three-cordilleras'(c) {
    const occ: [number, number][] = [c.xy(-77.3, 1.2), c.xy(-76.5, 3.5), c.xy(-76.2, 5.5), c.xy(-76.4, 7.5)];
    const cen: [number, number][] = [c.xy(-76.6, 1.6), c.xy(-75.8, 3.5), c.xy(-75.4, 5.5), c.xy(-75.7, 7.8)];
    const ori: [number, number][] = [c.xy(-75.9, 1.2), c.xy(-74.6, 3.5), c.xy(-73.6, 6), c.xy(-72.8, 8), c.xy(-72.5, 10)];
    const snsm: [number, number][] = [c.xy(-73.9, 10.7), c.xy(-73.4, 10.9)];
    const magdalena: [number, number][] = [c.xy(-75.9, 1.9), c.xy(-75.3, 3.8), c.xy(-74.8, 6), c.xy(-74.5, 8.5), c.xy(-74.9, 10.9)];
    const cauca: [number, number][] = [c.xy(-76.5, 2), c.xy(-76.3, 4), c.xy(-75.7, 6.5), c.xy(-75, 8.6)];
    const eq: [number, number][] = [];
    for (let lon = -82; lon <= -66; lon += 2) eq.push(c.xy(lon, 0));
    let ticks = '';
    for (let lon = -82; lon <= -66; lon += 1) {
      const [x, y] = c.xy(lon, 0);
      ticks += `M${f1(x)} ${f1(y - (lon % 5 === 0 ? 9 : 5))}V${f1(y + (lon % 5 === 0 ? 9 : 5))}`;
    }
    const body =
      ridgeContours(c, [
        { pts: occ, sigma: 34, height: 0.95 },
        { pts: cen, sigma: 36, height: 1 },
        { pts: ori, sigma: 44, height: 0.9 },
        { pts: snsm, sigma: 26, height: 1.1 },
      ]) +
      `<g fill="none" stroke="${c.accent2}" stroke-linecap="round" stroke-width="1.6" stroke-opacity=".55"><path d="${smoothPath(magdalena)}"/><path d="${smoothPath(cauca)}" stroke-opacity=".4"/></g>` +
      `<path d="${smoothPath(eq)}" fill="none" stroke="${c.accent}" stroke-opacity=".45" stroke-width="1.4" stroke-dasharray="12 7"/>` +
      `<path d="${ticks}" stroke="${c.accent}" stroke-opacity=".4" stroke-width="1"/>`;
    return { defs: '', body };
  },

  /** Bolivia: Uyuni salt-crust hexagons, Titicaca terraces, stepped Andean ridgelines. */
  'salt-altiplano'(c) {
    const [ux, uy] = c.xy(-67.5, -20.3);
    const pts: [number, number][] = [];
    const rx = 230;
    const ry = 150;
    while (pts.length < 130) {
      const x = ux + (c.rnd() * 2 - 1) * rx;
      const y = uy + (c.rnd() * 2 - 1) * ry;
      if (((x - ux) / rx) ** 2 + ((y - uy) / ry) ** 2 <= 1) pts.push([x, y]);
    }
    let relaxed = pts;
    for (let it = 0; it < 4; it++) {
      const vor = Delaunay.from(relaxed).voronoi([ux - rx - 20, uy - ry - 20, ux + rx + 20, uy + ry + 20]);
      relaxed = relaxed.map((_p, i) => {
        const poly = vor.cellPolygon(i);
        if (!poly) return relaxed[i];
        const n = poly.length - 1;
        return [poly.slice(0, n).reduce((s, q) => s + q[0], 0) / n, poly.slice(0, n).reduce((s, q) => s + q[1], 0) / n] as [number, number];
      });
    }
    const vor = Delaunay.from(relaxed).voronoi([ux - rx - 20, uy - ry - 20, ux + rx + 20, uy + ry + 20]);
    let cells = '';
    let fills = '';
    relaxed.forEach((_p, i) => {
      const poly = vor.cellPolygon(i);
      if (!poly) return;
      const d = 'M' + poly.map((q) => `${f1(q[0])} ${f1(q[1])}`).join('L') + 'Z';
      cells += d;
      if (c.noise.at(relaxed[i][0] / 60, relaxed[i][1] / 60) > 0.55) fills += `<path d="${d}"/>`;
    });
    const [tx, ty] = c.xy(-69.4, -15.9);
    let terraces = '';
    for (let i = 1; i <= 8; i++) {
      const ring: [number, number][] = [];
      for (let k = 0; k < 28; k++) {
        const a = (k / 28) * Math.PI * 2;
        const rr = i * 9 * (0.85 + 0.3 * c.noise.at(Math.cos(a) * 2 + i, Math.sin(a) * 2));
        ring.push([tx + Math.cos(a) * rr * 1.3, ty + Math.sin(a) * rr]);
      }
      terraces += `<path d="${smoothPath(ring, true)}" stroke-opacity="${(0.42 - i * 0.03).toFixed(2)}"/>`;
    }
    const west: [number, number][] = [c.xy(-69.1, -16.5), c.xy(-68.8, -19), c.xy(-68.2, -22)];
    const east: [number, number][] = [c.xy(-67.6, -15), c.xy(-66.2, -17.5), c.xy(-64.8, -19.5), c.xy(-64.4, -22)];
    // stepped Andean band along the top edge
    let steps = 'M0 0';
    const sw = 34;
    for (let x = 0; x < c.W + sw; x += sw) steps += `V${18 + ((x / sw) % 4) * 7}h${sw}`;
    steps += `V0Z`;
    const body =
      ridgeContours(c, [
        { pts: west, sigma: 46, height: 1 },
        { pts: east, sigma: 54, height: 0.95 },
        { pts: [c.xy(-67, -17), c.xy(-67, -20)], sigma: 60, height: 0.5 },
      ], { stroke: c.accent2 }) +
      `<g clip-path="url(#saltClip)"><g fill="${c.accent}" fill-opacity=".14">${fills}</g><path d="${cells}" fill="none" stroke="${c.accent}" stroke-opacity=".5" stroke-width="1"/></g>` +
      `<ellipse cx="${f1(ux)}" cy="${f1(uy)}" rx="${rx}" ry="${ry}" fill="none" stroke="${c.accent}" stroke-opacity=".3" stroke-width="1.2" stroke-dasharray="3 6"/>` +
      `<g fill="none" stroke="${c.accent}" stroke-width="1.1">${terraces}</g>` +
      `<path d="${steps}" fill="${c.accent2}" fill-opacity=".1"/>`;
    return { defs: `<clipPath id="saltClip"><ellipse cx="${f1(ux)}" cy="${f1(uy)}" rx="${rx}" ry="${ry}"/></clipPath>`, body };
  },

  /** Japan: seigaiha waves, a rising sun disc, the Nankai and Japan trenches, Fuji contours, the mountain spine. */
  'island-arc'(c) {
    const sx = 250;
    const sy = 235;
    const defs = `<radialGradient id="sun"><stop offset="0" stop-color="${c.accent}" stop-opacity=".55"/><stop offset=".55" stop-color="${c.accent}" stop-opacity=".18"/><stop offset="1" stop-color="${c.accent}" stop-opacity="0"/></radialGradient>`;
    let waves = '';
    for (let j = 0; j < 6; j++) {
      const y = c.H - 40 - j * 24;
      for (let x = c.W * 0.42 + (j % 2) * 28; x < c.W + 60; x += 56) {
        for (const r of [28, 22, 16, 10, 4]) waves += `M${x - r} ${y}A${r} ${r} 0 0 1 ${x + r} ${y}`;
      }
    }
    const nankai: [number, number][] = [c.xy(139.4, 33.4), c.xy(137, 32.5), c.xy(134.4, 32), c.xy(132.4, 31.3), c.xy(131, 30.4)];
    const japanTrench: [number, number][] = [c.xy(144.3, 41.5), c.xy(144.8, 38.6), c.xy(143.4, 36), c.xy(142.6, 33)];
    let trenches = '';
    for (const off of [-26, -13, 0, 13]) {
      trenches += `<path d="${smoothPath(nankai.map(([x, y]) => [x + off * 0.5, y + off] as [number, number]))}" stroke-dasharray="${off === 0 ? '0' : '2 9'}" stroke-opacity="${off === 0 ? 0.5 : 0.28}"/>`;
      trenches += `<path d="${smoothPath(japanTrench.map(([x, y]) => [x + off, y + off * 0.4] as [number, number]))}" stroke-dasharray="${off === 0 ? '0' : '2 9'}" stroke-opacity="${off === 0 ? 0.5 : 0.28}"/>`;
    }
    const [fx, fy] = c.xy(138.73, 35.36);
    let fuji = '';
    for (let i = 1; i <= 6; i++) fuji += `<circle cx="${f1(fx)}" cy="${f1(fy)}" r="${i * 6.5}" stroke-opacity="${(0.5 - i * 0.06).toFixed(2)}"/>`;
    const spine: [number, number][] = [c.xy(141, 43), c.xy(140.6, 40), c.xy(140, 37.5), c.xy(138.5, 36), c.xy(137.5, 35), c.xy(135.6, 34), c.xy(133, 34.6), c.xy(131, 33)];
    const body =
      `<circle cx="${sx}" cy="${sy}" r="215" fill="url(#sun)"/>` +
      `<g fill="none" stroke="${c.accent}" stroke-width="1.1"><circle cx="${sx}" cy="${sy}" r="150" stroke-opacity=".5"/><circle cx="${sx}" cy="${sy}" r="184" stroke-opacity=".3" stroke-dasharray="3 8"/><circle cx="${sx}" cy="${sy}" r="222" stroke-opacity=".2"/><path d="${tickRing(sx, sy, 232, 120, 5, 5, 11)}" stroke-opacity=".28"/></g>` +
      `<path d="${waves}" fill="none" stroke="${c.accent2}" stroke-opacity=".22" stroke-width="1.1"/>` +
      ridgeContours(c, [{ pts: spine, sigma: 30, height: 1 }, { pts: [c.xy(143, 43.4), c.xy(142.8, 42.5)], sigma: 34, height: 0.6 }], { stroke: c.accent2, noiseAmp: 0.22 }) +
      `<g fill="none" stroke="${c.accent2}" stroke-width="1.3">${trenches}</g>` +
      `<g fill="none" stroke="${c.accent}" stroke-width="1">${fuji}</g>`;
    return { defs, body };
  },
};

/* --------------------------------------------------------------- render */
async function render(id: string) {
  const bundle = loadBundle(id);
  const model = buildModel(bundle);
  const meta = bundle.meta;
  const { width: W, height: H } = bundle.layout.canvas;
  // New countries work out of the box: a Mercator fit and the generic topographic motif. Add a GEO entry
  // (better projection, tiny islands filtered out) or a bespoke motif later, only if the default looks poor.
  const spec = GEO[id] ?? { projection: () => geoMercator() };
  const motifFn = MOTIFS[meta.theme.motif] ?? MOTIFS.topo;
  if (!motifFn) throw new Error(`No motif "${meta.theme.motif}" for ${id}. Known: ${Object.keys(MOTIFS).join(', ')}`);

  const feat = collection.features.find((f) => String(f.id).padStart(3, '0') === meta.isoNumeric);
  if (!feat) throw new Error(`Natural Earth has no country with numeric code ${meta.isoNumeric}`);
  const geom = spec.keep ? keepPolygons(feat, spec.keep) : (feat as Feature<Polygon | MultiPolygon>);
  const projection = spec.projection();
  projection.fitExtent([[60, 70], [W - 60, H - 90]], geom as never);
  const pathGen = geoPath(projection);
  const silPath = pathGen(geom as never) ?? '';
  const bounds = pathGen.bounds(geom as never);
  const xy = (lon: number, lat: number): [number, number] => {
    const p = projection([lon, lat]);
    return p ? [p[0], p[1]] : [W / 2, H / 2];
  };
  const inside = (x: number, y: number) => {
    const ll = projection.invert?.([x, y]);
    return !!ll && geoContains(geom as never, ll);
  };
  const seed = hashString(id);
  const rnd = mulberry32(seed);
  const core = model.nodes.get(model.rootId)!;
  const ctx: Ctx = { W, H, rnd, noise: new Noise2D(seed), accent: meta.theme.accent, accent2: meta.theme.accent2, xy, inside, bbox: [bounds[0][0], bounds[0][1], bounds[1][0], bounds[1][1]], core: [core.x, core.y] };
  const motif = motifFn(ctx);

  // Nebulae behind each level's constellation
  let nebulae = '';
  let nebDefs = '';
  meta.levels.forEach((lvl, i) => {
    const members = [lvl.id, ...descendantsOf(model, lvl.id)].map((m) => model.nodes.get(m)!);
    const mx = members.reduce((s, n) => s + n.x, 0) / members.length;
    const my = members.reduce((s, n) => s + n.y, 0) / members.length;
    const rad = Math.max(...members.map((n) => Math.hypot(n.x - mx, n.y - my) + n.r)) + 110;
    const col = BRANCH_COLOR[lvl.branch];
    nebDefs += `<radialGradient id="neb${i}"><stop offset="0" stop-color="${col}" stop-opacity=".2"/><stop offset=".55" stop-color="${col}" stop-opacity=".08"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient>`;
    nebulae += `<circle cx="${f1(mx)}" cy="${f1(my)}" r="${f1(rad)}" fill="url(#neb${i})"/>`;
  });
  const cx = core.x;
  const cy = core.y;
  nebDefs += `<radialGradient id="nebC"><stop offset="0" stop-color="${mix(meta.theme.accent, '#ffd98a', 0.4)}" stop-opacity=".3"/><stop offset=".5" stop-color="${meta.theme.accent2}" stop-opacity=".1"/><stop offset="1" stop-color="${meta.theme.accent2}" stop-opacity="0"/></radialGradient>`;
  nebulae += `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="420" fill="url(#nebC)"/>`;

  // Astrolabe rings
  const rings = [
    `<circle cx="${cx}" cy="${cy}" r="196" stroke-opacity=".3" stroke-dasharray="2 7"/>`,
    `<circle cx="${cx}" cy="${cy}" r="292" stroke-opacity=".2"/>`,
    `<circle cx="${cx}" cy="${cy}" r="410" stroke-opacity=".26" stroke-dasharray="14 6 2 6"/>`,
    `<circle cx="${cx}" cy="${cy}" r="556" stroke-opacity=".16"/>`,
    `<circle cx="${cx}" cy="${cy}" r="742" stroke-opacity=".12" stroke-dasharray="3 12"/>`,
  ].join('');
  const ringTicks = `<path d="${tickRing(cx, cy, 416, 180, 5, 5, 11)}" stroke-opacity=".3"/><path d="${tickRing(cx, cy, 300, 96, 4, 4, 8)}" stroke-opacity=".22"/>`;
  const cross = `<path d="M${cx - 800} ${cy}H${cx + 800}M${cx} ${cy - 620}V${cy + 620}" stroke-opacity=".07"/>`;
  const grat = geoGraticule().step([5, 5])();
  const graticulePath = pathGen(grat as never) ?? '';

  // Stars
  let stars = '';
  for (let i = 0; i < 260; i++) {
    const x = rnd() * W;
    const y = rnd() * H;
    stars += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(0.5 + rnd() * 1.1)}" fill-opacity="${(0.25 + rnd() * 0.6).toFixed(2)}"/>`;
  }
  let glints = '';
  for (let i = 0; i < 9; i++) glints += `<path d="${glint(rnd() * W, rnd() * H, 5 + rnd() * 6)}"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W * SCALE}" height="${H * SCALE}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="blurS" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>
    <filter id="blurL" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="16"/></filter>
    <radialGradient id="vg" gradientUnits="userSpaceOnUse" cx="${W / 2}" cy="${H / 2}" r="${W * 0.6}" gradientTransform="translate(0 ${H / 2}) scale(1 ${(H / W) * 1.28}) translate(0 ${-H / 2})">
      <stop offset="0" stop-color="#fff"/><stop offset=".62" stop-color="#fff"/><stop offset=".9" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <mask id="vig"><rect width="${W}" height="${H}" fill="url(#vg)"/></mask>
    <filter id="featherBlur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="22"/></filter>
    <mask id="feather" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect x="46" y="46" width="${W - 92}" height="${H - 92}" fill="#fff" filter="url(#featherBlur)"/></mask>
    <clipPath id="silClip"><path d="${silPath}"/></clipPath>
    <pattern id="hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(38)"><path d="M0 0V9" stroke="${meta.theme.accent}" stroke-opacity=".14" stroke-width="1"/></pattern>
    ${nebDefs}
    ${motif.defs}
  </defs>
  <g mask="url(#feather)">
  <g mask="url(#vig)">
    ${nebulae}
    <g fill="none" stroke="${lighten(meta.theme.accent2, 0.3)}" stroke-width="1">${rings}${ringTicks}${cross}</g>
    <path d="${graticulePath}" fill="none" stroke="${meta.theme.accent}" stroke-opacity=".08" stroke-width=".7"/>
    <path d="${silPath}" fill="${meta.theme.accent}" fill-opacity=".055" stroke="${meta.theme.accent}" stroke-opacity=".28" stroke-width="9" filter="url(#blurS)"/>
    <path d="${silPath}" fill="url(#hatch)" stroke="${meta.theme.accent}" stroke-opacity=".62" stroke-width="1.5" stroke-linejoin="round"/>
    ${motif.body}
  </g>
  <g fill="#dfe8ff">${stars}</g><g fill="#fff" fill-opacity=".55">${glints}</g>
  </g>
</svg>`;

  const outDir = countryDir(id);
  const buf = await sharp(Buffer.from(svg), { density: 72 }).resize(W * SCALE, H * SCALE).webp({ quality: 82, alphaQuality: 90, effort: 5 }).toBuffer();
  fs.writeFileSync(path.join(outDir, 'background.webp'), buf);
  // Flat PNG preview (on the app's dark backdrop) for the documentation.
  const previewDir = path.join(countryDir(id), '..', '..', 'docs', 'workflow');
  fs.mkdirSync(previewDir, { recursive: true });
  await sharp(buf).flatten({ background: '#04060d' }).resize(1200).png({ compressionLevel: 9 }).toFile(path.join(previewDir, `${id}-2-background.png`));
  console.log(`wrote countries/${id}/background.webp (${(buf.length / 1024).toFixed(0)} KB)`);
}

const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));
for (const id of only.length ? only : listCountryIds()) {
  try {
    await render(id);
  } catch (e) {
    console.error(`✗ ${id}: ${(e as Error).message}`);
    process.exitCode = 1;
  }
}
