/**
 * Sprite view: the server's PNGs placed by the simulation on a 2D canvas.
 *
 * Draw order: chain links → plates → connection rings (which sit on the
 * loops, like Oleg's generator lays them) → a slow canvas-space sheen.
 */
import type { Necklace } from './physics.ts';
import type { LoadedLinks, LoadedPlate } from './assets.ts';
import { placeLinks } from './chain.ts';

export type View = { scale: number; ox: number; oy: number; dpr: number };

/** World mm → canvas px. */
export function worldToCanvas(v: View, x: number, y: number) {
  return { x: v.ox + x * v.scale, y: v.oy + y * v.scale };
}

export function drawSpriteScene(ctx: CanvasRenderingContext2D, v: View, nk: Necklace, plates: LoadedPlate[], links: LoadedLinks, t: number, dark: boolean, showChain = true) {
  const { width, height } = ctx.canvas;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = dark ? '#16171a' : '#f4f1ec';
  ctx.fillRect(0, 0, width, height);
  ctx.setTransform(v.dpr, 0, 0, v.dpr, 0, 0);
  ctx.imageSmoothingQuality = 'high';

  const placed = placeLinks(nk);
  const drawLink = (kind: 'flat' | 'edge' | 'connection', x: number, y: number, angle: number) => {
    const m = links.meta.sprites[kind];
    const p = worldToCanvas(v, x, y);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(angle);
    const k = v.scale / m.pxPerMm;
    ctx.scale(k, k);
    ctx.drawImage(links.imgs[kind], -m.centrePx.x, -m.centrePx.y);
    ctx.restore();
  };
  if (showChain) for (const l of placed) if (l.kind !== 'connection') drawLink(l.kind, l.x, l.y, l.angle);

  plates.forEach((pl, k) => {
    const pose = nk.platePose(k);
    const o = worldToCanvas(v, pose.origin.x, pose.origin.y);
    const m = pl.meta;
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.rotate(pose.angle);
    const s = v.scale / m.pxPerMm;
    ctx.scale(s, s);
    ctx.drawImage(pl.img, -m.attachPx[0].x, -m.attachPx[0].y);
    ctx.restore();
  });

  if (showChain) for (const l of placed) if (l.kind === 'connection') drawLink('connection', l.x, l.y, l.angle);

  // Living sheen: soft diagonal light bands fixed to the canvas, so metal
  // brightens and dims as it moves through them and freezes when it rests.
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalCompositeOperation = 'source-atop';
  const W = width, H = height;
  const g = ctx.createLinearGradient(0, 0, W, H * 0.6);
  const phase = (t * 0.00002) % 1;
  for (let i = 0; i <= 10; i++) {
    const s = i / 10;
    const band = 0.5 + 0.5 * Math.cos((s * 5 + phase) * Math.PI * 2);
    g.addColorStop(s, `rgba(255, 248, 225, ${0.1 * band ** 3})`);
  }
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

/** Plate hit test in sprite space — used to grab plates by their metal, not their bbox. */
export function plateHit(v: View, nk: Necklace, pl: LoadedPlate, k: number, cx: number, cy: number): boolean {
  const pose = nk.platePose(k);
  const o = worldToCanvas(v, pose.origin.x, pose.origin.y);
  const dx = cx - o.x, dy = cy - o.y;
  const c = Math.cos(-pose.angle), s = Math.sin(-pose.angle);
  const k2 = pl.meta.pxPerMm / v.scale;
  const sx = (dx * c - dy * s) * k2 + pl.meta.attachPx[0].x;
  const sy = (dx * s + dy * c) * k2 + pl.meta.attachPx[0].y;
  return sx >= 0 && sy >= 0 && sx < pl.meta.widthPx && sy < pl.meta.heightPx;
}
