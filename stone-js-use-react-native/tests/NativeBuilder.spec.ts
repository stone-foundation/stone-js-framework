import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { NativeBuilder } from '../src/cli/NativeBuilder'

const spawnMock = vi.fn()

vi.mock('cross-spawn', () => ({ default: (...args: unknown[]) => spawnMock(...args) }))

/**
 * What the builder owes: the manifest written, and the right Expo command asked for. Whether
 * Expo then works is Expo's business, and running it here would test their tool with ours.
 */
const child = (exitCode: number | null = 0): any => ({
  on (event: string, listener: (code: number | null) => void) {
    if (event === 'exit') { setImmediate(() => listener(exitCode)) }
    return this
  }
})

const makeContext = (root: string): any => ({
  blueprint: { get: vi.fn((_key: string, fallback?: unknown) => fallback) },
  commandOutput: { info: vi.fn() },
  commandInput: {}
})

const makeEvent = (payload: Record<string, unknown> = {}): any => ({
  get: vi.fn((key: string) => payload[key])
})

describe('NativeBuilder', () => {
  let root: string
  let cwd: string

  beforeEach(() => {
    vi.clearAllMocks()
    root = mkdtempSync(join(tmpdir(), 'stone-native-builder-'))
    writeFileSync(join(root, 'app.json'), '{}', 'utf-8')
    cwd = process.cwd()
    process.chdir(root)
    spawnMock.mockReturnValue(child(0))
  })

  afterEach(() => {
    process.chdir(cwd)
    rmSync(root, { recursive: true, force: true })
  })

  it('collects the modules, then asks Expo to start', async () => {
    await new NativeBuilder(makeContext(root)).dev(makeEvent())

    expect(existsSync(join(root, '.stone', 'modules.ts'))).toBe(true)
    expect(spawnMock).toHaveBeenCalledWith('npx', ['expo', 'start'], { stdio: 'inherit' })
  })

  it('collects the modules, then asks Expo to export', async () => {
    await new NativeBuilder(makeContext(root)).build(makeEvent())

    expect(existsSync(join(root, '.stone', 'modules.ts'))).toBe(true)
    expect(spawnMock).toHaveBeenCalledWith('npx', ['expo', 'export'], { stdio: 'inherit' })
  })

  it('passes a platform through when one was named', async () => {
    await new NativeBuilder(makeContext(root)).build(makeEvent({ platform: 'ios' }))

    expect(spawnMock).toHaveBeenCalledWith('npx', ['expo', 'export', '--platform', 'ios'], { stdio: 'inherit' })
  })

  it('leaves the platform to Expo when none was named', async () => {
    await new NativeBuilder(makeContext(root)).dev(makeEvent())

    expect(spawnMock).toHaveBeenCalledWith('npx', ['expo', 'start'], { stdio: 'inherit' })
  })

  it('says how many modules it collected', async () => {
    const context = makeContext(root)

    await new NativeBuilder(context).dev(makeEvent())

    expect(context.commandOutput.info).toHaveBeenCalledWith(expect.stringContaining('0 modules collected'))
  })

  it('fails when Expo fails, with its exit code named', async () => {
    spawnMock.mockReturnValue(child(1))

    await expect(new NativeBuilder(makeContext(root)).build(makeEvent()))
      .rejects.toThrow(/expo export exited with code 1/)
  })

  it('treats a signal-terminated Expo as a clean stop', async () => {
    // Ctrl+C on a dev server: the child exits with no code, and that is not a failure.
    spawnMock.mockReturnValue(child(null))

    await expect(new NativeBuilder(makeContext(root)).dev(makeEvent())).resolves.toBeUndefined()
  })

  it('surfaces a spawn failure, such as npx missing', async () => {
    spawnMock.mockReturnValue({
      on (event: string, listener: (error: Error) => void) {
        if (event === 'error') { setImmediate(() => listener(new Error('npx not found'))) }
        return this
      }
    })

    await expect(new NativeBuilder(makeContext(root)).dev(makeEvent())).rejects.toThrow('npx not found')
  })

  it('counts one module in the singular', async () => {
    mkdirSync(join(root, 'app'), { recursive: true })
    writeFileSync(join(root, 'app', 'Application.ts'), 'export const x = 1\n', 'utf-8')
    const context = makeContext(root)

    await new NativeBuilder(context).dev(makeEvent())

    expect(context.commandOutput.info).toHaveBeenCalledWith(expect.stringContaining('1 module collected'))
  })
})
