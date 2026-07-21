import { Service, ILogger } from '@stone-js/core'

/** A tenant's public-facing dashboard payload. */
export interface TenantDashboard {
  tenant: string
  plan: string
  seats: number
}

export interface TenantServiceOptions {
  logger: ILogger
}

/**
 * TenantService
 *
 * Stands in for your per-tenant data source. In a real app this reads a row scoped to the
 * tenant; here it is an in-memory map so the starter runs with nothing to provision.
 *
 * @Service({ alias }) registers it in the container under `tenantService`, so any handler can
 * receive it by destructuring that name.
 */
@Service({ alias: 'tenantService' })
export class TenantService {
  private readonly logger: ILogger

  private readonly tenants: Record<string, TenantDashboard> = {
    acme: { tenant: 'acme', plan: 'enterprise', seats: 250 },
    globex: { tenant: 'globex', plan: 'team', seats: 12 }
  }

  constructor ({ logger }: TenantServiceOptions) {
    this.logger = logger
  }

  /** Resolve the dashboard for a tenant, falling back to a free-plan default. */
  dashboard (tenant: string): TenantDashboard {
    this.logger.info(`Resolving dashboard for tenant "${tenant}"`)
    return this.tenants[tenant] ?? { tenant, plan: 'free', seats: 1 }
  }
}
