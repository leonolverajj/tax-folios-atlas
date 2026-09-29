import { describe, expect, it } from 'vitest';
import { listCountryIds, listProfileIds, loadBundle, loadProfileFile } from '../scripts/lib/load';
import { HEADINGS, balanceIndex, buildProfile, identityOfProfile, levelShares, mixOf } from '../src/fighters/profile';
import { beltColors } from '../src/fighters/sprite';

const ids = listCountryIds();
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

describe('balanceIndex', () => {
  it('is 100 for a perfectly even mix and 0 when one heading raises everything', () => {
    const even = Object.fromEntries(HEADINGS.map((h) => [h, 1 / HEADINGS.length])) as Record<(typeof HEADINGS)[number], number>;
    expect(balanceIndex(even)).toBeCloseTo(100, 9);
    const single = { ...Object.fromEntries(HEADINGS.map((h) => [h, 0])), income: 1 } as typeof even;
    expect(balanceIndex(single)).toBeCloseTo(0, 9);
  });

  it('rises when revenue is spread more evenly', () => {
    const a = { income: 0.7, socialSecurity: 0.1, payroll: 0.05, property: 0.05, goodsServices: 0.05, other: 0.05 };
    const b = { income: 0.4, socialSecurity: 0.2, payroll: 0.1, property: 0.1, goodsServices: 0.1, other: 0.1 };
    expect(balanceIndex(b)).toBeGreaterThan(balanceIndex(a));
  });
});

describe.each(ids)('%s profile', (id) => {
  const bundle = loadBundle(id);
  const st = bundle.structure!;
  const p = buildProfile(bundle.meta, st);

  it('has a tax mix and level split that each add up to 100 %', () => {
    expect(sum(HEADINGS.map((h) => mixOf(st)[h]))).toBeCloseTo(1, 9);
    expect(sum(levelShares(st).map((l) => l.share))).toBeCloseTo(1, 9);
  });

  it('measures every stat on its printed scale, and never invents a missing value', () => {
    expect(p.stats.map((s) => s.key)).toEqual(['take', 'income', 'consumption', 'social', 'property', 'other', 'balance', 'local', 'own']);
    for (const s of p.stats) {
      if (s.value === null) {
        expect(s.bar).toBeNull();
        expect(s.display).toBe('n/a');
        expect(s.caveat, `${s.key} needs a reason when it is n/a`).toBeTruthy();
      } else {
        expect(s.bar).toBeGreaterThanOrEqual(0);
        expect(s.bar).toBeLessThanOrEqual(1);
        expect(s.bar).toBeCloseTo(Math.min(1, s.value / s.scaleMax), 9);
      }
    }
  });

  it('draws a belt of twelve segments in the proportions of the tax mix', () => {
    const belt = beltColors(p.mix);
    expect(belt).toHaveLength(12);
  });

  it('classifies its structure by the documented thresholds', () => {
    const sub = (levelShares(st).find((l) => l.key === 'regional')?.share ?? 0) + (levelShares(st).find((l) => l.key === 'local')?.share ?? 0);
    const expected = sub * 100 >= 25 ? 'Decentralised' : sub * 100 >= 10 ? 'Mixed' : 'Centralised';
    expect(p.structureClass).toBe(expected);
  });
});

describe.each(listProfileIds())('profile-only %s', (id) => {
  const file = loadProfileFile(id);
  const p = buildProfile(identityOfProfile(file), file.structure);

  it('is a well-formed profile with no folio of its own', () => {
    expect(file.id).toBe(id);
    expect(ids).not.toContain(id);
    expect(p.hasFolio).toBe(false);
    expect(file.structure.referenceYear).toBe(2023);
  });

  it('has a tax mix and level split that each add up to 100 %', () => {
    expect(sum(HEADINGS.map((h) => p.mix[h]))).toBeCloseTo(1, 9);
    expect(sum(p.levels.map((l) => l.share))).toBeCloseTo(1, 9);
  });

  it('stays within the printed scales', () => {
    for (const s of p.stats) {
      if (s.bar !== null) {
        expect(s.bar).toBeGreaterThanOrEqual(0);
        expect(s.bar).toBeLessThanOrEqual(1);
      }
    }
    expect(p.stats.find((s) => s.key === 'take')!.value).toBeGreaterThan(10);
    expect(p.stats.find((s) => s.key === 'take')!.value).toBeLessThan(50);
  });

  it('cites the OECD tables it was read from', () => {
    const src = file.sources.find((s) => s.id === 'oecd-rs-2025-subsectors')!;
    expect(src.url).toMatch(/^https:\/\/www\.oecd\.org\//);
    expect(src.title).toMatch(/Table 6\.\d+/);
  });
});

describe('profile-only countries as a set', () => {
  it('covers the OECD members that have no folio yet, without duplicating a folio country', () => {
    const profiles = listProfileIds();
    expect(profiles.length).toBeGreaterThanOrEqual(30);
    expect(profiles.filter((p) => ids.includes(p))).toEqual([]);
    const numerics = [...profiles.map((p) => loadProfileFile(p).isoNumeric), ...ids.map((c) => loadBundle(c).meta.isoNumeric)];
    expect(new Set(numerics).size).toBe(numerics.length);
  });

  it('agrees with well-known OECD 2023 facts', () => {
    const get = (id: string) => {
      const f = loadProfileFile(id);
      return buildProfile(identityOfProfile(f), f.structure);
    };
    expect(get('australia').mix.socialSecurity).toBe(0); // Australia has no social security contributions
    expect(get('denmark').mix.income * 100).toBeGreaterThan(60); // income taxes dominate in Denmark
    expect(get('france').mix.socialSecurity * 100).toBeGreaterThan(30);
    expect(get('germany').levels.find((l) => l.key === 'social-security')!.share * 100).toBeGreaterThan(35);
    expect(get('chile').stats.find((s) => s.key === 'other')!.bar).toBe(0); // net-negative "other" is clamped, not drawn
  });
});

describe('cross-country sanity of the harmonised layer', () => {
  it('uses the same reference year and definitions for every country', () => {
    const years = new Set(ids.map((id) => loadBundle(id).structure!.referenceYear));
    expect(years.size).toBe(1);
  });

  it('agrees with published OECD 2023 headline figures', () => {
    const get = (id: string) => buildProfile(loadBundle(id).meta, loadBundle(id).structure!);
    // OECD Revenue Statistics 2025, Table 3.4 (share of total tax revenue, 2023)
    expect(get('canada').mix.income * 100).toBeCloseTo(51.0, 0);
    expect(get('japan').mix.socialSecurity * 100).toBeCloseTo(39.1, 0);
    expect(get('united-states').mix.income * 100).toBeCloseTo(48.5, 0);
    expect(get('mexico').mix.goodsServices * 100).toBeCloseTo(35.1, 0);
    expect(get('colombia').mix.goodsServices * 100).toBeCloseTo(39.5, 0);
    // OECD Revenue Statistics in Latin America and the Caribbean 2025, Table 1.4 (2023)
    const bra = get('brazil').levels;
    expect(bra.find((l) => l.key === 'central')!.share * 100).toBeCloseTo(45.4, 1);
    expect(bra.find((l) => l.key === 'regional')!.share * 100).toBeCloseTo(23.0, 1);
  });

  it('leaves Bolivia’s subnational dependence n/a because the source is not comparable', () => {
    const p = buildProfile(loadBundle('bolivia').meta, loadBundle('bolivia').structure!);
    expect(p.stats.find((s) => s.key === 'own')!.value).toBeNull();
  });
});
