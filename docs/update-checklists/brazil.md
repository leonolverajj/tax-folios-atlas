# Update checklist – Brazil

Generated 2026-09-29 by `npm run checklist`. **Do not edit by hand** – edit the sources in `countries/brazil/sources.json` and re-run it.

Research status: **researched**. 1 source(s) to check or due, 0 coming up, 30 in total.

When you have worked through a row: update the data, set its `accessed` date, run `npm run validate`, `npm test`, `npm run links -- --only=brazil`.

## Revenue figures and national-total parts

- [ ] **Carga Tributária no Brasil 2024 – Análise por Tributos e Bases de Incidência** – Receita Federal do Brasil (Centro de Estudos Tributários e Aduaneiros)
  - URL: https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/estudos/carga-tributaria/carga-tributaria-no-brasil-2024
  - Feeds: national-total parts: `total-tax-burden`; revenue of 21 core(s): `fed-irpf`, `fed-irrf`, `fed-irpj`, `fed-csll`, `fed-pis`, `fed-cofins`, `fed-inss`, `fed-ipi`, …
  - Status: **CHECK** – figures end 2024-12-31 (21 months ago); a newer edition may exist (record `nextExpected` in sources.json once you know). Published 2025-12-02, accessed 2026-09-28, covers Calendar year 2024.
  - To do: Open the source, find the newest period, update the amounts in revenue.json (keep the published unit and scale) and the matching part in country.json, update period, locator, `accessed`, then run `npm run validate`.
  - Note: PDF 'CTB 2024_v2.pdf'. Table TRIB 00 gives revenue by tax and level of government (R$ millions, % of GDP, % of total). Since this edition FGTS and Sistema S are excluded from the tax burden.


## Harmonised OECD layer

- [ ] **Revenue Statistics in Latin America and the Caribbean 2025: Brazil (country note)** – OECD
  - URL: https://www.oecd.org/content/dam/oecd/en/publications/reports/2025/05/revenue-statistics-in-latin-america-and-the-caribbean-2025-country-notes_29961c77/brazil_b08e62db/f6a5cb34-en.pdf
  - Feeds: `structure.json` (cross-country profile)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2025-05-27, accessed 2026-09-29, covers Calendar year 2023.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Tax-to-GDP ratio and tax structure by OECD heading, national currency.

- [ ] **Revenue Statistics in Latin America and the Caribbean 2025, Table 1.4: attribution of tax revenue to sub-sectors of general government** – OECD
  - URL: https://www.oecd.org/en/publications/revenue-statistics-in-latin-america-and-the-caribbean-2025_7594fbdd-en/full-report/tax-revenue-trends-1990-2023_ee246e3f.html
  - Feeds: `structure.json` (cross-country profile)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2025-05-27, accessed 2026-09-29, covers Calendar year 2023.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Share of central, state, local government and social security funds in total tax revenue.

- [ ] **World Observatory on Subnational Government Finance and Investment – country profile: Brazil** – OECD and United Cities and Local Governments (SNG-WOFI)
  - URL: https://www.sng-wofi.org/country_profiles/brazil.html
  - Feeds: `structure.json` (cross-country profile)
  - Status: yearly – OECD Revenue Statistics appear each December (OECD countries) and the Latin America edition each May. Published 2022-10-24, accessed 2026-09-29, covers 2020.
  - To do: Check whether a newer edition exists. If so, replace the year, the level totals/shares and tax types in structure.json for EVERY country together (the layer is only comparable when all countries share one year), then `npm run validate`.
  - Note: Subnational government revenue by category (tax revenue, grants and subsidies, tariffs and fees, property income, other) as % of total subnational revenue, 2022 edition.


## Rate and guidance pages

- [ ] **Perguntas e Respostas – tributação de lucros e dividendos e altas rendas (Lei 15.270/2025)** – Receita Federal do Brasil
  - URL: https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/dirf/manual_padrao_rfb_per_tributacao_cotin_v-19-12-2025.pdf
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 2025-12-19, accessed 2026-09-28.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.

- [ ] **Tabela de contribuição mensal (empregados, 2026)** – Instituto Nacional do Seguro Social (INSS)
  - URL: https://www.gov.br/inss/pt-br/direitos-e-deveres/inscricao-e-contribuicao/tabela-de-contribuicao-mensal
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28, covers 2026 (Portaria Interministerial MPS/MF nº 13, de 9 jan 2026).
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: 2026: 7.5% up to R$ 1,621.00; 9% to R$ 2,902.84; 12% to R$ 4,354.27; 14% to the ceiling of R$ 8,475.55.

- [ ] **Reforma Tributária do Consumo – programas e atividades** – Receita Federal do Brasil
  - URL: https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/acoes-e-programas/programas-e-atividades/reforma-tributaria-do-consumo
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.

- [ ] **Confaz – convênios e legislação do ICMS** – Conselho Nacional de Política Fazendária (Confaz)
  - URL: https://www.confaz.fazenda.gov.br/
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Re-read the rates and thresholds. Update `rate.headline`/`details`, `rate.asOf` and `checkedOn` of every instrument listed, and set `status`/`statusNote` if the rule is changing.
  - Note: Council of state finance secretaries; each state's ICMS rates are set in state law.


## Legal texts

- [ ] **Constituição da República Federativa do Brasil de 1988 (Título VI – Da Tributação e do Orçamento, arts. 145–162)** – Presidência da República (Planalto)
  - URL: https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm
  - Feeds: legal/rate basis of 21 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Lei nº 5.172/1966 – Código Tributário Nacional** – Presidência da República (Planalto)
  - URL: https://www.planalto.gov.br/ccivil_03/leis/l5172compilado.htm
  - Feeds: legal/rate basis of 3 node(s)
  - Status: current – last checked 2026-09-28. Published n/a, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Emenda Constitucional nº 132/2023 – Reforma Tributária do consumo (IBS, CBS, Imposto Seletivo)** – Presidência da República (Planalto)
  - URL: https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc132.htm
  - Feeds: legal/rate basis of 4 node(s)
  - Status: current – last checked 2026-09-28. Published 2023-12-20, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Lei Complementar nº 214/2025 – institui IBS, CBS e Imposto Seletivo** – Presidência da República (Planalto)
  - URL: https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp214.htm
  - Feeds: legal/rate basis of 6 node(s)
  - Status: current – last checked 2026-09-28. Published 2025-01-16, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.
  - Note: Sets the 2026 test rates (CBS 0.9%, IBS 0.1%) and the 2027–2033 transition.

- [ ] **Lei nº 15.270/2025 – isenção do IRPF até R$ 5.000, redutor até R$ 7.350, tributação mínima de altas rendas e retenção sobre dividendos** – Presidência da República (Planalto)
  - URL: https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15270.htm
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 2025-11-26, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Lei nº 9.249/1995 – IRPJ (alíquota de 15% e adicional de 10%)** – Presidência da República (Planalto)
  - URL: https://www.planalto.gov.br/ccivil_03/leis/l9249.htm
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 1995-12-26, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Lei nº 7.689/1988 – Contribuição Social sobre o Lucro Líquido (CSLL)** – Presidência da República (Planalto)
  - URL: https://www.planalto.gov.br/ccivil_03/leis/l7689.htm
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 1988-12-15, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Lei nº 10.637/2002 – PIS/Pasep não cumulativo** – Presidência da República (Planalto)
  - URL: https://www.planalto.gov.br/ccivil_03/leis/2002/l10637.htm
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 2002-12-30, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Lei nº 10.833/2003 – Cofins não cumulativa** – Presidência da República (Planalto)
  - URL: https://www.planalto.gov.br/ccivil_03/leis/2003/l10.833.htm
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 2003-12-29, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Lei nº 8.212/1991 – Plano de Custeio da Seguridade Social** – Presidência da República (Planalto)
  - URL: https://www.planalto.gov.br/ccivil_03/leis/l8212cons.htm
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 1991-07-24, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Decreto nº 7.212/2010 – Regulamento do IPI (RIPI)** – Presidência da República (Planalto)
  - URL: https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2010/decreto/d7212.htm
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 2010-06-15, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Decreto nº 6.306/2007 – Regulamento do IOF** – Presidência da República (Planalto)
  - URL: https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2007/decreto/d6306.htm
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 2007-12-14, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Decreto nº 6.759/2009 – Regulamento Aduaneiro (Imposto de Importação e de Exportação)** – Presidência da República (Planalto)
  - URL: https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2009/decreto/d6759.htm
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 2009-02-05, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Lei nº 9.393/1996 – Imposto sobre a Propriedade Territorial Rural (ITR)** – Presidência da República (Planalto)
  - URL: https://www.planalto.gov.br/ccivil_03/leis/l9393.htm
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 1996-12-19, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Lei nº 10.336/2001 – CIDE-Combustíveis** – Presidência da República (Planalto)
  - URL: https://www.planalto.gov.br/ccivil_03/leis/leis_2001/l10336.htm
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 2001-12-19, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Lei nº 10.168/2000 – CIDE sobre remessas ao exterior (CIDE-Remessas)** – Presidência da República (Planalto)
  - URL: https://www.planalto.gov.br/ccivil_03/leis/l10168.htm
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 2000-12-29, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Lei nº 9.424/1996 – Salário-Educação (art. 15)** – Presidência da República (Planalto)
  - URL: https://www.planalto.gov.br/ccivil_03/leis/l9424.htm
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 1996-12-24, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Lei Complementar nº 87/1996 (Lei Kandir) – normas gerais do ICMS** – Presidência da República (Planalto)
  - URL: https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp87.htm
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 1996-09-13, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Lei (SP) nº 13.296/2008 – Imposto sobre a Propriedade de Veículos Automotores (IPVA) – exemplo estadual** – Assembleia Legislativa do Estado de São Paulo
  - URL: https://www.al.sp.gov.br/repositorio/legislacao/lei/2008/lei-13296-23.12.2008.html
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 2008-12-23, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Lei Complementar nº 116/2003 – Imposto sobre Serviços de Qualquer Natureza (ISS)** – Presidência da República (Planalto)
  - URL: https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp116.htm
  - Feeds: legal/rate basis of 1 node(s)
  - Status: current – last checked 2026-09-28. Published 2003-07-31, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.

- [ ] **Emenda Constitucional nº 39/2002 – Contribuição para o Custeio do Serviço de Iluminação Pública (art. 149-A)** – Presidência da República (Planalto)
  - URL: https://www.planalto.gov.br/ccivil_03/constituicao/emendas/emc/emc39.htm
  - Feeds: legal/rate basis of 2 node(s)
  - Status: current – last checked 2026-09-28. Published 2002-12-19, accessed 2026-09-28.
  - To do: Check for amendments since the last check (new law, court ruling, repeal). Update the instruments listed, their `status` and `checkedOn`.


## Context and cross-checks

- [ ] **Arrecadação Federal – relatórios 2025 (Análise Mensal, incl. dezembro/2025)** – Receita Federal do Brasil
  - URL: https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/relatorios/arrecadacao-federal/2025
  - Feeds: cross-check
  - Status: published 2026-01-22. Published 2026-01-22, accessed 2026-09-28, covers Calendar year 2025.
  - To do: Context only: re-open if a related figure or rule changes.
  - Note: Federal collection only (R$ 2.886 trillion in 2025 vs R$ 2.652 trillion in 2024, announced 22 January 2026). Used as context; not mixed with the 2024 all-levels figures. The Receita and Ministry of Finance press-release pages for this announcement answered 'Conteúdo restrito – authentication required' when checked on 2026-09-28, so the public report index is cited instead.


## Known gaps and moving rules (revisit first)

- `fed-cbs`: Not yet a revenue source: 2026 is a test year with a 0.9% rate that is offset against PIS/Cofins. Collections begin in 2027.
- `fed-is`: Takes effect in 2027; no collections yet.
- `state-ibs`: 2026 is a test year (0.1% shared with municipalities, offset against other taxes); the IBS replaces the ICMS only from 2029.
- `mun-ibs`: 2026 is a test year (0.1% shared with states, offset against other taxes); the IBS replaces the ISS only from 2029.
- `fed-pis` is **transitional**: Still in force in 2026, but extinguished from 1 January 2027 when the CBS takes its place (LC 214/2025). In 2026 the CBS test rate of 0.9% is levied and offset against PIS/Cofins.
- `fed-cofins` is **transitional**: Still in force in 2026, but extinguished from 1 January 2027 when the CBS takes its place (LC 214/2025).
- `fed-ipi` is **transitional**: Rates are reduced to zero from 2027 for most goods (kept for products that compete with those made in the Zona Franca de Manaus), as the CBS and the Selective Tax take over (LC 214/2025).
- `fed-cbs` is **scheduled**: Test rate of 0.9% in 2026 (offset against PIS/Cofins); replaces PIS and Cofins from 1 January 2027.
- `fed-is` is **scheduled**: Takes effect in 2027; rates are set by law.
- `state-icms` is **transitional**: In force. Between 2029 and 2032 the ICMS is phased down and replaced by the IBS; it is extinguished in 2033 (EC 132/2023, LC 214/2025).
- `state-ibs` is **scheduled**: Test rate of 0.1% in 2026 (shared by states and municipalities); replaces the ICMS and ISS gradually from 2029 to 2032 and fully from 2033. Shown once for states and once for municipalities because each sets its own share of the rate.
- `mun-iss` is **transitional**: In force. Phased down and replaced by the IBS between 2029 and 2032; extinguished in 2033.
- `mun-ibs` is **scheduled**: Test rate of 0.1% in 2026 (shared with states); replaces the ISS gradually from 2029 to 2032 and fully from 2033.
