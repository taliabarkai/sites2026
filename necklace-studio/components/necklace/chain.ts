/**
 * Simulation particles → placed links. Shared by the sprite and 3D views so
 * both draw the identical chain.
 *
 * Mirrors Oleg's CHAIN GENERATOR: one link centred on every point at link
 * pitch, oriented along the chain, alternating flat / rotated 90° about the
 * chain tangent; the link touching a name loop is the CONNECTION LINK, laid
 * flat and centred on the loop.
 */
import type { Necklace } from './physics.ts';

export type LinkKind = 'flat' | 'edge' | 'connection';
export type PlacedLink = { kind: LinkKind; x: number; y: number; angle: number };

export function placeLinks(nk: Necklace): PlacedLink[] {
  const out: PlacedLink[] = [];
  const plateParticles = new Set(nk.plates.flatMap((p) => [p.p[0], p.p[1]]));
  for (const seg of nk.segments) {
    const ids = seg.particles;
    const last = ids.length - 1;
    const tangent = (i: number) => {
      const a = ids[Math.max(0, i - 1)], b = ids[Math.min(last, i + 1)];
      return Math.atan2(nk.y[b] - nk.y[a], nk.x[b] - nk.x[a]);
    };
    // Alternation is anchored at a connection end so the link next to every
    // loop is edge-on and threads the flat connection ring.
    const anchoredAtEnd = !plateParticles.has(ids[0]) && plateParticles.has(ids[last]);
    for (let i = 0; i <= last; i++) {
      const id = ids[i];
      const isEnd = i === 0 || i === last;
      if (isEnd) {
        if (plateParticles.has(id)) out.push({ kind: 'connection', x: nk.x[id], y: nk.y[id], angle: tangent(i) });
        continue; // clasp pins draw nothing
      }
      const parity = anchoredAtEnd ? last - i : i;
      out.push({ kind: parity % 2 === 1 ? 'edge' : 'flat', x: nk.x[id], y: nk.y[id], angle: tangent(i) });
    }
  }
  // One-loop plates: a connection ring at each hanging point, joining the
  // plate's loop to the chain.
  for (const pl of nk.plates) if (pl.hung) out.push({ kind: 'connection', x: nk.x[pl.p[0]], y: nk.y[pl.p[0]], angle: 0 });
  return out;
}
