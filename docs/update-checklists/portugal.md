# Update checklist – Portugal

Generated 2026-10-12 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/portugal/sources.json` and re-run it.

Research status: **researched**. 0 source(s) to check or due, 0 coming up, 8 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=portugal`.

## Revenue figures and national-total parts

- [ ] **Data on Taxation Trends: National Tax Lists (NTL), edition 2026** – European Commission, DG Taxation and Customs Union, with Eurostat
  - URL: https://taxation-customs.ec.europa.eu/taxation/economic-analysis/data-taxation-trends_en
  - Feeds: national-total parts: `estado-taxes-2024`, `estado-social-employers-2024`, `estado-social-households-2024`, `autarquias-imi-2024`, `autarquias-imt-2024`, `autarquias-tourist-2024`; revenue of 23 core(s): `pt-irs-state`, `pt-irc-state`, `pt-vat-state`, `pt-customs`, `pt-isp`, `pt-tobacco`, `pt-alcohol-sugar-drinks`, `pt-packaging-taxes`, …; legal/rate basis of 21 node(s)
  - Status: current – next edition expected 2027-03; figures end 2024-12-31. Published 2026-03-31, accessed 2026-10-12, covers Calendar year 2024 (series from 1995).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Workbook "NTL edition 2026 web.xlsx", sheet PT: every tax and social contribution by its national name and ESA code, in EUR million. Data cut-off 30 October 2025.

- [ ] **Main national accounts tax aggregates (gov_10a_taxag)** – Eurostat
  - URL: https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table
  - Feeds: national-total parts: `autarquias-irs-2024`, `autarquias-irc-2024`, `autarquias-vat-2024`; revenue of 3 core(s): `pt-irs-local`, `pt-irc-local`, `pt-vat-local`; legal/rate basis of 11 node(s)
  - Status: current – next edition expected 2027-07; figures end 2024-12-31. Published 2026-07-21, accessed 2026-10-12, covers Calendar year 2024.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Taxes and social contributions by sub-sector and ESA item; used to split the personal income tax (S.1313: EUR 470.5 million), the corporate income tax (EUR 798.8 million) and the VAT (EUR 1,032 million) between the State and regional and local government, and to check totals.


## Harmonised OECD layer

- [ ] **Revenue Statistics 2025, Table 6.30: Portugal, tax revenues by sub-sectors of government** – OECD
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

- [ ] **World Observatory on Subnational Government Finance and Investment – country profile: Portugal** – OECD and United Cities and Local Governments (SNG-WOFI)
  - URL: https://www.sng-wofi.org/country_profiles/portugal.html
  - Feeds: `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2022-10-24, accessed 2026-09-29, covers 2020.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Subnational government revenue by category as % of total subnational revenue, 2022 edition.


## Rate and guidance pages

- [ ] **Worldwide Tax Summaries: Portugal – Corporate – Taxes on corporate income** – PwC
  - URL: https://taxsummaries.pwc.com/portugal/corporate/taxes-on-corporate-income
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-12. Published 2026-07-24, accessed 2026-10-12, covers Rates as of the review.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: A professional firm’s summary, not an official source: standard corporate income tax rate (12% is stated to be 60% of it) and 13% in Madeira and the Azores.

- [ ] **Worldwide Tax Summaries: Portugal – Individual – Taxes on personal income** – PwC
  - URL: https://taxsummaries.pwc.com/portugal/individual/taxes-on-personal-income
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-12. Published 2026-10-03, accessed 2026-10-12, covers Rates for 2026.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: A professional firm’s summary: resident income tax rates from 12.5% to 48% for 2026.

- [ ] **Worldwide Tax Summaries: Portugal – Corporate – Other taxes** – PwC
  - URL: https://taxsummaries.pwc.com/portugal/corporate/other-taxes
  - Feeds: legal/rate basis of 4 node(s)
  - Status: current – last checked 2026-10-12. Published 2026-07-24, accessed 2026-10-12, covers Rates as of the review.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: A professional firm’s summary: VAT 23%, 13%, 6% (lower in Madeira and the Azores); employers’ social security contribution 23.75%; the bank levy.

