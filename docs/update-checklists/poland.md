# Update checklist – Poland

Generated 2026-10-12 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/poland/sources.json` and re-run it.

Research status: **researched**. 0 source(s) to check or due, 0 coming up, 8 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=poland`.

## Revenue figures and national-total parts

- [ ] **Data on Taxation Trends: National Tax Lists (NTL), edition 2026** – European Commission, DG Taxation and Customs Union, with Eurostat
  - URL: https://taxation-customs.ec.europa.eu/taxation/economic-analysis/data-taxation-trends_en
  - Feeds: national-total parts: `panstwo-taxes-2024`, `panstwo-social-employers-2024`, `panstwo-social-households-2024`, `jst-property-2024`, `jst-other-2024`; revenue of 27 core(s): `pl-pit-state`, `pl-cit-state`, `pl-winnings-tax`, `pl-vat`, `pl-customs`, `pl-excise-fuel`, `pl-excise-tobacco`, `pl-excise-alcohol`, …; legal/rate basis of 24 node(s)
  - Status: current – next edition expected 2027-03; figures end 2024-12-31. Published 2026-03-31, accessed 2026-10-12, covers Calendar year 2024 (series from 1995).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Workbook "NTL edition 2026 web.xlsx", sheet PL: every tax and social contribution by its national name and ESA code, in PLN million. Data cut-off 30 October 2025.

- [ ] **Main national accounts tax aggregates (gov_10a_taxag)** – Eurostat
  - URL: https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table
  - Feeds: national-total parts: `jst-pit-2024`, `jst-cit-2024`; revenue of 2 core(s): `pl-pit-local`, `pl-cit-local`; legal/rate basis of 10 node(s)
  - Status: current – next edition expected 2027-07; figures end 2024-12-31. Published 2026-07-21, accessed 2026-10-12, covers Calendar year 2024.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Taxes and social contributions by sub-sector and ESA item; used to split the income taxes between the State (S.1311: PIT PLN 81,722 million, CIT PLN 60,956 million) and local government (S.1313: PIT PLN 101,792 million, CIT PLN 26,519 million) and to check the totals.


## Harmonised OECD layer

- [ ] **Revenue Statistics 2025, Table 6.29: Poland, tax revenues by sub-sectors of government** – OECD
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

- [ ] **World Observatory on Subnational Government Finance and Investment – country profile: Poland** – OECD and United Cities and Local Governments (SNG-WOFI)
  - URL: https://www.sng-wofi.org/country_profiles/poland.html
  - Feeds: `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2022-10-24, accessed 2026-09-29, covers 2020.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Subnational government revenue by category as % of total subnational revenue, 2022 edition.


## Rate and guidance pages

- [ ] **Worldwide Tax Summaries: Poland – Corporate – Taxes on corporate income** – PwC
  - URL: https://taxsummaries.pwc.com/poland/corporate/taxes-on-corporate-income
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-12. Published 2026-08-11, accessed 2026-10-12, covers Rates as of the review.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: A professional firm’s summary, not an official source: standard CIT 19%, reduced 9% for small taxpayers, 23% for banks from 2026.

- [ ] **Worldwide Tax Summaries: Poland – Individual – Taxes on personal income** – PwC
  - URL: https://taxsummaries.pwc.com/poland/individual/taxes-on-personal-income
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-12. Published 2026-08-11, accessed 2026-10-12, covers Rates as of the review.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: A professional firm’s summary: personal income tax 12% up to PLN 120,000 less a deduction of PLN 3,600, then PLN 10,800 plus 32% of the excess.

- [ ] **Worldwide Tax Summaries: Poland – Corporate – Other taxes** – PwC
  - URL: https://taxsummaries.pwc.com/poland/corporate/other-taxes
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-12. Published 2026-08-11, accessed 2026-10-12, covers Rates as of the review.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: A professional firm’s summary: VAT 23%, 8%, 5%, 0% and exemption.

