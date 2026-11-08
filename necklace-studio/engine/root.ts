/**
 * Where the studio's files live. Standalone (`pnpm dev`, `pnpm golden`) the
 * working directory IS the studio. Hosted inside the Tenengroup design-system
 * app, the working directory is the app and the studio sits in
 * `necklace-studio/`. Only paths change here — never what the engine does.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';

export const STUDIO_ROOT = existsSync(join(process.cwd(), 'engine', 'products'))
  ? process.cwd()
  : join(process.cwd(), 'necklace-studio');
