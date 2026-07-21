import { TenantController } from '../app/TenantController'
import { TenantService } from '../app/TenantService'
import { IncomingHttpEvent } from '@stone-js/http-core'

// Mock the routing/response decorators to no-ops; the handler logic stays real.
vi.mock(import('@stone-js/router'), async (importOriginal) => ({ ...(await importOriginal()), EventHandler: vi.fn(() => vi.fn()), Get: vi.fn(() => vi.fn()) }))
vi.mock(import('@stone-js/http-core'), async (importOriginal) => ({ ...(await importOriginal()), JsonHttpResponse: vi.fn(() => vi.fn()) }))

describe('TenantController', () => {
  const eventWith = (tenant?: string): IncomingHttpEvent =>
    ({ get: (_key: string, fallback: string) => tenant ?? fallback }) as unknown as IncomingHttpEvent

  it('reads the tenant from the host and returns its dashboard', () => {
    const dashboard = vi.fn(() => ({ tenant: 'acme', plan: 'enterprise', seats: 250 }))
    const controller = new TenantController({ tenantService: { dashboard } as unknown as TenantService })

    const result = controller.dashboard(eventWith('acme'))

    expect(dashboard).toHaveBeenCalledWith('acme')
    expect(result).toEqual({ tenant: 'acme', plan: 'enterprise', seats: 250 })
  })

  it('falls back to "unknown" when the host carries no tenant', () => {
    const dashboard = vi.fn(() => ({ tenant: 'unknown', plan: 'free', seats: 1 }))
    const controller = new TenantController({ tenantService: { dashboard } as unknown as TenantService })

    controller.dashboard(eventWith())

    expect(dashboard).toHaveBeenCalledWith('unknown')
  })
})
