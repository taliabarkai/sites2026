import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';
import { tgCarrie } from '../engine/products/tg-carrie/index.ts';
import { solvePlate } from '../engine/plate/solve.ts';
import { rasterizeAlpha } from '../engine/render/raster.ts';
const REF = join(process.cwd(), 'golden', 'shapediver-reference');
const [file, out] = process.argv.slice(2);
const ref = JSON.parse(readFileSync(join(REF, file + '.json'), 'utf8'));
const p = tgCarrie(); const plate = solvePlate(p, ref.name, p.letterPresets[String(ref.letterMm)]);
const b = plate.bbox;
const { data, info } = await sharp(join(REF, file + '.png')).ensureAlpha().extractChannel(3).raw().toBuffer({ resolveWithObject: true });
const mine = rasterizeAlpha(plate.polygons, { widthPx: info.width, heightPx: info.height, pxPerMm: 1/ref.mmPerPx, centrePx: ref.letteringCentrePx, centreMm: {x:(b.minX+b.maxX)/2,y:(b.minY+b.maxY)/2}, samples: 4 });
const rgb = Buffer.alloc(info.width*info.height*3, 255);
for (let i=0;i<data.length;i++){ const a=data[i]>=128, m=mine[i]>=128;
  const c = a&&m?[120,120,120]: a?[220,30,30]: m?[30,60,230]:[255,255,255]; rgb.set(c,i*3); }
await sharp(rgb,{raw:{width:info.width,height:info.height,channels:3}}).resize({width:info.width*3,kernel:'nearest'}).png().toFile(out);
console.log(ref.name, ref.letterMm, out);
