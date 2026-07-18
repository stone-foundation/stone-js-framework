import { ILogger } from '@stone-js/core'
import { Application } from '../app/Application'
import { renderToString } from 'react-dom/server'
import { ReactIncomingEvent } from '@stone-js/use-react'

// We must mock decorators to lighten the test environment
vi.mock('@stone-js/core', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    StoneApp: vi.fn(() => vi.fn()),
  }
})

// We must mock decorators to lighten the test environment
vi.mock('@stone-js/node-cli-adapter', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    NodeConsole: vi.fn(() => vi.fn()),
  }
})

// We must mock decorators to lighten the test environment
vi.mock('@stone-js/browser-adapter', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    Browser: vi.fn(() => vi.fn()),
  }
})

// We must mock decorators to lighten the test environment
vi.mock('@stone-js/use-react', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    UseReact: vi.fn(() => vi.fn()),
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

  it('get head values', async () => {
    // Arrange
    const expectedMessage = 'Hello World!'
    const event = { get: () => 'World' } as unknown as ReactIncomingEvent

    // Act
    const head = await app.head({ event })

    // Assert
    expect(head).toHaveProperty('metas')
    expect(head.title).toBe(expectedMessage)
    expect(head).toHaveProperty('description')
  })

  it('should handle incoming events', () => {
    // Arrange
    const expectedMessage = 'Hello World!'
    const event = { get: () => 'World' } as unknown as ReactIncomingEvent

    // Act
    const response = app.handle(event) as { message: string }

    // Assert
    expect(response.message).toBe(expectedMessage)
    expect(mockedLogger.info).toHaveBeenCalledWith(expectedMessage)
  })

  it('should render component', () => {
    // Arrange
    const message = 'Hello World!'

    // Act
    const response = renderToString(app.render({ data: { message } } as any))

    // Assert
    expect(response).toMatchSnapshot()
  })
})