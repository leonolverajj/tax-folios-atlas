# Update checklist – United States

Generated 2026-09-29 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/united-states/sources.json` and re-run it.

Research status: **researched**. 2 source(s) to check or due, 0 coming up, 36 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=united-states`.

## Revenue figures and national-total parts

- [ ] **Monthly Treasury Statement (MTS), September 2025 – Table 4 Receipts of the United States Government (fiscal year to date = FY2025)** – U.S. Department of the Treasury, Bureau of the Fiscal Service
  - URL: https://fiscaldata.treasury.gov/datasets/monthly-treasury-statement/receipts-of-the-u-s-government
  - Feeds: national-total parts: `federal-total-receipts`; revenue of 8 core(s): `fed-individual-income-tax`, `fed-corporate-income-tax`, `fed-social-security`, `fed-medicare`, `fed-unemployment-insurance`, `fed-excise-taxes`, `fed-estate-gift`, `fed-customs-duties`
  - Status: current – figures end 2025-09-30. Published n/a, accessed 2026-09-28, covers FY2025 (1 Oct 2024 – 30 Sep 2025).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Read through the Fiscal Data API (accounting/mts/mts_table_4, record_fiscal_year 2025, month 09; 'current_fytd_net_rcpt_amt'). Dataset page shows the publisher's 'last updated' date (25 Sep 2026 for the August 2026 statement); FY2026 was not complete at the date checked.

- [ ] **Annual Survey of State Government Tax Collections (STC), FY2024 – flat file (US totals by tax item, $ thousands)** – U.S. Census Bureau
  - URL: https://www.census.gov/data/tables/2024/econ/stc/2024-annual.html
  - Feeds: national-total parts: `state-tax-collections`; revenue of 9 core(s): `state-individual-income-tax`, `state-general-sales-tax`, `state-corporate-income-tax`, `state-motor-fuel-tax`, `state-selective-excise`, `state-property-tax`, `state-license-taxes`, `state-severance-tax`, …
  - Status: **CHECK** – figures end 2024-06-30 (27 months ago); a newer edition may exist (record `nextExpected` in sources.json once you know). Published 2025-04-15, accessed 2026-09-28, covers FY2024 (state fiscal years ending 1 Jul 2023 – 30 Jun 2024).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Flat file: https://www2.census.gov/programs-surveys/stc/datasets/2024/FY2024-Flat-File.txt. Amounts in thousands of dollars.

- [ ] **2024 Annual Survey of State and Local Government Finances – Individual Unit Files (tax items T01–T99 by government type)** – U.S. Census Bureau
  - URL: https://www.census.gov/programs-surveys/gov-finances/data/datasets.html
  - Feeds: national-total parts: `local-tax-revenue`; revenue of 6 core(s): `local-property-tax`, `local-sales-tax`, `local-income-taxes`, `local-selective-sales`, `local-license-taxes`, `local-other-taxes`
  - Status: **CHECK** – figures end 2024-06-30 (27 months ago); a newer edition may exist (record `nextExpected` in sources.json once you know). Published 2026-08-04, accessed 2026-09-28, covers FY2024 (fiscal years ending 1 Jul 2023 – 30 Jun 2024).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: File: https://www2.census.gov/programs-surveys/gov-finances/tables/2024/2024_Individual_Unit_Files.zip (last modified 4 Aug 2026). Local totals are the sum over counties, municipalities, townships, special districts and school districts (government-type digit 1–5 of the unit ID); state totals reproduce the published STC values exactly.


## Harmonised OECD layer

- [ ] **Revenue Statistics 2025, Table 6.38: United States, tax revenues by sub-sectors of government** – OECD
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

- [ ] **World Observatory on Subnational Government Finance and Investment – country profile: United States of America** – OECD and United Cities and Local Governments (SNG-WOFI)
  - URL: https://www.sng-wofi.org/country_profiles/united_states_of_america.html
  - Feeds: `structure.json` (cross-country profile)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2022-10-24, accessed 2026-09-29, covers 2020.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Subnational government revenue by category (tax revenue, grants and subsidies, tariffs and fees, property income, other) as % of total subnational revenue, 2022 edition.


## Rate and guidance pages

- [ ] **Federal income tax rates and brackets** – Internal Revenue Service
  - URL: https://www.irs.gov/filing/federal-income-tax-rates-and-brackets
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28, covers Current.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.

- [ ] **IRS releases tax inflation adjustments for tax year 2026, including amendments from the One, Big, Beautiful Bill** – Internal Revenue Service
  - URL: https://www.irs.gov/newsroom/irs-releases-tax-inflation-adjustments-for-tax-year-2026-including-amendments-from-the-one-big-beautiful-bill
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28, covers Tax year 2026.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: Seven rates 10/12/22/24/32/35/37% made permanent; 2026 standard deduction $16,100 single, $32,200 joint.

- [ ] **Contribution and Benefit Base** – Social Security Administration
  - URL: https://www.ssa.gov/oact/cola/cbb.html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28, covers 2026: $184,500.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.

- [ ] **Topic no. 751, Social Security and Medicare withholding rates** – Internal Revenue Service
  - URL: https://www.irs.gov/taxtopics/tc751
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.

- [ ] **USTR Takes Action in Forced Labor Section 301 Investigations** – Office of the U.S. Trade Representative
  - URL: https://ustr.gov/about/policy-offices/press-office/press-releases/2026/july/ustr-takes-action-forced-labor-section-301-investigations
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 2026-07-24, accessed 2026-09-28.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: Publication date approximate (July 2026 press release). Duties of 10% or 12.5% on 60 economies; see also the Federal Register notice of 28 Jul 2026.

- [ ] **State Individual Income Tax Rates and Brackets, 2026** – Tax Foundation
  - URL: https://taxfoundation.org/data/all/state/state-income-tax-rates-2026/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28, covers 1 Jan 2026.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: Non-governmental reference used only to summarise how state rates differ; each state's statute is authoritative.

- [ ] **State and Local Sales Tax Rates, 2026** – Tax Foundation
  - URL: https://taxfoundation.org/data/all/state/sales-tax-rates/
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28, covers 1 Jan 2026.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: Non-governmental reference used only to summarise how state and local rates differ.


## Legal texts

- [ ] **State Government Tax Collections: 2024 Technical Documentation (tax item codes T01–T99)** – U.S. Census Bureau
  - URL: https://www2.census.gov/programs-surveys/stc/technical-documentation/complete-technical-documentation/statetaxtechdoc2024.pdf
  - Feeds: legal/rate basis of 4 node(s)
  - Status: current – last checked 2026-09-28. Published 2025-04-15, accessed 2026-09-28, covers FY2024.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: Defines T01 Property, T09 General sales, T10–T19 selective sales, T20–T29 licenses, T40 Individual income, T41 Corporation net income, T50 Death and gift, T51 Documentary and stock transfer, T53 Severance, T99 NEC.

- [ ] **United States Code, Title 26 – Internal Revenue Code** – Office of the Law Revision Counsel, U.S. House of Representatives
  - URL: https://uscode.house.gov/browse/prelim@title26
  - Feeds: legal/rate basis of 7 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: Cited by section: §1 (individual rates), §11 (corporate rate), §§3101, 3111, 1401 (FICA/SECA), §§3301–3302 (FUTA), §4081 (fuels), Subtitle E (alcohol, tobacco), §2001 (estate tax), §2502 (gift tax).

- [ ] **United States Code, Title 19 – Customs Duties** – Office of the Law Revision Counsel, U.S. House of Representatives
  - URL: https://uscode.house.gov/browse/prelim@title19
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: Includes §1202 (Harmonized Tariff Schedule), §1862 (Section 232), §2132 (Section 122), §2411 (Section 301).

- [ ] **Harmonized Tariff Schedule of the United States (HTSUS)** – U.S. International Trade Commission
  - URL: https://hts.usitc.gov/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Learning Resources, Inc. v. Trump, No. 24-1287 (opinion of 20 February 2026)** – Supreme Court of the United States
  - URL: https://www.supremecourt.gov/opinions/25pdf/24-1287_4gcj.pdf
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 2026-02-20, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: Held (6–3) that IEEPA does not authorise the President to impose tariffs.

- [ ] **Actions by the United States in the Investigations Under Section 301 of the Trade Act of 1974 … Prohibition on the Importation of Goods Produced With Forced Labor** – Federal Register
  - URL: https://www.federalregister.gov/documents/2026/07/28/2026-15274/actions-by-the-united-states-in-the-investigations-under-section-301-of-the-trade-act-of-1974-of-the
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 2026-07-28, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Constitution Annotated – Article I, Section 8 (power to lay and collect taxes, duties, imposts and excises)** – Congress.gov (Library of Congress)
  - URL: https://constitution.congress.gov/browse/article-1/section-8/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Constitution Annotated – Sixteenth Amendment (income taxes without apportionment)** – Congress.gov (Library of Congress)
  - URL: https://constitution.congress.gov/browse/amendment-16/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Constitution Annotated – Tenth Amendment (powers reserved to the states)** – Congress.gov (Library of Congress)
  - URL: https://constitution.congress.gov/browse/amendment-10/
  - Feeds: legal/rate basis of 3 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **South Dakota v. Wayfair, Inc., 585 U.S. 162 (2018)** – Supreme Court of the United States
  - URL: https://www.supremecourt.gov/opinions/17pdf/17-494_j4el.pdf
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-09-28. Published 2018-06-21, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: Allows states to require out-of-state sellers without physical presence to collect sales tax (economic nexus).

- [ ] **California Revenue and Taxation Code (Personal Income Tax Law; Corporation Tax Law)** – California Legislative Information
  - URL: https://leginfo.legislature.ca.gov/faces/codesTOCSelected.xhtml?tocCode=RTC&tocTitle=+Revenue+and+Taxation+Code+-+RTC
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Texas Tax Code, Chapter 151 – Limited Sales, Excise, and Use Tax** – Texas Legislature (Texas Statutes)
  - URL: https://statutes.capitol.texas.gov/Docs/TX/htm/TX.151.htm
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Texas Tax Code, Chapter 162 – Fuels Tax** – Texas Legislature (Texas Statutes)
  - URL: https://statutes.capitol.texas.gov/Docs/TX/htm/TX.162.htm
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Texas Tax Code, Chapter 154 – Cigarette Tax** – Texas Legislature (Texas Statutes)
  - URL: https://statutes.capitol.texas.gov/Docs/TX/htm/TX.154.htm
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Texas Tax Code, Chapter 202 – Oil Production Tax** – Texas Legislature (Texas Statutes)
  - URL: https://statutes.capitol.texas.gov/Docs/TX/htm/TX.202.htm
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Texas Tax Code, Title 1 – Property Tax Code** – Texas Legislature (Texas Statutes)
  - URL: https://statutes.capitol.texas.gov/Docs/TX/htm/TX.1.htm
  - Feeds: legal/rate basis of 3 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Texas Tax Code, Chapter 321 – Municipal Sales and Use Tax Act** – Texas Legislature (Texas Statutes)
  - URL: https://statutes.capitol.texas.gov/Docs/TX/htm/TX.321.htm
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ohio Revised Code, Chapter 718 – Municipal Income Tax** – Ohio Laws and Administrative Rules
  - URL: https://codes.ohio.gov/ohio-revised-code/chapter-718
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **New York Tax Law, Article 31 – Real Estate Transfer Tax** – New York State Senate (NY Consolidated Laws)
  - URL: https://www.nysenate.gov/legislation/laws/TAX/A31
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **California Constitution, Article XIII A (Proposition 13 – limits on property tax)** – California Legislative Information
  - URL: https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?lawCode=CONS&article=XIII+A
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.


## Context and cross-checks

- [ ] **2024 Annual Survey of State and Local Government Finances – Methodology** – U.S. Census Bureau
  - URL: https://www2.census.gov/programs-surveys/gov-finances/tables/2024/2024_methodology.pdf
  - Feeds: cross-check
  - Status: published 2026-07-29. Published 2026-07-29, accessed 2026-09-28, covers FY2024.
  - To do: Context only: re-open if a related figure or rule changes.
  - Note: Explains sampling of local governments, imputation and coverage of the estimates.

- [ ] **Revenue Procedure 2025-32 (tax year 2026 inflation adjustments)** – Internal Revenue Service
  - URL: https://www.irs.gov/pub/irs-drop/rp-25-32.pdf
  - Feeds: cross-check
  - Status: no publication date. Published n/a, accessed 2026-09-28, covers Tax year 2026.
  - To do: Context only: re-open if a related figure or rule changes.

- [ ] **Tax Rates – state tax rate tables** – Federation of Tax Administrators
  - URL: https://taxadmin.org/tax-rates-new/
  - Feeds: cross-check
  - Status: no publication date. Published n/a, accessed 2026-09-28.
  - To do: Context only: re-open if a related figure or rule changes.
  - Note: Association of state revenue agencies; tables link to each state's rates.


## Known gaps and moving rules (revisit first)

- `fed-customs-duties` is **transitional**: The IEEPA tariffs behind the FY2025 increase were ended on 24 February 2026 after the Supreme Court's ruling of 20 February 2026 (Learning Resources v. Trump). A temporary Section 122 surcharge (24 Feb–24 Jul 2026) was replaced in late July 2026 by Section 301 'forced-labour' duties of 10% or 12.5% on 60 economies; Section 232 sectoral tariffs continue. Refunds of IEEPA duties are being litigated.
