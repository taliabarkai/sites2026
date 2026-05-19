#!/usr/bin/env node
/**
 * Generates typed React icon components from SVG assets.
 * Run after all SVGs have been exported to src/assets/icons/{brand}/.
 *
 * Usage: node scripts/generate-icon-components.mjs
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const assetsDir = path.join(root, 'src/assets/icons')
const componentsDir = path.join(root, 'src/components/icons')
const brands = ['oal', 'mnn', 'tgr', 'lal', 'ib']

function toPascalCase(str) {
  return str
    .replace(/[\/\-_\s]+(.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (_, c) => c.toUpperCase())
}

function normalizeSvg(svg) {
  return svg
    .replace(/fill="black"/g, 'fill="currentColor"')
    .replace(/fill="#000000"/g, 'fill="currentColor"')
    .replace(/fill="#000"/g, 'fill="currentColor"')
    .replace(/stroke="black"/g, 'stroke="currentColor"')
    .replace(/stroke="#000000"/g, 'stroke="currentColor"')
    .replace(/stroke="#000"/g, 'stroke="currentColor"')
    .replace(/fill-rule=/g, 'fillRule=')
    .replace(/clip-rule=/g, 'clipRule=')
    .replace(/stroke-width=/g, 'strokeWidth=')
    .replace(/stroke-linecap=/g, 'strokeLinecap=')
    .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
    .replace(/stroke-dasharray=/g, 'strokeDasharray=')
    .replace(/stroke-dashoffset=/g, 'strokeDashoffset=')
    .replace(/clip-path=/g, 'clipPath=')
    .replace(/stop-color=/g, 'stopColor=')
    .replace(/stop-opacity=/g, 'stopOpacity=')
}

function extractSvgParts(svg) {
  const viewBoxMatch = svg.match(/viewBox="([^"]+)"/)
  const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 24 24'
  const innerMatch = svg.match(/<svg[^>]*>([\s\S]*?)<\/svg>\s*$/)
  const inner = innerMatch ? innerMatch[1].trim() : ''
  return { viewBox, inner }
}

function makeComponentName(iconName) {
  return `${toPascalCase(iconName)}Icon`
}

function generateComponent(iconName, svgContent) {
  const componentName = makeComponentName(iconName)
  const normalized = normalizeSvg(svgContent)
  const { viewBox, inner } = extractSvgParts(normalized)

  return `import React from 'react'
import type { IconProps } from '../Icon'

export function ${componentName}({ size = 24, color = 'currentColor', className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="${viewBox}"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ color }}
    >
      ${inner}
    </svg>
  )
}
`
}

function collectSvgs(dir, base) {
  const results = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...collectSvgs(full, base))
    } else if (entry.name.endsWith('.svg')) {
      results.push(path.relative(base, full))
    }
  }
  return results.sort()
}

let totalGenerated = 0
const generatedBrands = []

for (const brand of brands) {
  const brandAssets = path.join(assetsDir, brand)
  const brandComponents = path.join(componentsDir, brand)

  if (!fs.existsSync(brandAssets)) {
    console.log(`  ${brand}: no assets directory, skipping`)
    continue
  }

  const svgFiles = collectSvgs(brandAssets, brandAssets)

  if (svgFiles.length === 0) {
    console.log(`  ${brand}: no SVG files, skipping`)
    continue
  }

  fs.mkdirSync(brandComponents, { recursive: true })

  const exportLines = []

  for (const svgFile of svgFiles) {
    const iconName = svgFile.replace(/\.svg$/, '')
    const componentName = makeComponentName(iconName)
    const svgContent = fs.readFileSync(path.join(brandAssets, svgFile), 'utf8')
    const component = generateComponent(iconName, svgContent)

    fs.writeFileSync(path.join(brandComponents, `${componentName}.tsx`), component)
    exportLines.push(`export { ${componentName} } from './${componentName}'`)
    totalGenerated++
  }

  exportLines.sort()
  fs.writeFileSync(path.join(brandComponents, 'index.ts'), exportLines.join('\n') + '\n')
  generatedBrands.push(brand)
  console.log(`  ${brand}: ${svgFiles.length} components`)
}

// Root index.ts
const rootLines = generatedBrands.map(b => `export * as ${b} from './${b}'`)
rootLines.push(`export type { IconProps, Brand } from './Icon'`)

fs.writeFileSync(path.join(componentsDir, 'index.ts'), rootLines.join('\n') + '\n')

console.log(`\nDone. ${totalGenerated} components generated across ${generatedBrands.length} brands.`)
