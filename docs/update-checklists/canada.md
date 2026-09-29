# Update checklist – Canada

Generated 2026-09-29 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/canada/sources.json` and re-run it.

Research status: **researched**. 2 source(s) to check or due, 2 coming up, 45 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=canada`.

## Revenue figures and national-total parts

- [ ] **Public Accounts of Canada 2025, Volume II, Section 1 – Consolidated statement of revenues and expenses** – Receiver General for Canada (Public Services and Procurement Canada)
  - URL: https://www.tpsgc-pwgsc.gc.ca/recgen/cpc-pac/2025/vol2/s1/ecrc-csre-eng.html
  - Feeds: national-total parts: `federal-tax-contributions`; revenue of 10 core(s): `fed-personal-income-tax`, `fed-corporate-income-tax`, `fed-non-resident-tax`, `fed-gst-hst`, `fed-fuel-excise`, `fed-excise-duties`, `fed-atsc`, `fed-customs-duties`, …
  - Status: soon – figures end 2025-03-31 (18 months ago). Published 2025-11-07, accessed 2026-09-28, covers FY2024-25 (1 Apr 2024 – 31 Mar 2025).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Line-by-line revenues in $ thousands; used for every federal tax core and for the federal denominator.

- [ ] **Table 10-10-0017-01 Canadian government finance statistics for the provincial and territorial governments** – Statistics Canada
  - URL: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1010001701
  - Feeds: national-total parts: `provincial-tax-contributions`; revenue of 9 core(s): `prov-personal-income-tax`, `prov-corporate-income-tax`, `prov-sales-taxes`, `prov-payroll-taxes`, `prov-property-taxes`, `prov-fuel-taxes`, `prov-sin-taxes`, `prov-wcb-premiums`, …
  - Status: soon – figures end 2025-03-31 (18 months ago). Published 2025-11-21, accessed 2026-09-28, covers 2024 reference year (fiscal years ending closest to 31 Dec 2024; all provinces and territories: FY ended 31 Mar 2025).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: CSV downloaded and summed across the 13 jurisdictions for 'Transactions and other economic flows' rows (the CSV repeats each flow under 'Stocks', which must not be added).

- [ ] **Table 10-10-0020-01 Canadian government finance statistics for municipalities and other local public administrations** – Statistics Canada
  - URL: https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=1010002001
  - Feeds: national-total parts: `local-tax-contributions`; revenue of 5 core(s): `mun-property-taxes`, `mun-land-transfer-tax`, `mun-licences-permits`, `mun-accommodation-tax`, `mun-user-fees`
  - Status: **CHECK** – figures end 2024-12-31 (21 months ago); a newer edition may exist (record `nextExpected` in sources.json once you know). Published 2025-11-21, accessed 2026-09-28, covers 2024 reference year (local-government fiscal year, generally the 2024 calendar year).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: CSV downloaded and summed across the 13 jurisdictions for 'Transactions and other economic flows' rows.

- [ ] **Annual report of the Canada Pension Plan for the fiscal year ending March 31, 2024** – Employment and Social Development Canada
  - URL: https://www.canada.ca/en/employment-social-development/programs/pensions/reports/annual-2024.html
  - Feeds: national-total parts: `cpp-contributions`; revenue of 1 core(s): `fed-cpp`
  - Status: **CHECK** – figures end 2024-03-31 (30 months ago); a newer edition may exist (record `nextExpected` in sources.json once you know). Published n/a, accessed 2026-09-28, covers FY ended 31 Mar 2024.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: States: 'In the fiscal year ending March 31, 2024, CPP contributions totalled $81.6 billion.' The FY2024-25 report was not yet available at the check date.


## Harmonised OECD layer

- [ ] **Revenue Statistics 2025, Table 6.4: Canada, tax revenues by sub-sectors of government** – OECD
  - URL: https://www.oecd.org/en/publications/revenue-statistics-2025_3a264267-en/full-report/tax-revenues-by-subsectors-of-general-government_f9e88332.html
  - Feeds: `structure.json` (cross-country profile)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2025-12-09, accessed 2026-09-29, covers Calendar year 2023 (national currency).
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Harmonised OECD classification of taxes (1000–6000) split by collecting sub-sector of general government. Used for the cross-country profile and for parts of the national total that have no national-source breakdown.

- [ ] **Revenue Statistics 2025, Chapter 3: Tax levels and tax structures (Tables 3.1 and 3.4)** – OECD
  - URL: https://www.oecd.org/en/publications/revenue-statistics-2025_3a264267-en/full-report/tax-levels-and-tax-structures-1965-2024_2033f3ea.html
  - Feeds: `structure.json` (cross-country profile)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2025-12-09, accessed 2026-09-29, covers Calendar year 2023.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Total tax revenue as % of GDP and tax structure as % of total taxation, for all OECD members.

- [ ] **World Observatory on Subnational Government Finance and Investment – country profile: Canada** – OECD and United Cities and Local Governments (SNG-WOFI)
  - URL: https://www.sng-wofi.org/country_profiles/canada.html
  - Feeds: `structure.json` (cross-country profile)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2022-10-24, accessed 2026-09-29, covers 2020.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Subnational government revenue by category (tax revenue, grants and subsidies, tariffs and fees, property income, other) as % of total subnational revenue, 2022 edition.


## Rate and guidance pages

- [ ] **Current year tax rates and income brackets (2026) – Personal income tax** – Canada Revenue Agency
  - URL: https://www.canada.ca/en/revenue-agency/services/tax/individuals/tax-rates-brackets/current-year.html
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28, covers 2026 tax year.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: Continuously updated CRA page; see its 'Date modified'.

- [ ] **Corporation tax rates** – Canada Revenue Agency
  - URL: https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/corporations/corporation-tax-rates.html
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28, covers Current.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: Federal basic rate 38%, 28% after abatement, 15% after the general reduction, 9% with the small business deduction; also lists provincial rates.

- [ ] **GST/HST – place of supply rules and rates by province** – Canada Revenue Agency
  - URL: https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/charge-collect-place-supply.html
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28, covers Current (Nova Scotia HST 14% from 1 Apr 2025).
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.

- [ ] **CPP contribution rates, maximums and exemptions** – Canada Revenue Agency
  - URL: https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/canada-pension-plan-cpp/cpp-contribution-rates-maximums-exemptions.html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28, covers 2026.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: 2026: YMPE $74,600; YAMPE $85,000; base+first additional 11.9% combined; CPP2 4% each.

- [ ] **EI premium rates and maximums** – Canada Revenue Agency
  - URL: https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/employment-insurance-ei/ei-premium-rates-maximums.html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28, covers 2026.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: 2026: employee 1.63%, employer 1.4x, maximum insurable earnings $68,900 (Québec employee rate 1.30%).

- [ ] **Air Travellers Security Charge (ATSC) Rates** – Canada Revenue Agency
  - URL: https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/atscrates/air-travellers-security-charge-atsc-rates.html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28, covers Rates effective 1 May 2024.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.

- [ ] **The Government of Canada extends the federal fuel excise tax relief on gasoline, diesel and aviation fuels for Canadians** – Department of Finance Canada
  - URL: https://www.canada.ca/en/department-finance/news/2026/09/the-government-of-canada-extends-the-federal-fuel-excise-tax-relief-on-gasoline-diesel-and-aviation-fuels-for-canadians.html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 2026-09-02, accessed 2026-09-28, covers Suspension from 20 Apr 2026; extension to 31 Jan 2027, 50% rates 1 Feb–31 Mar 2027.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: Legislative proposals introduced, not enacted at the date checked.

- [ ] **Legislation passes to implement measures from the Spring Economic Update 2026** – Department of Finance Canada
  - URL: https://www.canada.ca/en/department-finance/news/2026/06/legislation-passes-to-implement-measures-from-the-spring-economic-update-2026.html
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-09-28. Published 2026-06-19, accessed 2026-09-28, covers Bill C-30 (Royal Assent 18 Jun 2026).
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: Enacts the reduction of the base CPP contribution rate from 9.9% to 9.5% starting 2027 and the temporary fuel excise suspension.

- [ ] **Removing the consumer carbon price, effective April 1, 2025** – Department of Finance Canada
  - URL: https://www.canada.ca/en/department-finance/news/2025/03/removing-the-consumer-carbon-price-effective-april-1-2025.html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28, covers Effective 1 Apr 2025.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: Published March 2025; exact day not shown in the page extract.

- [ ] **Customs Tariff – tariff and duty information** – Canada Border Services Agency
  - URL: https://www.cbsa-asfc.gc.ca/trade-commerce/tariff-tarif/menu-eng.html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.


## Legal texts

- [ ] **Constitution Act, 1867 (ss. 91–92A, 109)** – Department of Justice Canada
  - URL: https://laws-lois.justice.gc.ca/eng/Const/page-1.html
  - Feeds: legal/rate basis of 7 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Income Tax Act (R.S.C., 1985, c. 1 (5th Supp.))** – Department of Justice Canada
  - URL: https://laws-lois.justice.gc.ca/eng/acts/i-3.3/
  - Feeds: legal/rate basis of 3 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Excise Tax Act (R.S.C., 1985, c. E-15)** – Department of Justice Canada
  - URL: https://laws-lois.justice.gc.ca/eng/acts/e-15/
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Excise Act, 2001 (S.C. 2002, c. 22)** – Department of Justice Canada
  - URL: https://laws-lois.justice.gc.ca/eng/acts/e-14.1/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Customs Tariff (S.C. 1997, c. 36)** – Department of Justice Canada
  - URL: https://laws-lois.justice.gc.ca/eng/acts/c-54.011/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Air Travellers Security Charge Act (S.C. 2002, c. 9, s. 5)** – Department of Justice Canada
  - URL: https://laws-lois.justice.gc.ca/eng/acts/A-10.5/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Employment Insurance Act (S.C. 1996, c. 23)** – Department of Justice Canada
  - URL: https://laws-lois.justice.gc.ca/eng/acts/e-5.6/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Canada Pension Plan (R.S.C., 1985, c. C-8)** – Department of Justice Canada
  - URL: https://laws-lois.justice.gc.ca/eng/acts/c-8/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Bill C-30 (45th Parliament, 1st Session) – Spring Economic Update 2026 Implementation Act** – Parliament of Canada
  - URL: https://www.parl.ca/DocumentViewer/en/45-1/bill/C-30/first-reading
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 2026-04-28, accessed 2026-09-28, covers Royal Assent 18 Jun 2026.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Greenhouse Gas Pollution Pricing Act (S.C. 2018, c. 12, s. 186)** – Department of Justice Canada
  - URL: https://laws-lois.justice.gc.ca/eng/acts/g-11.55/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Taxation Act, 2007 (Ontario)** – Government of Ontario (e-Laws)
  - URL: https://www.ontario.ca/laws/statute/07t11
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Taxation Act (Québec, chapter I-3)** – Government of Québec (Légis Québec)
  - URL: https://www.legisquebec.gouv.qc.ca/fr/document/lc/I-3?langCont=en
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Act respecting the Québec sales tax (chapter T-0.1)** – Government of Québec (Légis Québec)
  - URL: https://www.legisquebec.gouv.qc.ca/fr/document/lc/T-0.1?langCont=en
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Provincial Sales Tax Act (SBC 2012, c. 35)** – Government of British Columbia (BC Laws)
  - URL: https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/12035_01
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Employer Health Tax Act (R.S.O. 1990, c. E.11)** – Government of Ontario (e-Laws)
  - URL: https://www.ontario.ca/laws/statute/90e11
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Land Transfer Tax Act (R.S.O. 1990, c. L.6)** – Government of Ontario (e-Laws)
  - URL: https://www.ontario.ca/laws/statute/90l06
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Gasoline Tax Act (R.S.O. 1990, c. G.5)** – Government of Ontario (e-Laws)
  - URL: https://www.ontario.ca/laws/statute/90g05
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Tobacco Tax Act (R.S.O. 1990, c. T.10)** – Government of Ontario (e-Laws)
  - URL: https://www.ontario.ca/laws/statute/90t10
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Assessment Act (R.S.O. 1990, c. A.31)** – Government of Ontario (e-Laws)
  - URL: https://www.ontario.ca/laws/statute/90a31
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Municipal Act, 2001 (Ontario)** – Government of Ontario (e-Laws)
  - URL: https://www.ontario.ca/laws/statute/01m25
  - Feeds: legal/rate basis of 4 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **City of Toronto Act, 2006 (Ontario)** – Government of Ontario (e-Laws)
  - URL: https://www.ontario.ca/laws/statute/06c11
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Development Charges Act, 1997 (Ontario)** – Government of Ontario (e-Laws)
  - URL: https://www.ontario.ca/laws/statute/97d27
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Act respecting municipal taxation (Québec, chapter F-2.1)** – Government of Québec (Légis Québec)
  - URL: https://www.legisquebec.gouv.qc.ca/fr/document/lc/F-2.1?langCont=en
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Act respecting duties on transfers of immovables (Québec, chapter D-15.1)** – Government of Québec (Légis Québec)
  - URL: https://www.legisquebec.gouv.qc.ca/fr/document/lc/D-15.1?langCont=en
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Workers Compensation Act (RSBC 2019, c. 1)** – Government of British Columbia (BC Laws)
  - URL: https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/19001_00
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.


## Context and cross-checks

- [ ] **Public Accounts of Canada 2025, Volume I, Section 3 – Revenues, expenses and accumulated deficit (Tables 3.1–3.2)** – Receiver General for Canada (Public Services and Procurement Canada)
  - URL: https://www.tpsgc-pwgsc.gc.ca/recgen/cpc-pac/2025/vol1/s3/rvnu-eng.html
  - Feeds: cross-check
  - Status: published 2025-11-07. Published 2025-11-07, accessed 2026-09-28, covers FY2024-25 (1 Apr 2024 – 31 Mar 2025).
  - To do: Context only: re-open if a related figure or rule changes.
  - Note: Summary tables used to cross-check Volume II (tax revenues $416,705 million; total revenues $510,951 million).

- [ ] **Annual Financial Report of the Government of Canada – Fiscal Year 2024–2025** – Department of Finance Canada
  - URL: https://www.canada.ca/en/department-finance/services/publications/annual-financial-report/2025.html
  - Feeds: cross-check
  - Status: published 2025-11-07. Published 2025-11-07, accessed 2026-09-28, covers FY2024-25.
  - To do: Context only: re-open if a related figure or rule changes.
  - Note: Explains that the fuel charge was $13.5 billion of $13.6 billion pollution pricing proceeds and that Digital Services Tax revenue was zero.

- [ ] **The Daily — Consolidated Canadian Government Finance Statistics, 2024** – Statistics Canada
  - URL: https://www150.statcan.gc.ca/n1/daily-quotidien/251121/dq251121b-eng.htm
  - Feeds: cross-check
  - Status: published 2025-11-21. Published 2025-11-21, accessed 2026-09-28, covers 2024 reference year.
  - To do: Context only: re-open if a related figure or rule changes.
  - Note: Defines the reference year: 'the end of the fiscal year closest to December 31'; federal FY2024/25 is reported as 2024.


## Known gaps and moving rules (revisit first)

- `mun-development-charges`: Statistics Canada does not identify development charges as a separate line in its local-government revenue table; they are reported within other revenue categories.
- `fed-fuel-excise` is **transitional**: Temporarily suspended since 20 April 2026 (enacted by Bill C-30 to 7 Sep 2026); an extension to 31 Jan 2027 with 50% rates until 31 Mar 2027 was announced 2 Sep 2026 and was still at the legislative-proposal stage when checked.
- `fed-fuel-charge` is **historical**: Repealed in effect: all fuel-charge rates were set to zero from 1 April 2025. The revenue shown is for FY2024-25, when the charge was still collected.
