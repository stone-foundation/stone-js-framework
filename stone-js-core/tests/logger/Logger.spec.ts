import { Logger } from '../../src/logger/Logger'
import { RuntimeError } from '../../src/errors/RuntimeError'
import { ConsoleLogger } from '../../src/logger/ConsoleLogger'

describe('Logger', () => {
  beforeEach(() => {
    // @ts-expect-error: force reset internal static logger
    Logger.logger = undefined
  })

  it('should throw if getInstance is called before init', () => {
    expect(() => Logger.getInstance()).toThrow(RuntimeError)
  })

  it('should use ConsoleLogger if no resolver is provided', () => {
    const createSpy = vi.spyOn(ConsoleLogger, 'create')

    const blueprint = {
      get: vi.fn().mockReturnValue(undefined)
    }

    Logger.init(blueprint as any)
    const logger = Logger.getInstance()

    expect(createSpy).toHaveBeenCalled()
    expect(logger).toBeDefined()
    expect(typeof logger.info).toBe('function')
  })

  it('should use custom resolver if provided', () => {
    const mockLogger = {
      info: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      log: vi.fn()
    }

    const resolver = vi.fn().mockReturnValue(mockLogger)

    const blueprint = {
      get: vi.fn().mockReturnValue(resolver)
    }

    Logger.init(blueprint as any)

    expect(Logger.getInstance()).toBe(mockLogger)
    expect(resolver).toHaveBeenCalledWith(blueprint)
  })

  it('should delegate logging methods to logger instance', () => {
    const mockLogger = {
      info: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      log: vi.fn()
    }

    // @ts-expect-error: force inject mock
    Logger.logger = mockLogger

    Logger.info('info message', 'a')
    Logger.debug('debug message', 'b')
    Logger.warn('warn message', 'c')
    Logger.error('error message', 'd')
    Logger.log('log message', 'e')

    expect(mockLogger.info).toHaveBeenCalledWith('info message', 'a')
    expect(mockLogger.debug).toHaveBeenCalledWith('debug message', 'b')
    expect(mockLogger.warn).toHaveBeenCalledWith('warn message', 'c')
    expect(mockLogger.error).toHaveBeenCalledWith('error message', 'd')
    expect(mockLogger.log).toHaveBeenCalledWith('log message', 'e')
  })
})
