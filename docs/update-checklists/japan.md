# Update checklist – Japan

Generated 2026-09-29 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/japan/sources.json` and re-run it.

Research status: **researched**. 1 source(s) to check or due, 1 coming up, 28 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=japan`.

## Revenue figures and national-total parts

- [ ] **令和7年度 8年5月末 租税及び印紙収入、収入額調 (FY2025 tax and stamp revenue, preliminary settlement)** – Ministry of Finance Japan (財務省)
  - URL: https://www.mof.go.jp/tax_policy/reference/taxes_and_stamp_revenues/202605.pdf
  - Feeds: national-total parts: `national-general-account-tax`; revenue of 12 core(s): `nat-income-tax`, `nat-corporation-tax`, `nat-consumption-tax`, `nat-inheritance-gift`, `nat-liquor-tax`, `nat-tobacco-tax`, `nat-gasoline-tax`, `nat-petroleum-coal-tax`, …
  - Status: current – figures end 2026-03-31. Published 2026-07-03, accessed 2026-09-28, covers FY2025 (1 Apr 2025 – 31 Mar 2026).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: General-account tax and stamp revenue by tax, ¥ million, 決算額(概数) = preliminary settlement (total ¥84,222,606 million, announced 3 Jul 2026). The Japan Times/Jiji report the same total as ¥84,222.6 billion.

- [ ] **令和8年版 地方財政白書 – 資料編 第11表・第13表 (Local Public Finance White Paper 2026: revenue and local tax tables, FY2024 settlement)** – Ministry of Internal Affairs and Communications (総務省)
  - URL: https://www.soumu.go.jp/menu_seisaku/hakusyo/chihou/r08data/2026data/r08czs01-02.html
  - Feeds: national-total parts: `prefectural-tax-total`, `municipal-tax-total`; revenue of 12 core(s): `pref-inhabitant-tax`, `pref-enterprise-tax`, `pref-local-consumption-tax`, `pref-automobile-tax`, `pref-diesel-tax`, `pref-real-estate-acquisition-tax`, `pref-tobacco-tax`, `mun-inhabitant-tax`, …
  - Status: soon – figures end 2025-03-31 (18 months ago). Published n/a, accessed 2026-09-28, covers FY2024 (1 Apr 2024 – 31 Mar 2025) settlement.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: CSV tables s-011-1 (revenue), s-013-1 (local tax summary), s-013-2 (prefectural taxes), s-013-4 (municipal taxes), amounts in ¥ million. Prefecture and municipality totals are 'net' of overlaps; Tokyo collects municipal-type taxes for its 23 special wards and reports them in the prefecture column.

- [ ] **令和5(2023)年度 社会保障費用統計 – 概要 (Social Security Expenditure Statistics FY2023)** – National Institute of Population and Social Security Research (国立社会保障・人口問題研究所)
  - URL: https://www.ipss.go.jp/ss-cost/j/fsss-R05/fsss_R05.html
  - Feeds: national-total parts: `social-insurance-premiums`; revenue of 1 core(s): `nat-social-insurance`
  - Status: **CHECK** – figures end 2024-03-31 (30 months ago); a newer edition may exist (record `nextExpected` in sources.json once you know). Published 2025-07-29, accessed 2026-09-28, covers FY2023 (1 Apr 2023 – 31 Mar 2024).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Social insurance contributions ¥80,110.1 billion (insured persons ¥42,022.5 bn + employers ¥38,087.6 bn), ILO standard. Latest edition available at the check date.


## Harmonised OECD layer

- [ ] **Revenue Statistics 2025, Table 6.20: Japan, tax revenues by sub-sectors of government** – OECD
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

- [ ] **World Observatory on Subnational Government Finance and Investment – country profile: Japan** – OECD and United Cities and Local Governments (SNG-WOFI)
  - URL: https://www.sng-wofi.org/country_profiles/japan.html
  - Feeds: `structure.json` (cross-country profile)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2022-10-24, accessed 2026-09-29, covers 2019.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Subnational government revenue by category (tax revenue, grants and subsidies, tariffs and fees, property income, other) as % of total subnational revenue, 2022 edition.


## Rate and guidance pages

- [ ] **令和8年度税制改正の大綱の概要 (FY2026 Tax Reform Outline, Cabinet decision of 26 December 2025)** – Ministry of Finance Japan (財務省)
  - URL: https://www.mof.go.jp/tax_policy/tax_reform/outline/fy2026/08taikou_gaiyou.htm
  - Feeds: legal/rate basis of 3 node(s)
  - Status: current – last checked 2026-09-28. Published 2025-12-26, accessed 2026-09-28.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: Creates the defence special income tax from 1 Jan 2027 (1%), cuts the reconstruction surtax from 2.1% to 1% and extends it to 2047, and indexes the basic deduction to prices.

- [ ] **防衛力強化に係る財源確保のための税制措置 (令和7年度税制改正)** – Ministry of Finance Japan (財務省)
  - URL: https://www.mof.go.jp/tax_policy/publication/brochure/zeisei2025/05.html
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-09-28. Published 2025-03-31, accessed 2026-09-28.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: Defence special corporation tax from 1 Apr 2026 (4% of corporation tax above ¥5 million); tobacco tax steps from 2026–2029.

- [ ] **揮発油税等の特例税率の廃止について** – National Tax Agency (国税庁)
  - URL: https://www.nta.go.jp/information/other/data/r07/kihatsu/index.htm
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: Abolition of the special (provisional) rate of the gasoline tax and local gasoline tax on 31 December 2025.

- [ ] **軽油引取税の当分の間税率（旧暫定税率）の廃止について** – Tokyo Metropolitan Bureau of Taxation (東京都主税局)
  - URL: https://www.tax.metro.tokyo.lg.jp/information/update/r8/04/20260401
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 2026-04-01, accessed 2026-09-28.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: Abolition of the provisional rate of the prefectural diesel delivery tax on 1 April 2026 (¥32.1 to ¥15 per litre).

- [ ] **社会保険制度 (Employees' Pension Insurance, Health Insurance, Long-term Care and Employment Insurance)** – Ministry of Health, Labour and Welfare (厚生労働省)
  - URL: https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/iryouhoken/index.html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: Ministry overview pages for the social-insurance schemes; premium rates are set by each scheme's statute (Health Insurance Act, Employees' Pension Insurance Act, Employment Insurance Act, Long-Term Care Insurance Act).


## Legal texts

- [ ] **日本国憲法 (Constitution of Japan) – arts. 30, 84, 92–94** – e-Gov Law Search (Digital Agency)
  - URL: https://laws.e-gov.go.jp/law/321CONSTITUTION
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **所得税法 (Income Tax Act, Act No. 33 of 1965)** – e-Gov Law Search (Digital Agency)
  - URL: https://laws.e-gov.go.jp/law/340AC0000000033
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **法人税法 (Corporation Tax Act, Act No. 34 of 1965)** – e-Gov Law Search (Digital Agency)
  - URL: https://laws.e-gov.go.jp/law/340AC0000000034
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **消費税法 (Consumption Tax Act, Act No. 108 of 1988)** – e-Gov Law Search (Digital Agency)
  - URL: https://laws.e-gov.go.jp/law/363AC0000000108
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **相続税法 (Inheritance Tax Act, Act No. 73 of 1950) – covers inheritance and gift tax** – e-Gov Law Search (Digital Agency)
  - URL: https://laws.e-gov.go.jp/law/325AC0000000073
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **酒税法 (Liquor Tax Act, Act No. 6 of 1953)** – e-Gov Law Search (Digital Agency)
  - URL: https://laws.e-gov.go.jp/law/328AC0000000006
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **たばこ税法 (Tobacco Tax Act, Act No. 72 of 1984)** – e-Gov Law Search (Digital Agency)
  - URL: https://laws.e-gov.go.jp/law/359AC0000000072
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **揮発油税法 (Gasoline Tax Act, Act No. 55 of 1957)** – e-Gov Law Search (Digital Agency)
  - URL: https://laws.e-gov.go.jp/law/332AC0000000055
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **石油石炭税法 (Petroleum and Coal Tax Act, Act No. 25 of 1978)** – e-Gov Law Search (Digital Agency)
  - URL: https://laws.e-gov.go.jp/law/353AC0000000025
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **自動車重量税法 (Motor Vehicle Tonnage Tax Act, Act No. 89 of 1971)** – e-Gov Law Search (Digital Agency)
  - URL: https://laws.e-gov.go.jp/law/346AC0000000089
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **関税法 (Customs Act, Act No. 61 of 1954)** – e-Gov Law Search (Digital Agency)
  - URL: https://laws.e-gov.go.jp/law/329AC0000000061
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **関税定率法 (Customs Tariff Law, Act No. 54 of 1910)** – e-Gov Law Search (Digital Agency)
  - URL: https://laws.e-gov.go.jp/law/343AC0000000054
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **印紙税法 (Stamp Tax Act, Act No. 23 of 1967)** – e-Gov Law Search (Digital Agency)
  - URL: https://laws.e-gov.go.jp/law/342AC0000000023
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **東日本大震災からの復興のための施策を実施するために必要な財源の確保に関する特別措置法 (Act No. 117 of 2011) – reconstruction special income tax** – e-Gov Law Search (Digital Agency)
  - URL: https://laws.e-gov.go.jp/law/423AC0000000117
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **防衛力強化に必要な財源の確保に関する特別措置法 (Act No. 69 of 2023) – defence special corporation tax** – e-Gov Law Search (Digital Agency)
  - URL: https://laws.e-gov.go.jp/law/505AC0000000069
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 2023-06-16, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **地方税法 (Local Tax Act, Act No. 226 of 1950)** – e-Gov Law Search (Digital Agency)
  - URL: https://laws.e-gov.go.jp/law/325AC0000000226
  - Feeds: legal/rate basis of 14 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **地方自治法 (Local Autonomy Act, Act No. 67 of 1947)** – e-Gov Law Search (Digital Agency)
  - URL: https://laws.e-gov.go.jp/law/322AC0000000067
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.


## Known gaps and moving rules (revisit first)

- `nat-defense-corporate-tax`: In force only from 1 April 2026; no full-year revenue has been published yet.
- `nat-defense-income-tax`: Takes effect on 1 January 2027; no revenue yet.
- `nat-gasoline-tax` is **transitional**: The special (provisional) rate of the gasoline tax and local gasoline tax was abolished on 31 December 2025. FY2025 revenue includes nine months at the old rate; later years will be lower.
- `nat-defense-income-tax` is **scheduled**: Takes effect on 1 January 2027 (FY2026 tax reform outline).
- `pref-diesel-tax` is **transitional**: The provisional rate of ¥32.1 per litre was abolished on 1 April 2026, leaving ¥15 per litre; the revenue shown is for FY2024 at the old rate.
