/**
 * Country identity data (ISO codes, names in English and in the country's own language, currency, coordinates)
 * for the folios built from the IMF series. Source: the open "mledoze/countries" dataset on GitHub (the data behind
 * restcountries.com), https://github.com/mledoze/countries (ODbL).
 *
 *   node scripts/extract-country-meta.cjs <cache-dir> KEN UGA ...   writes scripts/build/data/country-meta.json
 *
 * Only the fields the folios use are kept, for the countries named.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const [cache, ...codes] = process.argv.slice(2);
if (!cache || !codes.length) throw new Error('usage: node scripts/extract-country-meta.cjs <cache-dir> ISO3 [ISO3 ...]');
fs.mkdirSync(cache, { recursive: true });
const file = path.join(cache, 'mledoze-countries.json');
if (!fs.existsSync(file)) {
  const bin = process.platform === 'win32' ? 'curl.exe' : 'curl';
  const body = execFileSync(bin, ['-s', '-S', '-f', '-L', '-A', 'tax-folios-atlas research script', 'https://raw.githubusercontent.com/mledoze/countries/master/countries.json'], { maxBuffer: 1 << 26 }).toString('utf8');
  fs.writeFileSync(file, body, 'utf8');
}
const all = JSON.parse(fs.readFileSync(file, 'utf8'));
const out = {};
for (const cc of codes) {
  const c = all.find((x) => x.cca3 === cc);
  if (!c) throw new Error(`${cc}: not in the dataset`);
  out[cc] = {
    cca2: c.cca2,
    ccn3: c.ccn3,
    unMember: !!c.unMember,
    name: c.name,
    currencies: c.currencies,
    latlng: c.latlng,
    capital: c.capital,
    region: c.region,
    subregion: c.subregion,
    languages: c.languages,
  };
}
const dest = path.join(__dirname, 'build', 'data', 'country-meta.json');
const prev = fs.existsSync(dest) ? JSON.parse(fs.readFileSync(dest, 'utf8')) : {};
fs.writeFileSync(dest, JSON.stringify({ ...prev, ...out }, null, 1) + '\n', 'utf8');
console.log('wrote', path.relative(process.cwd(), dest), Object.keys({ ...prev, ...out }).length, 'countries');
