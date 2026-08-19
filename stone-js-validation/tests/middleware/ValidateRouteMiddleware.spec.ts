import { ValidationError } from '../../src/errors/ValidationError'
import { ValidateRouteMiddleware, MetaValidateRouteMiddleware } from '../../src/middleware/ValidateRouteMiddleware'

/** A schema that coerces, so a test can prove the parsed value is what reaches the handler. */
const NumberSchema = {
  validate: (data: unknown) => {
    const value = Number(data)
    return Number.isNaN(value)
      ? { success: false as const, issues: [{ message: 'not a number', path: [] }] }
      : { success: true as const, value }
  }
}

const StrictUser = {
  validate: (data: any) => (
    typeof data?.name === 'string'
      ? { success: true as const, value: { name: data.name } } // strips everything else
      : { success: false as const, issues: [{ message: 'name is required', path: ['name'] }] }
  )
}

/**
 * An event shaped like the real ones: `body`, `query` and `params` are whole sources, and `get`
 * falls back to metadata, which is what makes `event.get('validatedBody')` work with no helper.
 */
const PageSchema = {
  validate: (data: any) => {
    const page = Number(data?.page)
    return Number.isNaN(page)
      ? { success: false as const, issues: [{ message: 'page must be a number', path: ['page'] }] }
      : { success: true as const, value: { page } }
  }
}

const makeEvent = (sources: Record<string, unknown>, validation?: unknown): any => {
  const metadata: Record<string, unknown> = {}
  return {
    ...sources,
    get: (key: string) => (sources as any)[key] ?? metadata[key],
    getRoute: () => (validation === undefined ? undefined : { getOption: () => validation }),
    setMetadataValue: (values: Record<string, unknown>) => Object.assign(metadata, values),
    getMetadataValue: (key: string) => metadata[key]
  }
}

const blueprintWith = (schemas?: Record<string, unknown>): any => ({
  get: (_key: string, fallback: unknown) => (schemas === undefined ? fallback : { schemas })
})

const next = vi.fn(async () => 'response' as any)

describe('ValidateRouteMiddleware', () => {
  beforeEach(() => next.mockClear())

  it('does nothing when the route declares no validation', async () => {
    // Enabling validation must cost an application that does not use it nothing but a passthrough.
    const middleware = new ValidateRouteMiddleware({ blueprint: blueprintWith() })
    const event = makeEvent({ body: { name: 'anything' } })

    await expect(middleware.handle(event, next)).resolves.toBe('response')
    expect(event.get('validatedBody')).toBeUndefined()
  })

  it('does nothing when the event carries no route at all', async () => {
    // The kernel is agnostic: an application with no router still runs this middleware.
    const middleware = new ValidateRouteMiddleware({ blueprint: blueprintWith() })
    const event: any = { get: () => undefined, setMetadataValue: vi.fn(), getMetadataValue: () => undefined }

    await expect(middleware.handle(event, next)).resolves.toBe('response')
    expect(event.setMetadataValue).not.toHaveBeenCalled()
  })

  it('a bare schema validates the body, which is what a route naming one schema means', async () => {
    const middleware = new ValidateRouteMiddleware({ blueprint: blueprintWith() })
    const event = makeEvent({ body: { name: 'Ada', role: 'admin' } }, StrictUser)

    await middleware.handle(event, next)

    expect(event.get('validatedBody')).toEqual({ name: 'Ada' })
  })

  it('publishes each PARSED source under a predictable name, readable with no helper', async () => {
    // The whole point: a schema coerces and strips, and the handler reads what it produced with
    // `event.get('validatedBody')`, nothing to import and nothing to remember.
    const middleware = new ValidateRouteMiddleware({ blueprint: blueprintWith() })
    const event = makeEvent(
      { body: { name: 'Ada', role: 'admin' }, query: new URLSearchParams('page=2') },
      { body: StrictUser, query: PageSchema }
    )

    await middleware.handle(event, next)

    expect(event.get('validatedBody')).toEqual({ name: 'Ada' })
    expect(event.get('validatedQuery')).toEqual({ page: 2 })
    expect(next).toHaveBeenCalledOnce()
  })

  it('throws with every issue at once, and never reaches the handler', async () => {
    const middleware = new ValidateRouteMiddleware({ blueprint: blueprintWith() })
    const event = makeEvent({ body: {}, query: new URLSearchParams('page=nope') }, { body: StrictUser, query: PageSchema })

    await expect(middleware.handle(event, next)).rejects.toThrow(ValidationError)
    expect(next).not.toHaveBeenCalled()
  })

  it('resolves a rule set named on the route from the registry', async () => {
    const middleware = new ValidateRouteMiddleware({
      blueprint: blueprintWith({ createUser: { body: StrictUser } })
    })
    const event = makeEvent({ body: { name: 'Ada', role: 'admin' } }, 'createUser')

    await middleware.handle(event, next)

    expect(event.get('validatedBody')).toEqual({ name: 'Ada' })
  })

  it('fails loudly when the route names a rule set nobody registered', async () => {
    // Validating nothing is the one outcome a validator must never have, so an unknown name is an
    // error rather than a silent passthrough.
    const middleware = new ValidateRouteMiddleware({ blueprint: blueprintWith({}) })
    const event = makeEvent({ body: {} }, 'doesNotExist')

    await expect(middleware.handle(event, next)).rejects.toThrow(/no rule set is registered/)
    expect(next).not.toHaveBeenCalled()
  })

  it('fails the same way when the bucket exists but declares no registry at all', async () => {
    // `stone.validation` is always present once the module is enabled; `schemas` is not.
    const middleware = new ValidateRouteMiddleware({ blueprint: { get: () => ({}) } as any })
    const event = makeEvent({ body: {} }, 'createUser')

    await expect(middleware.handle(event, next)).rejects.toThrow(/no rule set is registered/)
  })

  it('is registered as a class pipe, ahead of application middleware', () => {
    expect(MetaValidateRouteMiddleware).toEqual(
      expect.objectContaining({ module: ValidateRouteMiddleware, isClass: true, priority: 5 })
    )
  })
})
