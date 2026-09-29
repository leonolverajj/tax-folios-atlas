import { defineConfig, type Plugin } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import { layoutSchema } from './src/data/schema';
import { countryDir, loadBundle } from './scripts/lib/load';

/**
 * Dev-only layout persistence.
 *
 * `apply: 'serve'` means this plugin does not exist in `vite build`, so the
 * deployed site has NO write endpoint at all. Even locally the endpoint:
 *  - only accepts requests that carry a custom header (blocking simple
 *    cross-site form posts) and whose Origin matches the dev server host,
 *  - only writes countries/<id>/layout.json for an existing country folder,
 *  - validates the body against the layout schema and the country's node ids,
 *  - keeps the previous file in countries/<id>/.layout-backups/.
 */
function layoutApi(): Plugin {
  return {
    name: 'tfa-layout-api',
    apply: 'serve',
    // The editor reads layout.json through the API, so a saved layout must not trigger
    // a page reload: that would wipe the "saved" status and leave layout mode.
    handleHotUpdate({ file }) {
      if (/[\\/]countries[\\/][^\\/]+[\\/]layout\.json$/.test(file)) return [];
    },
    configureServer(server) {
      server.middlewares.use('/__tfa/layout', (req, res) => {
        const send = (code: number, body: unknown) => {
          res.statusCode = code;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify(body));
        };
        const id = (req.url ?? '').split('?')[0].replace(/^\/+|\/+$/g, '');
        if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id) || !fs.existsSync(path.join(countryDir(id), 'country.json'))) return send(404, { ok: false, error: 'unknown country' });
        const file = path.join(countryDir(id), 'layout.json');
        if (req.method === 'GET') {
          if (!fs.existsSync(file)) return send(404, { ok: false, error: 'no layout.json yet – run "npm run layouts:init"' });
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Cache-Control', 'no-store');
          res.end(fs.readFileSync(file, 'utf8'));
          return;
        }
        if (req.method !== 'POST') return send(405, { ok: false, error: 'method not allowed' });
        if (req.headers['x-tfa-edit'] !== '1') return send(403, { ok: false, error: 'missing edit header' });
        const origin = req.headers.origin;
        if (origin && new URL(origin).host !== req.headers.host) return send(403, { ok: false, error: 'cross-origin request refused' });
        let size = 0;
        const chunks: Buffer[] = [];
        req.on('data', (c: Buffer) => {
          size += c.length;
          if (size > 300_000) req.destroy();
          else chunks.push(c);
        });
        req.on('end', () => {
          try {
            const layout = layoutSchema.parse(JSON.parse(Buffer.concat(chunks).toString('utf8')));
            const bundle = loadBundle(id, { layoutOptional: true });
            const ids = new Set([bundle.meta.id, ...bundle.meta.levels.map((l) => l.id), ...bundle.instruments.map((i) => i.id)]);
            for (const k of Object.keys(layout.positions)) if (!ids.has(k)) throw new Error(`unknown core "${k}"`);
            for (const k of ids) if (!layout.positions[k]) throw new Error(`missing position for "${k}"`);
            for (const [k, p] of Object.entries(layout.positions)) {
              if (p.x < 0 || p.y < 0 || p.x > layout.canvas.width || p.y > layout.canvas.height) throw new Error(`"${k}" is outside the canvas`);
            }
            if (fs.existsSync(file)) {
              const dir = path.join(countryDir(id), '.layout-backups');
              fs.mkdirSync(dir, { recursive: true });
              fs.copyFileSync(file, path.join(dir, `layout-${new Date().toISOString().replace(/[:.]/g, '-')}.json`));
              const old = fs.readdirSync(dir).sort();
              for (const f of old.slice(0, Math.max(0, old.length - 15))) fs.unlinkSync(path.join(dir, f));
            }
            const tmp = `${file}.tmp`;
            fs.writeFileSync(tmp, JSON.stringify(layout, null, 2) + '\n', 'utf8');
            fs.renameSync(tmp, file);
            send(200, { ok: true, path: `countries/${id}/layout.json` });
          } catch (e) {
            send(400, { ok: false, error: (e as Error).message.slice(0, 300) });
          }
        });
      });
    },
  };
}

export default defineConfig(
  ({ command }) =>
    ({
      // The production build uses relative URLs, so the same files work at the root of a domain
      // and in a sub-folder such as https://<user>.github.io/<repo>/ (routes live in the hash, so
      // no server rewrite is needed). Set BASE_PATH=/repo/ to force an absolute base instead.
      base: command === 'build' ? (process.env.BASE_PATH ?? './') : '/',
      plugins: [layoutApi()],
      server: { host: '127.0.0.1', port: 5173, strictPort: false },
      build: {
        target: 'es2022',
        sourcemap: false,
        chunkSizeWarningLimit: 900,
        rollupOptions: {
          output: {
            // Few, larger files: one chunk per country's data and one for all profiles. Keeps the site far
            // below GitHub's 100-files-per-upload limit however many profiles are added, and needs fewer requests.
            manualChunks(id: string) {
              if (/[\\/]profiles[\\/][^\\/]+\.json$/.test(id)) return 'profiles';
              const m = id.match(/[\\/]countries[\\/]([a-z0-9-]+)[\\/](taxes|revenue|sources|presentation|structure)\.json/);
              if (m) return `data-${m[1]}`;
              return undefined;
            },
          },
        },
      },
      test: { include: ['tests/**/*.test.ts'] },
    }) as import('vite').UserConfig,
);
