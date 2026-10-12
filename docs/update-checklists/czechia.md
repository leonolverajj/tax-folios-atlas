# Update checklist – Czechia

Generated 2026-10-12 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/czechia/sources.json` and re-run it.

Research status: **researched**. 0 source(s) to check or due, 0 coming up, 8 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=czechia`.

## Revenue figures and national-total parts

- [ ] **Data on Taxation Trends: National Tax Lists (NTL), edition 2026** – European Commission, DG Taxation and Customs Union, with Eurostat
  - URL: https://taxation-customs.ec.europa.eu/taxation/economic-analysis/data-taxation-trends_en
  - Feeds: national-total parts: `stat-taxes-2024`, `stat-social-employers-2024`, `stat-social-households-2024`, `samosprava-property-2024`, `samosprava-cit-2024`, `samosprava-fees-2024`; revenue of 26 core(s): `cz-pit-employment`, `cz-pit-self-employed`, `cz-pit-capital`, `cz-corporate-income-tax`, `cz-windfall-topup`, `cz-vat`, `cz-customs`, `cz-excise-fuel`, …; legal/rate basis of 19 node(s)
  - Status: current – next edition expected 2027-03; figures end 2024-12-31. Published 2026-03-31, accessed 2026-10-12, covers Calendar year 2024 (series from 1995).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Workbook "NTL edition 2026 web.xlsx", sheet CZ: every tax and social contribution by its national name and ESA code, in CZK million. Data cut-off 30 October 2025.


## Harmonised OECD layer

- [ ] **Revenue Statistics 2025, Table 6.8: Czechia, tax revenues by sub-sectors of government** – OECD
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

- [ ] **World Observatory on Subnational Government Finance and Investment – country profile: Czechia** – OECD and United Cities and Local Governments (SNG-WOFI)
  - URL: https://www.sng-wofi.org/country_profiles/czech_republic.html
  - Feeds: `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2022-10-24, accessed 2026-09-29, covers 2020.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Subnational government revenue by category as % of total subnational revenue, 2022 edition.


## Rate and guidance pages

- [ ] **Worldwide Tax Summaries: Czech Republic – Corporate – Taxes on corporate income** – PwC
  - URL: https://taxsummaries.pwc.com/czech-republic/corporate/taxes-on-corporate-income
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-12. Published 2026-07-27, accessed 2026-10-12, covers Rates as of the review.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: A professional firm’s summary, not an official source: corporate income tax 19%, 21% in 2024 and 2025; windfall tax of 60% on excess profits in 2023 through 2025.

- [ ] **Worldwide Tax Summaries: Czech Republic – Individual – Taxes on personal income** – PwC
  - URL: https://taxsummaries.pwc.com/czech-republic/individual/taxes-on-personal-income
  - Feeds: legal/rate basis of 3 node(s)
  - Status: current – last checked 2026-10-12. Published 2026-07-27, accessed 2026-10-12, covers Rates as of the review.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: A professional firm’s summary: personal income tax 15% up to CZK 1,762,812 and 23% above; final withholding on Czech dividends and interest.

- [ ] **Worldwide Tax Summaries: Czech Republic – Corporate – Other taxes** – PwC
  - URL: https://taxsummaries.pwc.com/czech-republic/corporate/other-taxes
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-12. Published 2026-07-27, accessed 2026-10-12, covers Rates as of the review.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: A professional firm’s summary: VAT 21% and 12%; the road tax abolished for lighter vehicles from 2022.


## Legal texts

- [ ] **Main national accounts tax aggregates (gov_10a_taxag)** – Eurostat
  - URL: https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table
  - Feeds: legal/rate basis of 4 node(s)
  - Status: current – last checked 2026-10-12. Published 2026-07-21, accessed 2026-10-12, covers Calendar year 2024.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: Taxes and social contributions by sub-sector and ESA item; used to place each tax at a level and to check the totals of the National Tax List.

