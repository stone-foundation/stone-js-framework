/**
 * Audits every lockfile in the repository, not only the root one.
 *
 * The root `pnpm audit` covers the root workspace, and that is not everything the repository ships.
 * A starter with its own lockfile resolves independently: the root's `pnpm.overrides` do not reach
 * it, and neither did the audit. That is how a vulnerable transitive `uuid` sat in a template
 * developers scaffold from, seen by Dependabot and by nothing in CI.
 *
 * So the audit follows the lockfiles rather than the workspace. Every one found is audited, and the
 * first advisory at or above the level fails the run.
 *
 * The level is `moderate`, not `high`, for a measured reason: the `uuid` advisory that reached a
 * published starter is classified **moderate**, so a gate at `high` would never have stopped it
 * wherever it ran. The repository is clean at `low`, so the stricter line costs nothing today and
 * catches the class that got through.
 */
import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'

const root = process.cwd()
const level = process.argv[2] ?? 'moderate'
const skipped = new Set(['node_modules', '.git', 'dist', 'coverage', '.stone'])

/** Every directory holding a `pnpm-lock.yaml`, the root included. */
function lockfileDirs (dir = root, found = []) {
  if (fs.existsSync(path.join(dir, 'pnpm-lock.yaml'))) { found.push(dir) }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory() || skipped.has(entry.name)) { continue }
    lockfileDirs(path.join(dir, entry.name), found)
  }

  return found
}

const dirs = lockfileDirs()
const failed = []

console.log(`audit-lockfiles: ${dirs.length} lockfile(s), level ${level}`)

for (const dir of dirs) {
  const where = path.relative(root, dir) || '.'
  const result = spawnSync('pnpm', ['audit', `--audit-level=${level}`], {
    cwd: dir,
    encoding: 'utf8',
    shell: process.platform === 'win32'
  })

  // A tool that cannot run is not a clean audit. Saying which one, and why, is the difference between
  // a guard and the appearance of one.
  if (result.error !== undefined && result.error !== null) {
    console.error(`  ✖ ${where}: could not run pnpm audit — ${result.error.message}`)
    failed.push(where)
    continue
  }

  if (result.status === 0) {
    console.log(`  ✔ ${where}`)
    continue
  }

  console.error(`  ✖ ${where}`)
  console.error((result.stdout ?? '').trimEnd())
  console.error((result.stderr ?? '').trimEnd())
  failed.push(where)
}

if (failed.length > 0) {
  console.error(
    `\naudit-lockfiles: advisories at or above "${level}" in ${failed.join(', ')}.\n` +
    'Raise the dependency, or pin a patched version through `pnpm.overrides` in that lockfile\'s own ' +
    'package.json: a nested lockfile does not inherit the root\'s overrides.'
  )
  process.exit(1)
}

console.log('audit-lockfiles: no advisories.')
