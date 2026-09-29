import { describe, expect, it } from 'vitest';
import { formatMoney, formatPeriod, formatPublished, formatShare } from '../src/data/format';
import { toBase } from '../src/data/model';

describe('formatMoney', () => {
  it('always carries the ISO currency code and converts the published scale', () => {
    expect(formatMoney(3_782_085.15, 'million', 'BRL')).toBe('BRL 3.78 trillion');
    expect(formatMoney(510_951_145, 'thousand', 'CAD')).toBe('CAD 511 billion');
    expect(formatMoney(84_222_606, 'million', 'JPY')).toBe('JPY 84.2 trillion');
    expect(formatMoney(45_910, 'million', 'BOB')).toBe('BOB 45.9 billion');
    expect(formatMoney(950_000, 'units', 'USD')).toBe('USD 950,000');
  });
});

describe('formatPublished', () => {
  it('keeps the number exactly as published, in its own unit', () => {
    expect(formatPublished(3_782_085.15, 'million', 'BRL')).toBe('3,782,085.15 million BRL');
    expect(formatPublished(12, 'units', 'MXN')).toBe('12 MXN');
  });
});

describe('formatShare', () => {
  it('uses more digits for small shares and one decimal above 10 %', () => {
    expect(formatShare(0.4567)).toBe('45.7%');
    expect(formatShare(0.05)).toBe('5.00%');
    expect(formatShare(0.0004)).toBe('0.04%');
  });
});

describe('formatPeriod', () => {
  it('names the kind of year and shows both ends', () => {
    const s = formatPeriod({ label: 'FY2024-25', kind: 'fiscal-year', start: '2024-04-01', end: '2025-03-31' });
    expect(s).toContain('FY2024-25');
    expect(s).toContain('fiscal year');
    expect(s).toContain('Apr 1, 2024');
    expect(s).toContain('Mar 31, 2025');
  });
});

describe('toBase', () => {
  it('scales published amounts to base currency units', () => {
    expect(toBase(2, 'thousand')).toBe(2_000);
    expect(toBase(3, 'trillion')).toBe(3e12);
  });
});
