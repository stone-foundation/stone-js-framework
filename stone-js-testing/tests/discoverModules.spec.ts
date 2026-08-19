import { APP_MODULES_PATTERN_ENV, discoverAppModules } from '../src/discoverModules'

/**
 * Discovery is what a hand-written module list keeps getting wrong, so these tests use real files on
 * disk rather than a mocked scan: the thing under test is precisely whether the right files are found
 * and imported.
 */
describe('discoverAppModules', () => {
  it('finds every module the app exports, at any depth', async () => {
    const modules = await discoverAppModules({ pattern: 'tests/fixtures/app/**/*.{js,ts}' })

    // One export from the top-level file, two from the nested one: an app boots every exported
    // value, exactly as the built bundle does.
    expect(modules).toHaveLength(3)
    expect(modules).toEqual(expect.arrayContaining([
      expect.objectContaining({ stone: expect.objectContaining({ name: 'DiscoveredApp' }) }),
      { stone: { first: true } },
      { stone: { second: true } }
    ]))
  })

  it('is deterministic, so a suite cannot pass locally and fail in CI on ordering', async () => {
    const first = await discoverAppModules({ pattern: 'tests/fixtures/app/**/*.js' })
    const second = await discoverAppModules({ pattern: 'tests/fixtures/app/**/*.js' })

    expect(JSON.stringify(first)).toBe(JSON.stringify(second))
  })

  it('ignores files that are not source', async () => {
    // `notAModule.txt` sits in the same directory; importing it would throw.
    await expect(discoverAppModules({ pattern: 'tests/fixtures/app/**/*.js' })).resolves.toHaveLength(3)
  })

  it('finds nothing, quietly, when there is nothing to find', async () => {
    // A project whose app directory does not exist yet must not fail to boot: it has no modules.
    await expect(discoverAppModules({ appDir: 'tests/fixtures/does-not-exist' })).resolves.toEqual([])
  })

  it('derives its pattern from appDir', async () => {
    // `appDir` is the option a non-standard layout reaches for, so it has to actually scan there.
    const modules = await discoverAppModules({ appDir: 'tests/fixtures/app' })

    expect(modules).toHaveLength(3)
  })
})

describe('discoverAppModules, driven by the CLI', () => {
  const saved = process.env[APP_MODULES_PATTERN_ENV]

  afterEach(() => {
    if (saved === undefined) { delete process.env[APP_MODULES_PATTERN_ENV] } else { process.env[APP_MODULES_PATTERN_ENV] = saved }
  })

  it('scans what `stone test` resolved from stone.config.mjs', async () => {
    // One config file: the CLI resolves the app's files and hands them to the test process, so a
    // suite run through `stone test` cannot boot a different application than the one that ships.
    process.env[APP_MODULES_PATTERN_ENV] = 'tests/fixtures/app/**/*.js'

    await expect(discoverAppModules()).resolves.toHaveLength(3)
  })

  it('lets an explicit option win over the ambient variable', async () => {
    // A test that names its own directory means it.
    process.env[APP_MODULES_PATTERN_ENV] = 'tests/fixtures/app/**/*.js'

    await expect(discoverAppModules({ appDir: 'tests/fixtures/does-not-exist' })).resolves.toEqual([])
  })
})
