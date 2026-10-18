# Update checklist – Finland

Generated 2026-10-18 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/finland/sources.json` and re-run it.

Research status: **researched**. 0 source(s) to check or due, 0 coming up, 22 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=finland`.

## Revenue figures and national-total parts

- [ ] **Verot ja veronluonteiset maksut 2025 (taxes and tax-like payments 2025, EUR million)** – Finnish Taxpayers’ Association (Veronmaksajat), from Statistics Finland
  - URL: https://www.veronmaksajat.fi/tutkimus-ja-tilastot/suomen-verot-ja-menot/verotuotot/
  - Feeds: national-total parts: `state-taxes-2025`, `municipal-taxes-2025`, `social-contributions-2025`; revenue of 19 core(s): `fi-state-income-tax`, `fi-corporate-tax`, `fi-interest-withholding`, `fi-inheritance-gift-tax`, `fi-transfer-tax`, `fi-vat`, `fi-energy-taxes`, `fi-alcohol-tax`, …; legal/rate basis of 19 node(s)
  - Status: current – next edition expected 2027-06; figures end 2025-12-31. Published 2026-06-08, accessed 2026-10-11, covers Calendar year 2025.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: The table lists every tax and tax-like payment of the national accounts with a total of EUR 119,523 million; its source line is "Tilastokeskus; Veronmaksajat". This is a secondary compilation of Statistics Finland’s data.


## Harmonised OECD layer

- [ ] **Revenue Statistics 2025, Table 6.11: Finland, tax revenues by sub-sectors of government** – OECD
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

- [ ] **World Observatory on Subnational Government Finance and Investment – country profile: Finland** – OECD and United Cities and Local Governments (SNG-WOFI)
  - URL: https://www.sng-wofi.org/country_profiles/finland.html
  - Feeds: `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2022-10-24, accessed 2026-09-29, covers 2020.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Subnational government revenue by category as % of total subnational revenue, 2022 edition.


## Rate and guidance pages

- [ ] **Rates of VAT** – Finnish Tax Administration (Vero)
  - URL: https://www.vero.fi/en/businesses-and-corporations/taxes-and-charges/vat/rates-of-vat/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: From 1 January 2026: 25.5% standard rate, 13.5% (previously 14%) and 10%.

- [ ] **Income tax of limited liability companies and cooperatives** – Finnish Tax Administration (Vero)
  - URL: https://www.vero.fi/en/businesses-and-corporations/taxes-and-charges/limited-companies-and-cooperatives/income-tax/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: The corporate income tax rate is 20% for 2025 and 2026. The Tax Administration’s news of 17 September 2026 reports a government proposal to lower it to 18%; the proposal was not law when read.

- [ ] **Taxation of earned income** – Ministry of Finance (Finland)
  - URL: https://vm.fi/en/taxation-of-earned-income
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: Municipal tax rates 4.7%–10.9% and an average of 7.54% in 2025; church tax 1.00%–2.25%. The page returned a bot challenge to the browser, so these figures were read in a search summary of the page and are unverified at the source.

- [ ] **Finland, individual: other taxes (transfer tax, real estate tax)** – PwC Worldwide Tax Summaries
  - URL: https://taxsummaries.pwc.com/finland/individual/other-taxes
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: Transfer tax 3% on real property and 1.5% on shares and securities; property tax rate bands. A secondary source.


## Legal texts

- [ ] **Constitution of Finland (Suomen perustuslaki 731/1999)** – Ministry of Justice (Finlex)
  - URL: https://www.finlex.fi/fi/lainsaadanto/1999/731
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Income Tax Act (Tuloverolaki 1535/1992)** – Ministry of Justice (Finlex)
  - URL: https://www.finlex.fi/fi/lainsaadanto/1992/1535
  - Feeds: legal/rate basis of 3 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Act on the Taxation of Business Profits and Income from Professional Activities (360/1968)** – Ministry of Justice (Finlex)
  - URL: https://www.finlex.fi/fi/lainsaadanto/1968/360
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Value Added Tax Act (Arvonlisäverolaki 1501/1993)** – Ministry of Justice (Finlex)
  - URL: https://www.finlex.fi/fi/lainsaadanto/1993/1501
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Real Property Tax Act (Kiinteistöverolaki 654/1992)** – Ministry of Justice (Finlex)
  - URL: https://www.finlex.fi/fi/lainsaadanto/1992/654
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Transfer Tax Act (Varainsiirtoverolaki 931/1996)** – Ministry of Justice (Finlex)
  - URL: https://www.finlex.fi/fi/lainsaadanto/1996/931
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Inheritance and Gift Tax Act (Perintö- ja lahjaverolaki 378/1940)** – Ministry of Justice (Finlex)
  - URL: https://www.finlex.fi/fi/lainsaadanto/1940/378
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Alcoholic Beverages Tax Act (Alkoholijuomaverolaki 1471/1994)** – Ministry of Justice (Finlex)
  - URL: https://www.finlex.fi/fi/lainsaadanto/1994/1471
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Tobacco Tax Act (Tupakkaverolaki 1470/1994)** – Ministry of Justice (Finlex)
  - URL: https://www.finlex.fi/fi/lainsaadanto/1994/1470
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Act on Excise Duty on Electricity and Certain Fuels (1260/1996)** – Ministry of Justice (Finlex)
  - URL: https://www.finlex.fi/fi/lainsaadanto/1996/1260
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Vehicle Tax Act (Ajoneuvoverolaki 1281/2003)** – Ministry of Justice (Finlex)
  - URL: https://www.finlex.fi/fi/lainsaadanto/2003/1281
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Car Tax Act (Autoverolaki 1482/1994)** – Ministry of Justice (Finlex)
  - URL: https://www.finlex.fi/fi/lainsaadanto/1994/1482
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Employees Pensions Act (Työntekijän eläkelaki 395/2006)** – Ministry of Justice (Finlex)
  - URL: https://www.finlex.fi/fi/lainsaadanto/2006/395
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Health Insurance Act (Sairausvakuutuslaki 1224/2004)** – Ministry of Justice (Finlex)
  - URL: https://www.finlex.fi/fi/lainsaadanto/2004/1224
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

