import { IncomingHttpEvent } from '@stone-js/http-core'
import { FunctionalEventHandler, ILogger } from '@stone-js/core'
import { AppConfig, FactoryHandler, ResponseData } from '../app/Application'

vi.mock('@stone-js/core', async (mod) => {
  const actual: any = await mod()
  return {
    ...actual,
    isNotEmpty: vi.fn(() => true),
    defineConfig: (config: any) => config
  }
})

describe('Application', () => {
  let mockedLogger: ILogger
  let app: FunctionalEventHandler<IncomingHttpEvent, ResponseData>

  beforeEach(() => {
    mockedLogger = {
      info: vi.fn(),
    } as unknown as ILogger

    app = FactoryHandler({ logger: mockedLogger })
  })

  it('should create an event handler instance', () => {
    // Assert
    expect(app).toBeTypeOf('function')
  })

  it('should handle incoming http events', async () => {
    // Arrange
    const event = { get: () => 'World' } as unknown as IncomingHttpEvent
    // Act
    const response = await app(event)
    // Assert
    expect(response.message).toBe('Hello World!')
    expect(mockedLogger.info).toHaveBeenCalledWith('Hello World!')
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
