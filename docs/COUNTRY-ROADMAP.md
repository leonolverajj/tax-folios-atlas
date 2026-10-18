# Country roadmap

Generated 2026-10-18 by `npm run roadmap` from the data folders. **161 folios**: 42 detailed (one core per legislated tax) and 119 at the grain of the IMF's classification (one core per line of the IMF's Government Finance Statistics; see [METHODOLOGY](METHODOLOGY.md)). They cover **160 of the 193 UN member states**, and Palestine, an observer state; 33 members have no folio (table below). **38** of the 38 OECD members have a folio, 0 have the harmonised profile only, 0 are not started.

## Kinds of coverage

1. **Detailed folio**: `countries/<id>/` built from the country's own statistics (or the European Commission's National Tax Lists), one core per separately legislated charge, with legal basis, rate and latest revenue. It takes days of research per country (hours with the National Tax Lists).
2. **IMF lines**: the same folder, built by `scripts/build/gfs-countries.ts` from the IMF's Government Finance Statistics. Minutes per country; no rates or legal bases; central government only unless the IMF reports sub-national taxes. Tagged `grain: harmonised`.
3. **Profile only**: `profiles/<id>.json`, the OECD 2023 tax mix and level split of a country that has no folio yet. None is left.

## The 38 OECD members

| Country | Status |
|---|---|
| Australia | Folio (detailed, researched) |
| Austria | Folio (detailed, partial) |
| Belgium | Folio (detailed, researched) |
| Canada | Folio (detailed, researched) |
| Chile | Folio (detailed, partial) |
| Colombia | Folio (detailed, partial) |
| Costa Rica | Folio (IMF lines, researched) |
| Czechia | Folio (detailed, researched) |
| Denmark | Folio (detailed, researched) |
| Estonia | Folio (detailed, researched) |
| Finland | Folio (detailed, researched) |
| France | Folio (detailed, researched) |
| Germany | Folio (detailed, researched) |
| Greece | Folio (detailed, researched) |
| Hungary | Folio (detailed, researched) |
| Iceland | Folio (detailed, researched) |
| Ireland | Folio (detailed, researched) |
| Israel | Folio (IMF lines, researched) |
| Italy | Folio (detailed, partial) |
| Japan | Folio (detailed, researched) |
| South Korea | Folio (detailed, researched) |
| Latvia | Folio (detailed, researched) |
| Lithuania | Folio (detailed, researched) |
| Luxembourg | Folio (detailed, researched) |
| Mexico | Folio (detailed, partial) |
| Netherlands | Folio (detailed, researched) |
| New Zealand | Folio (detailed, researched) |
| Norway | Folio (detailed, researched) |
| Poland | Folio (detailed, researched) |
| Portugal | Folio (detailed, researched) |
| Slovak Republic | Folio (detailed, researched) |
| Slovenia | Folio (detailed, researched) |
| Spain | Folio (detailed, partial) |
| Sweden | Folio (detailed, researched) |
| Switzerland | Folio (detailed, researched) |
| Türkiye | Folio (detailed, partial) |
| United Kingdom | Folio (detailed, researched) |
| United States | Folio (detailed, researched) |

## The 193 UN member states and the two observer states

A country without a folio is not covered because the IMF series does not give usable taxes by line for it (reasons below); a detailed folio would need that country's own statistics.

| Country | Coverage | Why none |
|---|---|---|
| Afghanistan | Folio (IMF lines, researched, 2017) |  |
| Albania | Folio (IMF lines, researched, 2024) |  |
| Algeria | None | The IMF series has no tax data for this country. |
| Andorra | Folio (IMF lines, researched, 2024) |  |
| Angola | Folio (IMF lines, partial, 2023) |  |
| Antigua and Barbuda | None | The IMF series has no tax data for this country. |
| Argentina | Folio (IMF lines, partial, 2024) |  |
| Armenia | Folio (IMF lines, researched, 2024) |  |
| Australia | Folio (detailed, researched) |  |
| Austria | Folio (detailed, partial) |  |
| Azerbaijan | Folio (IMF lines, researched, 2024) |  |
| Bahamas | Folio (IMF lines, partial, 2024) |  |
| Bahrain | Folio (IMF lines, partial, 2020) |  |
| Bangladesh | Folio (IMF lines, partial, 2021) |  |
| Barbados | None | The IMF’s latest taxes by line are older than 2017. |
| Belarus | Folio (IMF lines, researched, 2024) |  |
| Belgium | Folio (detailed, researched) |  |
| Belize | Folio (IMF lines, partial, 2017) |  |
| Benin | None | The IMF series has no tax data for this country. |
| Bhutan | Folio (IMF lines, partial, 2020) |  |
| Bolivia | Folio (detailed, partial) |  |
| Bosnia and Herzegovina | Folio (IMF lines, researched, 2024) |  |
| Botswana | Folio (IMF lines, partial, 2023) |  |
| Brazil | Folio (detailed, researched) |  |
| Brunei | None | The IMF series has no Statement of Operations for this country. |
| Bulgaria | Folio (detailed, researched) |  |
| Burkina Faso | Folio (IMF lines, researched, 2024) |  |
| Burundi | Folio (IMF lines, partial, 2021) |  |
| Cambodia | Folio (IMF lines, researched, 2023) |  |
| Cameroon | Folio (IMF lines, partial, 2021) |  |
| Canada | Folio (detailed, researched) |  |
| Cape Verde | Folio (IMF lines, partial, 2020) |  |
| Central African Republic | Folio (IMF lines, partial, 2021) |  |
| Chad | Folio (IMF lines, partial, 2020) |  |
| Chile | Folio (detailed, partial) |  |
| China | Folio (IMF lines, researched, 2024) |  |
| Colombia | Folio (detailed, partial) |  |
| Comoros | Folio (IMF lines, partial, 2024) |  |
| Congo | Folio (IMF lines, researched, 2020) |  |
| Costa Rica | Folio (IMF lines, researched, 2024) |  |
| Croatia | Folio (detailed, researched) |  |
| Cuba | None | The IMF series has no Statement of Operations for this country. |
| Cyprus | Folio (IMF lines, researched, 2024) |  |
| Czechia | Folio (detailed, researched) |  |
| Denmark | Folio (detailed, researched) |  |
| Djibouti | None | The IMF series has no Statement of Operations for this country. |
| Dominica | Folio (IMF lines, partial, 2017) |  |
| Dominican Republic | Folio (IMF lines, researched, 2024) |  |
| DR Congo | Folio (IMF lines, partial, 2022) |  |
| Ecuador | Folio (IMF lines, researched, 2022) |  |
| Egypt | None | The IMF series has no tax data for this country. |
| El Salvador | Folio (IMF lines, researched, 2024) |  |
| Equatorial Guinea | Folio (IMF lines, partial, 2022) |  |
| Eritrea | None | The IMF series has no Statement of Operations for this country. |
| Estonia | Folio (detailed, researched) |  |
| Eswatini | Folio (IMF lines, partial, 2021) |  |
| Ethiopia | Folio (IMF lines, partial, 2024) |  |
| Fiji | Folio (IMF lines, partial, 2024) |  |
| Finland | Folio (detailed, researched) |  |
| France | Folio (detailed, researched) |  |
| Gabon | Folio (IMF lines, partial, 2021) |  |
| Gambia | Folio (IMF lines, partial, 2018) |  |
| Georgia | Folio (IMF lines, researched, 2024) |  |
| Germany | Folio (detailed, researched) |  |
| Ghana | Folio (IMF lines, partial, 2023) |  |
| Greece | Folio (detailed, researched) |  |
| Grenada | Folio (IMF lines, partial, 2017) |  |
| Guatemala | Folio (IMF lines, researched, 2024) |  |
| Guinea | Folio (IMF lines, partial, 2023) |  |
| Guinea-Bissau | Folio (IMF lines, partial, 2024) |  |
| Guyana | None | The IMF series has no Statement of Operations for this country. |
| Haiti | None | The IMF series has no Statement of Operations for this country. |
| Honduras | Folio (IMF lines, partial, 2020) |  |
| Hungary | Folio (detailed, researched) |  |
| Iceland | Folio (detailed, researched) |  |
| India | Folio (IMF lines, partial, 2022) |  |
| Indonesia | Folio (IMF lines, researched, 2024) |  |
| Iran | None | The IMF series has no Statement of Operations for this country. |
| Iraq | Folio (IMF lines, partial, 2019) |  |
| Ireland | Folio (detailed, researched) |  |
| Israel | Folio (IMF lines, researched, 2024) |  |
| Italy | Folio (detailed, partial) |  |
| Ivory Coast | Folio (IMF lines, researched, 2023) |  |
| Jamaica | Folio (IMF lines, partial, 2020) |  |
| Japan | Folio (detailed, researched) |  |
| Jordan | Folio (IMF lines, researched, 2022) |  |
| Kazakhstan | Folio (IMF lines, researched, 2023) |  |
| Kenya | Folio (IMF lines, researched, 2023) |  |
| Kiribati | Folio (IMF lines, researched, 2023) |  |
| Kuwait | None | The IMF series has no tax data for this country. |
| Kyrgyzstan | Folio (IMF lines, researched, 2024) |  |
| Laos | Folio (IMF lines, partial, 2022) |  |
| Latvia | Folio (detailed, researched) |  |
| Lebanon | Folio (IMF lines, partial, 2024) |  |
| Lesotho | Folio (IMF lines, partial, 2024) |  |
| Liberia | None | The IMF series has no tax data for this country. |
| Libya | None | The IMF series has no Statement of Operations for this country. |
| Liechtenstein | None | The IMF series has no Statement of Operations for this country. |
| Lithuania | Folio (detailed, researched) |  |
| Luxembourg | Folio (detailed, researched) |  |
| Madagascar | Folio (IMF lines, partial, 2024) |  |
| Malawi | Folio (IMF lines, partial, 2024) |  |
| Malaysia | Folio (IMF lines, partial, 2024) |  |
| Maldives | Folio (IMF lines, partial, 2021) |  |
| Mali | Folio (IMF lines, partial, 2020) |  |
| Malta | Folio (detailed, researched) |  |
| Marshall Islands | Folio (IMF lines, partial, 2018) |  |
| Mauritania | None | The IMF series has no Statement of Operations for this country. |
| Mauritius | Folio (IMF lines, researched, 2025) |  |
| Mexico | Folio (detailed, partial) |  |
| Micronesia | Folio (IMF lines, partial, 2020) |  |
| Moldova | Folio (IMF lines, researched, 2024) |  |
| Monaco | None | The IMF series has no Statement of Operations for this country. |
| Mongolia | Folio (IMF lines, researched, 2024) |  |
| Montenegro | None | The IMF series has no tax data for this country. |
| Morocco | Folio (IMF lines, partial, 2025) |  |
| Mozambique | Folio (IMF lines, partial, 2024) |  |
| Myanmar | Folio (IMF lines, researched, 2019) |  |
| Namibia | Folio (IMF lines, researched, 2024) |  |
| Nauru | Folio (IMF lines, partial, 2024) |  |
| Nepal | Folio (IMF lines, researched, 2021) |  |
| Netherlands | Folio (detailed, researched) |  |
| New Zealand | Folio (detailed, researched) |  |
| Nicaragua | Folio (IMF lines, partial, 2024) |  |
| Niger | None | The IMF series has no Statement of Operations for this country. |
| Nigeria | None | The IMF series has no tax data for this country. |
| North Korea | None | The IMF series has no Statement of Operations for this country. |
| North Macedonia | Folio (IMF lines, researched, 2024) |  |
| Norway | Folio (detailed, researched) |  |
| Oman | None | The IMF series has no tax data for this country. |
| Pakistan | None | The IMF series has no tax data for this country. |
| Palau | Folio (IMF lines, researched, 2019) |  |
| Panama | Folio (IMF lines, partial, 2025) |  |
| Papua New Guinea | Folio (IMF lines, partial, 2025) |  |
| Paraguay | Folio (IMF lines, researched, 2024) |  |
| Peru | Folio (IMF lines, researched, 2021) |  |
| Philippines | Folio (IMF lines, researched, 2023) |  |
| Poland | Folio (detailed, researched) |  |
| Portugal | Folio (detailed, researched) |  |
| Qatar | None | The IMF series has no tax data for this country. |
| Romania | Folio (detailed, researched) |  |
| Russia | Folio (IMF lines, researched, 2024) |  |
| Rwanda | Folio (IMF lines, researched, 2024) |  |
| Saint Kitts and Nevis | Folio (IMF lines, partial, 2020) |  |
| Saint Lucia | Folio (IMF lines, partial, 2017) |  |
| Saint Vincent and the Grenadines | Folio (IMF lines, partial, 2017) |  |
| Samoa | Folio (IMF lines, partial, 2023) |  |
| San Marino | Folio (IMF lines, partial, 2024) |  |
| São Tomé and Príncipe | Folio (IMF lines, partial, 2022) |  |
| Saudi Arabia | Folio (IMF lines, partial, 2024) |  |
| Senegal | Folio (IMF lines, researched, 2023) |  |
| Serbia | Folio (IMF lines, researched, 2022) |  |
| Seychelles | Folio (IMF lines, partial, 2024) |  |
| Sierra Leone | Folio (IMF lines, partial, 2018) |  |
| Singapore | Folio (IMF lines, partial, 2024) |  |
| Slovakia | Folio (detailed, researched) |  |
| Slovenia | Folio (detailed, researched) |  |
| Solomon Islands | Folio (IMF lines, partial, 2024) |  |
| Somalia | Folio (IMF lines, researched, 2024) |  |
| South Africa | Folio (IMF lines, researched, 2024) |  |
| South Korea | Folio (detailed, researched) |  |
| South Sudan | Folio (IMF lines, partial, 2025) |  |
| Spain | Folio (detailed, partial) |  |
| Sri Lanka | Folio (IMF lines, partial, 2023) |  |
| Sudan | None | The IMF’s latest taxes by line are older than 2017. |
| Suriname | None | The IMF series has no tax data for this country. |
| Sweden | Folio (detailed, researched) |  |
| Switzerland | Folio (detailed, researched) |  |
| Syria | None | The IMF series has no Statement of Operations for this country. |
| Tajikistan | Folio (IMF lines, researched, 2024) |  |
| Tanzania | Folio (IMF lines, partial, 2024) |  |
| Thailand | Folio (IMF lines, researched, 2024) |  |
| Timor-Leste | Folio (IMF lines, partial, 2022) |  |
| Togo | Folio (IMF lines, partial, 2023) |  |
| Tonga | Folio (IMF lines, partial, 2023) |  |
| Trinidad and Tobago | Folio (IMF lines, partial, 2019) |  |
| Tunisia | None | The IMF series has no tax data for this country. |
| Türkiye | Folio (detailed, partial) |  |
| Turkmenistan | None | The IMF series has no Statement of Operations for this country. |
| Tuvalu | Folio (IMF lines, partial, 2023) |  |
| Uganda | Folio (IMF lines, researched, 2024) |  |
| Ukraine | Folio (IMF lines, researched, 2024) |  |
| United Arab Emirates | Folio (IMF lines, researched, 2024) |  |
| United Kingdom | Folio (detailed, researched) |  |
| United States | Folio (detailed, researched) |  |
| Uruguay | Folio (IMF lines, partial, 2025) |  |
| Uzbekistan | Folio (IMF lines, researched, 2023) |  |
| Vanuatu | Folio (IMF lines, partial, 2023) |  |
| Venezuela | None | The IMF series has no Statement of Operations for this country. |
| Vietnam | Folio (IMF lines, partial, 2022) |  |
| Yemen | None | The IMF series has no tax data for this country. |
| Zambia | Folio (IMF lines, partial, 2024) |  |
| Zimbabwe | None | The IMF series has taxes by line for 2018 only, and its currency in that year could not be checked. |
| Palestine (observer state) | Folio (IMF lines, partial, 2021) |  |
| Holy See (Vatican City) (observer state) | None | The IMF series has no Statement of Operations for the Holy See. |

## How to add one

- An IMF-lines folio: [ADDING-A-COUNTRY.md](ADDING-A-COUNTRY.md), section C.
- A detailed folio: write a builder script `scripts/build/<id>.ts` (or scaffold with `npm run new-country`), then follow section B of the same guide. A detailed folio replaces the IMF-lines folio of the same country.
- A profile: copy an existing `profiles/<id>.json`, replace the numbers with those of the OECD table, `npm run validate`.
