import chalk from 'chalk'
import ora, { Ora } from 'ora'
import ProgressBar from 'progress'

/**
 * CommandOutputOptions
 */
export interface CommandOutputOptions {
  stdConsole: Console
  format: typeof chalk
  smartConsole: typeof ora
}

/**
 * Class representing a CommandOutput Facade.
 * Provides utility methods for logging, colored outputs, spinners, and progress bars.
 */
export class CommandOutput {
  /**
   * A formatting library (e.g., `chalk`).
   */
  public readonly format: typeof chalk

  /**
   * A console object for standard output (e.g., global console).
   */
  private readonly stdConsole: Console

  /**
   * A smart console utility (e.g., `ora` spinner).
   */
  private readonly smartConsole: typeof ora

  /**
   * Create a CommandOutput instance.
   *
   * @param options - The options for creating the CommandOutput instance.
   */
  static create (options: CommandOutputOptions): CommandOutput {
    return new this(options)
  }

  /**
   * Create a CommandOutput instance.
   *
   * @param stdConsole - The console object (e.g., global console).
   * @param smartConsole - A smart console utility (e.g., `ora` spinner).
   * @param format - A formatting library (e.g., `chalk`).
   */
  private constructor ({ stdConsole, smartConsole, format }: CommandOutputOptions) {
    this.format = format
    this.stdConsole = stdConsole
    this.smartConsole = smartConsole
  }

  /**
   * Output uncolored text.
   *
   * @param value - The text to display.
   * @returns The current instance for chaining.
   */
  show (value: string): this {
    this.stdConsole.log(value)
    return this
  }

  /**
   * Output a table.
   *
   * @param value - The value to display as a table.
   * @returns The current instance for chaining.
   */
  table (value: unknown, properties?: readonly string[]): this {
    this.stdConsole.table(value, properties)
    return this
  }

  /**
   * Output a line break.
   *
   * @param value - The number of newlines to add.
   * @returns The current instance for chaining.
   */
  breakLine (value: number): this {
    this.stdConsole.log(Array(value).join('\n'))
    return this
  }

  /**
   * Output info-colored text.
   *
   * @param value - The text to display.
   * @param color - Whether to color the text. Defaults to true.
   * @returns The current instance for chaining.
   */
  info (value: string, color: boolean = true): this {
    this.smartConsole(color ? this.format.blueBright(value) : value).info()
    return this
  }

  /**
   * Output error-colored text.
   *
   * @param value - The text to display.
   * @param color - Whether to color the text. Defaults to true.
   * @returns The current instance for chaining.
   */
  error (value: string, color: boolean = true): this {
    this.smartConsole(color ? this.format.redBright(value) : value).fail()
    return this
  }

  /**
   * Output warn-colored text.
   *
   * @param value - The text to display.
   * @param color - Whether to color the text. Defaults to true.
   * @returns The current instance for chaining.
   */
  warn (value: string, color: boolean = true): this {
    this.smartConsole(color ? this.format.yellowBright(value) : value).warn()
    return this
  }

  /**
   * Output success-colored text.
   *
   * @param value - The text to display.
   * @param color - Whether to color the text. Defaults to true.
   * @returns The current instance for chaining.
   */
  succeed (value: string, color: boolean = true): this {
    this.smartConsole(color ? this.format.greenBright(value) : value).succeed()
    return this
  }

  /**
   * Output a spinner.
   *
   * @param value - The spinner's initial message. Defaults to null.
   * @returns The spinner instance started.
   */
  spin (value: string): Ora {
    return this.spinner(value).start()
  }

  /**
   * Creates a spinner instance.
   *
   * @param value - The spinner's initial message. Defaults to null.
   * @returns The spinner instance.
   */
  spinner (value: string): Ora {
    return this.smartConsole(value)
  }

  /**
   * Create a progress bar.
   *
   * @param tokens - The template string for the progress bar.
   * @param options - Configuration options for the progress bar.
   * @returns A new ProgressBar instance.
   */
  progressBar (tokens: string, options: ProgressBar.ProgressBarOptions): ProgressBar {
    return new ProgressBar(tokens, options)
  }
}
