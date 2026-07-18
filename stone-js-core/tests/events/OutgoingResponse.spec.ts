import { IncomingEvent } from '../../src/events/IncomingEvent'
import { OutgoingResponse } from '../../src/events/OutgoingResponse'

describe('OutgoingResponse', () => {
  const baseOptions = {
    content: { data: 'ok' },
    statusCode: 200,
    statusMessage: 'OK',
    metadata: { user: 'stone' },
    source: { platform: 'cli' }
  }

  it('should create an instance with provided values', () => {
    const response = OutgoingResponse.create(baseOptions)

    expect(response).toBeInstanceOf(OutgoingResponse)
    expect(response.statusCode).toBe(200)
    expect(response.statusMessage).toBe('OK')
    expect(response.content).toEqual({ data: 'ok' })
    expect(response.originalContent).toEqual({ data: 'ok' })
    expect(response.get('user')).toBe('stone')
    expect(response.isPrepared).toBe(false)
  })

  it('should fallback to default values if not provided', () => {
    const response = OutgoingResponse.create({ source: { platform: 'web' } })

    expect(response.statusCode).toBeUndefined()
    expect(response.statusMessage).toBeUndefined()
    expect(response.content).toBeUndefined()
    expect(response.originalContent).toBeUndefined()
    expect(response.isPrepared).toBe(false)
    expect(response.type).toBe(OutgoingResponse.OUTGOING_RESPONSE)
  })

  it('should allow setting status code and message', () => {
    const response = OutgoingResponse.create({ source: { platform: 'cli' } })

    response.setStatus(404, 'Not Found')
    expect(response.statusCode).toBe(404)
    expect(response.statusMessage).toBe('Not Found')
  })

  it('should allow setting content', () => {
    const response = OutgoingResponse.create({ source: { platform: 'cli' } })

    response.setContent({ msg: 'hi' })
    expect(response.content).toEqual({ msg: 'hi' })
  })

  it('should allow setting prepared status', () => {
    const response = OutgoingResponse.create({ source: { platform: 'cli' } })

    expect(response.isPrepared).toBe(false)
    response.setPrepared(true)
    expect(response.isPrepared).toBe(true)
  })

  it('should return self from prepare() and mark prepared=true', async () => {
    const response = OutgoingResponse.create({ source: { platform: 'cli' } })
    const event = IncomingEvent.create({ source: { platform: 'cli', rawContext: '', rawEvent: '' } })

    const prepared = await response.prepare(event)

    expect(prepared).toBe(response)
    expect(prepared.isPrepared).toBe(true)
  })

  it('should support metadata manipulation', () => {
    const response = OutgoingResponse.create({ source: { platform: 'cli' } })

    response.setMetadataValue('role', 'admin')
    expect(response.get('role')).toBe('admin')

    response.setMetadataValue({ env: 'test', version: 1 })
    expect(response.get('env')).toBe('test')
    expect(response.get('version')).toBe(1)
  })

  it('should support cloning', () => {
    const response = OutgoingResponse.create(baseOptions)
    const clone = response.clone()

    expect(clone).toBeInstanceOf(OutgoingResponse)
    expect(clone).not.toBe(response)
    expect(clone.statusCode).toBe(200)
    expect(clone.content).toEqual({ data: 'ok' })
    expect(clone.metadata).toEqual(response.metadata)
  })
})
