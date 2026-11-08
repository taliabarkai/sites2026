/**
 * Plate → triangle mesh, and the GLB that carries it.
 *
 * Same construction as Oleg's 3D PREVIEW cluster: Boundary Surfaces over the
 * outline + holes, extruded along +Z by THICKNESS (1.1 mm). Caps are flat;
 * side walls get smooth normals around curves and hard creases at corners, so
 * a three.js environment map makes the edge read as polished metal.
 *
 * Frame: the plate's mm frame (Y up), extruded to z ∈ [0, thickness], top face
 * at +Z facing the viewer.
 */
import earcut from 'earcut';
import { Document, NodeIO } from '@gltf-transform/core';
import type { Polygon, Ring } from '../geom/types.ts';
import { signedArea, simplifyRing } from '../geom/types.ts';

/** 10 µm: invisible on a 3D preview, ~5× fewer triangles than the 2 µm raster sampling. */
const MESH_TOL_MM = 0.01;
import type { Plate } from '../plate/solve.ts';
import type { Coating } from './sprite.ts';

export type TriMesh = { positions: Float32Array<ArrayBuffer>; normals: Float32Array<ArrayBuffer>; indices: Uint32Array<ArrayBuffer> };

const CREASE_COS = Math.cos((35 * Math.PI) / 180);

function ccwRing(r: Ring, wantCcw: boolean): Ring {
  const isCcw = signedArea(r) > 0;
  return isCcw === wantCcw ? r : [...r].reverse();
}

export function extrude(polys: Polygon[], thickness: number): TriMesh {
  const P: number[] = [], N: number[] = [], I: number[] = [];
  const push = (x: number, y: number, z: number, nx: number, ny: number, nz: number) => {
    P.push(x, y, z);
    N.push(nx, ny, nz);
    return P.length / 3 - 1;
  };

  for (const poly of polys) {
    const outer = ccwRing(simplifyRing(poly.outer, MESH_TOL_MM), true);
    const holes = poly.holes.map((h) => ccwRing(simplifyRing(h, MESH_TOL_MM), false));
    // ---- caps
    const flat: number[] = [];
    const holeIdx: number[] = [];
    for (const p of outer) flat.push(p.x, p.y);
    for (const h of holes) {
      holeIdx.push(flat.length / 2);
      for (const p of h) flat.push(p.x, p.y);
    }
    const tris = earcut(flat, holeIdx, 2);
    const nv = flat.length / 2;
    const top = P.length / 3;
    for (let i = 0; i < nv; i++) push(flat[2 * i], flat[2 * i + 1], thickness, 0, 0, 1);
    const bot = P.length / 3;
    for (let i = 0; i < nv; i++) push(flat[2 * i], flat[2 * i + 1], 0, 0, 0, -1);
    for (let t = 0; t < tris.length; t += 3) {
      I.push(top + tris[t], top + tris[t + 1], top + tris[t + 2]);
      I.push(bot + tris[t], bot + tris[t + 2], bot + tris[t + 1]);
    }
    // ---- walls: outer CCW and holes CW both put the solid on the left,
    // so the outward normal of edge a→b is (dy, -dx).
    for (const ring of [outer, ...holes]) {
      const n = ring.length;
      const en: [number, number][] = [];
      for (let i = 0; i < n; i++) {
        const a = ring[i], b = ring[(i + 1) % n];
        const dx = b.x - a.x, dy = b.y - a.y, l = Math.hypot(dx, dy) || 1;
        en.push([dy / l, -dx / l]);
      }
      for (let i = 0; i < n; i++) {
        const a = ring[i], b = ring[(i + 1) % n];
        const prev = en[(i - 1 + n) % n], cur = en[i], next = en[(i + 1) % n];
        const blend = (q: [number, number]) => {
          if (q[0] * cur[0] + q[1] * cur[1] < CREASE_COS) return cur;
          const x = q[0] + cur[0], y = q[1] + cur[1], l = Math.hypot(x, y) || 1;
          return [x / l, y / l] as [number, number];
        };
        const na = blend(prev), nb = blend(next);
        const a0 = push(a.x, a.y, 0, na[0], na[1], 0), a1 = push(a.x, a.y, thickness, na[0], na[1], 0);
        const b0 = push(b.x, b.y, 0, nb[0], nb[1], 0), b1 = push(b.x, b.y, thickness, nb[0], nb[1], 0);
        I.push(a0, b0, b1, a0, b1, a1);
      }
    }
  }
  return { positions: new Float32Array(P), normals: new Float32Array(N), indices: new Uint32Array(I) };
}

/**
 * Indexed mesh from the .gh → TriMesh with area-weighted smooth vertex normals.
 * The link meshes are low-poly (30 vertices); faceting them reads as cheap,
 * smoothing reads as a polished round wire.
 */
export function smooth(positions: number[], indices: number[]): TriMesh {
  const n = new Float32Array(positions.length);
  for (let t = 0; t < indices.length; t += 3) {
    const [a, b, c] = [indices[t], indices[t + 1], indices[t + 2]];
    const ux = positions[3 * b] - positions[3 * a], uy = positions[3 * b + 1] - positions[3 * a + 1], uz = positions[3 * b + 2] - positions[3 * a + 2];
    const wx = positions[3 * c] - positions[3 * a], wy = positions[3 * c + 1] - positions[3 * a + 1], wz = positions[3 * c + 2] - positions[3 * a + 2];
    const nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx;
    for (const k of [a, b, c]) {
      n[3 * k] += nx; n[3 * k + 1] += ny; n[3 * k + 2] += nz;
    }
  }
  for (let k = 0; k < n.length; k += 3) {
    const l = Math.hypot(n[k], n[k + 1], n[k + 2]) || 1;
    n[k] /= l; n[k + 1] /= l; n[k + 2] /= l;
  }
  return { positions: new Float32Array(positions), normals: n, indices: new Uint32Array(indices) };
}

const METAL: Record<Coating, [number, number, number]> = {
  GP: [1.0, 0.776, 0.369],
  VMGP: [1.0, 0.74, 0.33],
  SR: [0.86, 0.86, 0.87],
  RGP: [0.96, 0.66, 0.55],
  VMRGP: [0.93, 0.6, 0.5],
};

/**
 * One GLB per plate. Nodes:
 *   plate           the extruded name, mm, origin = first glyph pivot on the baseline
 *   attach:FIRST    empty at the left loop centre, on the plate's mid-plane
 *   attach:LAST     empty at the right loop centre
 * Extras on the scene carry the same numbers for consumers that don't walk nodes.
 */
export async function plateGlb(plate: Plate, coating: Coating = 'GP'): Promise<Uint8Array> {
  const doc = new Document();
  const buffer = doc.createBuffer();
  const mesh = extrude(plate.polygons, plate.thicknessMm);
  const mat = doc.createMaterial('metal').setBaseColorFactor([...METAL[coating], 1]).setMetallicFactor(1).setRoughnessFactor(0.22);
  const prim = doc
    .createPrimitive()
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(mesh.positions).setBuffer(buffer))
    .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(mesh.normals).setBuffer(buffer))
    .setIndices(doc.createAccessor().setType('SCALAR').setArray(mesh.indices).setBuffer(buffer))
    .setMaterial(mat);
  const scene = doc.createScene('plate');
  scene.addChild(doc.createNode('plate').setMesh(doc.createMesh('plate').addPrimitive(prim)));
  for (const l of plate.loops) {
    scene.addChild(doc.createNode(`attach:${l.role}`).setTranslation([l.centre.x, l.centre.y, plate.thicknessMm / 2]));
  }
  scene.setExtras({
    productId: plate.productId,
    text: plate.text,
    preset: plate.preset,
    thicknessMm: plate.thicknessMm,
    bbox: plate.bbox,
    loops: plate.loops,
  });
  doc.getRoot().setDefaultScene(scene);
  return new NodeIO().writeBinary(doc);
}

/** The chain's two link meshes from the .gh, as one GLB with nodes `chainLink` and `connectionLink`. */
export async function linksGlb(links: { chainLink: { positions: number[]; indices: number[] }; connectionLink: { positions: number[]; indices: number[] } }, coating: Coating = 'GP'): Promise<Uint8Array> {
  const doc = new Document();
  const buffer = doc.createBuffer();
  const mat = doc.createMaterial('metal').setBaseColorFactor([...METAL[coating], 1]).setMetallicFactor(1).setRoughnessFactor(0.25);
  const scene = doc.createScene('links');
  for (const [name, src] of Object.entries(links)) {
    const m = smooth(src.positions, src.indices);
    const prim = doc
      .createPrimitive()
      .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(m.positions).setBuffer(buffer))
      .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(m.normals).setBuffer(buffer))
      .setIndices(doc.createAccessor().setType('SCALAR').setArray(m.indices).setBuffer(buffer))
      .setMaterial(mat);
    scene.addChild(doc.createNode(name).setMesh(doc.createMesh(name).addPrimitive(prim)));
  }
  doc.getRoot().setDefaultScene(scene);
  return new NodeIO().writeBinary(doc);
}
