import { defineAbility } from '@casl/ability'
import { AuthorizationError } from './errors/AuthorizationError'
import { AbilityResolver, Action, AppAbility, IAuthorizer, Subject } from './declarations'

/** A deny-all resolver — the safe default when no `resolveAbility` is configured. */
const DENY_ALL: AbilityResolver = () => defineAbility(() => {})

/**
 * Best-effort human name for a subject (a type string, or an object's constructor name).
 *
 * @param subject - The subject.
 * @returns A label for error messages.
 */
function subjectName (subject: Subject): string {
  // Reached only after CASL has accepted the subject (which requires a detectable type), so a
  // non-string subject always has a constructor.
  return typeof subject === 'string' ? subject : subject.constructor.name
}

/**
 * The authorization service.
 *
 * Isomorphic and platform-agnostic: it wraps a CASL ability (built per-principal via the
 * configured `resolveAbility`) to answer `can`/`cannot` and to `authorize` (throw on denial).
 * RBAC and ABAC are both supported, and the exact same ability can run on the frontend.
 */
export class Authorizer implements IAuthorizer {
  private readonly resolveAbility: AbilityResolver

  /**
   * @param resolveAbility - Builds the ability for a principal (defaults to deny-all).
   * @returns A new Authorizer.
   */
  static create (resolveAbility?: AbilityResolver): Authorizer {
    return new this(resolveAbility)
  }

  /**
   * @param resolveAbility - Builds the ability for a principal (defaults to deny-all).
   */
  constructor (resolveAbility: AbilityResolver = DENY_ALL) {
    this.resolveAbility = resolveAbility
  }

  /**
   * @param user - The principal.
   * @returns The principal's ability.
   */
  abilityFor (user: unknown): AppAbility {
    return this.resolveAbility(user)
  }

  /**
   * @param user - The principal.
   * @param action - The action.
   * @param subject - The subject (type or instance).
   * @param field - Optional field-level check.
   * @returns Whether the principal is allowed.
   */
  can (user: unknown, action: Action, subject: Subject, field?: string): boolean {
    return this.abilityFor(user).can(action, subject, field)
  }

  /**
   * @param user - The principal.
   * @param action - The action.
   * @param subject - The subject.
   * @param field - Optional field-level check.
   * @returns Whether the principal is NOT allowed.
   */
  cannot (user: unknown, action: Action, subject: Subject, field?: string): boolean {
    return !this.can(user, action, subject, field)
  }

  /**
   * Assert the principal is allowed, or throw.
   *
   * @param user - The principal.
   * @param action - The action.
   * @param subject - The subject.
   * @param field - Optional field-level check.
   * @throws {AuthorizationError} When the principal is not allowed.
   */
  authorize (user: unknown, action: Action, subject: Subject, field?: string): void {
    if (this.cannot(user, action, subject, field)) {
      throw new AuthorizationError(`You are not allowed to ${action} ${subjectName(subject)}.`)
    }
  }
}
