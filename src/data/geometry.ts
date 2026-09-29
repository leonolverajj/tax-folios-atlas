/**
 * Single source of truth for core / socket / hit-area geometry.
 *
 * Everything that draws or measures a core uses these functions with the
 * same world coordinate system: the core's centre (x, y) and radius r are
 * the bezel's outer edge. A socket is the point on that edge facing the
 * partner core, so a line from socket to socket lies exactly on the
 * centre-to-centre segment.
 */
export interface Disc {
  x: number;
  y: number;
  r: number;
}

export interface Socket {
  x: number;
  y: number;
  /** Direction (radians) from the core centre towards the partner. */
  angle: number;
}

export function socketFacing(from: Disc, toward: { x: number; y: number }): Socket {
  const dx = toward.x - from.x;
  const dy = toward.y - from.y;
  const angle = Math.atan2(dy, dx);
  return { x: from.x + Math.cos(angle) * from.r, y: from.y + Math.sin(angle) * from.r, angle };
}

export interface EdgeGeometry {
  a: Socket;
  b: Socket;
  /** true if the discs overlap so much that no visible line exists */
  hidden: boolean;
}

export function edgeGeometry(parent: Disc, child: Disc): EdgeGeometry {
  const a = socketFacing(parent, child);
  const b = socketFacing(child, parent);
  const dist = Math.hypot(child.x - parent.x, child.y - parent.y);
  return { a, b, hidden: dist <= parent.r + child.r + 2 };
}

/** Shortest distance from any other disc, used to cap touch hit areas so neighbours never overlap. */
export function nearestNeighbourDistance(id: string, discs: Map<string, Disc>): number {
  const me = discs.get(id)!;
  let best = Infinity;
  for (const [otherId, o] of discs) {
    if (otherId === id) continue;
    best = Math.min(best, Math.hypot(o.x - me.x, o.y - me.y) - o.r);
  }
  return best;
}

/**
 * Hit radius in world units. Touch targets should be at least `minScreenPx`
 * radius on screen, but never so large that they swallow a neighbour.
 */
export function hitRadius(id: string, discs: Map<string, Disc>, scale: number, minScreenPx = 22): number {
  const me = discs.get(id)!;
  const want = Math.max(me.r, minScreenPx / Math.max(scale, 0.0001));
  const gap = nearestNeighbourDistance(id, discs);
  const cap = Number.isFinite(gap) ? Math.max(me.r, gap * 0.48) : want;
  return Math.min(want, cap);
}

export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
