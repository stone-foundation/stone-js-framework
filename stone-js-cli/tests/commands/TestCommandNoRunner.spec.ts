import { TestCommand } from '../../src/commands/TestCommand'

// A project that never installed Vitest: the command has to say what to do, not fail obscurely on a
// module resolution error. Mocked in its own file, since the mock has to fail at import time.
vi.mock('vitest/node', () => { throw new Error("Cannot find package 'vitest'") })
vi.mock('../../src/utils', async (mod) => ({
  ...(await mod<any>()),
  getEnvVariables: vi.fn(),
  isReactApp: () => false
}))

describe('TestCommand without a runner', () => {
  it('tells the user how to install it, and fails', async () => {
    const context: any = {
      blueprint: { get: (_k: string, fallback: any) => fallback },
      commandOutput: { info: vi.fn() }
    }

    await expect(new TestCommand(context).handle({ get: (_k: string, f: any) => f } as any))
      .rejects.toThrow(/npm i -D vitest/)
  })
})
