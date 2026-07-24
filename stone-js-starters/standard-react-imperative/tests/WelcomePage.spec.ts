import { ILogger } from '@stone-js/core'
import { renderToString } from 'react-dom/server'
import { ReactIncomingEvent } from '@stone-js/use-react'
import { WelcomePage } from '../app/pages/welcome/WelcomePage'
import { WelcomeService } from '../app/services/WelcomeService'

describe('WelcomePage', () => {
  let page: any
  let mockedLogger: ILogger

  beforeEach(() => {
    mockedLogger = {
      info: vi.fn(),
    } as unknown as ILogger

    page = WelcomePage({ welcomeService: WelcomeService({ logger: mockedLogger }) })
  })

  it('should handle incoming events', () => {
    // Arrange
    const expectedMessage = 'Hello World!'
    const event = { get: () => 'World' } as unknown as ReactIncomingEvent

    // Act
    const response = page.handle(event) as { message: string }

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
