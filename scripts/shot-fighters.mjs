/**
 * Screenshots of the Fighters screen.
 *   node scripts/shot-fighters.mjs canada japan            -> docs/screenshots/fighters-canada-vs-japan-desktop.png
 *   node scripts/shot-fighters.mjs bolivia --mobile
 *   node scripts/shot-fighters.mjs --table                 -> scrolls to the comparison table
 */
import path from 'node:path';
import { chromium } from 'playwright-core';

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const opt = (n, d) => (args.find((a) => a.startsWith(`--${n}=`)) ?? '').split('=')[1] ?? d;
const ids = args.filter((a) => !a.startsWith('--'));
const BASE = opt('base', 'http://localhost:5173');
const mobile = flags.has('--mobile');
const size = mobile
  ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
  : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 };
const name = `fighters-${ids.length ? ids.join('-vs-') : 'roster'}${flags.has('--table') ? '-table' : ''}-${mobile ? 'mobile' : 'desktop'}.png`;
const file = path.resolve(opt('out', 'docs/screenshots'), name);

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext(size);
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(e.stack ?? e.message));
await page.goto(`${BASE}/#/fighters${ids.length ? `/${ids.join('/')}` : ''}`, { waitUntil: 'networkidle' });
await page.waitForSelector('.arena .fighters canvas');
await page.waitForTimeout(700);
if (flags.has('--table')) await page.evaluate(() => document.querySelector('.compare')?.scrollIntoView({ block: 'start' }));
await page.screenshot({ path: file, fullPage: false });
console.log('wrote', file, errors.length ? `\nconsole errors:\n${errors.join('\n')}` : '(no console errors)');
await browser.close();
