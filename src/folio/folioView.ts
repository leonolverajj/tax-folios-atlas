/**
 * FolioView – renders one country's folio as SVG.
 *
 * Coordinate system: every core has a centre (x, y) and radius r in "world"
 * units (the layout canvas). The camera maps world → screen. Cores, sockets,
 * connecting lines, cluster discs, hit areas and the background image all sit
 * inside one transformed <g>, so they cannot drift apart. Labels are the one
 * exception: they are anchored to a core's world position but drawn at a
 * constant on-screen size, so they stay legible at every zoom level.
 */
import { buildModel, pathTo, descendantsOf, type FolioEdge, type FolioModel, type FolioNode, type NodeBranch } from '../data/model';
import { edgeGeometry, hitRadius, clamp, type Disc } from '../data/geometry';
import { formatShare, CATEGORY_LABEL, STATUS_LABEL } from '../data/format';
import type { CountryBundle, Layout } from '../data/schema';
import { Camera, type Bounds, type Insets } from '../ui/camera';
import { svg, rafThrottle, prefersReducedMotion } from '../util/dom';
import { BRANCH_COLOR, darken, lighten, mix } from './palette';
import { GLYPH_PATHS, plateShape } from './glyphs';

export type SelectSource = 'pointer' | 'keyboard' | 'outline' | 'route' | 'init' | 'drag';

export interface FolioViewOptions {
  stage: HTMLElement;
  bundle: CountryBundle;
  getInsets: () => Insets;
  /** Screen rectangles (stage coordinates) that labels must avoid, e.g. the zoom buttons. */
  getExclusions?: () => { x0: number; y0: number; x1: number; y1: number }[];
  onSelect: (id: string, source: SelectSource) => void;
  onLayoutChange?: (info: { id?: string; x?: number; y?: number; r?: number }) => void;
}

interface EdgeEls {
  g: SVGGElement;
  glow: SVGLineElement;
  line: SVGLineElement;
  flow: SVGLineElement;
  a: SVGCircleElement;
  b: SVGCircleElement;
  /** Diamond ornament at the middle of the line, aligned with it. */
  joint: SVGPathElement;
  edge: FolioEdge;
}

interface LabelEls {
  g: SVGGElement;
  t1: SVGTextElement;
  t2: SVGTextElement | null;
  w: number;
  h: number;
}

const LABEL_FONT = '600 13px Inter, "Segoe UI", system-ui, sans-serif';
const SUB_FONT = '500 11px Inter, "Segoe UI", system-ui, sans-serif';
const measureCtx = document.createElement('canvas').getContext('2d')!;
function textWidth(text: string, font: string): number {
  measureCtx.font = font;
  return measureCtx.measureText(text).width;
}

export class FolioView {
  readonly model: FolioModel;
  readonly camera: Camera;
  readonly svg: SVGSVGElement;
  selectedId: string;
  levelFilter: string | null = null;
  layoutMode = false;
  snap = 0;
  showGrid = true;

  private world: SVGGElement;
  private discLayer: SVGGElement;
  private edgeLayer: SVGGElement;
  private nodeLayer: SVGGElement;
  private labelLayer: SVGGElement;
  private gridLayer: SVGGElement;
  private nodeEls = new Map<string, SVGGElement>();
  private edgeEls = new Map<string, EdgeEls>();
  private discEls = new Map<string, SVGGElement>();
  private labelEls = new Map<string, LabelEls>();
  private hoverId: string | null = null;
  private pathSet = new Set<string>();
  private childSet = new Set<string>();
  private userMoved = false;
  private ro: ResizeObserver;
  private drag: { id: string; pointerId: number; dx: number; dy: number; lastX: number; lastY: number; moved: boolean; raf: number } | null = null;
  private opts: FolioViewOptions;

  constructor(opts: FolioViewOptions) {
    this.opts = opts;
    this.model = buildModel(opts.bundle);
    this.selectedId = this.model.rootId;

    const { width: W, height: H } = this.model.canvas;
    this.svg = svg('svg', {
      class: 'folio-svg',
      role: 'group',
      'aria-label': `${opts.bundle.meta.names.en} tax folio`,
      xmlns: 'http://www.w3.org/2000/svg',
    });
    this.world = svg('g', { class: 'cam' });
    this.gridLayer = svg('g', { class: 'grid-layer' });
    this.discLayer = svg('g', { class: 'disc-layer' });
    this.edgeLayer = svg('g', { class: 'edge-layer' });
    this.nodeLayer = svg('g', { class: 'node-layer' });
    this.labelLayer = svg('g', { class: 'label-layer', 'aria-hidden': 'true' });

    this.svg.append(this.buildDefs());
    if (opts.bundle.backgroundUrl) {
      const img = svg('image', { class: 'bg', x: 0, y: 0, width: W, height: H, preserveAspectRatio: 'none' });
      img.setAttribute('href', opts.bundle.backgroundUrl);
      this.world.append(img);
    }
    this.buildGrid(W, H);
    this.world.append(this.gridLayer, this.discLayer, this.edgeLayer, this.nodeLayer, this.labelLayer);
    this.svg.append(this.world);
    opts.stage.append(this.svg);

    this.camera = new Camera(this.svg, {
      minK: 0.12,
      maxK: 4,
      ignorePan: (t) => this.layoutMode && !!(t as Element | null)?.closest?.('.node'),
      limits: () => {
        const pad = this.layoutMode ? 420 : 260;
        return { x0: -pad, y0: -pad, x1: W + pad, y1: H + pad };
      },
      onChange: (cam) => {
        this.world.setAttribute('transform', cam.transform);
        this.userMoved = this.userMoved || cam.suppressClick;
        this.onCameraChange();
      },
    });

    // Build elements
    for (const id of this.model.order) {
      this.nodeLayer.append(this.buildNode(this.model.nodes.get(id)!));
    }
    for (const edge of this.model.edges) {
      const els = this.buildEdge(edge);
      this.edgeLayer.append(els.g);
    }
    for (const id of this.model.order) {
      const n = this.model.nodes.get(id)!;
      if (n.kind !== 'instrument' && n.childIds.length) this.discLayer.append(this.buildDisc(n));
    }
    for (const id of this.model.order) this.labelLayer.append(this.buildLabel(this.model.nodes.get(id)!));

    this.attachEvents();
    this.ro = new ResizeObserver(() => this.onResize());
    this.ro.observe(opts.stage);
    this.onResize(true);
    this.refreshAll();
    this.select(this.model.rootId, 'init');
    void document.fonts?.ready.then(() => this.remeasureLabels());
  }

  destroy() {
    this.ro.disconnect();
    this.camera.destroy();
    this.svg.remove();
  }

  /* ------------------------------------------------------------ defs */
  private buildDefs(): SVGDefsElement {
    const defs = svg('defs');
    const branches: NodeBranch[] = ['country', 'national', 'regional', 'local'];
    const accent = this.opts.bundle.meta.theme.accent;
    for (const b of branches) {
      const base = b === 'country' ? mix(BRANCH_COLOR.country, accent, 0.28) : BRANCH_COLOR[b];
      defs.append(
        svg('linearGradient', { id: `rim-${b}`, x1: '0', y1: '0', x2: '1', y2: '1' }, [
          svg('stop', { offset: '0%', 'stop-color': lighten(base, 0.7) }),
          svg('stop', { offset: '38%', 'stop-color': base }),
          svg('stop', { offset: '72%', 'stop-color': darken(base, 0.35) }),
          svg('stop', { offset: '100%', 'stop-color': lighten(base, 0.35) }),
        ]),
        svg('radialGradient', { id: `well-${b}`, cx: '50%', cy: '42%', r: '65%' }, [
          svg('stop', { offset: '0%', 'stop-color': mix(darken(base, 0.55), '#0c1224', 0.25) }),
          svg('stop', { offset: '70%', 'stop-color': mix('#070b18', base, 0.1) }),
          svg('stop', { offset: '100%', 'stop-color': '#04060e' }),
        ]),
        svg('radialGradient', { id: `plate-${b}`, cx: '50%', cy: '35%', r: '75%' }, [
          svg('stop', { offset: '0%', 'stop-color': lighten(base, 0.25), 'stop-opacity': '0.95' }),
          svg('stop', { offset: '100%', 'stop-color': darken(base, 0.55), 'stop-opacity': '0.9' }),
        ]),
        svg('radialGradient', { id: `glow-${b}`, cx: '50%', cy: '50%', r: '50%' }, [
          svg('stop', { offset: '0%', 'stop-color': base, 'stop-opacity': '0.65' }),
          svg('stop', { offset: '45%', 'stop-color': base, 'stop-opacity': '0.2' }),
          svg('stop', { offset: '100%', 'stop-color': base, 'stop-opacity': '0' }),
        ]),
        svg('radialGradient', { id: `disc-${b}`, cx: '50%', cy: '50%', r: '50%' }, [
          svg('stop', { offset: '0%', 'stop-color': base, 'stop-opacity': '0.08' }),
          svg('stop', { offset: '78%', 'stop-color': base, 'stop-opacity': '0.045' }),
          svg('stop', { offset: '100%', 'stop-color': base, 'stop-opacity': '0.0' }),
        ]),
      );
    }
    defs.append(
      svg('filter', { id: 'blur-soft', x: '-50%', y: '-50%', width: '200%', height: '200%' }, [svg('feGaussianBlur', { stdDeviation: '5' })]),
      svg('filter', { id: 'blur-edge', x: '-50%', y: '-50%', width: '200%', height: '200%' }, [svg('feGaussianBlur', { stdDeviation: '2.2' })]),
    );
    return defs;
  }

  private buildGrid(W: number, H: number) {
    const step = 50;
    const g = this.gridLayer;
    g.append(svg('rect', { class: 'canvas-frame', x: 0, y: 0, width: W, height: H }));
    let d = '';
    for (let x = step; x < W; x += step) d += `M${x} 0V${H}`;
    for (let y = step; y < H; y += step) d += `M0 ${y}H${W}`;
    g.append(svg('path', { class: 'grid-lines', d }));
    let dm = '';
    for (let x = 100; x < W; x += 100) dm += `M${x} 0V${H}`;
    for (let y = 100; y < H; y += 100) dm += `M0 ${y}H${W}`;
    g.append(svg('path', { class: 'grid-major', d: dm }));
  }

  /* ----------------------------------------------------------- build */
  private accessibleName(n: FolioNode): string {
    const parts: string[] = [n.label];
    if (n.kind === 'country') parts.push('country core');
    else if (n.kind === 'level') parts.push('level of government');
    else {
      const lvl = this.model.nodes.get(n.levelId!)!;
      parts.push(`${lvl.label}`, CATEGORY_LABEL[n.category!] ?? 'instrument');
      if (n.status && n.status !== 'current') parts.push(STATUS_LABEL[n.status]);
      if (n.revenue?.nationalShare !== undefined) parts.push(`${formatShare(n.revenue.nationalShare)} of the national total`);
      else if (n.revenue) parts.push('amount reported without a share');
      else parts.push('no tax-specific amount');
    }
    return parts.join(', ');
  }

  private buildNode(n: FolioNode): SVGGElement {
    const b = n.branch;
    const r = n.r;
    const accent = this.opts.bundle.meta.theme.accent;
    const g = svg('g', {
      class: `node kind-${n.kind} branch-${b} ${n.radiusSource === 'revenue' ? 'sized' : 'unsized'} status-${n.status ?? 'current'}`,
      'data-id': n.id,
      role: 'button',
      tabindex: '-1',
      'aria-label': this.accessibleName(n),
      'aria-pressed': 'false',
    });
    const body = svg('g', { class: 'body' });
    body.append(
      svg('circle', { class: 'hit', r }),
      svg('circle', { class: 'aura', r: r * 2.05, fill: `url(#glow-${b})` }),
      svg('circle', { class: 'pulse', r: r * 1.12 }),
    );
    const core = svg('g', { class: 'core' });
    if (n.kind === 'country') {
      const rays = svg('g', { class: 'rays' });
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2;
        const long = i % 3 === 0;
        rays.append(
          svg('line', {
            x1: Math.cos(a) * r * (long ? 1.06 : 1.06),
            y1: Math.sin(a) * r * (long ? 1.06 : 1.06),
            x2: Math.cos(a) * r * (long ? 1.26 : 1.16),
            y2: Math.sin(a) * r * (long ? 1.26 : 1.16),
          }),
        );
      }
      core.append(rays, svg('circle', { class: 'orbit', r: r * 1.34, 'stroke-dasharray': `${r * 0.05} ${r * 0.24}` }));
    }
    core.append(
      svg('circle', { class: 'rim', r: r - 1.7, fill: `url(#well-${b})`, stroke: `url(#rim-${b})`, 'stroke-width': 3.4 }),
      svg('circle', { class: 'bevel', r: r * 0.9 }),
      svg('circle', { class: 'ticks', r: r * 0.82, 'stroke-dasharray': `1.6 ${((2 * Math.PI * r * 0.82) / (n.kind === 'instrument' ? 28 : 40) - 1.6).toFixed(2)}` }),
      svg('circle', { class: 'ring2', r: r * 0.7 }),
    );
    const plateR = r * (n.kind === 'instrument' ? 0.56 : 0.6);
    core.append(
      svg('path', { class: 'plate', d: plateShape(n.kind === 'instrument' ? n.category ?? 'tax' : 'tax', plateR), fill: `url(#plate-${b})` }),
    );
    if (n.kind === 'country') {
      core.append(svg('circle', { class: 'tint', r: r * 0.6, fill: accent, opacity: 0.22 }));
    }
    const gs = r * (n.kind === 'instrument' ? 0.62 : 0.72);
    const glyph = svg('g', { class: 'glyph', transform: `translate(${-gs / 2} ${-gs / 2}) scale(${gs / 24})` }, [
      svg('path', { d: GLYPH_PATHS[n.glyph] }),
    ]);
    core.append(glyph);
    // Decorative crown gem at the top of level and country cores.
    if (n.kind !== 'instrument') {
      core.append(svg('path', { class: 'crown', d: `M0 ${-r - 7}L4.2 ${-r - 1}L0 ${-r + 5}L-4.2 ${-r - 1}Z` }));
      // compass studs at east, south and west, like the points of an astrolabe
      const stud = (x: number, y: number) => svg('path', { class: 'stud', d: `M${x} ${y - 4}L${x + 3} ${y}L${x} ${y + 4}L${x - 3} ${y}Z` });
      core.append(stud(r, 0), stud(0, r), stud(-r, 0));
    }
    body.append(core);
    // a four-point glint that twinkles on the selected core (drawn above the core)
    const gr = Math.max(7, r * 0.2);
    body.append(
      svg('g', { transform: `translate(${(r * 0.74).toFixed(2)} ${(-r * 0.74).toFixed(2)})` }, [
        svg('path', {
          class: 'glint',
          d: `M0 ${-gr}L${gr * 0.16} ${-gr * 0.16}L${gr} 0L${gr * 0.16} ${gr * 0.16}L0 ${gr}L${-gr * 0.16} ${gr * 0.16}L${-gr} 0L${-gr * 0.16} ${-gr * 0.16}Z`,
        }),
      ]),
    );
    if (n.status && n.status !== 'current') {
      body.append(svg('circle', { class: 'status-ring', r: r + 6 }));
    }
    body.append(svg('circle', { class: 'focus-ring', r: r + 11 }));
    g.append(body);
    this.nodeEls.set(n.id, g);
    return g;
  }

  private buildEdge(edge: FolioEdge): EdgeEls {
    const g = svg('g', { class: `edge branch-${edge.branch}`, 'data-from': edge.from, 'data-to': edge.to });
    const glow = svg('line', { class: 'edge-glow' });
    const line = svg('line', { class: 'edge-line' });
    const flow = svg('line', { class: 'edge-flow' });
    const a = svg('circle', { class: 'socket socket-a', r: 3.4 });
    const bcirc = svg('circle', { class: 'socket socket-b', r: 3 });
    const joint = svg('path', { class: 'joint', d: 'M-5.2 0L0 -3.4L5.2 0L0 3.4Z' });
    g.append(glow, line, flow, joint, a, bcirc);
    const els = { g, glow, line, flow, a, b: bcirc, joint, edge };
    this.edgeEls.set(edge.to, els);
    return els;
  }

  private buildDisc(n: FolioNode): SVGGElement {
    const g = svg('g', { class: `disc branch-${n.branch} kind-${n.kind}`, 'data-for': n.id }, [
      svg('circle', { class: 'disc-fill', fill: `url(#disc-${n.branch})` }),
      svg('circle', { class: 'disc-edge' }),
      svg('circle', { class: 'disc-ticks' }),
      svg('circle', { class: 'disc-inner' }),
    ]);
    this.discEls.set(n.id, g);
    return g;
  }

  private buildLabel(n: FolioNode): SVGGElement {
    const g = svg('g', { class: `label kind-${n.kind} branch-${n.branch}`, 'data-for': n.id });
    const t1 = svg('text', { class: 'l1' });
    t1.textContent = n.kind === 'country' ? n.label.toUpperCase() : n.label;
    g.append(t1);
    let t2: SVGTextElement | null = null;
    if (n.sublabel && n.kind !== 'country') {
      t2 = svg('text', { class: 'l2' });
      t2.textContent = n.sublabel;
      g.append(t2);
    }
    const els: LabelEls = { g, t1, t2, w: 0, h: 0 };
    this.labelEls.set(n.id, els);
    this.measureLabel(n.id);
    return g;
  }

  private measureLabel(id: string) {
    const n = this.model.nodes.get(id)!;
    const els = this.labelEls.get(id)!;
    const f1 = n.kind === 'country' ? '600 15px Cinzel, Inter, serif' : n.kind === 'level' ? '700 14px Inter, "Segoe UI", system-ui, sans-serif' : LABEL_FONT;
    const w1 = textWidth(els.t1.textContent ?? '', f1) + (n.kind === 'country' ? (els.t1.textContent?.length ?? 0) * 1.6 : 0);
    const w2 = els.t2 ? textWidth(els.t2.textContent ?? '', SUB_FONT) : 0;
    els.w = Math.ceil(Math.max(w1, w2)) + 6;
    els.h = els.t2 ? 32 : 18;
  }

  private remeasureLabels() {
    for (const id of this.labelEls.keys()) this.measureLabel(id);
    this.layoutLabels();
  }

  /* ------------------------------------------------------- geometry */
  private disc(n: FolioNode): Disc {
    return { x: n.x, y: n.y, r: n.r };
  }

  private updateEdge(childId: string) {
    const els = this.edgeEls.get(childId);
    if (!els) return;
    const parent = this.model.nodes.get(els.edge.from)!;
    const child = this.model.nodes.get(els.edge.to)!;
    const geo = edgeGeometry(this.disc(parent), this.disc(child));
    for (const l of [els.glow, els.line, els.flow]) {
      l.setAttribute('x1', geo.a.x.toFixed(2));
      l.setAttribute('y1', geo.a.y.toFixed(2));
      l.setAttribute('x2', geo.b.x.toFixed(2));
      l.setAttribute('y2', geo.b.y.toFixed(2));
    }
    els.a.setAttribute('cx', geo.a.x.toFixed(2));
    els.a.setAttribute('cy', geo.a.y.toFixed(2));
    els.b.setAttribute('cx', geo.b.x.toFixed(2));
    els.b.setAttribute('cy', geo.b.y.toFixed(2));
    // The joint sits on the middle of the socket-to-socket segment, turned to follow it.
    const len = Math.hypot(geo.b.x - geo.a.x, geo.b.y - geo.a.y);
    const mx = (geo.a.x + geo.b.x) / 2;
    const my = (geo.a.y + geo.b.y) / 2;
    const deg = (Math.atan2(geo.b.y - geo.a.y, geo.b.x - geo.a.x) * 180) / Math.PI;
    els.joint.setAttribute('transform', `translate(${mx.toFixed(2)} ${my.toFixed(2)}) rotate(${deg.toFixed(2)})`);
    els.joint.style.display = len > 34 && !geo.hidden ? '' : 'none';
    els.g.classList.toggle('overlapping', geo.hidden);
  }

  private updateDisc(id: string) {
    const g = this.discEls.get(id);
    if (!g) return;
    const n = this.model.nodes.get(id)!;
    let rad = 0;
    for (const cid of descendantsOf(this.model, id)) {
      const c = this.model.nodes.get(cid)!;
      rad = Math.max(rad, Math.hypot(c.x - n.x, c.y - n.y) + c.r);
    }
    const isCountry = n.kind === 'country';
    const R = Math.max(rad + (isCountry ? 46 : 62), n.r * 2.4);
    g.setAttribute('transform', `translate(${n.x.toFixed(2)} ${n.y.toFixed(2)})`);
    const set = (sel: string, r: number) => g.querySelector(sel)!.setAttribute('r', r.toFixed(1));
    set('.disc-fill', R);
    set('.disc-edge', R);
    set('.disc-ticks', R * 0.955);
    set('.disc-inner', R * 0.86);
    (g.querySelector('.disc-ticks') as SVGElement).setAttribute('stroke-dasharray', `1.5 ${((2 * Math.PI * R * 0.955) / 120 - 1.5).toFixed(2)}`);
  }

  private nodeSet(id: string) {
    const n = this.model.nodes.get(id)!;
    const el = this.nodeEls.get(id)!;
    el.setAttribute('transform', `translate(${n.x.toFixed(2)} ${n.y.toFixed(2)})`);
    el.dataset.x = n.x.toFixed(2);
    el.dataset.y = n.y.toFixed(2);
    el.dataset.r = n.r.toFixed(2);
  }

  /** Re-derive everything that depends on a single core's centre or radius. */
  refreshNode(id: string) {
    this.nodeSet(id);
    const n = this.model.nodes.get(id)!;
    this.updateEdge(id);
    for (const cid of n.childIds) this.updateEdge(cid);
    // Discs of this core and all its ancestors
    let cur: FolioNode | undefined = n;
    while (cur) {
      this.updateDisc(cur.id);
      cur = cur.parentId ? this.model.nodes.get(cur.parentId) : undefined;
    }
    this.updateHits();
    this.layoutLabels();
  }

  refreshAll() {
    for (const id of this.model.order) {
      this.nodeSet(id);
      this.updateEdge(id);
      this.updateDisc(id);
    }
    this.applyRadiusToEls();
    this.updateHits();
    this.layoutLabels();
  }

  /** Rebuild radius-dependent decoration for a core (needed after a size change). */
  private applyRadiusToEls() {
    for (const id of this.model.order) {
      const n = this.model.nodes.get(id)!;
      const old = this.nodeEls.get(id)!;
      if (old.dataset.built === String(n.r)) continue;
      const fresh = this.buildNode(n);
      fresh.dataset.built = String(n.r);
      this.nodeLayer.replaceChild(fresh, old);
      this.nodeEls.set(id, fresh);
      this.nodeSet(id);
    }
    this.applyStateClasses();
  }

  private updateHits() {
    const discs = new Map<string, Disc>();
    for (const [id, n] of this.model.nodes) discs.set(id, this.disc(n));
    for (const [id, el] of this.nodeEls) {
      const hit = el.querySelector('.hit');
      if (hit) hit.setAttribute('r', hitRadius(id, discs, this.camera.k).toFixed(2));
    }
  }

  setNodePosition(id: string, x: number, y: number) {
    const n = this.model.nodes.get(id)!;
    const { width: W, height: H } = this.model.canvas;
    n.x = clamp(x, 0, W);
    n.y = clamp(y, 0, H);
    this.refreshNode(id);
    this.opts.onLayoutChange?.({ id, x: n.x, y: n.y });
  }

  /** Change a core's radius (only allowed when it is not sized by revenue). */
  setNodeRadius(id: string, r: number) {
    const n = this.model.nodes.get(id)!;
    if (n.radiusSource === 'revenue') return;
    n.r = clamp(r, 14, 160);
    n.radiusSource = 'override';
    const old = this.nodeEls.get(id)!;
    const fresh = this.buildNode(n);
    fresh.dataset.built = String(n.r);
    this.nodeLayer.replaceChild(fresh, old);
    this.nodeEls.set(id, fresh);
    this.applyStateClasses();
    this.refreshNode(id);
    this.opts.onLayoutChange?.({ id, r: n.r });
  }

  getLayout(): Layout {
    const positions: Layout['positions'] = {};
    const radii: Layout['radii'] = {};
    for (const [id, n] of this.model.nodes) {
      positions[id] = { x: Math.round(n.x * 10) / 10, y: Math.round(n.y * 10) / 10 };
      if (n.radiusSource === 'override') radii[id] = Math.round(n.r * 10) / 10;
    }
    return { version: 1, canvas: this.model.canvas, positions, radii };
  }

  applyLayout(layout: Layout) {
    for (const [id, n] of this.model.nodes) {
      const p = layout.positions[id];
      if (p) {
        n.x = p.x;
        n.y = p.y;
      }
      if (n.radiusSource !== 'revenue') {
        const fromLayout = layout.radii[id];
        const base = n.kind === 'country' ? 96 : n.kind === 'level' ? 62 : this.opts.bundle.meta.sizing.neutralRadius ?? 34;
        n.r = fromLayout ?? base;
        n.radiusSource = fromLayout ? 'override' : n.kind === 'instrument' ? 'neutral' : 'structural';
      }
    }
    this.refreshAll();
  }

  /* ---------------------------------------------------------- camera */
  private contentBounds(ids?: string[]): Bounds {
    const list = ids ?? this.model.order;
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (const id of list) {
      const n = this.model.nodes.get(id)!;
      x0 = Math.min(x0, n.x - n.r - 40);
      y0 = Math.min(y0, n.y - n.r - 34);
      x1 = Math.max(x1, n.x + n.r + 40);
      y1 = Math.max(y1, n.y + n.r + 56);
    }
    return { x0, y0, x1, y1 };
  }

  fitGraph(animate = 0) {
    const ids = this.levelFilter
      ? [this.model.rootId, this.levelFilter, ...descendantsOf(this.model, this.levelFilter)]
      : undefined;
    return this.camera.fit(this.contentBounds(ids), { pad: this.opts.getInsets(), animate });
  }

  private onResize(first = false) {
    // Layout size, not the bounding rect: the rect is scaled by the screen-entrance transform,
    // and a viewBox measured then would stay ~1.5 % off for the life of the view.
    const r = { width: this.opts.stage.clientWidth, height: this.opts.stage.clientHeight };
    if (r.width < 2 || r.height < 2) return;
    this.svg.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
    this.camera.setViewport(r.width, r.height);
    if (first || !this.userMoved) this.fitGraph(0);
    else this.camera.zoomBy(1);
    this.layoutLabels();
  }

  private onCameraChange() {
    this.updateHits();
    this.layoutLabels();
  }

  focusNode(id: string, zoomTo?: number) {
    const n = this.model.nodes.get(id)!;
    const ins = this.opts.getInsets();
    if (zoomTo && this.camera.k < zoomTo) {
      const k = zoomTo;
      const x = (this.camera.width + ins.left - ins.right) / 2 - n.x * k;
      const y = (this.camera.height + ins.top - ins.bottom) / 2 - n.y * k;
      void this.camera.animateTo({ k, x, y }, prefersReducedMotion() ? 1 : 450);
    } else {
      this.camera.reveal(n.x, n.y, Math.max(70, n.r * this.camera.k + 40), ins);
    }
  }

  /* --------------------------------------------------------- selection */
  select(id: string, source: SelectSource = 'pointer') {
    if (!this.model.nodes.has(id)) return;
    this.selectedId = id;
    const path = pathTo(this.model, id);
    this.pathSet = new Set(path);
    this.childSet = new Set(this.model.nodes.get(id)!.childIds);
    this.applyStateClasses();
    this.layoutLabels();
    if (source !== 'pointer' && source !== 'init' && source !== 'drag') this.focusNode(id);
    this.opts.onSelect(id, source);
  }

  setLevelFilter(levelId: string | null, animate = true) {
    this.levelFilter = levelId;
    this.applyStateClasses();
    this.userMoved = false;
    void this.fitGraph(animate ? 550 : 0);
    if (levelId && !this.isVisible(this.selectedId)) this.select(levelId, 'outline');
    this.layoutLabels();
  }

  isVisible(id: string): boolean {
    if (!this.levelFilter) return true;
    const n = this.model.nodes.get(id)!;
    return n.kind === 'country' || n.levelId === this.levelFilter;
  }

  visibleOrder(): string[] {
    return this.model.order.filter((id) => this.isVisible(id));
  }

  private applyStateClasses() {
    for (const [id, el] of this.nodeEls) {
      const sel = id === this.selectedId;
      const filtered = !this.isVisible(id);
      el.classList.toggle('is-selected', sel);
      el.classList.toggle('on-path', this.pathSet.has(id));
      el.classList.toggle('is-child', this.childSet.has(id));
      el.classList.toggle('is-filtered', filtered);
      el.classList.toggle('is-hover', id === this.hoverId);
      el.setAttribute('aria-pressed', String(sel));
      el.setAttribute('tabindex', sel && !filtered ? '0' : '-1');
      if (filtered) el.setAttribute('aria-hidden', 'true');
      else el.removeAttribute('aria-hidden');
    }
    for (const [childId, els] of this.edgeEls) {
      const parentId = els.edge.from;
      const lit = this.pathSet.has(childId) && this.pathSet.has(parentId);
      const soft = parentId === this.selectedId;
      els.g.classList.toggle('lit', lit);
      els.g.classList.toggle('soft', soft && !lit);
      els.g.classList.toggle('is-filtered', !this.isVisible(childId) || (!this.isVisible(parentId)));
    }
    for (const [id, g] of this.discEls) {
      g.classList.toggle('is-filtered', !!this.levelFilter && id !== this.levelFilter && id !== this.model.rootId);
      g.classList.toggle('on-path', this.pathSet.has(id));
    }
    this.svg.classList.toggle('has-filter', !!this.levelFilter);
  }

  /* ----------------------------------------------------------- labels */
  layoutLabels = rafThrottle(() => this.doLayoutLabels());

  private doLayoutLabels() {
    const cam = this.camera;
    const k = cam.k;
    const ins = this.opts.getInsets();
    const safe = { x0: 8, y0: Math.max(8, ins.top - 24), x1: cam.width - 8, y1: cam.height - Math.max(8, ins.bottom - 18) };
    const discs: { id: string; x: number; y: number; r: number }[] = [];
    for (const [id, n] of this.model.nodes) {
      const s = cam.toScreen(n.x, n.y);
      discs.push({ id, x: s.x, y: s.y, r: n.r * k + 2 });
    }
    const priority = (id: string): number => {
      const n = this.model.nodes.get(id)!;
      let p = 100 + Math.min(n.r, 60);
      if (id === this.selectedId) p += 5000;
      else if (id === this.hoverId) p += 4000;
      else if (this.pathSet.has(id)) p += 3000;
      else if (this.childSet.has(id)) p += 800;
      if (n.kind === 'country') p += 1500;
      if (n.kind === 'level') p += 1200;
      return p;
    };
    const order = [...this.model.order].sort((a, b) => priority(b) - priority(a));
    const placed: { x0: number; y0: number; x1: number; y1: number }[] = [];
    const exclusions = this.opts.getExclusions?.() ?? [];
    type Rect = { x0: number; y0: number; x1: number; y1: number };
    const overlaps = (a: Rect, b: Rect) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
    for (const id of order) {
      const n = this.model.nodes.get(id)!;
      const els = this.labelEls.get(id)!;
      const must = priority(id) >= 3000 || n.kind === 'country';
      if (!this.isVisible(id) && id !== this.selectedId) {
        els.g.style.display = 'none';
        continue;
      }
      const emph = id === this.selectedId || id === this.hoverId || this.pathSet.has(id);
      // Sub-labels are dropped when zoomed far out, to leave room for the names themselves.
      const showSub = !!els.t2 && (emph || n.kind === 'level' || k > 0.42);
      if (els.t2) els.t2.style.display = showSub ? '' : 'none';
      const c = cam.toScreen(n.x, n.y);
      const rs = n.r * k;
      const gap = 5;
      const w = els.w;
      const h = showSub ? els.h : 18;
      const pref = n.labelSide ?? 'below';
      const sides = [pref, 'below', 'above', 'right', 'left'].filter((s, i, arr) => arr.indexOf(s) === i) as ('below' | 'above' | 'left' | 'right')[];
      let chosen: { side: string; rect: Rect; dx: number; cost: number } | null = null;
      for (const side of sides) {
        let x0: number;
        let y0: number;
        if (side === 'below') {
          x0 = c.x - w / 2;
          y0 = c.y + rs + gap;
        } else if (side === 'above') {
          x0 = c.x - w / 2;
          y0 = c.y - rs - gap - h;
        } else if (side === 'right') {
          x0 = c.x + rs + gap;
          y0 = c.y - h / 2;
        } else {
          x0 = c.x - rs - gap - w;
          y0 = c.y - h / 2;
        }
        // keep inside the safe frame by shifting horizontally
        let dx = 0;
        if (side === 'below' || side === 'above') {
          const nx = clamp(x0, safe.x0, Math.max(safe.x0, safe.x1 - w));
          dx = nx - x0;
          x0 = nx;
        }
        const rect: Rect = { x0: x0 - 2, y0: y0 - 1, x1: x0 + w + 2, y1: y0 + h + 1 };
        let cost = 0;
        if (rect.x0 < safe.x0 || rect.x1 > safe.x1 || rect.y0 < safe.y0 || rect.y1 > safe.y1) cost += 5000;
        for (const d of discs) {
          if (d.id === id) continue;
          const px = clamp(d.x, rect.x0, rect.x1);
          const py = clamp(d.y, rect.y0, rect.y1);
          if (Math.hypot(px - d.x, py - d.y) < d.r) cost += 400;
        }
        for (const p of placed) if (overlaps(rect, p)) cost += 1000;
        for (const ex of exclusions) if (overlaps(rect, ex)) cost += 3000;
        // mild preference for the requested side
        if (side !== pref) cost += 3;
        if (!chosen || cost < chosen.cost) chosen = { side, rect, dx, cost };
        if (cost <= 3) break;
      }
      if (!chosen || (chosen.cost >= 400 && !must)) {
        els.g.style.display = 'none';
        continue;
      }
      placed.push(chosen.rect);
      els.g.style.display = '';
      els.g.setAttribute('transform', `translate(${n.x.toFixed(2)} ${n.y.toFixed(2)}) scale(${(1 / k).toFixed(5)})`);
      const { side, dx } = chosen;
      const baseY = side === 'below' ? rs + gap : side === 'above' ? -rs - gap - h : -h / 2;
      const anchorX = side === 'right' ? rs + gap : side === 'left' ? -rs - gap : dx;
      const anchor = side === 'right' ? 'start' : side === 'left' ? 'end' : 'middle';
      els.t1.setAttribute('text-anchor', anchor);
      els.t1.setAttribute('x', anchorX.toFixed(1));
      els.t1.setAttribute('y', (baseY + 13).toFixed(1));
      if (els.t2) {
        els.t2.setAttribute('text-anchor', anchor);
        els.t2.setAttribute('x', anchorX.toFixed(1));
        els.t2.setAttribute('y', (baseY + 28).toFixed(1));
      }
      els.g.classList.toggle('emph', emph);
    }
  }

  /* ----------------------------------------------------------- events */
  private nodeIdFromEvent(ev: Event): string | null {
    const el = (ev.target as Element | null)?.closest?.('.node') as SVGGElement | null;
    return el?.dataset.id ?? null;
  }

  private attachEvents() {
    const layer = this.nodeLayer;
    layer.addEventListener('click', (ev) => {
      if (this.camera.suppressClick || this.drag?.moved) return;
      const id = this.nodeIdFromEvent(ev);
      if (id && this.isVisible(id)) this.select(id, 'pointer');
    });
    layer.addEventListener('pointerover', (ev) => {
      const id = this.nodeIdFromEvent(ev);
      if (id !== this.hoverId) {
        this.hoverId = id;
        this.nodeEls.forEach((el, nid) => el.classList.toggle('is-hover', nid === id));
        this.layoutLabels();
      }
    });
    layer.addEventListener('pointerleave', () => {
      if (this.hoverId) {
        this.hoverId = null;
        this.nodeEls.forEach((el) => el.classList.remove('is-hover'));
        this.layoutLabels();
      }
    });
    layer.addEventListener('focusin', (ev) => {
      const id = this.nodeIdFromEvent(ev);
      if (id && id !== this.hoverId) {
        this.hoverId = id;
        this.layoutLabels();
      }
    });
    layer.addEventListener('focusout', () => {
      this.hoverId = null;
      this.layoutLabels();
    });
    layer.addEventListener('keydown', (ev) => this.onKey(ev as KeyboardEvent));
    // click on empty canvas returns to the country overview
    this.svg.addEventListener('click', (ev) => {
      if (this.camera.suppressClick) return;
      if ((ev.target as Element).closest('.node')) return;
      if (this.selectedId !== this.model.rootId && !this.layoutMode) this.select(this.model.rootId, 'pointer');
    });
    this.svg.addEventListener('pointerdown', (ev) => this.onPointerDown(ev));
    this.svg.addEventListener('pointermove', (ev) => this.onPointerMove(ev));
    this.svg.addEventListener('pointerup', (ev) => this.onPointerUp(ev));
    this.svg.addEventListener('pointercancel', (ev) => this.onPointerUp(ev));
  }

  private onKey(ev: KeyboardEvent) {
    const id = this.nodeIdFromEvent(ev);
    if (!id) return;
    const n = this.model.nodes.get(id)!;
    const vis = this.visibleOrder();
    const i = vis.indexOf(id);
    let next: string | null = null;
    if (this.layoutMode && ev.altKey && ev.key.startsWith('Arrow')) {
      const step = ev.shiftKey ? 10 : 1;
      const dx = ev.key === 'ArrowLeft' ? -step : ev.key === 'ArrowRight' ? step : 0;
      const dy = ev.key === 'ArrowUp' ? -step : ev.key === 'ArrowDown' ? step : 0;
      this.setNodePosition(id, n.x + dx, n.y + dy);
      ev.preventDefault();
      return;
    }
    switch (ev.key) {
      case 'ArrowDown':
        next = vis[Math.min(vis.length - 1, i + 1)];
        break;
      case 'ArrowUp':
        next = vis[Math.max(0, i - 1)];
        break;
      case 'ArrowRight':
        next = n.childIds.find((c) => this.isVisible(c)) ?? null;
        break;
      case 'ArrowLeft':
        next = n.parentId;
        break;
      case 'Home':
        next = vis[0];
        break;
      case 'End':
        next = vis[vis.length - 1];
        break;
      case 'Enter':
      case ' ':
        this.select(id, 'keyboard');
        ev.preventDefault();
        return;
      default:
        return;
    }
    ev.preventDefault();
    if (next && next !== id) {
      this.select(next, 'keyboard');
      this.nodeEls.get(next)?.focus({ preventScroll: true });
    }
  }

  focusSelected() {
    this.nodeEls.get(this.selectedId)?.focus({ preventScroll: true });
  }

  /* ------------------------------------------------------ layout drag */
  setLayoutMode(on: boolean) {
    this.layoutMode = on;
    this.svg.classList.toggle('layout-mode', on);
    this.svg.classList.toggle('show-grid', on && this.showGrid);
    this.camera.zoomBy(1);
  }

  setShowGrid(on: boolean) {
    this.showGrid = on;
    this.svg.classList.toggle('show-grid', this.layoutMode && on);
  }

  private onPointerDown(ev: PointerEvent) {
    if (!this.layoutMode || (ev.button !== 0 && ev.pointerType === 'mouse')) return;
    const id = this.nodeIdFromEvent(ev);
    if (!id) return;
    const n = this.model.nodes.get(id)!;
    const p = this.camera.local(ev);
    const w = this.camera.toWorld(p.x, p.y);
    // The grab offset keeps the core under the same point of itself that the pointer grabbed.
    this.drag = { id, pointerId: ev.pointerId, dx: n.x - w.x, dy: n.y - w.y, lastX: p.x, lastY: p.y, moved: false, raf: 0 };
    try {
      this.svg.setPointerCapture(ev.pointerId);
    } catch {
      /* ignore */
    }
    this.nodeEls.get(id)?.classList.add('dragging');
    this.select(id, 'drag');
    ev.preventDefault();
  }

  private dragTo(sx: number, sy: number) {
    const d = this.drag;
    if (!d) return;
    const w = this.camera.toWorld(sx, sy);
    let x = w.x + d.dx;
    let y = w.y + d.dy;
    if (this.snap > 0) {
      x = Math.round(x / this.snap) * this.snap;
      y = Math.round(y / this.snap) * this.snap;
    }
    this.setNodePosition(d.id, x, y);
  }

  private onPointerMove(ev: PointerEvent) {
    const d = this.drag;
    if (!d || ev.pointerId !== d.pointerId) return;
    const p = this.camera.local(ev);
    if (!d.moved && Math.hypot(p.x - d.lastX, p.y - d.lastY) < 3) return;
    d.moved = true;
    d.lastX = p.x;
    d.lastY = p.y;
    this.dragTo(p.x, p.y);
    this.autoPan();
  }

  /** Nudge the camera when the pointer is held near the edge, so cores can be placed right up to any border. */
  private autoPan() {
    const d = this.drag;
    if (!d || d.raf) return;
    const step = () => {
      const dd = this.drag;
      if (!dd) return;
      dd.raf = 0;
      const zone = 56;
      const speed = 14;
      let mx = 0;
      let my = 0;
      if (dd.lastX < zone) mx = speed * (1 - dd.lastX / zone);
      else if (dd.lastX > this.camera.width - zone) mx = -speed * (1 - (this.camera.width - dd.lastX) / zone);
      if (dd.lastY < zone) my = speed * (1 - dd.lastY / zone);
      else if (dd.lastY > this.camera.height - zone) my = -speed * (1 - (this.camera.height - dd.lastY) / zone);
      if (mx || my) {
        this.camera.panBy(mx, my);
        this.dragTo(dd.lastX, dd.lastY);
        dd.raf = requestAnimationFrame(step);
      }
    };
    d.raf = requestAnimationFrame(step);
  }

  private onPointerUp(ev: PointerEvent) {
    const d = this.drag;
    if (!d || ev.pointerId !== d.pointerId) return;
    cancelAnimationFrame(d.raf);
    this.nodeEls.get(d.id)?.classList.remove('dragging');
    const moved = d.moved;
    this.drag = moved ? { ...d, raf: 0 } : null;
    if (this.svg.hasPointerCapture?.(ev.pointerId)) this.svg.releasePointerCapture(ev.pointerId);
    // Let the trailing click event see `moved`, then clear.
    setTimeout(() => {
      this.drag = null;
    }, 0);
  }

  /* ------------------------------------------------------ measurement */
  /** Screen-space geometry of a core and its sockets, used by the verification script. */
  measure(id: string) {
    const el = this.nodeEls.get(id)!;
    const rim = el.querySelector('.rim') as SVGCircleElement;
    const ctm = rim.getScreenCTM()!;
    const r = rim.getBoundingClientRect();
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, width: r.width, scale: ctm.a };
  }
}
