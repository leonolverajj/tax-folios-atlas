# Methodology: what the sizes, the trees and the counts mean

## 1. Orb size = share of the whole country's tax take

Every tax core is drawn with an **area proportional to its share of one national total**, so the biggest orbs are the biggest revenue sources of the country, whichever government collects them. A US state sales tax and the federal individual income tax are directly comparable by eye.

**The national total** is the sum of a few named parts, each the taxes and compulsory contributions that one level of government (or one social scheme) collects, before transfers between governments:

| Country | Parts (latest national source unless marked OECD) |
|---|---|
| Australia | Commonwealth, state and territory, and local government taxation revenue (FY2024-25, ABS) |
| Austria | Federal taxes before sharing, family fund and unemployment insurance contributions, pension, health and accident insurance contributions (all 2025); Länder and municipal taxes (OECD, 2023) |
| Bolivia | SIN collection (2025); customs, social security and municipal taxes (OECD, 2023) |
| Brazil | Tax revenue of Union, states and municipalities (2024), from one source |
| Canada | Federal taxes + EI premiums (FY2024-25); Canada Pension Plan (FY2023-24); provincial taxes + social contributions (2024); municipal taxes (2024) |
| Chile | Central-government net taxes and recorded social contributions (2025, DIPRES); municipal taxes (OECD, 2023) |
| Colombia | DIAN gross collection (2025); departmental, municipal, social-security and payroll contributions (OECD, 2023) |
| Denmark | State taxes and charges and municipal taxes (2025), one Statistics Denmark table |
| Finland | State taxes, municipal taxes and compulsory social contributions (2025), one national accounts table |
| France | State and social security taxes and contributions, regions and départements, communes and groups (2025, provisional, INSEE table 3.217) |
| Germany | Taxes before distribution: federal, joint and customs taxes, Länder taxes, municipal taxes (2025, Destatis); five social insurance branches (2025 estimate, BMAS) |
| Ireland | Taxes collected by Revenue, excise and vehicle taxes, PRSI and the local property tax (2025); commercial rates (2024) |
| Italy | State taxes, social contributions, regional taxes, municipal taxes (2025, MEF and ISTAT) |
| Japan | National taxes (FY2025); prefectural taxes (FY2024); municipal taxes (FY2024); social insurance premiums (FY2023) |
| Mexico | Itemised federal taxes and IMSS/ISSSTE contributions (2025); state and municipal taxes (OECD, 2023) |
| Netherlands | Taxes of the Rijk, municipal taxes, water board taxes and statutory premiums (2025), one Statistics Netherlands table |
| New Zealand | Crown taxation revenue and compulsory ACC, fire and natural-hazard levies (year to 30 June 2026); council rates (June year 2026, provisional) |
| South Korea | National taxes (2025, NABO); local taxes (2025, provisional, Ministry of the Interior and Safety); five social insurance schemes (2025 collections, NHIS) |
| Spain | State taxes, Social Security contributions and the autonomic income-tax tariff (2025, AEAT and Ministry); other regional and local taxes (OECD, 2023) |
| Switzerland | Confederation, cantons and communes (OECD for the two lower levels) and the federal social insurances (all 2023) |
| United Kingdom | HMRC taxes and National Insurance, vehicle excise duty, council tax, English business rates (FY2025-26) |
| United States | Federal receipts (FY2025); state tax collections (FY2024); local tax revenue (FY2024) |

**The National Tax List folios (20 countries added in October 2026).** Nineteen European folios (Belgium, Bulgaria, Croatia, Czechia, Estonia, Greece, Hungary, Iceland, Latvia, Lithuania, Luxembourg, Malta, Norway, Poland, Portugal, Romania, Slovak Republic, Slovenia, Sweden) take every per-tax figure from one source: the *National Tax Lists* of the European Commission and Eurostat (edition 2026, calendar 2024, the list's cut-off 30 October 2025), in national currency. Their parts are the taxes of the list (State), the compulsory social contributions that the list gives separately (employers, households, self-employed), and the taxes that Eurostat's sector accounts (`gov_10a_taxag`, July 2026 release) record under local, regional or state government. All use calendar 2024, so the period spread is zero. The builder (`scripts/lib/ntl.ts`) checks for each folio that *the lines drawn + the lines left out = the list's totals* for taxes on production and imports (D2), on income and wealth (D5), actual social contributions (D61) and the EU's own resources (D91); the log of the build prints the reconciliation.

- **Level assignment follows Eurostat's sector accounts**, not the list: the list has one line per tax and no sector. A tax whose revenue Eurostat books to more than one sector (typically the personal income tax, sometimes corporate income tax or VAT) is drawn **once per receiving level**, with the local part equal to Eurostat's S.1313 (or S.1312) value and the State part equal to the list's total less that value. This is the OECD's *receiving* basis (section 3) and an exception to the "legislating level" rule below. Where it applies (the personal income tax of Latvia, Iceland, Poland, Portugal, Belgium, Sweden, Norway and Croatia are the large cases) the folio's note and the caveat of the part concerned say so. The two sources are different releases of the same year, and every folio states in a caveat how Eurostat's totals by tax code compare with the list's.
- **Left out**: what each country leaves out (for example the sale of emission permits, imputed social contributions, small municipal fees the list does not itemise) is named in its structure note, and `reconcile()` guarantees that nothing else is missing from the list's totals.
- **Rates** are *guidance* and are not all from the same kind of source: most of these folios use PwC's *Worldwide Tax Summaries* (2026 review, a commercial summary of the law, flagged "not official" in the source); Estonia uses the Tax and Customs Board (EMTA), Iceland the Directorate of Internal Revenue's 2024 tables (Skatturinn), Latvia the Ministry of Finance's summary of the 2026 changes, and Lithuania a Grant Thornton summary of the 2024 changes, because the tax authority's site (vmi.lt) answered with a bot challenge, which was not bypassed. The revenue year is 2024 and most rates are those of a 2026 review; this is stated on each instrument.
- **Bulgaria, Croatia, Malta and Romania are not OECD members**: they have no `structure.json` (no OECD 2023 level split) and the Trees table shows "n/a" for the OECD level shares; the validator reports it as a warning, not an error. Cyprus is not drawn because the list gives its lines no names.
- **Türkiye is partial**: the taxes of the central government budget for 2025 (Ministry of Treasury and Finance, December 2025 report, TRY million) are the only part. The social security premiums and the taxes of municipalities and special provincial administrations are not itemised, so the folio overstates every tax's share of a total that includes them; the OECD 2023 level layer is attached for comparison.

**The folios at the grain of the IMF's classification (119 countries, October 2026).** For countries without a detailed folio, the atlas draws the IMF's *Government Finance Statistics*, "Statement of Operations" (`GFS_SOO`, read through the IMF's SDMX interface: annual, in domestic currency). **This is a different kind of folio.** Each core is a *line of the GFS classification of taxes and social contributions* (taxes on the income of individuals, value added taxes, excises, customs duties, employers' social contributions …), not a separately legislated tax. The data mark these folios `grain: harmonised`; the Trees page tags them "IMF lines" and lists them in a section of their own, because their number of dots must not be compared with the detailed folios (one line can be several taxes, and countries report to the IMF at different depth). Rates, legal bases and the names of the country's own taxes are **not recorded** (the panel says "Not recorded in this folio"). The rules, all in `scripts/lib/gfs.ts`:

1. **Data accepted.** IMF flags A (actual) and P (preliminary) only, from 2017 on. Estimates and "not available" are never used. A year whose total repeats another year's total to the unit is rejected as carried-forward data (it removed Angola's 2024 and 2020).
2. **Year and sectors.** The latest year in which some scope passes the checks, then the broadest scope that passes in that year or in the two before it: *general government* (S13, when it equals the central government plus the state and local governments reported separately, to within 1.5%); *the central government with its social security funds* (when S13 equals it, so that no sub-national taxes are reported, or the IMF's S1321); *the central government* (S1311); or *the budgetary central government* (S1311B). A sector passes when its taxes are positive and its six main groups of taxes add up to the total within 1%. Of the 119 folios, 49 cover the general government (marked researched); the other 70 cover the central government only, with or without its social security funds (marked partial: taxes of regional and local governments are not drawn, and every line's share is a share of that sector's total).
3. **Lines.** The classification is expanded to the finest line the country reports. A line whose reported sub-lines fall short of it gets a core "Other … (not itemised)" for the difference; a line whose sub-lines exceed it by more than 0.5% is drawn whole; negative lines (refunds above collections; six lines in five folios, the largest 1.7% of the folio's total) are not drawn and are named in the folio's note; imputed social contributions are left out; lines below 0.15% of the total are folded into one "small lines" core per level and kind, and the codes folded are named in that core's calculation.
4. **Sizing.** The national total is the sum of the lines drawn (taxes plus actual social contributions as the IMF reports them), in domestic currency, one year. The cores of each level add up exactly to that level's part; the IMF's own sector total and the difference are written in the part's calculation.

Checks made, and their limits. (i) For 36 countries that also have a detailed folio, the same pipeline was run on the IMF series and the shares by OECD heading (income, social security, payroll, property, goods and services, other) compared with the detailed folio: the largest gap per country has a median of 3.1 points, is 3 points or less for 16 countries and 5 points or less for 24; the 12 above 5 points are Colombia (15.6; its detailed folio is partial), Sweden (9.2: the IMF series has 22% payroll taxes and 8% social contributions where the folio has 13% and 17%), New Zealand (7.7: the IMF series is the central government and has no property taxes, the folio draws council rates at 8%), Spain and Italy (7.5 and 7.4: the folios put 7% and 5% in "other", the IMF series none), and Hungary, South Korea, Mexico, Canada, the United Kingdom, Brazil and Chile (5.1 to 5.8). The differences are those of classification and coverage, not tested further. (ii) The currency and scale of every folio were checked automatically: the IMF's tax-to-GDP ratio gives an implied GDP in domestic currency, which was compared with the World Bank's GDP in US dollars times its official exchange rate for the same year. For 110 of the 119 folios this could be done and 107 fall between 0.7 and 1.4 of the World Bank figure; the three outside are Malawi (1.55, a fiscal year against a calendar-year GDP in a country with high inflation), Timor-Leste (0.54, not explained here) and Sierra Leone (whose 2018 series is in the old leone, labelled SLL, as the check showed). For Albania, Indonesia, Sri Lanka and Uganda the IMF gives no ratio, and the tax-to-GDP ratio against the World Bank's GDP (19.3%, 11.3%, 9.9% and 12.7%) is plausible; for Guinea, Palestine, San Marino, Somalia and South Sudan the exchange rate or the GDP was not available and **the currency was not checked this way**. (iii) The sums are exact: the lines drawn add up to the IMF's sector totals within rounding.

**Not verified.** The IMF's figures were not compared with the countries' own statistics, except through (i). The IMF labels a series by one year; where a country's fiscal year is not the calendar year, the label is the fiscal year the IMF assigns to it (stated in every folio). Where only the central government is reported, regional and local taxes may exist and are not drawn. The year of the IMF series is shown in every folio, and ranges from 2017 to 2025 (52 folios are 2024, 6 are 2017, 3 are 2018). There is no OECD level layer for countries outside the OECD (the Trees table shows n/a); Israel and Costa Rica, which are OECD members, carry theirs.

Each part is a documented figure with a source, period and locator (see the country panel, "Core sizes & the national total"). Non-tax revenue (royalties, fees, oil income, sales of goods), grants and transfers are left out, and the cores that represent them keep a small neutral size and say so. What each country leaves out is stated in its own note and in the caveat of each part (for example Switzerland's compulsory pension and health premiums, which are paid to private-law funds, and Australia's superannuation guarantee).

**The scale.** `radius = k × √share`, so area is proportional to share. Two limits keep the folio usable and both are printed in the legend: shares below **2.4%** are all drawn at the minimum radius (18 units), and shares of **30% or more** stop growing (64 units). A core with no tax-specific amount uses a deliberately small neutral radius (22), so "unknown" never looks bigger than a small tax. The scale is the same function for every country.

**Honest limits.** Parts come from different publishers and years (the validator allows at most 30 months between period ends and warns beyond 12; every country page states the spread). Shares are therefore approximate to roughly the growth of a year or two on the older parts. Countries marked "research: partial" have gaps that make some shares overstated; the panel says which.

### Where a tax is drawn: one rule for all countries

A tax is drawn **once**, under the level of government that **legislates and levies it**. Revenue that is shared afterwards is a transfer, and the text of the core says how it is split. Germany's income, corporation and sales taxes sit under the federal level although the Länder and municipalities receive large shares; Spain's VAT sits under the State although the communities receive half of it; Korea's local consumption tax sits under local government because the Local Tax Act makes it a local tax. Social insurance schemes sit under the national level when the national law sets them. This is a choice about **who decides**, and it differs from the OECD's choice below, which follows **who receives the money**; that is why the two level splits for Germany and France differ so much in the table below.

### Cross-check against the OECD

The national totals are built from national sources and are not forced to match anything. As a check, the table compares the share of each level in our total with the OECD's harmonised split of 2023 (the OECD shows social security funds apart; the folios draw them under the national level, so the OECD "central + social security" is compared with our national level where relevant).

| Country | Ours (level weights of the national total) | OECD 2023 |
|---|---|---|
| Australia | Commonwealth 80.4%, states 16.6%, councils 3.0% | central 80.8%, regional 16.3%, local 2.9% |
| Austria | Bund incl. social insurance 95.5%, Länder 1.7%, municipalities 2.8% | central 65.3% + social security 29.7%, regional 1.9%, local 3.1% |
| Bolivia | national + social security 95.3%, municipalities 4.7% | central 71.4% + social security 24.1%, local 4.5% |
| Brazil | one source for all levels; by core: Union 64.1%, states 24.8%, municipalities 6.9% (95.8% itemised) | central 45.4% + social security 25.2%, regional 23.0%, local 6.4% |
| Canada | federal incl. EI and CPP 52.2%, provinces 40.1%, municipalities 7.7% | central 43.2% + social security 10.3%, regional 38.0%, local 8.4% |
| Chile | central 92.8%, municipalities 7.2% | central 86.8% + social security 4.6%, local 8.6% |
| Colombia | national, social security and payroll 85.4%, departments 4.0%, municipalities 10.6% | central 76.9% + social security 7.3%, regional 4.3%, local 11.5% |
| Denmark | State 74.1%, municipalities 25.9% | central 73.1%, local 26.9% |
| Finland | State incl. compulsory contributions 89.6%, municipalities 10.4% | central 59.6% + social security 29.2%, local 11.2% |
| Ireland | State incl. PRSI 98.1%, councils 1.9% | central 84.4% + social security 14.0%, local 1.6% |
| Italy | State incl. social contributions 92.6%, regions 4.9%, municipalities 2.5% | central 59.4% + social security 29.7%, local (regions and municipalities) 10.9% |
| Japan | national incl. premiums 78.0%, prefectures 10.6%, municipalities 11.4% | central 38.6% + social security 39.1%, local 22.3% |
| Mexico | federal incl. IMSS and ISSSTE 94.3%, states 4.1%, municipalities 1.6% | central 80.3% + social security 13.5%, regional 4.5%, local 1.7% |
| Netherlands | Rijk incl. premiums 97.5%, municipalities 1.5%, water boards 0.9% | central 65.1% + social security 31.7%, local (municipalities, provinces, water boards) 3.2% |
| New Zealand | Crown 92.3%, councils 7.7% | central 93.5%, local 6.5% |
| South Korea | national incl. social insurance 82.4%, local 17.6% | central 53.3% + social security 29.2%, local 17.4% |
| Spain | State incl. Social Security 75.1%, communities 17.3%, municipalities 7.6% | central 41.8% + social security 34.2%, regional 16.0%, local 7.9% |
| Switzerland | Confederation incl. social insurance 58.5%, cantons 25.6%, communes 15.9% | central 33.5% + social security 24.7%, regional 25.8%, local 16.0% |
| United Kingdom | UK government 92.5%, councils 7.5% (devolved taxes sit inside the UK totals) | central 76.1% + social security 19.1%, local 4.8% |
| United States | federal 68.9%, states 19.4%, local 11.7% | central 41.5% + social security 23.5%, regional 20.5%, local 14.5% |
| Germany | Bund incl. social insurance 92.4%, Länder 2.0%, municipalities 5.6% | central 28.6% + social security 38.6%, regional 23.8%, local 8.9% |
| France | State and social security 92.7%, regions and départements 1.7%, communes 5.6% | central 30.0% + social security 55.7%, local 14.3% |
| Belgium | Federal incl. social contributions 85.3%, regions and communities 10.1%, local 4.5% | central 52.9% + social security 32.4%, regional 9.9%, local 4.8% |
| Czechia | State incl. social contributions 98.7%, local 1.3% | central 53.3% + social security 45.7%, local 1.0% |
| Estonia | State incl. social tax 99.5%, local 0.5% | central 83.1% + social security 16.3%, local 0.6% |
| Greece | State incl. social contributions 98.0%, local 2.0% | central 68.6% + social security 29.2%, local 2.3% |
| Hungary | State incl. social contributions 94.4%, local 5.6% | central 66.4% + social security 27.9%, local 5.7% |
| Iceland | State incl. social levy 71.6%, municipalities 28.4% | central 72.1%, local 27.9% |
| Latvia | State incl. social contributions 82.8%, municipalities 17.2% | central 52.4% + social security 30.8%, local 16.8% |
| Lithuania | State incl. social contributions 99.1%, municipalities 0.9% | central 67.0% + social security 31.9%, local 1.1% |
| Luxembourg | State incl. social contributions 95.2%, communes 4.8% | central 68.4% + social security 27.4%, local 4.2% |
| Norway | State incl. social contributions 86.6%, municipalities and counties 13.4% | central 87.4%, local 12.6% |
| Poland | State incl. social contributions 86.6%, local 13.4% | central 51.4% + social security 38.4%, local 10.2% |
| Portugal | State incl. social contributions 94.3%, regional and local 5.7% | central 67.2% + social security 26.9%, local 5.8% |
| Slovak Republic | State incl. social contributions 98.5%, local 1.5% | central 56.5% + social security 41.7%, local 1.8% |
| Slovenia | State incl. social contributions 98.8%, municipalities 1.2% | central 56.1% + social security 42.6%, local 1.3% |
| Sweden | State incl. employers’ fees 73.0%, municipalities and regions 27.0% | central 51.8% + social security 12.3%, local 35.9% |
| Türkiye (partial) | central-budget taxes only: 100% | central 64.5% + social security 26.5%, local 9.0% |
| Israel (IMF lines, 2024) | central government and social security 92.4%, local 7.6% | central 74.8% + social security 16.7%, local 8.4% |
| Costa Rica (IMF lines, 2024) | central government and social security 97.1%, local 2.9% | central 60.3% + social security 36.9%, local 2.8% |
| Bulgaria, Croatia, Malta, Romania | State 97.4% / 86.0% / 100% / 97.3%; local 2.6% / 14.0% / – / 2.7% | not OECD members: no OECD split (Croatia’s local share rests on Eurostat’s sector accounts) |
For the National Tax List folios the local shares are within one point of the OECD’s in all but three. **Sweden**: the folio’s local share (SEK 726 billion of the income tax of individuals, from Eurostat’s 2024 accounts) is 8.9 points below the OECD’s 2023 local share (SEK 893 billion of income taxes); the difference has not been reconciled and its cause is not established here. **Poland**: the folio’s local share is 3.2 points above the OECD’s, with the local parts of the personal and corporate income taxes taken from Eurostat’s 2024 accounts against the OECD’s 2023; this has not been analysed further. **Türkiye** is incomplete by construction (see above).

For Germany and France the folio and the OECD answer different questions. The OECD counts the Länder's and municipalities' shares of the joint taxes and of VAT as theirs; the folio draws those taxes once, under the legislating level. The remaining gaps for the United States, Canada and Mexico come from years and from lower levels that are only partly itemised (Mexico, Colombia, Bolivia: state and municipal taxes are taken from the OECD in aggregate). Other differences come from years (national figures are 2024–2026, the OECD's 2023) and from the OECD folding some fees into local taxes.

## 2. Skill trees (the Trees tab): what the counts mean

The Trees tab draws every folio as the same kind of small tree, all at the same scale, so that the shape of a tax system can be compared by eye. **Nothing is scored.** Every figure is a count or a share taken from the folio data.

**What is drawn.** The country is the centre; the levels of government are the first ring; every other dot is a charge (a tax, social contribution, duty or levy that has a core in the folio), placed in the sector of the level that levies it. Dot area is the charge's share of the national total (Section 1), or equal for every charge if you switch to "every charge equal" to compare the count alone. Sectors are as wide as the number and size of their charges need, with a minimum of 40°.

**Two kinds of tree.** The 42 detailed folios draw one dot per separately legislated charge. The 119 folios built from the IMF's classification (see Section 1) draw one dot per *line of that classification*; they are tagged "IMF lines" and sit in a section of their own under the detailed trees, with their counts labelled "lines" instead of "charges". A count of lines says nothing about how many taxes a country has: it is bounded by the classification (the folios have between 4 and 23 lines, the median folio 12). Compare counts only within one section; the sort options and the table keep the two kinds apart by the "Dots are" column.

**Counts** (see the column headings of the table under the trees):

| Measure | Definition |
|---|---|
| Charges drawn | Cores below a level of government. |
| Main charges | Charges that each raise at least 1% of the national total. |
| Charges for 80% of revenue | The smallest number of charges whose shares add up to 80% of the national total; n/a when the itemised charges explain less than 80%. |
| Largest charge | The biggest single share of the national total. |
| Smallest charge drawn | The smallest share of the national total among charges that have their own amount: how finely the folio is drawn. |
| Itemised | The share of the national total explained by charges with their own amount. |
| Levels | Levels of government drawn. |
| Kinds of tax | How many of the tax families (personal income, corporate income, social security, payroll, property, general consumption, excises, customs, resources, other) appear. |
| OECD level shares | The OECD's 2023 split of all tax and social contributions by sub-sector of government (national, regional, local, social security funds); one reference year for every country. |

**The grain rule (what gets a core).** One core per separately legislated charge. The ways a charge is collected (withholding, assessment, import VAT) are folded into it, a tax drawn whole at its levying level carries the sharing in its text, and very small charges are normally grouped into one "other" core per level. The rule is the same everywhere, but how small a charge can be and still be drawn depends on what each country publishes. The smallest charge drawn is about 0.03% of the national total for the Netherlands and 0.04% for Canada, and about 0.5% to 0.6% for Switzerland and New Zealand, so the count of charges is **not** a legal census, and a country that publishes less detail looks simpler than it is. The table shows the smallest charge next to the count for that reason, and "main charges" (≥ 1%) is the more robust of the two counts.

Known grain limits of the newest folios, from their own notes: Chile's income tax is one core because the central-government report does not split it; Switzerland's cantons and communes are drawn by what they tax (OECD codes), not tax by tax; Spain and Italy leave out parts that the sources do not publish by tax (the Basque Country and Navarre; the Italian waste tax and regional vehicle taxes); Korea draws liquor tax, stamp tax and arrears of earlier years as one core and takes the education tax from a news report of the ministry's figures; Finland’s figures are the Finnish Taxpayers’ Association’s compilation of Statistics Finland’s national accounts and its State income tax line includes the broadcasting tax; Austria’s Länder are one OECD figure and its municipal taxes are two taxes inside an OECD total, both for 2023; the Netherlands and Denmark draw one statistics office’s table in full, with small items grouped (Denmark’s table lists about 120 separate duties, which the folio groups into 33 charges); Ireland’s commercial rates are for 2024. The 19 National Tax List folios are drawn at the list’s grain, which is finer than most national tables (the smallest charge drawn is 0.01% of the national total for Belgium and Portugal and 0.02% for Czechia, Lithuania and Poland) but is the Commission’s harmonised line, not the legal census of each country’s charges; where the list has one line for several charges the folio has one core. Türkiye’s tree is the shortest (nine charges) because its folio holds only the central budget’s taxes, so its “itemised 100%” is measured against that partial total, not against all Turkish taxes and premiums; the Trees table marks it “partial”.

**What the trees cannot say.** A tree with fewer dots is not a better tax system, and one with more dots is not necessarily harder to comply with: rates, brackets, exemptions, credits and administration are not drawn, and compulsory payments that go to private funds (Swiss occupational pensions and health premiums, Australian superannuation, Chilean private pension managers) are outside the count by design.

## 3. The harmonised layer (`structure.json` and `profiles/`)

Comparing countries needs the same definitions and the same year. The "level of government" columns and the folio chart "Which level gets it" therefore use only the OECD Revenue Statistics (calendar 2023) and, for the subnational side, the OECD/UCLG observatory, never the newer national numbers used for sizing. The data live in `countries/<id>/structure.json` (folio countries that are OECD members; Bulgaria, Croatia, Malta and Romania have none) or `profiles/<id>.json` (countries still waiting for a folio; they are listed at the bottom of the Trees page).

- The OECD attributes each tax to the sub-sector of government that **receives** it (Interpretative Guide, section A.12); shared taxes are split by the legal shares. Older versions of the structure files called this basis "collecting government", which was wrong except for Mexico (whose file states its own rule) and has been corrected.
- Where a source gives only shares (the OECD's Latin American tables), the split is shown as shares.
- The OECD nets some adjustments into "other taxes", which can be slightly negative.
- Subnational data from the observatory is 2019–2020, the latest edition.

## 4. Sources

The OECD tables are read from the published Revenue Statistics 2025 (Table 3.1 and chapter 6 for OECD members; Table 1.4 and the country notes of Revenue Statistics in Latin America and the Caribbean 2025 for Brazil and Bolivia). Every structure file lists them with their tables, and the validator re-adds the tax types to the printed level totals on every run. National sources are listed per country in `docs/UPDATE-CHECKLIST.md`. The 119 folios at the grain of the IMF's classification use the IMF's SDMX interface (`https://api.imf.org/external/sdmx/2.1/`, dataflow `IMF.STA,GFS_SOO`, read with `scripts/extract-gfs.cjs` into `scripts/build/data/gfs-<CC>.json`); the identity data (ISO codes, names in the country's own language, currencies, coordinates) come from the open `mledoze/countries` dataset on GitHub (`scripts/extract-country-meta.cjs`); the World Bank's API (GDP in US dollars and official exchange rates) was used only for the currency check described above and is not part of any folio. The 19 European folios of October 2026 also use the Commission’s *National Tax Lists* (edition 2026, the Excel workbook of the Taxation Trends data page; read with `scripts/extract-ntl.cjs` into `scripts/build/data/ntl-<CC>.json`) and Eurostat’s `gov_10a_taxag` (July 2026 release; `scripts/extract-eurostat.cjs`). The OECD’s own data service (SDMX) was not reachable at the time (HTTP 500), so the OECD figures are the published tables.
