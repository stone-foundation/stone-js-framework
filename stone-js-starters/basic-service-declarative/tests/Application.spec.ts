import { Application } from '../app/Application'
import { ILogger, IncomingEvent } from '@stone-js/core'

// We must mock decorators to lighten the test environment
vi.mock(import("@stone-js/core"), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    StoneApp: vi.fn(() => vi.fn()),
  }
})

// We must mock decorators to lighten the test environment
vi.mock(import("@stone-js/node-cli-adapter"), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    NodeConsole: vi.fn(() => vi.fn()),
  }
})

// We must mock decorators to lighten the test environment
vi.mock(import("@stone-js/node-http-adapter"), async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    NodeHttp: vi.fn(() => vi.fn()),
  }
})

describe('Application', () => {
  let app: Application
  let mockedLogger: ILogger

  beforeEach(() => {
    mockedLogger = {
      info: vi.fn(),
    } as unknown as ILogger

    app = new Application({ logger: mockedLogger })
  })

  it('should create an application instance', () => {
    // Assert
    expect(app).toBeInstanceOf(Application)
  })

  it('should handle incoming events', () => {
    // Arrange
    const expectedMessage = 'Hello World!'
    const event = { get: () => 'World' } as unknown as IncomingEvent

    // Act
    const response = app.handle(event) as { message: string }

    // Assert
    expect(response.message).toBe(expectedMessage)
    expect(mockedLogger.info).toHaveBeenCalledWith(expectedMessage)
  })
})