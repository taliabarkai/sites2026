import { writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { tgCarrie } from '../engine/products/tg-carrie/index.ts';
import { renderLink } from '../engine/render/linkSprite.ts';
const out = process.argv[2] ?? '.';
const p = tgCarrie();
const parts = [];
for (const [name, mesh, view] of [['chain-flat', p.chainLink, 'flat'], ['chain-edge', p.chainLink, 'edge'], ['connection', p.connectionLink, 'flat']] as const) {
  const s = await renderLink(mesh, view, 'GP', 80);
  writeFileSync(`${out}/${name}.png`, s.png);
  console.log(name, s.widthPx, 'x', s.heightPx, 'centre', s.centrePx);
  parts.push({ input: s.png, top: 10, left: 10 + parts.length * 200 });
}
await sharp({ create: { width: 640, height: 200, channels: 4, background: '#ffffff' } }).composite(parts).png().toFile(`${out}/links-sheet.png`);
