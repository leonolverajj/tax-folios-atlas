# Update checklist – Switzerland

Generated 2026-10-18 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/switzerland/sources.json` and re-run it.

Research status: **researched**. 1 source(s) to check or due, 2 coming up, 16 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=switzerland`.

## Revenue figures and national-total parts

- [ ] **Revenue Statistics 2025, Table 6.35: Switzerland, tax revenues by sub-sectors of government** – OECD
  - URL: https://www.oecd.org/en/publications/revenue-statistics-2025_3a264267-en/full-report/tax-revenues-by-subsectors-of-general-government_f9e88332.html
  - Feeds: national-total parts: `cantonal-taxes-2023`, `communal-taxes-2023`; revenue of 11 core(s): `ch-cantonal-income-tax`, `ch-cantonal-profit-tax`, `ch-cantonal-wealth-tax`, `ch-inheritance-tax`, `ch-cantonal-vehicle-taxes`, `ch-other-cantonal-income`, `ch-other-cantonal-taxes`, `ch-communal-income-tax`, …; legal/rate basis of 2 node(s); `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: **CHECK** – figures end 2023-12-31 (34 months ago); a newer edition may exist (record `nextExpected` in sources.json once you know). Published 2025-12-09, accessed 2026-09-29, covers Calendar year 2023 (national currency).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Harmonised OECD classification of taxes (1000–6000) split by collecting sub-sector of general government.

- [ ] **Taschenstatistik Öffentliche Finanzen 2025 (page 3: Einnahmen Bund)** – Federal Finance Administration (EFV)
  - URL: https://www.efv.admin.ch/dam/de/sd-web/bjAPAViEZor6/Taschenstatistik-2025-d-web.pdf
  - Feeds: national-total parts: `federal-fiscal-2023`; revenue of 9 core(s): `ch-direct-federal-tax`, `ch-vat`, `ch-withholding-tax`, `ch-mineral-oil-tax`, `ch-stamp-duties`, `ch-tobacco-tax`, `ch-heavy-vehicle-fee`, `ch-customs`, …; legal/rate basis of 1 node(s)
  - Status: soon – next edition expected 2026-12; figures end 2023-12-31. Published n/a, accessed 2026-10-10, covers 2023–2025.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Federal fiscal revenue by tax for 2023, 2024 and 2025 (state accounts).

- [ ] **Schweizerische Sozialversicherungsstatistik 2025, Tabelle GRSV 2.1 (Gesamtrechnung 2023)** – Federal Social Insurance Office (BSV)
  - URL: https://www.bsv.admin.ch/dam/de/sd-web/RIeg4Wu8GFDb/Schweizerische%20Sozialversicherungsstatistik%202025.pdf
  - Feeds: national-total parts: `social-insurance-2023`; revenue of 4 core(s): `ch-ahv`, `ch-iv`, `ch-eo`, `ch-alv`; legal/rate basis of 4 node(s)
  - Status: soon – next edition expected 2026-12; figures end 2023-12-31. Published n/a, accessed 2026-10-10, covers 2023.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Page 8: income and expenditure of each social insurance in 2023.


## Harmonised OECD layer

- [ ] **Revenue Statistics 2025, Chapter 3: Tax levels and tax structures (Table 3.1)** – OECD
  - URL: https://www.oecd.org/en/publications/revenue-statistics-2025_3a264267-en/full-report/tax-levels-and-tax-structures-1965-2024_2033f3ea.html
  - Feeds: `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2025-12-09, accessed 2026-09-29, covers Calendar year 2023.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Total tax revenue as % of GDP.

- [ ] **World Observatory on Subnational Government Finance and Investment – country profile: Switzerland** – OECD and United Cities and Local Governments (SNG-WOFI)
  - URL: https://www.sng-wofi.org/country_profiles/switzerland.html
  - Feeds: legal/rate basis of 1 node(s); `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2022-10-24, accessed 2026-09-29, covers 2020.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Subnational government revenue by category as % of total subnational revenue, 2022 edition.


## Rate and guidance pages

- [ ] **Direct federal tax** – Federal Tax Administration (ESTV)
  - URL: https://www.estv.admin.ch/en/direct-federal-tax
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.

- [ ] **Value added tax** – Federal Tax Administration (ESTV)
  - URL: https://www.estv.admin.ch/en/value-added-tax
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: Standard rate 8.1%, reduced rate 2.6%, special rate for accommodation 3.8% (from 1 January 2024).

- [ ] **Withholding tax** – Federal Tax Administration (ESTV)
  - URL: https://www.estv.admin.ch/en/anticipatory-tax
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.

- [ ] **Stamp duties** – Federal Tax Administration (ESTV)
  - URL: https://www.estv.admin.ch/en/stamp-duty
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.

- [ ] **Duties and levies: mineral oil tax, tobacco tax, heavy vehicle fee, customs duties** – Federal Office for Customs and Border Security (BAZG)
  - URL: https://www.bazg.admin.ch/en
  - Feeds: legal/rate basis of 4 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: Mineral oil tax on petrol CHF 0.7312 per litre and on diesel CHF 0.7587 per litre including the surcharge.


## Legal texts

- [ ] **Bundesverfassung der Schweizerischen Eidgenossenschaft (Federal Constitution, SR 101)** – Swiss Confederation (Fedlex)
  - URL: https://www.fedlex.admin.ch/eli/cc/1999/404/en
  - Feeds: legal/rate basis of 11 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Bundesgesetz über die direkte Bundessteuer (DBG, SR 642.11)** – Swiss Confederation (Fedlex)
  - URL: https://www.fedlex.admin.ch/eli/cc/1991/1184_1184_1184/en
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Bundesgesetz über die Harmonisierung der direkten Steuern der Kantone und Gemeinden (StHG, SR 642.14)** – Swiss Confederation (Fedlex)
  - URL: https://www.fedlex.admin.ch/eli/cc/1991/1115_1115_1115/en
  - Feeds: legal/rate basis of 8 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Bundesgesetz über die Mehrwertsteuer (MWSTG, SR 641.20)** – Swiss Confederation (Fedlex)
  - URL: https://www.fedlex.admin.ch/eli/cc/2009/615/en
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Bundesgesetz über die Alters- und Hinterlassenenversicherung (AHVG, SR 831.10)** – Swiss Confederation (Fedlex)
  - URL: https://www.fedlex.admin.ch/eli/cc/63/837_843_843/en
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.


## Context and cross-checks

- [ ] **Öffentliche Finanzen der Schweiz 2023–2024** – Federal Finance Administration (EFV)
  - URL: https://www.efv.admin.ch/dam/de/sd-web/eN3o9LnwCuBV/2025-hauptpublikation-d.pdf
  - Feeds: cross-check
  - Status: published 2025-11-04. Published 2025-11-04, accessed 2026-10-10, covers 2023–2024.
  - To do: Context only: re-open if a related figure or rule changes.
  - Note: Public finances of the Swiss Confederation, cantons, communes and social insurance on national (FS) and international (GFS) models.

