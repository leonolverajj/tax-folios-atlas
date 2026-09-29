export const SVG_NS = 'http://www.w3.org/2000/svg';

type Attrs = Record<string, string | number | boolean | undefined | null>;
type Child = Node | string | null | undefined | false;

function apply(el: Element, attrs: Attrs) {
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    el.setAttribute(k, v === true ? '' : String(v));
  }
}
function append(el: Element, children: Child[]) {
  for (const c of children) {
    if (c === null || c === undefined || c === false) continue;
    el.append(typeof c === 'string' ? document.createTextNode(c) : c);
  }
}

export function svg<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Attrs = {}, children: Child[] = []): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, tag);
  apply(el, attrs);
  append(el, children);
  return el;
}

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs = {}, children: Child[] = []): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  apply(el, attrs);
  append(el, children);
  return el;
}

export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function announce(text: string) {
  const live = document.getElementById('live-region');
  if (!live) return;
  live.textContent = '';
  // Re-set on the next frame so screen readers re-announce identical text.
  requestAnimationFrame(() => {
    live.textContent = text;
  });
}

export function clear(el: Element) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

export function rafThrottle<T extends (...a: never[]) => void>(fn: T): T {
  let queued = false;
  let lastArgs: Parameters<T> | null = null;
  return ((...args: Parameters<T>) => {
    lastArgs = args;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      if (lastArgs) fn(...lastArgs);
    });
  }) as T;
}
