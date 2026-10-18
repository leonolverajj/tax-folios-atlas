# Update checklist – Estonia

Generated 2026-10-18 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/estonia/sources.json` and re-run it.

Research status: **researched**. 0 source(s) to check or due, 0 coming up, 16 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=estonia`.

## Revenue figures and national-total parts

- [ ] **Data on Taxation Trends: National Tax Lists (NTL), edition 2026** – European Commission, DG Taxation and Customs Union, with Eurostat
  - URL: https://taxation-customs.ec.europa.eu/taxation/economic-analysis/data-taxation-trends_en
  - Feeds: national-total parts: `riik-taxes-2024`, `riik-social-2024`, `kov-taxes-2024`; revenue of 21 core(s): `ee-income-tax-persons`, `ee-corporate-income-tax-distributions`, `ee-corporate-income-tax-benefits`, `ee-vat`, `ee-customs-duty`, `ee-excise-alcohol`, `ee-excise-tobacco`, `ee-excise-fuel`, …; legal/rate basis of 8 node(s)
  - Status: current – next edition expected 2027-03; figures end 2024-12-31. Published 2026-03-31, accessed 2026-10-12, covers Calendar year 2024 (series from 1995).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Workbook "NTL edition 2026 web.xlsx", sheet EE: every tax and social contribution by its national name and ESA code, in EUR million, for general government plus EU institutions. Data cut-off 30 October 2025.


## Harmonised OECD layer

- [ ] **Revenue Statistics 2025, Table 6.10: Estonia, tax revenues by sub-sectors of government** – OECD
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

- [ ] **World Observatory on Subnational Government Finance and Investment – country profile: Estonia** – OECD and United Cities and Local Governments (SNG-WOFI)
  - URL: https://www.sng-wofi.org/country_profiles/estonia.html
  - Feeds: `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2022-10-24, accessed 2026-09-29, covers 2019.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Subnational government revenue by category as % of total subnational revenue, 2022 edition.


## Rate and guidance pages

- [ ] **Tax rates (income tax, social tax, funded pension, unemployment insurance, VAT), 2024–2026** – Estonian Tax and Customs Board (EMTA)
  - URL: https://www.emta.ee/en/private-client/taxes-and-payment/declaration-income/tax-rates
  - Feeds: legal/rate basis of 6 node(s)
  - Status: current – last checked 2026-10-12. Published 2025-11-11, accessed 2026-10-12, covers 2024 to 2026.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: Rates by year: income tax 20% (2024), 22% (2025, 2026); corporate 20/80 (2024), 22/78 (2025–); social tax 33%; unemployment insurance 1.6% and 0.8%; VAT 24% standard.

- [ ] **Social tax** – Estonian Tax and Customs Board (EMTA)
  - URL: https://www.emta.ee/en/business-client/taxes-and-payment/income-and-social-taxes/social-tax
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-12. Published n/a, accessed 2026-10-12.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.

- [ ] **Unemployment insurance premiums** – Estonian Tax and Customs Board (EMTA)
  - URL: https://www.emta.ee/en/business-client/taxes-and-payment/income-and-social-taxes/unemployment-insurance-premiums
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-12. Published n/a, accessed 2026-10-12.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.

- [ ] **VAT rates and supply exempt from tax** – Estonian Tax and Customs Board (EMTA)
  - URL: https://www.emta.ee/en/business-client/taxes-and-payment/value-added-tax/vat-rates-and-supply-exempt-tax
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-12. Published n/a, accessed 2026-10-12.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: VAT rates 24%, 13%, 9% and 0%; the standard rate is 24% from 1 July 2025.

- [ ] **Excise duty on alcohol** – Estonian Tax and Customs Board (EMTA)
  - URL: https://www.emta.ee/en/business-client/taxes-and-payment/excise-duties/alcohol
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-12. Published n/a, accessed 2026-10-12.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.

- [ ] **Excise duty on tobacco products** – Estonian Tax and Customs Board (EMTA)
  - URL: https://www.emta.ee/en/business-client/taxes-and-payment/excise-duties/tobacco-products
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-12. Published n/a, accessed 2026-10-12.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.

- [ ] **Excise duty on fuel and electricity** – Estonian Tax and Customs Board (EMTA)
  - URL: https://www.emta.ee/en/business-client/taxes-and-payment/excise-duties/fuel-and-electricity
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-12. Published n/a, accessed 2026-10-12.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.

- [ ] **Gambling tax** – Estonian Tax and Customs Board (EMTA)
  - URL: https://www.emta.ee/en/business-client/taxes-and-payment/other-taxes-and-claims/gambling-tax
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-12. Published n/a, accessed 2026-10-12.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.

- [ ] **Customs duty** – Estonian Tax and Customs Board (EMTA)
  - URL: https://www.emta.ee/en/business-client/customs-trade-goods/taxation-goods/customs-duty
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-12. Published n/a, accessed 2026-10-12.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.

- [ ] **Land tax** – Estonian Tax and Customs Board (EMTA)
  - URL: https://www.emta.ee/en/private-client/taxes-and-payment/other-taxes/land-tax
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-12. Published n/a, accessed 2026-10-12.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: Land tax is a state tax imposed by the Land Tax Act and paid in full to the budget of the local authority; rates are set by the local government.

- [ ] **Road user charge** – Estonian Tax and Customs Board (EMTA)
  - URL: https://www.emta.ee/en/private-client/taxes-and-payment/other-taxes/road-user-charge
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-12. Published n/a, accessed 2026-10-12.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.


## Legal texts

- [ ] **Main national accounts tax aggregates (gov_10a_taxag)** – Eurostat
  - URL: https://ec.europa.eu/eurostat/databrowser/view/gov_10a_taxag/default/table
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-12. Published 2026-07-21, accessed 2026-10-12, covers Calendar year 2024.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: Taxes and social contributions by sub-sector and ESA item; used to place each tax at a level and to check the totals of the National Tax List.

