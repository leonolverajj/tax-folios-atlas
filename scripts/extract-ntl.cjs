/**
 * Extracts one country's lines from the Commission/Eurostat "National Tax Lists" workbook (edition 2026,
 * data to 2024) into scripts/build/data/ntl-<CC>.json, the file the build scripts read.
 *
 *   node scripts/extract-ntl.cjs <path-to-unzipped-xlsx-folder> <CC> [<CC> ...]
 *
 * The workbook: https://taxation-customs.ec.europa.eu/taxation/economic-analysis/data-taxation-trends_en
 * ("National tax lists", NTL edition 2026). Unit: million of national currency; sector: general
 * government plus EU institutions (S.13 + S.212). Unzip the .xlsx (it is a zip) first.
 */
const fs = require('fs');
const path = require('path');

const [dir, ...ccs] = process.argv.slice(2);
if (!dir || !ccs.length) {
  console.error('usage: node scripts/extract-ntl.cjs <unzipped-xlsx-dir> <CC> [<CC> ...]');
  process.exit(1);
}
const decode = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
const ss = fs.readFileSync(path.join(dir, 'xl/sharedStrings.xml'), 'utf8');
const strings = [...ss.matchAll(/<si>([\s\S]*?)<\/si>/g)].map((m) => decode([...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => x[1]).join('')));
const wb = fs.readFileSync(path.join(dir, 'xl/workbook.xml'), 'utf8');
const sheets = [...wb.matchAll(/<sheet [^>]*name="([^"]+)"[^>]*r:id="([^"]+)"/g)].map((m) => ({ name: decode(m[1]), rid: m[2] }));
const rels = fs.readFileSync(path.join(dir, 'xl/_rels/workbook.xml.rels'), 'utf8');
const relMap = {};
for (const m of rels.matchAll(/<Relationship [^>]*>/g)) relMap[/Id="([^"]+)"/.exec(m[0])[1]] = /Target="([^"]+)"/.exec(m[0])[1];
const colNum = (c) => c.split('').reduce((a, ch) => a * 26 + ch.charCodeAt(0) - 64, 0);

function readSheet(sh) {
  const x = fs.readFileSync(path.join(dir, 'xl', relMap[sh.rid].replace(/^\/?(xl\/)?/, '')), 'utf8');
  const rows = [];
  for (const rm of x.matchAll(/<row [^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells = [];
    for (const cm of rm[2].matchAll(/<c ([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const ref = /r="([A-Z]+)\d+"/.exec(cm[1])[1];
      const t = /t="([^"]+)"/.exec(cm[1]);
      const v = cm[2] ? /<v>([\s\S]*?)<\/v>/.exec(cm[2]) : null;
      if (!v) continue;
      let val = v[1];
      if (t && t[1] === 's') val = strings[+val];
      else if (t && t[1] === 'str') val = decode(val);
      else if (!t || t[1] === 'n') val = +val;
      cells[colNum(ref) - 1] = val;
    }
    rows.push({ r: +rm[1], cells });
  }
  return rows;
}

const clean = (s) => (s === undefined || s === null || s === 'null' ? '' : String(s).replace(/\s+/g, ' ').trim());
const outDir = path.join(__dirname, 'build', 'data');
fs.mkdirSync(outDir, { recursive: true });
for (const cc of ccs) {
  const sh = sheets.find((s) => s.name === cc);
  if (!sh) throw new Error(`no sheet ${cc}`);
  const rows = readSheet(sh);
  const hdr = rows.find((r) => r.cells.some((c) => String(c).includes('1995')));
  const first = hdr.cells.findIndex((c) => String(c).includes('1995'));
  const col = (y) => first + (y - 1995);
  const rec = (c, y) => (typeof c[col(y)] === 'number' ? Math.round(c[col(y)] * 1e4) / 1e4 : clean(c[col(y)]) || null);
  const lines = [];
  const totals = {};
  for (const r of rows) {
    const c = r.cells;
    const code = clean(c[0]);
    if (!/^D\d/.test(code)) continue;
    const sub = clean(c[1]);
    if (sub === '_T') {
      totals[code] = { name: clean(c[5]), v2024: rec(c, 2024), v2023: rec(c, 2023), row: r.r };
      continue;
    }
    lines.push({ key: `${code}:${sub}`, code, sub, nat: clean(c[2]), en: clean(c[5]), fn: clean(c[9]), at: clean(c[10]), v2024: rec(c, 2024), v2023: rec(c, 2023), row: r.r });
  }
  fs.writeFileSync(path.join(outDir, `ntl-${cc}.json`), JSON.stringify({ country: cc, source: 'NTL edition 2026 web.xlsx (Commission, DG TAXUD / Eurostat)', unit: 'million national currency', sector: 'S.13 + S.212', totals, lines }, null, 1) + '\n');
  console.log(cc, lines.length, 'lines');
}
