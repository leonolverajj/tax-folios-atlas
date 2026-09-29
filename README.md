# Tax Folios Atlas

An interactive atlas of how countries organise their tax systems, with two ways in.

- **Atlas**: an illuminated world map. Open a country to see its tax folio: the country core, its levels of government, and every tax, contribution, royalty, duty and fee as a core, each with its legal basis, rate, plain-language explanation, latest revenue, and charts. **The area of each core is its share of what the whole country collects**, so the biggest orbs are the biggest revenue sources whatever level collects them.
- **Fighters**: every country as a pixel-art fighter whose stats are *measured* from the structure of its tax system (tax take, tax mix, who collects it, how dependent local governments are on transfers). Compare any two, or sort all 40 countries in one table.

Currently: **7 folios** (Bolivia, Brazil, Canada, Colombia, Japan, Mexico, United States; the brief said "six" but listed seven) and **33 more OECD members as profiles**, so all **38 OECD members plus Brazil and Bolivia** appear in Fighters. See the [roadmap](docs/COUNTRY-ROADMAP.md).

## Run it

Requires Node 18+.

```bash
npm install
npm run dev          # http://localhost:5173  (also the only mode where the layout editor can save)
```

```bash
npm run build        # validates the data, type-checks, builds dist/
npm run preview      # serves dist/ at http://127.0.0.1:4173
```

## Publish it

```bash
npm run package:pages   # builds and copies the site to deploy/github-pages-site (35 static files)
```

Then follow [docs/DEPLOY-GITHUB-PAGES.md](docs/DEPLOY-GITHUB-PAGES.md): upload that folder to a GitHub repository and switch on Pages, or push the project and let the included workflow rebuild it on every change. The build uses relative paths and works at `https://<user>.github.io/<repo>/`.

## Keep it current

```bash
npm run checklist    # what to re-check, per country, and what is probably out of date
npm run validate     # schema + cross-file rules
npm test             # unit tests
npm run links        # every source URL still answers
```

The routine, cadences and the yearly OECD refresh are in [docs/UPDATE-PLAYBOOK.md](docs/UPDATE-PLAYBOOK.md). Every figure is a JSON value with a source, period, currency and unit; shares and sizes are computed, never typed.

## Documentation

| Document | What it answers |
|---|---|
| [UPDATE-PLAYBOOK](docs/UPDATE-PLAYBOOK.md) | How do I keep the data from going stale? |
| [UPDATE-CHECKLIST](docs/UPDATE-CHECKLIST.md) | Per country: every source, what it feeds, what is due (generated) |
| [METHODOLOGY](docs/METHODOLOGY.md) | What do the sizes and the fighter stats mean, and what can't they say? |
| [ADDING-A-COUNTRY](docs/ADDING-A-COUNTRY.md) | Add a profile in minutes or a whole folio |
| [COUNTRY-ROADMAP](docs/COUNTRY-ROADMAP.md) | Where each OECD member stands, and the suggested order (generated) |
| [DEPLOY-GITHUB-PAGES](docs/DEPLOY-GITHUB-PAGES.md) | Put it online |
| [LINK-REPORT](docs/LINK-REPORT.md) | State of every source URL (generated) |
| [BACKGROUND-WORKFLOW](docs/BACKGROUND-WORKFLOW.md) | How the per-country background art is made and checked |

## How it is built

- Vite + TypeScript (strict) + plain DOM/SVG; no framework, no server, no third-party requests. `d3-geo` for the map, `zod` for the data schema.
- **One folder per country** (`countries/<id>/`): `country.json`, `taxes.json`, `revenue.json`, `sources.json`, `structure.json`, `presentation.json`, `layout.json`, `background.webp`. A researcher can update a country without touching code. Profile-only countries are a single file in `profiles/`.
- **Everything visual is computed from the same coordinates**: cores, sockets, edges, joints, hit areas and labels. The verification script (`node scripts/verify.mjs all`, with the dev server running) measures in a real Chrome that every edge starts and ends on the rim of the cores it joins after selecting, zooming, resizing, dragging and changing a core's size; that the keyboard can walk the hierarchy; that the layout editor saves and reloads; and that there are no console or network errors.
- The **layout editor** (development only) drags cores relative to the grab point, keeps sockets and lines live, and saves `layout.json` with a backup. The public site has no write endpoint; `?layout=1` keeps a local draft that can be exported.
- Accessibility: keyboard navigation of the hierarchy, an outline view, focus rings, reduced motion, forced-colours support, charts with tables.

## Data status

| Country | Status | Revenue used to size cores | Main source |
|---|---|---|---|
| Brazil | researched | 2024, all levels | Receita Federal, *Carga Tributária no Brasil 2024* |
| Canada | researched | Federal FY2024-25; provinces and municipalities 2024; CPP FY2023-24 | Public Accounts of Canada 2025; Statistics Canada 10-10-0017 and 10-10-0020; ESDC |
| Japan | researched | National FY2025; local FY2024; premiums FY2023 | MOF; MIC Local Public Finance White Paper 2026; IPSS |
| United States | researched | Federal FY2025; states and local FY2024 | Treasury MTS; Census of Governments |
| Mexico | partial | Federal 2025 (state and municipal taxes only in aggregate) | Cuenta Pública 2025; OECD |
| Colombia | partial | DIAN 2025 (subnational and social security in aggregate, OECD 2023) | DIAN; OECD |
| Bolivia | partial | SIN 2025 (customs, social security, municipal in aggregate, OECD 2023) | SIN; OECD |

The cross-country layer (Fighters) is the OECD's 2023 data for every country. The per-country limits and unverified items are listed in each country's [update checklist](docs/UPDATE-CHECKLIST.md) ("Known gaps and moving rules") and the [link report](docs/LINK-REPORT.md).

## Commands

| Command | Does |
|---|---|
| `npm run dev` / `build` / `preview` | develop, build, serve the build |
| `npm run validate` | validate every country and profile |
| `npm test` | unit tests (geometry, size scale, formatting, model, validator, fighter stats) |
| `npm run links` | check every source URL |
| `npm run checklist` / `roadmap` | regenerate the update checklists / the roadmap |
| `npm run new-country -- …` | scaffold a draft country folder |
| `npm run layouts:init` / `backgrounds` | starting layout / background art for a country |
| `npm run verify` / `verify:deploy` | browser checks against the dev server / the built site |
| `npm run package:pages` | the ready-to-upload site folder |

Rates and figures are as checked on the date shown for each item; they are information, not tax advice.
