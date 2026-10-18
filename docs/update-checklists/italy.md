# Update checklist – Italy

Generated 2026-10-18 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/italy/sources.json` and re-run it.

Research status: **partial**. 0 source(s) to check or due, 0 coming up, 16 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=italy`.

## Revenue figures and national-total parts

- [ ] **Bollettino delle entrate tributarie, dicembre 2025 (n. 286)** – Dipartimento delle Finanze, Ministero dell’Economia e delle Finanze
  - URL: https://www.finanze.gov.it/export/sites/finanze/.galleries/Documenti/entrate_tributarie_2025/Bollettino-entrate-Dicembre2025.pdf
  - Feeds: national-total parts: `state-taxes-2025`, `regional-taxes-2025`, `municipal-taxes-2025`; revenue of 18 core(s): `it-irpef`, `it-ires`, `it-substitute-taxes`, `it-vat`, `it-stamp-duty`, `it-registry-taxes`, `it-insurance-tax`, `it-licences`, …; legal/rate basis of 2 node(s)
  - Status: current – next edition expected 2027-02; figures end 2025-12-31. Published n/a, accessed 2026-10-10, covers January–December 2025.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Section I (entrate erariali, text of pp. 3–5) and Section II (entrate degli enti territoriali, pp. 11–12). Appendici statistiche give each tax by month.

- [ ] **Conti economici nazionali, anni 2010–2025 (22 September 2026), Prospetto 9** – Istat
  - URL: https://www.istat.it/wp-content/uploads/2026/09/CONTI-ECONOMICI-NAZIONALI_2010-2025-22settembre2026.pdf
  - Feeds: national-total parts: `social-contributions-2025`; revenue of 1 core(s): `it-social-contributions`; legal/rate basis of 1 node(s)
  - Status: current – next edition expected 2027-03; figures end 2025-12-31. Published 2026-09-22, accessed 2026-10-10, covers 2010–2025.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: General government revenues in 2025: direct taxes EUR 345,950 million, indirect taxes 316,787 million, social contributions 305,829 million; tax burden 42.9% of GDP.


## Harmonised OECD layer

- [ ] **Revenue Statistics 2025, Table 6.19: Italy, tax revenues by sub-sectors of government** – OECD
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

- [ ] **World Observatory on Subnational Government Finance and Investment – country profile: Italy** – OECD and United Cities and Local Governments (SNG-WOFI)
  - URL: https://www.sng-wofi.org/country_profiles/italy.html
  - Feeds: `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2022-10-24, accessed 2026-09-29, covers 2020.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Subnational government revenue by category as % of total subnational revenue, 2022 edition.


## Rate and guidance pages

- [ ] **IRPEF: aliquote e calcolo** – Agenzia delle Entrate
  - URL: https://www.agenziaentrate.gov.it/portale/imposta-sul-reddito-delle-persone-fisiche-irpef-/aliquote-e-calcolo-dell-irpef
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: For 2026 the second bracket falls from 35% to 33% (legge di bilancio 2026, legge 30 dicembre 2025 n. 199): 23% to EUR 28,000, 33% to EUR 50,000, 43% above.

- [ ] **Principali misure della legge di bilancio 2026** – Ministero dell’Economia e delle Finanze
  - URL: https://www.mef.gov.it/focus/Principali-misure-della-legge-di-bilancio-2026/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.


## Legal texts

- [ ] **Costituzione della Repubblica Italiana (arts. 23, 53, 117, 119)** – Senato della Repubblica
  - URL: https://www.senato.it/istituzione/la-costituzione
  - Feeds: legal/rate basis of 3 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **D.P.R. 22 dicembre 1986, n. 917 – Testo unico delle imposte sui redditi (TUIR)** – Normattiva
  - URL: https://www.normattiva.it/uri-res/N2Ls?urn:nir:presidente.repubblica:decreto:1986-12-22;917
  - Feeds: legal/rate basis of 6 node(s)
  - Status: current – last checked 2026-10-10. Published 1986-12-22, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **D.P.R. 26 ottobre 1972, n. 633 – Istituzione e disciplina dell’imposta sul valore aggiunto** – Normattiva
  - URL: https://www.normattiva.it/uri-res/N2Ls?urn:nir:presidente.repubblica:decreto:1972-10-26;633
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published 1972-10-26, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **D.P.R. 26 aprile 1986, n. 131 – Testo unico delle disposizioni concernenti l’imposta di registro** – Normattiva
  - URL: https://www.normattiva.it/uri-res/N2Ls?urn:nir:presidente.repubblica:decreto:1986-04-26;131
  - Feeds: legal/rate basis of 3 node(s)
  - Status: current – last checked 2026-10-10. Published 1986-04-26, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **D.Lgs. 26 ottobre 1995, n. 504 – Testo unico delle accise** – Normattiva
  - URL: https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1995-10-26;504
  - Feeds: legal/rate basis of 3 node(s)
  - Status: current – last checked 2026-10-10. Published 1995-10-26, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **D.Lgs. 31 ottobre 1990, n. 346 – Testo unico delle disposizioni concernenti l’imposta sulle successioni e donazioni** – Normattiva
  - URL: https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1990-10-31;346
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published 1990-10-31, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **D.Lgs. 15 dicembre 1997, n. 446 – Istituzione dell’imposta regionale sulle attività produttive (IRAP)** – Normattiva
  - URL: https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:decreto.legislativo:1997-12-15;446
  - Feeds: legal/rate basis of 3 node(s)
  - Status: current – last checked 2026-10-10. Published 1997-12-15, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Legge 27 dicembre 2019, n. 160 (art. 1, commi 738–783: nuova IMU)** – Normattiva
  - URL: https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:2019-12-27;160
  - Feeds: legal/rate basis of 3 node(s)
  - Status: current – last checked 2026-10-10. Published 2019-12-27, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Legge 8 agosto 1995, n. 335 – Riforma del sistema pensionistico obbligatorio e complementare** – Normattiva
  - URL: https://www.normattiva.it/uri-res/N2Ls?urn:nir:stato:legge:1995-08-08;335
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published 1995-08-08, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

