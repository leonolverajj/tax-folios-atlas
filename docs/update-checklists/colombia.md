# Update checklist – Colombia

Generated 2026-09-29 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/colombia/sources.json` and re-run it.

Research status: **partial**. 1 source(s) to check or due, 0 coming up, 23 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=colombia`.

## Revenue figures and national-total parts

- [ ] **Estadísticas de Recaudo anual por tipo de impuesto 1970–2026 (Subdirección de Estudios Económicos)** – Dirección de Impuestos y Aduanas Nacionales (DIAN)
  - URL: https://www.dian.gov.co/dian/cifras/Paginas/EstadisticasRecaudo.aspx
  - Feeds: national-total parts: `dian-gross-collection`; revenue of 10 core(s): `nat-renta`, `nat-iva`, `nat-simple`, `nat-aranceles`, `nat-gmf`, `nat-patrimonio`, `nat-consumo`, `nat-gasolina`, …
  - Status: current – figures end 2025-12-31. Published 2026-08-25, accessed 2026-09-28, covers Calendar year 2025 (gross collection, COP millions).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Workbook 'Estadisticas-de-recaudo-anual-por-tipo-de-impuesto-1970-2026.xlsx', updated to July 2026 (cut-off 25 August 2026). Gross collection in cash; excludes offsets (compensaciones). Statistical series that may differ from the accounting figures of the Subdirección de Recaudo.

- [ ] **Revenue Statistics 2025, Table 6.6: Colombia, tax revenues by sub-sectors of government** – OECD
  - URL: https://www.oecd.org/en/publications/revenue-statistics-2025_3a264267-en/full-report/tax-revenues-by-subsectors-of-general-government_f9e88332.html
  - Feeds: national-total parts: `regional-taxes-oecd-2023`, `local-taxes-oecd-2023`, `social-security-oecd-2023`, `parafiscales-oecd-2023`; revenue of 2 core(s): `nat-seguridad-social`, `nat-parafiscales`; `structure.json` (cross-country profile)
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

- [ ] **World Observatory on Subnational Government Finance and Investment – country profile: Colombia** – OECD and United Cities and Local Governments (SNG-WOFI)
  - URL: https://www.sng-wofi.org/country_profiles/colombia.html
  - Feeds: `structure.json` (cross-country profile)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2022-10-24, accessed 2026-09-29, covers 2020.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Subnational government revenue by category (tax revenue, grants and subsidies, tariffs and fees, property income, other) as % of total subnational revenue, 2022 edition.


## Legal texts

- [ ] **Constitución Política de Colombia de 1991 (arts. 150-12, 287, 300-4, 313-4, 338, 360–361)** – Senado de la República de Colombia
  - URL: https://www.secretariasenado.gov.co/senado/basedoc/constitucion_politica_1991.html
  - Feeds: legal/rate basis of 6 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Estatuto Tributario (Decreto 624 de 1989, texto actualizado)** – Senado de la República de Colombia
  - URL: https://www.secretariasenado.gov.co/senado/basedoc/estatuto_tributario.html
  - Feeds: legal/rate basis of 8 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley 2277 de 2022 – Reforma tributaria para la igualdad y la justicia social** – Senado de la República de Colombia
  - URL: https://www.secretariasenado.gov.co/senado/basedoc/ley_2277_2022.html
  - Feeds: legal/rate basis of 3 node(s)
  - Status: current – last checked 2026-09-28. Published 2022-12-13, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Resolución 000238 de 15 de diciembre de 2025 – Unidad de Valor Tributario (UVT) 2026: $52.374** – Dirección de Impuestos y Aduanas Nacionales (DIAN)
  - URL: https://www.dian.gov.co/normatividad/Normatividad/Resoluci%C3%B3n%20000238%20de%2015-12-2025.Pdf
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 2025-12-15, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Decreto Legislativo 1474 de 29 de diciembre de 2025 – medidas tributarias de la emergencia económica** – Presidencia de la República (DAPRE)
  - URL: https://dapre.presidencia.gov.co/normativa/normativa/DECRETO%201474%20DEL%2029%20DE%20DICIEMBRE%20DE%202025.pdf
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 2025-12-29, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: Declared unconstitutional (inexequible) by the Constitutional Court on 15 April 2026.

- [ ] **Comunicado 15 de 15 de abril de 2026 – Sentencia C-079/26 (inexequibilidad del Decreto 1474 de 2025)** – Corte Constitucional de Colombia
  - URL: https://www.corteconstitucional.gov.co/comunicados/Comunicado-15-Abril-15-de-2026.pdf
  - Feeds: legal/rate basis of 3 node(s)
  - Status: current – last checked 2026-09-28. Published 2026-04-15, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Decreto Legislativo 173 de 2026 – medidas tributarias en el impuesto al patrimonio (segunda emergencia económica)** – Ministerio de Hacienda y Crédito Público (compilación DIAN)
  - URL: https://normograma.dian.gov.co/dian/compilacion/docs/decreto_0173_2026.htm
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: Adopted under the emergency declared by Decreto 150 de 2026 (winter floods). The Constitutional Court reviewed the declaration in July 2026 (C-191/26) and is reviewing individual decrees; the wealth-tax rules should be verified before use.

- [ ] **Ley 100 de 1993 – Sistema de Seguridad Social Integral** – Senado de la República de Colombia
  - URL: https://www.secretariasenado.gov.co/senado/basedoc/ley_0100_1993.html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 1993-12-23, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley 2056 de 2020 – Sistema General de Regalías** – Senado de la República de Colombia
  - URL: https://www.secretariasenado.gov.co/senado/basedoc/ley_2056_2020.html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 2020-09-30, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley 1607 de 2012 – Impuesto nacional a la gasolina y al ACPM (arts. 167 ss.)** – Senado de la República de Colombia
  - URL: https://www.secretariasenado.gov.co/senado/basedoc/ley_1607_2012.html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 2012-12-26, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley 1819 de 2016 – Impuesto nacional al carbono; alumbrado público** – Senado de la República de Colombia
  - URL: https://www.secretariasenado.gov.co/senado/basedoc/ley_1819_2016.html
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-09-28. Published 2016-12-29, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley 223 de 1995 – impuestos de registro y de consumo de cerveza y cigarrillos (departamentales)** – Senado de la República de Colombia
  - URL: https://www.secretariasenado.gov.co/senado/basedoc/ley_0223_1995.html
  - Feeds: legal/rate basis of 3 node(s)
  - Status: current – last checked 2026-09-28. Published 1995-12-20, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley 1816 de 2016 – impuesto al consumo de licores, vinos, aperitivos y similares** – Senado de la República de Colombia
  - URL: https://www.secretariasenado.gov.co/senado/basedoc/ley_1816_2016.html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 2016-12-19, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley 488 de 1998 – impuesto sobre vehículos automotores y sobretasa a la gasolina** – Senado de la República de Colombia
  - URL: https://www.secretariasenado.gov.co/senado/basedoc/ley_0488_1998.html
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-09-28. Published 1998-12-24, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley 44 de 1990 – Impuesto predial unificado** – Senado de la República de Colombia
  - URL: https://www.secretariasenado.gov.co/senado/basedoc/ley_0044_1990.html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 1990-12-18, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley 14 de 1983 – Impuesto de industria y comercio (ICA)** – Senado de la República de Colombia
  - URL: https://www.secretariasenado.gov.co/senado/basedoc/ley_0014_1983.html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 1983-07-06, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Decreto 1333 de 1986 – Código de Régimen Municipal** – Senado de la República de Colombia
  - URL: https://www.secretariasenado.gov.co/senado/basedoc/decreto_1333_1986.html
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-09-28. Published 1986-04-25, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley 388 de 1997 – ordenamiento territorial y participación en la plusvalía** – Senado de la República de Colombia
  - URL: https://www.secretariasenado.gov.co/senado/basedoc/ley_0388_1997.html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 1997-07-18, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.


## Context and cross-checks

- [ ] **Informe de Gestión DIAN 2025** – Dirección de Impuestos y Aduanas Nacionales (DIAN)
  - URL: https://www.dian.gov.co/atencionciudadano/Documents/Informe-de-Gestion-DIAN-2025-30012026.pdf
  - Feeds: cross-check
  - Status: published 2026-01-30. Published 2026-01-30, accessed 2026-09-28, covers Calendar year 2025.
  - To do: Context only: re-open if a related figure or rule changes.
  - Note: Table 1 reports 2025 gross collection of COP 296.0 trillion (accounting series of the Subdirección de Recaudo) against COP 294.5 trillion in the later statistical workbook; the atlas uses the workbook because it details each tax.


## Known gaps and moving rules (revisit first)

- `nat-regalias`: Royalties are budgeted in the biennial Sistema General de Regalías, whose figures follow a different accounting basis; not extracted for this atlas.
- `dep-vehiculos`: No consolidated official national total of departmental taxes was located; data sit in the Contaduría General de la Nación and DNP fiscal-performance files by department.
- `dep-registro`: No consolidated official national total of departmental taxes was located.
- `dep-consumo`: No consolidated official national total of departmental taxes was located.
- `dep-estampillas`: No consolidated official national total of departmental taxes was located.
- `mun-predial`: No consolidated official national total of municipal taxes was located; data sit in the Contaduría General de la Nación and DNP files by municipality.
- `mun-ica`: No consolidated official national total of municipal taxes was located.
- `mun-sobretasa-gasolina`: No consolidated official national total of municipal taxes was located.
- `mun-alumbrado`: No consolidated official national total of municipal taxes was located.
- `mun-plusvalia-valorizacion`: No consolidated official national total of municipal taxes was located.
- `nat-patrimonio` is **transitional**: Rules changed repeatedly in 2026: emergency decree 1474/2025 (annulled by the Constitutional Court in April 2026, C-079/26) and decree 173/2026 adopted under the second emergency (Decreto 150/2026), whose review by the Court is ongoing. Check the current text before relying on any threshold or rate.
