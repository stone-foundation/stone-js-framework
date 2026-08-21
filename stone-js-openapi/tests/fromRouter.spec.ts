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
    expect(readValidation('createUser', { schemas: { createUser: { body: NameSchema } } })).toEqual({ body: NameSchema })
  })

  it('reads a schema class by instantiating it at documentation time', () => {
    class CreateUser { rules (): any { return { body: NameSchema } } }
    expect(readValidation('createUser', { schemas: { createUser: CreateUser } })).toEqual({ body: NameSchema })
    expect(readValidation(new CreateUser())).toEqual({ body: NameSchema })
  })

  it('builds a class through the container, so rules() gets the services it asked for', () => {
    // The complete case: booted inside the application, a schema whose rules need i18n contributes.
    class NeedsI18n {
      private readonly label: string
      constructor ({ i18n }: any) { this.label = i18n.t('validation.name') }
      rules (): any { return { body: { validate: () => ({ success: true as const, value: this.label }) } } }
    }

    const read: any = readValidation('x', {
      schemas: { x: NeedsI18n },
      resolve: (Class: any) => new Class({ i18n: { t: () => 'translated' } })
    })

    expect(read.body.validate().value).toBe('translated')
  })

  it('skips a class nothing could build, rather than guessing its shape', () => {
    // Without a resolver, a class needing a service cannot be read. A wrong contract is worse than a
    // missing one: inventing a shape makes a client be written against something that does not exist.
    class NeedsI18n {
      private readonly t: any
      constructor ({ i18n }: any) { this.t = i18n.t }
      rules (): any { return { body: NameSchema } }
    }
    expect(readValidation('x', { schemas: { x: NeedsI18n } })).toBeUndefined()
  })

  it('reads nothing out of nothing', () => {
    expect(readValidation(undefined)).toBeUndefined()
    expect(readValidation(null)).toBeUndefined()
    expect(readValidation('missing', { schemas: {} })).toBeUndefined()
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
      contract: { summary: 'Create a user', request: { body: PageSchema } }
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
      route('/health', 'GET', { contract: false }),
      route('/users', 'GET', {})
    ))

    expect(derived).toHaveLength(1)
    expect(derived[0].path).toBe('/users')
  })
})

describe('the response comes from the resource that shapes it', () => {
  const userSchema = { safeParse: (v: unknown) => ({ success: true, data: v }) }
  const summarySchema = { safeParse: (v: unknown) => ({ success: true, data: v }) }

  const resource = {
    schema: () => userSchema,
    fragments: () => ({ summary: summarySchema })
  }

  const routeWith = (options: Record<string, unknown>): any => ({
    path: '/users',
    method: 'GET',
    getOption: <T>(key: string): T => options[key] as T
  })

  it('documents what the endpoint will actually return', async () => {
    // The half of a contract usually written twice: the projection the code performs, and the response
    // the document claims. One declaration now feeds both.
    const operation = operationFromRoute(routeWith({ resource }))

    expect(operation.responses?.[200]).toMatchObject({ schema: userSchema })
  })

  it('documents the fragments as an enumerated parameter, not as prose', async () => {
    // Named in a sentence, a fragment is invisible to everything that reads a contract rather than a
    // page: a generated client, a form, a test.
    const operation = operationFromRoute(routeWith({ resource }))

    expect(operation.parameters).toEqual([
      expect.objectContaining({ name: 'view', in: 'query', schema: { type: 'string', enum: ['summary'] } })
    ])
  })

  it('advertises the parameter the application actually answers to', async () => {
    // A contract naming `?view=` for an API that answers `?only=` is worse than saying nothing.
    const operation = operationFromRoute(routeWith({ resource }), { fragmentParam: 'only' })

    expect(operation.parameters?.[0]).toMatchObject({ name: 'only' })
  })

  it('adds no parameter when a resource exposes no fragment', async () => {
    const plain = { schema: () => userSchema }

    expect(operationFromRoute(routeWith({ resource: plain })).parameters).toBeUndefined()
  })

  it('reads a resource the route named, through the registry the runtime uses', async () => {
    const operation = operationFromRoute(routeWith({ resource: 'user' }), { resources: { user: resource } })

    expect(operation.responses?.[200]).toMatchObject({ schema: userSchema })
  })

  it('builds a resource class through the container, so an injected schema is readable', async () => {
    class UserResource {
      schema (): unknown { return userSchema }
    }

    const operation = operationFromRoute(
      routeWith({ resource: UserResource }),
      { resolve: (Klass: any) => new Klass() }
    )

    expect(operation.responses?.[200]).toMatchObject({ schema: userSchema })
  })

  it('omits the response rather than inventing one it could not read', async () => {
    // A wrong contract is worse than a missing one: a client is generated from this.
    class Unbuildable {
      constructor () { throw new Error('needs a service nobody gave it') }
      schema (): unknown { return userSchema }
    }

    expect(operationFromRoute(routeWith({ resource: Unbuildable })).responses).toBeUndefined()
    expect(operationFromRoute(routeWith({ resource: 'unknown' })).responses).toBeUndefined()
    expect(operationFromRoute(routeWith({})).responses).toBeUndefined()
  })

  it('lets an explicit declaration win, because an author who wrote it meant it', async () => {
    const operation = operationFromRoute(routeWith({
      resource,
      contract: { responses: { 204: { description: 'No content' } } }
    }))

    expect(operation.responses).toEqual({ 204: { description: 'No content' } })
  })
})

describe('an undocumented payload is reported, not hidden', () => {
  const routeAt = (options: Record<string, unknown>): any => ({
    path: '/users',
    method: 'GET',
    getOption: <T>(key: string): T => options[key] as T
  })

  it('says which route named a resource nobody registered', () => {
    // Omitting a contract we could not build is right; doing it silently means an endpoint ships
    // undocumented and the document looks complete.
    const skipped: any[] = []

    operationFromRoute(routeAt({ resource: 'ghost' }), { resources: {}, onSkipped: (s) => skipped.push(s) })

    expect(skipped[0]).toMatchObject({ route: 'GET /users', concern: 'resource' })
    expect(skipped[0].reason).toContain("'ghost'")
  })

  it('says when a schema could not be read at all', () => {
    // The common cause: a contract whose schema() needs a real context. It is read with an empty one,
    // because a contract describes what any caller may see.
    class NeedsContext {
      schema (context: any): unknown { return context.principal.id }
    }
    const skipped: any[] = []

    operationFromRoute(routeAt({ resource: NeedsContext }), {
      resolve: (Klass: any) => new Klass(),
      onSkipped: (s) => skipped.push(s)
    })

    expect(skipped[0].reason).toContain('could not be read')
  })

  it('says when the declared resource publishes no schema', () => {
    const skipped: any[] = []

    operationFromRoute(routeAt({ resource: { notAResource: true } }), { onSkipped: (s) => skipped.push(s) })

    expect(skipped[0].reason).toContain('publishes no schema()')
  })

  it('reports nothing when a route simply declares nothing', () => {
    const skipped: any[] = []

    operationFromRoute(routeAt({}), { onSkipped: (s) => skipped.push(s) })

    expect(skipped).toEqual([])
  })
})

describe('the path a route is documented under', () => {
  // A real `Route`, because that is where the defect lived: its `path` is the pathname of the event
  // it is answering, so with nothing bound it is `/`. The stubs above pass a path in, which is why a
  // suite could stay green while every documented endpoint collapsed onto the root.
  const realRoute = async (options: Record<string, unknown>): Promise<any> => {
    const { Route } = await import('@stone-js/router')
    return Route.create({ method: 'GET', handler: () => 'ok', ...options } as any)
  }

  it('documents the template a route declares, not the URL it happens to be answering', async () => {
    const route = await realRoute({ path: '/tasks/:id', contract: { summary: 'One task' } })
    expect(route.path).toBe('/') // what the old derivation read

    const [documented] = routesFromRouter(router(route))

    expect(documented.path).toBe('/tasks/{id}')
  })

  it('translates the router syntax into the one a contract speaks', async () => {
    const route = await realRoute({ path: '/users/:userId/posts/:postId', contract: {} })

    expect(routesFromRouter(router(route))[0].path).toBe('/users/{userId}/posts/{postId}')
  })

  it('declares every parameter the template requires, or the document is invalid', async () => {
    // A template naming `{id}` with no parameter object is rejected by every reader of the spec.
    const route = await realRoute({ path: '/tasks/:id', contract: {} })

    const [documented] = routesFromRouter(router(route))

    expect(documented.openapi?.parameters).toEqual([
      { name: 'id', in: 'path', required: true, schema: { type: 'string' } }
    ])
  })

  it('keeps the parameter name when a rule constrains it', async () => {
    const route = await realRoute({ path: '/tasks/:id(\\d+)', contract: {} })

    expect(routesFromRouter(router(route))[0].path).toBe('/tasks/{id}')
  })

  it('publishes both paths for an optional segment, since neither one alone is true', async () => {
    // OpenAPI has no optional path parameter. Two honest paths beat one that claims to require a
    // segment a caller may leave out, which is the localized-prefix case exactly.
    const route = await realRoute({ path: '/:lang?/about', contract: {} })

    const paths = routesFromRouter(router(route)).map((documented) => documented.path)

    expect(paths).toEqual(['/{lang}/about', '/about'])
  })
})

describe('what an author writes over what was derived', () => {
  const resource = { schema: () => ({ toJSONSchema: () => ({ type: 'object' }) }) }

  it('adds a status without deleting the one that was derived', async () => {
    // The defect this replaces: the explicit block was spread over the whole operation, so
    // documenting a 404 deleted the derived success response. Nobody writing a 404 means "and forget
    // what you knew".
    const operation = operationFromRoute(route('/tasks', 'GET', {
      resource,
      contract: { responses: { 404: { description: 'No such task' } } }
    }))

    expect(Object.keys(operation.responses ?? {})).toEqual(['200', '404'])
  })

  it('lets an author override the derived status itself', async () => {
    const operation = operationFromRoute(route('/tasks', 'GET', {
      resource,
      contract: { responses: { 200: { description: 'Mine' } } }
    }))

    expect(operation.responses?.[200].description).toBe('Mine')
  })

  it('keeps the derived parameters when an author adds one', async () => {
    const operation = operationFromRoute(
      route('/tasks', 'GET', { resource, contract: { parameters: [{ name: 'page', in: 'query' }] } }),
      {},
      [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }]
    )

    expect(operation.parameters?.map((parameter: any) => parameter.name)).toEqual(['id', 'page'])
  })

  it('publishes the status the handler actually answers with', async () => {
    // A handler carrying `@JsonHttpResponse(201)` said so once. A contract publishing 200 for it
    // contradicts the code it was derived from, so a generated client waits for the wrong status.
    const operation = operationFromRoute(route('/tasks', 'POST', { resource, statusCode: 201 }))

    expect(Object.keys(operation.responses ?? {})).toEqual(['201'])
  })
})

describe('describing a response the derivation already found', () => {
  const resource = { schema: () => ({ toJSONSchema: () => ({ type: 'object' }) }) }

  it('keeps the schema when the author describes that same status', async () => {
    // Found in a deployed contract: 27 of 29 responses had no payload at all, and the two that did
    // were the only ones nobody had documented. Writing `200: { description }` was being read as
    // "replace the success", so describing an endpoint carefully was what emptied it.
    const operation = operationFromRoute(route('/me', 'GET', {
      resource,
      contract: { responses: { 200: { description: 'The account' } } }
    }))

    expect(operation.responses?.[200].description).toBe('The account')
    expect(operation.responses?.[200].schema).toBeDefined()
  })

  it('still replaces the derived success when the author names a different one', async () => {
    const operation = operationFromRoute(route('/me', 'DELETE', {
      resource,
      contract: { responses: { 204: { description: 'No content' } } }
    }))

    expect(Object.keys(operation.responses ?? {})).toEqual(['204'])
  })

  it('adds an error status without touching the derived success', async () => {
    const operation = operationFromRoute(route('/me', 'GET', {
      resource,
      contract: { responses: { 401: { description: 'No token' } } }
    }))

    expect(Object.keys(operation.responses ?? {}).sort()).toEqual(['200', '401'])
    expect(operation.responses?.[200].schema).toBeDefined()
  })
})

describe('a route that declares what it answers with', () => {
  const resource = { schema: () => ({ toJSONSchema: () => ({ type: 'object' }) }) }

  it('documents the status the route declared, since that is what builds the answer', () => {
    // `@Post('/tasks', { response: { type: 'json', status: 201 } })` says it once. The document and
    // the response are then the same statement rather than two.
    const operation = operationFromRoute(route('/tasks', 'POST', { resource, response: { type: 'json', status: 201 } }))

    expect(Object.keys(operation.responses ?? {})).toEqual(['201'])
  })

  it('prefers it over a bare statusCode, being the more complete declaration', () => {
    const operation = operationFromRoute(route('/tasks', 'POST', { resource, statusCode: 200, response: { status: 202 } }))

    expect(Object.keys(operation.responses ?? {})).toEqual(['202'])
  })
})
