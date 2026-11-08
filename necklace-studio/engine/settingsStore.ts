/**
 * Saved settings profiles, per product, as a JSON file on the server:
 *
 *   settings/tg-carrie.json   { active, profiles: { [name]: Settings, ... } }
 *
 * Kept in the repo directory (not .cache) on purpose — these are decisions,
 * reviewable in git, not derived artefacts. Every write is sanitised against
 * the schema, so a hand-edited or stale file can never feed the engine an
 * out-of-range value.
 */
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { defaults, sanitize, type Settings } from './settings.ts';
import { STUDIO_ROOT } from './root.ts';

const DIR = join(STUDIO_ROOT, 'settings');
const FILE = join(DIR, 'tg-carrie.json');
export const BUILTIN = 'ShapeDiver live defaults';

export type Store = { active: string; profiles: Record<string, Settings> };

export function readStore(): Store {
  let raw: any = {};
  if (existsSync(FILE)) {
    try { raw = JSON.parse(readFileSync(FILE, 'utf8')); } catch { raw = {}; }
  }
  const profiles: Record<string, Settings> = { [BUILTIN]: defaults() };
  for (const [name, s] of Object.entries<any>(raw.profiles ?? {})) if (name !== BUILTIN) profiles[name] = sanitize(s);
  const active = typeof raw.active === 'string' && profiles[raw.active] ? raw.active : BUILTIN;
  return { active, profiles };
}

function write(store: Store) {
  mkdirSync(DIR, { recursive: true });
  const { [BUILTIN]: _builtin, ...user } = store.profiles;
  const tmp = `${FILE}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify({ active: store.active, profiles: user }, null, 2));
  renameSync(tmp, FILE);
}

export function validName(name: unknown): name is string {
  return typeof name === 'string' && name.trim().length > 0 && name.length <= 60 && name !== BUILTIN;
}

export function saveProfile(name: string, settings: unknown, makeActive = true): Store {
  const store = readStore();
  store.profiles[name.trim()] = sanitize(settings);
  if (makeActive) store.active = name.trim();
  write(store);
  return store;
}

export function setActive(name: string): Store {
  const store = readStore();
  if (store.profiles[name]) store.active = name;
  write(store);
  return store;
}

export function deleteProfile(name: string): Store {
  const store = readStore();
  if (name !== BUILTIN) delete store.profiles[name];
  if (!store.profiles[store.active]) store.active = BUILTIN;
  write(store);
  return store;
}
