import { CommandOutput } from '@stone-js/node-cli-adapter'

/**
 * Premium, branded console output for the Stone.js CLI.
 *
 * Centralizes how the CLI presents itself: a signature banner, timestamped steps, a
 * success line with elapsed time, and aligned key/value summaries. The string builders
 * are pure (no color, no I/O) so they are unit-testable; the {@link StoneReporter} class
 * wraps a {@link CommandOutput} and applies color/spinners on top.
 */

/**
 * The Stone.js signature mark: a circle (echoing « Le Portail »), used as the wordmark and step bullet.
 */
export const STONE_MARK = '●'

/**
 * The brand primary accent: the "braise" ember of « Obsidienne & Braise ».
 */
export const STONE_EMBER = '#FF5A1F'

/**
 * The Stone.js logo, "Le Portail": a ring of dots forming a circle. The `top` rows carry the ember
 * accent (the brand's top arc); the `bottom` rows are ink. Split so {@link StoneReporter.banner}
 * can colour each half (the halves are mirror images, so they cannot be told apart by text).
 */
export const STONE_LOGO = {
  top: ['    ●●●●●', '  ●●     ●●'],
  bottom: [' ●●       ●●', '  ●●     ●●', '    ●●●●●']
} as const

/** The version suffix shown after the wordmark (empty for none / 0.0.0). */
function versionSuffix (version: string): string {
  const hasVersion = version.length > 0 && version !== '0.0.0'
  const label = version.startsWith('v') ? version : `v${version}`
  return hasVersion ? `   ${label}` : ''
}

/** The rule under the wordmark, sized to the subtitle. */
function bannerRule (subtitle: string): string {
  return '─'.repeat(Math.max(subtitle.length, 20) + 4)
}

/**
 * Build the signature banner as plain text (no ANSI): the portal logo, the wordmark with version, a
 * rule, and the subtitle. The {@link StoneReporter.banner} method applies the brand colour on top.
 *
 * @param version - The CLI/app version to display.
 * @param subtitle - An optional subtitle line.
 * @returns The multi-line banner string.
 */
export function stoneBanner (version = '', subtitle = 'The continuum framework'): string {
  return [
    '',
    ...STONE_LOGO.top,
    ...STONE_LOGO.bottom,
    '',
    `  ${STONE_MARK} Stone.js${versionSuffix(version)}`,
    `  ${bannerRule(subtitle)}`,
    `  ${subtitle}`,
    ''
  ].join('\n')
}

/**
 * Format an elapsed duration in a human-friendly way.
 *
 * @param ms - Elapsed milliseconds.
 * @returns e.g. `820ms`, `1.24s`, `1m 03s`.
 */
export function formatElapsed (ms: number): string {
  if (ms < 1000) { return `${Math.round(ms)}ms` }
  if (ms < 60000) { return `${(ms / 1000).toFixed(2)}s` }
  const minutes = Math.floor(ms / 60000)
  const seconds = Math.round((ms % 60000) / 1000)
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`
}

/**
 * Render an aligned key/value summary block as plain text.
 *
 * @param rows - Label/value pairs.
 * @returns The multi-line summary string.
 */
export function renderSummary (rows: Array<[string, string]>): string {
  if (rows.length === 0) { return '' }
  const width = Math.max(...rows.map(([label]) => label.length))
  return rows
    .map(([label, value]) => `  ${label.padEnd(width)}  ${value}`)
    .join('\n')
}

/**
 * A branded reporter wrapping a {@link CommandOutput}.
 */
export class StoneReporter {
  private readonly output: CommandOutput
  private readonly version: string

  /**
   * Create a StoneReporter.
   *
   * @param output - The command output to delegate to.
   * @param version - The version shown in the banner.
   * @returns A new StoneReporter.
   */
  static create (output: CommandOutput, version = '0.0.0'): StoneReporter {
    return new this(output, version)
  }

  /**
   * Create a StoneReporter.
   *
   * @param output - The command output to delegate to.
   * @param version - The version shown in the banner.
   */
  constructor (output: CommandOutput, version = '0.0.0') {
    this.output = output
    this.version = version
  }

  /**
   * Print the signature banner.
   *
   * @param subtitle - An optional subtitle.
   */
  banner (subtitle = 'The continuum framework'): this {
    const f = this.output.format

    this.output.show('')
    // The portal: top arcs in the brand ember, lower arcs in ink.
    for (const line of STONE_LOGO.top) { this.output.show(f.hex(STONE_EMBER).bold(line)) }
    for (const line of STONE_LOGO.bottom) { this.output.show(f.whiteBright.bold(line)) }
    this.output.show('')
    // The wordmark: ember mark, bold white wordmark, dim version.
    this.output.show(`  ${f.hex(STONE_EMBER)(STONE_MARK)} ${f.whiteBright.bold('Stone.js')}${f.gray(versionSuffix(this.version))}`)
    this.output.show(f.gray(`  ${bannerRule(subtitle)}`))
    this.output.show(f.gray(`  ${subtitle}`))
    this.output.breakLine(1)

    return this
  }

  /**
   * Print a timestamped step line (`◆ [stone] message`).
   *
   * @param message - The step message.
   */
  step (message: string): this {
    const tag = this.output.format.cyanBright(`${STONE_MARK} [stone]`)
    this.output.show(`${tag} ${message}`)
    return this
  }

  /**
   * Print an informational line.
   *
   * @param message - The message.
   */
  info (message: string): this {
    this.output.info(message)
    return this
  }

  /**
   * Print a warning line.
   *
   * @param message - The message.
   */
  warn (message: string): this {
    this.output.warn(message)
    return this
  }

  /**
   * Print an error line.
   *
   * @param message - The message.
   */
  error (message: string): this {
    this.output.error(message)
    return this
  }

  /**
   * Print a success line, optionally with elapsed time.
   *
   * @param message - The success message.
   * @param elapsedMs - Optional elapsed time in ms.
   */
  success (message: string, elapsedMs?: number): this {
    const suffix = elapsedMs !== undefined ? this.output.format.gray(` (${formatElapsed(elapsedMs)})`) : ''
    this.output.succeed(`${message}${suffix}`)
    return this
  }

  /**
   * Print a dim hint line (secondary guidance, e.g. "press Ctrl+C to stop").
   *
   * @param message - The hint message.
   */
  hint (message: string): this {
    this.output.show(this.output.format.gray(`  ${message}`))
    return this
  }

  /**
   * Print a "file changed" line for a live-reload rebuild (distinct from a first launch).
   *
   * @param file - The path of the file that changed.
   * @param count - Optional change count for the same file (shown as `(x2)`).
   */
  changed (file: string, count = 0): this {
    const tag = this.output.format.magentaBright(`${STONE_MARK} [stone]`)
    const times = count > 1 ? this.output.format.gray(` (x${count})`) : ''
    this.output.show(`${tag} ${this.output.format.whiteBright(file)} ${this.output.format.gray('changed — rebuilding…')}${times}`)
    return this
  }

  /**
   * Print an aligned key/value summary.
   *
   * @param rows - Label/value pairs.
   */
  summary (rows: Array<[string, string]>): this {
    this.output.breakLine(1)
    for (const [label, value] of rows) {
      this.output.show(`  ${this.output.format.gray(label)}  ${this.output.format.whiteBright(value)}`)
    }
    this.output.breakLine(1)
    return this
  }

  /**
   * Start a spinner (delegates to the underlying output).
   *
   * @param message - The spinner message.
   */
  spin (message: string): ReturnType<CommandOutput['spin']> {
    return this.output.spin(message)
  }
}
