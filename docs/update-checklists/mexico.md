# Update checklist – Mexico

Generated 2026-09-29 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/mexico/sources.json` and re-run it.

Research status: **partial**. 1 source(s) to check or due, 0 coming up, 19 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=mexico`.

## Revenue figures and national-total parts

- [ ] **Cuenta Pública 2025, Tomo I – Ingresos Presupuestarios** – Secretaría de Hacienda y Crédito Público (SHCP)
  - URL: https://www.cuentapublica.hacienda.gob.mx/work/models/CP/2025/tomo/I/I50.06.IPP.pdf
  - Feeds: national-total parts: `federal-taxes-contributions`; revenue of 9 core(s): `fed-isr`, `fed-iva`, `fed-ieps-fuels`, `fed-ieps-other`, `fed-importaciones`, `fed-isan`, `fed-cuotas-seguridad-social`, `fed-derechos`, …; legal/rate basis of 2 node(s)
  - Status: current – figures end 2025-12-31. Published n/a, accessed 2026-09-28, covers Calendar year 2025 (fiscal year = calendar year).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Audited public-account edition delivered to Congress in the spring of 2026. Tables 'Ingresos del Gobierno Federal, 2024-2025' (executed 2025) and 'Ingresos totales de las entidades de control directo y empresas públicas del Estado, 2025'. Publication date not stated in the PDF.

- [ ] **Revenue Statistics 2025, Table 6.25: Mexico, tax revenues by sub-sectors of government** – OECD
  - URL: https://www.oecd.org/en/publications/revenue-statistics-2025_3a264267-en/full-report/tax-revenues-by-subsectors-of-general-government_f9e88332.html
  - Feeds: national-total parts: `state-taxes-oecd-2023`, `local-taxes-oecd-2023`; `structure.json` (cross-country profile)
  - Status: **CHECK** – figures end 2023-12-31 (33 months ago); a newer edition may exist (record `nextExpected` in sources.json once you know). Published 2025-12-09, accessed 2026-09-29, covers Calendar year 2023 (national currency).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Harmonised OECD classification of taxes (1000–6000) split by collecting sub-sector of general government. Used for the cross-country profile and for parts of the national total that have no national-source breakdown.


## Harmonised OECD layer

- [ ] **Revenue Statistics 2025, Chapter 3: Tax levels and tax structures (Tables 3.1 and 3.4)** – OECD
  - URL: https://www.oecd.org/en/publications/revenue-statistics-2025_3a264267-en/full-report/tax-levels-and-tax-structures-1965-2024_2033f3ea.html
  - Feeds: `structure.json` (cross-country profile)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2025-12-09, accessed 2026-09-29, covers Calendar year 2023.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Total tax revenue as % of GDP and tax structure as % of total taxation, for all OECD members.

- [ ] **World Observatory on Subnational Government Finance and Investment – country profile: Mexico** – OECD and United Cities and Local Governments (SNG-WOFI)
  - URL: https://www.sng-wofi.org/country_profiles/mexico.html
  - Feeds: `structure.json` (cross-country profile)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2022-10-24, accessed 2026-09-29, covers 2020.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Subnational government revenue by category (tax revenue, grants and subsidies, tariffs and fees, property income, other) as % of total subnational revenue, 2022 edition.


## Legal texts

- [ ] **Constitución Política de los Estados Unidos Mexicanos (arts. 31-IV, 73, 115-IV, 124)** – Cámara de Diputados (H. Congreso de la Unión)
  - URL: https://www.diputados.gob.mx/LeyesBiblio/pdf/CPEUM.pdf
  - Feeds: legal/rate basis of 8 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley de Coordinación Fiscal** – Cámara de Diputados (H. Congreso de la Unión)
  - URL: https://www.diputados.gob.mx/LeyesBiblio/pdf/LCF.pdf
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: Sets up the national fiscal coordination system: states adhere and receive participaciones and aportaciones in exchange for limiting their own taxes.

- [ ] **Ley del Impuesto sobre la Renta (LISR)** – Cámara de Diputados (H. Congreso de la Unión)
  - URL: https://www.diputados.gob.mx/LeyesBiblio/pdf/LISR.pdf
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley del Impuesto al Valor Agregado (LIVA)** – Cámara de Diputados (H. Congreso de la Unión)
  - URL: https://www.diputados.gob.mx/LeyesBiblio/pdf/LIVA.pdf
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley del Impuesto Especial sobre Producción y Servicios (LIEPS)** – Cámara de Diputados (H. Congreso de la Unión)
  - URL: https://www.diputados.gob.mx/LeyesBiblio/pdf/LIEPS.pdf
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley de los Impuestos Generales de Importación y de Exportación (LIGIE)** – Cámara de Diputados (H. Congreso de la Unión)
  - URL: https://www.diputados.gob.mx/LeyesBiblio/pdf/LIGIE_2022.pdf
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: Tariff schedule; 2026 increases on selected lines for countries without trade agreements.

- [ ] **Ley Federal del Impuesto sobre Automóviles Nuevos (LFISAN)** – Cámara de Diputados (H. Congreso de la Unión)
  - URL: https://www.diputados.gob.mx/LeyesBiblio/pdf/LFISAN.pdf
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley Federal de Derechos (LFD)** – Cámara de Diputados (H. Congreso de la Unión)
  - URL: https://www.diputados.gob.mx/LeyesBiblio/pdf/LFD.pdf
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley de Ingresos sobre Hidrocarburos (LIH)** – Cámara de Diputados (H. Congreso de la Unión)
  - URL: https://www.diputados.gob.mx/LeyesBiblio/pdf/LIH.pdf
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley del Seguro Social (LSS)** – Cámara de Diputados (H. Congreso de la Unión)
  - URL: https://www.diputados.gob.mx/LeyesBiblio/pdf/LSS.pdf
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley del Instituto de Seguridad y Servicios Sociales de los Trabajadores del Estado (LISSSTE)** – Cámara de Diputados (H. Congreso de la Unión)
  - URL: https://www.diputados.gob.mx/LeyesBiblio/pdf/LISSSTE.pdf
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley de Ingresos de la Federación para el Ejercicio Fiscal de 2026** – Cámara de Diputados (H. Congreso de la Unión)
  - URL: https://www.diputados.gob.mx/LeyesBiblio/pdf/LIF_2026.pdf
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28, covers 2026.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Código Fiscal de la Ciudad de México (predial arts. 126–133; impuesto sobre nóminas arts. 156–159; tenencia arts. 160 ss.; hospedaje arts. 162–164)** – Congreso de la Ciudad de México
  - URL: https://www.congresocdmx.gob.mx/archivos/legislativas/codigo_fiscal_cdmx.pdf
  - Feeds: legal/rate basis of 4 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: Mexico City is one example of a state-level fiscal code; each of the 32 federal entities has its own.


## Context and cross-checks

- [ ] **Comunicado No. 9 – Informes sobre la Situación Económica, las Finanzas Públicas y la Deuda Pública al cuarto trimestre de 2025** – Secretaría de Hacienda y Crédito Público (SHCP)
  - URL: https://www.gob.mx/shcp/prensa/comunicado-no-9-informes-sobre-la-situacion-economica-las-finanzas-publicas-y-la-deuda-publica-al-cuarto-trimestre-de-2025
  - Feeds: cross-check
  - Status: no publication date. Published n/a, accessed 2026-09-28, covers 2025.
  - To do: Context only: re-open if a related figure or rule changes.
  - Note: Reports tax revenue at 15.1% of GDP in 2025 (ISR 8.2% of GDP, IVA 4.2%).

- [ ] **Estadística de Finanzas Públicas Estatales y Municipales (EFIPEM) 2024 – información definitiva** – Instituto Nacional de Estadística y Geografía (INEGI)
  - URL: https://www.inegi.org.mx/rnm/index.php/catalog/1120
  - Feeds: cross-check
  - Status: published 2026-04-29. Published 2026-04-29, accessed 2026-09-28, covers Calendar year 2024.
  - To do: Context only: re-open if a related figure or rule changes.
  - Note: Authoritative state and municipal revenue tables by concept, published as interactive tabulations and downloads. Not extracted for this atlas (see data gaps).


## Known gaps and moving rules (revisit first)

- `state-nominas`: State and municipal revenue by tax is published by INEGI (EFIPEM 2024) in interactive tabulations that this atlas has not extracted; no reliable national total is shown rather than an estimate.
- `state-tenencia`: Not separately available in the tables consulted; only some states levy it.
- `state-hospedaje`: Not extracted from INEGI's EFIPEM tabulations; see the source link.
- `state-derechos`: Not extracted from INEGI's EFIPEM tabulations; see the source link.
- `mun-predial`: Not extracted from INEGI's EFIPEM tabulations; see the source link.
- `mun-adquisicion-inmuebles`: Not extracted from INEGI's EFIPEM tabulations; see the source link.
- `mun-derechos`: Not extracted from INEGI's EFIPEM tabulations; see the source link.
