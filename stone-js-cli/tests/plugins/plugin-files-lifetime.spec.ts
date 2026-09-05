import fsExtra from 'fs-extra'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { mkdtempSync, existsSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'

const { removeSync, emptyDirSync } = fsExtra

/**
 * Where a plugin's generated file lives, and how long it lives.
 *
 * This is the defect, on a real directory rather than a mock: a plugin's module used to be written
 * into `.stone/tmp`, and `.stone/tmp` is deleted when a build ends. A development server keeps
 * loading that module for the whole session, so a build finishing next to it produced
 * `ENOENT: no such file or directory, open '.stone/tmp/plugins/i18n.mjs'` from Vite's transform
 * step, in a session that was working a second earlier.
 */
describe('a generated plugin module', () => {
  let root: string

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'stone-plugins-'))
    mkdirSync(join(root, 'tmp'), { recursive: true })
    mkdirSync(join(root, 'plugins'), { recursive: true })
  })

  afterEach(() => { rmSync(root, { recursive: true, force: true }) })

  it('survives the cleanup that ends a build', () => {
    const inPlugins = join(root, 'plugins', 'i18n.mjs')
    const inScratch = join(root, 'tmp', 'plugins', 'i18n.mjs')

    mkdirSync(join(root, 'tmp', 'plugins'), { recursive: true })
    writeFileSync(inPlugins, 'export default {}', 'utf-8')
    writeFileSync(inScratch, 'export default {}', 'utf-8')

    // What `BuildTerminatingMiddleware` does when a build finishes.
    removeSync(join(root, 'tmp'))

    expect(existsSync(inScratch)).toBe(false)
    expect(existsSync(inPlugins)).toBe(true)
  })

  it('is replaced, not accumulated, when a run starts', () => {
    // The other half of the guarantee. The directory outlives a build now, so something has to end
    // what a plugin no longer writes: a module left by a plugin that was uninstalled would otherwise
    // keep being served, and an application would keep booting on it.
    const stale = join(root, 'plugins', 'removed-plugin.mjs')

    writeFileSync(stale, 'export default {}', 'utf-8')

    // What `RunStonePluginsPrepareMiddleware` does before the plugins run.
    emptyDirSync(join(root, 'plugins'))

    expect(existsSync(stale)).toBe(false)
    expect(existsSync(join(root, 'plugins'))).toBe(true)
  })
})
