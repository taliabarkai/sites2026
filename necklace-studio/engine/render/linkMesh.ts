/**
 * Smooth link geometry with Oleg's link dimensions.
 *
 * The .gh's CHAIN LINK / CONNECTION LINK meshes are 30-vertex previews —
 * correct size, visibly faceted at product-shot scale. We keep them as the
 * source of truth for SIZE and regenerate the surface: an elliptical torus
 * whose outer extents match the mesh's X/Y extents and whose wire diameter is
 * the mesh's Z extent (the link lies flat in XY with its long axis on X).
 */
export type LinkDims = { lengthMm: number; widthMm: number; wireMm: number };

export function linkDims(mesh: { positions: number[] }): LinkDims {
  const p = mesh.positions;
  const ext = [0, 1, 2].map((k) => {
    let lo = Infinity, hi = -Infinity;
    for (let i = k; i < p.length; i += 3) { lo = Math.min(lo, p[i]); hi = Math.max(hi, p[i]); }
    return hi - lo;
  });
  return { lengthMm: ext[0], widthMm: ext[1], wireMm: ext[2] };
}

export function ovalTorus(d: LinkDims, segments = 72, sides = 18): { positions: number[]; indices: number[] } {
  const r = d.wireMm / 2;
  const a = d.lengthMm / 2 - r, b = d.widthMm / 2 - r;
  const positions: number[] = [], indices: number[] = [];
  for (let i = 0; i < segments; i++) {
    const u = (i / segments) * Math.PI * 2;
    const cx = a * Math.cos(u), cy = b * Math.sin(u);
    // In-plane normal of the ellipse at u.
    let nx = b * Math.cos(u), ny = a * Math.sin(u);
    const nl = Math.hypot(nx, ny);
    nx /= nl; ny /= nl;
    for (let j = 0; j < sides; j++) {
      const v = (j / sides) * Math.PI * 2;
      positions.push(cx + r * Math.cos(v) * nx, cy + r * Math.cos(v) * ny, r * Math.sin(v));
    }
  }
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < sides; j++) {
      const a0 = i * sides + j, a1 = i * sides + ((j + 1) % sides);
      const b0 = ((i + 1) % segments) * sides + j, b1 = ((i + 1) % segments) * sides + ((j + 1) % sides);
      indices.push(a0, b0, b1, a0, b1, a1);
    }
  }
  return { positions, indices };
}
