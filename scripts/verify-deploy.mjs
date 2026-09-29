/**
 * Proves the production build works the way GitHub Pages will serve it: from a sub-folder
 * (https://<user>.github.io/<repo>/), as plain static files, with nothing at the domain root.
 *
 *   npm run build && npm run verify:deploy
 *   node scripts/verify-deploy.mjs --sub=my-repo --dir=dist
 *
 * It serves dist/ under /<sub>/ (404 everywhere else, so an absolute "/assets/..." URL fails),
 * then opens the map, a folio, the charts and the Fighters screen in Chrome and fails on any
 * HTTP error or console error. It also checks that the site has no write endpoint.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright-core';

const args = process.argv.slice(2);
const opt = (n, d) => (args.find((a) => a.startsWith(`--${n}=`)) ?? '').split('=')[1] ?? d;
const SUB = opt('sub', 'tax-folios-atlas');
const DIR = path.resolve(opt('dir', 'dist'));
const PORT = Number(opt('port', '4180'));

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

if (!fs.existsSync(path.join(DIR, 'index.html'))) {
  console.error(`No ${DIR}/index.html. Run "npm run build" first.`);
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url ?? '/').split('?')[0]);
  const prefix = `/${SUB}/`;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405; // like GitHub Pages: static hosting has no write endpoint
    return res.end('Method not allowed');
  }
  if (!url.startsWith(prefix) && url !== `/${SUB}`) {
    res.statusCode = 404;
    return res.end('Not found (nothing is served at the domain root)');
  }
  let rel = url.slice(prefix.length) || 'index.html';
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.join(DIR, rel);
  if (!file.startsWith(DIR) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.statusCode = 404;
    return res.end('Not found');
  }
  res.setHeader('Content-Type', MIME[path.extname(file)] ?? 'application/octet-stream');
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(PORT, '127.0.0.1', r));
const BASE = `http://127.0.0.1:${PORT}/${SUB}/`;

const problems = [];
const ok = (m) => console.log(`  ✓ ${m}`);
const bad = (m) => {
  problems.push(m);
  console.log(`  ✗ ${m}`);
};

const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const logs = [];
  page.on('console', (m) => m.type() === 'error' && logs.push(`console: ${m.text()}`));
  page.on('pageerror', (e) => logs.push(`page error: ${e.message}`));
  page.on('response', (r) => r.status() >= 400 && logs.push(`http ${r.status()}: ${r.url()}`));
  page.on('requestfailed', (r) => logs.push(`request failed: ${r.url()}`));
  // the site must be self-contained: no fonts, scripts, tiles or analytics from another host
  page.on('request', (r) => {
    const u = new URL(r.url());
    if (!['127.0.0.1', 'localhost'].includes(u.hostname) && !['data:', 'blob:'].includes(u.protocol)) logs.push(`third-party request: ${r.url()}`);
  });
  const flush = (label) => {
    if (logs.length) logs.splice(0).forEach((l) => bad(`${label}: ${l}`));
    else ok(`${label}: no failed requests, no console errors`);
  };

  console.log(`\nServing ${DIR} at ${BASE}`);
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.waitForSelector('.country.active', { timeout: 15000 });
  const lit = await page.locator('.country.active').count();
  lit >= 7 ? ok(`map: ${lit} countries lit`) : bad(`map: only ${lit} countries lit`);
  flush('map');

  await page.goto(`${BASE}#/canada`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.folio-svg .node', { timeout: 15000 });
  await page.waitForTimeout(800);
  const nodes = await page.locator('.folio-svg .node').count();
  nodes >= 25 ? ok(`folio: ${nodes} cores drawn`) : bad(`folio: only ${nodes} cores`);
  const bgLoaded = await page.evaluate(() => {
    const img = document.querySelector('.folio-svg image.bg');
    return !!img && /background.*\.webp/.test(img.getAttribute('href') ?? '');
  });
  bgLoaded ? ok('folio: background art loaded from the sub-folder') : bad('folio: background art missing');
  await page.locator('.node[data-id="fed-personal-income-tax"]').click({ force: true });
  await page.waitForTimeout(400);
  const charts = await page.locator('#detail-panel .chart').count();
  charts >= 1 ? ok(`detail panel: ${charts} chart(s) for the selected tax`) : bad('detail panel: no chart');
  flush('folio');

  await page.goto(`${BASE}#/fighters/canada/japan`, { waitUntil: 'networkidle' });
  await page.waitForSelector('.arena .fighters canvas', { timeout: 15000 });
  await page.waitForTimeout(500);
  const stats = await page.locator('.hud .stat').count();
  stats === 18 ? ok('fighters: both HUDs show 9 stats each') : bad(`fighters: ${stats} stat rows`);
  flush('fighters');

  // Reloading a deep link must work on a static host (routes live in the hash)
  await page.goto(`${BASE}#/brazil/state-icms`, { waitUntil: 'networkidle' });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForSelector('.folio-svg .node.is-selected', { timeout: 15000 });
  ok('deep link survives a reload');
  flush('deep link');

  // Public site is read-only: no layout API, and ?layout=1 only keeps a browser-local draft
  const post = await page.evaluate(async (base) => (await fetch(`${base}__tfa/layout/canada`, { method: 'POST', body: '{}' })).status, BASE);
  [404, 405].includes(post) ? ok(`no write endpoint (POST /__tfa/layout answers ${post})`) : bad(`unexpected answer ${post} from the layout endpoint`);
  const root = await page.evaluate(async (origin) => (await fetch(`${origin}/assets/x.js`)).status, `http://127.0.0.1:${PORT}`);
  root === 404 ? ok('nothing is served at the domain root (relative paths only)') : bad(`domain root answered ${root}`);
} finally {
  await browser.close();
  server.close();
}
console.log(problems.length ? `\n${problems.length} problem(s)` : '\nAll deployment checks passed');
process.exit(problems.length ? 1 : 0);
