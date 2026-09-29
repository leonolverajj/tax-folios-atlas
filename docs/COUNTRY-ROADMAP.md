# Country roadmap

Generated 2026-09-29 by `npm run roadmap` from the data folders. **5** of the 38 OECD members have a full folio, **33** have the harmonised profile only (they already appear as fighters), 0 are not started. Brazil and Bolivia are also built (outside the OECD).

## Two levels of coverage

1. **Profile only** – `profiles/<id>.json`: the OECD 2023 tax mix, the split by level of government, the tax-to-GDP ratio and the subnational revenue structure. It takes minutes per country and is enough for the Fiscal Fighters comparison.
2. **Folio** – `countries/<id>/`: every tax and levy with its legal basis, rate and latest revenue, laid out as a folio. It takes days of research per country. Building a folio does not lose the profile: its `structure.json` replaces `profiles/<id>.json`.

The profile layer is what makes covering *all* countries realistic: the OECD publishes the same tables for every member (and for Latin America and the Caribbean, Asia-Pacific and Africa), so the fighters can grow to a hundred countries long before every folio exists.

## The 38 OECD members

| Country | Status | Folio wave | Why this wave |
|---|---|---|---|
| Australia | Profile only | 1 | Federal, income-tax heavy, no social-security contributions: a sharp contrast with the countries already built. |
| Austria | Profile only | 2 | Federal with revenue sharing; social contributions plus payroll taxes. |
| Belgium | Profile only | 2 | Federal with three regions and communities; high income and social charges. |
| Canada | Folio (researched) | – | Done. |
| Chile | Profile only | 3 | Unitary, VAT-led, a Latin American OECD reference next to Colombia and Mexico. |
| Colombia | Folio (partial) | – | Done (partial). |
| Costa Rica | Profile only | 3 | Small unitary state with sizeable social contributions. |
| Czechia | Profile only | 3 | Central Europe; social contributions and VAT. |
| Denmark | Profile only | 2 | Income-tax financed welfare state; almost no social contributions. |
| Estonia | Profile only | 4 | Distributed-profit corporate tax model. |
| Finland | Profile only | 2 | Nordic model with municipal income taxes. |
| France | Profile only | 1 | Highest tax take among large economies; social contributions and the CSG. |
| Germany | Profile only | 1 | Federal with joint taxes shared by Bund and Länder; social insurance dominant. |
| Greece | Profile only | 3 | VAT and social contributions; recent reforms. |
| Hungary | Profile only | 3 | Very high VAT share; local business tax. |
| Iceland | Profile only | 4 | Municipal income tax carries local government. |
| Ireland | Profile only | 2 | Corporation-tax concentration. |
| Israel | Profile only | 3 | Unitary, weak local tax base. |
| Italy | Profile only | 1 | Regional IRAP and municipal taxes on top of a heavy national system. |
| Japan | Folio (researched) | – | Done. |
| Korea | Profile only | 1 | Fast-growing tax system, low subnational autonomy. |
| Latvia | Profile only | 4 | Baltic; municipal income tax share. |
| Lithuania | Profile only | 4 | Baltic; social contributions. |
| Luxembourg | Profile only | 4 | Small; communal business tax. |
| Mexico | Folio (partial) | – | Done (partial). |
| Netherlands | Profile only | 2 | Box system for income tax; strong VAT and social premiums. |
| New Zealand | Profile only | 3 | Broad-based GST, no social contributions. |
| Norway | Profile only | 2 | Petroleum revenue is outside the tax figures: a good test of the rules. |
| Poland | Profile only | 3 | Largest Central European economy. |
| Portugal | Profile only | 3 | Unitary with autonomous regions. |
| Slovak Republic | Profile only | 4 | Social contributions and VAT. |
| Slovenia | Profile only | 4 | Social contributions and VAT. |
| Spain | Profile only | 1 | Regions collect and share large taxes (common and foral regimes). |
| Sweden | Profile only | 2 | Municipal income tax; employer contributions. |
| Switzerland | Profile only | 1 | Three-tier federal system with the most subnational tax autonomy. |
| Türkiye | Profile only | 3 | Unitary, indirect-tax heavy. |
| United Kingdom | Profile only | 1 | Westminster system; council tax and devolution. |
| United States | Folio (researched) | – | Done. |

### Wave 1 – the next folios: large economies and the main tax-system archetypes

- Australia (profile only)
- France (profile only)
- Germany (profile only)
- Italy (profile only)
- Korea (profile only)
- Spain (profile only)
- Switzerland (profile only)
- United Kingdom (profile only)

### Wave 2 – high-tax and Nordic/Benelux contrasts

- Austria (profile only)
- Belgium (profile only)
- Denmark (profile only)
- Finland (profile only)
- Ireland (profile only)
- Netherlands (profile only)
- Norway (profile only)
- Sweden (profile only)

### Wave 3 – emerging and mid-size OECD members

- Chile (profile only)
- Costa Rica (profile only)
- Czechia (profile only)
- Greece (profile only)
- Hungary (profile only)
- Israel (profile only)
- New Zealand (profile only)
- Poland (profile only)
- Portugal (profile only)
- Türkiye (profile only)

### Wave 4 – the remaining small economies

- Estonia (profile only)
- Iceland (profile only)
- Latvia (profile only)
- Lithuania (profile only)
- Luxembourg (profile only)
- Slovak Republic (profile only)
- Slovenia (profile only)

## Beyond the OECD

Already built: **Brazil**, **Bolivia**. Suggested next, because the same OECD publications cover them (Latin America and the Caribbean, Asia-Pacific, Africa editions), so their profile can be added the same way: Argentina, Peru, Uruguay, Ecuador, India, Indonesia, South Africa, China, Saudi Arabia.

## How to add one

- A profile: copy an existing `profiles/<id>.json`, replace the numbers with those of the OECD table, `npm run validate`.
- A folio: `npm run new-country`, then follow [ADDING-A-COUNTRY.md](ADDING-A-COUNTRY.md).
