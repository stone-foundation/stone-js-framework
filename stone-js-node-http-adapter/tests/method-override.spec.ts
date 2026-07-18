import { resolveMethodOverride } from '../src/method-override'

const blueprint = (allow?: boolean): any => ({
  get: (key: string, fb: any) => (key === 'stone.http.allowMethodOverride' ? (allow ?? fb) : fb)
})

const req = (method: string, headers: Record<string, any> = {}): any => ({ method, headers })

describe('resolveMethodOverride (security)', () => {
  it('honours a whitelisted override from a POST via the $method$ field', () => {
    expect(resolveMethodOverride(blueprint(), req('POST'), 'delete')).toBe('DELETE')
    expect(resolveMethodOverride(blueprint(), req('POST'), 'PUT')).toBe('PUT')
    expect(resolveMethodOverride(blueprint(), req('POST'), 'patch')).toBe('PATCH')
  })

  it('prefers the X-HTTP-Method-Override header over the body field', () => {
    expect(resolveMethodOverride(blueprint(), req('POST', { 'x-http-method-override': 'PUT' }), 'DELETE')).toBe('PUT')
    expect(resolveMethodOverride(blueprint(), req('POST', { 'x-http-method-override': ['PATCH'] }), 'DELETE')).toBe('PATCH')
  })

  it('never upgrades a non-POST request', () => {
    expect(resolveMethodOverride(blueprint(), req('GET'), 'DELETE')).toBeUndefined()
    expect(resolveMethodOverride(blueprint(), req('PUT'), 'DELETE')).toBeUndefined()
  })

  it('rejects a non-whitelisted target (no downgrade to GET/HEAD/etc.)', () => {
    expect(resolveMethodOverride(blueprint(), req('POST'), 'GET')).toBeUndefined()
    expect(resolveMethodOverride(blueprint(), req('POST'), 'HEAD')).toBeUndefined()
    expect(resolveMethodOverride(blueprint(), req('POST'), 'TRACE')).toBeUndefined()
    expect(resolveMethodOverride(blueprint(), req('POST'), undefined)).toBeUndefined()
  })

  it('can be disabled entirely via config', () => {
    expect(resolveMethodOverride(blueprint(false), req('POST'), 'DELETE')).toBeUndefined()
  })
})
