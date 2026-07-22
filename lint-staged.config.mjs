import { existsSync } from 'node:fs'

/**
 * Monorepo lint-staged.
 *
 * ts-standard is project-aware: it must run from a package's own directory so it finds that
 * package's tsconfig. Running it on bare file paths from the repo root fails ("Unable to locate
 * the project file"). So instead of linting individual files, we map the staged files to their
 * workspace package and run that package's own `lint` script in its own cwd.
 *
 * Only pnpm-workspace members are linted; non-member folders (templates, docs, lab) are skipped,
 * and staging root-only files runs nothing (a clean no-op).
 */

// Folders excluded from the pnpm workspace (see pnpm-workspace.yaml).
const NON_WORKSPACE = new Set([
  'stone-js-docs',
  'stone-js-starters',
  'stone-js-blog-starters',
  'stone-js-lab'
])

const lintStagedTasks = (files) => {
  const packages = new Set()
  for (const file of files) {
    const match = file.match(/(?:^|\/)(stone-js-[^/]+)\//)
    if (match === null) continue
    const dir = match[1]
    if (NON_WORKSPACE.has(dir)) continue
    if (existsSync(`${dir}/package.json`)) packages.add(dir)
  }
  return [...packages].map((dir) => `pnpm --filter ./${dir} run lint`)
}

export default lintStagedTasks
