import { MetadataSymbol } from '@stone-js/core'
import { Concern, DECLARATION_KEYS, declaredOn } from '../src/declaredOn'

/**
 * Record declarations exactly as a decorator leaves them: accumulated under the module's key, one
 * entry per method, in the store the framework reads.
 */
const withDeclarations = (entries: Array<[Concern, Record<string, unknown>]>): any => {
  class Controller {}
  const metadata: Record<PropertyKey, unknown> = {}

  for (const [concern, entry] of entries) {
    const key = DECLARATION_KEYS[concern]
    metadata[key] = [entry].concat((metadata[key] ?? []) as any[])
  }

  ;(Controller as any)[MetadataSymbol] = metadata
  return Controller
}

const declaringHandler = (concern: Concern, value: unknown, action = 'show'): any => ({
  module: withDeclarations([[concern, { action, [concern]: value }]]),
  action
})

const routeWith = (options: Record<string, unknown>): any => ({
  getOption: <T>(key: string): T => options[key] as T
})

describe('a declaration is read wherever it was written', () => {
  it('prefers the route option, the single description of a routed endpoint', () => {
    const handler = declaringHandler('validation', 'fromHandler')

    expect(declaredOn(routeWith({ validation: 'fromRoute', handler }), 'validation')).toBe('fromRoute')
  })

  it('falls back to the handler decorator, which needs no router at all', () => {
    // The reason this exists: both modules advertise working without a router, and a contract reading
    // only route options documented half of such an application — endpoints listed, payloads missing.
    const handler = declaringHandler('validation', 'fromHandler')

    expect(declaredOn(routeWith({ handler }), 'validation')).toBe('fromHandler')
  })

  it('reads all four concerns the same way', () => {
    for (const concern of ['validation', 'resource', 'auth', 'authz'] as Concern[]) {
      const handler = declaringHandler(concern, `declared:${concern}`)

      expect(declaredOn(routeWith({ handler }), concern)).toBe(`declared:${concern}`)
    }
  })

  it('matches the method the route resolves to, not the first one declared', () => {
    const module = withDeclarations([
      ['resource', { action: 'list', resource: 'listResource' }],
      ['resource', { action: 'show', resource: 'showResource' }]
    ])

    expect(declaredOn(routeWith({ handler: { module, action: 'show' } }), 'resource')).toBe('showResource')
  })

  it('reads the single declaration of a handler with no named action', () => {
    const handler = declaringHandler('resource', 'only', 'handle')

    expect(declaredOn(routeWith({ handler: { module: handler.module } }), 'resource')).toBe('only')
  })

  it('finds nothing when nothing was declared', () => {
    expect(declaredOn(routeWith({}), 'auth')).toBeUndefined()
    expect(declaredOn(routeWith({ handler: { module: class {} } }), 'auth')).toBeUndefined()
  })

  it('reads by key rather than by import, so this package depends on none of those modules', () => {
    // The keys are the public contract between a module and the document derived from it.
    expect(DECLARATION_KEYS).toEqual({
      validation: '@stone-js/validation/validate',
      resource: '@stone-js/resources/returns',
      auth: '@stone-js/auth/protect',
      authz: '@stone-js/authz/can'
    })
  })
})
