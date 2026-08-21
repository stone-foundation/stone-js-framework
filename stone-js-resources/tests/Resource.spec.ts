import { z } from 'zod'
import { Resource } from '../src/Resource'
import { defineResource } from '../src/defineResource'
import { ResourceContext } from '../src/declarations'
import { ResourceContractError } from '../src/errors/ResourceContractError'

interface User { id: number, name: string, passwordHash: string }

const ada: User = { id: 1, name: 'Ada', passwordHash: 'do-not-leak' }
const grace: User = { id: 2, name: 'Grace', passwordHash: 'do-not-leak' }

const context = (extra: ResourceContext = {}): ResourceContext => extra

class UserResource extends Resource<User> {
  schema (): unknown {
    return z.object({ id: z.number(), name: z.string() })
  }

  fragments (): Record<string, unknown> {
    return { summary: z.object({ id: z.number() }) }
  }
}

describe('a resource projects through the contract it publishes', () => {
  it('exposes what the schema describes, and nothing else', async () => {
    // The reason the module exists: the model carries a field that must never leave, and the schema —
    // not a hand-written mapping anyone can forget to update — is what decides.
    const output: any = await new UserResource().item(ada, context())

    expect(output).toEqual({ id: 1, name: 'Ada' })
    expect(output).not.toHaveProperty('passwordHash')
  })

  it('keeps a field out even when the model gains it later', async () => {
    // A projection written as code has to be edited when the model grows. A schema does not.
    const grown = { ...ada, internalScore: 42, apiToken: 'secret' }

    await expect(new UserResource().item(grown as any, context())).resolves.toEqual({ id: 1, name: 'Ada' })
  })

  it('projects a collection', async () => {
    await expect(new UserResource().collection([ada, grace], context()))
      .resolves.toEqual([{ id: 1, name: 'Ada' }, { id: 2, name: 'Grace' }])
  })

  it('answers a requested fragment with the fragment contract', async () => {
    // A fragment is a contract of its own, which is what makes `?view=summary` safe to expose.
    await expect(new UserResource().item(ada, context({ fragment: 'summary' })))
      .resolves.toEqual({ id: 1 })
  })

  it('falls back to the full contract when a caller invents a fragment', async () => {
    // A caller guessing is asking a question, not attacking; the documented shape is a better answer
    // than a server error.
    await expect(new UserResource().item(ada, context({ fragment: 'nonsense' })))
      .resolves.toEqual({ id: 1, name: 'Ada' })
  })

  it('narrows to a sparse fieldset after the contract was checked', async () => {
    // Order matters: the promise is held against everything produced, then narrowed. Checking after
    // narrowing would mean a query parameter could hide a broken contract.
    await expect(new UserResource().item(ada, context({ fields: ['id'] })))
      .resolves.toEqual({ id: 1 })
  })

  it('wraps in an envelope, with metadata when given', async () => {
    await expect(new UserResource().response([ada], context(), { total: 1 }))
      .resolves.toEqual({ data: [{ id: 1, name: 'Ada' }], meta: { total: 1 } })
    await expect(new UserResource().response(ada, context()))
      .resolves.toEqual({ data: { id: 1, name: 'Ada' } })
  })
})

describe('completing a model before it meets the contract', () => {
  class EnrichedResource extends Resource<User> {
    schema (): unknown {
      return z.object({ id: z.number(), name: z.string(), posts: z.array(z.string()) })
    }

    async data (user: User): Promise<unknown> {
      // Reaching a service is the point: a projection often needs more than the model it was handed.
      return { ...user, posts: await Promise.resolve(['first', 'second']) }
    }
  }

  it('awaits the hook, and validates what it produced', async () => {
    await expect(new EnrichedResource().item(ada, context()))
      .resolves.toEqual({ id: 1, name: 'Ada', posts: ['first', 'second'] })
  })

  it('never silently yields an empty object for an async projection', async () => {
    // The old synchronous path turned a promise into `{}` without a word, which is the failure this
    // asserts is gone.
    const output = await new EnrichedResource().item(ada, context())

    expect(output).not.toEqual({})
    expect(Object.keys(output)).toContain('posts')
  })
})

describe('the contract is protected, not merely documented', () => {
  class BrokenResource extends Resource<User> {
    schema (): unknown {
      return z.object({ id: z.number(), name: z.string(), email: z.string() })
    }
  }

  it('refuses to answer when the data breaks the promise', async () => {
    // A caller cannot detect a broken contract, and a client generated from it breaks on the field
    // that is missing. Answering anyway is the failure.
    await expect(new BrokenResource().item(ada, context())).rejects.toThrow(ResourceContractError)
  })

  it('says which field, not just "validation failed"', async () => {
    await expect(new BrokenResource().item(ada, context())).rejects.toThrow(/email/)
  })

  it('carries the issues, so a log is actionable', async () => {
    await new BrokenResource().item(ada, context()).catch((error: ResourceContractError) => {
      expect(error.issues[0]).toMatchObject({ path: ['email'] })
    })
  })

  it('can choose availability over integrity, explicitly', async () => {
    // Configured, never the default: the breach still reaches the log.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const output = await new BrokenResource().item(ada, context({ onViolation: 'warn' }))

    expect(output).toMatchObject({ id: 1 })
    expect(warn).toHaveBeenCalledOnce()
    warn.mockRestore()
  })

  it('checks with nothing injected, so exposing data needs no validation module', async () => {
    // The module reads schemas itself. Requiring another module to be enabled before an app could
    // expose data was coupling with nothing to show for it.
    await expect(new UserResource().item(ada, {})).resolves.toEqual({ id: 1, name: 'Ada' })
  })

  it('refuses a value it cannot run rather than reporting success', async () => {
    // Silently passing an unrunnable schema would make every guarantee above a lie.
    class Bogus extends Resource<User> {
      schema (): unknown { return { notASchema: true } }
    }

    await expect(new Bogus().item(ada, {})).rejects.toThrow(/must be runnable/)
  })
})

describe('the imperative form declares the same things', () => {
  const userResource = defineResource<User>({
    schema: z.object({ id: z.number(), name: z.string() }),
    fragments: { summary: z.object({ id: z.number() }) },
    data: async (user) => ({ ...user, name: user.name.toUpperCase() })
  })

  it('projects, completes and fragments exactly as a class does', async () => {
    await expect(userResource.item(ada)).resolves.toEqual({ id: 1, name: 'ADA' })
    await expect(userResource.item(ada, { fragment: 'summary' })).resolves.toEqual({ id: 1 })
  })

  it('accepts a schema built from the context', async () => {
    // A contract may depend on who is asking: an admin sees a field a visitor does not.
    const resource = defineResource<User>({
      schema: (ctx) => ctx.principal === 'admin'
        ? z.object({ id: z.number(), passwordHash: z.string() })
        : z.object({ id: z.number() })
    })

    await expect(resource.item(ada, { principal: 'admin' })).resolves.toHaveProperty('passwordHash')
    await expect(resource.item(ada, { principal: 'guest' })).resolves.toEqual({ id: 1 })
  })
})

describe('conditional fields inside a projection', () => {
  class ConditionalResource extends Resource<User> {
    schema (): unknown {
      return z.object({ id: z.number(), email: z.string().optional(), posts: z.array(z.string()).optional() })
    }

    async data (user: User, ctx: any): Promise<unknown> {
      return {
        id: user.id,
        // Two ways to say "only sometimes": a plain condition, and one driven by `?include=`.
        email: this.when(ctx.principal === 'self', () => 'ada@example.test'),
        posts: this.whenIncluded(ctx, 'posts', () => ['first'])
      }
    }
  }

  it('drops a conditional field rather than exposing it as null', async () => {
    await expect(new ConditionalResource().item(ada, context())).resolves.toEqual({ id: 1 })
  })

  it('includes it when the condition holds', async () => {
    await expect(new ConditionalResource().item(ada, context({ principal: 'self' })))
      .resolves.toEqual({ id: 1, email: 'ada@example.test' })
  })

  it('includes a relation only when the caller asked for it', async () => {
    await expect(new ConditionalResource().item(ada, context({ include: ['posts'] })))
      .resolves.toEqual({ id: 1, posts: ['first'] })
  })

  it('evaluates the lazy factory only when it is included', async () => {
    // A relation that costs a query must not be fetched to be thrown away.
    const fetch = vi.fn(() => ['first'])
    const resource = defineResource<User>({
      schema: z.object({ id: z.number(), posts: z.array(z.string()).optional() }),
      data: (user, ctx) => ({ id: user.id, posts: ctx.include?.includes('posts') === true ? fetch() : undefined })
    })

    await resource.item(ada)
    expect(fetch).not.toHaveBeenCalled()

    await resource.item(ada, { include: ['posts'] })
    expect(fetch).toHaveBeenCalledOnce()
  })

  it('accepts fragments built from the context', async () => {
    const resource = defineResource<User>({
      schema: z.object({ id: z.number(), name: z.string() }),
      fragments: (ctx) => ctx.principal === 'admin'
        ? { brief: z.object({ id: z.number(), name: z.string() }) }
        : { brief: z.object({ id: z.number() }) }
    })

    await expect(resource.item(ada, { fragment: 'brief', principal: 'admin' }))
      .resolves.toEqual({ id: 1, name: 'Ada' })
    await expect(resource.item(ada, { fragment: 'brief', principal: 'guest' }))
      .resolves.toEqual({ id: 1 })
  })
})

describe('a resource the container builds', () => {
  // The real container, because the defect only exists there: it hands a class itself, answers any
  // property by resolving a service of that name, and throws when nothing is bound. An optional
  // dependency read straight off it crashed every `@ApiResource` the container resolved, on a
  // service nobody was ever told to register.
  const containerOf = async (bindings: Record<string, unknown> = {}): Promise<any> => {
    const { Container } = await import('@stone-js/service-container')
    const { MetaContractChecker } = await import('../src/options/ResourcesBlueprint')
    const container = Container.create()
    // Exactly what the module's blueprint contributes, and the reason a resource's constructor can
    // simply ask for its checker.
    container.autoBinding(MetaContractChecker.module, MetaContractChecker.module, true, MetaContractChecker.alias)
    Object.entries(bindings).forEach(([key, value]) => container.instance(key, value))
    return container
  }

  it('resolves, because the module binds what its resources ask for', async () => {
    // The defect this replaces: the base read an optional `checker` off the container, which resolves
    // any name it is asked for and throws when nothing is bound, so an optional dependency behaved as
    // a required one and every container-resolved resource failed. The fix is the registration.
    const container = await containerOf()

    const resource = container.resolve(UserResource, true)

    await expect(resource.item(ada)).resolves.toEqual({ id: 1, name: 'Ada' })
  })

  it('hands the same instance out twice, because a resource is a singleton service', async () => {
    const container = await containerOf()

    expect(container.resolve(UserResource, true)).toBe(container.resolve(UserResource, true))
  })

  it('lets an application substitute the dialect by binding its own first', async () => {
    // How substitution actually works: `autoBinding` leaves an existing binding alone, so an
    // application that binds the checker key before the module's blueprint does keeps its own. The
    // point was never to stop reading the container, it was to stop reading names nobody bound.
    const calls: unknown[] = []
    const { Container } = await import('@stone-js/service-container')
    const { ContractChecker } = await import('../src/ContractChecker')
    const { MetaContractChecker } = await import('../src/options/ResourcesBlueprint')

    const container = Container.create()
    container.instance(ContractChecker, {
      check: (_schema: any, data: unknown) => { calls.push(data); return { success: true, value: { id: 1 } } }
    })
    container.autoBinding(MetaContractChecker.module, MetaContractChecker.module, true, MetaContractChecker.alias)

    await expect((container.resolve(UserResource, true) as any).item(ada)).resolves.toEqual({ id: 1 })
    expect(calls).toHaveLength(1)
  })

  it('reads an explicit object as an object, for the imperative form', async () => {
    const resource = defineResource<User>({ schema: z.object({ id: z.number() }) }, { onViolation: 'warn' })

    await expect(resource.item(ada)).resolves.toEqual({ id: 1 })
  })
})
