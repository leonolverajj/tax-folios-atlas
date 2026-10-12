# Country roadmap

Generated 2026-10-12 by `npm run roadmap` from the data folders. **36** of the 38 OECD members have a full folio, **2** have the harmonised profile only (listed at the bottom of the Trees page), 0 are not started. Brazil, Bolivia, Bulgaria, Croatia, Malta and Romania are also built (outside the OECD).

## Two levels of coverage

1. **Profile only** – `profiles/<id>.json`: the OECD 2023 tax mix, the split by level of government, the tax-to-GDP ratio and the subnational revenue structure. It takes minutes per country; it is the starting point of the folio and puts the country in the "Next to be drawn" list of the Trees page.
2. **Folio** – `countries/<id>/`: every tax and levy with its legal basis, rate and latest revenue, laid out as a folio. It takes days of research per country. Building a folio does not lose the profile: its `structure.json` replaces `profiles/<id>.json`.

The profile layer is what makes covering *all* countries realistic: the OECD publishes the same tables for every member (and for Latin America and the Caribbean, Asia-Pacific and Africa), so the harmonised figures can be collected for a hundred countries long before every folio exists.

## The 38 OECD members

| Country | Status | Folio wave | Why this wave |
|---|---|---|---|
| Australia | Folio (researched) | – | Done. |
| Austria | Folio (partial) | – | Done (partial). |
| Belgium | Folio (researched) | – | Done. |
| Canada | Folio (researched) | – | Done. |
| Chile | Folio (partial) | – | Done (partial: one income-tax core, municipal taxes from the OECD). |
| Colombia | Folio (partial) | – | Done (partial). |
| Costa Rica | Profile only | 3 | Small unitary state with sizeable social contributions. |
| Czechia | Folio (researched) | – | Done. |
| Denmark | Folio (researched) | – | Done. |
| Estonia | Folio (researched) | – | Done. |
| Finland | Folio (researched) | – | Done. |
| France | Folio (researched) | – | Done. |
| Germany | Folio (researched) | – | Done. |
| Greece | Folio (researched) | – | Done. |
| Hungary | Folio (researched) | – | Done. |
| Iceland | Folio (researched) | – | Done. |
| Ireland | Folio (researched) | – | Done. |
| Israel | Profile only | 3 | Unitary, weak local tax base. |
| Italy | Folio (partial) | – | Done (partial). |
| Japan | Folio (researched) | – | Done. |
| South Korea | Folio (researched) | – | Done. |
| Latvia | Folio (researched) | – | Done. |
| Lithuania | Folio (researched) | – | Done. |
| Luxembourg | Folio (researched) | – | Done. |
| Mexico | Folio (partial) | – | Done (partial). |
| Netherlands | Folio (researched) | – | Done. |
| New Zealand | Folio (researched) | – | Done. |
| Norway | Folio (researched) | – | Done. |
| Poland | Folio (researched) | – | Done. |
| Portugal | Folio (researched) | – | Done. |
| Slovak Republic | Folio (researched) | – | Done. |
| Slovenia | Folio (researched) | – | Done. |
| Spain | Folio (partial) | – | Done (partial). |
| Sweden | Folio (researched) | – | Done. |
| Switzerland | Folio (researched) | – | Done. |
| Türkiye | Folio (partial) | – | Done (partial: central-budget taxes only; no social security premiums or municipal taxes). |
| United Kingdom | Folio (researched) | – | Done. |
| United States | Folio (researched) | – | Done. |

### Wave 3 – emerging and mid-size OECD members

- Costa Rica (profile only)
- Israel (profile only)

## Beyond the OECD

Already built: **Brazil**, **Bolivia**, **Bulgaria**, **Croatia**, **Malta**, **Romania** (the last four from the European Commission’s National Tax Lists and Eurostat, without an OECD level layer). Cyprus, also on that list, is not built because the list gives its lines no names. Suggested next, because the same OECD publications cover them (Latin America and the Caribbean, Asia-Pacific, Africa editions), so their profile can be added the same way: Argentina, Peru, Uruguay, Ecuador, India, Indonesia, South Africa, China, Saudi Arabia.

## How to add one

- A profile: copy an existing `profiles/<id>.json`, replace the numbers with those of the OECD table, `npm run validate`.
- A folio: write a builder script `scripts/build/<id>.ts` (or scaffold with `npm run new-country`), then follow [ADDING-A-COUNTRY.md](ADDING-A-COUNTRY.md).
