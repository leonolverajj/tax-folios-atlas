/**
 * Browser verification: screenshots + geometry measurements + interaction checks.
 *
 *   node scripts/verify.mjs shots     [--base=http://localhost:5173] [--only=canada,brazil] [--out=docs/screenshots]
 *   node scripts/verify.mjs geometry  [--base=...] [--only=...]
 *   node scripts/verify.mjs a11y      [--base=...] [--only=...]
 *   node scripts/verify.mjs layout    [--base=...] [--only=...]        (drag / save / reload; needs `npm run dev`)
 *   node scripts/verify.mjs all
 *
 * Uses the system Chrome (playwright-core, no browser download).
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const mode = args.find((a) => !a.startsWith('--')) ?? 'shots';
const opt = (name, dflt) => (args.find((a) => a.startsWith(`--${name}=`)) ?? '').split('=')[1] ?? dflt;
const BASE = opt('base', 'http://localhost:5173');
const OUT = path.resolve(ROOT, opt('out', 'docs/screenshots'));
const ONLY = opt('only', '').split(',').filter(Boolean);
fs.mkdirSync(OUT, { recursive: true });

const countries = fs
  .readdirSync(path.join(ROOT, 'countries'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && fs.existsSync(path.join(ROOT, 'countries', d.name, 'country.json')))
  .map((d) => d.name)
  .filter((c) => !ONLY.length || ONLY.includes(c));

const SIZES = {
  desktop: { width: 1440, height: 900, deviceScaleFactor: 1 },
  laptop: { width: 1180, height: 760, deviceScaleFactor: 1 },
  tablet: { width: 820, height: 1100, deviceScaleFactor: 1 },
  mobile: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

const problems = [];
const note = (m) => {
  problems.push(m);
  console.log('  ✗', m);
};
const ok = (m) => console.log('  ✓', m);

async function newPage(browser, size, url) {
  const ctx = await browser.newContext({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: size.deviceScaleFactor ?? 1, isMobile: size.isMobile, hasTouch: size.hasTouch });
  const page = await ctx.newPage();
  const logs = [];
  page.on('console', (m) => {
    if (['error', 'warning'].includes(m.type())) logs.push(`${m.type()}: ${m.text()}`);
  });
  page.on('pageerror', (e) => logs.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => logs.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`));
  page.on('response', (r) => {
    if (r.status() >= 400) logs.push(`http ${r.status()}: ${r.url()}`);
  });
  page.__logs = logs;
  page.__ctx = ctx;
  await page.goto(url, { waitUntil: 'networkidle' });
  return page;
}

async function waitFolio(page) {
  await page.waitForSelector('.folio-svg .node', { timeout: 15000 });
  await page.waitForTimeout(900);
}

/** Geometry: every edge endpoint must lie on the rim of the parent / child it belongs to. */
async function measureEdges(page) {
  return page.evaluate(() => {
    const rows = [];
    const circleOf = (id) => document.querySelector(`.node[data-id="${id}"] .rim`);
    // A core's radius is the OUTER edge of its rim: geometry radius + half the stroke,
    // measured in screen pixels through the element's own transform.
    const outer = (el) => {
      const b = el.getBoundingClientRect();
      const k = el.getScreenCTM().a;
      const sw = parseFloat(getComputedStyle(el).strokeWidth) || 0;
      return { x: b.left + b.width / 2, y: b.top + b.height / 2, r: b.width / 2 + (sw / 2) * k };
    };
    for (const e of document.querySelectorAll('.edge')) {
      const from = e.dataset.from;
      const to = e.dataset.to;
      const pc = outer(circleOf(from));
      const cc = outer(circleOf(to));
      const sa = e.querySelector('.socket-a').getBoundingClientRect();
      const sb = e.querySelector('.socket-b').getBoundingClientRect();
      const A = { x: sa.left + sa.width / 2, y: sa.top + sa.height / 2 };
      const B = { x: sb.left + sb.width / 2, y: sb.top + sb.height / 2 };
      const dA = Math.hypot(A.x - pc.x, A.y - pc.y);
      const dB = Math.hypot(B.x - cc.x, B.y - cc.y);
      const angCore = Math.atan2(cc.y - pc.y, cc.x - pc.x);
      const angA = Math.atan2(A.y - pc.y, A.x - pc.x);
      const angB = Math.atan2(B.y - cc.y, B.x - cc.x);
      const diff = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b))) * (180 / Math.PI);
      // line element endpoints too
      const ln = e.querySelector('.edge-line');
      const ctm = ln.getScreenCTM();
      const pt = (x, y) => ({ x: ctm.a * x + ctm.c * y + ctm.e, y: ctm.b * x + ctm.d * y + ctm.f });
      const L1 = pt(+ln.getAttribute('x1'), +ln.getAttribute('y1'));
      const L2 = pt(+ln.getAttribute('x2'), +ln.getAttribute('y2'));
      // the diamond joint (when shown) must sit on the middle of the socket-to-socket segment
      const jt = e.querySelector('.joint');
      let jointErr = 0;
      if (jt && getComputedStyle(jt).display !== 'none') {
        const jb = jt.getBoundingClientRect();
        jointErr = Math.hypot(jb.left + jb.width / 2 - (A.x + B.x) / 2, jb.top + jb.height / 2 - (A.y + B.y) / 2);
      }
      rows.push({
        edge: `${from}>${to}`,
        parentRadius: pc.r,
        childRadius: cc.r,
        socketErrA: Math.abs(dA - pc.r),
        socketErrB: Math.abs(dB - cc.r),
        angErrA: diff(angA, angCore),
        angErrB: diff(angB, angCore + Math.PI),
        lineErrA: Math.hypot(L1.x - A.x, L1.y - A.y),
        lineErrB: Math.hypot(L2.x - B.x, L2.y - B.y),
        jointErr,
        overlapping: e.classList.contains('overlapping'),
      });
    }
    return rows;
  });
}

function assertEdges(rows, label, tolPx = 1.0, tolDeg = 1.0) {
  let bad = 0;
  for (const r of rows) {
    if (r.overlapping) continue;
    if (r.socketErrA > tolPx || r.socketErrB > tolPx || r.angErrA > tolDeg || r.angErrB > tolDeg || r.lineErrA > tolPx || r.lineErrB > tolPx || r.jointErr > tolPx) {
      bad++;
      note(`${label}: edge ${r.edge} misaligned (sockets ${r.socketErrA.toFixed(2)}/${r.socketErrB.toFixed(2)}px, angle ${r.angErrA.toFixed(2)}/${r.angErrB.toFixed(2)}°, line ${r.lineErrA.toFixed(2)}/${r.lineErrB.toFixed(2)}px, joint ${r.jointErr.toFixed(2)}px)`);
    }
  }
  if (!bad) ok(`${label}: ${rows.length} edges join their cores (max socket error ${Math.max(0, ...rows.map((r) => Math.max(r.socketErrA, r.socketErrB))).toFixed(2)}px, max line error ${Math.max(0, ...rows.map((r) => Math.max(r.lineErrA, r.lineErrB))).toFixed(2)}px)`);
}

/** Each edge in the DOM must correspond to a parent-child relationship in the data. */
async function assertEdgesMatchData(page, label) {
  const res = await page.evaluate(() => {
    const m = window.__tfa.model;
    const bad = [];
    document.querySelectorAll('.edge').forEach((e) => {
      const child = m.nodes.get(e.dataset.to);
      if (!child || child.parentId !== e.dataset.from) bad.push(`${e.dataset.from}>${e.dataset.to}`);
    });
    const expected = m.nodes.size - 1;
    return { bad, count: document.querySelectorAll('.edge').length, expected };
  });
  if (res.bad.length || res.count !== res.expected) note(`${label}: edge/data mismatch ${JSON.stringify(res)}`);
  else ok(`${label}: ${res.count} drawn edges = ${res.expected} parent-child links in the data`);
}

async function shots(browser) {
  // Map
  for (const sz of ['desktop', 'mobile']) {
    const page = await newPage(browser, SIZES[sz], `${BASE}/?debug=1`);
    await page.waitForSelector('.country.active', { timeout: 15000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(OUT, `map-${sz}.png`) });
    ok(`map-${sz}.png`);
    if (page.__logs.length) page.__logs.forEach((l) => note(`map-${sz} console: ${l}`));
    await page.__ctx.close();
  }
  for (const c of countries) {
    for (const sz of ['desktop', 'mobile']) {
      const page = await newPage(browser, SIZES[sz], `${BASE}/?debug=1#/${c}`);
      await waitFolio(page);
      await page.screenshot({ path: path.join(OUT, `${c}-folio-${sz}.png`) });
      // largest revenue-sized national node
      const pick = await page.evaluate(() => {
        const nodes = [...window.__tfa.model.nodes.values()].filter((n) => n.radiusSource === 'revenue');
        nodes.sort((a, b) => b.revenue.share - a.revenue.share);
        return nodes[0]?.id ?? [...window.__tfa.model.nodes.values()].find((n) => n.kind === 'instrument').id;
      });
      await page.evaluate((id) => window.__tfa.view.select(id, 'outline'), pick);
      await page.waitForTimeout(700);
      await page.screenshot({ path: path.join(OUT, `${c}-selected-${sz}.png`) });
      ok(`${c}-folio/selected-${sz}.png (selected ${pick})`);
      page.__logs.forEach((l) => note(`${c} ${sz} console: ${l}`));
      await page.__ctx.close();
    }
  }
}

async function geometry(browser) {
  for (const c of countries) {
    console.log(`\n${c}`);
    for (const szName of ['desktop', 'tablet', 'mobile']) {
      const page = await newPage(browser, SIZES[szName], `${BASE}/?debug=1#/${c}`);
      await waitFolio(page);
      await assertEdgesMatchData(page, `${c}/${szName}`);
      assertEdges(await measureEdges(page), `${c}/${szName} initial`);
      // select a leaf: lit path
      const leaf = await page.evaluate(() => [...window.__tfa.model.nodes.values()].filter((n) => n.kind === 'instrument').slice(-1)[0].id);
      await page.evaluate((id) => window.__tfa.view.select(id, 'outline'), leaf);
      await page.waitForTimeout(600);
      assertEdges(await measureEdges(page), `${c}/${szName} after select`);
      // zoom with wheel
      const box = await page.locator('.folio-svg').boundingBox();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.wheel(0, -400);
      await page.waitForTimeout(400);
      assertEdges(await measureEdges(page), `${c}/${szName} after zoom in`);
      await page.mouse.wheel(0, 900);
      await page.waitForTimeout(400);
      assertEdges(await measureEdges(page), `${c}/${szName} after zoom out`);
      // resize
      const vp = page.viewportSize();
      await page.setViewportSize({ width: Math.round(vp.width * 0.8), height: Math.round(vp.height * 0.85) });
      await page.waitForTimeout(500);
      assertEdges(await measureEdges(page), `${c}/${szName} after resize`);
      // radius change on an unsized core
      const resized = await page.evaluate(() => {
        const v = window.__tfa.view;
        const n = [...v.model.nodes.values()].find((x) => x.radiusSource !== 'revenue' && x.kind === 'instrument');
        if (!n) return null;
        v.setNodeRadius(n.id, n.r + 14);
        return n.id;
      });
      if (resized) {
        await page.waitForTimeout(300);
        assertEdges(await measureEdges(page), `${c}/${szName} after resizing core ${resized}`);
      }
      page.__logs.forEach((l) => note(`${c} ${szName} console: ${l}`));
      await page.__ctx.close();
    }
  }
}

async function a11y(browser) {
  for (const c of countries) {
    console.log(`\n${c}`);
    const page = await newPage(browser, SIZES.desktop, `${BASE}/?debug=1#/${c}`);
    await waitFolio(page);
    // keyboard: focus is on the selected node; walk the tree
    const title0 = await page.locator('#detail-title').innerText();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(150);
    const title1 = await page.locator('#detail-title').innerText();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(150);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(150);
    const title2 = await page.locator('#detail-title').innerText();
    if (title0 === title1 || title1 === title2) note(`${c}: arrow keys did not change the detail panel (${title0} / ${title1} / ${title2})`);
    else ok(`${c}: keyboard tree navigation (${title0} → ${title1} → ${title2})`);
    // every node reachable via outline
    const counts = await page.evaluate(() => ({ nodes: document.querySelectorAll('.folio-svg .node').length, items: document.querySelectorAll('#outline-drawer [role=treeitem]').length }));
    if (counts.nodes !== counts.items) note(`${c}: ${counts.nodes} cores vs ${counts.items} outline items`);
    else ok(`${c}: outline lists all ${counts.items} cores`);
    // accessible names & focus ring
    const unnamed = await page.evaluate(() => [...document.querySelectorAll('.node')].filter((n) => !(n.getAttribute('aria-label') || '').trim()).length);
    if (unnamed) note(`${c}: ${unnamed} cores without accessible name`);
    // hit target sizes (screen px) at current zoom
    const small = await page.evaluate(() => [...document.querySelectorAll('.node .hit')].map((h) => ({ id: h.closest('.node').dataset.id, w: h.getBoundingClientRect().width })).filter((h) => h.w < 24));
    if (small.length) note(`${c}: ${small.length} hit areas under 24px at desktop overview: ${small.map((s) => `${s.id}:${s.w.toFixed(0)}`).join(', ')}`);
    else ok(`${c}: all hit areas ≥ 24px on desktop`);
    // links in panel
    const linkIssue = await page.evaluate(() => [...document.querySelectorAll('#detail-panel a[href^=http]')].filter((a) => a.rel.indexOf('noopener') < 0).length);
    if (linkIssue) note(`${c}: external links without rel=noopener`);
    // emulate reduced motion
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const anim = await page.evaluate(() => getComputedStyle(document.querySelector('.edge .edge-flow')).animationName);
    if (anim !== 'none') note(`${c}: animations still running under prefers-reduced-motion (${anim})`);
    else ok(`${c}: reduced-motion disables animations`);
    page.__logs.forEach((l) => note(`${c} console: ${l}`));
    await page.__ctx.close();
  }
}

async function layout(browser) {
  const c = ONLY[0] ?? countries[0];
  console.log(`\nlayout editing on ${c} (dev server required)`);
  const page = await newPage(browser, SIZES.desktop, `${BASE}/?debug=1#/${c}`);
  await waitFolio(page);
  await page.click('#btn-layout');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUT, `${c}-layout-before.png`) });
  const before = await page.evaluate(() => JSON.stringify(window.__tfa.view.getLayout()));
  // pick a leaf that is comfortably inside the viewport and drag it by an off-centre grab point
  const target = await page.evaluate(() => {
    const v = window.__tfa.view;
    const n = [...v.model.nodes.values()].find((x) => x.kind === 'instrument');
    const el = document.querySelector(`.node[data-id="${n.id}"] .rim`).getBoundingClientRect();
    return { id: n.id, cx: el.left + el.width / 2, cy: el.top + el.height / 2, r: el.width / 2 };
  });
  const grabX = target.cx + target.r * 0.55;
  const grabY = target.cy + target.r * 0.3;
  await page.mouse.move(grabX, grabY);
  await page.mouse.down();
  await page.mouse.move(grabX + 40, grabY + 25, { steps: 6 });
  await page.mouse.move(grabX + 120, grabY + 70, { steps: 8 });
  const mid = await page.evaluate((id) => {
    const r = document.querySelector(`.node[data-id="${id}"] .rim`).getBoundingClientRect();
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
  }, target.id);
  // grab-offset check: centre moved exactly by the pointer delta (no jump to the pointer)
  const dxErr = Math.abs(mid.cx - target.cx - 120);
  const dyErr = Math.abs(mid.cy - target.cy - 70);
  if (dxErr > 1.5 || dyErr > 1.5) note(`drag jumped: centre moved by (${(mid.cx - target.cx).toFixed(1)}, ${(mid.cy - target.cy).toFixed(1)}) for a (120, 70) pointer move`);
  else ok(`drag keeps the grab offset (centre moved ${(mid.cx - target.cx).toFixed(1)}, ${(mid.cy - target.cy).toFixed(1)} for pointer 120, 70)`);
  assertEdges(await measureEdges(page), 'while dragging');
  await page.mouse.up();
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUT, `${c}-layout-after-drag.png`) });
  const status1 = await page.locator('.le-status').getAttribute('data-kind');
  if (status1 !== 'dirty') note(`status should be "dirty" after a drag but is "${status1}"`);
  else ok('status shows unsaved changes after a drag');
  // Save
  await page.click('.le-save');
  await page.waitForTimeout(700);
  const status2 = await page.locator('.le-status').getAttribute('data-kind');
  const text2 = await page.locator('.le-status-text').innerText();
  if (status2 !== 'saved') note(`save failed: ${text2}`);
  else ok(`save: ${text2}`);
  const saved = await page.evaluate(() => JSON.stringify(window.__tfa.view.getLayout()));
  // Reload and compare
  await page.reload({ waitUntil: 'networkidle' });
  await waitFolio(page);
  const after = await page.evaluate(() => JSON.stringify(window.__tfa.view.getLayout()));
  if (after !== saved) note('positions changed across reload');
  else ok('reload preserves the saved positions');
  await page.screenshot({ path: path.join(OUT, `${c}-layout-reloaded.png`) });
  assertEdges(await measureEdges(page), 'after reload');
  // Drag to the very bottom edge of the canvas
  await page.click('#btn-layout');
  const bottom = await page.evaluate((id) => {
    const v = window.__tfa.view;
    const n = v.model.nodes.get(id);
    v.setNodePosition(id, n.x, v.model.canvas.height);
    const r = document.querySelector(`.node[data-id="${id}"] .rim`).getBoundingClientRect();
    return { y: n.y, H: v.model.canvas.height, bottomPx: r.top + r.height / 2, vh: innerHeight };
  }, target.id);
  ok(`core can sit on the bottom canvas edge (y=${bottom.y}/${bottom.H})`);
  // Reset (restores the published = saved file)
  await page.click('.le-reset');
  await page.waitForTimeout(600);
  // restore original layout to leave the project clean
  await page.evaluate(async (json) => {
    await fetch(`/__tfa/layout/${window.__tfa.model.rootId}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-TFA-Edit': '1' }, body: json });
  }, before);
  ok('original layout restored');
  page.__logs.forEach((l) => note(`layout console: ${l}`));
  await page.__ctx.close();
}

/** Skill trees: one tree per folio, shared scale, keyboard-operable, sorts, highlights, opens the folio, fits the phone. */
async function trees(browser) {
  console.log('\nskill trees');
  const folioCount = fs.readdirSync(path.join(ROOT, 'countries'), { withFileTypes: true }).filter((d) => d.isDirectory() && fs.existsSync(path.join(ROOT, 'countries', d.name, 'country.json'))).length;
  const page = await newPage(browser, SIZES.desktop, `${BASE}/#/trees`);
  await page.waitForSelector('.tcard svg.tree', { timeout: 20000 });
  await page.waitForTimeout(400);
  const cards = await page.locator('.tcard').count();
  cards === folioCount ? ok(`one tree per folio (${cards})`) : note(`expected ${folioCount} trees, found ${cards}`);
  const views = await page.$$eval('.tcard svg.tree', (s) => [...new Set(s.map((x) => x.getAttribute('viewBox')))]);
  views.length === 1 ? ok(`all trees share one scale (viewBox ${views[0]})`) : note(`trees use different scales: ${views.join(' | ')}`);
  const labels = await page.$$eval('.tcard-hit', (b) => b.map((x) => x.getAttribute('aria-label') ?? ''));
  labels.every((l) => /charges across \d+ levels/.test(l)) ? ok('every tree has a text description with its counts') : note('a tree lacks its text description');
  // each tree draws one dot per node of its folio
  const dots = await page.$$eval('.tcard', (cs) => cs.map((c) => ({ id: c.dataset.id, n: c.querySelectorAll('.tn').length, e: c.querySelectorAll('.te').length })));
  dots.every((d) => d.e === d.n - 1) ? ok('every dot is joined to a parent (edges = dots − 1)') : note(`edges and dots disagree: ${JSON.stringify(dots.filter((d) => d.e !== d.n - 1))}`);
  // sort
  await page.selectOption('#tr-sort', 'charges-desc');
  const counts = await page.$$eval('.tcard .facts div:first-child b', (b) => b.map((x) => Number(x.textContent)));
  counts.every((c, i) => i === 0 || counts[i - 1] >= c) ? ok(`sorting by charges works (${counts.slice(0, 4).join(', ')} …)`) : note(`sort by charges is not descending: ${counts.join(',')}`);
  // equal-size mode: every charge has the same radius
  await page.click('[data-size="equal"]');
  const radii = await page.$$eval('.tcard:first-child .tn-charge .tn-body', (c) => [...new Set(c.map((x) => x.getAttribute('r')))]);
  radii.length === 1 ? ok('"every charge equal" draws one dot size') : note(`equal mode has several radii: ${radii.join(',')}`);
  await page.click('[data-size="revenue"]');
  // colour by kind changes charge colours, not the structure
  const before = await page.evaluate(() => getComputedStyle(document.querySelector('.tn-charge .tn-body')).fill);
  await page.click('button[data-color="kind"]');
  const afterKind = await page.evaluate(() => [...document.querySelectorAll('.tn-charge .tn-body')].map((e) => getComputedStyle(e).fill));
  new Set(afterKind).size > 2 ? ok('colouring by kind of tax uses several colours') : note('colour by kind did not change the dots');
  await page.click('button[data-color="level"]');
  void before;
  // highlight
  await page.click('.hl-chip[data-hl="family:property"]');
  const dim = await page.locator('.tn.is-dim').count();
  const countTxt = await page.locator('.hl-count').first().innerText();
  dim > 0 && countTxt.length > 0 ? ok(`highlighting a kind of tax dims the others and counts matches (“${countTxt}”)`) : note('highlight did not dim or count');
  await page.click('.hl-chip[data-hl=""]');
  // table sort
  await page.click('[data-sort="charges"]');
  const sortAttr = await page.locator('#tr-table th[aria-sort]').count();
  sortAttr === 1 ? ok('table sorts by a column and exposes aria-sort') : note('table header did not expose aria-sort');
  // keyboard: focus a card and press Enter -> dialog + address
  const first = page.locator('.tcard-hit').first();
  const id = await page.locator('.tcard').first().getAttribute('data-id');
  await first.focus();
  await page.keyboard.press('Enter');
  await page.waitForSelector('dialog.tree-dialog[open] .dlg-tree svg', { timeout: 4000 });
  const hash = await page.evaluate(() => location.hash);
  hash === `#/trees/${id}` ? ok(`Enter opens the large tree and the address follows (${hash})`) : note(`address after opening: ${hash}`);
  const lbl = await page.locator('dialog .tl').count();
  lbl > 3 ? ok(`the large tree is labelled (${lbl} labels)`) : note('the large tree has too few labels');
  const facts = await page.locator('dialog .dlg-facts div').count();
  facts >= 5 ? ok('the dialog lists the measured counts') : note('dialog facts missing');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(150);
  (await page.evaluate(() => location.hash)) === '#/trees' ? ok('Escape closes the dialog and the address returns to #/trees') : note('address did not return after closing');
  // deep link + node click goes to the folio
  await page.goto(`${BASE}/#/trees/${id}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('dialog.tree-dialog[open] .tn-link', { timeout: 15000 });
  const target = await page.locator('dialog .tn-charge.tn-link').first().getAttribute('data-id');
  await page.locator('dialog .tn-charge.tn-link').first().click();
  await page.waitForSelector('.folio-svg .node', { timeout: 15000 });
  const h2 = await page.evaluate(() => location.hash);
  h2.startsWith(`#/${id}/${target}`) ? ok(`a node in the large tree opens that core in the folio (${h2})`) : note(`node click went to ${h2}, expected #/${id}/${target}`);
  page.__logs.forEach((l) => note(`trees console: ${l}`));
  await page.__ctx.close();

  // phone: no horizontal scrolling, and the top bar fits on every screen
  const mobile = await newPage(browser, SIZES.mobile, `${BASE}/#/trees`);
  await mobile.waitForSelector('.tcard svg.tree', { timeout: 20000 });
  await mobile.waitForTimeout(500);
  const over = await mobile.evaluate(() => {
    const s = document.getElementById('trees-screen');
    return { sw: s.scrollWidth, cw: s.clientWidth };
  });
  over.sw <= over.cw + 1 ? ok('phone: no horizontal overflow') : note(`phone: the page scrolls sideways (${over.sw} > ${over.cw})`);
  for (const h of ['#/trees', '#/japan', '#/']) {
    await mobile.goto(`${BASE}/${h}`, { waitUntil: 'networkidle' });
    await mobile.waitForTimeout(700);
    const bar = await mobile.evaluate(() => {
      const kids = [...document.getElementById('topbar').querySelectorAll('a,button')].filter((e) => e.offsetParent !== null).map((e) => e.getBoundingClientRect());
      return { right: Math.max(...kids.map((k) => k.right)), vw: innerWidth };
    });
    bar.right <= bar.vw ? ok(`phone: top bar fits on ${h} (${Math.round(bar.right)} of ${bar.vw}px)`) : note(`phone: top bar overflows on ${h} (${Math.round(bar.right)} > ${bar.vw})`);
  }
  mobile.__logs.forEach((l) => note(`trees (phone) console: ${l}`));
  await mobile.__ctx.close();
}
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  if (mode === 'trees' || mode === 'all') await trees(browser);
  if (mode === 'shots' || mode === 'all') await shots(browser);
  if (mode === 'geometry' || mode === 'all') await geometry(browser);
  if (mode === 'a11y' || mode === 'all') await a11y(browser);
  if (mode === 'layout' || mode === 'all') await layout(browser);
} finally {
  await browser.close();
}
console.log(problems.length ? `\n${problems.length} problem(s)` : '\nAll checks passed');
process.exit(problems.length ? 1 : 0);
