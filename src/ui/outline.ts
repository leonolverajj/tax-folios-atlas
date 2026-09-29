/**
 * Text-accessible hierarchy: a real ARIA tree of the same graph the folio draws.
 * Every node reachable in the SVG is reachable here, with the same names.
 */
import type { FolioModel } from '../data/model';
import { formatShare } from '../data/format';
import { esc } from '../util/dom';
import { BRANCH_COLOR } from '../folio/palette';

export class Outline {
  private tree!: HTMLElement;
  private filter: string | null = null;

  constructor(private root: HTMLElement, private onSelect: (id: string) => void) {}

  build(model: FolioModel) {
    const render = (id: string, level: number): string => {
      const n = model.nodes.get(id)!;
      const kids = n.childIds.map((c) => render(c, level + 1)).join('');
      const share = n.revenue?.nationalShare !== undefined && n.radiusSource === 'revenue' ? `<span class="o-share">${esc(formatShare(n.revenue.nationalShare))}</span>` : '';
      const status = n.status && n.status !== 'current' ? `<span class="o-status">${esc(n.status)}</span>` : '';
      return `<li role="treeitem" aria-level="${level}" aria-selected="false" ${n.childIds.length ? 'aria-expanded="true"' : ''} data-id="${esc(id)}" data-level="${esc(n.levelId ?? '')}" tabindex="-1" style="--c:${BRANCH_COLOR[n.branch]}">
        <span class="o-row"><span class="o-dot" aria-hidden="true"></span><span class="o-label">${esc(n.instrument?.names.common ?? n.level?.names.common ?? n.label)}</span>${share}${status}</span>
        ${kids ? `<ul role="group">${kids}</ul>` : ''}
      </li>`;
    };
    this.root.innerHTML = `<h2 id="outline-title">Hierarchy</h2>
      <p class="muted">Arrow keys move through the tree; Enter opens a core in the detail panel.</p>
      <ul role="tree" aria-labelledby="outline-title" class="o-tree">${render(model.rootId, 1)}</ul>`;
    this.tree = this.root.querySelector('[role="tree"]') as HTMLElement;
    this.tree.addEventListener('click', (ev) => {
      const li = (ev.target as Element).closest('[role="treeitem"]') as HTMLElement | null;
      if (li) {
        this.onSelect(li.dataset.id!);
        ev.stopPropagation();
      }
    });
    this.tree.addEventListener('keydown', (ev) => this.onKey(ev));
    this.setSelected(model.rootId);
  }

  private items(): HTMLElement[] {
    return [...this.tree.querySelectorAll<HTMLElement>('[role="treeitem"]')].filter((li) => !li.hidden && li.style.display !== 'none');
  }

  private onKey(ev: KeyboardEvent) {
    const li = (ev.target as Element).closest('[role="treeitem"]') as HTMLElement | null;
    if (!li) return;
    const items = this.items();
    const i = items.indexOf(li);
    let next: HTMLElement | undefined;
    switch (ev.key) {
      case 'ArrowDown':
        next = items[Math.min(items.length - 1, i + 1)];
        break;
      case 'ArrowUp':
        next = items[Math.max(0, i - 1)];
        break;
      case 'ArrowRight':
        next = li.querySelector<HTMLElement>(':scope > ul > [role="treeitem"]') ?? undefined;
        break;
      case 'ArrowLeft':
        next = li.parentElement?.closest<HTMLElement>('[role="treeitem"]') ?? undefined;
        break;
      case 'Home':
        next = items[0];
        break;
      case 'End':
        next = items[items.length - 1];
        break;
      case 'Enter':
      case ' ':
        this.onSelect(li.dataset.id!);
        ev.preventDefault();
        return;
      default:
        return;
    }
    ev.preventDefault();
    if (next) {
      this.focusItem(next);
      this.onSelect(next.dataset.id!);
    }
  }

  private focusItem(li: HTMLElement) {
    this.tree.querySelectorAll('[tabindex="0"]').forEach((e) => e.setAttribute('tabindex', '-1'));
    li.setAttribute('tabindex', '0');
    li.focus({ preventScroll: false });
  }

  setSelected(id: string) {
    if (!this.tree) return;
    this.tree.querySelectorAll<HTMLElement>('[role="treeitem"]').forEach((li) => {
      const sel = li.dataset.id === id;
      li.setAttribute('aria-selected', String(sel));
      li.classList.toggle('is-selected', sel);
      li.setAttribute('tabindex', sel ? '0' : '-1');
    });
  }

  setFilter(levelId: string | null) {
    this.filter = levelId;
    this.tree.querySelectorAll<HTMLElement>('[role="treeitem"]').forEach((li) => {
      const lvl = li.dataset.level!;
      const hide = !!levelId && lvl !== '' && lvl !== levelId;
      li.style.display = hide ? 'none' : '';
    });
  }

  get currentFilter() {
    return this.filter;
  }
}
