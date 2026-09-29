/**
 * Builds the site and copies it into deploy/github-pages-site/, ready to upload to a GitHub
 * repository that serves GitHub Pages "from a branch".
 *
 *   npm run package:pages
 *
 * The folder holds ONLY static files (about 60, well under GitHub's 100-files-per-upload limit in
 * the web interface). Upload its CONTENTS, not the folder itself, so index.html ends up at the
 * top level of the repository.
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(ROOT, 'dist');
const out = path.join(ROOT, 'deploy', 'github-pages-site');

execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.cpSync(dist, out, { recursive: true });
// Tells GitHub not to run Jekyll on the files (they are already final).
fs.writeFileSync(path.join(out, '.nojekyll'), '');
// A mistyped address lands on the app instead of a bare GitHub 404 (routes live in the #hash).
fs.copyFileSync(path.join(out, 'index.html'), path.join(out, '404.html'));

const files = [];
const walk = (d) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else files.push(p);
  }
};
walk(out);
const mb = files.reduce((s, f) => s + fs.statSync(f).size, 0) / 1024 / 1024;
console.log(`\nReady: ${path.relative(ROOT, out)}  (${files.length} files, ${mb.toFixed(1)} MB)`);
if (files.length > 100) console.log('Note: more than 100 files. Upload in two batches, or use Git / GitHub Desktop instead of the web page.');
console.log('Upload the CONTENTS of that folder to your GitHub repository, then turn on Pages (see docs/DEPLOY-GITHUB-PAGES.md).');
