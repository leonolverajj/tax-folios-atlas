# Update checklist – Bulgaria

Generated 2026-10-18 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/bulgaria/sources.json` and re-run it.

Research status: **researched**. 0 source(s) to check or due, 0 coming up, 5 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=bulgaria`.

## Revenue figures and national-total parts

- [ ] **Data on Taxation Trends: National Tax Lists (NTL), edition 2026** – European Commission, DG Taxation and Customs Union, with Eurostat
  - URL: https://taxation-customs.ec.europa.eu/taxation/economic-analysis/data-taxation-trends_en
  - Feeds: national-total parts: `darzhava-taxes-2024`, `darzhava-social-employers-2024`, `darzhava-social-employees-2024`, `darzhava-social-self-employed-2024`, `obshtini-real-estate-2024`, `obshtini-vehicles-2024`, `obshtini-transfers-2024`, `obshtini-small-2024`; revenue of 21 core(s): `bg-pit-wages`, `bg-pit-other`, `bg-corporate-income-tax`, `bg-other-corporate-taxes`, `bg-vat`, `bg-customs`, `bg-excise-tobacco`, `bg-excise-fuel`, …; legal/rate basis of 18 node(s)
  - Status: current – next edition expected 2027-03; figures end 2024-12-31. Published 2026-03-31, accessed 2026-10-12, covers Calendar year 2024 (series from 1995).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Workbook "NTL edition 2026 web.xlsx", sheet BG: every tax and social contribution by its national name and ESA code, in BGN million. Data cut-off 30 October 2025.


## Rate and guidance pages

- [ ] **Worldwide Tax Summaries: Bulgaria – Corporate – Taxes on corporate income** – PwC
  - URL: https://taxsummaries.pwc.com/bulgaria/corporate/taxes-on-corporate-income
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-12. Published 2026-08-02, accessed 2026-10-12, covers Rates as of the review.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: A professional firm’s summary, not an official source: corporate income tax a flat 10%.

- [ ] **Worldwide Tax Summaries: Bulgaria – Individual – Taxes on personal income** – PwC
  - URL: https://taxsummaries.pwc.com/bulgaria/individual/taxes-on-personal-income
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-12. Published 2026-08-02, accessed 2026-10-12, covers Rates as of the review.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: A professional firm’s summary: a flat tax rate of 10% on all personal income, with some exceptions.

- [ ] **Worldwide Tax Summaries: Bulgaria – Corporate – Other taxes** – PwC
  - URL: https://taxsummaries.pwc.com/bulgaria/corporate/other-taxes
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-12. Published 2026-08-02, accessed 2026-10-12, covers Rates as of the review.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: A professional firm’s summary: VAT standard rate 20%, reduced rate 9%.


## Legal texts

- [ ] **Main national accounts tax aggregates (gov_10a_taxag)** – Eurostat
  - URL: https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table
  - Feeds: legal/rate basis of 5 node(s)
  - Status: current – last checked 2026-10-12. Published 2026-07-21, accessed 2026-10-12, covers Calendar year 2024.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: Taxes and social contributions by sub-sector and ESA item. For Bulgaria the July 2026 release is in euro; dividing the National Tax List’s leva by 1.95583 gives the same totals. Used to place each tax at a level.

