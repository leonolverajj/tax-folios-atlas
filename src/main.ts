import './styles/main.css';
import './styles/charts.css';
import './styles/arena.css';
import '@fontsource/cinzel/latin-500.css';
import '@fontsource/cinzel/latin-700.css';
import '@fontsource-variable/inter/wght.css';
import { loadCountry, registry, registryById } from './data/loader';
import { FolioView } from './folio/folioView';
import { MapView } from './map/worldMap';
import { DetailPanel } from './ui/detailPanel';
import { Outline } from './ui/outline';
import { renderLegend } from './ui/legend';
import { LayoutEditor, layoutEditingAvailable } from './ui/layoutEditor';
import { mountStarfield } from './ui/starfield';
import { mountAbout } from './ui/about';
import { announce, esc, prefersReducedMotion } from './util/dom';
import { BRANCH_COLOR } from './folio/palette';
import { formatShare } from './data/format';
import type { Insets } from './ui/camera';

/* ------------------------------------------------------------------ shell */
const app = document.getElementById('app')!;
app.innerHTML = `
  <a class="skip-link" href="#main">Skip to main content</a>
  <div id="starfield" aria-hidden="true"></div>
  <header class="topbar" id="topbar">
    <a class="brand" href="#/" aria-label="Tax Folios Atlas – world map">
      <svg class="brand-mark" viewBox="-20 -20 40 40" aria-hidden="true"><circle r="17" fill="none" stroke="currentColor" stroke-width="1.4"/><circle r="11" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="1.5 3"/><path d="M0 -8 6 0 0 8 -6 0Z" fill="currentColor" opacity=".9"/><circle r="17" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="0.6 8.5" opacity=".7"/></svg>
      <span class="brand-name">Tax Folios <em>Atlas</em></span>
    </a>
    <nav class="modes" aria-label="Sections">
      <a href="#/" id="mode-atlas" aria-current="page">Atlas</a>
      <a href="#/fighters" id="mode-fighters">Fighters</a>
    </nav>
    <div class="topbar-center" id="topbar-center"></div>
    <div class="topbar-tools" id="topbar-tools">
      <button type="button" class="tool" id="btn-outline" aria-expanded="false" aria-controls="outline-drawer" hidden><span class="tool-ico" aria-hidden="true">☰</span><span class="tool-txt">Outline</span></button>
      <button type="button" class="tool" id="btn-legend" aria-expanded="false" aria-controls="legend-pop" hidden><span class="tool-ico" aria-hidden="true">◈</span><span class="tool-txt">Legend</span></button>
      <button type="button" class="tool" id="btn-layout" aria-expanded="false" aria-controls="layout-panel" hidden><span class="tool-ico" aria-hidden="true">✥</span><span class="tool-txt">Layout</span></button>
      <button type="button" class="tool" id="btn-about" aria-haspopup="dialog"><span class="tool-ico" aria-hidden="true">?</span><span class="tool-txt">About</span></button>
    </div>
  </header>
  <main id="main" tabindex="-1">
    <section id="map-screen" class="screen" aria-label="World map">
      <div class="map-stage" id="map-stage"></div>
      <div class="map-caption">
        <h1>Tax Folios <em>Atlas</em></h1>
        <p>Select an illuminated country to open its tax folio.</p>
      </div>
      <nav class="atlas-index" aria-label="Countries with a tax folio"><ul id="atlas-list"></ul></nav>
      <div class="zoom-controls" id="map-zoom" role="group" aria-label="Map zoom">
        <button type="button" data-z="in" aria-label="Zoom in">+</button>
        <button type="button" data-z="out" aria-label="Zoom out">−</button>
        <button type="button" data-z="fit" aria-label="Reset map view">⌂</button>
      </div>
      <p class="map-hint" id="map-hint">Drag to pan · scroll or pinch to zoom</p>
    </section>
    <section id="folio-screen" class="screen" aria-label="Tax folio" hidden data-sheet="half">
      <div class="folio-stage" id="folio-stage">
        <div class="folio-overlay" id="folio-overlay">
          <button type="button" class="back" id="btn-back"><span aria-hidden="true">←</span> World map</button>
          <h1 class="folio-title" id="folio-title"></h1>
          <div class="filters" id="filters" role="group" aria-label="Focus on a level of government"></div>
        </div>
        <div class="zoom-controls" id="folio-zoom" role="group" aria-label="Folio zoom">
          <button type="button" data-z="in" aria-label="Zoom in">+</button>
          <button type="button" data-z="out" aria-label="Zoom out">−</button>
          <button type="button" data-z="fit" aria-label="Fit whole folio in view">⌂</button>
        </div>
        <aside class="drawer" id="outline-drawer" aria-label="Hierarchy outline" hidden></aside>
        <div class="popover" id="legend-pop" role="region" aria-labelledby="legend-title" hidden></div>
        <div class="layout-panel" id="layout-panel" role="region" aria-labelledby="le-title" hidden></div>
        <div class="loading" id="folio-loading" hidden>Loading folio…</div>
      </div>
      <aside class="detail-wrap" id="detail-wrap" aria-label="Details">
        <button type="button" class="sheet-handle" id="sheet-handle" aria-label="Resize details panel" aria-controls="detail-panel"><span></span></button>
        <div class="detail-panel" id="detail-panel" tabindex="-1"></div>
      </aside>
    </section>
    <section id="fighters-screen" class="screen" aria-label="Fiscal Fighters" hidden></section>
  </main>
  <dialog id="about" aria-labelledby="about-title"></dialog>
  <div id="live-region" class="sr-only" aria-live="polite" aria-atomic="true"></div>`;

mountStarfield(document.getElementById('starfield')!);
mountAbout(document.getElementById('about') as HTMLDialogElement);

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const mapScreen = $('map-screen');
const folioScreen = $('folio-screen');
const folioStage = $('folio-stage');
const topCenter = $('topbar-center');

/* -------------------------------------------------------------- map index */
$('atlas-list').innerHTML = registry
  .map((c) => `<li><a href="#/${esc(c.id)}" style="--a:${c.theme.accent}"><span class="pip" aria-hidden="true"></span>${esc(c.names.en)}</a></li>`)
  .join('');

/* ------------------------------------------------------------------ state */
interface Session {
  id: string;
  view: FolioView;
  panel: DetailPanel;
  outline: Outline;
  editor?: LayoutEditor;
}
let map: MapView | null = null;
let mapPromise: Promise<void> | null = null;
let session: Session | null = null;
let currentRoute = '';
let lastCountry: string | undefined;
let transitioning = false;

const debug = import.meta.env.DEV || new URLSearchParams(location.search).has('debug');

function parseHash() {
  const raw = location.hash.replace(/^#\/?/, '');
  const [pathPart, query = ''] = raw.split('?');
  const [country, node, ...rest] = pathPart.split('/').filter(Boolean);
  const params = new URLSearchParams(query);
  return { country, node, rest, level: params.get('level') };
}

/* ------------------------------------------------------------- fighters */
const fightersScreen = $('fighters-screen');
let arena: import('./fighters/arena').ArenaHandle | null = null;

function setMode(mode: 'atlas' | 'fighters') {
  const atlas = $('mode-atlas');
  const fighters = $('mode-fighters');
  if (mode === 'atlas') {
    atlas.setAttribute('aria-current', 'page');
    fighters.removeAttribute('aria-current');
  } else {
    fighters.setAttribute('aria-current', 'page');
    atlas.removeAttribute('aria-current');
  }
}

function leaveFighters() {
  if (fightersScreen.hidden) return;
  fightersScreen.hidden = true;
  arena?.destroy();
  arena = null;
}

async function showFighters(a?: string, b?: string) {
  document.title = 'Fiscal Fighters – Tax Folios Atlas';
  topCenter.innerHTML = '';
  ['btn-outline', 'btn-legend', 'btn-layout'].forEach((id) => ((document.getElementById(id) as HTMLElement).hidden = true));
  if (!folioScreen.hidden) {
    folioScreen.hidden = true;
    teardownSession();
  }
  mapScreen.hidden = true;
  fightersScreen.hidden = false;
  setMode('fighters');
  if (arena) {
    arena.setParams(a, b);
    return;
  }
  const { mountArena } = await import('./fighters/arena');
  arena = await mountArena(fightersScreen, { a, b }, (na, nb) => {
    const h = `#/fighters${na ? `/${na}` : ''}${nb ? `/${nb}` : ''}`;
    currentRoute = h;
    history.replaceState(null, '', h);
  });
  fightersScreen.scrollTop = 0;
  announce('Fiscal Fighters. Choose two countries to compare how their tax systems are built.');
}

function setHash(country: string, node?: string, level?: string | null, replace = true) {
  let h = `#/${country}`;
  if (node && node !== country) h += `/${node}`;
  if (level) h += `?level=${level}`;
  currentRoute = h;
  if (replace) history.replaceState(null, '', h);
  else location.hash = h;
}

/* ------------------------------------------------------------------ map */
async function ensureMap(startAt?: string) {
  if (map) return;
  mapPromise ??= (async () => {
    const m = new MapView({
      stage: $('map-stage'),
      countries: registry,
      getInsets: () => mapInsets(),
      onSelect: (id) => {
        if (transitioning) return;
        location.hash = `#/${id}`;
      },
    });
    await m.init(startAt);
    map = m;
    if (debug) (window as unknown as Record<string, unknown>).__map = m;
  })();
  await mapPromise;
}

function mapInsets(): Insets {
  const narrow = window.innerWidth < 720;
  const topbar = $('topbar').getBoundingClientRect().height;
  return { top: topbar + (narrow ? 70 : 30), right: 24, bottom: narrow ? 128 : 84, left: 24 };
}

$('map-zoom').addEventListener('click', (ev) => {
  const b = (ev.target as Element).closest('button');
  if (!b || !map) return;
  if (b.dataset.z === 'in') map.camera.zoomBy(1.6);
  else if (b.dataset.z === 'out') map.camera.zoomBy(1 / 1.6);
  else void map.fitWorld(prefersReducedMotion() ? 0 : 500);
});

async function showMap(returnFrom?: string) {
  document.title = 'Tax Folios Atlas – how countries organise their taxes';
  leaveFighters();
  setMode('atlas');
  const wasFolio = !folioScreen.hidden;
  topCenter.innerHTML = '';
  ['btn-outline', 'btn-legend', 'btn-layout'].forEach((id) => ((document.getElementById(id) as HTMLElement).hidden = true));
  mapScreen.hidden = false;
  mapScreen.classList.remove('is-leaving');
  if (!map) await ensureMap(returnFrom);
  else if (returnFrom && wasFolio) map.returnFrom(returnFrom);
  else void map.fitWorld(0);
  if (wasFolio) {
    folioScreen.classList.add('is-leaving');
    setTimeout(() => {
      folioScreen.hidden = true;
      folioScreen.classList.remove('is-leaving');
      teardownSession();
    }, prefersReducedMotion() ? 0 : 420);
  }
  announce('World map. Choose a highlighted country to open its tax folio.');
  const focusTarget = returnFrom ? (document.querySelector(`.country.active[data-id="${returnFrom}"]`) as HTMLElement | null) : null;
  setTimeout(() => (focusTarget ?? (document.querySelector('.country.active') as HTMLElement | null))?.focus({ preventScroll: true }), 600);
}

/* ---------------------------------------------------------------- folio */
function teardownSession() {
  if (!session) return;
  session.editor?.destroy();
  session.view.destroy();
  session = null;
  $('detail-panel').innerHTML = '';
}

function folioInsets(): Insets {
  const overlay = $('folio-overlay').getBoundingClientRect();
  const stage = folioStage.getBoundingClientRect();
  const narrow = window.innerWidth < 720;
  const outlineOpen = !$('outline-drawer').hidden && !narrow;
  return { top: Math.max(48, overlay.bottom - stage.top + 8), right: 14, bottom: narrow ? 56 : 24, left: outlineOpen ? 330 : 14 };
}

function setToolOpen(btnId: string, panelId: string, open: boolean) {
  const btn = $(btnId);
  const panel = $(panelId);
  panel.hidden = !open;
  btn.setAttribute('aria-expanded', String(open));
  btn.classList.toggle('is-on', open);
}

function closeTools(except?: string) {
  const tools: [string, string][] = [
    ['btn-outline', 'outline-drawer'],
    ['btn-legend', 'legend-pop'],
    ['btn-layout', 'layout-panel'],
  ];
  for (const [b, p] of tools) if (b !== except && !$(p).hidden && p !== 'layout-panel') setToolOpen(b, p, false);
}

async function showFolio(id: string, nodeId?: string, level?: string | null) {
  const meta = registryById.get(id);
  if (!meta) {
    location.hash = '#/';
    return;
  }
  leaveFighters();
  setMode('atlas');
  if (session && session.id === id) {
    if (level !== undefined) applyLevel(level ?? null);
    if (nodeId && session.view.model.nodes.has(nodeId)) session.view.select(nodeId, 'route');
    return;
  }
  lastCountry = id;
  const fromMap = !mapScreen.hidden && !!map;
  if (fromMap && map) {
    transitioning = true;
    await map.zoomToCountry(id);
  }
  $('folio-loading').hidden = false;
  folioScreen.hidden = false;
  folioScreen.classList.add('is-entering');
  let bundle;
  try {
    bundle = await loadCountry(id, { useDraft: layoutEditingAvailable() && !import.meta.env.DEV });
  } catch (e) {
    console.error(e);
    $('folio-loading').textContent = `Could not load this folio: ${(e as Error).message}`;
    transitioning = false;
    return;
  }
  teardownSession();
  $('folio-loading').hidden = true;

  const panelEl = $('detail-panel');
  const panel = new DetailPanel(panelEl, (nid) => session?.view.select(nid, 'outline'));
  const outline = new Outline($('outline-drawer'), (nid) => session?.view.select(nid, 'outline'));

  const view = new FolioView({
    stage: folioStage,
    bundle,
    getInsets: folioInsets,
    getExclusions: () => {
      const st = folioStage.getBoundingClientRect();
      const z = $('folio-zoom').getBoundingClientRect();
      return [{ x0: z.left - st.left - 4, y0: z.top - st.top - 4, x1: z.right - st.left + 4, y1: z.bottom - st.top + 4 }];
    },
    onSelect: (nid, source) => onSelect(nid, source),
    onLayoutChange: () => session?.editor?.notifyChange(),
  });
  panel.setModel(view.model);
  outline.build(view.model);
  session = { id, view, panel, outline };
  renderLegend($('legend-pop'), view.model);

  // header content
  document.title = `${meta.names.en} – Tax Folios Atlas`;
  $('folio-title').innerHTML = `<span class="ft-name">${esc(meta.names.en)}</span><span class="ft-sub">Tax folio</span>`;
  const filters = $('filters');
  filters.innerHTML =
    `<button type="button" class="chip-btn" data-level="" aria-pressed="true"><span class="dot" style="background:${BRANCH_COLOR.country}"></span>All levels</button>` +
    meta.levels
      .map((l) => `<button type="button" class="chip-btn" data-level="${esc(l.id)}" aria-pressed="false" title="${esc(l.names.official)}"><span class="dot" style="background:${BRANCH_COLOR[l.branch]}"></span>${esc(view.model.nodes.get(l.id)!.label)}</button>`)
      .join('');
  $('btn-outline').hidden = false;
  $('btn-legend').hidden = false;
  $('btn-layout').hidden = !layoutEditingAvailable();
  mapScreen.classList.add('is-leaving');
  setTimeout(() => {
    mapScreen.hidden = true;
    mapScreen.classList.remove('is-leaving');
  }, prefersReducedMotion() ? 0 : 420);
  transitioning = false;

  // Layout editor
  if (layoutEditingAvailable()) {
    const editor = new LayoutEditor($('layout-panel'), view, id);
    session.editor = editor;
  }
  if (level) applyLevel(level);
  const startNode = nodeId && view.model.nodes.has(nodeId) ? nodeId : view.model.rootId;
  view.select(startNode, 'route');
  view.fitGraph(0);
  requestAnimationFrame(() => folioScreen.classList.remove('is-entering'));
  announce(`${meta.names.en} tax folio opened. ${view.model.nodes.size - 1} cores. Use the arrow keys to move through the hierarchy.`);
  setTimeout(() => view.focusSelected(), 350);
  if (debug) (window as unknown as Record<string, unknown>).__tfa = { view, model: view.model, panel, outline, get editor() { return session?.editor; } };
}

function applyLevel(levelId: string | null) {
  if (!session) return;
  session.view.setLevelFilter(levelId);
  session.outline.setFilter(levelId);
  $('filters').querySelectorAll<HTMLButtonElement>('.chip-btn').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.level || null) === levelId)));
  setHash(session.id, session.view.selectedId, levelId);
}

function onSelect(nid: string, source: string) {
  if (!session) return;
  const { view, panel, outline, id } = session;
  panel.render(nid);
  outline.setSelected(nid);
  session.editor?.syncSelected();
  const n = view.model.nodes.get(nid)!;
  setHash(id, nid, view.levelFilter);
  if (source !== 'init') {
    const share = n.revenue?.nationalShare !== undefined && n.radiusSource === 'revenue' ? `, ${formatShare(n.revenue.nationalShare)} of the national total` : '';
    announce(`${n.instrument?.names.common ?? n.level?.names.common ?? n.label}${share}. Details updated.`);
  }
  // On narrow screens make sure the details are visible after a deliberate selection.
  if (window.innerWidth < 720 && (source === 'pointer' || source === 'outline') && folioScreen.dataset.sheet === 'peek') setSheet('half');
  if (window.innerWidth < 720 && source === 'outline') closeTools();
}

$('filters').addEventListener('click', (ev) => {
  const b = (ev.target as Element).closest('.chip-btn') as HTMLElement | null;
  if (b) applyLevel(b.dataset.level || null);
});

$('btn-back').addEventListener('click', () => {
  location.hash = '#/';
});

$('folio-zoom').addEventListener('click', (ev) => {
  const b = (ev.target as Element).closest('button');
  if (!b || !session) return;
  const cam = session.view.camera;
  if (b.dataset.z === 'in') cam.zoomBy(1.4);
  else if (b.dataset.z === 'out') cam.zoomBy(1 / 1.4);
  else void session.view.fitGraph(prefersReducedMotion() ? 0 : 450);
});

/* tools */
$('btn-outline').addEventListener('click', () => {
  const open = $('outline-drawer').hidden;
  closeTools('btn-outline');
  setToolOpen('btn-outline', 'outline-drawer', open);
  if (open) ($('outline-drawer').querySelector('[tabindex="0"]') as HTMLElement | null)?.focus();
});
$('btn-legend').addEventListener('click', () => {
  const open = $('legend-pop').hidden;
  closeTools('btn-legend');
  setToolOpen('btn-legend', 'legend-pop', open);
});
$('btn-layout').addEventListener('click', () => {
  if (!session) return;
  const open = $('layout-panel').hidden;
  setToolOpen('btn-layout', 'layout-panel', open);
  session.view.setLayoutMode(open);
  folioScreen.classList.toggle('layout-on', open);
  announce(open ? 'Layout editor on. Drag cores to reposition them.' : 'Layout editor off.');
});
$('btn-about').addEventListener('click', () => ($('about') as HTMLDialogElement).showModal());
$('about').addEventListener('click', (ev) => {
  if (ev.target === $('about')) ($('about') as HTMLDialogElement).close();
});

/* mobile sheet */
function setSheet(state: 'peek' | 'half' | 'full') {
  folioScreen.dataset.sheet = state;
}
$('sheet-handle').addEventListener('click', () => {
  const order = ['peek', 'half', 'full'] as const;
  const cur = order.indexOf(folioScreen.dataset.sheet as 'peek' | 'half' | 'full');
  setSheet(order[(cur + 1) % 3]);
});

window.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape') {
    const dlg = $('about') as HTMLDialogElement;
    if (dlg.open) return;
    if (!$('outline-drawer').hidden) setToolOpen('btn-outline', 'outline-drawer', false);
    else if (!$('legend-pop').hidden) setToolOpen('btn-legend', 'legend-pop', false);
  }
  const t = ev.target as HTMLElement;
  if (t.matches('input, textarea, select')) return;
  if (ev.key === '+' || ev.key === '=') (session ? session.view.camera : map?.camera)?.zoomBy(1.3);
  if (ev.key === '-' || ev.key === '_') (session ? session.view.camera : map?.camera)?.zoomBy(1 / 1.3);
  if (ev.key === '0') {
    if (session) void session.view.fitGraph(300);
    else void map?.fitWorld(300);
  }
});

/* ---------------------------------------------------------------- routing */
async function route() {
  const h = location.hash;
  if (h === currentRoute && session) return;
  const { country, node, rest, level } = parseHash();
  if (country === 'fighters') {
    currentRoute = h;
    await showFighters(node, rest[0]);
    return;
  }
  if (!country) {
    await showMap(lastCountry && !folioScreen.hidden ? lastCountry : undefined);
    lastCountry = undefined;
    currentRoute = '#/';
    return;
  }
  currentRoute = h;
  await showFolio(country, node, level);
}
window.addEventListener('hashchange', () => void route());
if (!location.hash || location.hash === '#' || location.hash === '#/') {
  currentRoute = '#/';
  void ensureMap().then(() => {
    announce('World map. Choose a highlighted country to open its tax folio.');
  });
} else {
  void route();
}
