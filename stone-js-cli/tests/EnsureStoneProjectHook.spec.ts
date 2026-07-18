import fsExtra from 'fs-extra'
import { basePath } from '@stone-js/filesystem'
import { EnsureStoneProjectHook } from '../src/EnsureStoneProjectHook'

vi.mock('fs-extra', () => ({
  default: {
    readJsonSync: vi.fn(),
    pathExistsSync: vi.fn()
  }
}))

vi.mock('@stone-js/filesystem', () => ({
  basePath: vi.fn()
}))

describe('EnsureStoneProjectHook', () => {
  let event: any
  let readJsonSync: any
  let pathExistsSync: any

  beforeEach(() => {
    vi.clearAllMocks()

    event = {
      get: vi.fn()
    }

    readJsonSync = vi.mocked(fsExtra.readJsonSync)
    pathExistsSync = vi.mocked(fsExtra.pathExistsSync)
    vi.mocked(basePath).mockImplementation((file: string) => `/mock/${file}`)
  })

  it('should bypass check for init command by name', async () => {
    event.get.mockImplementation((key: string) => (key === '_task' ? 'init' : undefined))

    await expect(EnsureStoneProjectHook({ event })).resolves.toBeUndefined()
  })

  it('should bypass check for init command by alias', async () => {
    event.get.mockImplementation((key: string) => (key === '_task' ? 'i' : undefined))

    await expect(EnsureStoneProjectHook({ event })).resolves.toBeUndefined()
  })

  it('should bypass check for preview command with filename', async () => {
    event.get.mockImplementation((key: string) => {
      if (key === '_task') return 'preview'
      if (key === 'filename') return 'preview.ts'
      return undefined
    })

    await expect(EnsureStoneProjectHook({ event })).resolves.toBeUndefined()
  })

  it('should bypass check if project has @stone-js/core in dependencies', async () => {
    event.get.mockReturnValue(undefined)
    readJsonSync.mockReturnValue({ dependencies: { '@stone-js/core': '^1.0.0' } })

    await expect(EnsureStoneProjectHook({ event })).resolves.toBeUndefined()
  })

  it('should bypass check if stone.config.js or stone.config.mjs exists', async () => {
    event.get.mockReturnValue(undefined)
    readJsonSync.mockReturnValue({ dependencies: {} })
    pathExistsSync.mockImplementation((filePath: string) => filePath.endsWith('stone.config.js'))

    await expect(EnsureStoneProjectHook({ event })).resolves.toBeUndefined()
  })

  it('should throw CliError when not in a Stone project and task is not exempt', async () => {
    event.get.mockReturnValue(undefined)
    readJsonSync.mockReturnValue({ dependencies: {} })
    pathExistsSync.mockReturnValue(false)

    await expect(EnsureStoneProjectHook({ event })).rejects.toThrowError(
      'This is not a Stone project. Please run this command in a Stone project directory.'
    )
  })
})
