# Country roadmap

Generated 2026-10-11 by `npm run roadmap` from the data folders. **15** of the 38 OECD members have a full folio, **23** have the harmonised profile only (listed at the bottom of the Trees page), 0 are not started. Brazil and Bolivia are also built (outside the OECD).

## Two levels of coverage

1. **Profile only** – `profiles/<id>.json`: the OECD 2023 tax mix, the split by level of government, the tax-to-GDP ratio and the subnational revenue structure. It takes minutes per country; it is the starting point of the folio and puts the country in the "Next to be drawn" list of the Trees page.
2. **Folio** – `countries/<id>/`: every tax and levy with its legal basis, rate and latest revenue, laid out as a folio. It takes days of research per country. Building a folio does not lose the profile: its `structure.json` replaces `profiles/<id>.json`.

The profile layer is what makes covering *all* countries realistic: the OECD publishes the same tables for every member (and for Latin America and the Caribbean, Asia-Pacific and Africa), so the harmonised figures can be collected for a hundred countries long before every folio exists.

## The 38 OECD members

| Country | Status | Folio wave | Why this wave |
|---|---|---|---|
| Australia | Folio (researched) | – | Done. |
| Austria | Profile only | 2 | Federal with revenue sharing; social contributions plus payroll taxes. |
| Belgium | Profile only | 2 | Federal with three regions and communities; high income and social charges. |
| Canada | Folio (researched) | – | Done. |
| Chile | Folio (partial) | – | Done (partial: one income-tax core, municipal taxes from the OECD). |
| Colombia | Folio (partial) | – | Done (partial). |
| Costa Rica | Profile only | 3 | Small unitary state with sizeable social contributions. |
| Czechia | Profile only | 3 | Central Europe; social contributions and VAT. |
| Denmark | Profile only | 2 | Income-tax financed welfare state; almost no social contributions. |
| Estonia | Profile only | 4 | Distributed-profit corporate tax model. |
| Finland | Profile only | 2 | Nordic model with municipal income taxes. |
| France | Folio (researched) | – | Done. |
| Germany | Folio (researched) | – | Done. |
| Greece | Profile only | 3 | VAT and social contributions; recent reforms. |
| Hungary | Profile only | 3 | Very high VAT share; local business tax. |
| Iceland | Profile only | 4 | Municipal income tax carries local government. |
| Ireland | Profile only | 2 | Corporation-tax concentration. |
| Israel | Profile only | 3 | Unitary, weak local tax base. |
| Italy | Folio (partial) | – | Done (partial). |
| Japan | Folio (researched) | – | Done. |
| South Korea | Folio (researched) | – | Done. |
| Latvia | Profile only | 4 | Baltic; municipal income tax share. |
| Lithuania | Profile only | 4 | Baltic; social contributions. |
| Luxembourg | Profile only | 4 | Small; communal business tax. |
| Mexico | Folio (partial) | – | Done (partial). |
| Netherlands | Profile only | 2 | Box system for income tax; strong VAT and social premiums. |
| New Zealand | Folio (researched) | – | Done. |
| Norway | Profile only | 2 | Petroleum revenue is outside the tax figures: a good test of the rules. |
| Poland | Profile only | 3 | Largest Central European economy. |
| Portugal | Profile only | 3 | Unitary with autonomous regions. |
| Slovak Republic | Profile only | 4 | Social contributions and VAT. |
| Slovenia | Profile only | 4 | Social contributions and VAT. |
| Spain | Folio (partial) | – | Done (partial). |
| Sweden | Profile only | 2 | Municipal income tax; employer contributions. |
| Switzerland | Folio (researched) | – | Done. |
| Türkiye | Profile only | 3 | Unitary, indirect-tax heavy. |
| United Kingdom | Folio (researched) | – | Done. |
| United States | Folio (researched) | – | Done. |

### Wave 2 – the next folios: high-tax and Nordic/Benelux contrasts

- Austria (profile only)
- Belgium (profile only)
- Denmark (profile only)
- Finland (profile only)
- Ireland (profile only)
- Netherlands (profile only)
- Norway (profile only)
- Sweden (profile only)

### Wave 3 – emerging and mid-size OECD members

- Costa Rica (profile only)
- Czechia (profile only)
- Greece (profile only)
- Hungary (profile only)
- Israel (profile only)
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
- A folio: write a builder script `scripts/build/<id>.ts` (or scaffold with `npm run new-country`), then follow [ADDING-A-COUNTRY.md](ADDING-A-COUNTRY.md).
