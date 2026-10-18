# Update checklist – Romania

Generated 2026-10-18 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/romania/sources.json` and re-run it.

Research status: **researched**. 0 source(s) to check or due, 0 coming up, 5 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=romania`.

## Revenue figures and national-total parts

- [ ] **Data on Taxation Trends: National Tax Lists (NTL), edition 2026** – European Commission, DG Taxation and Customs Union, with Eurostat
  - URL: https://taxation-customs.ec.europa.eu/taxation/economic-analysis/data-taxation-trends_en
  - Feeds: national-total parts: `statul-taxes-2024`, `statul-social-employers-2024`, `statul-social-insured-2024`, `local-buildings-2024`, `local-land-2024`, `local-vehicles-2024`, `local-small-2024`; revenue of 27 core(s): `ro-pit-wages`, `ro-pit-dividends`, `ro-pit-pensions`, `ro-pit-other`, `ro-corporate-profit-tax`, `ro-micro-enterprise-tax`, `ro-bank-tax`, `ro-sector-solidarity-taxes`, …; legal/rate basis of 27 node(s)
  - Status: current – next edition expected 2027-03; figures end 2024-12-31. Published 2026-03-31, accessed 2026-10-12, covers Calendar year 2024 (series from 1995).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Workbook "NTL edition 2026 web.xlsx", sheet RO: every tax and social contribution by its national name and ESA code, in RON million. Data cut-off 30 October 2025.

- [ ] **Main national accounts tax aggregates (gov_10a_taxag)** – Eurostat
  - URL: https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table
  - Feeds: national-total parts: `local-other-fees-2024`, `local-transfer-2024`, `local-licences-2024`; revenue of 3 core(s): `ro-other-fees-local`, `ro-transfer-tax-local`, `ro-licence-fees-local`; legal/rate basis of 13 node(s)
  - Status: current – next edition expected 2027-07; figures end 2024-12-31. Published 2026-07-21, accessed 2026-10-12, covers Calendar year 2024.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Taxes and social contributions by sub-sector and ESA item; used to place each tax at a level, to split three shared lines and to check totals.


## Rate and guidance pages

- [ ] **Worldwide Tax Summaries: Romania – Corporate – Taxes on corporate income** – PwC
  - URL: https://taxsummaries.pwc.com/romania/corporate/taxes-on-corporate-income
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-12. Published 2026-09-25, accessed 2026-10-12, covers Rates as of the review.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: A professional firm’s summary, not an official source: corporate income tax 16%; the supplementary tax on credit institutions.

- [ ] **Worldwide Tax Summaries: Romania – Individual – Taxes on personal income** – PwC
  - URL: https://taxsummaries.pwc.com/romania/individual/taxes-on-personal-income
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-12. Published 2026-09-25, accessed 2026-10-12, covers Rates as of the review.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: A professional firm’s summary: a flat personal income tax rate of 10%.

- [ ] **Worldwide Tax Summaries: Romania – Corporate – Other taxes** – PwC
  - URL: https://taxsummaries.pwc.com/romania/corporate/other-taxes
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-12. Published 2026-09-25, accessed 2026-10-12, covers Rates as of the review.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: A professional firm’s summary: standard VAT rate 21%, reduced rate 11%; excise duty levels for 2026.

