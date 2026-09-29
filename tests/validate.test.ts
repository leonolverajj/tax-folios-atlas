import { describe, expect, it } from 'vitest';
import { listCountryIds, loadBundle } from '../scripts/lib/load';
import { validateBundle } from '../scripts/validate-data';
import type { CountryBundle } from '../src/data/schema';

const fresh = (id = 'japan'): CountryBundle => structuredClone(loadBundle(id));
const errorsOf = (b: CountryBundle) => validateBundle(b).errors;
const has = (errors: string[], re: RegExp) => errors.some((e) => re.test(e));

describe('shipped data', () => {
  it.each(listCountryIds())('%s validates with no errors', (id) => {
    expect(errorsOf(loadBundle(id))).toEqual([]);
  });
});

describe('validator rejects broken data', () => {
  it('a parent that does not exist', () => {
    const b = fresh();
    b.instruments[0].parentId = 'no-such-parent';
    expect(has(errorsOf(b), /parentId "no-such-parent" does not exist/)).toBe(true);
  });

  it('a parent chain that loops', () => {
    const b = fresh();
    const child = b.instruments.find((i) => b.instruments.some((p) => p.id === i.parentId));
    if (child) {
      const parent = b.instruments.find((p) => p.id === child.parentId)!;
      parent.parentId = child.id;
      expect(has(errorsOf(b), /cycle/)).toBe(true);
    } else {
      // countries with a flat hierarchy: make a two-node loop
      const [a, c] = b.instruments;
      a.parentId = c.id;
      c.parentId = a.id;
      expect(has(errorsOf(b), /cycle/)).toBe(true);
    }
  });

  it('a duplicate id', () => {
    const b = fresh();
    b.instruments.push({ ...b.instruments[0] });
    expect(has(errorsOf(b), /duplicate id/)).toBe(true);
  });

  it('a legal reference to a source that is not in sources.json', () => {
    const b = fresh();
    const inst = b.instruments.find((i) => i.legalRefs.length)!;
    inst.legalRefs[0].sourceId = 'not-a-source';
    expect(has(errorsOf(b), /source "not-a-source" is not in sources.json/)).toBe(true);
  });

  it('a revenue observation that cites a missing source', () => {
    const b = fresh();
    b.observations[0].sourceId = 'not-a-source';
    expect(has(errorsOf(b), /not-a-source/)).toBe(true);
  });

  it('coordinates outside the canvas or not finite', () => {
    const b = fresh();
    const id = b.instruments[0].id;
    b.layout.positions[id] = { x: b.layout.canvas.width + 50, y: 10 };
    expect(has(errorsOf(b), /outside the .* canvas/)).toBe(true);
    b.layout.positions[id] = { x: Number.NaN, y: 10 };
    expect(has(errorsOf(b), /non-finite/)).toBe(true);
  });

  it('a core without a position, and a position for a core that does not exist', () => {
    const b = fresh();
    delete b.layout.positions[b.instruments[0].id];
    b.layout.positions['ghost'] = { x: 1, y: 1 };
    const errors = errorsOf(b);
    expect(has(errors, /no position for/)).toBe(true);
    expect(has(errors, /unknown node "ghost"/)).toBe(true);
  });

  it('an observation whose period differs from its denominator', () => {
    const b = fresh();
    const o = b.observations.find((x) => x.denominatorId)!;
    o.period = { ...o.period, end: '2099-01-01' };
    expect(has(errorsOf(b), /differs from denominator period/)).toBe(true);
  });

  it('an observation in another currency than its denominator', () => {
    const b = fresh();
    const o = b.observations.find((x) => x.denominatorId)!;
    o.currency = 'XXX';
    expect(has(errorsOf(b), /currency XXX differs/)).toBe(true);
  });

  it('a share above 100 % of its denominator', () => {
    const b = fresh();
    const o = b.observations.find((x) => x.denominatorId)!;
    o.amount = 1e6;
    o.scale = 'trillion';
    expect(has(errorsOf(b), /exceeds its denominator/)).toBe(true);
  });

  it('two sizing cores that share an aggregate (double counting)', () => {
    const b = fresh();
    const [a, c] = b.observations.filter((o) => o.role === 'sizing');
    a.aggregateKey = 'same-money';
    c.aggregateKey = 'same-money';
    expect(has(errorsOf(b), /aggregateKey "same-money"/)).toBe(true);
  });

  it('cores whose shares add up to more than the denominator', () => {
    const b = fresh();
    const den = b.meta.denominators.find((d) => d.id === b.meta.sizing.componentIds[0])!;
    const sizing = b.observations.filter((o) => o.role === 'sizing' && o.denominatorId === den.id);
    // each observation individually below 100 %, together far above it
    for (const o of sizing.slice(0, 3)) {
      o.amount = den.amount * 0.6;
      o.scale = den.scale;
      o.currency = den.currency;
      o.period = den.period;
      o.aggregateKey = undefined;
    }
    expect(has(errorsOf(b), /sum to .* \(> 100%\)/)).toBe(true);
  });

  it('a non-current status without a note', () => {
    const b = fresh();
    b.instruments[0].status = 'transitional';
    b.instruments[0].statusNote = undefined;
    expect(has(errorsOf(b), /requires a statusNote/)).toBe(true);
  });

  it('a core without presentation data', () => {
    const b = fresh();
    delete b.presentation.nodes[b.instruments[0].id];
    expect(has(errorsOf(b), /presentation.json: no entry/)).toBe(true);
  });

  it('a source accessed in the future', () => {
    const b = fresh();
    b.sources[0].accessed = '2999-01-01';
    expect(has(errorsOf(b), /accessed date .* is in the future/)).toBe(true);
  });
});

describe('validator enforces the national-total rules', () => {
  it('a part of the national total that is not a denominator', () => {
    const b = fresh();
    b.meta.sizing.componentIds.push('ghost');
    expect(has(errorsOf(b), /"ghost" is not a denominator/)).toBe(true);
  });

  it('a sizing core measured against something outside the national total', () => {
    const b = fresh();
    const removed = b.meta.sizing.componentIds.shift()!;
    expect(b.observations.some((o) => o.role === 'sizing' && o.denominatorId === removed)).toBe(true);
    expect(has(errorsOf(b), /must use a component of the national total/)).toBe(true);
  });

  it('parts whose periods end more than 30 months apart', () => {
    const b = fresh();
    const d = b.meta.denominators.find((x) => x.id === b.meta.sizing.componentIds[0])!;
    d.period = { ...d.period, start: '2012-01-01', end: '2012-12-31' };
    expect(has(errorsOf(b), /months apart/)).toBe(true);
  });

  it('an aggregate-only part that still has a core measured against it', () => {
    const b = fresh();
    const d = b.meta.denominators.find((x) => x.id === b.meta.sizing.componentIds[0])!;
    d.aggregateOnly = true;
    expect(has(errorsOf(b), /aggregate-only and has no cores/)).toBe(true);
  });

  it('a denominator in a different currency from the country', () => {
    const b = fresh();
    b.meta.denominators[0].currency = 'XXX';
    expect(has(errorsOf(b), /differs from the country currency/)).toBe(true);
  });
});

describe('validator checks the harmonised structure layer', () => {
  it.each(listCountryIds())('%s has a structure.json', (id) => {
    expect(loadBundle(id).structure).toBeDefined();
  });

  it('tax types that do not add up to the level total', () => {
    const b = fresh('canada');
    const lvl = b.structure!.levels.find((l) => l.byType)!;
    lvl.byType!.income += 50_000;
    expect(has(errorsOf(b), /tax types add up to/)).toBe(true);
  });

  it('level shares that do not add up to 100 %', () => {
    const b = fresh('brazil');
    b.structure!.levels[0].share = 60;
    expect(has(errorsOf(b), /level shares add up to/)).toBe(true);
  });

  it('a structure source that is not in sources.json', () => {
    const b = fresh('mexico');
    b.structure!.sourceIds = ['nowhere'];
    expect(has(errorsOf(b), /source "nowhere" is not in sources.json/)).toBe(true);
  });

  it('blank subnational figures without an explanation', () => {
    const b = fresh('bolivia');
    b.structure!.subnational!.note = undefined;
    expect(has(errorsOf(b), /need a note explaining why/)).toBe(true);
  });
});
