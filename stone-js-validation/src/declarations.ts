/**
 * A single validation problem, normalised across engines.
 */
export interface ValidationIssue {
  /** Property path to the offending value (e.g. `['user', 'email']`). */
  path: Array<string | number>
  /** Human-readable message. */
  message: string
  /** Optional engine/rule code (e.g. `too_small`). */
  code?: string
}

/**
 * The outcome of validating a value against a schema. Never throws — inspect `success`.
 */
export type ValidationResult<T> =
  | { success: true, value: T, issues?: undefined }
  | { success: false, value?: undefined, issues: ValidationIssue[] }

/**
 * The engine-agnostic schema contract every validator speaks.
 *
 * Any object exposing a `validate(data)` method that returns a {@link ValidationResult} is a
 * valid Stone.js schema. Zod, Valibot and ArkType schemas are adapted to this shape (they all
 * implement the Standard Schema spec, or expose `safeParse`), so you write the schema once and
 * use it identically on the backend and the frontend.
 */
export interface ValidationSchema<T = unknown> {
  /** Validate a value, returning a normalised result. */
  validate: (data: unknown) => ValidationResult<T>
}

/**
 * Minimal shape of the [Standard Schema](https://standardschema.dev) v1 contract — implemented
 * by Zod 3.24+, Valibot, ArkType and others. Only the synchronous path is consumed here.
 */
export interface StandardSchemaV1<Output = unknown> {
  readonly '~standard': {
    readonly version: 1
    readonly vendor: string
    readonly validate: (value: unknown) => StandardResult<Output> | Promise<StandardResult<Output>>
  }
}

/** A Standard Schema validation result. */
export interface StandardResult<Output> {
  readonly value?: Output
  readonly issues?: ReadonlyArray<{
    readonly message: string
    readonly path?: ReadonlyArray<PropertyKey | { readonly key: PropertyKey }>
  }>
}

/**
 * Minimal shape of a Zod-style schema (a `safeParse` method). Kept structural so `@stone-js/validation`
 * never has to depend on Zod at runtime.
 */
export interface ZodLikeSchema<T = unknown> {
  safeParse: (data: unknown) => ZodSafeParseResult<T>
}

/** A Zod-style `safeParse` result. */
export type ZodSafeParseResult<T> =
  | { success: true, data: T }
  | { success: false, error: { issues: ReadonlyArray<{ message: string, path: readonly PropertyKey[], code?: string }> } }

/**
 * Anything that can be resolved into a {@link ValidationSchema}: a native Stone.js schema, a
 * Standard Schema, or a Zod-like schema.
 */
export type SchemaInput<T = unknown> = ValidationSchema<T> | StandardSchemaV1<T> | ZodLikeSchema<T>

/**
 * The telemetry-free validation service contract.
 */
export interface IValidator {
  /** Validate `data` against `schema`, returning a normalised result (never throws). */
  validate: <T>(schema: SchemaInput<T>, data: unknown) => ValidationResult<T>
  /** Validate `data` and return the parsed value, or throw a `ValidationError` on failure. */
  assert: <T>(schema: SchemaInput<T>, data: unknown) => T
  /** Whether `data` satisfies `schema`. */
  isValid: <T>(schema: SchemaInput<T>, data: unknown) => boolean
}

/**
 * Validation configuration (`stone.validation.*`).
 */
export interface ValidationOptions {
  /** Whether to strip unknown keys is left to the schema; reserved for future options. */
  reserved?: never
}
