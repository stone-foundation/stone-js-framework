import { telemetryBlueprint } from '../../src/options/TelemetryBlueprint'
import { TelemetryServiceProvider } from '../../src/TelemetryServiceProvider'
import { TelemetryMiddleware } from '../../src/middleware/TelemetryMiddleware'

describe('telemetryBlueprint', () => {
  it('contributes the provider and kernel middleware', () => {
    expect(telemetryBlueprint.stone.telemetry).toEqual({ enabled: true, serviceName: 'stone-app' })
    expect(telemetryBlueprint.stone.providers).toContain(TelemetryServiceProvider)
    expect(telemetryBlueprint.stone.kernel?.middleware).toContainEqual({ module: TelemetryMiddleware, isClass: true })
  })
})
