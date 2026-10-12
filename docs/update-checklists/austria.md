# Update checklist – Austria

Generated 2026-10-12 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/austria/sources.json` and re-run it.

Research status: **partial**. 3 source(s) to check or due, 0 coming up, 12 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=austria`.

## Revenue figures and national-total parts

- [ ] **Revenue Statistics 2025, Table 6.2: Austria, tax revenues by sub-sectors of government** – OECD
  - URL: https://www.oecd.org/en/publications/revenue-statistics-2025_3a264267-en/full-report/tax-revenues-by-subsectors-of-general-government_f9e88332.html
  - Feeds: national-total parts: `laender-taxes-2023`, `gemeinden-taxes-2023`; `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: **CHECK** – figures end 2023-12-31 (34 months ago); a newer edition may exist (record `nextExpected` in sources.json once you know). Published 2025-12-09, accessed 2026-09-29, covers Calendar year 2023 (national currency).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Harmonised OECD classification of taxes (1000–6000) split by collecting sub-sector of general government.

- [ ] **Abgabenerfolg des Bundes (UG 16), Dezember 2025** – Federal Ministry of Finance (Austria)
  - URL: https://service.bmf.gv.at/budget/akthh/2025/202512_HTML_UG16_F.htm
  - Feeds: national-total parts: `bund-taxes-2025`; revenue of 19 core(s): `at-wage-tax`, `at-income-tax`, `at-capital-income-tax`, `at-corporate-tax`, `at-bank-levy`, `at-other-income-wealth-taxes`, `at-vat`, `at-tobacco-tax`, …; legal/rate basis of 19 node(s)
  - Status: current – next edition expected 2027-01; figures end 2025-12-31. Published 2026-01-22, accessed 2026-10-11, covers Calendar year 2025 (preliminary).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Gross receipts by tax, January to December 2025, in EUR million: wage tax 37,832.6, VAT 40,177.1, corporation tax 11,859.7, capital income tax 6,705.9, income tax 5,094.9, mineral oil tax 3,687.2 and so on; transfers (Ab-Überweisungen) of EUR 45,971.9 million; net EUR 73,764.8 million.

- [ ] **Bundesrechnungsabschluss für das Jahr 2025, Band 2: Untergliederungen** – Court of Audit (Rechnungshof Österreich)
  - URL: https://www.parlament.gv.at/dokument/XXVIII/III/356/imfname_1767372.pdf
  - Feeds: national-total parts: `flaf-2025`, `alv-2025`; revenue of 2 core(s): `at-family-fund-levy`, `at-unemployment-insurance`; legal/rate basis of 3 node(s)
  - Status: current – next edition expected 2027-08; figures end 2025-12-31. Published 2026-08-12, accessed 2026-10-11, covers Calendar year 2025.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Overview: tax-like revenue of the unemployment insurance (UG 20: EUR 9,813.50 million) and of the family fund (UG 25: EUR 8,857.41 million). UG 16: net tax revenue EUR 75,017.89 million (accrual).

- [ ] **Die österreichische Sozialversicherung in Zahlen, 56. Ausgabe (March 2026)** – Dachverband der Sozialversicherungsträger
  - URL: https://www.sozialversicherung.at/cdscontent/load?contentid=10008.805508&version=1776162825
  - Feeds: national-total parts: `sv-2025`; revenue of 3 core(s): `at-pension-insurance`, `at-health-insurance`, `at-accident-insurance`; legal/rate basis of 3 node(s)
  - Status: **DUE** – the next edition was expected 2026-08; figures end 2025-12-31. Published 2026-03-31, accessed 2026-10-11, covers Calendar year 2025 (preliminary).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Preliminary 2025 results: total income of the social insurance EUR 99,090 million; contributions for insured persons in health insurance EUR 23,623 million, pension insurance 50,768 and accident insurance 2,007.

- [ ] **Besteuerungsrechte und Abgabenerträge** – Federal Ministry of Finance (Austria)
  - URL: https://www.bmf.gv.at/themen/budget/finanzbeziehungen-laender-gemeinden/besteuerungsrechte-abgabenertraege.html
  - Feeds: revenue of 2 core(s): `at-kommunalsteuer`, `at-grundsteuer`; legal/rate basis of 6 node(s)
  - Status: **CHECK** – figures end 2023-12-31 (34 months ago); a newer edition may exist (record `nextExpected` in sources.json once you know). Published n/a, accessed 2026-10-11.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Kommunalsteuer EUR 4,210 million and Grundsteuer EUR 794 million in 2023 (Statistik Austria, Finanzausgleich 2023); the key for the shared taxes (about 67.9% Bund, 20.2% Länder, 11.9% municipalities since 2018).


## Harmonised OECD layer

- [ ] **Revenue Statistics 2025, Chapter 3: Tax levels and tax structures (Table 3.1)** – OECD
  - URL: https://www.oecd.org/en/publications/revenue-statistics-2025_3a264267-en/full-report/tax-levels-and-tax-structures-1965-2024_2033f3ea.html
  - Feeds: `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2025-12-09, accessed 2026-09-29, covers Calendar year 2023.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Total tax revenue as % of GDP.

- [ ] **World Observatory on Subnational Government Finance and Investment – country profile: Austria** – OECD and United Cities and Local Governments (SNG-WOFI)
  - URL: https://www.sng-wofi.org/country_profiles/austria.html
  - Feeds: `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2022-10-24, accessed 2026-09-29, covers 2020.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Subnational government revenue by category as % of total subnational revenue, 2022 edition.


## Legal texts

- [ ] **Federal Constitutional Law (B-VG)** – Federal Chancellery (Rechtsinformationssystem des Bundes)
  - URL: https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10000138
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Income Tax Act 1988 (Einkommensteuergesetz 1988)** – Federal Chancellery (Rechtsinformationssystem des Bundes)
  - URL: https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10004570
  - Feeds: legal/rate basis of 3 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Corporation Tax Act 1988 (Körperschaftsteuergesetz 1988)** – Federal Chancellery (Rechtsinformationssystem des Bundes)
  - URL: https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10004569
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **VAT Act 1994 (Umsatzsteuergesetz 1994)** – Federal Chancellery (Rechtsinformationssystem des Bundes)
  - URL: https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10004873
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **General Social Insurance Act (ASVG)** – Federal Chancellery (Rechtsinformationssystem des Bundes)
  - URL: https://www.ris.bka.gv.at/GeltendeFassung.wxe?Abfrage=Bundesnormen&Gesetzesnummer=10008147
  - Feeds: legal/rate basis of 3 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

