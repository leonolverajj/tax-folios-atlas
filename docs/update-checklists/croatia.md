# Update checklist – Croatia

Generated 2026-10-12 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/croatia/sources.json` and re-run it.

Research status: **researched**. 0 source(s) to check or due, 0 coming up, 5 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=croatia`.

## Revenue figures and national-total parts

- [ ] **Data on Taxation Trends: National Tax Lists (NTL), edition 2026** – European Commission, DG Taxation and Customs Union, with Eurostat
  - URL: https://taxation-customs.ec.europa.eu/taxation/economic-analysis/data-taxation-trends_en
  - Feeds: national-total parts: `drzava-taxes-2024`, `drzava-social-employers-2024`, `drzava-social-employees-2024`, `lokalne-pit-2024`, `lokalne-transfer-2024`, `lokalne-communal-2024`, `lokalne-vehicles-2024`, `lokalne-tourist-2024`; revenue of 23 core(s): `hr-cit`, `hr-vat`, `hr-customs`, `hr-excise-fuel`, `hr-excise-tobacco`, `hr-excise-drinks`, `hr-excise-cars`, `hr-renewable-fee`, …; legal/rate basis of 19 node(s)
  - Status: current – next edition expected 2027-03; figures end 2024-12-31. Published 2026-03-31, accessed 2026-10-12, covers Calendar year 2024 (series from 1995).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Workbook "NTL edition 2026 web.xlsx", sheet HR: every tax and social contribution by its national name and ESA code, in EUR million. Data cut-off 30 October 2025.


## Rate and guidance pages

- [ ] **Worldwide Tax Summaries: Croatia – Corporate – Taxes on corporate income** – PwC
  - URL: https://taxsummaries.pwc.com/croatia/corporate/taxes-on-corporate-income
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-12. Published 2026-08-27, accessed 2026-10-12, covers Rates as of the review.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: A professional firm’s summary, not an official source: corporate income tax 18%, 10% for revenue below EUR 1 million.

- [ ] **Worldwide Tax Summaries: Croatia – Individual – Taxes on personal income** – PwC
  - URL: https://taxsummaries.pwc.com/croatia/individual/taxes-on-personal-income
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-12. Published 2026-08-27, accessed 2026-10-12, covers Rates as of the review.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: A professional firm’s summary: progressive personal income tax rates chosen by each local self-government unit between 15% and 33%; flat rates for other income.

- [ ] **Worldwide Tax Summaries: Croatia – Corporate – Other taxes** – PwC
  - URL: https://taxsummaries.pwc.com/croatia/corporate/other-taxes
  - Feeds: legal/rate basis of 3 node(s)
  - Status: current – last checked 2026-10-12. Published 2026-08-27, accessed 2026-10-12, covers Rates as of the review.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: A professional firm’s summary: VAT 25% general, 13% reduced; employers’ health insurance contribution 16.5% of gross salary.


## Legal texts

- [ ] **Main national accounts tax aggregates (gov_10a_taxag)** – Eurostat
  - URL: https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table
  - Feeds: legal/rate basis of 7 node(s)
  - Status: current – last checked 2026-10-12. Published 2026-07-21, accessed 2026-10-12, covers Calendar year 2024.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: Taxes and social contributions by sub-sector and ESA item; used to place each tax at a level (all the personal income tax, EUR 3,389 million, is S.1313) and to check the totals of the National Tax List.

