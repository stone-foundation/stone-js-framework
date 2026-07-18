import { ConsoleTelemetryExporter } from '../../src/exporters/ConsoleTelemetryExporter'

describe('ConsoleTelemetryExporter', () => {
  it('formats a full span record', () => {
    const lines: string[] = []
    ConsoleTelemetryExporter.create((m) => lines.push(m)).export({
      name: 'op',
      kind: 'span',
      service: 'svc',
      timestamp: 0,
      status: 'error',
      durationMs: 12,
      attributes: { a: 1 },
      error: { name: 'Error', message: 'boom' }
    })
    expect(lines[0]).toContain('[telemetry] svc')
    expect(lines[0]).toContain('span=op')
    expect(lines[0]).toContain('status=error')
    expect(lines[0]).toContain('duration=12ms')
    expect(lines[0]).toContain('error="Error: boom"')
    expect(lines[0]).toContain('attrs={"a":1}')
  })

  it('formats a minimal counter record (omits absent fields)', () => {
    const lines: string[] = []
    ConsoleTelemetryExporter.create((m) => lines.push(m)).export({
      name: 'hits', kind: 'counter', service: 'svc', timestamp: 0, value: 3, attributes: {}
    })
    expect(lines[0]).toBe('[telemetry] svc counter=hits value=3')
  })

  it('defaults its sink to console.log', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    ConsoleTelemetryExporter.create().export({ name: 'x', kind: 'gauge', service: 's', timestamp: 0, value: 1, attributes: {} })
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})
