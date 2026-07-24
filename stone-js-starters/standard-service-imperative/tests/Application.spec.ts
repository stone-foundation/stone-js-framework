import { ILogger } from '@stone-js/core'
import { IncomingHttpEvent } from '@stone-js/http-core'
import { WelcomeService } from '../app/services/welcomeService'
import { WelcomeEventHandler } from '../app/handlers/welcomeEventHandler'

describe('WelcomeService', () => {
  let mockedLogger: ILogger

  beforeEach(() => {
    mockedLogger = {
      info: vi.fn()
    } as unknown as ILogger
  })

  it('should build a welcome message for the given name', () => {
    // Arrange
    const service = WelcomeService({ logger: mockedLogger })

    // Act
    const response = service.welcome('Stone')

    // Assert
    expect(response).toHaveProperty('message', 'Hello Stone!')
    expect(mockedLogger.info).toHaveBeenCalledWith('Welcome Stone')
  })
})

describe('WelcomeEventHandler', () => {
  let mockedLogger: ILogger

  beforeEach(() => {
    mockedLogger = {
      info: vi.fn()
    } as unknown as ILogger
  })

  it('should create a functional event handler', () => {
    // Arrange
    const welcomeService = WelcomeService({ logger: mockedLogger })

    // Act
    const handler = WelcomeEventHandler({ welcomeService })

    // Assert
    expect(handler).toBeTypeOf('function')
  })

  it('should welcome the name carried by the event', () => {
    // Arrange
    const welcomeService = WelcomeService({ logger: mockedLogger })
    const handler = WelcomeEventHandler({ welcomeService })
    const event = { get: () => 'World' } as unknown as IncomingHttpEvent

    // Act
    const response = handler(event)

    // Assert
    expect(response.message).toBe('Hello World!')
    expect(mockedLogger.info).toHaveBeenCalledWith('Welcome World')
  })

  it('should fall back to the default name when the event carries none', () => {
    // Arrange
    const welcomeService = WelcomeService({ logger: mockedLogger })
    const handler = WelcomeEventHandler({ welcomeService })
    const event = { get: (_key: string, fallback: string) => fallback } as unknown as IncomingHttpEvent

    // Act
    const response = handler(event)

    // Assert
    expect(response.message).toBe('Hello World!')
    expect(mockedLogger.info).toHaveBeenCalledWith('Welcome World')
  })
})
