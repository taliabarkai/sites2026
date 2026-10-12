// Shop The Look preview variant for the t3 template (?stl=current | v1 | v2 | v3).
// Plain module (not 'use client') so the server page can parse the param.

export type StlVariant = 'current' | 'v1' | 'v2' | 'v3'

export function parseStlVariant(value: string | string[] | undefined): StlVariant {
  return value === 'v1' || value === 'v2' || value === 'v3' ? value : 'current'
}
