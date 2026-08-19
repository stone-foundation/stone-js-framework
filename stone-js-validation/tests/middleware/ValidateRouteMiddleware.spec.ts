import { validated } from '../../src/helpers'
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

const makeEvent = (values: Record<string, unknown>, validation?: unknown): any => {
  const metadata: Record<string, unknown> = {}
  return {
    get: (key: string) => values[key],
    getRoute: () => (validation === undefined ? undefined : { getOption: () => validation }),
    setMetadataValue: (key: string, value: unknown) => { metadata[key] = value },
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
    const event = makeEvent({ body: 'anything' })

    await expect(middleware.handle(event, next)).resolves.toBe('response')
    expect(validated(event)).toBeUndefined()
  })

  it('does nothing when the event carries no route at all', async () => {
    // The kernel is agnostic: an application with no router still runs this middleware.
    const middleware = new ValidateRouteMiddleware({ blueprint: blueprintWith() })
    const event: any = { get: () => undefined, setMetadataValue: vi.fn(), getMetadataValue: () => undefined }

    await expect(middleware.handle(event, next)).resolves.toBe('response')
    expect(event.setMetadataValue).not.toHaveBeenCalled()
  })

  it('publishes the PARSED value, not the raw input', async () => {
    // The whole point: a schema coerces and strips. A handler reading the raw input again would use
    // the string "42" and the extra key the schema deliberately dropped.
    const middleware = new ValidateRouteMiddleware({ blueprint: blueprintWith() })
    const event = makeEvent(
      { id: '42', body: { name: 'Ada', role: 'admin' } },
      { id: NumberSchema, body: StrictUser }
    )

    await middleware.handle(event, next)

    expect(validated(event)).toEqual({ id: 42, body: { name: 'Ada' } })
    expect(next).toHaveBeenCalledOnce()
  })

  it('throws with every issue at once, and never reaches the handler', async () => {
    const middleware = new ValidateRouteMiddleware({ blueprint: blueprintWith() })
    const event = makeEvent({ id: 'nope', body: {} }, { id: NumberSchema, body: StrictUser })

    await expect(middleware.handle(event, next)).rejects.toThrow(ValidationError)
    expect(next).not.toHaveBeenCalled()
  })

  it('resolves a rule set named on the route from the registry', async () => {
    const middleware = new ValidateRouteMiddleware({
      blueprint: blueprintWith({ createUser: { body: StrictUser } })
    })
    const event = makeEvent({ body: { name: 'Ada', role: 'admin' } }, 'createUser')

    await middleware.handle(event, next)

    expect(validated(event)).toEqual({ body: { name: 'Ada' } })
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
