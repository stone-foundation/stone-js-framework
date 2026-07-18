import { ConsoleLogger } from './ConsoleLogger'
import { isFunctionModule, isEmpty } from '../utils'
import { RuntimeError } from '../errors/RuntimeError'
import { IBlueprint, ILogger, LoggerResolver } from '../declarations'

/**
 * Class representing a Logger for the Stone.js framework.
 *
 * Any class that implements the ILogger interface can be used as a logger.
 * The Logger class provides static methods for logging messages at different levels (info, debug, warn, error).
 */
/* eslint-disable-next-line @typescript-eslint/no-extraneous-class */
export class Logger {
  private static logger: ILogger

  /**
   * Initializes the logger instance.
   *
   * @param {IBlueprint} blueprint - The blueprint to initialize the logger with.
   */
  static init (blueprint: IBlueprint): void {
    const resolver = blueprint.get<LoggerResolver>('stone.logger.resolver')

    if (isFunctionModule<LoggerResolver>(resolver)) {
      this.logger = resolver(blueprint)
    } else {
      this.logger = ConsoleLogger.create({ blueprint })
    }
  }

  /**
   * Returns the current logger instance.
   *
   * @returns {ILogger} - The current logger instance.
   */
  static getInstance (): ILogger {
    if (isEmpty(this.logger)) {
      throw new RuntimeError('Logger is not initialized. Call Logger.init(blueprint) before using the logger.')
    }
    return this.logger
  }

  /**
   * Logs informational messages.
   *
   * @param {string} message - The message to log.
   * @param {...unknown[]} optionalParams - Optional parameters to log.
   */
  static info (message: string, ...optionalParams: unknown[]): void {
    this.getInstance().info(message, ...optionalParams)
  }

  /**
   * Logs debug-level messages, used for debugging purposes.
   *
   * @param {string} message - The message to log.
   * @param {...unknown[]} optionalParams - Optional parameters to log.
   */
  static debug (message: string, ...optionalParams: unknown[]): void {
    this.getInstance().debug(message, ...optionalParams)
  }

  /**
   * Logs warnings, used to indicate potential issues.
   *
   * @param {string} message - The warning message to log.
   * @param {...unknown[]} optionalParams - Optional parameters to log.
   */
  static warn (message: string, ...optionalParams: unknown[]): void {
    this.getInstance().warn(message, ...optionalParams)
  }

  /**
   * Logs errors, used to report errors or exceptions.
   *
   * @param {string} message - The error message to log.
   * @param {...unknown[]} optionalParams - Optional parameters to log.
   */
  static error (message: string, ...optionalParams: unknown[]): void {
    this.getInstance().error(message, ...optionalParams)
  }

  /**
   * Logs general messages, similar to `info` but less specific.
   *
   * @param {string} message - The message to log.
   * @param {...unknown[]} optionalParams - Optional parameters to log.
   */
  static log (message: string, ...optionalParams: unknown[]): void {
    this.getInstance().log?.(message, ...optionalParams)
  }
}
