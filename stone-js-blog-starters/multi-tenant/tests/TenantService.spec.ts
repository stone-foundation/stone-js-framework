import { TenantService } from '../app/TenantService'
import { ILogger } from '@stone-js/core'

// Mock the @Service decorator to a no-op; the resolution logic stays real.
vi.mock(import('@stone-js/core'), async (importOriginal) => ({ ...(await importOriginal()), Service: vi.fn(() => vi.fn()) }))

describe('TenantService', () => {
  let service: TenantService

  beforeEach(() => {
    service = new TenantService({ logger: { info: vi.fn() } as unknown as ILogger })
  })

  it('resolves a known tenant', () => {
    expect(service.dashboard('acme')).toEqual({ tenant: 'acme', plan: 'enterprise', seats: 250 })
  })

  it('falls back to a free plan for an unknown tenant', () => {
    expect(service.dashboard('startup')).toEqual({ tenant: 'startup', plan: 'free', seats: 1 })
  })
})
