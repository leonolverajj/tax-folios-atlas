# Update checklist – New Zealand

Generated 2026-10-11 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/new-zealand/sources.json` and re-run it.

Research status: **researched**. 0 source(s) to check or due, 0 coming up, 14 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=new-zealand`.

## Revenue figures and national-total parts

- [ ] **Financial Statements of the Government of New Zealand for the Year Ended 30 June 2026** – The Treasury (New Zealand)
  - URL: https://www.treasury.govt.nz/publications/year-end/financial-statements-2026
  - Feeds: national-total parts: `crown-taxes-2026`, `crown-levies-2026`; revenue of 13 core(s): `nz-income-tax-individuals`, `nz-fringe-benefit-tax`, `nz-company-tax`, `nz-withholding-taxes`, `nz-gst`, `nz-fuel-excise`, `nz-road-user-charges`, `nz-tobacco-excise`, …
  - Status: current – next edition expected 2027-10; figures end 2026-06-30. Published 2026-10-08, accessed 2026-10-10, covers Year ended 30 June 2026.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Note 4 gives taxation revenue by source (accrual) in the Excel companion fsgnz-2026.xlsx, sheet "Fin Stmts - Notes 4-7". Unaudited at publication.

- [ ] **Local authority statistics: June 2026 quarter** – Stats NZ
  - URL: https://www.stats.govt.nz/information-releases/local-authority-statistics-june-2026-quarter/
  - Feeds: national-total parts: `council-rates-2026`; revenue of 1 core(s): `nz-rates`
  - Status: current – next edition expected 2027-09; figures end 2026-06-30. Published 2026-09-07, accessed 2026-10-10, covers June year 2026 (provisional).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Table 3: actual income. Rates NZD 10,004.2 million in the June 2025 year and 10,933.9 million (provisional) in the June 2026 year.


## Harmonised OECD layer

- [ ] **Revenue Statistics 2025, Table 6.27: New Zealand, tax revenues by sub-sectors of government** – OECD
  - URL: https://www.oecd.org/en/publications/revenue-statistics-2025_3a264267-en/full-report/tax-revenues-by-subsectors-of-general-government_f9e88332.html
  - Feeds: `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2025-12-09, accessed 2026-09-29, covers Calendar year 2023 (national currency).
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Harmonised OECD classification of taxes (1000–6000) split by collecting sub-sector of general government.

- [ ] **Revenue Statistics 2025, Chapter 3: Tax levels and tax structures (Table 3.1)** – OECD
  - URL: https://www.oecd.org/en/publications/revenue-statistics-2025_3a264267-en/full-report/tax-levels-and-tax-structures-1965-2024_2033f3ea.html
  - Feeds: `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2025-12-09, accessed 2026-09-29, covers Calendar year 2023.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Total tax revenue as % of GDP.

- [ ] **World Observatory on Subnational Government Finance and Investment – country profile: New Zealand** – OECD and United Cities and Local Governments (SNG-WOFI)
  - URL: https://www.sng-wofi.org/country_profiles/new_zealand.html
  - Feeds: `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2022-10-24, accessed 2026-09-29, covers 2020.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Subnational government revenue by category as % of total subnational revenue, 2022 edition.


## Rate and guidance pages

- [ ] **Tax rates for individuals** – Inland Revenue
  - URL: https://www.ird.govt.nz/income-tax/income-tax-for-individuals/tax-codes-and-tax-rates-for-individuals/tax-rates-for-individuals
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: From 1 April 2025: 10.5% to NZ$15,600; 17.5% to NZ$53,500; 30% to NZ$78,100; 33% to NZ$180,000; 39% above.


## Legal texts

- [ ] **Income Tax Act 2007** – New Zealand Parliamentary Counsel Office
  - URL: https://legislation.govt.nz/act/public/2007/0097/latest/DLM1512301.html
  - Feeds: legal/rate basis of 5 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Goods and Services Tax Act 1985** – New Zealand Parliamentary Counsel Office
  - URL: https://www.legislation.govt.nz/act/public/1985/0141/latest/whole.html
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Customs and Excise Act 2018** – New Zealand Parliamentary Counsel Office
  - URL: https://www.legislation.govt.nz/act/public/2018/0004/latest/whole.html
  - Feeds: legal/rate basis of 5 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Road User Charges Act 2012** – New Zealand Parliamentary Counsel Office
  - URL: https://www.legislation.govt.nz/act/public/2012/0001/latest/whole.html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Accident Compensation Act 2001** – New Zealand Parliamentary Counsel Office
  - URL: https://www.legislation.govt.nz/act/public/2001/0049/latest/whole.html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Fire and Emergency New Zealand Act 2017** – New Zealand Parliamentary Counsel Office
  - URL: https://www.legislation.govt.nz/act/public/2017/0017/latest/whole.html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Natural Hazards Insurance Act 2023** – New Zealand Parliamentary Counsel Office
  - URL: https://legislation.govt.nz/act/public/2023/1/en/latest/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Local Government (Rating) Act 2002** – New Zealand Parliamentary Counsel Office
  - URL: https://www.legislation.govt.nz/act/public/2002/0006/latest/whole.html
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

