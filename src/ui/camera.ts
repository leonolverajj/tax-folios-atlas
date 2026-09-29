/**
 * A small pan / zoom controller shared by the world map and the folio.
 *
 * The camera maps world coordinates to screen pixels:
 *     screenX = k * worldX + x        screenY = k * worldY + y
 * Views draw everything inside one <g> whose transform is the camera, so
 * cores, sockets, lines and hit areas all live in the same coordinate system.
 */
import { prefersReducedMotion } from '../util/dom';

export interface Bounds {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface CameraOptions {
  minK?: number;
  maxK?: number;
  /** Return true if a pointer-down on this element should NOT start a pan (e.g. it is a draggable core). */
  ignorePan?: (target: EventTarget | null, ev: PointerEvent) => boolean;
  onChange?: (cam: Camera) => void;
  /** World-space bounds the view centre may roam within. */
  limits?: () => Bounds | null;
}

export class Camera {
  k = 1;
  x = 0;
  y = 0;
  width = 1;
  height = 1;
  minK: number;
  maxK: number;
  private animId = 0;
  private pointers = new Map<number, { x: number; y: number }>();
  private panning = false;
  private pinchStart: { dist: number; k: number; cx: number; cy: number } | null = null;
  private moved = 0;
  /** true briefly after a drag, so click handlers can ignore the click that ends a pan */
  suppressClick = false;

  private el: HTMLElement;

  constructor(el: SVGSVGElement | HTMLElement, private opts: CameraOptions = {}) {
    this.el = el as unknown as HTMLElement;
    this.minK = opts.minK ?? 0.05;
    this.maxK = opts.maxK ?? 8;
    this.el.addEventListener('wheel', this.onWheel, { passive: false });
    this.el.addEventListener('pointerdown', this.onDown);
    this.el.addEventListener('pointermove', this.onMove);
    this.el.addEventListener('pointerup', this.onUp);
    this.el.addEventListener('pointercancel', this.onUp);
    this.el.addEventListener('dblclick', this.onDbl);
  }

  destroy() {
    cancelAnimationFrame(this.animId);
    this.el.removeEventListener('wheel', this.onWheel);
    this.el.removeEventListener('pointerdown', this.onDown);
    this.el.removeEventListener('pointermove', this.onMove);
    this.el.removeEventListener('pointerup', this.onUp);
    this.el.removeEventListener('pointercancel', this.onUp);
    this.el.removeEventListener('dblclick', this.onDbl);
  }

  setViewport(w: number, h: number) {
    this.width = w;
    this.height = h;
  }

  get transform(): string {
    return `translate(${this.x.toFixed(3)} ${this.y.toFixed(3)}) scale(${this.k.toFixed(5)})`;
  }

  toWorld(sx: number, sy: number) {
    return { x: (sx - this.x) / this.k, y: (sy - this.y) / this.k };
  }
  toScreen(wx: number, wy: number) {
    return { x: wx * this.k + this.x, y: wy * this.k + this.y };
  }
  /**
   * Screen position relative to the element (client coords minus the element's origin),
   * in the camera's own pixels: corrected for any CSS scale on the element or its ancestors
   * (for example the screen-entrance transition).
   */
  local(ev: { clientX: number; clientY: number }) {
    const r = this.el.getBoundingClientRect();
    const sx = r.width > 0 && this.width > 0 ? this.width / r.width : 1;
    const sy = r.height > 0 && this.height > 0 ? this.height / r.height : 1;
    return { x: (ev.clientX - r.left) * sx, y: (ev.clientY - r.top) * sy };
  }

  private constrain() {
    const lim = this.opts.limits?.();
    if (!lim) return;
    // Keep at least 25% of the viewport covered by content in each axis.
    const cw = (lim.x1 - lim.x0) * this.k;
    const ch = (lim.y1 - lim.y0) * this.k;
    const padX = Math.min(this.width * 0.5, 160);
    const padY = Math.min(this.height * 0.5, 160);
    const minX = padX - lim.x1 * this.k;
    const maxX = this.width - padX - lim.x0 * this.k;
    const minY = padY - lim.y1 * this.k;
    const maxY = this.height - padY - lim.y0 * this.k;
    this.x = minX > maxX ? (minX + maxX) / 2 : Math.min(maxX, Math.max(minX, this.x));
    this.y = minY > maxY ? (minY + maxY) / 2 : Math.min(maxY, Math.max(minY, this.y));
    void cw;
    void ch;
  }

  private changed() {
    this.constrain();
    this.opts.onChange?.(this);
  }

  set(k: number, x: number, y: number) {
    this.k = Math.min(this.maxK, Math.max(this.minK, k));
    this.x = x;
    this.y = y;
    this.changed();
  }

  zoomAt(sx: number, sy: number, factor: number) {
    const k2 = Math.min(this.maxK, Math.max(this.minK, this.k * factor));
    const f = k2 / this.k;
    this.k = k2;
    this.x = sx - (sx - this.x) * f;
    this.y = sy - (sy - this.y) * f;
    this.changed();
  }

  zoomBy(factor: number) {
    this.zoomAt(this.width / 2, this.height / 2, factor);
  }

  panBy(dx: number, dy: number) {
    this.x += dx;
    this.y += dy;
    this.changed();
  }

  /** Target transform that fits `b` (world) inside the viewport, keeping `pad` px clear on each side. */
  fitTransform(b: Bounds, pad: number | Insets = 24) {
    const p: Insets = typeof pad === 'number' ? { top: pad, right: pad, bottom: pad, left: pad } : pad;
    const w = Math.max(1, this.width - p.left - p.right);
    const h = Math.max(1, this.height - p.top - p.bottom);
    const bw = Math.max(1, b.x1 - b.x0);
    const bh = Math.max(1, b.y1 - b.y0);
    const k = Math.min(this.maxK, Math.max(this.minK, Math.min(w / bw, h / bh)));
    const x = p.left + (w - bw * k) / 2 - b.x0 * k;
    const y = p.top + (h - bh * k) / 2 - b.y0 * k;
    return { k, x, y };
  }

  fit(b: Bounds, opts: { pad?: number | Insets; animate?: number } = {}) {
    const t = this.fitTransform(b, opts.pad ?? 24);
    if (opts.animate && !prefersReducedMotion()) return this.animateTo(t, opts.animate);
    this.set(t.k, t.x, t.y);
    return Promise.resolve();
  }

  /** Pan so that world point (wx, wy) is inside the viewport (with margin), without changing zoom. */
  reveal(wx: number, wy: number, margin = 80, insets: Insets = { left: 0, right: 0, top: 0, bottom: 0 }) {
    const s = this.toScreen(wx, wy);
    let dx = 0;
    let dy = 0;
    if (s.x < margin + insets.left) dx = margin + insets.left - s.x;
    else if (s.x > this.width - margin - insets.right) dx = this.width - margin - insets.right - s.x;
    if (s.y < margin + insets.top) dy = margin + insets.top - s.y;
    else if (s.y > this.height - margin - insets.bottom) dy = this.height - margin - insets.bottom - s.y;
    if (dx || dy) {
      const t = { k: this.k, x: this.x + dx, y: this.y + dy };
      if (prefersReducedMotion()) this.set(t.k, t.x, t.y);
      else this.animateTo(t, 320);
    }
  }

  /** true while an animated move is running (views use it to avoid fighting the animation on resize) */
  animating = false;

  animateTo(target: { k: number; x: number; y: number }, ms = 600): Promise<void> {
    cancelAnimationFrame(this.animId);
    const from = { k: this.k, x: this.x, y: this.y };
    const t0 = performance.now();
    this.animating = true;
    return new Promise((resolve) => {
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / ms);
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        // Interpolate in log-space for zoom so it feels uniform.
        const k = Math.exp(Math.log(from.k) + (Math.log(target.k) - Math.log(from.k)) * e);
        // Keep the screen centre's world point moving linearly.
        const cx0 = (this.width / 2 - from.x) / from.k;
        const cy0 = (this.height / 2 - from.y) / from.k;
        const cx1 = (this.width / 2 - target.x) / target.k;
        const cy1 = (this.height / 2 - target.y) / target.k;
        const cx = cx0 + (cx1 - cx0) * e;
        const cy = cy0 + (cy1 - cy0) * e;
        this.k = k;
        this.x = this.width / 2 - cx * k;
        this.y = this.height / 2 - cy * k;
        this.changed();
        if (t < 1) this.animId = requestAnimationFrame(step);
        else {
          this.animating = false;
          resolve();
        }
      };
      this.animId = requestAnimationFrame(step);
    });
  }

  stopAnimation() {
    cancelAnimationFrame(this.animId);
    this.animating = false;
  }

  /* ---------------------------------------------------------- input */
  private onWheel = (ev: WheelEvent) => {
    ev.preventDefault();
    this.stopAnimation();
    const p = this.local(ev);
    const delta = ev.deltaMode === 1 ? ev.deltaY * 16 : ev.deltaY;
    const factor = Math.exp(-delta * (ev.ctrlKey ? 0.01 : 0.0017));
    this.zoomAt(p.x, p.y, factor);
  };

  private onDbl = (ev: MouseEvent) => {
    if (this.opts.ignorePan?.(ev.target, ev as unknown as PointerEvent)) return;
    const p = this.local(ev);
    this.stopAnimation();
    this.zoomAt(p.x, p.y, 1.8);
  };

  private onDown = (ev: PointerEvent) => {
    if (ev.button !== 0 && ev.pointerType === 'mouse') return;
    if (this.opts.ignorePan?.(ev.target, ev) && this.pointers.size === 0) return;
    this.stopAnimation();
    this.pointers.set(ev.pointerId, this.local(ev));
    this.moved = 0;
    if (this.pointers.size === 1) this.panning = true;
    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      this.pinchStart = { dist: Math.hypot(a.x - b.x, a.y - b.y), k: this.k, cx: (a.x + b.x) / 2, cy: (a.y + b.y) / 2 };
    }
  };

  private onMove = (ev: PointerEvent) => {
    const prev = this.pointers.get(ev.pointerId);
    if (!prev) return;
    const cur = this.local(ev);
    this.pointers.set(ev.pointerId, cur);
    if (this.pointers.size === 2 && this.pinchStart) {
      const [a, b] = [...this.pointers.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const cx = (a.x + b.x) / 2;
      const cy = (a.y + b.y) / 2;
      const targetK = this.pinchStart.k * (dist / Math.max(1, this.pinchStart.dist));
      this.zoomAt(cx, cy, Math.min(this.maxK, Math.max(this.minK, targetK)) / this.k);
      this.panBy(cx - this.pinchStart.cx, cy - this.pinchStart.cy);
      this.pinchStart.cx = cx;
      this.pinchStart.cy = cy;
      this.moved = 99;
      return;
    }
    if (this.panning && this.pointers.size === 1) {
      const dx = cur.x - prev.x;
      const dy = cur.y - prev.y;
      this.moved += Math.abs(dx) + Math.abs(dy);
      if (this.moved > 6) {
        if (!this.el.hasPointerCapture(ev.pointerId)) {
          try {
            this.el.setPointerCapture(ev.pointerId);
          } catch {
            /* ignore */
          }
        }
        this.el.classList.add('is-panning');
        this.panBy(dx, dy);
      }
    }
  };

  private onUp = (ev: PointerEvent) => {
    if (!this.pointers.has(ev.pointerId)) return;
    this.pointers.delete(ev.pointerId);
    if (this.pointers.size < 2) this.pinchStart = null;
    if (this.pointers.size === 0) {
      this.panning = false;
      this.el.classList.remove('is-panning');
      if (this.moved > 6) {
        this.suppressClick = true;
        setTimeout(() => (this.suppressClick = false), 0);
      }
    }
    if (this.el.hasPointerCapture?.(ev.pointerId)) this.el.releasePointerCapture(ev.pointerId);
  };
}
