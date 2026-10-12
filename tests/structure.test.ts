import { describe, expect, it } from 'vitest';
import { listCountryIds, listProfileIds, loadBundle, loadProfileFile } from '../scripts/lib/load';
import { HEADINGS, levelShares, mixOf } from '../src/data/structureMath';
import { collectedBy } from '../src/trees/metrics';
import type { Structure } from '../src/data/schema';

const folioIds = listCountryIds();
const profileIds = listProfileIds();
/** Folios of countries that are not OECD members: no OECD level layer, by design (the Trees table shows n/a). */
const NON_OECD = ['bulgaria', 'croatia', 'malta', 'romania'];
const withStructure = [...folioIds.filter((id) => !NON_OECD.includes(id)), ...profileIds];
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

/** The harmonised layer of any country, whether it has a folio or only a profile. */
const structureOf = (id: string): Structure => (folioIds.includes(id) ? loadBundle(id).structure! : loadProfileFile(id).structure);

describe.each(withStructure)('%s harmonised layer', (id) => {
  const st = structureOf(id);

  it('has a tax mix and a level split that each add up to 100 %', () => {
    expect(sum(HEADINGS.map((h) => mixOf(st)[h]))).toBeCloseTo(1, 9);
    expect(sum(levelShares(st).map((l) => l.share))).toBeCloseTo(1, 9);
  });

  it('gives level-of-government shares that add up to 100 %', () => {
    const c = collectedBy(st)!;
    expect(c.central + c.regional + c.local + c.socialSecurity).toBeCloseTo(1, 9);
  });
});

describe('the harmonised layer as a set', () => {
  it('is missing only for the four folios of countries outside the OECD', () => {
    expect(folioIds.filter((id) => !loadBundle(id).structure).sort()).toEqual([...NON_OECD].sort());
  });

  it('uses the same reference year for every country', () => {
    const years = new Set(withStructure.map((id) => structureOf(id).referenceYear));
    expect([...years]).toEqual([2023]);
  });

  it('never has a folio and a profile for the same country, and no repeated ISO number', () => {
    expect(profileIds.filter((p) => folioIds.includes(p))).toEqual([]);
    const numerics = [...profileIds.map((p) => loadProfileFile(p).isoNumeric), ...folioIds.map((c) => loadBundle(c).meta.isoNumeric)];
    expect(new Set(numerics).size).toBe(numerics.length);
  });

  it('cites the OECD table each profile was read from', () => {
    for (const id of profileIds) {
      const src = loadProfileFile(id).sources.find((s) => s.id === 'oecd-rs-2025-subsectors')!;
      expect(src.url, id).toMatch(/^https:\/\/www\.oecd\.org\//);
      expect(src.title, id).toMatch(/Table 6\.\d+/);
    }
  });

  it('agrees with published OECD 2023 headline figures', () => {
    const mix = (id: string) => mixOf(structureOf(id));
    // OECD Revenue Statistics 2025, Table 3.4 (share of total tax revenue, 2023)
    expect(mix('canada').income * 100).toBeCloseTo(51.0, 0);
    expect(mix('japan').socialSecurity * 100).toBeCloseTo(39.1, 0);
    expect(mix('united-states').income * 100).toBeCloseTo(48.5, 0);
    expect(mix('mexico').goodsServices * 100).toBeCloseTo(35.1, 0);
    expect(mix('colombia').goodsServices * 100).toBeCloseTo(39.5, 0);
    // OECD Revenue Statistics in Latin America and the Caribbean 2025, Table 1.4 (2023)
    const bra = levelShares(structureOf('brazil'));
    expect(bra.find((l) => l.key === 'central')!.share * 100).toBeCloseTo(45.4, 1);
    expect(bra.find((l) => l.key === 'regional')!.share * 100).toBeCloseTo(23.0, 1);
  });

  it('agrees with well-known facts about individual tax systems', () => {
    const mix = (id: string) => mixOf(structureOf(id));
    expect(mix('australia').socialSecurity).toBe(0); // Australia has no social security contributions
    expect(mix('denmark').income * 100).toBeGreaterThan(60); // income taxes dominate in Denmark
    expect(mix('france').socialSecurity * 100).toBeGreaterThan(30);
    expect(levelShares(structureOf('germany')).find((l) => l.key === 'social-security')!.share * 100).toBeGreaterThan(35);
  });
});
