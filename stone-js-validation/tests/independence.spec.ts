import { Validate } from '../src/decorators/Validate'
import { VALIDATE_KEY, VALIDATION_SCHEMA_KEY } from '../src/decorators/constants'
import { ValidationSchema } from '../src/decorators/ValidationSchema'
import { defineValidationSchema, isValidationSchema, isValidationSchemaClass, rulesOf } from '../src/schemaClass'
import { ValidateRouteMiddleware } from '../src/middleware/ValidateRouteMiddleware'
import { getBlueprint, getMetadata, hasMetadata } from '@stone-js/core'

const NameSchema = {
  validate: (data: any) => (
    typeof data?.name === 'string'
      ? { success: true as const, value: { name: data.name } }
      : { success: false as const, issues: [{ message: 'name is required', path: ['name'] }] }
  )
}

/** A schema class whose rules depend on an injected service, which is the reason to have classes. */
@ValidationSchema('createUser')
class CreateUserSchema {
  private readonly greeting: string
  constructor ({ i18n }: { i18n: { t: (k: string) => string } }) {
    this.greeting = i18n.t('validation.name')
  }

  rules (): any {
    return {
      body: {
        validate: (data: any) => (
          typeof data?.name === 'string'
            ? { success: true as const, value: { name: data.name, message: this.greeting } }
            : { success: false as const, issues: [{ message: this.greeting, path: ['name'] }] }
        )
      }
    }
  }
}

const makeEvent = (body: unknown, route?: any, handler?: any): any => {
  const metadata: Record<string, unknown> = {}
  return {
    body,
    get: (key: string) => (key === 'body' ? body : metadata[key]),
    getRoute: () => (route === undefined && handler === undefined
      ? undefined
      : { getOption: (k: string) => (k === 'handler' ? handler : route) }),
    setMetadataValue: (values: Record<string, unknown>) => Object.assign(metadata, values),
    getMetadataValue: (key: string) => metadata[key]
  }
}

const next = vi.fn(async () => 'response' as any)
const blueprint = (schemas?: Record<string, unknown>, eventHandler?: unknown): any => ({
  get: (key: string, fallback: unknown) => {
    if (key === 'stone.kernel.eventHandler') return eventHandler ?? fallback
    return schemas === undefined ? fallback : { schemas }
  }
})

describe('@Validate: the module owns its key, so it needs no router', () => {
  it('records the declaration on the handler method', () => {
    class UserController {
      @Validate(NameSchema)
      create (): void {}
    }

    expect(hasMetadata(UserController, VALIDATE_KEY)).toBe(true)
    expect(getMetadata<any, any[]>(UserController, VALIDATE_KEY, [])).toEqual([
      { action: 'create', validation: NameSchema }
    ])
  })

  it('validates a routed request from the handler metadata, with no route option at all', async () => {
    class UserController {
      @Validate(NameSchema)
      create (): void {}
    }

    const middleware = new ValidateRouteMiddleware({ blueprint: blueprint() })
    const event = makeEvent({ name: 'Ada', role: 'admin' }, undefined, { module: UserController, action: 'create' })

    await middleware.handle(event, next)

    expect(event.get('validatedBody')).toEqual({ name: 'Ada' })
  })

  it('validates with no router in play, reading the application event handler', async () => {
    // A single-handler service, a CLI command, a browser event: same module, same result.
    class Handler {
      @Validate(NameSchema)
      handle (): void {}
    }

    const middleware = new ValidateRouteMiddleware({
      blueprint: blueprint(undefined, { module: Handler, action: 'handle' })
    })
    const event = makeEvent({ name: 'Grace' })

    await middleware.handle(event, next)

    expect(event.get('validatedBody')).toEqual({ name: 'Grace' })
  })

  it('lets the route option win, since a route is the single description of itself', async () => {
    class UserController {
      @Validate({ body: { validate: () => ({ success: true as const, value: 'from-method' }) } })
      create (): void {}
    }

    const middleware = new ValidateRouteMiddleware({ blueprint: blueprint() })
    const event = makeEvent({ name: 'Ada' }, NameSchema, { module: UserController, action: 'create' })

    await middleware.handle(event, next)

    expect(event.get('validatedBody')).toEqual({ name: 'Ada' })
  })
})

describe('schema classes', () => {
  it('are discovered into the registry by the same scan the router uses', async () => {
    const set = vi.fn()
    const context: any = {
      modules: [CreateUserSchema, class Unrelated {}],
      blueprint: { set, get: (_k: string, f: unknown) => f }
    }

    expect(context.modules.length).toBeGreaterThan(0)
    expect(hasMetadata(CreateUserSchema, VALIDATION_SCHEMA_KEY)).toBe(true)
    expect(getBlueprint(CreateUserSchema as any).stone.validation.schemas).toEqual({ createUser: CreateUserSchema })
  })

  it('falls back to the class name when no alias is given', async () => {
    // `@ValidationSchema()` with no name is the common case: the class name IS the alias.
    @ValidationSchema()
    class AddressSchema { rules (): any { return { body: NameSchema } } }

    expect(getBlueprint(AddressSchema as any).stone.validation.schemas).toEqual({ AddressSchema })
  })

  it('leaves an undecorated class alone, carrying nothing', () => {
    class Unrelated {}

    expect(hasMetadata(Unrelated as any, VALIDATION_SCHEMA_KEY)).toBe(false)
  })

  it('are resolved through the container, so rules() can use injected services', async () => {
    // The reason classes exist: translated messages without a second method for them.
    const container: any = { resolve: (Class: any) => new Class({ i18n: { t: () => 'translated' } }) }
    const middleware = new ValidateRouteMiddleware({
      blueprint: blueprint({ createUser: CreateUserSchema }),
      container
    })
    const event = makeEvent({ name: 'Ada' }, 'createUser')

    await middleware.handle(event, next)

    expect(event.get('validatedBody')).toEqual({ name: 'Ada', message: 'translated' })
  })

  it('still work with no container, so the frontend can use the very same class', async () => {
    const middleware = new ValidateRouteMiddleware({ blueprint: blueprint({ createUser: class {
      rules (): any { return { body: NameSchema } }
    } }) })
    const event = makeEvent({ name: 'Ada' }, 'createUser')

    await middleware.handle(event, next)

    expect(event.get('validatedBody')).toEqual({ name: 'Ada' })
  })

  it('reads the single declaration of a handler that has no named action', async () => {
    // A functional application handler is one thing, not a controller with methods.
    class Handler {
      @Validate(NameSchema)
      handle (): void {}
    }

    const middleware = new ValidateRouteMiddleware({
      blueprint: blueprint(undefined, { module: Handler })
    })
    const event = makeEvent({ name: 'Ada' })

    await middleware.handle(event, next)

    expect(event.get('validatedBody')).toEqual({ name: 'Ada' })
  })

  it('recognises classes, instances and plain schemas apart', () => {
    expect(isValidationSchemaClass(CreateUserSchema)).toBe(true)
    expect(isValidationSchemaClass(NameSchema)).toBe(false)
    expect(isValidationSchema({ rules: () => ({}) })).toBe(true)
    expect(isValidationSchema(NameSchema)).toBe(false)
  })

  it('has an imperative counterpart with the same dependencies', () => {
    const schema = defineValidationSchema(({ i18n }: any) => ({ body: { validate: () => ({ success: true as const, value: i18n.t('x') }) } }))
    const built = schema({ i18n: { t: () => 'hello' } })

    expect(isValidationSchema(built)).toBe(true)
    expect(rulesOf(built).body.validate(undefined)).toEqual({ success: true, value: 'hello' })
  })
})
