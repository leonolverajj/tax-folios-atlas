# Methodology: what the sizes and the stats mean

## 1. Orb size = share of the whole country's tax take

Every tax core is drawn with an **area proportional to its share of one national total**, so the biggest orbs are the biggest revenue sources of the country, whichever government collects them. A US state sales tax and the federal individual income tax are directly comparable by eye.

**The national total** is the sum of a few named parts, each the taxes and compulsory contributions that one level of government (or one social scheme) collects, before transfers between governments:

| Country | Parts (latest national source unless marked OECD) |
|---|---|
| Canada | Federal taxes + EI premiums (FY2024-25); Canada Pension Plan (FY2023-24); provincial taxes + social contributions (2024); municipal taxes (2024) |
| United States | Federal receipts (FY2025); state tax collections (FY2024); local tax revenue (FY2024) |
| Japan | National taxes (FY2025); prefectural taxes (FY2024); municipal taxes (FY2024); social insurance premiums (FY2023) |
| Brazil | Tax revenue of Union, states and municipalities (2024), from one source |
| Mexico | Itemised federal taxes and IMSS/ISSSTE contributions (2025); state and municipal taxes (OECD, 2023) |
| Colombia | DIAN gross collection (2025); departmental, municipal, social-security and payroll contributions (OECD, 2023) |
| Bolivia | SIN collection (2025); customs, social security and municipal taxes (OECD, 2023) |

Each part is a documented figure with a source, period and locator (see the country panel, "Core sizes & the national total"). Non-tax revenue (royalties, fees, oil income, sales of goods), grants and transfers are left out, and the cores that represent them keep a small neutral size and say so.

**The scale.** `radius = k × √share`, so area is proportional to share. Two limits keep the folio usable and both are printed in the legend: shares below **2.4%** are all drawn at the minimum radius (18 units), and shares of **30% or more** stop growing (64 units). A core with no tax-specific amount uses a deliberately small neutral radius (22), so "unknown" never looks bigger than a small tax. The scale is the same function for every country.

**Honest limits.** Parts come from different publishers and years (the validator allows at most 30 months between period ends and warns beyond 12; every country page states the spread). Shares are therefore approximate to roughly the growth of a year or two on the older parts. Countries marked "research: partial" have gaps that make some shares overstated; the panel says which.

### Cross-check against the OECD

The level weights of each national total, built from national sources, match the OECD's harmonised split of 2023 closely:

| Country | Ours | OECD 2023 (collecting government) |
|---|---|---|
| Japan | national 40.0%, prefectures 10.6%, municipalities 11.4%, premiums 38.0% | central 38.6%, local 22.3%, social security 39.1% |
| Canada | federal 44.4%, CPP 7.8%, provinces 40.1%, municipalities 7.7% | federal 43.2%, social security 10.3%, provinces 38.0%, local 8.4% |
| United States | federal 68.9%, states 19.4%, local 11.7% | federal + social security 65.0%, states 20.5%, local 14.5% |
| Mexico | federal 94.3%, states 4.1%, municipalities 1.6% | central + social security 93.9%, states 4.5%, local 1.6% |
| Colombia | DIAN 77.4%, departments 4.0%, municipalities 10.6%, social 6.7%, payroll 1.3% | central 76.9%, regional 4.3%, local 11.5%, social security 7.3% |
| Bolivia | SIN + customs 70.2%, municipalities 4.7%, social security 25.1% | central 71.4%, local 4.5%, social security 24.1% |

Differences come from years and from the OECD folding some fees into local taxes; they are the reason the profile layer below is kept separate.

## 2. The harmonised layer (Fiscal Fighters)

Comparing countries needs the same definitions and the same year. The Fighters screen therefore uses only the OECD Revenue Statistics (2023, calendar year) and the OECD/UCLG subnational finance observatory, never the newer national numbers used for sizing. The same data can be edited in `countries/<id>/structure.json` (folio countries) or `profiles/<id>.json` (profile-only).

Each stat is a **measured value on a printed scale**:

| Stat | Definition | Bar scale |
|---|---|---|
| Tax take | Total tax revenue incl. social contributions, % of GDP | 0–50% |
| Income taxes | OECD heading 1000, % of total tax revenue | 0–60% |
| Consumption taxes | Heading 5000 (VAT, sales, excises, customs) | 0–60% |
| Social contributions | Heading 2000 | 0–45% |
| Property taxes | Heading 4000, incl. financial and capital transactions | 0–20% |
| Payroll and other | Headings 3000 + 6000 | 0–20% |
| Balance | (1 − Σ shares²) ÷ (1 − 1/6) × 100 over the six headings | 0–100 |
| Local power | Share of all tax collected by regional + local governments (collecting basis; shared federal taxes do not count) | 0–50% |
| Own resources | 100 − grants and subsidies as % of subnational revenue | 0–100% |

The **style** line has two parts: the *archetype* is the biggest heading (income, consumption, social, property, payroll/other) and the *structure* is Decentralised (regional + local collect ≥ 25% of tax), Mixed (10–25%) or Centralised (< 10%).

The **picture** encodes two things and nothing else: the belt is the tax mix (twelve segments in the colours of the six headings) and the aura is the colour of the biggest heading. Clothing and hair are decoration.

### What the stats cannot say

- A high share of one heading says how a state raises money, not whether the system is fair or efficient.
- "Own resources" depends on how the observatory classifies shared taxes. Where the source contradicts itself (Bolivia counts shared national taxes as tax revenue but states that over 80% of subnational revenue is central transfers) the stat is **n/a** with the reason, not an estimate.
- Where the OECD attributes revenue on a *collecting* basis (Mexico, Germany) taxes shared with lower levels stay with the level that collects them. That is the right measure of who raises the money, and the wrong measure of who spends it.
- Subnational data is 2019–2020 (the observatory's latest edition) while taxes are 2023.

## 3. Sources

The OECD tables are read from the published Revenue Statistics 2025 (Table 3.1 and chapter 6 for OECD members; Table 1.4 and the country notes of Revenue Statistics in Latin America and the Caribbean 2025 for Brazil and Bolivia). Every profile file lists them with their tables. Each number carries a checksum in the import record (`scripts/archive/`), and the validator re-adds the tax types to the printed level totals on every run.
