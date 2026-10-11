# Update checklist – Chile

Generated 2026-10-11 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/chile/sources.json` and re-run it.

Research status: **partial**. 1 source(s) to check or due, 0 coming up, 15 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=chile`.

## Revenue figures and national-total parts

- [ ] **Revenue Statistics 2025, Table 6.5: Chile, tax revenues by sub-sectors of government** – OECD
  - URL: https://www.oecd.org/en/publications/revenue-statistics-2025_3a264267-en/full-report/tax-revenues-by-subsectors-of-general-government_f9e88332.html
  - Feeds: national-total parts: `municipal-taxes-2023`; revenue of 2 core(s): `cl-property-tax`, `cl-municipal-licences`; `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: **CHECK** – figures end 2023-12-31 (34 months ago); a newer edition may exist (record `nextExpected` in sources.json once you know). Published 2025-12-09, accessed 2026-09-29, covers Calendar year 2023 (national currency).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Harmonised OECD classification of taxes (1000–6000) split by collecting sub-sector of general government.

- [ ] **Informe de Ejecución del Gobierno Central, Diciembre 2025** – Dirección de Presupuestos (DIPRES), Ministerio de Hacienda
  - URL: https://www.dipres.gob.cl/598/articles-403882_doc_pdf1.pdf
  - Feeds: national-total parts: `central-taxes-2025`, `central-contributions-2025`; revenue of 8 core(s): `cl-income-tax`, `cl-vat`, `cl-fuel-tax`, `cl-tobacco-tax`, `cl-fishing-rights`, `cl-stamp-tax`, `cl-customs`, `cl-social-contributions`; legal/rate basis of 8 node(s)
  - Status: current – next edition expected 2027-01; figures end 2025-12-31. Published 2026-01-30, accessed 2026-10-11, covers Calendar year 2025.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Page 4: net tax revenue by tax, monthly and accumulated (CLP million). Page 3: revenue of the central government (net taxes 60,644,084; imposiciones previsionales 4,366,802; total 72,606,525). The figures are subject to later revision, as DIPRES states.


## Harmonised OECD layer

- [ ] **Revenue Statistics 2025, Chapter 3: Tax levels and tax structures (Table 3.1)** – OECD
  - URL: https://www.oecd.org/en/publications/revenue-statistics-2025_3a264267-en/full-report/tax-levels-and-tax-structures-1965-2024_2033f3ea.html
  - Feeds: `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2025-12-09, accessed 2026-09-29, covers Calendar year 2023.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Total tax revenue as % of GDP.

- [ ] **World Observatory on Subnational Government Finance and Investment – country profile: Chile** – OECD and United Cities and Local Governments (SNG-WOFI)
  - URL: https://www.sng-wofi.org/country_profiles/chile.html
  - Feeds: `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2022-10-24, accessed 2026-09-29, covers 2020.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Subnational government revenue by category as % of total subnational revenue, 2022 edition.


## Rate and guidance pages

- [ ] **Impuesto específico a Licencias Transables de Pesca (Art. 43 ter, Ley General de Pesca y Acuicultura)** – Subsecretaría de Pesca y Acuicultura (SUBPESCA)
  - URL: https://www.subpesca.cl/portal/sitio/Actividades-Reguladas/Pesca-industrial/84228:Impuesto-especifico-a-Licencias-Transables-de-Pesca
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.

- [ ] **Acuerdos comerciales y ad valorem efectivo** – Servicio Nacional de Aduanas
  - URL: https://www.aduana.cl/acuerdos-comerciales-y-advalorem-efectivo/aduana/2022-06-28/110649.html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: General tariff 6% ad valorem since 2003; the effective ad valorem rate after trade agreements was 0.71% at the end of 2024.


## Legal texts

- [ ] **Revista SINIM 2025: Gestión municipal 2021–2024** – Sistema Nacional de Información Municipal (SINIM), SUBDERE
  - URL: https://www.sinim.gov.cl/archivos/home/864/REVISTA_SINIM_2025_30-10-2025.pdf
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-11. Published 2025-10-30, accessed 2026-10-11, covers Calendar years 2021–2024.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: Page 8: composition of the Common Municipal Fund: territorial tax 60% (65% for Santiago, Providencia, Las Condes and Vitacura), commercial licences paid in only by those four communes, circulation permits 62.5%. Page 5: municipal own revenue in 2024 includes territorial tax kept by the municipality of 953,402,724 thousand pesos.

- [ ] **Constitución Política de la República de Chile** – Biblioteca del Congreso Nacional de Chile
  - URL: https://www.bcn.cl/leychile/navegar?idNorma=242302
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Decreto Ley 824: Ley sobre Impuesto a la Renta** – Biblioteca del Congreso Nacional de Chile
  - URL: https://www.bcn.cl/leychile/navegar?idNorma=6368
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Decreto Ley 825: Ley sobre Impuesto a las Ventas y Servicios** – Biblioteca del Congreso Nacional de Chile
  - URL: https://www.bcn.cl/leychile/navegar?idNorma=6369
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley 18.502: impuesto específico a los combustibles** – Biblioteca del Congreso Nacional de Chile
  - URL: https://www.bcn.cl/leychile/navegar?idNorma=29903
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: Base rates: 6 UTM per cubic metre of gasoline and 1.5 UTM per cubic metre of diesel; Law 20.493 added the variable component (MEPCO).

- [ ] **Decreto Ley 828: impuesto a los tabacos manufacturados** – Servicio de Impuestos Internos (SII)
  - URL: https://www.sii.cl/pagina/jurisprudencia/legislacion/basica/tabacos.doc
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: Cigarettes: 0.0010304240 UTM per cigarette plus 30% of the retail price per pack, as set by Law 20.780 from 1 October 2014 (SII summary); later amendments not checked.

- [ ] **Decreto Ley 3.475: ley sobre impuesto de timbres y estampillas** – Biblioteca del Congreso Nacional de Chile
  - URL: https://www.bcn.cl/leychile/Navegar?idNorma=7137
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley 17.235: impuesto territorial** – Servicio de Impuestos Internos (SII)
  - URL: https://www.sii.cl/pagina/jurisprudencia/ley17235.htm
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: Article 7: the rates are fixed by supreme decree of the Ministry of Finance.

- [ ] **Decreto Ley 3.063: ley de rentas municipales** – Biblioteca del Congreso Nacional de Chile
  - URL: https://www.bcn.cl/leychile/navegar?idNorma=7054
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-10-11. Published n/a, accessed 2026-10-11.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: Art. 23: commercial, industrial and professional activities pay a municipal licence (patente); permits of circulation are paid in UTM by vehicle type.

