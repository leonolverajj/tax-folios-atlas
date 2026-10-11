# Update checklist – South Korea

Generated 2026-10-11 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/south-korea/sources.json` and re-run it.

Research status: **researched**. 1 source(s) to check or due, 2 coming up, 30 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=south-korea`.

## Revenue figures and national-total parts

- [ ] **NABO Focus No. 137: 2025 national tax revenue results and the causes of changes by tax (2025년 국세수입 실적 및 세목별 증감원인)** – National Assembly Budget Office (NABO)
  - URL: https://www.nabo.go.kr/board/file/down.do?fid=33319105
  - Feeds: national-total parts: `national-taxes-2025`; revenue of 12 core(s): `kr-income-tax`, `kr-corporate-tax`, `kr-vat`, `kr-inheritance-gift-tax`, `kr-tee-tax`, `kr-individual-consumption-tax`, `kr-customs`, `kr-comprehensive-real-estate-tax`, …; legal/rate basis of 9 node(s)
  - Status: current – next edition expected 2027-02; figures end 2025-12-31. Published 2026-02-12, accessed 2026-10-11, covers Calendar year 2025.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Table 1 gives the 2025 actual revenue of each national tax in trillion won (income tax 130.5, corporate tax 84.6, VAT 79.2, …, “other” 25.7). The text gives the rural special tax as 9.2 trillion won and the comprehensive real estate tax as 4.7. “Other” covers stamp tax, prior-year revenue, education tax, liquor tax, rural special tax and so on.

- [ ] **Announcement of provisional 2025 local tax revenue (2025년 지방세 수입 잠정 실적 발표)** – Ministry of the Interior and Safety (행정안전부)
  - URL: https://www.korea.kr/briefing/pressReleaseView.do?newsId=156745656
  - Feeds: national-total parts: `local-taxes-2025`; revenue of 11 core(s): `kr-acquisition-tax`, `kr-local-consumption-tax`, `kr-local-income-tax`, `kr-property-tax`, `kr-car-tax`, `kr-local-education-tax`, `kr-tobacco-consumption-tax`, `kr-resident-tax`, …
  - Status: **DUE** – the next edition was expected 2026-10; figures end 2025-12-31. Published 2026-02-24, accessed 2026-10-11, covers Calendar year 2025 (provisional).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Annex table: revenue of each local tax in 2024 and 2025 (unit: 10 billion won). Total 120,900 billion won in 2025. The ministry says the final per-tax figures will be published in October 2026 on Local Finance 365 (www.lofin365.go.kr): replace the 2025 figures when they appear.

- [ ] **Collection rates of the four social insurances by year (4대보험 연도별 징수율 현황)** – National Health Insurance Service (국민건강보험공단)
  - URL: https://www.nhis.or.kr/announce/wbhaec11402m01.do
  - Feeds: national-total parts: `social-insurance-4-2025`; revenue of 4 core(s): `kr-national-pension`, `kr-health-insurance`, `kr-employment-insurance`, `kr-industrial-accident-insurance`
  - Status: soon – next edition expected 2026-11; figures end 2025-12-31. Published 2026-06-30, accessed 2026-10-11, covers Calendar year 2025 (data as of 30 June 2026 for the table’s latest row).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Billed amount and collected amount (KRW million) of health insurance, national pension, employment insurance and industrial accident insurance. Collected = current-year plus arrears. The table is refreshed quarterly; the next update is announced for 30 November 2026.

- [ ] **Long-term care insurance: collection rates by year (장기요양 연도별 징수율 현황)** – National Health Insurance Service (국민건강보험공단)
  - URL: https://www.nhis.or.kr/announce/wbhaec11506m01.do
  - Feeds: national-total parts: `ltc-insurance-2025`; revenue of 1 core(s): `kr-long-term-care-insurance`
  - Status: soon – next edition expected 2026-11; figures end 2025-12-31. Published 2026-06-30, accessed 2026-10-11, covers Calendar year 2025.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Billed (11,229,429) and collected (11,162,408) long-term care premiums in 2025, KRW million.


## Harmonised OECD layer

- [ ] **Revenue Statistics 2025, Table 6.21: Korea, tax revenues by sub-sectors of government** – OECD
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

- [ ] **World Observatory on Subnational Government Finance and Investment – country profile: Korea** – OECD and United Cities and Local Governments (SNG-WOFI)
  - URL: https://www.sng-wofi.org/country_profiles/korea.html
  - Feeds: `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2022-10-24, accessed 2026-09-29, covers 2020.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Subnational government revenue by category as % of total subnational revenue, 2022 edition.


## Rate and guidance pages

- [ ] **[Issue check] National tax revenue 373.9 trillion won last year: three years of weak revenue** – Today Finance Media (news report of the ministry’s figures)
  - URL: https://www.tfmedia.co.kr/mobile/article.html?no=201360
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published 2026-02-10, accessed 2026-10-11, covers Calendar year 2025.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: A press report, not an official table. It is the only source read for the 2025 education tax revenue of 5.7 trillion won; it should be replaced by the ministry’s table by tax when that is read.


## Legal texts

- [ ] **Examination progress and highlights of the 2025 Tax Act revision (2025년 개정세법 심의 결과 및 주요 내용)** – National Assembly Budget Office (NABO)
  - URL: https://www.nabo.go.kr/board/file/down.do?fid=33319000
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-11. Published 2025-12-17, accessed 2026-10-11, covers Tax law changes applying from 1 January 2026.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: Table 13: corporate tax rates 9/19/21/24% (2025) rise to 10/20/22/25% from 2026. Table 18: education tax on financial and insurance companies’ revenue 0.5%, 1.0% on revenue above 1 trillion won from 2026. Table 9: separate taxation of dividends of high-dividend companies, 14%–30%, from dividends paid in 2026.

- [ ] **Constitution of the Republic of Korea (대한민국헌법)** – Ministry of Government Legislation (Republic of Korea)
  - URL: https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EB%8C%80%ED%95%9C%EB%AF%BC%EA%B5%AD%ED%97%8C%EB%B2%95
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Income Tax Act (소득세법)** – Ministry of Government Legislation (Republic of Korea)
  - URL: https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EC%86%8C%EB%93%9D%EC%84%B8%EB%B2%95
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Corporate Tax Act (법인세법)** – Ministry of Government Legislation (Republic of Korea)
  - URL: https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EB%B2%95%EC%9D%B8%EC%84%B8%EB%B2%95
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Value-Added Tax Act (부가가치세법)** – Ministry of Government Legislation (Republic of Korea)
  - URL: https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EB%B6%80%EA%B0%80%EA%B0%80%EC%B9%98%EC%84%B8%EB%B2%95
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Individual Consumption Tax Act (개별소비세법)** – Ministry of Government Legislation (Republic of Korea)
  - URL: https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EA%B0%9C%EB%B3%84%EC%86%8C%EB%B9%84%EC%84%B8%EB%B2%95
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Transportation, Energy and Environment Tax Act (교통ㆍ에너지ㆍ환경세법)** – Ministry of Government Legislation (Republic of Korea)
  - URL: https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EA%B5%90%ED%86%B5%E3%86%8D%EC%97%90%EB%84%88%EC%A7%80%E3%86%8D%ED%99%98%EA%B2%BD%EC%84%B8%EB%B2%95
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Securities Transaction Tax Act (증권거래세법)** – Ministry of Government Legislation (Republic of Korea)
  - URL: https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EC%A6%9D%EA%B6%8C%EA%B1%B0%EB%9E%98%EC%84%B8%EB%B2%95
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Inheritance Tax and Gift Tax Act (상속세 및 증여세법)** – Ministry of Government Legislation (Republic of Korea)
  - URL: https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EC%83%81%EC%86%8D%EC%84%B8%20%EB%B0%8F%20%EC%A6%9D%EC%97%AC%EC%84%B8%EB%B2%95
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Comprehensive Real Estate Holding Tax Act (종합부동산세법)** – Ministry of Government Legislation (Republic of Korea)
  - URL: https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EC%A2%85%ED%95%A9%EB%B6%80%EB%8F%99%EC%82%B0%EC%84%B8%EB%B2%95
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Customs Act (관세법)** – Ministry of Government Legislation (Republic of Korea)
  - URL: https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EA%B4%80%EC%84%B8%EB%B2%95
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Special Tax for Rural Development Act (농어촌특별세법)** – Ministry of Government Legislation (Republic of Korea)
  - URL: https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EB%86%8D%EC%96%B4%EC%B4%8C%ED%8A%B9%EB%B3%84%EC%84%B8%EB%B2%95
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Education Tax Act (교육세법)** – Ministry of Government Legislation (Republic of Korea)
  - URL: https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EA%B5%90%EC%9C%A1%EC%84%B8%EB%B2%95
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Liquor Tax Act (주세법)** – Ministry of Government Legislation (Republic of Korea)
  - URL: https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EC%A3%BC%EC%84%B8%EB%B2%95
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Stamp Tax Act (인지세법)** – Ministry of Government Legislation (Republic of Korea)
  - URL: https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EC%9D%B8%EC%A7%80%EC%84%B8%EB%B2%95
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Local Tax Act (지방세법)** – Ministry of Government Legislation (Republic of Korea)
  - URL: https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EC%A7%80%EB%B0%A9%EC%84%B8%EB%B2%95
  - Feeds: legal/rate basis of 12 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **National Pension Act (국민연금법)** – Ministry of Government Legislation (Republic of Korea)
  - URL: https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EA%B5%AD%EB%AF%BC%EC%97%B0%EA%B8%88%EB%B2%95
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **National Health Insurance Act (국민건강보험법)** – Ministry of Government Legislation (Republic of Korea)
  - URL: https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EA%B5%AD%EB%AF%BC%EA%B1%B4%EA%B0%95%EB%B3%B4%ED%97%98%EB%B2%95
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Act on Long-Term Care Insurance for Senior Citizens (노인장기요양보험법)** – Ministry of Government Legislation (Republic of Korea)
  - URL: https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EB%85%B8%EC%9D%B8%EC%9E%A5%EA%B8%B0%EC%9A%94%EC%96%91%EB%B3%B4%ED%97%98%EB%B2%95
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Employment Insurance Act (고용보험법)** – Ministry of Government Legislation (Republic of Korea)
  - URL: https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EA%B3%A0%EC%9A%A9%EB%B3%B4%ED%97%98%EB%B2%95
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Industrial Accident Compensation Insurance Act (산업재해보상보험법)** – Ministry of Government Legislation (Republic of Korea)
  - URL: https://www.law.go.kr/%EB%B2%95%EB%A0%B9/%EC%82%B0%EC%97%85%EC%9E%AC%ED%95%B4%EB%B3%B4%EC%83%81%EB%B3%B4%ED%97%98%EB%B2%95
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.


## Context and cross-checks

- [ ] **Closing of the 2025 fiscal year: total revenue and expenditure (2025회계연도 총세입·총세출 마감 결과 발표)** – Ministry of Finance and Economy (재정경제부)
  - URL: https://www.korea.kr/briefing/pressReleaseView.do?newsId=156743929
  - Feeds: cross-check
  - Status: published 2026-02-10. Published 2026-02-10, accessed 2026-10-11, covers Fiscal year 2025.
  - To do: Context only: re-open if a related figure or rule changes.
  - Note: Gives national tax revenue of 373.9 trillion won (336.5 trillion in 2024) inside total revenue of 597.9 trillion won. It does not give the split by tax.

