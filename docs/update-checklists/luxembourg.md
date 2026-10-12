# Update checklist – Luxembourg

Generated 2026-10-12 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/luxembourg/sources.json` and re-run it.

Research status: **researched**. 0 source(s) to check or due, 0 coming up, 9 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=luxembourg`.

## Revenue figures and national-total parts

- [ ] **Data on Taxation Trends: National Tax Lists (NTL), edition 2026** – European Commission, DG Taxation and Customs Union, with Eurostat
  - URL: https://taxation-customs.ec.europa.eu/taxation/economic-analysis/data-taxation-trends_en
  - Feeds: national-total parts: `etat-taxes-2024`, `etat-social-employers-2024`, `etat-social-households-2024`, `communes-business-tax-2024`, `communes-other-taxes-2024`; revenue of 25 core(s): `lu-wage-tax`, `lu-income-tax-assessed`, `lu-solidarity-individuals`, `lu-capital-income-withholding`, `lu-corporation-tax`, `lu-net-wealth-tax`, `lu-subscription-tax`, `lu-inheritance`, …; legal/rate basis of 19 node(s)
  - Status: current – next edition expected 2027-03; figures end 2024-12-31. Published 2026-03-31, accessed 2026-10-12, covers Calendar year 2024 (series from 1995).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Workbook "NTL edition 2026 web.xlsx", sheet LU: every tax and social contribution by its national name and ESA code, in EUR million. Data cut-off 30 October 2025.


## Harmonised OECD layer

- [ ] **Revenue Statistics 2025, Table 6.24: Luxembourg, tax revenues by sub-sectors of government** – OECD
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

- [ ] **World Observatory on Subnational Government Finance and Investment – country profile: Luxembourg** – OECD and United Cities and Local Governments (SNG-WOFI)
  - URL: https://www.sng-wofi.org/country_profiles/luxembourg.html
  - Feeds: `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2022-10-24, accessed 2026-09-29, covers 2020.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Subnational government revenue by category as % of total subnational revenue, 2022 edition.


## Rate and guidance pages

- [ ] **Worldwide Tax Summaries: Luxembourg – Corporate – Taxes on corporate income** – PwC
  - URL: https://taxsummaries.pwc.com/luxembourg/corporate/taxes-on-corporate-income
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-12. Published 2026-07-31, accessed 2026-10-12, covers Rates as of the review.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: A professional firm’s summary, not an official source: corporate income tax 15% to EUR 175,000, 17% above EUR 200,000, solidarity surtax 7%, overall 24.94% in Luxembourg City with the 6.75% municipal business tax.

- [ ] **Worldwide Tax Summaries: Luxembourg – Individual – Taxes on personal income** – PwC
  - URL: https://taxsummaries.pwc.com/luxembourg/individual/taxes-on-personal-income
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-12. Published 2026-08-03, accessed 2026-10-12, covers Rates as of the review.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: A professional firm’s summary: progressive scale from 8% above EUR 13,230 to 42% above EUR 234,870, adapted as of 2025.

- [ ] **Worldwide Tax Summaries: Luxembourg – Corporate – Other taxes** – PwC
  - URL: https://taxsummaries.pwc.com/luxembourg/corporate/other-taxes
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-12. Published n/a, accessed 2026-10-12, covers Rates as of the review.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: A professional firm’s summary: VAT 17%, 14%, 8% and 3%; employee social contributions (sickness 2.80%, pension 8%).

- [ ] **Pre-2023 VAT rates reinstated in Luxembourg** – Luxembourg Chronicle
  - URL: https://chronicle.lu/category/taxation-audit/48000-pre-2023-vat-rates-reinstated-in-luxembourg
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-12. Published n/a, accessed 2026-10-12, covers 2024.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: News report: the VAT rates of 17%, 14% and 8% were reinstated on 1 January 2024 after the temporary cut of 2023.


## Legal texts

- [ ] **Main national accounts tax aggregates (gov_10a_taxag)** – Eurostat
  - URL: https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-12. Published 2026-07-21, accessed 2026-10-12, covers Calendar year 2024.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: Taxes and social contributions by sub-sector and ESA item; used to place each tax at a level (the municipal business tax is S.1313 D51B, EUR 1,633 million) and to check totals.

