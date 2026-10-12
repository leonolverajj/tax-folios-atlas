/**
 * Saves Eurostat gov_10a_taxag (taxes and social contributions by sub-sector and ESA item, 2024, million national
 * currency) for the countries the atlas uses the National Tax Lists for: scripts/build/data/eurostat-taxag-2024.json.
 *   node scripts/extract-eurostat.cjs
 */
const fs = require('fs');
const path = require('path');
const geos = ['AT','BE','BG','CY','CZ','DE','DK','EE','EL','ES','FI','FR','HR','HU','IE','IT','LT','LU','LV','MT','NL','PL','PT','RO','SE','SI','SK','IS','NO'];
const items = ['D2','D211','D212','D2121','D2122','D214A','D214B','D214C','D214D','D214F','D214G','D214H','D214I','D214L','D29A','D29B','D29C','D29D','D29E','D29F','D29G','D29H','D5','D51A','D51B','D51C','D51D','D51E','D59A','D59B','D59C','D59D','D59E','D59F','D61','D611','D613','D91','D91A','D91B'];
const secs = ['S1311', 'S1312', 'S1313', 'S1314', 'S212'];
const q = (k, a) => a.map((v) => `${k}=${v}`).join('&');
const url = `https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/gov_10a_taxag?format=JSON&lang=EN&unit=MIO_NAC&time=2024&${q('geo', geos)}&${q('na_item', items)}&${q('sector', secs)}`;
(async () => {
  const r = await fetch(url);
  if (!r.ok) throw new Error('Eurostat ' + r.status);
  const j = await r.json();
  const dims = j.id;
  const lab = {};
  for (const d of dims) lab[d] = Object.fromEntries(Object.entries(j.dimension[d].category.index).map(([k, v]) => [v, k]));
  const strides = [];
  let s = 1;
  for (let i = dims.length - 1; i >= 0; i--) { strides[i] = s; s *= j.size[i]; }
  const out = {};
  for (const [pos, val] of Object.entries(j.value)) {
    let p = +pos;
    const c = {};
    for (let i = 0; i < dims.length; i++) { const k = Math.floor(p / strides[i]); p %= strides[i]; c[dims[i]] = lab[dims[i]][k]; }
    (out[c.geo] = out[c.geo] || {})[c.sector + ':' + c.na_item] = val;
  }
  fs.writeFileSync(path.join(__dirname, 'build', 'data', 'eurostat-taxag-2024.json'), JSON.stringify(out) + '\n');
  console.log(Object.keys(out).length, 'countries; updated', j.updated);
})();
