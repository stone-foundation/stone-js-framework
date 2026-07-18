import { renderToString } from 'react-dom/server'
import { ILogger, IncomingEvent } from '@stone-js/core'
import { FactoryHandler, AppConfig } from '../app/Application'

vi.mock('@stone-js/core', async (mod) => {
  const actual: any = await mod()
  return {
    ...actual,
    isNotEmpty: vi.fn(() => true),
    defineConfig: (config: any) => config
  }
})

describe('Application', () => {
  let app: any
  let mockedLogger: ILogger

  beforeEach(() => {
    mockedLogger = {
      info: vi.fn(),
    } as unknown as ILogger

    app = FactoryHandler({ logger: mockedLogger })
  })

  it('should create an application instance', () => {
    // Assert
    expect(app).toBeInstanceOf(Object)
  })

  it('get head values', async () => {
    // Arrange
    const expectedMessage = 'Hello World!'
    const event = { get: () => 'World' } as unknown as IncomingEvent

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
    const event = { get: () => 'World' } as unknown as IncomingEvent

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

  it('should get config', () => {
    // Arrange
    const config: any = AppConfig
    const blueprint: any = { is: () => true, set: vi.fn() }

    // Act
    config.afterConfigure(blueprint)

    // Assert
    expect(blueprint.set).toHaveBeenCalled()
  })
})