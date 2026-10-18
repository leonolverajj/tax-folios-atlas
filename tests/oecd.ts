/** ISO 3166-1 alpha-3 codes of the 38 OECD members: the countries whose folios carry the OECD harmonised layer (structure.json). */
export const OECD_ISO3 = [
  'AUS', 'AUT', 'BEL', 'CAN', 'CHL', 'COL', 'CRI', 'CZE', 'DNK', 'EST', 'FIN', 'FRA', 'DEU', 'GRC', 'HUN', 'ISL', 'IRL', 'ISR', 'ITA', 'JPN', 'KOR', 'LVA',
  'LTU', 'LUX', 'MEX', 'NLD', 'NZL', 'NOR', 'POL', 'PRT', 'SVK', 'SVN', 'ESP', 'SWE', 'CHE', 'TUR', 'GBR', 'USA',
] as const;
/** Non-members whose folios also carry an OECD layer (the OECD's Latin America and Caribbean edition). */
export const OECD_LAC_ISO3 = ['BOL', 'BRA'] as const;
