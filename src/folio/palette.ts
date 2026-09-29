import type { NodeBranch } from '../data/model';

/** Branch colours are the same in every folio so a colour always means the same level of government. */
export const BRANCH_COLOR: Record<NodeBranch, string> = {
  country: '#f3d78e',
  national: '#5cc9ff',
  regional: '#bb92ff',
  local: '#ffb257',
};

export const BRANCH_NAME: Record<NodeBranch, string> = {
  country: 'Country',
  national: 'National / federal',
  regional: 'State / province / department',
  local: 'Municipal / local',
};

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbToHex(r: number, g: number, b: number): string {
  const c = (v: number) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

export function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(ar + (br - ar) * t, ag + (bg - ag) * t, ab + (bb - ab) * t);
}

export const lighten = (hex: string, t: number) => mix(hex, '#ffffff', t);
export const darken = (hex: string, t: number) => mix(hex, '#04060d', t);
