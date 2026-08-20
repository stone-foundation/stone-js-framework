import { z } from 'zod'
import { Resource } from '../src/Resource'
import { defineResource } from '../src/defineResource'
import { ResourceContext } from '../src/declarations'
import { ResourceContractError } from '../src/errors/ResourceContractError'

interface User { id: number, name: string, passwordHash: string }

const ada: User = { id: 1, name: 'Ada', passwordHash: 'do-not-leak' }
const grace: User = { id: 2, name: 'Grace', passwordHash: 'do-not-leak' }

/** The engine an application already validates its input with, in the shape a resource consumes. */
const validator = {
  validate: <T>(schema: any, data: unknown) => {
    const result = schema.safeParse(data)
    return result.success
      ? { success: true, value: result.data as T }
      : {
          success: false,
          issues: result.error.issues.map((issue: any) => ({ message: issue.message, path: issue.path }))
        }
  }
}

const context = (extra: ResourceContext = {}): ResourceContext => ({ validator, ...extra })

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

  it('refuses to pretend it checked when no validator is available', async () => {
    // Silently skipping validation would make every guarantee above a lie.
    await expect(new UserResource().item(ada, {})).rejects.toThrow(/no validator was available/)
  })
})

describe('the imperative form declares the same things', () => {
  const userResource = defineResource<User>({
    schema: z.object({ id: z.number(), name: z.string() }),
    fragments: { summary: z.object({ id: z.number() }) },
    data: async (user) => ({ ...user, name: user.name.toUpperCase() })
  }, { validator })

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
    }, { validator })

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
    }, { validator })

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
    }, { validator })

    await expect(resource.item(ada, { fragment: 'brief', principal: 'admin' }))
      .resolves.toEqual({ id: 1, name: 'Ada' })
    await expect(resource.item(ada, { fragment: 'brief', principal: 'guest' }))
      .resolves.toEqual({ id: 1 })
  })
})
