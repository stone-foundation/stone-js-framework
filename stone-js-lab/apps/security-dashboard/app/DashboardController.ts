import { EventHandler, Get, Post } from '@stone-js/router'
import { SecurityService } from './services/SecurityService'
import { metricsStore, MetricsSnapshot } from './telemetry/MetricsStore'
import { renderDashboard } from './dashboard/renderDashboard'
import { HtmlHttpResponse, JsonHttpResponse, IncomingHttpEvent } from '@stone-js/http-core'

/**
 * The dashboard controller — everything the browser and API clients hit.
 *
 * It reads the shared {@link metricsStore} directly (process-level, outside the ephemeral
 * container) and delegates auth to {@link SecurityService}. Every request here is itself spanned
 * by the telemetry middleware, so simply viewing the dashboard produces runtime metrics.
 */
@EventHandler('/')
export class DashboardController {
  private readonly securityService: SecurityService

  constructor ({ securityService }: { securityService: SecurityService }) {
    this.securityService = securityService
  }

  /**
   * The live HTML dashboard.
   */
  @Get('/')
  @HtmlHttpResponse(200)
  dashboard (): string {
    return renderDashboard(metricsStore.snapshot())
  }

  /**
   * The raw metrics as JSON (for API clients / scraping).
   */
  @Get('/api/metrics')
  @JsonHttpResponse(200)
  metrics (): MetricsSnapshot {
    return metricsStore.snapshot()
  }

  /**
   * Handle a login attempt from the dashboard form, then bounce back to the dashboard.
   */
  @Post('/login')
  @HtmlHttpResponse(200)
  login (event: IncomingHttpEvent): string {
    const result = this.securityService.attempt(
      event.get<string>('username', ''),
      event.get<string>('password', '')
    )
    return `<!doctype html><meta charset="utf-8" />` +
      `<meta http-equiv="refresh" content="1;url=/" />` +
      `<body style="font:15px system-ui;background:#0f1117;color:#e6e8ee;padding:32px">` +
      `<p>${result.ok ? '✅' : '⛔'} ${result.message}</p>` +
      `<p><a href="/" style="color:#60a5fa">← back to dashboard</a></p></body>`
  }

  /**
   * A deliberately failing endpoint, to demonstrate error telemetry (watch the error rate rise).
   */
  @Get('/boom')
  boom (): never {
    throw new Error('Simulated failure for telemetry demo.')
  }
}
