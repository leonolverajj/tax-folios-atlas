# Update checklist – Germany

Generated 2026-10-18 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/germany/sources.json` and re-run it.

Research status: **researched**. 0 source(s) to check or due, 0 coming up, 31 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=germany`.

## Revenue figures and national-total parts

- [ ] **GENESIS-Online, Tabelle 71211-0001: Steuereinnahmen – Deutschland, Jahre, Steuerarten vor der Steuerverteilung** – Statistisches Bundesamt (Destatis)
  - URL: https://genesis.destatis.de/datenbank/online/table/71211-0001
  - Feeds: national-total parts: `federal-law-taxes-2025`, `laender-taxes-2025`, `gemeinden-taxes-2025`; revenue of 20 core(s): `de-income-tax`, `de-solidarity-surcharge`, `de-corporate-tax`, `de-vat`, `de-energy-tax`, `de-electricity-tax`, `de-tobacco-tax`, `de-alcohol-tax`, …; legal/rate basis of 1 node(s)
  - Status: current – next edition expected 2027-02; figures end 2025-12-31. Published n/a, accessed 2026-10-10, covers Calendar years 1999–2025.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Cash tax revenue by tax in EUR thousand, before the distribution between Bund, Länder, municipalities and EU. Table footer: status 21 September 2026.

- [ ] **Sozialbudget 2025, Tabelle III-1: Leistungen und Finanzierung nach Arten und Institutionen** – Bundesministerium für Arbeit und Soziales (BMAS)
  - URL: https://www.bmas.de/DE/Service/Publikationen/Broschueren/a230-26-sozialbudget-2025.html
  - Feeds: national-total parts: `social-insurance-2025`; revenue of 5 core(s): `de-pension-insurance`, `de-health-insurance`, `de-long-term-care-insurance`, `de-unemployment-insurance`, `de-accident-insurance`
  - Status: current – next edition expected 2027-07; figures end 2025-12-31. Published n/a, accessed 2026-10-10, covers 2025 (estimate) and 2024 (provisional).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Data status May 2026. Contributions of the insured and employers by social insurance branch.


## Harmonised OECD layer

- [ ] **Revenue Statistics 2025, Table 6.13: Germany, tax revenues by sub-sectors of government** – OECD
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

- [ ] **World Observatory on Subnational Government Finance and Investment – country profile: Germany** – OECD and United Cities and Local Governments (SNG-WOFI)
  - URL: https://www.sng-wofi.org/country_profiles/germany.html
  - Feeds: `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2022-10-24, accessed 2026-09-29, covers 2020.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Subnational government revenue by category as % of total subnational revenue, 2022 edition.


## Rate and guidance pages

- [ ] **Beitragsbemessungsgrenzen 2026** – Die Bundesregierung
  - URL: https://www.bundesregierung.de/breg-de/aktuelles/beitragsgemessungsgrenzen-2386514
  - Feeds: legal/rate basis of 4 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10, covers 2026.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: Income ceilings for contributions: 101,400 EUR (pension, unemployment) and 69,750 EUR (health, long-term care) a year.


## Legal texts

- [ ] **Grundgesetz für die Bundesrepublik Deutschland (Basic Law), Arts. 28, 105–108** – Bundesministerium der Justiz
  - URL: https://www.gesetze-im-internet.de/gg/
  - Feeds: legal/rate basis of 17 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: The finance constitution: who legislates, collects and receives each tax.

- [ ] **Einkommensteuergesetz (EStG)** – Bundesministerium der Justiz
  - URL: https://www.gesetze-im-internet.de/estg/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Solidaritätszuschlaggesetz 1995 (SolzG 1995)** – Bundesministerium der Justiz
  - URL: https://www.gesetze-im-internet.de/solzg_1995/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Körperschaftsteuergesetz (KStG)** – Bundesministerium der Justiz
  - URL: https://www.gesetze-im-internet.de/kstg_1977/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Umsatzsteuergesetz (UStG)** – Bundesministerium der Justiz
  - URL: https://www.gesetze-im-internet.de/ustg_1980/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Energiesteuergesetz (EnergieStG)** – Bundesministerium der Justiz
  - URL: https://www.gesetze-im-internet.de/energiestg/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Stromsteuergesetz (StromStG)** – Bundesministerium der Justiz
  - URL: https://www.gesetze-im-internet.de/stromstg/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Tabaksteuergesetz (TabStG)** – Bundesministerium der Justiz
  - URL: https://www.gesetze-im-internet.de/tabstg_2009/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Alkoholsteuergesetz (AlkStG)** – Bundesministerium der Justiz
  - URL: https://www.gesetze-im-internet.de/alkstg/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Luftverkehrsteuergesetz (LuftVStG)** – Bundesministerium der Justiz
  - URL: https://www.gesetze-im-internet.de/luftvstg/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: The version in force from 1 July 2026 (Second Act amending the Aviation Tax Act) restores the lower rates of § 11(1).

- [ ] **Versicherungsteuergesetz (VersStG)** – Bundesministerium der Justiz
  - URL: https://www.gesetze-im-internet.de/versstg/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Kraftfahrzeugsteuergesetz (KraftStG)** – Bundesministerium der Justiz
  - URL: https://www.gesetze-im-internet.de/kraftstg/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Regulation (EU) No 952/2013 laying down the Union Customs Code** – European Parliament and Council
  - URL: https://eur-lex.europa.eu/eli/reg/2013/952/oj
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published 2013-10-09, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: Customs duties follow the EU Common Customs Tariff; Germany forwards 75% of what it collects to the EU budget.

- [ ] **Erbschaftsteuer- und Schenkungsteuergesetz (ErbStG)** – Bundesministerium der Justiz
  - URL: https://www.gesetze-im-internet.de/erbstg_1974/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Grunderwerbsteuergesetz (GrEStG)** – Bundesministerium der Justiz
  - URL: https://www.gesetze-im-internet.de/grestg_1983/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Rennwett- und Lotteriegesetz (RennwLottG)** – Bundesministerium der Justiz
  - URL: https://www.gesetze-im-internet.de/rennwlottg_2021/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Feuerschutzsteuergesetz (FeuerSchStG)** – Bundesministerium der Justiz
  - URL: https://www.gesetze-im-internet.de/feuerschstg_1979/BJNR023530979.html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Gewerbesteuergesetz (GewStG)** – Bundesministerium der Justiz
  - URL: https://www.gesetze-im-internet.de/gewstg/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Grundsteuergesetz (GrStG)** – Bundesministerium der Justiz
  - URL: https://www.gesetze-im-internet.de/grstg_1973/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Sozialgesetzbuch (SGB) Sechstes Buch – Gesetzliche Rentenversicherung** – Bundesministerium der Justiz
  - URL: https://www.gesetze-im-internet.de/sgb_6/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Sozialgesetzbuch (SGB) Fünftes Buch – Gesetzliche Krankenversicherung** – Bundesministerium der Justiz
  - URL: https://www.gesetze-im-internet.de/sgb_5/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Sozialgesetzbuch (SGB) Elftes Buch – Soziale Pflegeversicherung** – Bundesministerium der Justiz
  - URL: https://www.gesetze-im-internet.de/sgb_11/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Sozialgesetzbuch (SGB) Drittes Buch – Arbeitsförderung** – Bundesministerium der Justiz
  - URL: https://www.gesetze-im-internet.de/sgb_3/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Sozialgesetzbuch (SGB) Siebtes Buch – Gesetzliche Unfallversicherung** – Bundesministerium der Justiz
  - URL: https://www.gesetze-im-internet.de/sgb_7/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.


## Context and cross-checks

- [ ] **Sozialpolitik aktuell, Tabelle II.16: Finanzierung des Sozialstaates, Eckdaten 2025** – Institut Arbeit und Qualifikation, Universität Duisburg-Essen
  - URL: https://www.sozialpolitik-aktuell.de/files/sozialpolitik-aktuell/_Politikfelder/Finanzierung/Datensammlung/PDF-Dateien/tabII16.pdf
  - Feeds: cross-check
  - Status: published 2026-09-08. Published 2026-09-08, accessed 2026-10-10, covers 2025 (estimate).
  - To do: Context only: re-open if a related figure or rule changes.
  - Note: Compiles the BMAS figures; used as a cross-check of the contributions by branch (sum 706.2 billion EUR).


## Known gaps and moving rules (revisit first)

- `de-corporate-tax` is **scheduled**: The rate falls by one point a year from 2028: 14% (2028), 13%, 12%, 11%, and 10% from 2032 (§ 23 KStG).
