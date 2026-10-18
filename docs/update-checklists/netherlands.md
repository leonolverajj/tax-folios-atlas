# Update checklist – Netherlands

Generated 2026-10-18 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/netherlands/sources.json` and re-run it.

Research status: **researched**. 0 source(s) to check or due, 0 coming up, 19 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=netherlands`.

## Revenue figures and national-total parts

- [ ] **Government; received taxes and statutory premiums (table 84120NED)** – Statistics Netherlands (CBS)
  - URL: https://opendata.cbs.nl/#/CBS/nl/dataset/84120NED/table
  - Feeds: national-total parts: `rijk-taxes-2025`, `municipal-taxes-2025`, `water-board-taxes-2025`, `social-premiums-2025`; revenue of 29 core(s): `nl-income-tax`, `nl-corporate-tax`, `nl-dividend-tax`, `nl-vat`, `nl-fuel-excise`, `nl-tobacco-excise`, `nl-alcohol-excise`, `nl-soft-drinks-tax`, …; legal/rate basis of 29 node(s)
  - Status: current – next edition expected 2027-03; figures end 2025-12-31. Published 2026-09-23, accessed 2026-10-11, covers Calendar year 2025 (provisional).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Annual figures 1995–2025, national accounts (ESA 2010) for central government, local government and social security funds. Read through the CBS open data API (ODataApi, key BelastingenEnWettelijkePremies, 2025JJ00). The 79 lines add up exactly to the totals: taxes EUR 307,671 million and premiums EUR 146,356 million.


## Harmonised OECD layer

- [ ] **Revenue Statistics 2025, Table 6.26: Netherlands, tax revenues by sub-sectors of government** – OECD
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

- [ ] **World Observatory on Subnational Government Finance and Investment – country profile: Netherlands** – OECD and United Cities and Local Governments (SNG-WOFI)
  - URL: https://www.sng-wofi.org/country_profiles/netherlands.html
  - Feeds: `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2022-10-24, accessed 2026-09-29, covers 2020.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Subnational government revenue by category as % of total subnational revenue, 2022 edition.


## Rate and guidance pages

- [ ] **Jaarrapportage 2025** – Belastingdienst (Dutch Tax and Customs Administration)
  - URL: https://www.tweedekamer.nl/downloads/document?id=2026D27866
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published 2026-05-20, accessed 2026-10-11, covers Calendar year 2025.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: Tax receipts collected by the Belastingdienst: EUR 391,045 million in total, of which wage and income levies EUR 223,570 million (including premiums), VAT 82,977, corporation tax 49,095, dividend tax 6,636, transfer tax 4,703, inheritance and gift tax 4,100.


## Legal texts

- [ ] **Income and expenditure of the central government, Rijksjaarverslag 2025** – Ministry of Finance (Netherlands)
  - URL: https://www.rijksoverheid.nl/themas/overheid-en-democratie/verantwoordingsdag/rijksjaarverslag-inkomsten-en-uitgaven
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-11. Published 2026-05-20, accessed 2026-10-11, covers Calendar year 2025.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: Cross-check: the Rijk’s revenue of EUR 432.5 billion in 2025 (wage and income tax 101.3, VAT 83.3, health premiums 61.0, corporation tax 49.4, employee insurance premiums 45.4, national insurance premiums 40.1, excise 11.5 and so on), on the central government’s own basis.

- [ ] **Constitution of the Kingdom of the Netherlands (Grondwet)** – Dutch government (wetten.overheid.nl)
  - URL: https://wetten.overheid.nl/BWBR0001840/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **General Act on State Taxes (Algemene wet inzake rijksbelastingen)** – Dutch government (wetten.overheid.nl)
  - URL: https://wetten.overheid.nl/BWBR0002320/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Income Tax Act 2001 (Wet inkomstenbelasting 2001)** – Dutch government (wetten.overheid.nl)
  - URL: https://wetten.overheid.nl/BWBR0011353/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Wage Tax Act 1964 (Wet op de loonbelasting 1964)** – Dutch government (wetten.overheid.nl)
  - URL: https://wetten.overheid.nl/BWBR0002471/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Corporate Income Tax Act 1969 (Wet op de vennootschapsbelasting 1969)** – Dutch government (wetten.overheid.nl)
  - URL: https://wetten.overheid.nl/BWBR0002672/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Turnover Tax Act 1968 (Wet op de omzetbelasting 1968)** – Dutch government (wetten.overheid.nl)
  - URL: https://wetten.overheid.nl/BWBR0002629/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Municipalities Act (Gemeentewet)** – Dutch government (wetten.overheid.nl)
  - URL: https://wetten.overheid.nl/BWBR0005416/
  - Feeds: legal/rate basis of 4 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Water Boards Act (Waterschapswet)** – Dutch government (wetten.overheid.nl)
  - URL: https://wetten.overheid.nl/BWBR0008531/
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Health Insurance Act (Zorgverzekeringswet)** – Dutch government (wetten.overheid.nl)
  - URL: https://wetten.overheid.nl/BWBR0018450/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **General Old Age Pensions Act (Algemene Ouderdomswet)** – Dutch government (wetten.overheid.nl)
  - URL: https://wetten.overheid.nl/BWBR0002221/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Long-term Care Act (Wet langdurige zorg)** – Dutch government (wetten.overheid.nl)
  - URL: https://wetten.overheid.nl/BWBR0036014/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Unemployment Insurance Act (Werkloosheidswet)** – Dutch government (wetten.overheid.nl)
  - URL: https://wetten.overheid.nl/BWBR0004045/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Work and Income according to Labour Capacity Act (Wet werk en inkomen naar arbeidsvermogen)** – Dutch government (wetten.overheid.nl)
  - URL: https://wetten.overheid.nl/BWBR0019057/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

