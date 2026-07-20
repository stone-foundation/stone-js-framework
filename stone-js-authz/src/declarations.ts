import { MongoAbility } from '@casl/ability'

/**
 * The application ability: what a given principal can and cannot do.
 *
 * Backed by CASL's `MongoAbility`, so it supports both RBAC (action + subject type) and ABAC
 * (conditions on subject instances). The very same ability works on the frontend to show/hide UI.
 */
export type AppAbility = MongoAbility

/** An action, e.g. `'read'`, `'update'`, `'manage'` (CASL's wildcard). */
export type Action = string

/** A subject: a type name (`'Post'`) or a concrete instance for ABAC checks. */
export type Subject = string | Record<PropertyKey, unknown>

/**
 * Builds the ability for a principal. Provide this via `stone.authz.resolveAbility`.
 */
export type AbilityResolver = (user: unknown) => AppAbility

/**
 * Authorization configuration (`stone.authz.*`).
 */
export interface AuthzOptions {
  /** Builds the ability for the current principal. Defaults to a deny-all ability. */
  resolveAbility?: AbilityResolver
}

/**
 * The authorization service contract.
 */
export interface IAuthorizer {
  /** Build the ability for a principal. */
  abilityFor: (user: unknown) => AppAbility
  /** Whether the principal may perform `action` on `subject`. */
  can: (user: unknown, action: Action, subject: Subject, field?: string) => boolean
  /** Whether the principal may NOT perform `action` on `subject`. */
  cannot: (user: unknown, action: Action, subject: Subject, field?: string) => boolean
  /** Assert the principal may perform `action` on `subject`, or throw. */
  authorize: (user: unknown, action: Action, subject: Subject, field?: string) => void
}
