# Update checklist – Bolivia

Generated 2026-09-29 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/bolivia/sources.json` and re-run it.

Research status: **partial**. 2 source(s) to check or due, 0 coming up, 18 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=bolivia`.

## Revenue figures and national-total parts

- [ ] **La recaudación de impuestos creció 10,6% el año 2025** – Servicio de Impuestos Nacionales (SIN)
  - URL: https://www.impuestos.gob.bo/index.php/nota_prensa/la-recaudacion-de-impuestos-crecio-106-el-ano-2025/
  - Feeds: national-total parts: `sin-total-2025`; revenue of 3 core(s): `nat-iva`, `nat-iue`, `nat-it`
  - Status: current – figures end 2025-12-31. Published 2026-01-21, accessed 2026-09-28, covers Calendar year 2025 (Bs millions).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Total SIN collection Bs 45,910 million in 2025 (Bs 41,524.8 million in 2024): IVA 13,655 (29.7%), IUE 10,722 (23.3%), IT 7,338 (15.9%), other taxes 14,195 (31.1%). The total includes domestic-market taxes plus IDH, IEHD and ITF (see the SIN memoria).

- [ ] **Memoria Enero–Octubre 2025** – Servicio de Impuestos Nacionales (SIN)
  - URL: https://www.impuestos.gob.bo/wp-content/uploads/2025/11/105409f7900.pdf
  - Feeds: national-total parts: `sin-total-jan-oct-2025`; revenue of 1 core(s): `nat-idh`
  - Status: current – figures end 2025-10-31. Published 2025-11-30, accessed 2026-09-28, covers January–October 2025.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Chapter 1 'La gestión de recaudaciones': Bs 38,400.3 million collected to October 2025, of which domestic market 89.2%, IEHD + ITF 3.7% (Bs 1,436.2 million) and IDH 7.1% (Bs 2,717.4 million). Publication date approximate (November 2025).

- [ ] **Revenue Statistics in Latin America and the Caribbean 2025: Bolivia (country note)** – OECD
  - URL: https://www.oecd.org/content/dam/oecd/en/publications/reports/2025/05/revenue-statistics-in-latin-america-and-the-caribbean-2025-country-notes_29961c77/bolivia_857aa47b/78b0c38c-en.pdf
  - Feeds: national-total parts: `customs-oecd-2023`, `social-security-oecd-2023`; revenue of 2 core(s): `nat-aduana`, `nat-seguridad-social`; `structure.json` (cross-country profile)
  - Status: **CHECK** – figures end 2023-12-31 (33 months ago); a newer edition may exist (record `nextExpected` in sources.json once you know). Published 2025-05-27, accessed 2026-09-29, covers Calendar year 2023.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Tax-to-GDP ratio and tax structure by OECD heading, national currency (BOB millions): income 9,008; social security 17,908; property 570; goods and services 38,386; other 8,548; total 74,419.

- [ ] **Revenue Statistics in Latin America and the Caribbean 2025, Table 1.4: attribution of tax revenue to sub-sectors of general government** – OECD
  - URL: https://www.oecd.org/en/publications/revenue-statistics-in-latin-america-and-the-caribbean-2025_7594fbdd-en/full-report/tax-revenue-trends-1990-2023_ee246e3f.html
  - Feeds: national-total parts: `municipal-taxes-oecd-2023`; `structure.json` (cross-country profile)
  - Status: **CHECK** – figures end 2023-12-31 (33 months ago); a newer edition may exist (record `nextExpected` in sources.json once you know). Published 2025-05-27, accessed 2026-09-29, covers Calendar year 2023.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Bolivia: central government 71.4%, local government 4.5%, social security funds 24.1% of total tax revenue (no separate regional column).


## Harmonised OECD layer

- [ ] **World Observatory on Subnational Government Finance and Investment – country profile: Bolivia** – OECD and United Cities and Local Governments (SNG-WOFI)
  - URL: https://www.sng-wofi.org/country_profiles/bolivia.html
  - Feeds: `structure.json` (cross-country profile)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2022-10-24, accessed 2026-09-29, covers 2020.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Subnational government revenue by category (tax revenue, grants and subsidies, tariffs and fees, property income, other) as % of total subnational revenue, 2022 edition.


## Rate and guidance pages

- [ ] **Cuadro General de Impuestos en Vigencia (national taxes, taxable events, rates)** – Servicio de Impuestos Nacionales (SIN)
  - URL: https://www.impuestos.gob.bo/wp-content/uploads/2025/10/8580c1ef52.pdf
  - Feeds: legal/rate basis of 5 node(s)
  - Status: current – last checked 2026-09-28. Published 2025-10-01, accessed 2026-09-28.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: Confirms IVA 13%, IT 3%, IUE 25%, IGF 1.4%/1.9%/2.4% above Bs 30 million as of the October 2025 edition. Publication date approximate (October 2025).

- [ ] **Proyecto de Ley transparenta el IVA y fija tasa efectiva real del 13%** – Servicio de Impuestos Nacionales (SIN)
  - URL: https://www.impuestos.gob.bo/index.php/nota_prensa/proyecto-de-ley-transparenta-el-iva-y-fija-tasa-efectiva-real-del-13/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 2026-02-19, accessed 2026-09-28.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: Bill sent to the Legislative Assembly to show IVA separately on invoices (today the 13% is included in the price, an effective rate of about 14.94%). Passage not confirmed at the check date.

- [ ] **Impuestos ratifica eliminación del ITF en beneficio de la economía de los bolivianos** – Servicio de Impuestos Nacionales (SIN)
  - URL: https://www.impuestos.gob.bo/index.php/nota_prensa/impuestos-ratifica-eliminacion-del-itf-en-beneficio-de-la-economia-de-los-bolivianos/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 2026-04-14, accessed 2026-09-28.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: RND 102600000013 abrogated the ITF regulation, ending withholding on US-dollar bank operations.

- [ ] **Gobierno presenta Proyecto de Ley de Transparencia y Alivio Tributario para reactivar la economía formal en Bolivia** – Ministerio de Economía y Finanzas Públicas (Bolivia)
  - URL: https://www.economiayfinanzas.gob.bo/node/19055
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: Ministry description of the 2026 tax-relief bill (debt forgiveness, payment plans, IVA transparency); related to Decreto Supremo 5503 of December 2025.


## Legal texts

- [ ] **Ley Nº 843 (Texto Ordenado 2003, 'Ley 843R2') – IVA, IT, IUE, RC-IVA, ICE, IPBI, IPVA, IMT** – Lexivox (Bolivian legislation repository)
  - URL: https://www.lexivox.org/norms/BO-L-843R2.html
  - Feeds: legal/rate basis of 9 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: Consolidated text on a civil-society legal wiki; the authoritative versions are in the Gaceta Oficial de Bolivia and on the SIN site.

- [ ] **Ley Nº 154 de 14 de julio de 2011 – Clasificación y definición de impuestos y regulación para la creación y/o modificación de impuestos de dominio de los gobiernos autónomos** – Servicio de Impuestos Nacionales (SIN) – copy of the Gaceta Oficial text
  - URL: https://www.impuestos.gob.bo/wp-content/uploads/2025/11/LEY154.pdf
  - Feeds: legal/rate basis of 7 node(s)
  - Status: current – last checked 2026-09-28. Published 2011-07-14, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley Nº 1357 de 28 de diciembre de 2020 – Impuesto a las Grandes Fortunas (IGF)** – Lexivox (Bolivian legislation repository)
  - URL: https://www.lexivox.org/norms/BO-L-N1357.html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 2020-12-28, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley Nº 3446 de 21 de julio de 2006 – Impuesto a las Transacciones Financieras (ITF)** – Lexivox (Bolivian legislation repository)
  - URL: https://www.lexivox.org/norms/BO-L-N3446.html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 2006-07-21, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley Nº 3058 de 17 de mayo de 2005 – Ley de Hidrocarburos (IDH, regalías y participaciones)** – Lexivox (Bolivian legislation repository)
  - URL: https://www.lexivox.org/norms/BO-L-N3058.html
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-09-28. Published 2005-05-17, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley Nº 535 de 28 de mayo de 2014 – Ley de Minería y Metalurgia (regalía minera)** – Lexivox (Bolivian legislation repository)
  - URL: https://www.lexivox.org/norms/BO-L-N535.html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 2014-05-28, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley Nº 031 de 19 de julio de 2010 – Ley Marco de Autonomías y Descentralización 'Andrés Ibáñez'** – Lexivox (Bolivian legislation repository)
  - URL: https://www.lexivox.org/norms/BO-L-N031.html
  - Feeds: legal/rate basis of 4 node(s)
  - Status: current – last checked 2026-09-28. Published 2010-07-19, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Ley Nº 065 de 10 de diciembre de 2010 – Ley de Pensiones** – Lexivox (Bolivian legislation repository)
  - URL: https://www.lexivox.org/norms/BO-L-N065.html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 2010-12-10, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Constitución Política del Estado Plurinacional de Bolivia (2009) – arts. 299–305, 320–323, 339–341** – Lexivox (Bolivian legislation repository)
  - URL: https://www.lexivox.org/norms/BO-CPE-20090207.html
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-09-28. Published 2009-02-07, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.


## Known gaps and moving rules (revisit first)

- `nat-rc-iva`: Included in the SIN's 'other taxes' (Bs 14,195 million in 2025), which is not broken down by tax in the sources located.
- `nat-ice`: Included in the SIN's 'other taxes' (Bs 14,195 million in 2025); no separate full-year figure located.
- `nat-iehd`: Reported only together with the ITF (Bs 1,436.2 million, January–October 2025); no separate full-year figure located.
- `nat-itf`: Reported only together with the IEHD (Bs 1,436.2 million, January–October 2025) and now being eliminated.
- `nat-igf`: Included in the SIN's 'other taxes'; no separate figure located.
- `dep-regalias`: Royalty transfers are reported by the Ministry of Economy and the hydrocarbons and mining regulators; no consolidated 2025 total located.
- `dep-own-taxes`: Few departments levy these taxes and no consolidated data were located.
- `dep-tasas`: No consolidated departmental fee data located.
- `mun-ipbi`: Municipal revenue by tax is not published in a consolidated national table that was located.
- `mun-ipva`: Municipal revenue by tax is not published in a consolidated national table that was located.
- `mun-imt`: Municipal revenue by tax is not published in a consolidated national table that was located.
- `mun-tasas-patentes`: Municipal revenue by tax is not published in a consolidated national table that was located.
- `nat-iehd` is **transitional**: The fuel-subsidy removal in Decreto Supremo 5503 (December 2025) changed fuel pricing and the fiscal role of the IEHD; check the current fuel price schedule before relying on any amount.
- `nat-itf` is **transitional**: The government announced the elimination of the ITF in November 2025 and the SIN reported on 14 April 2026 that RND 102600000013 abrogated its regulation, ending withholding on US-dollar bank operations. Confirm whether the underlying Law 3446 has been repealed.
- `nat-igf` is **transitional**: Law 1357 (2020) is the statute in the SIN's October 2025 table of taxes in force. The government announced its elimination in November 2025; a repeal proposal was still before the Legislative Assembly in March 2026. Verify the current status.
