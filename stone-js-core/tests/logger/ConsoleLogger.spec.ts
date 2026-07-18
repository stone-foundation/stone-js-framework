import { IBlueprint } from '../../src/declarations'
import { ConsoleLogger } from '../../src/logger/ConsoleLogger'

// Mock implementation of IBlueprint to simulate behavior for testing
const createMockBlueprint = (loggerOptions: Record<string, unknown> = {}): IBlueprint => {
  return {
    get: (key: string, defaultValue?: unknown) => {
      return loggerOptions[key] ?? defaultValue
    }
  } as any
}

describe('ConsoleLogger', () => {
  it('should log message when the log level is info', () => {
    const blueprint = createMockBlueprint({ 'stone.logger.level': 'info' })
    const logger = ConsoleLogger.create({ blueprint })
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    logger.log?.('Test log message')

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Test log message'))
    consoleSpy.mockRestore()
  })

  it('should log info message when the log level is info', () => {
    const blueprint = createMockBlueprint({ 'stone.logger.level': 'info' })
    const logger = ConsoleLogger.create({ blueprint })
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

    logger.info('Test info message')

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Test info message'))
    consoleSpy.mockRestore()
  })

  it('should log debug message when the log level is debug', () => {
    const blueprint = createMockBlueprint({ 'stone.logger.level': 'debug' })
    const logger = ConsoleLogger.create({ blueprint })
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})

    logger.debug('Test debug message')

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Test debug message'))
    consoleSpy.mockRestore()
  })

  it('should not log debug message when the log level is warn', () => {
    const blueprint = createMockBlueprint({ 'stone.logger.level': 'warn' })
    const logger = ConsoleLogger.create({ blueprint })
    const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {})

    logger.debug('Test debug message')

    expect(consoleSpy).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('should log error message when the log level is error', () => {
    const blueprint = createMockBlueprint({ 'stone.logger.level': 'error' })
    const logger = ConsoleLogger.create({ blueprint })
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    logger.error('Test error message')

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Test error message'))
    consoleSpy.mockRestore()
  })

  it('should log with timestamp if useTimestamp is true', () => {
    const blueprint = createMockBlueprint({ 'stone.logger.level': 'info', 'stone.logger.useTimestamp': true })
    const logger = ConsoleLogger.create({ blueprint })
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

    logger.info('Test message with timestamp')

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(/\[.{0,100}\] Test message with timestamp/))
    consoleSpy.mockRestore()
  })

  it('should log warn message when the log level is warn', () => {
    const blueprint = createMockBlueprint({ 'stone.logger.level': 'warn' })
    const logger = ConsoleLogger.create({ blueprint })
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    logger.warn('Test warn message')

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Test warn message'))
    consoleSpy.mockRestore()
  })

  it('should not log info message if log level is higher than info', () => {
    const blueprint = createMockBlueprint({ 'stone.logger.level': 'error' })
    const logger = ConsoleLogger.create({ blueprint })
    const consoleSpy = vi.spyOn(console, 'info').mockImplementation(() => {})

    logger.info('This should not be logged')

    expect(consoleSpy).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
