import { operationFromRoute, readValidation, routesFromRouter } from '../src/fromRouter'

const NameSchema = { validate: () => ({ success: true as const, value: {} }) }
const PageSchema = { parse: () => ({}), safeParse: () => ({}) }

const route = (path: string, method: string, options: Record<string, unknown>): any => ({
  path,
  method,
  getOption: (key: string, fallback?: unknown) => options[key] ?? fallback
})

const router = (...routes: any[]): any => ({ getRoutes: () => ({ getRoutes: () => routes }) })

describe('readValidation', () => {
  it('reads a bare schema as the body, the same rule the validator applies', () => {
    expect(readValidation(NameSchema)).toEqual({ body: NameSchema })
    expect(readValidation(PageSchema)).toEqual({ body: PageSchema })
  })

  it('reads a map of sources as it stands', () => {
    expect(readValidation({ body: NameSchema, query: PageSchema })).toEqual({ body: NameSchema, query: PageSchema })
  })

  it('resolves a name against the registry, which is why routes can name a schema', () => {
    expect(readValidation('createUser', { createUser: { body: NameSchema } })).toEqual({ body: NameSchema })
  })

  it('reads a schema class by instantiating it at documentation time', () => {
    class CreateUser { rules (): any { return { body: NameSchema } } }
    expect(readValidation('createUser', { createUser: CreateUser })).toEqual({ body: NameSchema })
    expect(readValidation(new CreateUser())).toEqual({ body: NameSchema })
  })

  it('skips a class whose rules need a service, rather than guessing', () => {
    // A wrong contract is worse than a missing one, so it declines instead of inventing.
    class NeedsI18n {
      private readonly t: any
      constructor ({ i18n }: any) { this.t = i18n.t }
      rules (): any { return { body: NameSchema } }
    }
    expect(readValidation('x', { x: NeedsI18n })).toBeUndefined()
  })

  it('reads nothing out of nothing', () => {
    expect(readValidation(undefined)).toBeUndefined()
    expect(readValidation(null)).toBeUndefined()
    expect(readValidation('missing', {})).toBeUndefined()
  })
})

describe('operationFromRoute', () => {
  it('derives the request from what the route declared', () => {
    const operation = operationFromRoute(route('/users', 'POST', { validation: NameSchema, name: 'users.create' }))

    expect(operation.request).toEqual({ body: NameSchema })
    expect(operation.operationId).toBe('users.create')
    expect(operation.security).toBeUndefined()
  })

  it('marks a protected route as protected, from auth or from authz', () => {
    // The endpoint documents itself as protected without anyone restating it.
    expect(operationFromRoute(route('/me', 'GET', { auth: true })).security).toEqual([{ bearerAuth: [] }])
    expect(operationFromRoute(route('/me', 'GET', { authz: 'post:update' })).security).toEqual([{ bearerAuth: [] }])
    expect(operationFromRoute(route('/me', 'GET', { auth: true }), { securityScheme: 'oauth2' }).security)
      .toEqual([{ oauth2: [] }])
  })

  it('lets an explicit openapi option win, because an author who wrote it meant it', () => {
    const operation = operationFromRoute(route('/users', 'POST', {
      validation: NameSchema,
      openapi: { summary: 'Create a user', request: { body: PageSchema } }
    }))

    expect(operation.summary).toBe('Create a user')
    expect(operation.request).toEqual({ body: PageSchema })
  })
})

describe('routesFromRouter', () => {
  it('makes the document a view of the routing table', () => {
    const derived = routesFromRouter(router(
      route('/users', 'GET', { name: 'users.list' }),
      route('/users', 'POST', { validation: NameSchema, auth: true })
    ))

    expect(derived).toEqual([
      { path: '/users', method: 'GET', openapi: { operationId: 'users.list' } },
      {
        path: '/users',
        method: 'POST',
        openapi: { operationId: undefined, request: { body: NameSchema }, security: [{ bearerAuth: [] }] }
      }
    ])
  })

  it('honours an opt-out, for an endpoint that must not be published', () => {
    const derived = routesFromRouter(router(
      route('/health', 'GET', { openapi: false }),
      route('/users', 'GET', {})
    ))

    expect(derived).toHaveLength(1)
    expect(derived[0].path).toBe('/users')
  })
})
