import fsExtra from 'fs-extra'
import { buildPath } from '@stone-js/filesystem'
import { CacheCommand, cacheCommandOptions } from '../../src/commands/CacheCommand'

const { emptyDirSync } = fsExtra

vi.mock('fs-extra', () => ({
  default: {
    emptyDirSync: vi.fn()
  }
}))

vi.mock('@stone-js/filesystem', async (mod) => {
  const actual: any = await mod()
  return {
    ...actual,
    buildPath: vi.fn()
  }
})

describe('CacheCommand', () => {
  let context: any

  beforeEach(() => {
    vi.clearAllMocks()

    context = {
      commandOutput: {
        info: vi.fn()
      }
    }

    // Mock buildPath result
    vi.mocked(buildPath).mockReturnValue('/fake/cache/path')
  })

  it('should call emptyDirSync with the correct path and log output', () => {
    const command = new CacheCommand(context)
    command.handle()

    expect(buildPath).toHaveBeenCalled()
    expect(emptyDirSync).toHaveBeenCalledWith('/fake/cache/path')
    expect(context.commandOutput.info).toHaveBeenCalledWith('Cache cleared!')
  })
})

describe('cacheCommandOptions', () => {
  it('should define correct CLI metadata', () => {
    expect(cacheCommandOptions).toEqual({
      name: 'cache-clear',
      alias: 'cc',
      desc: 'Clear app cache'
    })
  })
})
