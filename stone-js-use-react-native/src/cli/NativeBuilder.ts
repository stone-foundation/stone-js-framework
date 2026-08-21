import spawn from 'cross-spawn'
import { writeManifest } from '../build/writeManifest'
import type { ConsoleContext, StoneBuilder } from '@stone-js/cli'
import type { IncomingEvent } from '@stone-js/core'

/**
 * Builds a native application, by asking Expo to.
 *
 * Deliberately thin. Expo and Metro own native bundling: they know about Hermes, about the
 * per-platform resolution, about the native projects and about the dev client, and there is
 * nothing to gain from a second opinion on any of it. What this adds is the one thing Expo
 * cannot do, which is collecting your application's modules, and a single vocabulary:
 * `stone dev native` alongside `stone dev`, so nobody has to remember which tool owns which
 * platform.
 *
 * Anything Expo does better is left to Expo, and left visible: the commands below run in the
 * foreground with their output untouched.
 */
export class NativeBuilder implements StoneBuilder {
  /**
   * Create the builder.
   *
   * @param context - The console context.
   */
  constructor (private readonly context: ConsoleContext) {}

  /**
   * Start the development server.
   *
   * @param event - The incoming event.
   */
  async dev (event: IncomingEvent): Promise<void> {
    this.generate()

    await this.expo(['start', ...this.platformArgs(event)])
  }

  /**
   * Export the JavaScript bundle.
   *
   * This is what a native build means without leaving Node: the bundle Metro produces, for every
   * platform asked for. Producing an installable application is `expo run:ios`, `expo run:android`
   * or an EAS build, which need a native toolchain, and wrapping them would only put a thinner
   * command in front of a better one.
   *
   * @param event - The incoming event.
   */
  async build (event: IncomingEvent): Promise<void> {
    this.generate()

    await this.expo(['export', ...this.platformArgs(event)])
  }

  /**
   * Collect the application's modules.
   *
   * Also done from `metro.config.js`, which is what makes `expo start` work on its own. Done here
   * too because a command should not depend on the user having wired that file, and writing an
   * identical manifest twice costs nothing: it is only written when it changed.
   */
  private generate (): void {
    const result = writeManifest(process.cwd(), {
      appDir: this.context.blueprint.get<string>('stone.builder.input.app', 'app')
    })

    this.context.commandOutput.info(
      `${result.count} module${result.count === 1 ? '' : 's'} collected into ${result.path}`
    )
  }

  /**
   * The platforms the command was asked for.
   *
   * @param event - The incoming event.
   * @returns The Expo flags, or nothing to let Expo decide.
   */
  private platformArgs (event: IncomingEvent): string[] {
    const platform = event.get<string>('platform')

    return platform === undefined ? [] : ['--platform', platform]
  }

  /**
   * Run an Expo command in the foreground.
   *
   * Its output is not captured and its exit code is this command's: a dev server that prints a QR
   * code, and a build that fails, both have to reach the developer unchanged.
   *
   * @param args - The Expo arguments.
   */
  private async expo (args: string[]): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      const child = spawn('npx', ['expo', ...args], { stdio: 'inherit' })

      child.on('error', reject)
      child.on('exit', (code) => {
        code === null || code === 0 ? resolve() : reject(new Error(`expo ${args[0]} exited with code ${String(code)}`))
      })
    })
  }
}
