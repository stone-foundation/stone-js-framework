import { defineResource, IResource, Resource, ResourceContext, ResourceOutput } from '@stone-js/resources'

interface Account { id: number, secret: string }
interface Actor { actorId: string }
interface Event { url: string }

/**
 * A resource that types who is asking and what it is answering.
 *
 * Compiled under `strictFunctionTypes` and `exactOptionalPropertyTypes`, which is what an application
 * with a strict configuration turns on. A property-typed hook is contravariant on its parameters, so
 * narrowing the context in a subclass used to be rejected outright: the type parameters exist so the
 * inherited signature is already the narrow one, and nothing has to be widened or cast.
 */
class AccountResource extends Resource<Account, ResourceOutput, Event, Actor> {
  schema (context: ResourceContext<Event, Actor>): unknown {
    const actorId: string | undefined = context.principal?.actorId
    const url: string | undefined = context.event?.url
    return { actorId, url }
  }

  override data = (account: Account, context: ResourceContext<Event, Actor>): unknown => ({
    id: account.id,
    actor: context.principal?.actorId
  })
}

/** The same hook written as a method, which must be accepted too. */
class MethodStyleResource extends Resource<Account, ResourceOutput, Event, Actor> {
  schema (): unknown { return {} }

  async data (account: Account, context: ResourceContext<Event, Actor>): Promise<unknown> {
    return { id: account.id, actor: context.principal?.actorId }
  }
}

/** A reader taking the narrow context, which an application writes once for its whole module. */
function actorOf (context: ResourceContext<Event, Actor>): Actor | undefined {
  return context.principal
}

/** And no type parameters at all: everything stays `unknown`, and everything still compiles. */
class PlainResource extends Resource<Account> {
  schema (): unknown { return {} }
  override data = (account: Account, context: ResourceContext): unknown => ({ id: account.id, who: context.principal })
}

const imperative = defineResource<Account>({
  schema: { validate: () => ({ success: true, value: {} }) },
  data: (account, context) => ({ id: account.id, who: context.principal })
})

const typed: IResource<Account, ResourceOutput, Event, Actor> = new AccountResource()

export async function exercise (): Promise<unknown[]> {
  const account: Account = { id: 1, secret: 'x' }
  const context: ResourceContext<Event, Actor> = { principal: { actorId: 'a' }, event: { url: '/me' } }

  return [
    await new AccountResource().item(account, context),
    await new MethodStyleResource().item(account, context),
    await new PlainResource().item(account),
    await imperative.item(account),
    await typed.item(account, context),
    actorOf(context)
  ]
}
