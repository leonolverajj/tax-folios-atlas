# Update checklist – United Kingdom

Generated 2026-10-18 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/united-kingdom/sources.json` and re-run it.

Research status: **researched**. 0 source(s) to check or due, 0 coming up, 31 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=united-kingdom`.

## Revenue figures and national-total parts

- [ ] **HMRC Annual Report and Accounts 2025 to 2026: Trust Statement** – HM Revenue and Customs
  - URL: https://www.gov.uk/government/publications/hmrc-annual-report-and-accounts-2025-to-2026/hmrcs-annual-report-and-accounts-2025-to-2026-our-accounts-and-annexes
  - Feeds: national-total parts: `hmrc-taxes-2025-26`; revenue of 16 core(s): `uk-income-tax`, `uk-national-insurance`, `uk-vat`, `uk-corporation-tax`, `uk-capital-gains-tax`, `uk-fuel-duty`, `uk-stamp-taxes`, `uk-alcohol-duties`, …; legal/rate basis of 2 node(s)
  - Status: current – next edition expected 2027-07; figures end 2026-03-31. Published n/a, accessed 2026-10-10, covers Year ended 31 March 2026.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Statement of revenue and Notes 2 and 3: tax revenue by type (£bn, one decimal). Accrual measure, different from the cash receipts bulletin (£937.8 billion).

- [ ] **Public finances databank – September 2026** – Office for Budget Responsibility
  - URL: https://obr.uk/data/
  - Feeds: national-total parts: `vehicle-excise-duty-2025-26`, `council-tax-2025-26`; revenue of 2 core(s): `uk-vehicle-excise-duty`, `uk-council-tax`; legal/rate basis of 1 node(s)
  - Status: current – figures end 2026-03-31. Published n/a, accessed 2026-10-10, covers 1999-00 to 2025-26 outturn.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Sheet "Receipts (£bn)": vehicle excise duties 9.03 and council tax 50.44 for 2025-26. Data cube downloaded from the Data page.

- [ ] **National non-domestic rates collected by local authorities in England 2025 to 2026** – Ministry of Housing, Communities and Local Government
  - URL: https://www.gov.uk/government/statistics/national-non-domestic-rates-collected-by-councils-in-england-2025-to-2026/national-non-domestic-rates-collected-by-local-authorities-in-england-2025-to-2026
  - Feeds: national-total parts: `business-rates-england-2025-26`; revenue of 1 core(s): `uk-business-rates`; legal/rate basis of 1 node(s)
  - Status: current – next edition expected 2027-07; figures end 2026-03-31. Published 2026-07-22, accessed 2026-10-10, covers 2025 to 2026.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.

- [ ] **Scottish Income Tax Outturn Statistics: 2024 to 2025** – HM Revenue and Customs
  - URL: https://www.gov.uk/government/statistics/scottish-income-tax-outturn-statistics-2024-to-2025/scottish-income-tax-outturn-statistics-2024-to-2025
  - Feeds: revenue of 3 core(s): `uk-scottish-income-tax`, `uk-lbtt`, `uk-ltt`; legal/rate basis of 1 node(s)
  - Status: current – figures end 2026-03-31. Published 2026-07-09, accessed 2026-10-10, covers 2024 to 2025.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Non-savings, non-dividend income tax paid by Scottish taxpayers: £18.6 billion in 2024 to 2025. Already included in the UK income tax.


## Harmonised OECD layer

- [ ] **Revenue Statistics 2025, Table 6.37: United Kingdom, tax revenues by sub-sectors of government** – OECD
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

- [ ] **World Observatory on Subnational Government Finance and Investment – country profile: United Kingdom** – OECD and United Cities and Local Governments (SNG-WOFI)
  - URL: https://www.sng-wofi.org/country_profiles/united_kingdom.html
  - Feeds: `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2022-10-24, accessed 2026-09-29, covers 2020.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Subnational government revenue by category as % of total subnational revenue, 2022 edition.


## Rate and guidance pages

- [ ] **Welsh Revenue Authority collects almost £400 million tax revenue for Wales** – Welsh Revenue Authority
  - URL: https://www.gov.wales/welsh-revenue-authority-collects-almost-400-million-tax-revenue-wales
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10, covers 2025-26.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: Land transaction tax: £378.0 million in 2025-26 according to the WRA statistics dataset.

- [ ] **Income Tax rates and Personal Allowances** – GOV.UK
  - URL: https://www.gov.uk/income-tax-rates
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10, covers 2026-27.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: England, Wales and Northern Ireland, 2026-27: 20% to £50,270, 40% to £125,140, 45% above; Personal Allowance £12,570.

- [ ] **Rates and thresholds for employers 2026 to 2027** – GOV.UK
  - URL: https://www.gov.uk/guidance/rates-and-thresholds-for-employers-2026-to-2027
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10, covers 2026-27.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: Class 1: employees 8% (to £50,270) and 2% above; employers 15% above £5,000.


## Legal texts

- [ ] **2024-25 provisional outturn briefing note** – Scottish Government
  - URL: https://www.gov.scot/publications/2024-25-provisional-outturn-briefing-note-24-june-2025/pages/2/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published 2025-06-24, accessed 2026-10-10, covers 2024-25.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: Land and buildings transaction tax: provisional outturn £899.2 million in 2024-25.

- [ ] **Income Tax Act 2007** – legislation.gov.uk
  - URL: https://www.legislation.gov.uk/ukpga/2007/3/contents
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Social Security Contributions and Benefits Act 1992** – legislation.gov.uk
  - URL: https://www.legislation.gov.uk/ukpga/1992/4/contents
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Value Added Tax Act 1994** – legislation.gov.uk
  - URL: https://www.legislation.gov.uk/ukpga/1994/23/contents
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Corporation Tax Act 2010** – legislation.gov.uk
  - URL: https://www.legislation.gov.uk/ukpga/2010/4/contents
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Taxation of Chargeable Gains Act 1992** – legislation.gov.uk
  - URL: https://www.legislation.gov.uk/ukpga/1992/12/contents
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Hydrocarbon Oil Duties Act 1979** – legislation.gov.uk
  - URL: https://www.legislation.gov.uk/ukpga/1979/5/contents
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Finance Act 2003 (Part 4: Stamp duty land tax)** – legislation.gov.uk
  - URL: https://www.legislation.gov.uk/ukpga/2003/14/contents
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Tobacco Products Duty Act 1979** – legislation.gov.uk
  - URL: https://www.legislation.gov.uk/ukpga/1979/7/contents
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Finance Act 1994 (insurance premium tax; air passenger duty)** – legislation.gov.uk
  - URL: https://www.legislation.gov.uk/ukpga/1994/9/contents
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Inheritance Tax Act 1984** – legislation.gov.uk
  - URL: https://www.legislation.gov.uk/ukpga/1984/51/contents
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Customs and Excise Management Act 1979** – legislation.gov.uk
  - URL: https://www.legislation.gov.uk/ukpga/1979/2/contents
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Betting and Gaming Duties Act 1981** – legislation.gov.uk
  - URL: https://www.legislation.gov.uk/ukpga/1981/63/contents
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Finance Act 2016 (Part 6: Apprenticeship levy)** – legislation.gov.uk
  - URL: https://www.legislation.gov.uk/ukpga/2016/24/contents
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Vehicle Excise and Registration Act 1994** – legislation.gov.uk
  - URL: https://www.legislation.gov.uk/ukpga/1994/22/contents
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Local Government Finance Act 1992 (council tax)** – legislation.gov.uk
  - URL: https://www.legislation.gov.uk/ukpga/1992/14/contents
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Local Government Finance Act 1988 (non-domestic rating)** – legislation.gov.uk
  - URL: https://www.legislation.gov.uk/ukpga/1988/41/contents
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Scotland Act 2016** – legislation.gov.uk
  - URL: https://www.legislation.gov.uk/ukpga/2016/11/contents
  - Feeds: legal/rate basis of 3 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Wales Act 2014** – legislation.gov.uk
  - URL: https://www.legislation.gov.uk/ukpga/2014/29/contents
  - Feeds: legal/rate basis of 3 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Land and Buildings Transaction Tax (Scotland) Act 2013** – legislation.gov.uk
  - URL: https://www.legislation.gov.uk/asp/2013/11/contents
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.


## Context and cross-checks

- [ ] **HMRC tax receipts and National Insurance contributions for the UK (annual bulletin)** – HM Revenue and Customs
  - URL: https://www.gov.uk/government/statistics/hmrc-tax-and-nics-receipts-for-the-uk/hmrc-tax-receipts-and-national-insurance-contributions-for-the-uk-new-annual-bulletin
  - Feeds: cross-check
  - Status: no publication date. Published n/a, accessed 2026-10-10, covers 2025 to 2026.
  - To do: Context only: re-open if a related figure or rule changes.
  - Note: Cash receipts of £937.8 billion (30.7% of GDP); used as a cross-check of the accrual figures.

