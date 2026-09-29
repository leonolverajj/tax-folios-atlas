/**
 * Pretty-prints data JSON the way the country files are written by hand: two-space indent,
 * with short objects and arrays kept on one line. Used by every script that rewrites data
 * files, so machine edits and human edits produce the same layout (and readable diffs).
 */
const WIDTH = 150;

function inline(x: unknown): string {
  if (Array.isArray(x)) return `[${x.map(inline).join(', ')}]`;
  if (x && typeof x === 'object') {
    const entries = Object.entries(x as Record<string, unknown>).filter(([, v]) => v !== undefined);
    return entries.length ? `{ ${entries.map(([k, v]) => `${JSON.stringify(k)}: ${inline(v)}`).join(', ')} }` : '{}';
  }
  return JSON.stringify(x);
}

function depth(x: unknown): number {
  if (Array.isArray(x)) return 1 + Math.max(0, ...x.map(depth));
  if (x && typeof x === 'object') return 1 + Math.max(0, ...Object.values(x as Record<string, unknown>).map(depth));
  return 0;
}

function go(x: unknown, indent: string): string {
  if (x === null || typeof x !== 'object') return JSON.stringify(x);
  const flat = inline(x);
  if (indent.length + flat.length <= WIDTH && depth(x) <= 2) return flat;
  const pad = `${indent}  `;
  if (Array.isArray(x)) return `[\n${x.map((v) => pad + go(v, pad)).join(',\n')}\n${indent}]`;
  const entries = Object.entries(x as Record<string, unknown>).filter(([, v]) => v !== undefined);
  return `{\n${entries.map(([k, v]) => `${pad}${JSON.stringify(k)}: ${go(v, pad)}`).join(',\n')}\n${indent}}`;
}

export function formatJson(value: unknown): string {
  return `${go(value, '')}\n`;
}
