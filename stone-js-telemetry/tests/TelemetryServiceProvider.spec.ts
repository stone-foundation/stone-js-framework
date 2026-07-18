import { Telemetry } from '../src/Telemetry'
import { TelemetryServiceProvider } from '../src/TelemetryServiceProvider'

describe('TelemetryServiceProvider', () => {
  it('registers the Telemetry singleton and aliases it', () => {
    const singletonIf = vi.fn().mockReturnThis()
    const alias = vi.fn().mockReturnThis()
    const blueprint = { get: vi.fn(() => ({ serviceName: 'svc' })) }
    const container: any = { make: vi.fn(() => blueprint), singletonIf, alias }

    void new TelemetryServiceProvider(container).register()

    expect(container.make).toHaveBeenCalledWith('blueprint')
    expect(singletonIf).toHaveBeenCalledWith(Telemetry, expect.any(Function))
    expect(alias).toHaveBeenCalledWith(Telemetry, ['telemetry', 'Telemetry'])
    // The factory builds a Telemetry from the resolved options.
    const factory = singletonIf.mock.calls[0][1]
    expect(factory()).toBeInstanceOf(Telemetry)
  })
})
