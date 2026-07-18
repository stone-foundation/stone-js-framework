import { TelemetryMiddleware } from '../../src/middleware/TelemetryMiddleware'

const makeTelemetry = (enabled = true): any => {
  const span = { setAttribute: vi.fn().mockReturnThis(), recordError: vi.fn().mockReturnThis(), end: vi.fn() }
  return {
    span,
    isEnabled: () => enabled,
    startSpan: vi.fn(() => span),
    counter: vi.fn()
  }
}

const event: any = { type: 'stone@incoming' }

describe('TelemetryMiddleware', () => {
  it('passes through untouched when telemetry is disabled', async () => {
    const telemetry = makeTelemetry(false)
    const mw = new TelemetryMiddleware({ telemetry })
    const next = vi.fn(async () => ({ statusCode: 200 }))
    const res = await mw.handle(event, next as any)
    expect(res).toEqual({ statusCode: 200 })
    expect(telemetry.startSpan).not.toHaveBeenCalled()
  })

  it('spans a successful event and records the status code + counter', async () => {
    const telemetry = makeTelemetry()
    const mw = new TelemetryMiddleware({ telemetry })
    const next = vi.fn(async () => ({ statusCode: 201 }))
    await mw.handle(event, next as any)
    expect(telemetry.startSpan).toHaveBeenCalledWith('stone.event', { type: 'stone@incoming' })
    expect(telemetry.span.setAttribute).toHaveBeenCalledWith('statusCode', 201)
    expect(telemetry.span.end).toHaveBeenCalledWith('ok')
    expect(telemetry.counter).toHaveBeenCalledWith('stone.events.total', 1, { status: 'ok' })
  })

  it('marks a 5xx response as an error (OpenTelemetry server-span convention)', async () => {
    const telemetry = makeTelemetry()
    const mw = new TelemetryMiddleware({ telemetry })
    const next = vi.fn(async () => ({ statusCode: 500 }))
    const res = await mw.handle(event, next as any)
    expect(res).toEqual({ statusCode: 500 })
    expect(telemetry.span.setAttribute).toHaveBeenCalledWith('statusCode', 500)
    expect(telemetry.span.end).toHaveBeenCalledWith('error')
    expect(telemetry.counter).toHaveBeenCalledWith('stone.events.total', 1, { status: 'error' })
  })

  it('leaves a 4xx response as ok (client error, not a server failure)', async () => {
    const telemetry = makeTelemetry()
    const mw = new TelemetryMiddleware({ telemetry })
    const next = vi.fn(async () => ({ statusCode: 404 }))
    await mw.handle(event, next as any)
    expect(telemetry.span.setAttribute).toHaveBeenCalledWith('statusCode', 404)
    expect(telemetry.span.end).toHaveBeenCalledWith('ok')
    expect(telemetry.counter).toHaveBeenCalledWith('stone.events.total', 1, { status: 'ok' })
  })

  it('does not set a status code when the response has none', async () => {
    const telemetry = makeTelemetry()
    const mw = new TelemetryMiddleware({ telemetry })
    await mw.handle(event, (async () => ({})) as any)
    expect(telemetry.span.setAttribute).not.toHaveBeenCalled()
    expect(telemetry.span.end).toHaveBeenCalledWith('ok')
  })

  it('records the error, ends the span, counts it and rethrows', async () => {
    const telemetry = makeTelemetry()
    const mw = new TelemetryMiddleware({ telemetry })
    const error = new Error('boom')
    await expect(mw.handle(event, (async () => { throw error }) as any)).rejects.toThrow('boom')
    expect(telemetry.span.recordError).toHaveBeenCalledWith(error)
    expect(telemetry.span.end).toHaveBeenCalledWith('error')
    expect(telemetry.counter).toHaveBeenCalledWith('stone.events.total', 1, { status: 'error' })
  })
})
