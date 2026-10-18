# Update checklist – Denmark

Generated 2026-10-18 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/denmark/sources.json` and re-run it.

Research status: **researched**. 0 source(s) to check or due, 0 coming up, 6 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=denmark`.

## Revenue figures and national-total parts

- [ ] **StatBank table SKAT: Taxation total, divided into rates and dues** – Statistics Denmark (Danmarks Statistik)
  - URL: https://www.statbank.dk/SKAT
  - Feeds: national-total parts: `state-taxes-2025`, `municipal-taxes-2025`; revenue of 33 core(s): `dk-state-income-tax`, `dk-labour-market-contribution`, `dk-pension-payout-tax`, `dk-imputed-rent-tax`, `dk-other-income-taxes`, `dk-corporation-tax`, `dk-pension-yield-tax`, `dk-small-social-contributions`, …; legal/rate basis of 33 node(s)
  - Status: current – next edition expected 2027-03; figures end 2025-12-31. Published 2026-06-30, accessed 2026-10-11, covers Calendar year 2025.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: DKK 1,000 by type of tax and duty, 1947–2025: income taxes 935,150,533; social contributions 2,128,244; other labour market contributions 9,142,372; wealth and property taxes 47,199,277; goods and services taxes 373,931,467; other production taxes 7,772,455; total 1,375,324,349. Statistics Denmark shows the next update on 31 March 2027. Read through the StatBank API (api.statbank.dk).


## Harmonised OECD layer

- [ ] **Revenue Statistics 2025, Table 6.9: Denmark, tax revenues by sub-sectors of government** – OECD
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

- [ ] **World Observatory on Subnational Government Finance and Investment – country profile: Denmark** – OECD and United Cities and Local Governments (SNG-WOFI)
  - URL: https://www.sng-wofi.org/country_profiles/denmark.html
  - Feeds: `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2022-10-24, accessed 2026-09-29, covers 2020.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Subnational government revenue by category as % of total subnational revenue, 2022 edition.


## Rate and guidance pages

- [ ] **Denmark, individual: taxes on personal income** – PwC Worldwide Tax Summaries
  - URL: https://taxsummaries.pwc.com/Denmark/Individual/Taxes-on-personal-income
  - Feeds: legal/rate basis of 3 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: A secondary source summarising the Danish Ministry of Taxation: a bottom-bracket tax of 12.01% for 2025 and 2026, a top-bracket tax of 15% above DKK 588,900 (2025), a labour market contribution of 8% and a marginal tax ceiling of 52.07% (2025); the average municipal rate is about 25%. Rates were not read at skat.dk.


## Legal texts

- [ ] **The Constitutional Act of Denmark (Danmarks Riges Grundlov)** – Danish Parliament (Folketinget)
  - URL: https://www.retsinformation.dk/eli/lta/1953/169
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: § 43: no tax may be imposed, changed or abolished except by Act; § 82: municipalities have the right to manage their own affairs under State supervision.

