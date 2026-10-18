# Update checklist – Ireland

Generated 2026-10-18 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/ireland/sources.json` and re-run it.

Research status: **researched**. 1 source(s) to check or due, 0 coming up, 19 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=ireland`.

## Revenue figures and national-total parts

- [ ] **Revenue net receipts by taxhead (annual dataset)** – Revenue Commissioners
  - URL: https://www.revenue.ie/en/corporate/information-about-revenue/statistics/receipts/taxhead/index.aspx
  - Feeds: national-total parts: `revenue-taxes-2025`, `lpt-2025`; revenue of 11 core(s): `ie-income-tax`, `ie-usc`, `ie-dirt`, `ie-exit-tax`, `ie-corporation-tax`, `ie-vat`, `ie-stamp-duty`, `ie-cgt`, …; legal/rate basis of 11 node(s)
  - Status: current – next edition expected 2027-05; figures end 2025-12-31. Published 2026-05-07, accessed 2026-10-11, covers Calendar year 2025.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: The CSV net-receipts.csv gives each tax head per year in EUR million. The local property tax line equals EUR 670 million for 2025.

- [ ] **Headline Results 2025 (Annual Report 2025)** – Revenue Commissioners
  - URL: https://www.revenue.ie/en/corporate/press-office/annual-report/2025/headline-results.pdf
  - Feeds: national-total parts: `prsi-2025`; revenue of 1 core(s): `ie-prsi`; legal/rate basis of 3 node(s)
  - Status: current – next edition expected 2027-05; figures end 2025-12-31. Published 2026-05-07, accessed 2026-10-11, covers Calendar year 2025.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Exchequer receipts by tax head (total EUR 106,471 million) and receipts collected on behalf of other departments: PRSI EUR 19,458 million, VAT one-stop shops EUR 13,395 million, risk equalisation EUR 858 million, local property tax EUR 671 million.

- [ ] **Tax Strategy Group 26/08: General Excise (Budget 2027)** – Department of Finance (Ireland)
  - URL: https://assets.gov.ie/static/documents/1df2a4ae/TSG_26-08_General_Excise_.pdf
  - Feeds: national-total parts: `excise-vehicle-2025`; revenue of 7 core(s): `ie-mineral-oil-tax`, `ie-carbon-tax`, `ie-vrt`, `ie-motor-tax`, `ie-alcohol-tax`, `ie-tobacco-tax`, `ie-other-excise`; legal/rate basis of 3 node(s)
  - Status: current – next edition expected 2027-07; figures end 2025-12-31. Published 2026-07-23, accessed 2026-10-11, covers Calendar year 2025.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Table 1: alcohol products tax EUR 1,236 million, sugar-sweetened drinks tax 30.5, tobacco products tax 1,009, e-liquid products tax 5.6, betting duty 113.7; data source Revenue.

- [ ] **Main national accounts tax aggregates (gov_10a_taxag)** – Eurostat
  - URL: https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table
  - Feeds: national-total parts: `rates-2024`; revenue of 1 core(s): `ie-commercial-rates`; legal/rate basis of 1 node(s)
  - Status: **DUE** – the next edition was expected 2026-10; figures end 2024-12-31. Published 2026-04-22, accessed 2026-10-11, covers Calendar year 2024 (2025 not yet published).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Ireland, local government (S1313): taxes on production and imports EUR 1,751.6 million in 2024; State (S1311) taxes EUR 100,976.3 million; social security funds (S1314) actual contributions EUR 16,876.9 million. Read through the Eurostat dissemination API.


## Harmonised OECD layer

- [ ] **Revenue Statistics 2025, Table 6.17: Ireland, tax revenues by sub-sectors of government** – OECD
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

- [ ] **World Observatory on Subnational Government Finance and Investment – country profile: Ireland** – OECD and United Cities and Local Governments (SNG-WOFI)
  - URL: https://www.sng-wofi.org/country_profiles/ireland.html
  - Feeds: `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2022-10-24, accessed 2026-09-29, covers 2020.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Subnational government revenue by category as % of total subnational revenue, 2022 edition.


## Rate and guidance pages

- [ ] **Tax and Duty Manual: energy products and electricity taxes, excise duty rates** – Revenue Commissioners
  - URL: https://www.revenue.ie/en/tax-professionals/tdm/excise/excise-duty-rates/energy-excise-duty-rates.pdf
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.


## Legal texts

- [ ] **Tax Strategy Group 26/09: Energy, Environmental and Vehicle Tax (Budget 2027)** – Department of Finance (Ireland)
  - URL: https://assets.gov.ie/static/documents/d66c0635/TSG_26-09_Energy_Environmental_and_Vehicle_Tax_v2.pdf
  - Feeds: legal/rate basis of 5 node(s)
  - Status: current – last checked 2026-10-11. Published 2026-07-23, accessed 2026-10-11, covers Calendar year 2025.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: Tables 1 and 2: light oils EUR 613.4 million, heavy oils 1,475.8, LPG 0.1, carbon tax 1,176, electricity tax 5.2, vehicle registration tax 938, motor tax 924. Carbon tax rate EUR 71 per tonne of CO2 from 8 October 2025.

- [ ] **Taxes Consolidation Act 1997** – Office of the Attorney General (Irish Statute Book)
  - URL: https://www.irishstatutebook.ie/eli/1997/act/39/enacted/en/html
  - Feeds: legal/rate basis of 7 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Value-Added Tax Consolidation Act 2010** – Office of the Attorney General (Irish Statute Book)
  - URL: https://www.irishstatutebook.ie/eli/2010/act/31/enacted/en/html
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Stamp Duties Consolidation Act 1999** – Office of the Attorney General (Irish Statute Book)
  - URL: https://www.irishstatutebook.ie/eli/1999/act/31/enacted/en/html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Capital Acquisitions Tax Consolidation Act 2003** – Office of the Attorney General (Irish Statute Book)
  - URL: https://www.irishstatutebook.ie/eli/2003/act/1/enacted/en/html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Finance (Local Property Tax) Act 2012** – Office of the Attorney General (Irish Statute Book)
  - URL: https://www.irishstatutebook.ie/eli/2012/act/52/enacted/en/html
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Social Welfare Consolidation Act 2005** – Office of the Attorney General (Irish Statute Book)
  - URL: https://www.irishstatutebook.ie/eli/2005/act/26/enacted/en/html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Finance Act 1992 (vehicle registration tax)** – Office of the Attorney General (Irish Statute Book)
  - URL: https://www.irishstatutebook.ie/eli/1992/act/9/enacted/en/html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Finance Act 1999 (mineral oil tax)** – Office of the Attorney General (Irish Statute Book)
  - URL: https://www.irishstatutebook.ie/eli/1999/act/2/enacted/en/html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Local Government Act 2001** – Office of the Attorney General (Irish Statute Book)
  - URL: https://www.irishstatutebook.ie/eli/2001/act/37/enacted/en/html
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Valuation Act 2001** – Office of the Attorney General (Irish Statute Book)
  - URL: https://www.irishstatutebook.ie/eli/2001/act/13/enacted/en/html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

