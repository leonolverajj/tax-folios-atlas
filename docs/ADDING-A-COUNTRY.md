# Adding a country

There are two levels of coverage. [COUNTRY-ROADMAP.md](COUNTRY-ROADMAP.md) shows where each country stands and the suggested order.

## A. A profile (minutes): the harmonised OECD figures only

A profile is one file, `profiles/<id>.json`, with the OECD's 2023 level split and tax mix for a country. It makes the country appear in the "Next to be drawn" list at the bottom of the Trees page, and it is the starting point of its folio.

1. Copy any `profiles/<id>.json` (for example `profiles/austria.json`) to `profiles/<new-id>.json`.
2. Replace: `id`, `iso3`, `isoNumeric`, `names`, `accent`, `flag`, the `structure` numbers (per level: `total` and `byType` in the currency and scale the OECD table states; `taxToGdp`), and the `sources` (the OECD table number and URL; the observatory profile). The `basis` text is "OECD attribution to sub-sectors of general government (Interpretative Guide, section A.12)", not "collecting government".
3. `npm run validate`. It re-adds the tax types to each level total and refuses a slip.

Country not covered by the OECD tables? Use the OECD's regional editions (Latin America and the Caribbean, Asia-Pacific, Africa). If a level split is missing, give `share` (percent) instead of `total` for every level and `totalByType` for the whole country (see `countries/brazil/structure.json`). Use `null` plus a `note` for anything that cannot be compared. Never estimate.

## B. A folio (a day or two of research): appears on the map and as a tree

A folio is the folder `countries/<id>/`. You can write its JSON files by hand (`npm run new-country -- ...` scaffolds a draft), but the quickest and least error-prone way is a **builder script**: one typed definition in `scripts/build/<id>.ts`, run through `scripts/lib/build-country.ts`, which writes `country.json`, `taxes.json`, `revenue.json`, `sources.json`, `presentation.json` and `structure.json` for you. 35 of the 42 folios were made this way (the others, Bolivia, Brazil, Canada, Colombia, Japan, Mexico and the United States, are hand-written JSON); `scripts/build/south-korea.ts` (several sources, two levels plus social insurance) and `scripts/build/new-zealand.ts` (the smallest) are good templates. The JSON files stay the source of truth: after the first build you may edit them directly, and re-running the script will overwrite those edits.

### 1. Research, in this order

1. **The national total.** One *part* per level or scheme, each "taxes and compulsory contributions collected, before transfers", from the treasury's or statistics office's published accounts, for the latest year available. Prefer one source and one year for all parts; the validator warns when parts end more than 12 months apart and refuses 30. Where a level has no itemised source, use an OECD part for its level (as Spain and Chile do for local taxes), and say so in the part's `caveat`.
2. **The charges.** One core per separately legislated tax, contribution, duty or levy that reaches about 0.1% of the national total; group smaller ones into one "other" core per level, unless the amount is distinctive. The ways a charge is collected (withholding, assessment, import VAT) are folded into it. A tax is drawn **once**, under the level that legislates and levies it; revenue that is shared afterwards is described in the text of the core (see METHODOLOGY, "Where a tax is drawn"). Compulsory payments that go to private funds (private pensions, health insurers) are not government revenue: leave them out and say so in `structureNote`.
3. **The figure of each charge**, in the published unit, with the period, basis, exact table or line (`locator`) and a `calculation` if you add or subtract lines. If a charge has no figure of its own, either fold it into a residual core that says so, or draw it at neutral size with `unavailable` and a reason. **Never estimate**: a derived residual is fine, a guess is not.
4. **Rates and legal basis** from the statute or the tax agency, never a secondary site, with `asOf`. Where the sources disagree or you could not read the text, say "varies" or leave the detail out.
5. **The OECD profile** `profiles/<id>.json` already holds the harmonised layer; the builder moves it into `structure.json` and deletes the profile (the folio replaces it). Set its `basis` through `structureOverride` and map its levels to your level ids (`folioLevels`).

Techniques that worked: statistics offices and treasuries usually publish an Excel or PDF table. Download it, read it with the PDF tool or unpack the workbook, and record the sheet or page in `locator`. Government sites that refuse automated requests (bot checks) are not to be bypassed: open them by hand, or find the figure in another primary publication.

**Shortcut for EU and EEA countries: the National Tax List.** The Commission and Eurostat publish, for each member state and Iceland and Norway, one workbook with every tax line in national currency (the *National Tax Lists*, on the Taxation Trends data page). This is how the 19 European folios of October 2026 were built, in this order:

1. Unzip the workbook and run `node scripts/extract-ntl.cjs <dir> <CC>` (writes `scripts/build/data/ntl-<CC>.json`); `node scripts/extract-eurostat.cjs` writes the sector accounts (`gov_10a_taxag`) once for all countries.
2. In `scripts/build/<id>.ts`, `const n = loadNtl('<CC>', '<currency>')` and give each tax its lines: `n.rev(group, ['D29A:C03', …])` produces the amount, the locator (sheet and row numbers) and the calculation for you. Shared taxes take the local part from the sector accounts (`loadSectors`) and the State part is the list's total less that.
3. Finish with `n.reconcile(drawn, excludedKeys)`: it fails unless the lines drawn plus the lines left out equal the list's totals, so nothing can be dropped or counted twice without the build saying so.
4. Rates are not in the list: take them from the tax authority; if its site cannot be read, use a stated secondary source (flag it as guidance) and say so in the instrument. Copy `scripts/build/latvia.ts` (small, two levels) or `scripts/build/belgium.ts` (three levels) as a template.
5. Countries outside the OECD (no `profiles/<id>.json`) get no `structure.json`; the validator warns and the Trees table shows "n/a" for the OECD level shares.

### 2. Write, build, validate

```bash
npx tsx scripts/build/<id>.ts                # writes countries/<id>/*.json
npm run layouts:init -- <id> --force         # a starting arrangement of the cores
npm run validate -- <id>                     # schema + cross-file rules
```

The validator checks, among others: every sizing observation uses a part whose levels include the instrument's level and whose period matches exactly; the cores of a part add up to no more than the part; every node has a label (at most 30 characters) and a position. When a source rounds, set the part's amount to the sum of its cores and give the source's own total in the `caveat`.

### 3. Art and checks

1. Add an entry for the country in `GEO` in `scripts/generate-backgrounds.ts` if the default Mercator outline is poor (a better projection; tiny or far-away islands filtered out), then `npm run backgrounds -- <id>`. A generic topographic motif is used until a bespoke one is written.
2. `npm run dev`, open `#/<id>` (or click the country on the map) and `#/trees/<id>`. Check that the biggest cores sit where you expect, that no label overlaps, and read each panel once against its source. Use **Layout** to drag cores into a better arrangement and **Save**; re-run `npm run backgrounds -- <id>` afterwards so the nebulae follow.
3. Set `researchStatus` to `researched`, or `partial` if some amounts are unavailable or come from a different year (the panel then shows a badge), and run the whole gate:

```bash
npm run validate && npm test && npx tsc --noEmit && npm run links
node scripts/verify.mjs all                # geometry, keyboard, layout editor, trees (dev server running)
npm run roadmap && npm run checklist
```

`npm run links` writes `docs/LINK-REPORT.md`. Sites that refuse the checker are listed as blocked: open each one in a browser and, if it is right, record how in `scripts/link-verified.json`. Pages that need a challenge (CAPTCHA, bot check) stay "unverified"; do not bypass them.

## Rules that keep countries comparable

- One reference year for the harmonised layer, all countries together.
- The national total never mixes in transfers or non-tax revenue.
- A number you cannot source stays `unavailable`; the panel says so. No estimates.
- Say what is left out (in `structureNote` and in the `caveat` of the part), including compulsory payments that go to private funds.
- The same grain rule for every country; where the sources force a coarser grain (one income-tax core, cantons drawn by what they tax), the note says so.
