import fsExtra from 'fs-extra'
import simpleGit from 'simple-git'
import { execFileSync } from 'node:child_process'
import { CliError } from '../../src/errors/CliError'
import {
  fetchStarter,
  parseStarterLink,
  collectStarters,
  readStarterEntries,
  materializeStarter,
  autodetectStarters,
  DEFAULT_STARTER_LINK,
  getAvailableStarters,
  resolveStarterLinks
} from '../../src/create/StarterContract'

vi.mock('fs-extra', () => ({
  default: { existsSync: vi.fn(), removeSync: vi.fn(), copySync: vi.fn(), readJsonSync: vi.fn() }
}))
vi.mock('simple-git', () => ({ default: vi.fn(() => ({ clone: vi.fn() })) }))
vi.mock('node:child_process', () => ({ execFileSync: vi.fn() }))
vi.mock('@stone-js/filesystem', () => ({ tmpPath: (...a: string[]) => `/tmp/${a.join('/')}` }))

const output = { info: vi.fn() }
const ctx = { cwd: '/proj', output }

const makeBlueprint = (store: Record<string, any> = {}): any => ({
  get: vi.fn((key: string, fallback?: any) => (key in store ? store[key] : fallback)),
  set: vi.fn((key: string, value: any) => { store[key] = value })
})

beforeEach(() => { vi.clearAllMocks() })

describe('resolveStarterLinks', () => {
  it('defaults to the built-in link', () => {
    expect(resolveStarterLinks(makeBlueprint())).toEqual([DEFAULT_STARTER_LINK])
  })
  it('is undefined-safe', () => {
    expect(resolveStarterLinks({ get: () => undefined } as any)).toEqual([DEFAULT_STARTER_LINK])
  })
  it('returns configured links', () => {
    expect(resolveStarterLinks(makeBlueprint({ 'stone.createApp.starters': ['a', 'b'] }))).toEqual(['a', 'b'])
  })
})

describe('parseStarterLink', () => {
  it('parses github shorthand with ref', () => {
    expect(parseStarterLink('github:o/r#next')).toEqual({ kind: 'git', target: 'https://github.com/o/r.git', ref: 'next' })
  })
  it('parses git urls', () => {
    expect(parseStarterLink('https://x/y.git')).toEqual({ kind: 'git', target: 'https://x/y.git' })
    expect(parseStarterLink('git@x:y.git')).toMatchObject({ kind: 'git' })
    expect(parseStarterLink('git+https://x/y')).toEqual({ kind: 'git', target: 'https://x/y' })
  })
  it('parses npm links and bare packages', () => {
    expect(parseStarterLink('npm:@acme/s')).toEqual({ kind: 'npm', target: '@acme/s' })
    expect(parseStarterLink('@acme/s')).toEqual({ kind: 'npm', target: '@acme/s' })
  })
  it('parses local paths', () => {
    expect(parseStarterLink('./x')).toEqual({ kind: 'local', target: './x' })
    expect(parseStarterLink('/abs/x')).toEqual({ kind: 'local', target: '/abs/x' })
  })
})

describe('readStarterEntries', () => {
  it('reads declared entries', () => {
    const entries = readStarterEntries({ name: 'p', stone: { starters: [{ value: 'api', path: 'api' }] } })
    expect(entries).toEqual([{ value: 'api', path: 'api' }])
  })
  it('falls back to a single whole-package entry', () => {
    expect(readStarterEntries({ name: 'solo' })).toEqual([{ value: 'solo', title: 'solo', path: '.' }])
  })

  it('falls back to "default" when the package has no name', () => {
    expect(readStarterEntries({})).toEqual([{ value: 'default', title: 'default', path: '.' }])
  })
})

describe('fetchStarter', () => {
  it('fetches a local starter', async () => {
    vi.mocked(fsExtra.existsSync).mockReturnValue(true)
    vi.mocked(fsExtra.readJsonSync).mockReturnValue({ name: 'local-starter' })
    const res = await fetchStarter('./s', ctx)
    expect(res.packageJson).toEqual({ name: 'local-starter' })
  })

  it('fetches a git starter (clone + read package.json)', async () => {
    vi.mocked(fsExtra.existsSync).mockReturnValue(true)
    const clone = vi.fn()
    ;(simpleGit as any).mockReturnValue({ clone })
    vi.mocked(fsExtra.readJsonSync).mockReturnValue({ name: '@stone-js/starters' })

    const res = await fetchStarter('github:o/r#main', ctx)

    expect(clone).toHaveBeenCalledWith('https://github.com/o/r.git', expect.any(String), ['--depth', '1', '--branch', 'main'])
    expect(res.packageJson.name).toBe('@stone-js/starters')
  })

  it('clones a git starter without a ref (shallow, default branch)', async () => {
    vi.mocked(fsExtra.existsSync).mockReturnValue(true)
    const clone = vi.fn()
    ;(simpleGit as any).mockReturnValue({ clone })
    vi.mocked(fsExtra.readJsonSync).mockReturnValue({ name: 'p' })

    await fetchStarter('https://x/y.git', ctx)

    expect(clone).toHaveBeenCalledWith('https://x/y.git', expect.any(String), ['--depth', '1'])
  })

  it('installs an npm starter and resolves its dir', async () => {
    vi.mocked(fsExtra.existsSync).mockReturnValue(true)
    vi.mocked(fsExtra.readJsonSync).mockReturnValue({ name: '@acme/s' })

    const res = await fetchStarter('@acme/s@1.2.0', ctx)

    expect(execFileSync).toHaveBeenCalledWith('npm', expect.arrayContaining(['install', '@acme/s@1.2.0', '--prefix']), expect.any(Object))
    expect(res.dir).toContain('node_modules/@acme/s')
  })

  it('resolves a bare npm package name (no version)', async () => {
    vi.mocked(fsExtra.existsSync).mockReturnValue(true)
    vi.mocked(fsExtra.readJsonSync).mockReturnValue({ name: 'plain' })

    const res = await fetchStarter('plain', ctx)

    expect(res.dir).toContain('node_modules/plain')
  })

  it('throws when a starter has no package.json', async () => {
    vi.mocked(fsExtra.existsSync).mockReturnValue(false)
    await expect(fetchStarter('./missing', ctx)).rejects.toThrow(CliError)
  })
})

describe('collectStarters', () => {
  it('expands each link into its declared entries', async () => {
    vi.mocked(fsExtra.existsSync).mockReturnValue(true)
    vi.mocked(fsExtra.readJsonSync).mockReturnValue({ name: 'p', stone: { starters: [{ value: 'a' }, { value: 'b' }] } })
    const res = await collectStarters(['./x'], ctx)
    expect(res.map(s => s.value)).toEqual(['a', 'b'])
    expect(res[0].provider).toBe('p')
  })

  it('uses the link as provider when the package has no name', async () => {
    vi.mocked(fsExtra.existsSync).mockReturnValue(true)
    vi.mocked(fsExtra.readJsonSync).mockReturnValue({ stone: { starters: [{ value: 'a' }] } })
    const res = await collectStarters(['./x'], ctx)
    expect(res[0].provider).toBe('./x')
  })
})

describe('autodetectStarters', () => {
  it('detects installed packages declaring stone.starters', () => {
    vi.mocked(fsExtra.existsSync).mockReturnValue(true)
    vi.mocked(fsExtra.readJsonSync).mockImplementation((file: string) => {
      if (file === '/proj/package.json') return { dependencies: { '@acme/s': '^1' }, devDependencies: { other: '^1' } }
      if (file === '/proj/node_modules/@acme/s/package.json') return { name: '@acme/s', stone: { starters: [{ value: 'x' }] } }
      return { name: 'other' } // no stone.starters -> skipped
    })
    const res = autodetectStarters('/proj')
    expect(res.map(s => s.value)).toEqual(['x'])
    expect(res[0].provider).toBe('@acme/s')
  })

  it('returns empty when the project has no package.json', () => {
    vi.mocked(fsExtra.existsSync).mockReturnValue(false)
    expect(autodetectStarters('/proj')).toEqual([])
  })
})

describe('materializeStarter', () => {
  it('copies the resolved starter path', () => {
    vi.mocked(fsExtra.existsSync).mockReturnValue(true)
    materializeStarter({ value: 'a', provider: 'p', dir: '/d', path: 'sub' }, '/dest')
    expect(fsExtra.copySync).toHaveBeenCalledWith('/d/sub', '/dest')
  })
  it('throws when the source path is missing', () => {
    vi.mocked(fsExtra.existsSync).mockReturnValue(false)
    expect(() => materializeStarter({ value: 'a', provider: 'p', dir: '/d' }, '/dest')).toThrow(CliError)
  })
})

describe('getAvailableStarters', () => {
  it('collects, merges auto-detected, and memoises on the blueprint', async () => {
    vi.mocked(fsExtra.existsSync).mockReturnValue(true)
    vi.mocked(fsExtra.readJsonSync).mockReturnValue({ name: 'p', stone: { starters: [{ value: 'a' }] } })
    const blueprint = makeBlueprint({ 'stone.createApp.starters': ['./x'] })

    const first = await getAvailableStarters(blueprint, ctx)
    expect(first.length).toBeGreaterThanOrEqual(1)
    expect(blueprint.set).toHaveBeenCalledWith('stone.createApp.available', expect.any(Array))

    // Second call returns the cached value without re-reading.
    vi.mocked(fsExtra.readJsonSync).mockClear()
    const second = await getAvailableStarters(blueprint, ctx)
    expect(second).toBe(first)
    expect(fsExtra.readJsonSync).not.toHaveBeenCalled()
  })
})
