/**
 * Interactive world map. The countries themselves are the interactive shapes:
 * countries with a folio are lit and focusable; all others stay visible but inert.
 * No pins, bubbles or floating cores are drawn on the map.
 */
import { geoGraticule, geoNaturalEarth1, geoPath, type GeoPermissibleObjects } from 'd3-geo';
import { feature, mesh } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import worldUrl from 'world-atlas/countries-50m.json?url';
import type { CountryMeta } from '../data/schema';
import { Camera, type Bounds, type Insets } from '../ui/camera';
import { svg, prefersReducedMotion } from '../util/dom';
import { mix } from '../folio/palette';

export interface MapViewOptions {
  stage: HTMLElement;
  countries: CountryMeta[];
  getInsets: () => Insets;
  onSelect: (id: string) => void;
}

type CountryFeature = Feature<Geometry, { name: string }> & { id?: string };

const W = 1600;

export class MapView {
  readonly camera!: Camera;
  private svg!: SVGSVGElement;
  private world!: SVGGElement;
  private labelLayer!: SVGGElement;
  private astro!: SVGGElement;
  private tip!: HTMLElement;
  private ro!: ResizeObserver;
  private H = 800;
  private bounds!: Bounds;
  private byId = new Map<string, { meta: CountryMeta; feature: CountryFeature; bbox: Bounds; g: SVGGElement }>();
  private labels: { el: SVGGElement; x: number; y: number }[] = [];
  private path = geoPath();
  private ready = false;
  private userMoved = false;

  constructor(private opts: MapViewOptions) {}

  async init(startAt?: string) {
    const { stage, countries } = this.opts;
    const res = await fetch(worldUrl);
    const topo = (await res.json()) as Topology;
    const collection = feature(topo, topo.objects.countries as GeometryCollection) as FeatureCollection<Geometry, { name: string }>;
    const projection = geoNaturalEarth1().fitWidth(W - 60, { type: 'Sphere' });
    this.path = geoPath(projection);
    const [[, y0], [, y1]] = this.path.bounds({ type: 'Sphere' });
    this.H = Math.ceil(y1 - y0 + 60);
    projection.translate([projection.translate()[0] + 30 - 30, projection.translate()[1] - y0 + 30]);
    const pathGen = geoPath(projection);
    this.path = pathGen;
    this.bounds = { x0: 0, y0: 0, x1: W, y1: this.H };

    this.svg = svg('svg', { class: 'map-svg', role: 'group', 'aria-label': 'World map. Countries with a tax folio are highlighted and can be opened.' });
    const defs = svg('defs');
    defs.append(
      svg('filter', { id: 'map-glow', x: '-30%', y: '-30%', width: '160%', height: '160%' }, [
        svg('feGaussianBlur', { stdDeviation: '3.2' }),
      ]),
      svg('radialGradient', { id: 'ocean-grad', cx: '50%', cy: '45%', r: '65%' }, [
        svg('stop', { offset: '0%', 'stop-color': '#0f1a3a' }),
        svg('stop', { offset: '100%', 'stop-color': '#070c1d' }),
      ]),
    );
    this.astro = svg('g', { class: 'astrolabe', 'aria-hidden': 'true' });
    this.world = svg('g', { class: 'cam' });
    this.labelLayer = svg('g', { class: 'map-labels', 'aria-hidden': 'true' });
    this.svg.append(defs, this.astro, this.world);

    // Sphere + graticule + climate lines
    const sphere = svg('path', { class: 'sphere', d: pathGen({ type: 'Sphere' }) ?? '', fill: 'url(#ocean-grad)' });
    const grat = svg('path', { class: 'graticule', d: pathGen(geoGraticule().step([30, 30])()) ?? '' });
    const lat = (v: number) => ({ type: 'LineString', coordinates: Array.from({ length: 361 }, (_, i) => [-180 + i, v]) }) as GeoPermissibleObjects;
    const lines = svg('g', { class: 'climate-lines' });
    for (const [v, cls] of [[0, 'equator'], [23.4366, 'tropic'], [-23.4366, 'tropic'], [66.5634, 'polar'], [-66.5634, 'polar']] as [number, string][]) {
      lines.append(svg('path', { class: cls, d: pathGen(lat(v)) ?? '' }));
    }
    this.world.append(sphere, grat, lines);

    const activeIds = new Map(countries.map((c) => [c.isoNumeric, c]));
    const inactiveLayer = svg('g', { class: 'countries-inactive' });
    const activeLayer = svg('g', { class: 'countries-active' });
    for (const f of collection.features as CountryFeature[]) {
      if (f.id === '010') continue; // Antarctica omitted: it is not part of any current folio and crowds the map
      const d = pathGen(f as unknown as GeoPermissibleObjects);
      if (!d) continue;
      const meta = f.id ? activeIds.get(String(f.id).padStart(3, '0')) : undefined;
      if (!meta) {
        inactiveLayer.append(svg('path', { class: 'country', d, 'data-name': f.properties?.name ?? '' }));
        continue;
      }
      const [[bx0, by0], [bx1, by1]] = pathGen.bounds(f as unknown as GeoPermissibleObjects);
      const g = svg('g', {
        class: 'country active',
        'data-id': meta.id,
        'data-name': meta.names.en,
        role: 'link',
        tabindex: '0',
        'aria-label': `${meta.names.en}: open tax folio`,
        style: `--a:${meta.theme.accent};--a2:${meta.theme.accent2};--fill:${mix(meta.theme.accent, '#0a1230', 0.62)}`,
      });
      g.append(
        svg('path', { class: 'glow', d, filter: 'url(#map-glow)' }),
        svg('path', { class: 'shape', d }),
        svg('path', { class: 'hit', d }),
      );
      activeLayer.append(g);
      this.byId.set(meta.id, { meta, feature: f, bbox: { x0: bx0, y0: by0, x1: bx1, y1: by1 }, g });
    }
    const borders = svg('path', { class: 'borders', d: pathGen(mesh(topo, topo.objects.countries as GeometryCollection, (a, b) => a !== b)) ?? '' });
    this.world.append(inactiveLayer, borders, activeLayer, this.labelLayer);

    // Cartographic lettering for illuminated countries (plain text on the shape, not a bubble).
    for (const { meta, bbox } of this.byId.values()) {
      const ml = meta.theme.mapLabel;
      const p = ml ? projection([ml.lon, ml.lat]) : [(bbox.x0 + bbox.x1) / 2, (bbox.y0 + bbox.y1) / 2];
      if (!p) continue;
      const g = svg('g', { class: 'map-label' });
      const t = svg('text', { 'text-anchor': 'middle' });
      t.textContent = meta.names.en.toUpperCase();
      g.append(t);
      this.labelLayer.append(g);
      this.labels.push({ el: g, x: p[0], y: p[1] });
    }

    this.tip = document.createElement('div');
    this.tip.className = 'map-tip';
    this.tip.setAttribute('role', 'tooltip');
    this.tip.hidden = true;
    stage.append(this.svg, this.tip);

    (this as { camera: Camera }).camera = new Camera(this.svg, {
      minK: 0.2,
      maxK: 40,
      limits: () => ({ x0: -40, y0: -40, x1: W + 40, y1: this.H + 40 }),
      onChange: (cam) => {
        this.world.setAttribute('transform', cam.transform);
        this.userMoved = this.userMoved || cam.suppressClick;
        this.updateLabels();
        this.updateAstrolabe();
      },
    });
    this.attachEvents();
    this.ro = new ResizeObserver(() => this.onResize());
    this.ro.observe(stage);
    this.ready = true;
    this.onResize(startAt);
  }

  destroy() {
    this.ro?.disconnect();
    this.camera?.destroy();
    this.svg?.remove();
    this.tip?.remove();
  }

  private onResize(startAt?: string) {
    const r = { width: this.opts.stage.clientWidth, height: this.opts.stage.clientHeight };
    if (r.width < 2 || r.height < 2) return;
    this.svg.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
    this.camera.setViewport(r.width, r.height);
    if (startAt && this.byId.has(startAt)) {
      this.returnFrom(startAt);
      return;
    }
    if (this.camera.animating) return;
    if (!this.userMoved) void this.fitWorld(0);
    else this.camera.zoomBy(1);
  }

  /** Start zoomed on a country (as if we just left its folio) and pull back to the whole world. */
  returnFrom(id: string) {
    const c = this.byId.get(id);
    if (!c) return;
    this.svg.classList.remove('is-zooming');
    this.byId.forEach((x) => x.g.classList.remove('is-focus'));
    const t = this.camera.fitTransform(c.bbox, { top: 100, right: 100, bottom: 100, left: 100 });
    t.k = Math.min(t.k, 14);
    this.camera.set(t.k, t.x, t.y);
    c.g.classList.add('is-focus');
    void this.fitWorld(prefersReducedMotion() ? 0 : 900).then(() => c.g.classList.remove('is-focus'));
  }

  fitWorld(ms = 0) {
    return this.camera.fit(this.bounds, { pad: this.opts.getInsets(), animate: ms });
  }

  /** Animate into a country; resolves when the camera has arrived. */
  async zoomToCountry(id: string) {
    const c = this.byId.get(id);
    if (!c) return;
    this.svg.classList.add('is-zooming');
    c.g.classList.add('is-focus');
    const t = this.camera.fitTransform(c.bbox, { top: 100, right: 100, bottom: 100, left: 100 });
    // Don't zoom in absurdly far on small countries.
    t.k = Math.min(t.k, 14);
    await this.camera.animateTo(t, prefersReducedMotion() ? 1 : 780);
  }

  private updateLabels() {
    const k = this.camera.k;
    for (const l of this.labels) {
      l.el.setAttribute('transform', `translate(${l.x.toFixed(2)} ${l.y.toFixed(2)}) scale(${(1 / k).toFixed(5)})`);
      // Fade the lettering when the country is huge on screen (the shape itself is then the label)
      l.el.style.opacity = k > 6 ? '0' : '1';
    }
  }

  private updateAstrolabe() {
    // Decorative concentric rings centred on the map, drawn in screen space.
    const cam = this.camera;
    const c = cam.toScreen(W / 2, this.H / 2);
    const base = (this.H * cam.k) / 2;
    if (this.astro.dataset.k === `${cam.k.toFixed(3)}:${c.x.toFixed(0)}:${c.y.toFixed(0)}`) return;
    this.astro.dataset.k = `${cam.k.toFixed(3)}:${c.x.toFixed(0)}:${c.y.toFixed(0)}`;
    while (this.astro.firstChild) this.astro.removeChild(this.astro.firstChild);
    const radii = [1.12, 1.42, 1.78];
    radii.forEach((f, i) => {
      const r = base * f * 1.45;
      this.astro.append(
        svg('ellipse', { class: `ring ring-${i}`, cx: c.x, cy: c.y, rx: r * 1.32, ry: r }),
      );
    });
    const r = base * 1.12 * 1.45;
    let ticks = '';
    for (let i = 0; i < 180; i++) {
      const a = (i / 180) * Math.PI * 2;
      const long = i % 5 === 0;
      const rx = r * 1.32;
      const ry = r;
      const l = long ? 12 : 6;
      ticks += `M${(c.x + Math.cos(a) * rx).toFixed(1)} ${(c.y + Math.sin(a) * ry).toFixed(1)}L${(c.x + Math.cos(a) * (rx + l)).toFixed(1)} ${(c.y + Math.sin(a) * (ry + l * 0.76)).toFixed(1)}`;
    }
    this.astro.append(svg('path', { class: 'ticks', d: ticks }));
  }

  /* ------------------------------------------------------------ events */
  private attachEvents() {
    const activate = (id: string) => this.opts.onSelect(id);
    this.world.addEventListener('click', (ev) => {
      if (this.camera.suppressClick) return;
      const g = (ev.target as Element).closest('.country.active') as SVGGElement | null;
      if (g) activate(g.dataset.id!);
    });
    this.world.addEventListener('keydown', (ev) => {
      const e = ev as KeyboardEvent;
      const g = (e.target as Element).closest('.country.active') as SVGGElement | null;
      if (g && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        activate(g.dataset.id!);
      }
    });
    const showTip = (el: Element, x: number, y: number) => {
      const name = (el as HTMLElement).getAttribute('data-name');
      if (!name) return this.hideTip();
      const active = el.classList.contains('active');
      this.tip.innerHTML = '';
      const strong = document.createElement('strong');
      strong.textContent = name;
      const small = document.createElement('span');
      small.textContent = active ? 'Open tax folio' : 'Folio not yet available';
      small.className = active ? 'on' : 'off';
      this.tip.append(strong, small);
      this.tip.hidden = false;
      const r = this.opts.stage.getBoundingClientRect();
      const tx = Math.min(r.width - 190, Math.max(8, x - r.left + 14));
      const ty = Math.min(r.height - 60, Math.max(8, y - r.top + 16));
      this.tip.style.transform = `translate(${tx}px, ${ty}px)`;
    };
    this.world.addEventListener('pointermove', (ev) => {
      if (ev.pointerType === 'touch' || (ev.buttons & 1) === 1) return;
      const el = (ev.target as Element).closest('[data-name]');
      if (el) showTip(el, ev.clientX, ev.clientY);
      else this.hideTip();
    });
    this.world.addEventListener('pointerleave', () => this.hideTip());
    this.world.addEventListener('focusin', (ev) => {
      const g = (ev.target as Element).closest('.country.active') as SVGGElement | null;
      if (!g) return;
      const b = g.getBoundingClientRect();
      showTip(g, b.left + b.width / 2, b.top + b.height / 2);
    });
    this.world.addEventListener('focusout', () => this.hideTip());
  }

  private hideTip() {
    this.tip.hidden = true;
  }

  get isReady() {
    return this.ready;
  }
}
