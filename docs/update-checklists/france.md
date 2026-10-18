# Update checklist – France

Generated 2026-10-18 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/france/sources.json` and re-run it.

Research status: **researched**. 0 source(s) to check or due, 0 coming up, 9 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=france`.

## Revenue figures and national-total parts

- [ ] **Les comptes de la Nation en 2025: Dépenses et recettes des administrations publiques, tableau 3.217 « Principaux impôts par catégorie »** – INSEE
  - URL: https://www.insee.fr/fr/statistiques/8988845?sommaire=8988934
  - Feeds: national-total parts: `state-sec-taxes-2025`, `regional-taxes-2025`, `communal-taxes-2025`; revenue of 33 core(s): `fr-vat`, `fr-income-tax`, `fr-corporate-tax`, `fr-csg`, `fr-crds`, `fr-capital-income-levies`, `fr-social-contributions`, `fr-ticpe`, …
  - Status: current – next edition expected 2027-05; figures end 2025-12-31. Published n/a, accessed 2026-10-10, covers 2025 (provisional).
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: Spreadsheet t_3217_fr.xlsx, billions of euros: total compulsory levies EUR 1,305 billion, 43.6% of GDP. The 2025 accounts were revised on 29 May 2026.


## Harmonised OECD layer

- [ ] **Revenue Statistics 2025, Table 6.12: France, tax revenues by sub-sectors of government** – OECD
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

- [ ] **World Observatory on Subnational Government Finance and Investment – country profile: France** – OECD and United Cities and Local Governments (SNG-WOFI)
  - URL: https://www.sng-wofi.org/country_profiles/france.html
  - Feeds: `structure.json` (OECD level shares in the Trees table and the folio charts)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2022-10-24, accessed 2026-09-29, covers 2020.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Subnational government revenue by category as % of total subnational revenue, 2022 edition.


## Legal texts

- [ ] **Constitution du 4 octobre 1958 (arts. 34, 72-2)** – Légifrance
  - URL: https://www.legifrance.gouv.fr/loda/id/LEGITEXT000006071194
  - Feeds: legal/rate basis of 3 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Code général des impôts** – Légifrance
  - URL: https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006069577
  - Feeds: legal/rate basis of 26 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Code de la sécurité sociale** – Légifrance
  - URL: https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006073189
  - Feeds: legal/rate basis of 7 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Code général des collectivités territoriales** – Légifrance
  - URL: https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070633
  - Feeds: legal/rate basis of 7 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Code des douanes** – Légifrance
  - URL: https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006071570
  - Feeds: legal/rate basis of 3 node(s)
  - Status: current – last checked 2026-10-10. Published n/a, accessed 2026-10-10.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.


## Known gaps and moving rules (revisit first)

- `fr-cvae` is **scheduled**: The tax is being phased out by law; the rate falls each year until it is abolished.
