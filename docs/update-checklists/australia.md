# Update checklist – Australia

Generated 2026-10-12 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/australia/sources.json` and re-run it.

Research status: **researched**. 0 source(s) to check or due, 0 coming up, 23 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=australia`.

## Revenue figures and national-total parts

- [ ] **Taxation Revenue, Australia, 2024-25 financial year (data cube 55060DO001)** – Australian Bureau of Statistics
  - URL: https://www.abs.gov.au/statistics/economy/government/taxation-revenue-australia/latest-release
  - Feeds: national-total parts: `commonwealth-taxes-2024-25`, `state-taxes-2024-25`, `local-taxes-2024-25`; revenue of 18 core(s): `au-personal-income-tax`, `au-medicare-levy`, `au-fringe-benefits-tax`, `au-company-tax`, `au-super-fund-tax`, `au-withholding-nonresidents`, `au-gst`, `au-excise`, …; legal/rate basis of 5 node(s)
  - Status: current – next edition expected 2027-04; figures end 2025-06-30. Published 2026-04-21, accessed 2026-10-10, covers Fiscal year to 30 June 2025.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Table 1 (Commonwealth) and Table 10 (all states, state and local government), $ million. Headline: all levels $838,974 million, 30.2% of GDP.


## Harmonised OECD layer

- [ ] **Revenue Statistics 2025, Table 6.1: Australia, tax revenues by sub-sectors of government** – OECD
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

- [ ] **World Observatory on Subnational Government Finance and Investment – country profile: Australia** – OECD and United Cities and Local Governments (SNG-WOFI)
  - URL: https://www.sng-wofi.org/country_profiles/australia.html
  - Feeds: `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2022-10-24, accessed 2026-09-29, covers 2020.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Subnational government revenue by category as % of total subnational revenue, 2022 edition.


## Rate and guidance pages

- [ ] **Tax rates – Australian resident** – Australian Taxation Office
  - URL: https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-10. Published 2026-08-13, accessed 2026-10-10.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: Resident rates for 2026–27: 15% from $18,201 to $45,000, 30% to $135,000, 37% to $190,000, 45% above; the Medicare levy of 2% is on top.

- [ ] **Medicare levy** – Australian Taxation Office
  - URL: https://www.ato.gov.au/individuals-and-families/medicare-and-private-health-insurance/medicare-levy
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.

- [ ] **Company tax rates** – Australian Taxation Office
  - URL: https://www.ato.gov.au/tax-rates-and-codes/company-tax-rates
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published 2026-03-19, accessed 2026-10-10.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.

- [ ] **Fringe benefits tax – rates and thresholds** – Australian Taxation Office
  - URL: https://www.ato.gov.au/tax-rates-and-codes/fringe-benefits-tax-rates-and-thresholds
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published 2026-05-20, accessed 2026-10-10.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: The FBT rate is 47% for the FBT years from 31 March 2023 to 31 March 2027.

- [ ] **Key super rates and thresholds** – Australian Taxation Office
  - URL: https://www.ato.gov.au/tax-rates-and-codes/key-superannuation-rates-and-thresholds
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published 2025-08-27, accessed 2026-10-10.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.

- [ ] **Excise duty rates for fuel and petroleum products** – Australian Taxation Office
  - URL: https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/excise-on-fuel-and-petroleum-products/excise-duty-rates-for-fuel-and-petroleum-products
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.

- [ ] **Excise duty rates for alcohol** – Australian Taxation Office
  - URL: https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/excise-on-alcohol/excise-duty-rates-for-alcohol
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.

- [ ] **Excise duty rates for tobacco** – Australian Taxation Office
  - URL: https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/tobacco-and-excise/excise-duty-rates-for-tobacco
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.

- [ ] **Payroll tax thresholds and rates** – Revenue NSW
  - URL: https://www.revenue.nsw.gov.au/taxes-duties-levies-royalties/payroll-tax/lodge-and-pay-returns/thresholds-and-rates
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: New South Wales, one of eight jurisdictions: 5.45% above an annual threshold of $1,200,000 in 2026-27.

- [ ] **Land tax thresholds and rates** – Revenue NSW
  - URL: https://www.revenue.nsw.gov.au/taxes-duties-levies-royalties/land-tax/understanding-land-tax/thresholds-and-rates
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.

- [ ] **How to calculate transfer duty** – Revenue NSW
  - URL: https://www.revenue.nsw.gov.au/taxes-duties-levies-royalties/transfer-duty/understanding-transfer-duty/calculate-transfer-duty
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: New South Wales sliding scale up to $5.50 per $100 (premium duty $7 per $100 above $3.87 million) for 2026-27.


## Legal texts

- [ ] **Commonwealth of Australia Constitution Act (ss. 51, 90, 96, 107)** – Parliament of Australia
  - URL: https://peo.gov.au/understand-our-parliament/how-parliament-works/the-australian-constitution/the-australian-constitution-online
  - Feeds: legal/rate basis of 5 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Income Tax Assessment Act 1997 (Cth)** – Federal Register of Legislation
  - URL: https://www.legislation.gov.au/C2004A05138/latest
  - Feeds: legal/rate basis of 3 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Income Tax Assessment Act 1936 (Cth)** – Federal Register of Legislation
  - URL: https://www.legislation.gov.au/C1936A00027/latest
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Income Tax Rates Act 1986 (Cth)** – Federal Register of Legislation
  - URL: https://www.legislation.gov.au/C2004A03348/latest
  - Feeds: legal/rate basis of 3 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: Sets the rates of income tax for individuals, companies and withholding; the 2026-27 resident table (15% first bracket) is in Schedule 7.

- [ ] **A New Tax System (Goods and Services Tax) Act 1999 (Cth)** – Federal Register of Legislation
  - URL: https://www.legislation.gov.au/C2004A00446/latest
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Fringe Benefits Tax Assessment Act 1986 (Cth)** – Federal Register of Legislation
  - URL: https://www.legislation.gov.au/C2004A03280/latest
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Customs Tariff Act 1995 (Cth)** – Federal Register of Legislation
  - URL: https://www.legislation.gov.au/Series/C2004A04997
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Local Government Act 1993 (NSW)** – NSW Parliamentary Counsel
  - URL: https://legislation.nsw.gov.au/view/html/inforce/current/act-1993-030
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

