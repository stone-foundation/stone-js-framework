#!/usr/bin/env node
/**
 * Publish `@stone-js/starters` to npm, idempotently (like `changeset publish`): only when the
 * package's current version is not already on the registry.
 *
 * The starter collection lives outside the pnpm workspace on purpose, its templates pin concrete
 * `@stone-js/*` ranges (not `workspace:*`), so changesets neither versions nor publishes it. Its
 * version is kept in step with the framework by `sync-external-versions.mjs` (run at
 * `version-packages`), and this script ships it after the framework packages are published.
 *
 * Wired into the `release` script, so a fresh `stone init` always fetches a small, versioned npm
 * package instead of cloning the whole monorepo.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'stone-js-starters')
const { name, version } = JSON.parse(readFileSync(join(DIR, 'package.json'), 'utf-8'))

function isAlreadyPublished () {
  try {
    const out = execFileSync('npm', ['view', `${name}@${version}`, 'version'], { stdio: ['ignore', 'pipe', 'ignore'] })
    return out.toString().trim() === version
  } catch {
    return false // `npm view` exits non-zero when the version does not exist yet
  }
}

if (isAlreadyPublished()) {
  console.log(`${name}@${version} is already on npm, skipping.`)
  process.exit(0)
}

console.log(`Publishing ${name}@${version}...`)
execFileSync('npm', ['publish', '--access', 'public'], { cwd: DIR, stdio: 'inherit' })
