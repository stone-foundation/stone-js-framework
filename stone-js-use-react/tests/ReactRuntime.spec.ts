import { ReactRuntime } from '../src/ReactRuntime'
import { applyHeadToDocument } from '@stone-js/use-view'
import { isServer, resolveComponent, buildAppComponent, renderReactApp } from '../src/UseReactPageInternals'

vi.mock('../src/UseReactPageInternals', async mod => ({
  ...(await mod()),
  isServer: vi.fn(),
  renderReactApp: vi.fn(),
  buildAppComponent: vi.fn().mockResolvedValue('AppComponent'),
  resolveComponent: vi.fn()
}))

vi.mock('@stone-js/use-view', async mod => ({
  ...(await mod()),
  applyHeadToDocument: vi.fn()
}))

const createMockSnapshot = (): any => ({
  get: vi.fn(),
  set: vi.fn()
})

const createMockContainer = (): any => ({
  make: vi.fn().mockReturnValue({ fingerprint: () => 'abc123' })
})

const createMockBlueprint = (): any => ({
  get: vi.fn()
})

describe('ReactRuntime', () => {
  let snapshot: any
  let container: any
  let blueprint: any
  let runtime: ReactRuntime

  beforeEach(() => {
    vi.clearAllMocks()
    snapshot = createMockSnapshot()
    container = createMockContainer()
    blueprint = createMockBlueprint()
    runtime = new ReactRuntime({ snapshot, container, blueprint })
  })

  describe('snapshot()', () => {
    it('creates snapshot on server', async () => {
      vi.mocked(isServer).mockReturnValue(true)
      const handler = vi.fn().mockResolvedValue({ foo: 123 })

      const result = await runtime.snapshot('test', handler)

      expect(handler).toHaveBeenCalledWith(container)
      expect(snapshot.set).toHaveBeenCalledWith('abc123.test', { foo: 123 })
      expect(result).toEqual({ foo: 123 })
    })

    it('returns existing snapshot on client if available', async () => {
      vi.mocked(isServer).mockReturnValue(false)
      snapshot.get.mockReturnValue('cached')

      const handler = vi.fn().mockResolvedValue('new')
      const result = await runtime.snapshot('test', handler)

      expect(result).toBe('cached')
      expect(handler).not.toHaveBeenCalled()
    })

    it('invokes handler if snapshot missing on client', async () => {
      vi.mocked(isServer).mockReturnValue(false)
      snapshot.get.mockReturnValue(undefined)

      const handler = vi.fn().mockResolvedValue('computed')
      const result = await runtime.snapshot('key', handler)

      expect(result).toBe('computed')
      expect(handler).toHaveBeenCalled()
    })
  })

  describe('head()', () => {
    it('calls applyHeadToDocument', () => {
      const context = { title: 'Hello' }
      runtime.head(context)

      expect(applyHeadToDocument).toHaveBeenCalledWith(document, context)
    })
  })

  describe('throwError()', () => {
    it('throws if no matching meta error is found', async () => {
      blueprint.get.mockReturnValue(undefined)

      await expect(runtime.throwError(new Error('fail'))).rejects.toThrow('fail')
    })

    it('calls renderErrorComponent if error page meta exists', async () => {
      blueprint.get.mockReturnValueOnce({ layout: 'main' }) // get(...) with error.name
      blueprint.get.mockReturnValueOnce({ layout: 'main' }) // get(...) default fallback

      const handler = {
        handle: vi.fn().mockResolvedValue({ content: 'data', statusCode: 404 }),
        render: vi.fn().mockReturnValue(() => null)
      }
      vi.mocked(resolveComponent).mockResolvedValue(handler)

      await runtime.throwError(new Error('Fail'), 500)

      expect(resolveComponent).toHaveBeenCalled()
      expect(buildAppComponent).toHaveBeenCalled()
      expect(renderReactApp).toHaveBeenCalledWith('AppComponent', blueprint)
    })

    it('uses default error status if response has none', async () => {
      blueprint.get.mockReturnValue({ layout: 'minimal' })

      const handler = {
        handle: vi.fn().mockResolvedValue(undefined),
        render: vi.fn().mockReturnValue(() => null)
      }
      vi.mocked(resolveComponent).mockResolvedValue(handler)

      await runtime.throwError(new Error('Fallback'))

      expect(renderReactApp).toHaveBeenCalled()
    })
  })
})
