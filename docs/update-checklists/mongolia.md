# Update checklist – Mongolia

Generated 2026-10-18 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/mongolia/sources.json` and re-run it.

Research status: **researched**. 1 source(s) to check or due, 0 coming up, 3 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=mongolia`.

## Revenue figures and national-total parts

- [ ] **Government Finance Statistics, Statement of Operations (GFS_SOO): revenue series of Mongolia, domestic currency, annual** – International Monetary Fund
  - URL: https://api.imf.org/external/sdmx/2.1/data/IMF.STA,GFS_SOO/MNG.*.G1.*.XDC.A?startPeriod=2016
  - Feeds: national-total parts: `central-2024`, `local-2024`; revenue of 14 core(s): `mn-central-g11411`, `mn-central-g121-other`, `mn-central-g1112`, `mn-central-g1151`, `mn-central-g1142`, `mn-central-g116`, `mn-central-g11452`, `mn-central-g1152`, …; legal/rate basis of 16 node(s)
  - Status: **CHECK** – figures end 2024-12-31 (22 months ago); a newer edition may exist (record `nextExpected` in sources.json once you know). Published 2026-10-17, accessed 2026-10-17, covers 2024.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: The series used, as the IMF’s SDMX interface returns them (XML). The values are in units of domestic currency.


## Legal texts

- [ ] **Codelist CL_GFS_INDICATOR (names of the classification lines of GFS_SOO)** – International Monetary Fund
  - URL: https://api.imf.org/external/sdmx/2.1/codelist/IMF.STA/CL_GFS_INDICATOR/12.0.0
  - Feeds: legal/rate basis of 14 node(s)
  - Status: current – last checked 2026-10-17. Published n/a, accessed 2026-10-17.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: Gives the name of each line (for example G1111_T, taxes on income, profits and capital gains payable by individuals), which follow the Government Finance Statistics Manual 2014.


## Context and cross-checks

- [ ] **IMF Data: GFS Statement of Operations (GFS_SOO), dataset page** – International Monetary Fund
  - URL: https://data.imf.org/en/datasets/IMF.STA:GFS_SOO
  - Feeds: cross-check
  - Status: no publication date. Published n/a, accessed 2026-10-17.
  - To do: Context only: re-open if a related figure or rule changes.
  - Note: The dataset page: description, metadata and download.

