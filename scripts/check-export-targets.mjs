#!/usr/bin/env node
/**
 * Fail when a published `exports` entry points at a file that is not there.
 *
 * A subpath is a promise made in `package.json` and kept by the build, and nothing was checking
 * that the two agreed. Four did not: `@stone-js/use-react/cli`, and `use-react-native`'s `cli`,
 * `metro` and `navigation` all declared `./dist/<name>.d.ts` while the build emitted
 * `./dist/<name>/index.d.ts`, because a single-entry build whose source sits in a folder emits a
 * folder. The code resolved, so nothing failed; only the types were missing, and an import of the
 * navigator the documentation recommends silently came back as `any`.
 *
 * Run after a build: `node scripts/check-export-targets.mjs`
 */
import { readdirSync, existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const offenders = []
let checked = 0

for (const pkg of readdirSync('.').filter((name) => name.startsWith('stone-js-'))) {
  const manifest = join(pkg, 'package.json')
  if (!existsSync(manifest) || !statSync(pkg).isDirectory()) continue

  const { name, exports = {} } = JSON.parse(readFileSync(manifest, 'utf-8'))

  for (const [subpath, conditions] of Object.entries(exports)) {
    // A condition map, or a bare string; both are legal in an exports field.
    const targets = typeof conditions === 'string'
      ? { default: conditions }
      : Object.fromEntries(Object.entries(conditions ?? {}).filter(([, t]) => typeof t === 'string'))

    for (const [condition, target] of Object.entries(targets)) {
      checked++
      const path = join(pkg, target.replace(/^\.\//, ''))
      if (!existsSync(path)) offenders.push({ name, subpath, condition, target })
    }
  }
}

if (offenders.length > 0) {
  console.error(`\n✖ ${offenders.length} export target(s) point at a file that does not exist:\n`)
  for (const o of offenders) {
    console.error(`  ${o.name} → "${o.subpath}" (${o.condition}): ${o.target}`)
  }
  console.error('\nThe build emits a folder for a single-entry build whose source is in one:')
  console.error('`src/cli/index.ts` becomes `dist/cli/index.d.ts`, not `dist/cli.d.ts`.\n')
  process.exit(1)
}

console.log(`✔ ${checked} export targets, every one of them present.`)
