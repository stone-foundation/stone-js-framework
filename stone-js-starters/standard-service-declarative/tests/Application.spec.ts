import { ILogger } from '@stone-js/core'
import { IncomingHttpEvent } from '@stone-js/http-core'
import { WelcomeService } from '../app/services/WelcomeService'
import { WelcomeEventHandler } from '../app/handlers/WelcomeEventHandler'

// We must mock decorators to lighten the test environment
vi.mock(import('@stone-js/core'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    Service: vi.fn(() => vi.fn())
  }
})

// We must mock decorators to lighten the test environment
vi.mock(import('@stone-js/router'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    EventHandler: vi.fn(() => vi.fn()),
    Get: vi.fn(() => vi.fn())
  }
})

// We must mock decorators to lighten the test environment
vi.mock(import('@stone-js/http-core'), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    JsonHttpResponse: vi.fn(() => vi.fn())
  }
})

describe('WelcomeService', () => {
  let mockedLogger: ILogger
  let service: WelcomeService

  beforeEach(() => {
    mockedLogger = {
      info: vi.fn()
    } as unknown as ILogger

    service = new WelcomeService({ logger: mockedLogger })
  })

  it('should build a welcome message for the given name', () => {
    // Act
    const response = service.welcome('Stone')

    // Assert
    expect(response).toHaveProperty('message', 'Hello Stone!')
    expect(mockedLogger.info).toHaveBeenCalledWith('Welcome Stone')
  })
})

describe('WelcomeEventHandler', () => {
  let mockedLogger: ILogger
  let handler: WelcomeEventHandler

  beforeEach(() => {
    mockedLogger = {
      info: vi.fn()
    } as unknown as ILogger

    handler = new WelcomeEventHandler({ welcomeService: new WelcomeService({ logger: mockedLogger }) })
  })

  it('should welcome the name carried by the event', () => {
    // Arrange
    const event = { get: () => 'World' } as unknown as IncomingHttpEvent

    // Act
    const response = handler.welcome(event)

    // Assert
    expect(response.message).toBe('Hello World!')
    expect(mockedLogger.info).toHaveBeenCalledWith('Welcome World')
  })

  it('should fall back to the default name when the event carries none', () => {
    // Arrange
    const event = { get: (_key: string, fallback: string) => fallback } as unknown as IncomingHttpEvent

    // Act
    const response = handler.welcome(event)

    // Assert
    expect(response.message).toBe('Hello World!')
    expect(mockedLogger.info).toHaveBeenCalledWith('Welcome World')
  })
})
