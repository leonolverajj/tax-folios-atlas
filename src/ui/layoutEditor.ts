/**
 * Developer layout editor.
 *
 * Dragging happens inside FolioView (grab-offset preserving, live sockets and
 * lines). This module owns the panel: coordinates, size, snap/grid toggles,
 * Save / Reset / Export / Import, and a persistent status line.
 *
 * Persistence
 *  - `npm run dev`: Save POSTs to the Vite dev server, which validates the
 *    layout and rewrites countries/<id>/layout.json (previous file backed up).
 *  - deployed build (public, read-only): there is no write endpoint. With
 *    `?layout=1` the editor works on a browser-local DRAFT (localStorage);
 *    Export JSON and commit it to publish.
 */
import { LAYOUT_DRAFT_KEY, loadPublishedLayout } from '../data/loader';
import { layoutSchema, type Layout } from '../data/schema';
import type { FolioView } from '../folio/folioView';
import { esc } from '../util/dom';

type StatusKind = 'saved' | 'dirty' | 'error' | 'info';

export const layoutEditingAvailable = (): boolean => import.meta.env.DEV || new URLSearchParams(location.search).has('layout');

export class LayoutEditor {
  private status: HTMLElement;
  private lastSaved: string;
  private dirtyFlag = false;
  private fileInput: HTMLInputElement;
  private readout: HTMLElement;
  private sizeInput: HTMLInputElement;
  private sizeNote: HTMLElement;
  private xInput: HTMLInputElement;
  private yInput: HTMLInputElement;
  private beforeUnload = (e: BeforeUnloadEvent) => {
    if (this.dirtyFlag) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  constructor(private root: HTMLElement, private view: FolioView, private countryId: string) {
    this.lastSaved = JSON.stringify(view.getLayout());
    const dev = import.meta.env.DEV;
    root.innerHTML = `
      <div class="le-head">
        <h2 id="le-title">Layout editor</h2>
        <span class="le-mode">${dev ? 'Local project files' : 'Browser draft'}</span>
      </div>
      <p class="le-status" role="status" aria-live="polite" data-kind="saved"><span class="le-dot" aria-hidden="true"></span><span class="le-status-text"></span></p>
      <div class="le-selected" aria-live="polite">
        <p class="le-name"></p>
        <div class="le-row">
          <label>X <input type="number" step="1" class="le-x" aria-label="X coordinate"></label>
          <label>Y <input type="number" step="1" class="le-y" aria-label="Y coordinate"></label>
        </div>
        <label class="le-size">Core size <input type="range" min="16" max="120" step="1" class="le-r" aria-label="Core radius"><output class="le-r-out"></output></label>
        <p class="le-size-note muted"></p>
      </div>
      <div class="le-toggles">
        <label><input type="checkbox" class="le-snap"> Snap to 10 units</label>
        <label><input type="checkbox" class="le-grid" checked> Show grid</label>
      </div>
      <div class="le-buttons">
        <button type="button" class="btn primary le-save">Save</button>
        <button type="button" class="btn le-reset">Reset</button>
        <button type="button" class="btn le-export">Export JSON</button>
        <button type="button" class="btn le-import">Import JSON</button>
        <input type="file" accept="application/json,.json" class="le-file" hidden>
      </div>
      <details class="le-help"><summary>How it works</summary>
        <ul>
          <li>Drag a core; it moves relative to where you grabbed it. Hold near a screen edge to auto-pan, so cores can sit right up to any border.</li>
          <li>Focus a core and press <kbd>Alt</kbd>+arrows to nudge by 1 unit (<kbd>Shift</kbd> = 10).</li>
          <li>${
            dev
              ? `<strong>Save</strong> writes <code>countries/${esc(countryId)}/layout.json</code>; the previous file is kept in <code>.layout-backups/</code>.`
              : `<strong>Save</strong> stores a draft in this browser only. Use <strong>Export JSON</strong>, replace <code>countries/${esc(countryId)}/layout.json</code> and redeploy to publish.`
          }</li>
          <li><strong>Reset</strong> discards unsaved changes and restores the published layout.</li>
          <li>Cores sized by revenue keep their data-driven size; only structural and neutral cores can be resized.</li>
        </ul>
      </details>`;
    this.status = root.querySelector('.le-status') as HTMLElement;
    this.readout = root.querySelector('.le-name') as HTMLElement;
    this.sizeInput = root.querySelector('.le-r') as HTMLInputElement;
    this.sizeNote = root.querySelector('.le-size-note') as HTMLElement;
    this.xInput = root.querySelector('.le-x') as HTMLInputElement;
    this.yInput = root.querySelector('.le-y') as HTMLInputElement;
    this.fileInput = root.querySelector('.le-file') as HTMLInputElement;

    root.querySelector('.le-save')!.addEventListener('click', () => void this.save());
    root.querySelector('.le-reset')!.addEventListener('click', () => void this.reset());
    root.querySelector('.le-export')!.addEventListener('click', () => this.exportJson());
    root.querySelector('.le-import')!.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', () => void this.importJson());
    (root.querySelector('.le-snap') as HTMLInputElement).addEventListener('change', (e) => {
      this.view.snap = (e.target as HTMLInputElement).checked ? 10 : 0;
    });
    (root.querySelector('.le-grid') as HTMLInputElement).addEventListener('change', (e) => this.view.setShowGrid((e.target as HTMLInputElement).checked));
    const commitXY = () => {
      const x = parseFloat(this.xInput.value);
      const y = parseFloat(this.yInput.value);
      if (Number.isFinite(x) && Number.isFinite(y)) this.view.setNodePosition(this.view.selectedId, x, y);
    };
    this.xInput.addEventListener('change', commitXY);
    this.yInput.addEventListener('change', commitXY);
    this.sizeInput.addEventListener('input', () => this.view.setNodeRadius(this.view.selectedId, parseFloat(this.sizeInput.value)));
    window.addEventListener('beforeunload', this.beforeUnload);
    this.setStatus('info', dev ? 'Editing project files. Drag cores, then Save.' : 'Draft mode: saved in this browser only.');
    this.syncSelected();
  }

  destroy() {
    window.removeEventListener('beforeunload', this.beforeUnload);
  }

  get isDirty() {
    return this.dirtyFlag;
  }

  private setStatus(kind: StatusKind, text: string) {
    this.status.dataset.kind = kind;
    (this.status.querySelector('.le-status-text') as HTMLElement).textContent = text;
  }

  /** Called by the view whenever a core moves or is resized. */
  notifyChange() {
    this.dirtyFlag = JSON.stringify(this.view.getLayout()) !== this.lastSaved;
    if (this.dirtyFlag) this.setStatus('dirty', 'Unsaved changes');
    else this.setStatus('saved', 'All changes saved');
    this.syncSelected();
  }

  syncSelected() {
    const id = this.view.selectedId;
    const n = this.view.model.nodes.get(id);
    if (!n) return;
    this.readout.textContent = `${n.label} (${id})`;
    if (document.activeElement !== this.xInput) this.xInput.value = n.x.toFixed(1);
    if (document.activeElement !== this.yInput) this.yInput.value = n.y.toFixed(1);
    const locked = n.radiusSource === 'revenue';
    this.sizeInput.disabled = locked;
    this.sizeInput.value = String(Math.round(n.r));
    (this.root.querySelector('.le-r-out') as HTMLElement).textContent = `${n.r.toFixed(0)}`;
    this.sizeNote.textContent = locked
      ? `Size is set by the share of the national total (${n.revenue?.nationalShare !== undefined ? (n.revenue.nationalShare * 100).toFixed(2) + '%' : ''}) and cannot be changed here.`
      : n.radiusSource === 'override'
        ? 'Custom size (stored in layout.json).'
        : 'Default size; move the slider to override.';
  }

  async save() {
    const layout = this.view.getLayout();
    try {
      if (import.meta.env.DEV) {
        const res = await fetch(`/__tfa/layout/${this.countryId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-TFA-Edit': '1' },
          body: JSON.stringify(layout),
        });
        const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; path?: string };
        if (!res.ok || !body.ok) throw new Error(body.error ?? `HTTP ${res.status}`);
        this.lastSaved = JSON.stringify(layout);
        this.dirtyFlag = false;
        this.setStatus('saved', `Saved to ${body.path ?? 'layout.json'} at ${new Date().toLocaleTimeString()}`);
      } else {
        localStorage.setItem(LAYOUT_DRAFT_KEY(this.countryId), JSON.stringify(layout));
        this.lastSaved = JSON.stringify(layout);
        this.dirtyFlag = false;
        this.setStatus('saved', `Draft saved in this browser at ${new Date().toLocaleTimeString()}. Export JSON to publish.`);
      }
    } catch (e) {
      this.setStatus('error', `Save failed: ${(e as Error).message}`);
    }
  }

  async reset() {
    try {
      if (!import.meta.env.DEV) localStorage.removeItem(LAYOUT_DRAFT_KEY(this.countryId));
      const published = await loadPublishedLayout(this.countryId);
      this.view.applyLayout(published);
      this.lastSaved = JSON.stringify(this.view.getLayout());
      this.dirtyFlag = false;
      this.setStatus('saved', 'Reset to the published layout.');
      this.syncSelected();
    } catch (e) {
      this.setStatus('error', `Reset failed: ${(e as Error).message}`);
    }
  }

  exportJson() {
    const blob = new Blob([JSON.stringify(this.view.getLayout(), null, 2) + '\n'], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `layout.${this.countryId}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    this.setStatus('info', `Exported layout.${this.countryId}.json`);
  }

  private async importJson() {
    const file = this.fileInput.files?.[0];
    this.fileInput.value = '';
    if (!file) return;
    try {
      const parsed = layoutSchema.parse(JSON.parse(await file.text()));
      const unknown = Object.keys(parsed.positions).filter((id) => !this.view.model.nodes.has(id));
      if (unknown.length) throw new Error(`unknown cores: ${unknown.slice(0, 4).join(', ')}${unknown.length > 4 ? '…' : ''}`);
      const out = Object.entries(parsed.positions).filter(([, p]) => p.x < 0 || p.y < 0 || p.x > parsed.canvas.width || p.y > parsed.canvas.height);
      if (out.length) throw new Error(`positions outside the canvas: ${out[0][0]}`);
      if (parsed.canvas.width !== this.view.model.canvas.width || parsed.canvas.height !== this.view.model.canvas.height)
        throw new Error('canvas size differs from this country’s layout');
      const missing = [...this.view.model.nodes.keys()].filter((id) => !parsed.positions[id]);
      if (missing.length) throw new Error(`missing positions for: ${missing.slice(0, 4).join(', ')}`);
      this.view.applyLayout(parsed);
      this.notifyChange();
      this.setStatus('dirty', `Imported ${Object.keys(parsed.positions).length} positions from ${file.name} – not saved yet`);
    } catch (e) {
      this.setStatus('error', `Import failed: ${(e as Error).message}`);
    }
  }
}

export type { Layout };
