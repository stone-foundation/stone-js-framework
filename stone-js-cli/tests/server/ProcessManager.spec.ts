import { EventEmitter } from 'node:events'

const spawnMock = vi.fn()

vi.mock('cross-spawn', () => ({ default: (...args: any[]) => spawnMock(...args) }))

/**
 * A controllable fake child process: an EventEmitter with kill()/exitCode/killed,
 * so tests can simulate exits deterministically.
 */
class FakeChild extends EventEmitter {
  exitCode: number | null = null
  killed = false
  kill = vi.fn((_signal?: string) => { this.killed = true; return true })

  simulateExit (code: number | null = 0): void {
    this.exitCode = code
    this.emit('exit', code)
  }
}

describe('ProcessManager', () => {
  let ProcessManager: any

  beforeEach(async () => {
    vi.clearAllMocks()
    ProcessManager = (await import('../../src/server/ProcessManager')).ProcessManager
  })

  it('starts a child with the given command and args', () => {
    const child = new FakeChild()
    spawnMock.mockReturnValue(child)

    const pm = ProcessManager.create({ command: 'node', args: ['server.mjs'] })
    pm.start()

    expect(spawnMock).toHaveBeenCalledWith('node', ['server.mjs'], { stdio: 'inherit' })
    expect(pm.running).toBe(true)
  })

  it('invokes onExit when the child exits on its own', () => {
    const child = new FakeChild()
    spawnMock.mockReturnValue(child)
    const onExit = vi.fn()

    const pm = ProcessManager.create({ command: 'node', args: [], onExit })
    pm.start()
    child.simulateExit(3)

    expect(onExit).toHaveBeenCalledWith(3)
  })

  it('restart waits for the old child to exit before spawning a new one', async () => {
    const first = new FakeChild()
    const second = new FakeChild()
    spawnMock.mockReturnValueOnce(first).mockReturnValueOnce(second)
    const onExit = vi.fn()

    const pm = ProcessManager.create({ command: 'node', args: [], onExit })
    pm.start()

    const restart = pm.restart()
    expect(first.kill).toHaveBeenCalledWith('SIGTERM')
    // Old child has not exited yet → new child not spawned.
    expect(spawnMock).toHaveBeenCalledTimes(1)

    first.simulateExit(0)
    await restart

    expect(spawnMock).toHaveBeenCalledTimes(2)
    // onExit must NOT fire for a managed restart.
    expect(onExit).not.toHaveBeenCalled()
  })

  it('force-kills the child with SIGKILL if it does not exit within the timeout', async () => {
    vi.useFakeTimers()
    const child = new FakeChild()
    spawnMock.mockReturnValue(child)

    const pm = ProcessManager.create({ command: 'node', args: [], killTimeout: 1000 })
    pm.start()

    const stopping = pm.stop()
    expect(child.kill).toHaveBeenCalledWith('SIGTERM')

    await vi.advanceTimersByTimeAsync(1000)
    await stopping

    expect(child.kill).toHaveBeenCalledWith('SIGKILL')
    vi.useRealTimers()
  })

  it('is a no-op once stopped', async () => {
    const child = new FakeChild()
    spawnMock.mockReturnValue(child)

    const pm = ProcessManager.create({ command: 'node', args: [] })
    pm.start()
    child.exitCode = 0 // already exited
    await pm.stop()
    spawnMock.mockClear()

    await pm.restart()
    pm.start()
    expect(spawnMock).not.toHaveBeenCalled()
    expect(pm.running).toBe(false)
  })

  it('tears down the child on SIGINT', async () => {
    const child = new FakeChild()
    spawnMock.mockReturnValue(child)
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(((): never => undefined as never))
    const onceSpy = vi.spyOn(process, 'once')

    const pm = ProcessManager.create({ command: 'node', args: [] })
    pm.start()

    const sigint = onceSpy.mock.calls.find(([sig]) => sig === 'SIGINT')?.[1] as (() => void) | undefined
    expect(sigint).toBeTypeOf('function')
    sigint?.()
    child.simulateExit(0)

    expect(child.kill).toHaveBeenCalled()
    // The handler exits asynchronously (`stop().finally(() => process.exit(0))`); wait for it
    // while the spy is still active, otherwise the real process.exit fires after the test.
    await vi.waitFor(() => { expect(exitSpy).toHaveBeenCalledWith(0) })
    exitSpy.mockRestore()
    onceSpy.mockRestore()
  })
})
