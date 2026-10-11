# Update checklist – Spain

Generated 2026-10-11 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/spain/sources.json` and re-run it.

Research status: **partial**. 1 source(s) to check or due, 0 coming up, 18 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=spain`.

## Revenue figures and national-total parts

- [ ] **Revenue Statistics 2025, Table 6.33: Spain, tax revenues by sub-sectors of government** – OECD
  - URL: https://www.oecd.org/en/publications/revenue-statistics-2025_3a264267-en/full-report/tax-revenues-by-subsectors-of-general-government_f9e88332.html
  - Feeds: national-total parts: `ccaa-own-taxes-2023`, `local-taxes-2023`; revenue of 6 core(s): `es-transfer-tax`, `es-inheritance-gift-tax`, `es-wealth-tax`, `es-other-ccaa-taxes`, `es-ibi`, `es-other-local-taxes`; legal/rate basis of 1 node(s); `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: **CHECK** – figures end 2023-12-31 (34 months ago); a newer edition may exist (record `nextExpected` in sources.json once you know). Published 2025-12-09, accessed 2026-09-29, covers Calendar year 2023 (national currency).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Harmonised OECD classification of taxes (1000–6000) split by collecting sub-sector of general government.

- [ ] **Informe mensual de recaudación tributaria, diciembre 2025 (Cuadro 1.4: ingresos tributarios por conceptos y distribución entre administraciones, acumulado)** – Agencia Estatal de Administración Tributaria
  - URL: https://sede.agenciatributaria.gob.es/static_files/AEAT/Estudios/Estadisticas/Informes_Estadisticos/Informes_mensuales_recaudacion_tributaria/2025/IMR_25_12_es_es.pdf
  - Feeds: national-total parts: `state-taxes-2025`, `ccaa-irpf-2025`; revenue of 16 core(s): `es-irpf-state`, `es-corporate-tax`, `es-nonresident-income-tax`, `es-vat`, `es-hydrocarbon-tax`, `es-tobacco-tax`, `es-electricity-tax`, `es-alcohol-taxes`, …
  - Status: current – next edition expected 2027-01; figures end 2025-12-31. Published n/a, accessed 2026-10-10, covers Calendar year 2025.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Total tax revenue EUR 325,356 million (+10.4%). The Informe Anual de Recaudación Tributaria 2025 was published on 23 April 2026.

- [ ] **El déficit de la Seguridad Social se reduce al 0,4% del PIB, su nivel más bajo desde 2011 (ejecución presupuestaria 2025)** – Ministerio de Inclusión, Seguridad Social y Migraciones
  - URL: https://www.lamoncloa.gob.es/serviciosdeprensa/notasprensa/inclusion/Paginas/2026/310326-seguridad-social-deficit-pib.aspx
  - Feeds: national-total parts: `social-security-2025`; revenue of 1 core(s): `es-social-security`; legal/rate basis of 1 node(s)
  - Status: current – next edition expected 2027-03; figures end 2025-12-31. Published 2026-03-31, accessed 2026-10-10, covers 2025.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Contribution income EUR 176,918 million in 2025 (+6.9%), 10.5% of GDP.


## Harmonised OECD layer

- [ ] **Revenue Statistics 2025, Chapter 3: Tax levels and tax structures (Table 3.1)** – OECD
  - URL: https://www.oecd.org/en/publications/revenue-statistics-2025_3a264267-en/full-report/tax-levels-and-tax-structures-1965-2024_2033f3ea.html
  - Feeds: `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2025-12-09, accessed 2026-09-29, covers Calendar year 2023.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Total tax revenue as % of GDP.

- [ ] **World Observatory on Subnational Government Finance and Investment – country profile: Spain** – OECD and United Cities and Local Governments (SNG-WOFI)
  - URL: https://www.sng-wofi.org/country_profiles/spain.html
  - Feeds: `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2022-10-24, accessed 2026-09-29, covers 2020.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Subnational government revenue by category as % of total subnational revenue, 2022 edition.


## Rate and guidance pages

- [ ] **Informe Anual de Recaudación Tributaria 2025** – Agencia Estatal de Administración Tributaria
  - URL: https://sede.agenciatributaria.gob.es/Sede/estadisticas/recaudacion-tributaria/informe-anual/ejercicio-2025/resumen.html
  - Feeds: legal/rate basis of 3 node(s)
  - Status: current – last checked 2026-10-10. Published 2026-04-23, accessed 2026-10-10, covers 2025.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.


## Legal texts

- [ ] **Constitución Española (arts. 31, 133, 156–157)** – Boletín Oficial del Estado
  - URL: https://www.boe.es/buscar/act.php?id=BOE-A-1978-31229
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published 1978-12-29, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley 22/2009, por la que se regula el sistema de financiación de las Comunidades Autónomas de régimen común y Ciudades con Estatuto de Autonomía** – Boletín Oficial del Estado
  - URL: https://www.boe.es/buscar/act.php?id=BOE-A-2009-20375
  - Feeds: legal/rate basis of 4 node(s)
  - Status: current – last checked 2026-10-10. Published 2009-12-19, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley 58/2003, General Tributaria** – Boletín Oficial del Estado
  - URL: https://www.boe.es/buscar/act.php?id=BOE-A-2003-23186
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-10. Published 2003-12-18, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley 35/2006, del Impuesto sobre la Renta de las Personas Físicas** – Boletín Oficial del Estado
  - URL: https://www.boe.es/buscar/act.php?id=BOE-A-2006-20764
  - Feeds: legal/rate basis of 3 node(s)
  - Status: current – last checked 2026-10-10. Published 2006-11-29, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley 27/2014, del Impuesto sobre Sociedades** – Boletín Oficial del Estado
  - URL: https://www.boe.es/buscar/act.php?id=BOE-A-2014-12328
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published 2014-11-28, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley 37/1992, del Impuesto sobre el Valor Añadido** – Boletín Oficial del Estado
  - URL: https://www.boe.es/buscar/act.php?id=BOE-A-1992-28740
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published 1992-12-29, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley 38/1992, de Impuestos Especiales** – Boletín Oficial del Estado
  - URL: https://www.boe.es/buscar/act.php?id=BOE-A-1992-28741
  - Feeds: legal/rate basis of 6 node(s)
  - Status: current – last checked 2026-10-10. Published 1992-12-29, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley 29/1987, del Impuesto sobre Sucesiones y Donaciones** – Boletín Oficial del Estado
  - URL: https://www.boe.es/buscar/act.php?id=BOE-A-1987-28141
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published 1987-12-19, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Real Decreto Legislativo 1/1993, Texto Refundido de la Ley del Impuesto sobre Transmisiones Patrimoniales y Actos Jurídicos Documentados** – Boletín Oficial del Estado
  - URL: https://www.boe.es/buscar/act.php?id=BOE-A-1993-25359
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published 1993-10-20, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley 19/1991, del Impuesto sobre el Patrimonio** – Boletín Oficial del Estado
  - URL: https://www.boe.es/buscar/act.php?id=BOE-A-1991-14392
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published 1991-06-07, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Real Decreto Legislativo 2/2004, Texto Refundido de la Ley Reguladora de las Haciendas Locales** – Boletín Oficial del Estado
  - URL: https://www.boe.es/buscar/act.php?id=BOE-A-2004-4214
  - Feeds: legal/rate basis of 3 node(s)
  - Status: current – last checked 2026-10-10. Published 2004-03-09, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Real Decreto Legislativo 8/2015, Texto Refundido de la Ley General de la Seguridad Social** – Boletín Oficial del Estado
  - URL: https://www.boe.es/buscar/act.php?id=BOE-A-2015-11724
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-10. Published 2015-10-31, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

