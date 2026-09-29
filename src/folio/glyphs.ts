/**
 * Original line-icon set for cores (24×24 grid, stroked, no fill).
 * Every icon is drawn for this project; none is derived from game or brand assets.
 */
import type { GlyphName } from '../data/schema';

export const GLYPH_PATHS: Record<GlyphName, string> = {
  globe: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM3.5 12h17M12 3.5c2.5 2.6 3.7 5.4 3.7 8.5s-1.2 5.9-3.7 8.5c-2.5-2.6-3.7-5.4-3.7-8.5S9.5 6.1 12 3.5z',
  landmark: 'M3 9.5 12 4l9 5.5M5.5 10.5v7M9.8 10.5v7M14.2 10.5v7M18.5 10.5v7M3.5 20h17M4.5 17.5h15',
  city: 'M4 20V10.5h5V20M9 20V4.5h6V20M15 20v-8h5v8M2.8 20h18.4M11 8h2M11 11h2M11 14h2',
  town: 'M3 20v-7l4-3 4 3v7M11 20V9.5l5-4 5 4V20M2.8 20h18.4M14 13h4M14 16.5h4',
  person: 'M12 4.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM5 20c.6-3.8 3.4-6 7-6s6.4 2.2 7 6',
  coin: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM14.8 9.2c-.6-.9-1.6-1.4-2.8-1.4-1.6 0-2.8.8-2.8 2 0 1.3 1.2 1.8 2.8 2.2 1.6.4 2.8.9 2.8 2.2 0 1.2-1.2 2-2.8 2-1.3 0-2.4-.6-3-1.6M12 6.3v1.5M12 16.2v1.5',
  factory: 'M3 20V10l6 3.5V10l6 3.5V6h3v14H3zM7 20v-3h2v3M12 20v-3h2v3',
  cart: 'M3.5 5h2.6l2 9.5h9.6l1.8-7H7M9.5 19.4a.9.9 0 1 0 0-.01M16.5 19.4a.9.9 0 1 0 0-.01',
  percent: 'M18.5 5.5 5.5 18.5M7.5 5.2a2.3 2.3 0 1 0 0 4.6 2.3 2.3 0 0 0 0-4.6zM16.5 14.2a2.3 2.3 0 1 0 0 4.6 2.3 2.3 0 0 0 0-4.6z',
  flame: 'M12 3.5c.5 3.2 4.7 5 4.7 10a4.7 4.7 0 0 1-9.4 0c0-1.9.9-3.1 1.9-4 .2 1.4.9 2.2 1.6 2.4C10.3 9.4 10.8 6 12 3.5z',
  drop: 'M12 3.5s6 6 6 10.5a6 6 0 0 1-12 0C6 9.5 12 3.5 12 3.5z',
  ship: 'M3 14.5h18l-2 5.5H5zM12 3.5v7M8 10.5h8M6.5 14.5v-4M17.5 14.5v-4',
  scroll: 'M7 4h11v13a3 3 0 0 1-3 3H6a3 3 0 0 0 3-3V6a2 2 0 0 0-2-2zM9.5 8.5h5.5M9.5 12h5.5M9.5 15.5h3',
  shield: 'M12 3.5 19 6v5.5c0 4.2-2.8 7.2-7 9-4.2-1.8-7-4.8-7-9V6zM9 12l2.2 2.2L15.5 10',
  gem: 'M6.5 4h11L21 9l-9 11L3 9zM3 9h18M9.5 4 8 9l4 11 4-11-1.5-5',
  oil: 'M12 3.5 8 20h8zM9.4 12.5h5.2M10.5 8h3M5 20.5h14',
  car: 'M4 15v-3l1.6-4.2A2 2 0 0 1 7.5 6.5h9a2 2 0 0 1 1.9 1.3L20 12v3M3.5 15h17v3h-17zM7 18v1.5M17 18v1.5M6.5 12h11',
  leaf: 'M5 19c0-8 5-13 14-14 0 9-5 14-13 14M5 19c2-4 5-7 9-9',
  house: 'M4 11 12 4l8 7v9H4zM10 20v-6h4v6',
  key: 'M8 11.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM10.5 12.5l8-8M15.5 7.5l2.5 2.5M13 10l2 2',
  scale: 'M12 4v16M6 20h12M4 8h16M7 8l-3 6a3.2 3.2 0 0 0 6 0zM17 8l-3 6a3.2 3.2 0 0 0 6 0z',
  bank: 'M3.5 9.5 12 4l8.5 5.5zM5.5 10.5v7M9.8 10.5v7M14.2 10.5v7M18.5 10.5v7M3.5 20.5h17M4.5 17.5h15',
  bed: 'M3.5 18V7M3.5 15h17v3M20.5 15v-3a3 3 0 0 0-3-3h-6v6M7 10.5a1.7 1.7 0 1 0 0 3.4 1.7 1.7 0 0 0 0-3.4z',
  dice: 'M7.5 4.5h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3zM9 9h.01M15 9h.01M12 12h.01M9 15h.01M15 15h.01',
  wheat: 'M12 21V8M12 8c0-2 1-3.5 2.5-4.5C14.5 5.5 14 7 12 8zM12 8c0-2-1-3.5-2.5-4.5C9.5 5.5 10 7 12 8zM12 13c0-2 1.3-3.5 3.5-4.5 0 2-1 3.7-3.5 4.5zM12 13c0-2-1.3-3.5-3.5-4.5 0 2 1 3.7 3.5 4.5zM12 18c0-2 1.3-3.3 3.3-4 0 2-1 3.5-3.3 4zM12 18c0-2-1.3-3.3-3.3-4 0 2 1 3.5 3.3 4z',
  bolt: 'M13 3.5 5.5 13.5H11L10 20.5l7.5-10H12z',
  heart: 'M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.5 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z',
  book: 'M4.5 5.5c2.7-.8 5.2-.6 7.5 1v13c-2.3-1.6-4.8-1.8-7.5-1zM19.5 5.5c-2.7-.8-5.2-.6-7.5 1v13c2.3-1.6 4.8-1.8 7.5-1z',
  gear: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 3.5v2.3M12 18.2v2.3M3.5 12h2.3M18.2 12h2.3M6 6l1.7 1.7M16.3 16.3 18 18M6 18l1.7-1.7M16.3 7.7 18 6',
  wine: 'M8 3.5h8l-.5 5a3.5 3.5 0 0 1-7 0zM12 12v7.5M8.5 20h7',
  smoke: 'M3.5 15h13v3.5h-13zM8 15v3.5M16.5 15v3.5M18.5 12.5c0-1.6 2-1.6 2-3.2 0-1.2-1-1.8-1-1.8M20 15v3.5',
  plane: 'M21 13.5 14 11V5.5a2 2 0 0 0-4 0V11l-7 2.5V16l7-1.5V19l-2 1.5V22l4-1 4 1v-1.5L14 19v-4.5L21 16z',
  stamp: 'M9 4h6v6l3 3v2H6v-2l3-3zM5 19.5h14',
  pickaxe: 'M4 8c4-3.5 12-3.5 16 0M12 5.5v15M10 8.5c-1.2.6-2 1.6-2.7 2.7',
  water: 'M3.5 9c2-2 4-2 6 0s4 2 6 0 3-1.5 5 0M3.5 14c2-2 4-2 6 0s4 2 6 0 3-1.5 5 0M3.5 19c2-2 4-2 6 0s4 2 6 0 3-1.5 5 0',
  ledger: 'M6.8 3.5h10.4a1.8 1.8 0 0 1 1.8 1.8v13.4a1.8 1.8 0 0 1-1.8 1.8H6.8A1.8 1.8 0 0 1 5 18.7V5.3a1.8 1.8 0 0 1 1.8-1.8zM8.5 8h7M8.5 11.5h7M8.5 15h4',
};

/** Inner-plate outline, chosen by instrument category (so kinds of charge are recognisable at a glance). */
export function plateShape(kind: string, r: number): string {
  const n = (v: number) => v.toFixed(2);
  const poly = (sides: number, rot: number) =>
    Array.from({ length: sides }, (_, i) => {
      const a = rot + (i * 2 * Math.PI) / sides;
      return `${i ? 'L' : 'M'}${n(Math.cos(a) * r)} ${n(Math.sin(a) * r)}`;
    }).join('') + 'Z';
  switch (kind) {
    case 'social-contribution':
    case 'insurance-premium':
      return poly(6, Math.PI / 6); // hexagon: pooled, benefit-linked contributions
    case 'royalty':
      return poly(4, 0); // diamond: resource rent
    case 'customs-duty':
      return poly(8, Math.PI / 8); // octagon: border
    case 'fee':
      return `M${n(-r)} ${n(-r * 0.55)}Q${n(-r)} ${n(-r)} ${n(-r * 0.55)} ${n(-r)}H${n(r * 0.55)}Q${n(r)} ${n(-r)} ${n(r)} ${n(-r * 0.55)}V${n(r * 0.55)}Q${n(r)} ${n(r)} ${n(r * 0.55)} ${n(r)}H${n(-r * 0.55)}Q${n(-r)} ${n(r)} ${n(-r)} ${n(r * 0.55)}Z`; // squircle: service charge
    case 'special-levy':
      return poly(3, -Math.PI / 2).replace(/^M/, 'M'); // triangle: earmarked
    default:
      return `M${n(-r)} 0A${n(r)} ${n(r)} 0 1 0 ${n(r)} 0A${n(r)} ${n(r)} 0 1 0 ${n(-r)} 0Z`; // circle: general tax
  }
}

export const CATEGORY_SHAPE_NAME: Record<string, string> = {
  tax: 'Round plate – tax',
  'social-contribution': 'Hexagon – social contribution',
  'insurance-premium': 'Hexagon – insurance premium',
  royalty: 'Diamond – royalty',
  'customs-duty': 'Octagon – customs duty',
  fee: 'Rounded square – fee or charge',
  'special-levy': 'Triangle – earmarked levy',
};
