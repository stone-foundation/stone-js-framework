import { IncomingEvent } from '@stone-js/core'
import { IAuthorizer, IPolicy } from '@stone-js/authz'

interface Actor { actorId: string, scopes: string[] }

/** A richer event, the way an HTTP or a browser event is richer than the agnostic one. */
interface HttpishEvent extends IncomingEvent {
  url: URL
  getUser: <T>() => T | undefined
}

/**
 * A policy that reads its own event type.
 *
 * The reason the type parameter exists: a function-typed property is contravariant on its parameters,
 * so narrowing `authorize (event)` in an implementation was rejected (TS2416) and an application had to
 * drop the `implements` clause to write what it meant. Compiled under `strictFunctionTypes` and
 * `exactOptionalPropertyTypes`, which is what a strict application turns on.
 */
class PostPolicy implements IPolicy<HttpishEvent> {
  authorize (event: HttpishEvent): boolean {
    const actor = event.getUser<Actor>()
    return actor !== undefined && event.url.pathname.startsWith('/posts')
  }
}

/** As a property too, which must keep working. */
class ReadPolicy implements IPolicy<HttpishEvent> {
  authorize = (event: HttpishEvent): boolean => event.url.pathname.length > 0
}

/** And with no type argument: the agnostic event, and nothing to change. */
class AnyPolicy implements IPolicy {
  authorize (event: IncomingEvent): boolean { return event.get<string>('id') !== undefined }
}

/** An authorizer that types the user it reasons about. */
class ActorAuthorizer implements IAuthorizer<Actor> {
  abilityFor = (actor: Actor): any => ({ actor })
  can = (actor: Actor, action: any, subject: any): boolean => actor.scopes.includes(`${String(action)}:${String(subject)}`)
  cannot = (actor: Actor, action: any, subject: any): boolean => !this.can(actor, action, subject)
  authorize = (actor: Actor, action: any, subject: any): void => {
    if (this.cannot(actor, action, subject)) { throw new Error('denied') }
  }
}

export { PostPolicy, ReadPolicy, AnyPolicy, ActorAuthorizer }
