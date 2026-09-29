# Update playbook: keeping the atlas from going stale

Tax facts change on a calendar: budgets change rates, statistics offices publish new revenue years, courts strike laws down. This playbook turns that into a routine you can follow without reading any code. Everything lives in JSON files; nothing below needs a developer except the two commands at the end.

## The one-minute version

```bash
npm run checklist     # writes docs/update-checklists/<country>.md and docs/UPDATE-CHECKLIST.md
```

Open [UPDATE-CHECKLIST.md](UPDATE-CHECKLIST.md). It lists, per country, every source the data rests on, what each source feeds, when it was last checked, and whether a newer edition is probably out. Work through the rows marked **DUE** or **CHECK**, then run:

```bash
npm run validate      # schema + cross-file rules; fails loudly on a slip
npm test              # unit tests, including OECD cross-checks
npm run links         # every source URL still answers
```

## What to re-check, and how often

| What | Where it lives | Rhythm | What triggers it |
|---|---|---|---|
| **Rates and thresholds** | `countries/<id>/taxes.json` (`rate`, `rate.asOf`, `checkedOn`) | each budget or tax year; at least yearly | Budget speech, finance act, tax agency notice |
| **Legal status** (new, repealed, suspended) | `taxes.json` (`status`, `statusNote`) | whenever a law or ruling lands | Court decisions, enactments, announced reforms; the checklist lists every `transitional` and `scheduled` rule first |
| **Revenue by tax** | `countries/<id>/revenue.json` + the matching part in `country.json` | yearly, when the statistics office publishes | Public accounts, treasury monthly statements, tax-agency annual report |
| **National-total parts** | `country.json` → `denominators` | with the revenue above | Same release; every part must stay in the same currency and within 30 months of the others |
| **Harmonised OECD layer** | `countries/<id>/structure.json` and `profiles/<id>.json` | yearly: OECD Revenue Statistics appear each **December** (OECD members) and the Latin America edition each **May** | New edition. Replace **all** countries together, so they keep sharing one reference year |
| **Subnational revenue structure** | `structure.json` → `subnational` | every 2 to 3 years (the observatory's editions) | New OECD/UCLG observatory edition |

## The routine, step by step

1. `npm run checklist`, open the country file, take the first **DUE** row.
2. Open the source URL. Find the newest period. Note its **unit and scale** exactly as published (millions, thousands, trillions) and keep them.
3. Edit the JSON:
   - `revenue.json`: change `amount`, keep `scale`; update the group's `period`, `sourceId`, `locator` (the table and line you used) and `accessed` (today).
   - `country.json`: update the matching `denominators` entry (`amount`, `period`, `sourceId`, `locator`, `calculation`). The national total is the sum of the parts named in `sizing.componentIds`; you never enter a share, they are computed.
4. If you replaced a figure, say in `caveat` what changed and why (a revision, a new classification).
5. Record `nextExpected` (YYYY-MM) on the source in `sources.json` when the publisher announces the next release. The checklist then says "current" until that month, instead of guessing from the age.
6. `npm run validate`. It stops you if a part is missing a source, a share exceeds 100%, periods disagree, or tax types do not add up to a level total.
7. Look at the folio (`npm run dev`, open the country): if a tax jumped or vanished, the sizes will show it at once.
8. `npm test && npm run links`.
9. Commit/upload. If you deploy with GitHub Actions ([DEPLOY-GITHUB-PAGES.md](DEPLOY-GITHUB-PAGES.md)), the site rebuilds by itself and refuses to publish invalid data.

## The yearly OECD refresh (all countries, one sitting)

The Fiscal Fighters screen compares countries on one reference year. Refresh it as a set:

1. Read the new tables: Revenue Statistics chapter 6 ("Tax revenues by subsectors of general government"), chapter 3 (tax-to-GDP and tax mix), and the Latin America edition's Table 1.4 for Brazil and Bolivia. Prefer downloading the OECD Data Explorer table as CSV over reading the web page.
2. For the 33 files in `profiles/` and the 7 `structure.json` files: replace the year, level totals, tax types and tax-to-GDP. Keep the currency and scale that the table states.
3. `npm run validate` (tax types must add up to each level's total, level shares to 100%).
4. The tests compare a handful of headline OECD figures (for example Canada's income share of tax, 51.0%); update those constants in `tests/profile.test.ts` to the new edition. That is deliberate: it forces a second look at the numbers.

The first import is preserved in `scripts/archive/` as a record of how the numbers were read and checksummed.

## Data quality rules the validator enforces (so you don't have to remember them)

- Every figure has a source, a period, a currency and a unit; a share is never typed, it is computed.
- Every part of the national total uses the country's currency; their periods end within 30 months of each other (a warning beyond 12).
- No core is measured against two totals; the cores of one part add up to no more than 100% of it; no aggregate is counted twice (`aggregateKey`).
- Rules that are not in force say so: any `status` other than `current` needs a `statusNote`.
- An "n/a" is honest and allowed; an estimate presented as a measurement is not.

## What to do when a source disappears or blocks robots

`npm run links` classes each URL as ok, redirected, checked separately, unverified, suspect or broken. Sites that block automated clients (a few tax agencies, congress.gov, some Colombian and Mexican government hosts) show as **unverified**: open them in a browser once, and if they load, record that in `scripts/link-verified.json` with the date and how you checked. A **broken** or **suspect** link needs a replacement source before the next release.
