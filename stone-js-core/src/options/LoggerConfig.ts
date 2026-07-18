import { defaultLoggerResolver } from '../resolvers'
import { LoggerResolver, LogLevel } from '../declarations'

/**
 * **LoggerConfig Interface**
 *
 * Represents the base configuration options for an `ILogger` instance.
 * This allows customization of logging behavior, including log level,
 * output styling, and the logger resolver.
 */
export interface LoggerConfig {
  /**
   * The log level for the logger.
   *
   * Defines the minimum level of log messages that should be logged.
   * Common values include:
   * - `'error'`: Errors that need immediate attention
   * - `'warn'`: Warnings
   * - `'info'`: Informational messages
   * - `'debug'`: Debug information
   * - `'trace'`: Fine-grained debug information
   *
   * @default `'error'`
   */
  level?: LogLevel

  /**
   * Whether to enable color output in the logs.
   *
   * Useful for improving log readability, especially in terminal environments
   * or when using third-party loggers such as Pino.
   *
   * @default `false`
   */
  useColors?: boolean

  /**
   * Defines whether to include a timestamp in log messages.
   *
   * Adding timestamps helps in tracking when each log event occurred.
   *
   * @default `false`
   */
  useTimestamp?: boolean

  /**
   * A resolver function that returns a logger instance.
   *
   * Allows you to customize the logger used by the application.
   * This function provides a way to inject a logger that suits specific requirements.
   *
   * @default `defaultLoggerResolver`
   */
  resolver?: LoggerResolver
}

/**
 * **Default Logger Configuration**
 *
 * The `logger` constant provides a default setup for the logger.
 * It includes the following default settings:
 *
 * - **Log Level**: `'error'` — Only logs error messages.
 * - **Color Output**: Disabled — Logs are displayed without color formatting.
 * - **Timestamp**: Disabled — Timestamps are not included in log messages.
 * - **Resolver**: `defaultLoggerResolver` — Uses the default logger resolver function.
 *
 * This default configuration can be overridden by providing a custom `LoggerConfig` object.
 */
export const logger: LoggerConfig = {
  useColors: false,
  useTimestamp: false,
  level: LogLevel.ERROR,
  resolver: defaultLoggerResolver
}
