# Update checklist – Türkiye

Generated 2026-10-18 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/turkiye/sources.json` and re-run it.

Research status: **partial**. 0 source(s) to check or due, 0 coming up, 7 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=turkiye`.

## Revenue figures and national-total parts

- [ ] **Aralık 2025 Aylık Bütçe Gerçekleşme Raporu (December 2025 monthly central government budget realisation report)** – Ministry of Treasury and Finance of Türkiye (Kamu Mali Yönetim ve Dönüşüm Genel Müdürlüğü)
  - URL: https://ms.hmb.gov.tr/uploads/sites/23/2026/01/2025-Aralik-Aylik-Butce-Gerceklesme-Raporu_V2_14.01.2026-e6324968422ea9d9.pdf
  - Feeds: national-total parts: `merkezi-vergi-2025`; revenue of 9 core(s): `tr-income-tax`, `tr-corporate-tax`, `tr-vat-domestic`, `tr-vat-imports`, `tr-special-consumption-tax`, `tr-banking-insurance-tax`, `tr-stamp-duty`, `tr-fees`, …; legal/rate basis of 5 node(s)
  - Status: current – next edition expected 2027-01; figures end 2025-12-31. Published 2026-01-15, accessed 2026-10-12, covers Calendar year 2025 (cumulative January–December).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Tax revenues 2025, TRY million: income tax 2,813,235; corporate tax 1,223,874; domestic VAT 1,555,932; special consumption tax 2,024,315; banking and insurance transactions tax 551,757; import VAT 1,724,197; stamp duty 225,943; fees 336,954; other 593,261; total 11,049,467. Announcement page: https://kmyd.hmb.gov.tr/duyuru/2025-aralik-merkezi-yonetim-butce-gerceklesmeleri


## Harmonised OECD layer

- [ ] **Revenue Statistics 2025, Table 6.36: Türkiye, tax revenues by sub-sectors of government** – OECD
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

- [ ] **World Observatory on Subnational Government Finance and Investment – country profile: Türkiye** – OECD and United Cities and Local Governments (SNG-WOFI)
  - URL: https://www.sng-wofi.org/country_profiles/republic_of_turkiye.html
  - Feeds: `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2022-10-24, accessed 2026-09-29, covers 2020.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Subnational government revenue by category as % of total subnational revenue, 2022 edition.


## Rate and guidance pages

- [ ] **Worldwide Tax Summaries: Turkey – Corporate – Taxes on corporate income** – PwC
  - URL: https://taxsummaries.pwc.com/turkey/corporate/taxes-on-corporate-income
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-12. Published 2026-09-09, accessed 2026-10-12, covers Rates as of the review.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: A professional firm’s summary, not an official source: corporate income tax 25%, 30% for financial sector companies; domestic minimum tax from 2025.

- [ ] **Worldwide Tax Summaries: Turkey – Individual – Taxes on personal income** – PwC
  - URL: https://taxsummaries.pwc.com/turkey/individual/taxes-on-personal-income
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-12. Published 2026-09-09, accessed 2026-10-12, covers Scale for 2026.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: A professional firm’s summary: income tax scale 15%, 20%, 27%, 35% and 40%; no local taxes on personal income.

- [ ] **Worldwide Tax Summaries: Turkey – Corporate – Other taxes** – PwC
  - URL: https://taxsummaries.pwc.com/turkey/corporate/other-taxes
  - Feeds: legal/rate basis of 3 node(s)
  - Status: current – last checked 2026-10-12. Published 2026-09-09, accessed 2026-10-12, covers Rates as of the review.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: A professional firm’s summary: VAT from 1% to 20%, general rate 20%; the four product groups of the special consumption tax.

