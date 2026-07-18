import { Telemetry } from '../src/Telemetry'
import { TelemetryRecord, TelemetryExporter } from '../src/declarations'

const makeExporter = (): { exporter: TelemetryExporter, records: TelemetryRecord[], flush: any } => {
  const records: TelemetryRecord[] = []
  const flush = vi.fn()
  return { records, flush, exporter: { export: (r) => { records.push(r) }, flush } }
}

describe('Telemetry', () => {
  it('is enabled by default and disabled on request', () => {
    expect(Telemetry.create().isEnabled()).toBe(true)
    expect(Telemetry.create({ enabled: false }).isEnabled()).toBe(false)
  })

  it('records a successful span with duration and attributes', () => {
    const { exporter, records } = makeExporter()
    let t = 100
    const telemetry = Telemetry.create({ exporter, serviceName: 'svc', now: () => t })

    const span = telemetry.startSpan('op', { a: 1 })
    span.setAttribute('b', 2).setAttributes({ c: 3 })
    t = 250
    span.end()

    expect(records).toHaveLength(1)
    expect(records[0]).toMatchObject({
      name: 'op', kind: 'span', service: 'svc', status: 'ok', durationMs: 150, attributes: { a: 1, b: 2, c: 3 }
    })
  })

  it('infers error status when an error is recorded', () => {
    const { exporter, records } = makeExporter()
    const telemetry = Telemetry.create({ exporter, now: () => 0 })
    const span = telemetry.startSpan('op')
    span.recordError(new Error('boom'))
    span.end()
    expect(records[0].status).toBe('error')
    expect(records[0].error).toEqual({ name: 'Error', message: 'boom' })
  })

  it('only emits a span once even if end is called twice', () => {
    const { exporter, records } = makeExporter()
    const telemetry = Telemetry.create({ exporter, now: () => 0 })
    const span = telemetry.startSpan('op')
    span.end('ok')
    span.end('error')
    expect(records).toHaveLength(1)
    expect(records[0].status).toBe('ok')
  })

  it('emits counters (default and custom value) and gauges', () => {
    const { exporter, records } = makeExporter()
    const telemetry = Telemetry.create({ exporter, now: () => 0 })
    telemetry.counter('hits')
    telemetry.counter('hits', 5, { route: '/x' })
    telemetry.gauge('mem', 42)
    expect(records.map(r => [r.kind, r.name, r.value])).toEqual([
      ['counter', 'hits', 1],
      ['counter', 'hits', 5],
      ['gauge', 'mem', 42]
    ])
    expect(records[1].attributes).toEqual({ route: '/x' })
  })

  it('does nothing when disabled (no-op span + no records)', () => {
    const { exporter, records } = makeExporter()
    const telemetry = Telemetry.create({ enabled: false, exporter, now: () => 0 })
    const span = telemetry.startSpan('op')
    span.setAttribute('a', 1).setAttributes({ b: 2 }).recordError(new Error('x')).end()
    telemetry.counter('c')
    telemetry.gauge('g', 1)
    expect(records).toHaveLength(0)
  })

  it('flushes the exporter, and tolerates an exporter without flush', async () => {
    const { exporter, flush } = makeExporter()
    await Telemetry.create({ exporter, now: () => 0 }).flush()
    expect(flush).toHaveBeenCalled()

    await expect(Telemetry.create({ exporter: { export: () => {} }, now: () => 0 }).flush()).resolves.toBeUndefined()
  })

  it('never throws when the exporter fails', () => {
    const telemetry = Telemetry.create({ now: () => 0, exporter: { export: () => { throw new Error('exporter down') } } })
    expect(() => telemetry.counter('x')).not.toThrow()
  })

  it('falls back to the console exporter and Date.now when not provided', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const telemetry = Telemetry.create({ serviceName: 'svc' })
    telemetry.counter('boot')
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })
})
