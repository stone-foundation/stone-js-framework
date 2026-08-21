#!/usr/bin/env node
/**
 * Fail when a published declaration file carries an extensionless relative import.
 *
 * Our sources are bundler-style (extensionless), and `tsc` reproduces what they wrote. In a
 * published ESM package with an `exports` map, a consumer on `moduleResolution: nodenext` cannot
 * resolve those specifiers: the types of everything they re-export vanish, and TypeScript reports
 * the misleading "has no exported member" rather than "module not resolved". The build rewrites them
 * (see `dtsExtensions` in rollup.config.base.mjs); this guard proves it stayed true, including for
 * any package that grows its own bespoke rollup config.
 *
 * Run after a build: `node scripts/check-dts-extensions.mjs`
 */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const SPECIFIER = /(?:from|import|export)\s*\(?\s*'(\.[^']*)'/g
const ALLOWED_EXTENSIONS = /\.(js|mjs|cjs|jsx|json|css)$/
// Doc comments survive into the emitted declarations, and prose legitimately quotes import
// statements (`import { modules } from './.stone/modules'`). Those are not specifiers a consumer
// resolves, so they are removed before matching: only block comments, which is the form JSDoc takes
// and the only one `tsc` keeps, so nothing that is code can be swallowed here.
const BLOCK_COMMENT = /\/\*[\s\S]*?\*\//g

const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name)
  return statSync(path).isDirectory() ? walk(path) : [path]
})

const offenders = []
let scanned = 0

for (const pkg of readdirSync('.').filter((n) => n.startsWith('stone-js-'))) {
  const dist = join(pkg, 'dist')
  if (!existsSync(dist)) continue

  for (const file of walk(dist).filter((p) => p.endsWith('.d.ts'))) {
    scanned++
    const source = readFileSync(file, 'utf-8').replace(BLOCK_COMMENT, '')
    const bad = [...source.matchAll(SPECIFIER)]
      .map((m) => m[1])
      .filter((specifier) => !ALLOWED_EXTENSIONS.test(specifier))
    if (bad.length > 0) offenders.push({ file, specifiers: [...new Set(bad)] })
  }
}

if (offenders.length > 0) {
  console.error(`✖ ${offenders.length} declaration file(s) carry extensionless relative imports:\n`)
  for (const { file, specifiers } of offenders) {
    console.error(`  ${file}\n    ${specifiers.join(', ')}`)
  }
  console.error('\nA consumer on `moduleResolution: nodenext` cannot resolve these, so the affected')
  console.error('exports become invisible. Ensure the package build applies `dtsExtensions()`.')
  process.exit(1)
}

console.log(`✔ ${scanned} declaration files, every relative import carries its extension.`)
