import { EventHandler, Get } from '@stone-js/router'
import { TenantService, TenantDashboard } from './TenantService'
import { IncomingHttpEvent, JsonHttpResponse } from '@stone-js/http-core'

export interface TenantControllerOptions {
  tenantService: TenantService
}

/**
 * TenantController
 *
 * The whole controller is scoped to a wildcard subdomain: `{tenant}.example.com`. The tenant is
 * captured from the host during matching, so every route below reads it off the event like any
 * other parameter, no header parsing, no per-request lookup middleware.
 *
 * @EventHandler(path, { domain }) groups routes under a host constraint (`@Controller` is an alias).
 */
@EventHandler('/', { domain: '{tenant}.example.com' })
export class TenantController {
  private readonly tenantService: TenantService

  constructor ({ tenantService }: TenantControllerOptions) {
    this.tenantService = tenantService
  }

  /** The tenant's dashboard, resolved from the subdomain in the host. */
  @Get('/dashboard')
  @JsonHttpResponse(200)
  dashboard (event: IncomingHttpEvent): TenantDashboard {
    const tenant = event.get<string>('tenant', 'unknown') // from the host, not the path
    return this.tenantService.dashboard(tenant)
  }
}
