#!/usr/bin/env node
/**
 * Writes, and in CI verifies, the list of names each package exports from its entry point.
 *
 * Forty-eight of the forty-nine published packages re-export a `utils`, `declarations` or
 * `constants` module wholesale (678 `export *` lines against one explicit `export {}`). The public
 * API is therefore not a decision: a helper added to `utils.ts` on a Tuesday is public API on
 * Friday's release, and after the freeze it is frozen public API for the life of the major, without
 * anyone having chosen it. Reviewing the surface once, while the mechanism keeps adding to it
 * silently, is a cleanup that starts decaying the day it lands.
 *
 * So the surface is checked in. `api/<package>.api.txt` holds the sorted exported names with their
 * kind, one per line, generated from the built declarations, which is the artifact consumers get
 * rather than what `src` happens to contain. Adding a public export becomes a visible line in a pull
 * request, reviewed like any other change, and removing one becomes impossible to do by accident.
 *
 * It reads the entry point through the TypeScript checker rather than by matching text, because
 * `export *` has to be followed transitively to be answered at all, and a gate that reports names
 * that are not exported (or misses ones that are) gets ignored within a week.
 *
 * What it deliberately does not track is signatures. The accident this guards against is a name
 * becoming public without a decision, and the kind is enough to catch a value quietly becoming a
 * type. Signature-level drift needs a full API extractor and a per-package configuration, and it can
 * be added later without changing what is written here.
 *
 *   node scripts/api-report.mjs            # write the reports
 *   node scripts/api-report.mjs --check    # fail when they differ from what is committed
 *
 * Run after a build: the reports come from `dist`.
 */
import { createRequire } from 'node:module'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// `typescript` is CommonJS, and its default export under Node's ESM interop is not the namespace,
// so the enums it is read for come back undefined.
const ts = createRequire(import.meta.url)('typescript')

const check = process.argv.includes('--check')
const outDir = 'api'

/** The kind of a declaration, as one word a reader can scan. */
function kindOf (symbol) {
  const flags = symbol.getFlags()
  const f = ts.SymbolFlags

  if (flags & f.Alias) { return 'alias' }
  if (flags & f.Class) { return 'class' }
  if (flags & f.Interface) { return 'interface' }
  if (flags & f.TypeAlias) { return 'type' }
  if (flags & f.Enum || flags & f.EnumMember) { return 'enum' }
  if (flags & f.Function || flags & f.Method) { return 'function' }
  if (flags & f.Module) { return 'namespace' }
  if (flags & f.Variable || flags & f.Property) { return 'const' }

  return 'unknown'
}

/**
 * Every name a package's entry point exports, sorted, with its kind.
 *
 * `export *` is followed by the checker, so a name reached through three re-exports is reported the
 * same as one written on the entry point itself: which is what a consumer sees.
 */
function exportsOf (entry) {
  const program = ts.createProgram([entry], {
    noResolve: false,
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    skipLibCheck: true,
    allowJs: false
  })

  const checker = program.getTypeChecker()
  const source = program.getSourceFile(entry)

  if (source === undefined) { return undefined }

  const moduleSymbol = checker.getSymbolAtLocation(source)

  if (moduleSymbol === undefined) { return [] }

  return checker
    .getExportsOfModule(moduleSymbol)
    .map((symbol) => {
      // An alias is what `export *` produces; resolving it gives the kind of the thing itself, which
      // is what a consumer can do with the name.
      const target = (symbol.getFlags() & ts.SymbolFlags.Alias) !== 0
        ? checker.getAliasedSymbol(symbol)
        : symbol

      return `${kindOf(target).padEnd(9)} ${symbol.getName()}`
    })
    .sort((a, b) => a.localeCompare(b, 'en'))
}

const packages = readdirSync('.')
  .filter((name) => name.startsWith('stone-js-'))
  .filter((name) => existsSync(join(name, 'dist', 'index.d.ts')))
  .filter((name) => {
    const manifest = JSON.parse(readFileSync(join(name, 'package.json'), 'utf-8'))
    return manifest.private !== true
  })
  .sort()

if (!check) { mkdirSync(outDir, { recursive: true }) }

const drifted = []
const missing = []
let total = 0

for (const pkg of packages) {
  const manifest = JSON.parse(readFileSync(join(pkg, 'package.json'), 'utf-8'))
  const names = exportsOf(join(pkg, 'dist', 'index.d.ts'))

  if (names === undefined) {
    console.error(`✖ ${pkg}: could not read dist/index.d.ts`)
    process.exit(1)
  }

  total += names.length

  const file = join(outDir, `${manifest.name.replace('@stone-js/', '')}.api.txt`)
  const content = `${names.join('\n')}\n`

  if (!check) {
    writeFileSync(file, content)
    continue
  }

  if (!existsSync(file)) { missing.push({ file, pkg }); continue }
  if (readFileSync(file, 'utf-8') !== content) { drifted.push({ file, pkg, content }) }
}

if (!check) {
  console.log(`✔ ${packages.length} packages, ${total} exported names written to ${outDir}/`)
  process.exit(0)
}

if (missing.length === 0 && drifted.length === 0) {
  console.log(`✔ ${packages.length} packages, ${total} exported names, all as committed.`)
  process.exit(0)
}

for (const { file, pkg } of missing) {
  console.error(`✖ ${pkg}: no committed report at ${file}`)
}

for (const { file, pkg, content } of drifted) {
  const committed = readFileSync(file, 'utf-8').split('\n').filter(Boolean)
  const current = content.split('\n').filter(Boolean)
  const added = current.filter((line) => !committed.includes(line))
  const removed = committed.filter((line) => !current.includes(line))

  console.error(`✖ ${pkg}: the public surface changed`)
  for (const line of added) { console.error(`    + ${line}`) }
  for (const line of removed) { console.error(`    - ${line}`) }
}

console.error(
  '\nThe public surface is checked in, so a change to it is a change to review rather than a side\n' +
  'effect of a build. If these additions and removals are intended, run `pnpm run api:report` and\n' +
  'commit the result with them. Removals are breaking: they need a changeset that says so.'
)
process.exit(1)
