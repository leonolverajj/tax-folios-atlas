/**
 * Checks every source URL in countries/<id>/sources.json.
 *
 *   npm run links                       all countries
 *   npm run links -- --only=japan       one or more countries (comma separated)
 *   npm run links -- --strict           also exit 1 when links stay unverified
 *
 * Classes
 *   ok          2xx
 *   redirected  3xx chain ended in 2xx; listed so a person can confirm the target is still the
 *               document that is cited
 *   manual      the automated check was inconclusive but the page was checked another way; the
 *               method and date are recorded in scripts/link-verified.json
 *   blocked     401 / 403 / 429 / 503, timeouts, connection refusals and certificate chains Node
 *               cannot verify: the link is UNVERIFIED (open it in a browser before relying on it)
 *   suspect     redirects to an error or login page: the page is gone, or the site rejects
 *               automated clients (retried once, slowly, before being reported)
 *   broken      404 / 410 / other 4xx / 5xx / DNS failure: fix or replace the source
 *
 * TLS certificates are always verified; this script never disables verification.
 * Requests are polite: one at a time per host, several hosts in parallel.
 *
 * Writes docs/LINK-REPORT.md so the state of the links is on record.
 */
import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name, dflt = '') => (args.find((a) => a.startsWith(`--${name}=`)) ?? '').split('=')[1] ?? dflt;
const ONLY = opt('only').split(',').filter(Boolean);
const STRICT = args.includes('--strict');
const TIMEOUT = Number(opt('timeout', '25000'));
const CONCURRENCY = Number(opt('concurrency', '6'));

const UA = 'Mozilla/5.0 (compatible; TaxFoliosAtlas-LinkCheck/1.0; +https://example.invalid/link-check) Chrome/126 Safari/537.36';
const BOM = /^﻿/;
const DASH = '–';
const MIDDOT = '·';

const countries = fs
  .readdirSync(path.join(ROOT, 'countries'), { withFileTypes: true })
  .filter((d) => d.isDirectory() && fs.existsSync(path.join(ROOT, 'countries', d.name, 'sources.json')))
  .map((d) => d.name)
  .filter((c) => !ONLY.length || ONLY.includes(c))
  .sort();

/** @type {{country:string, id:string, title:string, url:string}[]} */
const jobs = [];
const seenUrl = new Set();
const addJob = (country, s) => {
  if (seenUrl.has(s.url)) return; // many profiles cite the same OECD page: check each address once
  seenUrl.add(s.url);
  jobs.push({ country, id: s.id, title: s.title, url: s.url });
};
for (const c of countries) {
  const file = JSON.parse(fs.readFileSync(path.join(ROOT, 'countries', c, 'sources.json'), 'utf8').replace(BOM, ''));
  for (const s of file.sources) addJob(c, s);
}
// profile-only countries (profiles/<id>.json) carry their own sources
const profilesDir = path.join(ROOT, 'profiles');
if (fs.existsSync(profilesDir) && !ONLY.length) {
  for (const f of fs.readdirSync(profilesDir).filter((x) => x.endsWith('.json')).sort()) {
    const p = JSON.parse(fs.readFileSync(path.join(profilesDir, f), 'utf8').replace(BOM, ''));
    for (const s of p.sources) addJob(`profile:${p.id}`, s);
  }
}

/** One HTTP exchange without downloading the body (node:http(s), so Node 18's fetch quirks do not apply). */
function once(url, method) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const lib = u.protocol === 'http:' ? http : https;
    const req = lib.request(
      u,
      {
        method,
        timeout: TIMEOUT,
        headers: { 'user-agent': UA, accept: 'text/html,application/pdf,application/xhtml+xml,*/*;q=0.8', 'accept-language': 'en,es;q=0.8,pt;q=0.6,ja;q=0.5' },
      },
      (res) => {
        const out = { status: res.statusCode ?? 0, location: res.headers.location, type: res.headers['content-type'] ?? '' };
        res.destroy();
        resolve(out);
      },
    );
    req.on('timeout', () => req.destroy(Object.assign(new Error('timeout'), { code: 'ETIMEDOUT' })));
    req.on('error', reject);
    req.end();
  });
}

/** Follows redirects (max 8) and returns the final status and URL. */
async function request(url, method) {
  let cur = url;
  for (let hop = 0; hop < 8; hop++) {
    const r = await once(cur, method);
    if ([301, 302, 303, 307, 308].includes(r.status) && r.location) {
      cur = new URL(r.location, cur).toString();
      continue;
    }
    return { status: r.status, finalUrl: cur, type: r.type };
  }
  throw Object.assign(new Error('too many redirects'), { code: 'EREDIRECT' });
}

function pathDistance(a, b) {
  try {
    const A = new URL(a);
    const B = new URL(b);
    if (A.hostname.replace(/^www\./, '') !== B.hostname.replace(/^www\./, '')) return 2;
    const norm = (u) => u.pathname.replace(/\/+$/, '') + u.search;
    return norm(A) === norm(B) ? 0 : 1;
  } catch {
    return 0;
  }
}

function isSoft404(from, to) {
  try {
    const t = new URL(to);
    return (
      /\/(errors?\/)?(404|not-?found|page-?not-?found)\b|require_login|\/login\b|\/signin\b/i.test(t.pathname + t.search) &&
      !/\/(404|login|signin)\b/i.test(new URL(from).pathname)
    );
  } catch {
    return false;
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function check(job) {
  let out;
  try {
    let r = await request(job.url, 'HEAD');
    // many servers reject HEAD or answer differently: confirm with GET before judging
    if (r.status >= 400 || r.status === 0) r = await request(job.url, 'GET');
    out = r;
  } catch (e1) {
    try {
      out = await request(job.url, 'GET');
    } catch (e2) {
      const err = /** @type {any} */ (e2);
      const code = String(err?.code || err?.cause?.code || err?.name || err);
      // Certificate-chain problems are common on government hosts (a missing intermediate that
      // browsers fetch themselves). The checker never waives verification, so the link is
      // reported as unverified rather than broken.
      if (/CERT|SIGNATURE|SELF_SIGNED|ISSUER|EXPIRED/i.test(code)) return { ...job, cls: 'blocked', status: 0, note: `TLS: ${code} ${DASH} certificate not verifiable from Node; open in a browser` };
      // A timeout says nothing about the page itself (many sites drop non-browser clients or are
      // slow from some networks), so it is unverified, not broken.
      if (/TIMEDOUT|ECONNRESET|EPIPE|ECONNREFUSED/i.test(code)) return { ...job, cls: 'blocked', status: 0, note: `${code} ${DASH} no answer to an automated request; open in a browser` };
      return { ...job, cls: 'broken', status: 0, note: `network: ${code}` };
    }
  }
  const { status, finalUrl, type } = out;
  if (status >= 200 && status < 300) {
    const moved = finalUrl && finalUrl !== job.url;
    const dist = moved ? pathDistance(job.url, finalUrl) : 0;
    // Soft 404: some sites answer 200 on an error or login page after redirecting there. Bot
    // protection does the same to clients it dislikes, so retry once, slowly, before suspecting.
    if (moved && isSoft404(job.url, finalUrl)) {
      await sleep(4000);
      try {
        const again = await request(job.url, 'GET');
        if (again.status >= 200 && again.status < 300 && !(again.finalUrl !== job.url && isSoft404(job.url, again.finalUrl))) {
          const same = again.finalUrl === job.url;
          return { ...job, cls: same ? 'ok' : 'redirected', status: again.status, finalUrl: same ? undefined : again.finalUrl, note: same ? undefined : 'path changed', type: again.type };
        }
      } catch {
        /* fall through to suspect */
      }
      return { ...job, cls: 'suspect', status, finalUrl, note: 'redirects to an error or login page: either the page is gone or the site rejects automated clients' };
    }
    if (moved) return { ...job, cls: 'redirected', status, finalUrl, note: dist === 2 ? 'moved to another host' : dist === 1 ? 'path changed' : 'normalised', type };
    return { ...job, cls: 'ok', status, type };
  }
  if ([401, 403, 429, 999, 503].includes(status)) return { ...job, cls: 'blocked', status, note: 'site refuses automated requests; verify by hand' };
  return { ...job, cls: 'broken', status, note: `HTTP ${status}` };
}

/**
 * Politeness: one request at a time per host (with a pause), several hosts in parallel.
 * Hammering one government host in parallel gets the checker rate-limited or bot-blocked.
 */
async function pool(items, worker, n) {
  const results = new Array(items.length);
  const byHost = new Map();
  items.forEach((it, idx) => {
    const h = new URL(it.url).hostname;
    if (!byHost.has(h)) byHost.set(h, []);
    byHost.get(h).push(idx);
  });
  const queues = [...byHost.values()];
  let q = 0;
  const marks = { ok: '✓', redirected: '→', blocked: '?', suspect: '!', manual: '✔', broken: '✗' };
  await Promise.all(
    Array.from({ length: Math.min(n, queues.length) }, async () => {
      while (q < queues.length) {
        const list = queues[q++];
        for (const idx of list) {
          results[idx] = await worker(items[idx]);
          const r = results[idx];
          console.log(`${marks[r.cls]} ${r.country}/${r.id}  ${r.status || ''} ${r.note ?? ''}  ${r.url}`);
          await sleep(450);
        }
      }
    }),
  );
  return results;
}

/** URLs that automated checks cannot confirm (bot walls, TLS chains) but were checked another way. */
const verifiedFile = path.join(ROOT, 'scripts', 'link-verified.json');
const verified = fs.existsSync(verifiedFile) ? JSON.parse(fs.readFileSync(verifiedFile, 'utf8').replace(BOM, '')) : {};

console.log(`Checking ${jobs.length} links across ${countries.length} countries...\n`);
const results = (await pool(jobs, check, CONCURRENCY)).map((r) => {
  const v = verified[r.url];
  if (v && r.cls !== 'ok') return { ...r, cls: 'manual', note: `checked separately ${v.on}: ${v.how} (automated result: ${r.cls}${r.status ? ' ' + r.status : ''})` };
  return r;
});

const by = (cls) => results.filter((r) => r.cls === cls);
const counts = Object.fromEntries(['ok', 'redirected', 'manual', 'blocked', 'suspect', 'broken'].map((c) => [c, by(c).length]));
console.log(`\nok ${counts.ok} ${MIDDOT} redirected ${counts.redirected} ${MIDDOT} checked separately ${counts.manual} ${MIDDOT} unverified ${counts.blocked} ${MIDDOT} suspect ${counts.suspect} ${MIDDOT} broken ${counts.broken}`);

const today = new Date().toISOString().slice(0, 10);
let md = `# Link report\n\nChecked ${today} with \`npm run links\` (${results.length} source URLs).\n\n`;
md += `| Class | Count | Meaning |\n|---|---|---|\n| ok | ${counts.ok} | answered 2xx |\n| redirected | ${counts.redirected} | answered 2xx after redirects; confirm the target if the path changed |\n| manual | ${counts.manual} | automated check inconclusive; the page was checked another way, recorded with the method in \`scripts/link-verified.json\` |\n| blocked | ${counts.blocked} | the site refuses or ignores automated requests (401/403/429/503, timeouts, certificate chains Node cannot verify): **unverified**, open by hand |\n| suspect | ${counts.suspect} | redirects to an error or login page: the page is gone or the site rejects automated clients |\n| broken | ${counts.broken} | 404/410/other errors or DNS failure: fix or replace the source |\n\n`;
for (const cls of ['broken', 'suspect', 'blocked', 'manual', 'redirected']) {
  const rows = by(cls);
  if (!rows.length) continue;
  md += `## ${cls[0].toUpperCase() + cls.slice(1)}\n\n| Country | Source id | Status | Note | URL |\n|---|---|---|---|---|\n`;
  for (const r of rows) md += `| ${r.country} | \`${r.id}\` | ${r.status || DASH} | ${(r.note ?? '').replace(/\|/g, '/')}${r.finalUrl ? ` → ${r.finalUrl}` : ''} | ${r.url} |\n`;
  md += '\n';
}
fs.mkdirSync(path.join(ROOT, 'docs'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'docs', 'LINK-REPORT.md'), md, 'utf8');
console.log('wrote docs/LINK-REPORT.md');

const bad = counts.broken + counts.suspect;
process.exit(bad || (STRICT && counts.blocked) ? 1 : 0);
