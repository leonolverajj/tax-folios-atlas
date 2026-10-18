/**
 * IMF Government Finance Statistics (GFS), "Statement of Operations" (dataflow IMF.STA / GFS_SOO):
 * revenue lines in domestic currency, annual, for every reporting country and government sector.
 *
 *   node scripts/extract-gfs.cjs <cache-dir>                 download (once) and print a coverage report
 *   node scripts/extract-gfs.cjs <cache-dir> KEN UGA ...     also write scripts/build/data/gfs-<CC>.json
 *   (an IMF country code that differs from ISO 3166-1 alpha-3 is written PSE=WBG: the file is named gfs-PSE.json)
 *
 * API: https://api.imf.org/external/sdmx/2.1/data/IMF.STA,GFS_SOO/<COUNTRY>.<SECTOR>.<GFS_GRP>.<INDICATOR>.<TRANSFORMATION>.<FREQ>
 * The raw responses are kept in <cache-dir> so that a rerun does not hit the API again.
 * Each output file keeps, per sector and indicator, the yearly values in domestic currency units
 * (the API's OBS_VALUE is in units, e.g. 1.98e12 for KES 1.98 trillion) with the nature and basis flags.
 */
const fs = require('fs');
const path = require('path');

const INDICATORS = [
  'G1_T', 'G11_T', 'G111_T', 'G1111_T', 'G1112_T', 'G1113_T', 'G112_T', 'G113_T', 'G1131_T', 'G1132_T', 'G1133_T', 'G1135_T',
  'G114_T', 'G1141_T', 'G11411_T', 'G11412_T', 'G11413_T', 'G11414_T', 'G1142_T', 'G1143_T', 'G1144_T', 'G1145_T', 'G11451_T', 'G11452_T', 'G1146_T',
  'G115_T', 'G1151_T', 'G1152_T', 'G1153_T', 'G1154_T', 'G1155_T', 'G1156_T', 'G116_T',
  'G12_T', 'G121_T', 'G1211_T', 'G1212_T', 'G1213_T', 'G122_T', 'G1221_T', 'G1222_T', 'G1223_T', 'G13_T', 'G14_T',
];
const FIRST_YEAR = 2016;
const BASE = 'https://api.imf.org/external/sdmx/2.1/data/IMF.STA,GFS_SOO';

/** Uses curl: Node does not verify the IMF's certificate chain on every machine, and verification is never switched off. */
function get(url) {
  const { execFileSync } = require('child_process');
  const bin = process.platform === 'win32' ? 'curl.exe' : 'curl';
  return execFileSync(bin, ['-s', '-S', '-f', '-L', '-A', 'tax-folios-atlas research script', url], { maxBuffer: 1024 * 1024 * 512 }).toString('utf8');
}

function parse(xml, into) {
  const re = /<Series ([^>]*)>(.*?)<\/Series>/gs;
  let m;
  while ((m = re.exec(xml))) {
    const a = Object.fromEntries([...m[1].matchAll(/(\w+)="([^"]*)"/g)].map((x) => [x[1], x[2]]));
    const c = (into[a.COUNTRY] ||= {});
    const s = (c[a.SECTOR] ||= {});
    const ind = (s[a.INDICATOR] ||= {});
    for (const o of m[2].matchAll(/<Obs ([^>]*)\/>/g)) {
      const b = Object.fromEntries([...o[1].matchAll(/(\w+)="([^"]*)"/g)].map((x) => [x[1], x[2]]));
      const v = Number(b.OBS_VALUE);
      if (b.OBS_VALUE === '' || b.OBS_VALUE === undefined || Number.isNaN(v)) continue;
      ind[b.TIME_PERIOD] = { v, nature: b.NATURE_OF_DATA, basis: b.BASES_OF_RECORDING_CASH_NON_CASH };
    }
  }
}

(async () => {
  const [cache, ...ccs] = process.argv.slice(2);
  if (!cache) throw new Error('usage: node scripts/extract-gfs.cjs <cache-dir> [CC ...]');
  fs.mkdirSync(cache, { recursive: true });
  const all = {};
  for (let i = 0; i < INDICATORS.length; i += 6) {
    const group = INDICATORS.slice(i, i + 6);
    const file = path.join(cache, `gfs-${group[0]}.xml`);
    if (!fs.existsSync(file)) {
      const url = `${BASE}/*.*.*.${group.join('+')}.XDC.A?startPeriod=${FIRST_YEAR}`;
      console.error('fetching', group.join(' '));
      fs.writeFileSync(file, get(url), 'utf8');
    }
    parse(fs.readFileSync(file, 'utf8'), all);
  }
  const countries = Object.keys(all).sort();
  console.log(`${countries.length} countries in the extract`);
  for (const arg of ccs) {
    const [cc, imf = cc] = arg.split('=');
    if (!all[imf]) throw new Error(`no GFS data for ${imf}`);
    const out = path.join(__dirname, 'build', 'data', `gfs-${cc}.json`);
    fs.writeFileSync(out, JSON.stringify({ source: 'IMF GFS Statement of Operations (IMF.STA GFS_SOO), XDC, annual', country: imf, sectors: all[imf] }) + '\n', 'utf8');
    console.log('wrote', path.relative(process.cwd(), out));
  }
  if (!ccs.length) fs.writeFileSync(path.join(cache, 'all.json'), JSON.stringify(all), 'utf8');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
