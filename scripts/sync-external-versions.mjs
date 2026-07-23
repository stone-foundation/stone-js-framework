#!/usr/bin/env node
/**
 * Keep the version-pinned `@stone-js/*` dependencies of the NON auto-versioned packages aligned
 * with the monorepo's current version.
 *
 * Workspace packages (core, router, adapters, cli, ...) reference each other with `workspace:*`
 * and are bumped together by changesets, so they never drift. But the packages that are excluded
 * from the workspace and from the release, the starters, the blog starters and the docs site,
 * pin concrete ranges like `^0.8.0`. Left alone, those go stale every release. This script rewrites
 * every concrete `@stone-js/*` range in those packages to `^<monorepo version>`, so a fresh app
 * scaffolded from a starter always installs the version that was just published.
 *
 * `workspace:*` deps (e.g. the lab apps) are left untouched: pnpm already links them to the local
 * packages, so they are always current by construction.
 *
 * Run it from the monorepo build (wired as `prebuild:ci`), or on demand: `pnpm run sync:versions`.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

/** The version every external package should pin, read from the core package (the release anchor). */
function targetVersion () {
  const core = JSON.parse(readFileSync(join(ROOT, 'stone-js-core', 'package.json'), 'utf-8'))
  return core.version
}

/** package.json files of the non auto-versioned packages: starters, blog starters, docs. */
function externalManifests () {
  const files = []
  for (const group of ['stone-js-starters', 'stone-js-blog-starters']) {
    const dir = join(ROOT, group)
    if (!existsSync(dir)) { continue }
    files.push(join(dir, 'package.json')) // the collection manifest itself
    for (const name of readdirSync(dir)) {
      const pkg = join(dir, name, 'package.json')
      if (statSync(join(dir, name)).isDirectory() && existsSync(pkg)) { files.push(pkg) }
    }
  }
  const docs = join(ROOT, 'stone-js-docs', 'package.json')
  if (existsSync(docs)) { files.push(docs) }
  return files
}

/** Rewrite every concrete `@stone-js/*` range in one manifest to `^<version>`. Returns the count. */
function syncManifest (file, version) {
  const pkg = JSON.parse(readFileSync(file, 'utf-8'))
  const range = `^${version}`
  let changed = 0

  for (const section of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
    const deps = pkg[section]
    if (deps === undefined || deps === null) { continue }
    for (const [name, current] of Object.entries(deps)) {
      // Only our packages, and only concrete ranges: never touch `workspace:*`, `link:`, `file:`, etc.
      if (!name.startsWith('@stone-js/')) { continue }
      if (typeof current !== 'string' || !/^[\^~]?\d/.test(current)) { continue }
      if (current !== range) { deps[name] = range; changed++ }
    }
  }

  if (changed > 0) {
    writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n')
  }
  return changed
}

function main () {
  const version = targetVersion()
  let total = 0
  let touched = 0

  for (const file of externalManifests()) {
    const changed = syncManifest(file, version)
    if (changed > 0) {
      touched++
      total += changed
      console.log(`  ${file.replace(ROOT + '/', '')}: ${changed} dependency(ies) -> ^${version}`)
    }
  }

  console.log(total > 0
    ? `sync-external-versions: aligned ${total} dependency(ies) across ${touched} package(s) to ^${version}.`
    : `sync-external-versions: everything already pinned to ^${version}.`)
}

main()
