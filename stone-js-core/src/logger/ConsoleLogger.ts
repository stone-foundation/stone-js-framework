import { IBlueprint, ILogger, LogLevel } from '../declarations'

/**
 * LoggerOptions.
 *
 * Options for creating a ConsoleLogger instance.
 *
 * @property {IBlueprint} blueprint - The blueprint configuration used by the logger.
 */
export interface LoggerOptions {
  blueprint: IBlueprint
}

/**
 * Console Logger class.
 *
 * This class implements the ILogger interface and uses either the native console object or a custom logging tool.
 *
 * @example
 * ```typescript
 * const logger = ConsoleLogger.create({ blueprint });
 * logger.info('Application started');
 * ```
 */
export class ConsoleLogger implements ILogger {
  private readonly blueprint: IBlueprint

  /**
   * Create a new ConsoleLogger instance.
   *
   * @param {LoggerOptions} options - Options for creating the ConsoleLogger.
   * @returns {ConsoleLogger} - A new instance of ConsoleLogger.
   */
  static create (options: LoggerOptions): ConsoleLogger {
    return new this(options)
  }

  /**
   * Constructs a ConsoleLogger instance.
   *
   * @param {LoggerOptions} options - Options for creating the ConsoleLogger.
   */
  constructor ({ blueprint }: LoggerOptions) {
    this.blueprint = blueprint
  }

  /**
   * Logs informational messages.
   *
   * @param {string} message - The message to log.
   * @param {...unknown[]} optionalParams - Optional parameters to log.
   */
  info (message: string, ...optionalParams: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info(this.formatMessage(message), ...optionalParams)
    }
  }

  /**
   * Logs debug-level messages, used for debugging purposes.
   *
   * @param {string} message - The message to log.
   * @param {...unknown[]} optionalParams - Optional parameters to log.
   */
  debug (message: string, ...optionalParams: unknown[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.debug(this.formatMessage(message), ...optionalParams)
    }
  }

  /**
   * Logs warnings, used to indicate potential issues.
   *
   * @param {string} message - The warning message to log.
   * @param {...unknown[]} optionalParams - Optional parameters to log.
   */
  warn (message: string, ...optionalParams: unknown[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(this.formatMessage(message), ...optionalParams)
    }
  }

  /**
   * Logs errors, used to report errors or exceptions.
   *
   * @param {string} message - The error message to log.
   * @param {...unknown[]} optionalParams - Optional parameters to log.
   */
  error (message: string, ...optionalParams: unknown[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(this.formatMessage(message), ...optionalParams)
    }
  }

  /**
   * Logs general messages, similar to `info` but less specific.
   *
   * @param {string} message - The message to log.
   * @param {...unknown[]} optionalParams - Optional parameters to log.
   */
  log? (message: string, ...optionalParams: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(this.formatMessage(message), ...optionalParams)
    }
  }

  /**
   * Determines if the specified log level should be logged based on the current log level setting.
   *
   * @param {'error' | 'warn' | 'info' | 'debug' | 'trace'} level - The log level to check.
   * @returns {boolean} - True if the specified log level should be logged, otherwise false.
   */
  private shouldLog (level: LogLevel): boolean {
    const debug = this.blueprint.get<boolean>('stone.debug', false)
    const levels = ['trace', 'debug', 'info', 'warn', 'error']
    const appLevel = this.blueprint.get('stone.logger.level', 'info')
    return debug || levels.slice(levels.indexOf(appLevel)).includes(level)
  }

  /**
   * Formats the log message by optionally adding a timestamp.
   *
   * @param {string} message - The message to format.
   * @returns {string} - The formatted message.
   */
  private formatMessage (message: string): string {
    if (this.blueprint.get<boolean>('stone.logger.useTimestamp', false)) {
      return `[${new Date().toISOString()}] ${message}`
    }
    return message
  }
}
