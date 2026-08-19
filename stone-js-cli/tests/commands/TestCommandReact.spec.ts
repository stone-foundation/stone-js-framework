import { EventEmitter } from 'node:events'
import { TestCommand } from '../../src/commands/TestCommand'

const outputFileSync = vi.fn()

vi.mock('cross-spawn', () => ({
  default: () => {
    const child: any = new EventEmitter()
    queueMicrotask(() => child.emit('close', 0))
    return child
  }
}))
vi.mock('fs-extra', () => ({
  default: { outputFileSync: (...args: any[]) => outputFileSync(...args), pathExistsSync: () => true }
}))
// A React project, mocked in its own file because `vi.mock` is hoisted per file.
vi.mock('../../src/utils', async (mod) => ({
  ...(await mod<any>()),
  getEnvVariables: vi.fn(),
  isReactApp: () => true,
  setupProcessSignalHandlers: vi.fn()
}))

describe('TestCommand for a React project', () => {
  it('accounts for .tsx in coverage, because that is where the pages are', async () => {
    const context: any = {
      blueprint: { get: (_k: string, fallback: any) => fallback ?? {} },
      commandOutput: { info: vi.fn() }
    }

    await new TestCommand(context).handle({ get: (_k: string, f: any) => f } as any)

    expect(outputFileSync.mock.calls[0][1]).toContain('app/**/*.tsx')
  })
})
