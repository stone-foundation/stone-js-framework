import { ILogger } from '@stone-js/core'
import { renderToString } from 'react-dom/server'
import { ReactIncomingEvent } from '@stone-js/use-react'
import { WelcomePage } from '../app/pages/welcome/WelcomePage'
import { WelcomeService } from '../app/services/WelcomeService'

// We must mock decorators to lighten the test environment
vi.mock('@stone-js/use-react', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    Page: vi.fn(() => vi.fn()),
  }
})

// We must mock decorators to lighten the test environment
vi.mock('@stone-js/core', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    Service: vi.fn(() => vi.fn()),
  }
})

describe('WelcomePage', () => {
  let page: WelcomePage
  let mockedLogger: ILogger

  beforeEach(() => {
    mockedLogger = {
      info: vi.fn(),
    } as unknown as ILogger

    page = new WelcomePage({ welcomeService: new WelcomeService({ logger: mockedLogger }) })
  })

  it('should handle incoming events', () => {
    // Arrange
    const expectedMessage = 'Hello World!'
    const event = { get: () => 'World' } as unknown as ReactIncomingEvent

    // Act
    const response = page.handle(event)

    // Assert
    expect(response.message).toBe(expectedMessage)
    expect(mockedLogger.info).toHaveBeenCalledWith('Welcome World')
  })

  it('should render the message', () => {
    // Arrange
    const message = 'Hello World!'

    // Act
    const response = renderToString(page.render({ data: { message } } as any))

    // Assert
    expect(response).toContain(message)
  })

  it('should render the Stone.js logo', () => {
    // Act
    const response = renderToString(page.render({ data: { message: 'Hello World!' } } as any))

    // Assert
    expect(response).toContain('/logo.svg')
    expect(response).toContain('alt="Stone.js"')
  })
})
