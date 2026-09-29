/**
 * The Fighters screen: every country as a pixel-art fighter whose stats are measured from the
 * structure of its tax system, with a two-fighter comparison and a sortable table of all countries.
 */
import { loadProfileFiles, loadSources, loadStructure, registry } from '../data/loader';
import type { Source } from '../data/schema';
import { HEADING_COLOR, HEADING_LABEL, HEADING_ORDER } from '../ui/charts';
import { esc, prefersReducedMotion } from '../util/dom';
import { buildProfile, identityOfMeta, identityOfProfile, type Profile, type Stat } from './profile';
import { H, W, beltColors, lookFor, paintFighter } from './sprite';

interface Entry {
  profile: Profile;
  sources: Map<string, Source>;
}

export interface ArenaHandle {
  destroy(): void;
  /** Called by the router when the hash changes while the screen is open. */
  setParams(a?: string, b?: string): void;
}

const TABLE_COLS: { key: string; label: string }[] = [
  { key: 'take', label: 'Tax take' },
  { key: 'income', label: 'Income' },
  { key: 'consumption', label: 'Consumption' },
  { key: 'social', label: 'Social' },
  { key: 'property', label: 'Property' },
  { key: 'other', label: 'Payroll & other' },
  { key: 'balance', label: 'Balance' },
  { key: 'local', label: 'Local power' },
  { key: 'own', label: 'Own resources' },
];

const stat = (p: Profile, key: string): Stat => p.stats.find((s) => s.key === key)!;

/** Short names for the harmonised sources, so the reader can tell the three OECD links apart. */
const SOURCE_LABEL: Record<string, string> = {
  'oecd-rs-2025-subsectors': 'OECD Revenue Statistics: levels of government',
  'oecd-rs-2025-levels': 'OECD Revenue Statistics: tax mix and % of GDP',
  'oecd-rs-lac-2025-note': 'OECD Latin America Revenue Statistics: tax mix',
  'oecd-rs-lac-2025-levels': 'OECD Latin America Revenue Statistics: levels of government',
  'sng-wofi-profile': 'OECD/UCLG subnational finance observatory',
};

export async function mountArena(root: HTMLElement, first: { a?: string; b?: string }, onPick: (a: string | undefined, b: string | undefined) => void): Promise<ArenaHandle> {
  root.innerHTML = `<div class="arena-loading">Loading the roster…</div>`;
  const entries: Entry[] = [];
  await Promise.all([
    // countries with a folio: their own structure.json
    ...registry.map(async (meta) => {
      const st = await loadStructure(meta.id);
      if (!st) return;
      const sources = new Map((await loadSources(meta.id)).map((s) => [s.id, s]));
      entries.push({ profile: buildProfile(identityOfMeta(meta), st), sources });
    }),
    // profile-only countries: the same harmonised layer, no folio yet
    loadProfileFiles().then((files) => {
      for (const p of files) {
        if (entries.some((e) => e.profile.id === p.id)) continue;
        entries.push({ profile: buildProfile(identityOfProfile(p), p.structure), sources: new Map(p.sources.map((s) => [s.id, s])) });
      }
    }),
  ]);
  entries.sort((x, y) => x.profile.name.localeCompare(y.profile.name));
  const byId = new Map(entries.map((e) => [e.profile.id, e]));

  let a: string | undefined = first.a && byId.has(first.a) ? first.a : (entries.find((e) => e.profile.id === 'canada') ?? entries[0])?.profile.id;
  let b: string | undefined = first.b && byId.has(first.b) ? first.b : undefined;
  let slot: 'a' | 'b' = b ? 'a' : 'b';
  let sortKey = 'name';
  let sortDir: 1 | -1 = 1;
  let frame: 0 | 1 = 0;

  root.innerHTML = `
    <div class="arena">
      <header class="arena-head">
        <h1>Fiscal <em>Fighters</em></h1>
        <p class="lead">Each country as a fighter. Nothing here is scored by opinion: every bar is a <strong>measured value</strong> from the structure of the tax system (OECD Revenue Statistics, ${entries[0]?.profile.year ?? 2023}, the same year and definitions for every country) on the scale printed beside it. The <strong>belt</strong> is the country's tax mix; the <strong>aura</strong> is the colour of its biggest tax heading.</p>
        <ul class="belt-key" aria-label="Belt and aura colours">${HEADING_ORDER.map((h) => `<li><span class="sw" style="background:${HEADING_COLOR[h]}" aria-hidden="true"></span>${esc(HEADING_LABEL[h])}</li>`).join('')}</ul>
      </header>
      <div class="ring">
        <section class="hud hud-a" aria-live="polite"></section>
        <div class="fighters">
          <figure class="fighter fa"><canvas width="${W}" height="${H}" role="img"></canvas><figcaption class="plate"></figcaption></figure>
          <div class="vs" aria-hidden="true">VS</div>
          <figure class="fighter fb"><canvas width="${W}" height="${H}" role="img"></canvas><figcaption class="plate"></figcaption></figure>
        </div>
        <section class="hud hud-b" aria-live="polite"></section>
      </div>
      <nav class="roster" aria-label="Choose fighters">
        <div class="slots" role="group" aria-label="Which fighter to change">
          <button type="button" class="slot" data-slot="a" aria-pressed="true">Fighter 1</button>
          <button type="button" class="slot" data-slot="b" aria-pressed="false">Fighter 2</button>
          <button type="button" class="slot slot-clear" data-clear>Clear fighter 2</button>
        </div>
        <ul class="picks">${entries
          .map(
            (e) =>
              `<li><button type="button" class="pick" data-id="${esc(e.profile.id)}" style="--a:${e.profile.accent}"><canvas width="20" height="20" aria-hidden="true"></canvas><span>${esc(e.profile.name)}</span>${e.profile.hasFolio ? '<i class="tag" title="Has a tax folio">folio</i>' : ''}</button></li>`,
          )
          .join('')}</ul>
      </nav>
      <details class="guide">
        <summary>How every stat is computed, and what it can and cannot tell you</summary>
        <div class="guide-body"></div>
      </details>
      <section class="compare" aria-labelledby="cmp-title">
        <h2 id="cmp-title">All countries side by side</h2>
        <p class="muted">Click a column heading to sort. Click a country to load it into the arena.</p>
        <div class="table-wrap"><table></table></div>
      </section>
    </div>`;

  const q = <T extends HTMLElement>(sel: string) => root.querySelector(sel) as T;
  const canvasA = q<HTMLCanvasElement>('.fa canvas');
  const canvasB = q<HTMLCanvasElement>('.fb canvas');
  const ctxA = canvasA.getContext('2d')!;
  const ctxB = canvasB.getContext('2d')!;

  /* ---------------------------------------------------------------- drawing */
  const paint = (ctx: CanvasRenderingContext2D, e: Entry, facing: 1 | -1) =>
    paintFighter(ctx, lookFor(e.profile.id, e.profile.flag), { frame, facing, aura: HEADING_COLOR[e.profile.dominant], belt: beltColors(e.profile.mix) });

  const drawPortraits = () => {
    root.querySelectorAll<HTMLButtonElement>('.pick').forEach((btn) => {
      const e = byId.get(btn.dataset.id!)!;
      const c = btn.querySelector('canvas') as HTMLCanvasElement;
      const tmp = document.createElement('canvas');
      tmp.width = W;
      tmp.height = H;
      paintFighter(tmp.getContext('2d')!, lookFor(e.profile.id, e.profile.flag), { frame: 0, facing: 1, aura: '#000', belt: beltColors(e.profile.mix), stage: false });
      const cx = c.getContext('2d')!;
      cx.clearRect(0, 0, 20, 20);
      cx.drawImage(tmp, 5, 1, 20, 20, 0, 0, 20, 20);
    });
  };

  const mixText = (p: Profile) => HEADING_ORDER.filter((h) => p.mix[h] >= 0.005).map((h) => `${HEADING_LABEL[h]} ${(p.mix[h] * 100).toFixed(0)}%`).join(', ');

  function hud(which: 'a' | 'b') {
    const el = q<HTMLElement>(`.hud-${which}`);
    const id = which === 'a' ? a : b;
    const e = id ? byId.get(id) : undefined;
    if (!e) {
      el.innerHTML = `<div class="hud-empty"><h2>Fighter 2</h2><p class="muted">Choose a second country below to compare. Stats then show who leads on each measure.</p></div>`;
      return;
    }
    const other = which === 'a' ? (b ? byId.get(b) : undefined) : a ? byId.get(a) : undefined;
    const p = e.profile;
    const rows = p.stats
      .map((s) => {
        const o = other ? stat(other.profile, s.key) : undefined;
        const lead = o && s.value !== null && o.value !== null && Math.abs(s.value - o.value) >= 0.05 && s.value > o.value;
        return `<li class="stat${lead ? ' lead' : ''}${s.value === null ? ' na' : ''}" title="${esc(s.how)}">
          <span class="s-label">${esc(s.label)}</span>
          <span class="s-bar" aria-hidden="true"><i style="width:${s.bar === null ? 0 : (s.bar * 100).toFixed(1)}%"></i></span>
          <span class="s-val">${esc(s.display)}${lead ? '<span class="sr-only"> (higher)</span><b aria-hidden="true">▲</b>' : ''}</span>
        </li>`;
      })
      .join('');
    const links = [...new Set(p.sourceIds)]
      .map((sid) => e.sources.get(sid))
      .filter((s): s is Source => !!s)
      .map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(SOURCE_LABEL[s.id] ?? s.org)}<span class="sr-only"> (opens in a new tab)</span> ↗</a>`)
      .join(' · ');
    const flags = [
      p.researchStatus === 'profile' ? `<span class="chip">Profile only · folio not built yet</span>` : p.researchStatus !== 'researched' ? `<span class="chip chip-warn">Research: ${esc(p.researchStatus)}</span>` : '',
      ...p.stats.filter((s) => s.value === null).map((s) => `<span class="chip">${esc(s.label)}: n/a</span>`),
    ].join('');
    const caveats = p.stats.filter((s) => s.caveat).map((s) => `<li><strong>${esc(s.label)}.</strong> ${esc(s.caveat!)}</li>`).join('');
    el.innerHTML = `
      <h2 class="f-name" style="--a:${p.accent}">${esc(p.name)}</h2>
      <p class="f-style">${esc(p.archetype)} · ${esc(p.structureClass)}</p>
      ${p.hasFolio ? `<p class="f-open"><a href="#/${esc(p.id)}">Open ${esc(p.name)}'s tax folio →</a></p>` : ''}
      ${flags ? `<p class="f-flags">${flags}</p>` : ''}
      <ul class="stats">${rows}</ul>
      <p class="f-data">Data: ${links}. Reference year ${p.year}, ${esc(p.currency)}.</p>
      ${caveats || p.notes.length ? `<details class="f-caveats"><summary>Caveats for ${esc(p.name)}</summary><ul>${caveats}${p.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></details>` : ''}`;
  }

  function plate(which: 'a' | 'b') {
    const el = q<HTMLElement>(`.f${which} .plate`);
    const canvas = which === 'a' ? canvasA : canvasB;
    const id = which === 'a' ? a : b;
    const e = id ? byId.get(id) : undefined;
    root.querySelector(`.f${which}`)!.toggleAttribute('hidden', !e);
    root.querySelector('.vs')!.toggleAttribute('hidden', !(a && b));
    if (!e) return;
    el.textContent = e.profile.name;
    canvas.setAttribute('aria-label', `Pixel-art fighter representing ${e.profile.name}. Its belt shows the tax mix: ${mixText(e.profile)}. Its aura is the colour of its biggest heading, ${HEADING_LABEL[e.profile.dominant]}.`);
  }

  function redrawFighters() {
    const ea = a ? byId.get(a) : undefined;
    const eb = b ? byId.get(b) : undefined;
    if (ea) paint(ctxA, ea, 1);
    if (eb) paint(ctxB, eb, -1);
  }

  function guide() {
    const sample = entries[0]?.profile.stats ?? [];
    q<HTMLElement>('.guide-body').innerHTML = `
      <p>Stats are <strong>measurements</strong>, not ratings. Each bar is filled to the real value on the scale shown in the definition below, so two bars can be compared by eye and the number beside it is the exact figure.</p>
      <dl class="guide-list">${sample.map((s) => `<dt>${esc(s.label)}</dt><dd>${esc(s.how)}</dd>`).join('')}</dl>
      <h3>Style</h3>
      <p>The style line combines two rules. The <em>archetype</em> is the biggest tax heading: income taxes (Income Striker), goods and services (Consumption Guard), social contributions (Social Bulwark), property (Property Warden), payroll and other (Wildcard). The <em>structure</em> is Decentralised when regional and local governments collect at least 25% of all tax, Mixed from 10% to 25%, Centralised below 10%.</p>
      <h3>What the picture encodes</h3>
      <p>The <strong>belt</strong> has twelve segments in the proportions of the tax mix (a heading with at least 2% keeps one segment). The <strong>aura</strong> takes the colour of the biggest heading. Clothes, hair and emblem are decoration that only alludes to the country; they carry no data.</p>
      <h3>Limits you should know</h3>
      <ul>
        <li>The tax mix and levels come from the OECD's harmonised classification for one reference year. They can differ from the newer national figures that size the cores in the folio.</li>
        <li>"Own resources" comes from a different dataset (OECD/UCLG subnational finance observatory, 2019–2020). Its treatment of shared taxes differs by country, so it is shown only where it is comparable and marked n/a otherwise.</li>
        <li>A high share of a tax heading says how a state raises money, not whether the system is fair, efficient or good. Tax take (% of GDP) is a measure of size, not of quality.</li>
        <li>Countries marked "Research: partial" have gaps in their folio data; the profile stats here do not depend on those gaps.</li>
      </ul>`;
  }

  function table() {
    const cols = [{ key: 'name', label: 'Country' }, { key: 'style', label: 'Style' }, ...TABLE_COLS];
    const val = (e: Entry, key: string): number | string | null => (key === 'name' ? e.profile.name : key === 'style' ? e.profile.archetype : stat(e.profile, key).value);
    const rows = [...entries].sort((x, y) => {
      const vx = val(x, sortKey);
      const vy = val(y, sortKey);
      if (vx === null && vy === null) return 0;
      if (vx === null) return 1;
      if (vy === null) return -1;
      if (typeof vx === 'string' || typeof vy === 'string') return String(vx).localeCompare(String(vy)) * sortDir;
      return (vx - vy) * sortDir;
    });
    const t = q<HTMLTableElement>('.compare table');
    t.innerHTML = `<thead><tr>${cols
      .map(
        (c) =>
          `<th scope="col" aria-sort="${sortKey === c.key ? (sortDir === 1 ? 'ascending' : 'descending') : 'none'}"><button type="button" data-sort="${c.key}">${esc(c.label)}<span aria-hidden="true">${sortKey === c.key ? (sortDir === 1 ? ' ▲' : ' ▼') : ''}</span></button></th>`,
      )
      .join('')}</tr></thead>
      <tbody>${rows
        .map(
          (e) => `<tr><th scope="row"><button type="button" class="row-pick" data-id="${esc(e.profile.id)}" style="--a:${e.profile.accent}">${esc(e.profile.name)}</button>${e.profile.hasFolio ? ' <i class="tag" title="Has a tax folio">folio</i>' : ''}</th>
          <td class="t-style">${esc(e.profile.archetype)}<small>${esc(e.profile.structureClass)}</small></td>
          ${TABLE_COLS.map((c) => {
            const s = stat(e.profile, c.key);
            return `<td class="t-num${s.value === null ? ' na' : ''}" style="--w:${s.bar === null ? 0 : (s.bar * 100).toFixed(0)}%" title="${esc(s.how)}"><span>${esc(s.display)}</span></td>`;
          }).join('')}</tr>`,
        )
        .join('')}</tbody>`;
  }

  function slots() {
    root.querySelectorAll<HTMLButtonElement>('.slot[data-slot]').forEach((s) => s.setAttribute('aria-pressed', String(s.dataset.slot === slot)));
    root.querySelectorAll<HTMLButtonElement>('.pick').forEach((p) => {
      const id = p.dataset.id;
      p.setAttribute('aria-pressed', String(id === a || id === b));
      p.classList.toggle('is-a', id === a);
      p.classList.toggle('is-b', id === b);
    });
    root.querySelector('.slot-clear')!.toggleAttribute('hidden', !b);
  }

  function refresh(announceChange = false) {
    hud('a');
    hud('b');
    plate('a');
    plate('b');
    redrawFighters();
    slots();
    root.querySelector('.ring')!.classList.toggle('is-solo', !b);
    document.title = `${a ? byId.get(a)!.profile.name : 'Fighters'}${b ? ` vs ${byId.get(b)!.profile.name}` : ''} – Fiscal Fighters – Tax Folios Atlas`;
    if (announceChange) {
      const ea = a ? byId.get(a) : undefined;
      const eb = b ? byId.get(b) : undefined;
      const live = document.getElementById('live-region');
      if (live && ea) live.textContent = eb ? `Comparing ${ea.profile.name} with ${eb.profile.name}.` : `${ea.profile.name}: ${ea.profile.archetype}, ${ea.profile.structureClass}.`;
    }
  }

  /* ------------------------------------------------------------ interaction */
  root.addEventListener('click', (ev) => {
    const t = ev.target as HTMLElement;
    const pick = t.closest('.pick, .row-pick') as HTMLElement | null;
    if (pick) {
      const id = pick.dataset.id!;
      if (pick.classList.contains('row-pick')) {
        // table: load into the slot in play
        slot === 'a' || !a ? (a = id) : (b = id);
      } else if (slot === 'a') {
        a = id;
        if (b === id) b = undefined;
        slot = 'b';
      } else {
        b = id === a ? undefined : id;
        slot = 'a';
      }
      onPick(a, b);
      refresh(true);
      if (pick.classList.contains('row-pick')) root.querySelector('.arena-head')?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
      return;
    }
    const s = t.closest('.slot[data-slot]') as HTMLElement | null;
    if (s) {
      slot = s.dataset.slot as 'a' | 'b';
      slots();
      return;
    }
    if (t.closest('[data-clear]')) {
      b = undefined;
      slot = 'b';
      onPick(a, b);
      refresh(true);
      return;
    }
    const sort = t.closest('[data-sort]') as HTMLElement | null;
    if (sort) {
      const k = sort.dataset.sort!;
      if (sortKey === k) sortDir = (sortDir * -1) as 1 | -1;
      else {
        sortKey = k;
        sortDir = k === 'name' || k === 'style' ? 1 : -1;
      }
      table();
    }
  });

  /* ------------------------------------------------------------------ start */
  guide();
  table();
  drawPortraits();
  refresh();
  const timer = prefersReducedMotion()
    ? 0
    : window.setInterval(() => {
        frame = frame ? 0 : 1;
        redrawFighters();
      }, 520);

  return {
    destroy() {
      if (timer) clearInterval(timer);
      root.innerHTML = '';
    },
    setParams(na, nb) {
      if (na && byId.has(na)) a = na;
      b = nb && byId.has(nb) && nb !== a ? nb : undefined;
      refresh();
    },
  };
}
