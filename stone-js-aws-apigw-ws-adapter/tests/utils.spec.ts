import { parseFrame, managementEndpoint } from '../src/utils'
import { ApiGatewayWsAdapterError } from '../src/errors/ApiGatewayWsAdapterError'

describe('utils', () => {
  it('parseFrame parses JSON and rejects malformed/non-object', () => {
    expect(parseFrame('{"channel":"room"}')).toEqual({ channel: 'room' })
    expect(parseFrame({ toString: () => '{"a":1}' })).toEqual({ a: 1 })
    expect(parseFrame('nope')).toBeUndefined()
    expect(parseFrame('42')).toBeUndefined()
  })

  it('managementEndpoint builds https://<domain>/<stage>', () => {
    expect(managementEndpoint({ requestContext: { connectionId: 'c', eventType: 'MESSAGE', domainName: 'api.example.com', stage: 'prod' } })).toBe('https://api.example.com/prod')
    expect(managementEndpoint({ requestContext: { connectionId: 'c', eventType: 'MESSAGE', domainName: 'api.example.com' } })).toBe('https://api.example.com')
    expect(managementEndpoint({ requestContext: { connectionId: 'c', eventType: 'MESSAGE' } })).toBeUndefined()
  })
})

describe('ApiGatewayWsAdapterError', () => {
  it('is a named integration error', () => {
    const error = new ApiGatewayWsAdapterError('boom')
    expect(error).toBeInstanceOf(Error)
    expect(error.name).toBe('ApiGatewayWsAdapterError')
  })
})
