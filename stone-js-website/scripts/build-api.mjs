/**
 * Generates the consolidated TypeDoc API reference for every @stone-js/* library
 * package into the built site at `dist/api`, so it ships and deploys alongside
 * the SSG output (never committed). Run after `stone build`, before Pagefind.
 *
 * One TypeDoc run over all packages: shared assets, cross-package links, one nav.
 * Type-checking is skipped (skipErrorChecking) because resolving 28 packages
 * against one program surfaces cross-package noise that does not affect the
 * generated declarations.
 */
import os from 'node:os'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { Application, TSConfigReader } from 'typedoc'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const websiteDir = path.resolve(scriptDir, '..')
const repoRoot = path.resolve(websiteDir, '..')
const outDir = path.join(websiteDir, 'dist', 'api')

// Packages that are apps or tooling, not library surface to document.
const DENY = new Set(['stone-js-website', 'stone-js-docs', 'stone-js-lab', 'stone-js-starters'])

/** Every @stone-js library package with source and a TypeDoc config. */
function libraryPackages () {
  return fs.readdirSync(repoRoot)
    .filter((name) => name.startsWith('stone-js-') && !DENY.has(name))
    .filter((name) => fs.existsSync(path.join(repoRoot, name, 'src')) && fs.existsSync(path.join(repoRoot, name, 'typedoc.json')))
    .sort()
}

async function main () {
  const packages = libraryPackages()
  if (packages.length === 0) { console.error('build-api: no library packages found'); process.exit(1) }
  console.log(`build-api: documenting ${packages.length} packages`)

  const entryPoints = packages.map((name) => path.join(repoRoot, name, 'src'))

  // A throwaway tsconfig covering every package's source, with resolution set
  // for the workspace. Written to the OS temp dir so it never touches the repo.
  const tsconfigPath = path.join(os.tmpdir(), 'stone-api.tsconfig.json')
  fs.writeFileSync(tsconfigPath, JSON.stringify({
    compilerOptions: {
      module: 'ESNext',
      target: 'ESNext',
      moduleResolution: 'bundler',
      strict: false,
      noEmit: true,
      allowJs: true,
      esModuleInterop: true,
      skipLibCheck: true,
      experimentalDecorators: false,
      types: []
    },
    include: packages.flatMap((name) => [
      path.join(repoRoot, name, 'src', '**', '*.ts'),
      path.join(repoRoot, name, 'src', '**', '*.tsx')
    ]),
    exclude: ['**/tests/**', '**/*.spec.ts', '**/*.test.ts', '**/node_modules/**']
  }, null, 2))

  const app = await Application.bootstrapWithPlugins({
    name: 'Stone.js API',
    entryPoints,
    entryPointStrategy: 'expand',
    tsconfig: tsconfigPath,
    out: outDir,
    skipErrorChecking: true,
    excludePrivate: true,
    excludeExternals: true,
    excludeInternal: true,
    disableSources: true,
    readme: 'none',
    hideGenerator: true,
    githubPages: false,
    customCss: path.join(websiteDir, 'assets', 'typedoc-theme.css'),
    navigationLinks: { Docs: '/docs', Home: '/' }
  }, [new TSConfigReader()])

  const project = await app.convert()
  if (project === undefined) { console.error('build-api: TypeDoc conversion failed'); process.exit(1) }

  await app.generateDocs(project, outDir)
  console.log(`build-api: API reference generated at ${path.relative(repoRoot, outDir)}`)
}

main().catch((err) => { console.error(err); process.exit(1) })
