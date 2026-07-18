import { ResponseSnapshotType } from '../src/declarations'
import { isSSR, resolveComponent } from '../src/UseReactPageInternals'
import { prepareErrorPage, prepareFallbackErrorPage, preparePage } from '../src/UseReactPageRenderer'

const createMockContainer = (): any => ({
  make: vi.fn((key: string) => {
    if (key === 'blueprint') {
      return {
        get: vi.fn().mockImplementation((key: string) => {
          if (key.includes('default')) return { layout: 'default', module: {} }
          return {}
        })
      }
    }
    if (key === 'snapshot') {
      return {
        add: vi.fn().mockReturnValue({ toJson: () => '{}' })
      }
    }
  }),
  resolve: vi.fn()
})

const createMockResponse = (): any => ({
  content: {
    error: { name: 'ErrorName' },
    layout: 'default'
  },
  setContent: vi.fn().mockReturnThis(),
  setStatus: vi.fn().mockReturnThis(),
  statusCode: 500
})

const createMockEvent = (): any => ({
  fingerprint: vi.fn().mockReturnValue('event-id')
})

const createSnapshot = (): ResponseSnapshotType => ({
  ssr: false,
  error: { name: 'ErrorName' },
  layout: 'default',
  statusCode: 500
})

vi.mock('../src/UseReactPageInternals', async () => {
  const actual = await vi.importActual<any>('../src/UseReactPageInternals')
  return {
    ...actual,
    resolveComponent: vi.fn().mockResolvedValue({
      render: vi.fn().mockReturnValue(() => {}),
      handle: vi.fn().mockResolvedValue({ content: {}, statusCode: 500 }),
      head: vi.fn().mockResolvedValue(undefined)
    }),
    executeHandler: vi.fn().mockResolvedValue({ content: {}, statusCode: 500 }),
    executeHooks: vi.fn().mockResolvedValue(undefined),
    buildPageComponent: vi.fn().mockResolvedValue('<div>Page</div>'),
    buildAppComponent: vi.fn().mockResolvedValue('<div>App</div>'),
    getServerContent: vi.fn().mockReturnValue('<html>SSR</html>'),
    getBrowserContent: vi.fn().mockReturnValue({ head: {}, app: '<div>App</div>' }),
    isSSR: vi.fn().mockReturnValue(false)
  }
})

describe('UseReactPageRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('preparePage', () => {
    it('should render and set browser content with page handler on csr', async () => {
      vi.mocked(isSSR).mockReturnValue(false)
      const container: any = createMockContainer()
      const event: any = createMockEvent()
      const response: any = createMockResponse()
      const snapshot: any = createSnapshot()

      await preparePage(event, response, container, snapshot)

      expect(response.setContent).toHaveBeenCalled()
    })

    it('should render and set browser content with page handler on ssr', async () => {
      vi.mocked(isSSR).mockReturnValue(true)
      const container: any = createMockContainer()
      const event: any = createMockEvent()
      const response: any = createMockResponse()
      const snapshot: any = createSnapshot()

      await preparePage(event, response, container, snapshot)

      expect(response.setContent).toHaveBeenCalled()
    })
  })

  describe('prepareErrorPage', () => {
    it('should render and set browser content with error handler on csr', async () => {
      vi.mocked(isSSR).mockReturnValue(false)
      const container: any = createMockContainer()
      const event: any = createMockEvent()
      const response: any = createMockResponse()
      const snapshot: any = createSnapshot()

      await prepareErrorPage(event, response, container, snapshot)

      expect(response.setContent).toHaveBeenCalledWith(expect.objectContaining({
        head: {},
        app: '<div>App</div>'
      }))
    })

    it('should render and set browser content with error handler on ssr', async () => {
      vi.mocked(isSSR).mockReturnValue(true)
      const container: any = createMockContainer()
      const event: any = createMockEvent()
      const response: any = createMockResponse()
      const snapshot: any = createSnapshot()

      await prepareErrorPage(event, response, container, snapshot)

      expect(response.setContent).toHaveBeenCalledWith('<html>SSR</html>')
    })

    it('should render and set browser content with error handler on ssr', async () => {
      vi.mocked(isSSR).mockReturnValue(true)
      vi.mocked(resolveComponent).mockResolvedValue({
        render: vi.fn().mockReturnValue(() => {}),
        handle: vi.fn().mockResolvedValue({ content: {}, statusCode: 500 }),
        head: vi.fn().mockResolvedValue(undefined)
      })

      const container: any = createMockContainer()
      const event: any = createMockEvent()
      const response: any = createMockResponse()
      const snapshot: any = createSnapshot()

      await prepareErrorPage(event, response, container, snapshot)

      expect(response.setContent).toHaveBeenCalledWith('<html>SSR</html>')
    })
  })

  describe('prepareFallbackErrorPage', () => {
    it('should resolve default error page and call prepareErrorPage', async () => {
      const container: any = createMockContainer()
      const event: any = createMockEvent()
      const response: any = createMockResponse()
      const snapshot: any = createSnapshot()

      await prepareFallbackErrorPage(event, response, container, snapshot)

      expect(response.setContent).toHaveBeenCalled()
      expect(response.setStatus).toHaveBeenCalledWith(500)
    })

    it('should fallback to Stone error page when no error page is defined', async () => {
      vi.mocked(isSSR).mockReturnValue(true)
      vi.mocked(resolveComponent).mockResolvedValue(undefined)

      const container: any = createMockContainer()
      const event: any = createMockEvent()
      const response: any = createMockResponse()
      const snapshot: any = createSnapshot()
      snapshot.error = undefined
      response.content = {}

      await prepareFallbackErrorPage(event, response, container, snapshot)

      expect(response.setContent).toHaveBeenCalledWith('<html>SSR</html>')
      expect(response.setStatus).toHaveBeenCalledWith(500)

      response.content = new Error('An error occurred.')

      await prepareFallbackErrorPage(event, response, container, snapshot)

      expect(response.setContent).toHaveBeenCalledWith('<html>SSR</html>')
      expect(response.setStatus).toHaveBeenCalledWith(500)
    })
  })
})
