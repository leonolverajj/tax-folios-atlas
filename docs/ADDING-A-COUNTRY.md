# Adding a country

There are two levels of coverage; do the first for many countries, the second for the ones that matter most. [COUNTRY-ROADMAP.md](COUNTRY-ROADMAP.md) shows where each country stands and the suggested order.

## A. A profile (minutes): appears in Fiscal Fighters

1. Copy any `profiles/<id>.json` (for example `profiles/germany.json`) to `profiles/<new-id>.json`.
2. Replace: `id`, `iso3`, `isoNumeric`, `names`, `accent`, `flag` (two to four flag colours: they only dress the fighter), the `structure` numbers (per level: `total` and `byType` in the currency and scale the OECD table states; `taxToGdp`), and the `sources` (the OECD table number and URL; the observatory profile).
3. `npm run validate`. It re-adds the tax types to each level total and refuses a slip.
4. `npm run dev`, open `#/fighters/<new-id>`.

Country not covered by the OECD tables? Use the OECD's regional editions (Latin America and the Caribbean, Asia-Pacific, Africa). If a level split is missing, give `share` (percent) instead of `total` for every level and `totalByType` for the whole country (see `countries/brazil/structure.json`). Use `null` plus a `note` for anything that cannot be compared. Never estimate.

## B. A folio (days): appears on the world map

```bash
npm run new-country -- chile "Chile" CHL 152 CLP "$" "Chilean peso" "Chile"
```

This creates `countries/chile/` with a valid draft: every file the schema needs, filled with `TODO` markers, `researchStatus: "draft"`. A draft shows in `npm run dev` and is hidden from the public build until you change the status.

Then, in this order (each step is checked by `npm run validate`):

1. **Levels** (`country.json` → `levels`). Use the country's own terms: *Estados* and *Municipios*, *Länder* and *Gemeinden*, *departments*. Give each level a `branch` (`national`, `regional`, `local`), what it is, how it raises revenue, and its legal basis (article numbers).
2. **Instruments** (`taxes.json`). One entry per tax, levy or contribution: `parentId` (a level, or another instrument), `category` (tax, social contribution, insurance premium, royalty, customs duty, fee, earmarked levy), `family` (OECD-aligned; see the schema), `status`, rate with `asOf`, plain-language `explanation`, `exceptions`, `legalRefs`. Keep taxes, contributions, premiums, royalties, duties and fees apart. Where the rate varies by jurisdiction, say "varies" rather than guessing.
3. **Sources** (`sources.json`). Every URL: organisation, title, publication date, period covered, date accessed. Legal texts from the official gazette or parliament; revenue from the treasury or statistics office.
4. **The national total** (`country.json` → `denominators` and `sizing`). One part per level or scheme, each *taxes and compulsory contributions collected, before transfers*. Where a level has no itemised source, use an `aggregateOnly` part from the OECD table. See [METHODOLOGY.md](METHODOLOGY.md).
5. **Revenue** (`revenue.json`). For each instrument the latest reliable amount **in the published unit**, its period, basis, source and the exact table or line. Amounts outside the national total (fees, royalties) are `informational` with a caveat. Use `unavailable` with a reason where no figure exists.
6. **The harmonised layer** (`structure.json`): copy the country's `profiles/<id>.json` `structure` and `sources`, then delete the profile file (the folio replaces it).
7. **Labels** (`presentation.json`): short label, sublabel and glyph for every core.
8. **Positions**: `npm run layouts:init -- chile --force` for a starting arrangement, then `npm run backgrounds -- chile` for the background art (any country works: a Mercator projection and a topographic motif are used until you add a bespoke `GEO` entry or motif in `scripts/generate-backgrounds.ts`).
9. Open `npm run dev`, choose **Layout**, drag the cores until the folio reads well, **Save**. Re-run `npm run backgrounds -- chile` so the nebulae follow the final positions.
10. Set `researchStatus` to `researched` (or `partial` if some amounts are unavailable; the panel then shows a badge) and run the whole gate:

```bash
npm run validate && npm test && npm run links -- --only=chile
node scripts/verify.mjs all --only=chile    # geometry, keyboard, layout editor, screenshots (dev server running)
npm run roadmap && npm run checklist
```

## Rules that keep countries comparable

- One reference year for the harmonised layer, all countries together.
- The national total never mixes in transfers or non-tax revenue.
- A number you cannot source stays `unavailable`; the panel says so.
- Never copy a rate from a secondary site when the tax agency or the statute is available.
