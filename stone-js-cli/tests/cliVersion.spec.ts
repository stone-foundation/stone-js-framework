/**
 * `cliVersion` degrades to an empty string when the manifest cannot be read. Isolated in its own
 * spec because it needs `fs-extra` mocked at import time: `utils.ts` destructures `readJsonSync`
 * at module scope, so a late `vi.spyOn` would never be seen.
 */
vi.mock('fs-extra', () => ({
  default: {
    readJsonSync: vi.fn(() => { throw new Error('unreadable manifest') }),
    pathExistsSync: vi.fn(),
    outputJsonSync: vi.fn(),
    outputFileSync: vi.fn()
  }
}))

const fsExtra = (await import('fs-extra')).default
const { cliVersion } = await import('../src/utils')

describe('utils: cliVersion (degraded manifest)', () => {
  it('returns an empty string instead of breaking the banner when the manifest is unreadable', () => {
    // A missing version must never take the whole CLI down: the banner simply omits the slot.
    expect(cliVersion()).toBe('')
  })

  it('returns an empty string when the manifest declares no version', () => {
    vi.mocked(fsExtra.readJsonSync).mockReturnValueOnce({})
    expect(cliVersion()).toBe('')
  })
})
