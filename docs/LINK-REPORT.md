# Link report

Checked 2026-10-12 with `npm run links` (525 source URLs).

| Class | Count | Meaning |
|---|---|---|
| ok | 464 | answered 2xx |
| redirected | 13 | answered 2xx after redirects; confirm the target if the path changed |
| manual | 27 | automated check inconclusive; the page was checked another way, recorded with the method in `scripts/link-verified.json` |
| blocked | 21 | the site refuses or ignores automated requests (401/403/429/503, timeouts, certificate chains Node cannot verify): **unverified**, open by hand |
| suspect | 0 | redirects to an error or login page: the page is gone or the site rejects automated clients |
| broken | 0 | 404/410/other errors or DNS failure: fix or replace the source |

## Blocked

| Country | Source id | Status | Note | URL |
|---|---|---|---|---|
| colombia | `constitucion-1991` | – | ETIMEDOUT – no answer to an automated request; open in a browser | https://www.secretariasenado.gov.co/senado/basedoc/constitucion_politica_1991.html |
| colombia | `ley-100-1993` | – | ETIMEDOUT – no answer to an automated request; open in a browser | https://www.secretariasenado.gov.co/senado/basedoc/ley_0100_1993.html |
| colombia | `ley-1607-2012` | – | ETIMEDOUT – no answer to an automated request; open in a browser | https://www.secretariasenado.gov.co/senado/basedoc/ley_1607_2012.html |
| colombia | `ley-223-1995` | – | ETIMEDOUT – no answer to an automated request; open in a browser | https://www.secretariasenado.gov.co/senado/basedoc/ley_0223_1995.html |
| colombia | `ley-44-1990` | – | ETIMEDOUT – no answer to an automated request; open in a browser | https://www.secretariasenado.gov.co/senado/basedoc/ley_0044_1990.html |
| colombia | `ley-14-1983` | – | ETIMEDOUT – no answer to an automated request; open in a browser | https://www.secretariasenado.gov.co/senado/basedoc/ley_0014_1983.html |
| colombia | `ley-388-1997` | – | ETIMEDOUT – no answer to an automated request; open in a browser | https://www.secretariasenado.gov.co/senado/basedoc/ley_0388_1997.html |
| finland | `vm-earned-income` | – | TLS: UNABLE_TO_GET_ISSUER_CERT_LOCALLY – certificate not verifiable from Node; open in a browser | https://vm.fi/en/taxation-of-earned-income |
| france | `constitution-1958` | 403 | site refuses automated requests; verify by hand | https://www.legifrance.gouv.fr/loda/id/LEGITEXT000006071194 |
| france | `cgi` | 403 | site refuses automated requests; verify by hand | https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006069577 |
| france | `css` | 403 | site refuses automated requests; verify by hand | https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006073189 |
| france | `cgct` | 403 | site refuses automated requests; verify by hand | https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006070633 |
| france | `cdd` | 403 | site refuses automated requests; verify by hand | https://www.legifrance.gouv.fr/codes/texte_lc/LEGITEXT000006071570 |
| mexico | `cp-2025-ingresos` | – | TLS: UNABLE_TO_VERIFY_LEAF_SIGNATURE – certificate not verifiable from Node; open in a browser | https://www.cuentapublica.hacienda.gob.mx/work/models/CP/2025/tomo/I/I50.06.IPP.pdf |
| united-states | `ssa-cbb` | 403 | site refuses automated requests; verify by hand | https://www.ssa.gov/oact/cola/cbb.html |
| united-states | `us-constitution-art1` | 403 | site refuses automated requests; verify by hand | https://constitution.congress.gov/browse/article-1/section-8/ |
| united-states | `us-constitution-amend16` | 403 | site refuses automated requests; verify by hand | https://constitution.congress.gov/browse/amendment-16/ |
| united-states | `us-constitution-amend10` | 403 | site refuses automated requests; verify by hand | https://constitution.congress.gov/browse/amendment-10/ |
| united-states | `ca-rtc` | 403 | site refuses automated requests; verify by hand | https://leginfo.legislature.ca.gov/faces/codesTOCSelected.xhtml?tocCode=RTC&tocTitle=+Revenue+and+Taxation+Code+-+RTC |
| united-states | `ny-tax-law-art31` | 403 | site refuses automated requests; verify by hand | https://www.nysenate.gov/legislation/laws/TAX/A31 |
| united-states | `ca-const-13a` | 403 | site refuses automated requests; verify by hand | https://leginfo.legislature.ca.gov/faces/codes_displayText.xhtml?lawCode=CONS&article=XIII+A |

## Manual

| Country | Source id | Status | Note | URL |
|---|---|---|---|---|
| australia | `oecd-rs-2025-subsectors` | 403 | checked separately 2026-09-29: opened in a real browser (the checker gets HTTP 403 from the OECD site); the tables cited were read from this page (automated result: blocked 403) | https://www.oecd.org/en/publications/revenue-statistics-2025_3a264267-en/full-report/tax-revenues-by-subsectors-of-general-government_f9e88332.html |
| australia | `oecd-rs-2025-levels` | 403 | checked separately 2026-09-29: opened in a real browser (the checker gets HTTP 403 from the OECD site); the tables cited were read from this page (automated result: blocked 403) | https://www.oecd.org/en/publications/revenue-statistics-2025_3a264267-en/full-report/tax-levels-and-tax-structures-1965-2024_2033f3ea.html |
| australia | `constitution` | 403 | checked separately 2026-10-11: opened in the built-in browser (the checker gets HTTP 403); the page loaded with the title "The Australian Constitution online - Parliamentary Education Office" (automated result: blocked 403) | https://peo.gov.au/understand-our-parliament/how-parliament-works/the-australian-constitution/the-australian-constitution-online |
| australia | `ato-resident-rates` | 403 | checked separately 2026-10-11: opened in the built-in browser (the checker gets HTTP 403); the page loaded with the title "Tax rates – Australian resident" (automated result: blocked 403) | https://www.ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents |
| australia | `ato-medicare-levy` | 403 | checked separately 2026-10-11: opened in the built-in browser (the checker gets HTTP 403); the page loaded with the title "Medicare levy" (automated result: blocked 403) | https://www.ato.gov.au/individuals-and-families/medicare-and-private-health-insurance/medicare-levy |
| australia | `ato-company-rates` | 403 | checked separately 2026-10-11: opened in the built-in browser (the checker gets HTTP 403); the page loaded with the title "Company tax rates" (automated result: blocked 403) | https://www.ato.gov.au/tax-rates-and-codes/company-tax-rates |
| australia | `ato-fbt-rates` | 403 | checked separately 2026-10-11: opened in the built-in browser (the checker gets HTTP 403); the page loaded with the title "Fringe benefits tax - rates and thresholds" (automated result: blocked 403) | https://www.ato.gov.au/tax-rates-and-codes/fringe-benefits-tax-rates-and-thresholds |
| australia | `ato-super-rates` | 403 | checked separately 2026-10-11: opened in the built-in browser (the checker gets HTTP 403); the page loaded with the title "Key super rates and thresholds" (automated result: blocked 403) | https://www.ato.gov.au/tax-rates-and-codes/key-superannuation-rates-and-thresholds |
| australia | `ato-excise-fuel` | 403 | checked separately 2026-10-11: opened in the built-in browser (the checker gets HTTP 403); the page loaded with the title "Excise duty rates for fuel and petroleum products" (automated result: blocked 403) | https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/excise-on-fuel-and-petroleum-products/excise-duty-rates-for-fuel-and-petroleum-products |
| australia | `ato-excise-alcohol` | 403 | checked separately 2026-10-11: opened in the built-in browser (the checker gets HTTP 403); the page loaded with the title "Excise duty rates for alcohol" (automated result: blocked 403) | https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/excise-on-alcohol/excise-duty-rates-for-alcohol |
| australia | `ato-excise-tobacco` | 403 | checked separately 2026-10-11: opened in the built-in browser (the checker gets HTTP 403); the page loaded with the title "Excise duty rates for tobacco" (automated result: blocked 403) | https://www.ato.gov.au/businesses-and-organisations/gst-excise-and-indirect-taxes/tobacco-and-excise/excise-duty-rates-for-tobacco |
| australia | `nsw-lga-1993` | 403 | checked separately 2026-10-11: opened in the built-in browser (the checker gets HTTP 403); the page loaded with the title "Local Government Act 1993 No 30 - NSW Legislation" (automated result: blocked 403) | https://legislation.nsw.gov.au/view/html/inforce/current/act-1993-030 |
| bolivia | `mefp-alivio-tributario` | – | checked separately 2026-09-28: opened with a browser-like fetch client (not the checker) and the expected page content was returned (automated result: blocked) | https://www.economiayfinanzas.gob.bo/node/19055 |
| bolivia | `oecd-rs-lac-2025-levels` | 403 | checked separately 2026-09-29: opened in a real browser (the checker gets HTTP 403 from the OECD site); the tables cited were read from this page (automated result: blocked 403) | https://www.oecd.org/en/publications/revenue-statistics-in-latin-america-and-the-caribbean-2025_7594fbdd-en/full-report/tax-revenue-trends-1990-2023_ee246e3f.html |
| brazil | `confaz` | – | checked separately 2026-09-28: the site refuses connections from the build network; listed by a web search index as the official Confaz site and convênio index (automated result: blocked) | https://www.confaz.fazenda.gov.br/ |
| canada | `pac-2025-v2-s1` | – | checked separately 2026-09-28: opened with a browser-like fetch client (not the checker) and the expected page content was returned (automated result: blocked) | https://www.tpsgc-pwgsc.gc.ca/recgen/cpc-pac/2025/vol2/s1/ecrc-csre-eng.html |
| canada | `pac-2025-v1-s3` | – | checked separately 2026-09-28: opened with a browser-like fetch client (not the checker) and the expected page content was returned (automated result: blocked) | https://www.tpsgc-pwgsc.gc.ca/recgen/cpc-pac/2025/vol1/s3/rvnu-eng.html |
| chile | `dipres-ejecucion-2025-12` | – | checked separately 2026-10-11: downloaded and read in full (21 pages; the checker fails on the site certificate chain); it is the report Informe de Ejecución del Gobierno Central, Diciembre 2025 (automated result: blocked) | https://www.dipres.gob.cl/598/articles-403882_doc_pdf1.pdf |
| colombia | `estatuto-tributario` | – | checked separately 2026-09-28: the Senate host refuses connections from the build network; this exact URL is listed by a web search index as the official Senate text (automated result: blocked) | https://www.secretariasenado.gov.co/senado/basedoc/estatuto_tributario.html |
| colombia | `ley-2277-2022` | – | checked separately 2026-09-28: the Senate host refuses connections from the build network; this exact URL is listed by a web search index as the official Senate text (automated result: blocked) | https://www.secretariasenado.gov.co/senado/basedoc/ley_2277_2022.html |
| colombia | `ley-2056-2020` | – | checked separately 2026-09-28: the Senate host refuses connections from the build network; this exact URL is listed by a web search index as the official Senate text (automated result: blocked) | https://www.secretariasenado.gov.co/senado/basedoc/ley_2056_2020.html |
| colombia | `ley-1819-2016` | – | checked separately 2026-09-28: the Senate host refuses connections from the build network; this exact URL is listed by a web search index as the official Senate text (automated result: blocked) | https://www.secretariasenado.gov.co/senado/basedoc/ley_1819_2016.html |
| colombia | `ley-1816-2016` | – | checked separately 2026-09-28: the Senate host refuses connections from the build network; this exact URL is listed by a web search index as the official Senate text (automated result: blocked) | https://www.secretariasenado.gov.co/senado/basedoc/ley_1816_2016.html |
| colombia | `ley-488-1998` | – | checked separately 2026-09-28: the Senate host refuses connections from the build network; this exact URL is listed by a web search index as the official Senate text (automated result: blocked) | https://www.secretariasenado.gov.co/senado/basedoc/ley_0488_1998.html |
| colombia | `decreto-1333-1986` | – | checked separately 2026-09-28: the Senate host refuses connections from the build network; this exact URL is listed by a web search index as the official Senate text (automated result: blocked) | https://www.secretariasenado.gov.co/senado/basedoc/decreto_1333_1986.html |
| new-zealand | `fsgnz-2026` | 403 | checked separately 2026-10-11: opened in the built-in browser (the checker gets HTTP 403); the page loaded with the title "Financial Statements of the Government of New Zealand for the Year Ended 30 June 2026" (automated result: blocked 403) | https://www.treasury.govt.nz/publications/year-end/financial-statements-2026 |
| united-states | `treasury-mts-fy2025` | – | checked separately 2026-09-28: opened with a fetch client; the Monthly Treasury Statement dataset page loads (the checker fails on the site certificate chain) (automated result: blocked) | https://fiscaldata.treasury.gov/datasets/monthly-treasury-statement/receipts-of-the-u-s-government |

## Redirected

| Country | Source id | Status | Note | URL |
|---|---|---|---|---|
| netherlands | `grondwet` | 200 | path changed → https://wetten.overheid.nl/BWBR0001840/2023-02-22 | https://wetten.overheid.nl/BWBR0001840/ |
| netherlands | `awr` | 200 | path changed → https://wetten.overheid.nl/BWBR0002320/2026-10-01 | https://wetten.overheid.nl/BWBR0002320/ |
| netherlands | `wet-ib-2001` | 200 | path changed → https://wetten.overheid.nl/BWBR0011353/2026-02-21 | https://wetten.overheid.nl/BWBR0011353/ |
| netherlands | `wet-lb-1964` | 200 | path changed → https://wetten.overheid.nl/BWBR0002471/2026-02-21 | https://wetten.overheid.nl/BWBR0002471/ |
| netherlands | `wet-vpb-1969` | 200 | path changed → https://wetten.overheid.nl/BWBR0002672/2026-01-01 | https://wetten.overheid.nl/BWBR0002672/ |
| netherlands | `wet-ob-1968` | 200 | path changed → https://wetten.overheid.nl/BWBR0002629/2026-01-01 | https://wetten.overheid.nl/BWBR0002629/ |
| netherlands | `gemeentewet` | 200 | path changed → https://wetten.overheid.nl/BWBR0005416/2026-10-01 | https://wetten.overheid.nl/BWBR0005416/ |
| netherlands | `waterschapswet` | 200 | path changed → https://wetten.overheid.nl/BWBR0008531/2004-11-26 | https://wetten.overheid.nl/BWBR0008531/ |
| netherlands | `zvw` | 200 | path changed → https://wetten.overheid.nl/BWBR0018450/2026-01-01 | https://wetten.overheid.nl/BWBR0018450/ |
| netherlands | `aow` | 200 | path changed → https://wetten.overheid.nl/BWBR0002221/2026-07-01 | https://wetten.overheid.nl/BWBR0002221/ |
| netherlands | `wlz` | 200 | path changed → https://wetten.overheid.nl/BWBR0036014/2026-05-30 | https://wetten.overheid.nl/BWBR0036014/ |
| netherlands | `ww` | 200 | path changed → https://wetten.overheid.nl/BWBR0004045/2026-07-01 | https://wetten.overheid.nl/BWBR0004045/ |
| netherlands | `wia` | 200 | path changed → https://wetten.overheid.nl/BWBR0019057/2026-07-01 | https://wetten.overheid.nl/BWBR0019057/ |

