/**
 * Screenshot of the detail panel (scrolled to its charts) for a chosen core.
 *   node scripts/shot-panel.mjs canada fed-personal-income-tax
 *   node scripts/shot-panel.mjs canada provincial out.png --width=1440 --height=1000
 * Needs the dev server (npm run dev) or `--base=http://127.0.0.1:4173` for the preview.
 */
import path from 'node:path';
import { chromium } from 'playwright-core';

const args = process.argv.slice(2);
const opt = (n, d) => (args.find((a) => a.startsWith(`--${n}=`)) ?? '').split('=')[1] ?? d;
const pos = args.filter((a) => !a.startsWith('--'));
const [country, node, out] = pos;
const BASE = opt('base', 'http://localhost:5173');
const W = Number(opt('width', 1440));
const H = Number(opt('height', 1000));
const file = out ?? path.resolve('docs', 'workflow', `${country}-${node ?? 'country'}-panel.png`);

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.goto(`${BASE}/#/${country}${node ? `/${node}` : ''}`, { waitUntil: 'networkidle' });
await page.waitForSelector('.folio-svg .node');
await page.waitForTimeout(1200);
await page.evaluate(() => {
  const c = document.querySelector('#detail-panel .charts');
  if (c) c.scrollIntoView({ block: 'start' });
});
await page.waitForTimeout(300);
await page.screenshot({ path: file });
console.log('wrote', file);
await browser.close();
