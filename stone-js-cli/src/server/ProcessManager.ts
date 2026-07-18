import spawn from 'cross-spawn'
import { ChildProcess } from 'node:child_process'

/**
 * Options for a {@link ProcessManager}.
 */
export interface ProcessManagerOptions {
  /** The command to run (e.g. `'node'`). */
  command: string
  /** The command arguments. */
  args: string[]
  /** Milliseconds to wait for a graceful exit before force-killing. Default 5000. */
  killTimeout?: number
  /** Called when the supervised child exits on its own (not during a managed restart/stop). */
  onExit?: (code: number | null) => void
}

/**
 * Supervises a single long-running child process for the dev server.
 *
 * A naive `kill(); spawn()` restart races on the listening port (the old process has not yet
 * released it → intermittent `EADDRINUSE`). This manager makes restarts deterministic: it
 * sends `SIGTERM`, **waits for the child's `exit` event** (force-killing with `SIGKILL` after a
 * timeout), and only then spawns the replacement. It also owns a single set of `SIGINT`/
 * `SIGTERM` handlers so `Ctrl+C` always tears the child down instead of leaving an orphan.
 */
export class ProcessManager {
  private child?: ChildProcess
  private restarting = false
  private stopped = false
  private signalsBound = false

  /**
   * Create a ProcessManager.
   *
   * @param options - The supervisor options.
   * @returns A new ProcessManager.
   */
  static create (options: ProcessManagerOptions): ProcessManager {
    return new this(options)
  }

  /**
   * Create a ProcessManager.
   *
   * @param options - The supervisor options.
   */
  constructor (private readonly options: ProcessManagerOptions) {}

  /**
   * Whether a child is currently running.
   */
  get running (): boolean {
    return this.child !== undefined && this.child.exitCode === null && !this.child.killed
  }

  /**
   * Start the child process (first launch). No-op once stopped.
   */
  start (): void {
    if (this.stopped) { return }
    this.bindSignals()
    this.child = spawn(this.options.command, this.options.args, { stdio: 'inherit' })
    this.child.on('exit', (code) => {
      if (!this.restarting && !this.stopped) { this.options.onExit?.(code) }
    })
  }

  /**
   * Restart the child: terminate the current one, wait for it to actually exit (so the port is
   * released), then spawn a fresh one. No-op once stopped.
   */
  async restart (): Promise<void> {
    if (this.stopped) { return }
    await this.terminateChild()
    this.start()
  }

  /**
   * Stop the supervisor permanently and terminate the child.
   */
  async stop (): Promise<void> {
    this.stopped = true
    await this.terminateChild()
  }

  /**
   * Terminate the current child and resolve once it has exited (or been force-killed).
   */
  private async terminateChild (): Promise<void> {
    const child = this.child
    this.child = undefined

    if (child === undefined || child.exitCode !== null || child.killed) { return }

    this.restarting = true
    await new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        child.kill('SIGKILL')
        resolve()
      }, this.options.killTimeout ?? 5000)

      child.once('exit', () => {
        clearTimeout(timer)
        resolve()
      })

      child.kill('SIGTERM')
    })
    this.restarting = false
  }

  /**
   * Bind SIGINT/SIGTERM once so the child is always cleaned up on shutdown.
   */
  private bindSignals (): void {
    if (this.signalsBound) { return }
    this.signalsBound = true

    const shutdown = (): void => {
      void this.stop().finally(() => process.exit(0))
    }

    process.once('SIGINT', shutdown)
    process.once('SIGTERM', shutdown)
  }
}
