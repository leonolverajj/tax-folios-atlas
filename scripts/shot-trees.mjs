/**
 * Screenshots of the Trees screen (full page and the large tree of one country).
 *   node scripts/shot-trees.mjs                       docs/screenshots/trees-*.png
 *   node scripts/shot-trees.mjs germany               also the large tree of Germany
 *   node scripts/shot-trees.mjs --width=390 --height=844 --mobile
 * Needs the dev server (npm run dev) or `--base=http://127.0.0.1:4173` for the preview.
 */
import path from 'node:path';
import { chromium } from 'playwright-core';

const args = process.argv.slice(2);
const opt = (n, d) => (args.find((a) => a.startsWith(`--${n}=`)) ?? '').split('=')[1] ?? d;
const pos = args.filter((a) => !a.startsWith('--'));
const BASE = opt('base', 'http://localhost:5173');
const W = Number(opt('width', 1440));
const H = Number(opt('height', 1000));
const mobile = args.includes('--mobile');
const outDir = path.resolve(opt('out', 'docs/screenshots'));

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('pageerror', e.message));
page.on('console', (m) => ['error', 'warning'].includes(m.type()) && console.log(m.type(), m.text()));
const tag = mobile ? 'mobile' : 'desktop';

await page.goto(`${BASE}/#/trees`, { waitUntil: 'networkidle' });
await page.waitForSelector('.tcard svg.tree', { timeout: 20000 });
await page.waitForTimeout(500);
await page.screenshot({ path: path.join(outDir, `trees-${tag}.png`) });
console.log('wrote', `trees-${tag}.png`);

// full scroll height of the screen as one image
const h = await page.evaluate(() => document.getElementById('trees-screen').scrollHeight);
await page.setViewportSize({ width: W, height: Math.min(h + 60, 6000) });
await page.waitForTimeout(300);
await page.screenshot({ path: path.join(outDir, `trees-${tag}-full.png`) });
console.log('wrote', `trees-${tag}-full.png`);
await page.setViewportSize({ width: W, height: H });

for (const id of pos) {
  await page.goto(`${BASE}/#/trees/${id}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('dialog.tree-dialog[open] .dlg-tree svg', { timeout: 15000 });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, `trees-${id}-${tag}.png`) });
  console.log('wrote', `trees-${id}-${tag}.png`);
}
await browser.close();
