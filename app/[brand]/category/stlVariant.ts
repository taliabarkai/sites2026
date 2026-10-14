// Shop The Look preview variant for the t3 template (?stl=v1 | current | v2 | v3 | v4).
// v1 is NEW FINAL and the default. Plain module (not 'use client') so the server
// page can parse the param.

export type StlVariant = 'current' | 'v1' | 'v2' | 'v3' | 'v4'

export function parseStlVariant(value: string | string[] | undefined): StlVariant {
  return value === 'current' || value === 'v2' || value === 'v3' || value === 'v4' ? value : 'v1'
}
