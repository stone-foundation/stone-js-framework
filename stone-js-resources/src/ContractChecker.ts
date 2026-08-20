import { ContractIssue } from './errors/ResourceContractError'

/** What checking a projection against its contract produced. */
export interface ContractResult<T = unknown> {
  success: boolean
  value?: T
  issues?: ContractIssue[]
}

/**
 * What this module needs from a schema: the ability to run it and read the outcome.
 *
 * Declared so an application can substitute its own — a bespoke dialect, a shared engine it already
 * configured — without this module knowing anything about it.
 */
export interface IContractChecker {
  check: <T>(schema: unknown, data: unknown) => ContractResult<T>
}

/** A schema exposing the Standard Schema contract (Zod 3.24+, Valibot, ArkType and others). */
interface StandardSchema {
  '~standard': { validate: (data: unknown) => { value?: unknown, issues?: Array<{ message: string, path?: unknown }> } | Promise<unknown> }
}

/**
 * Runs a schema and reports what it said.
 *
 * This module reads schemas; it does not validate requests, own engines, or keep a registry — so it
 * carries its own reader rather than depending on a validation module to project data. The dialects
 * it accepts are public specifications, not one library's API: Standard Schema first, then the
 * `safeParse`/`parse` shape, then a plain `validate`. An application writes its schemas once and both
 * sides of the boundary read them.
 *
 * Substitutable: pass your own {@link IContractChecker} and this one steps aside.
 */
export class ContractChecker implements IContractChecker {
  /**
   * Factory.
   *
   * @returns A checker.
   */
  static create (): ContractChecker {
    return new this()
  }

  /**
   * Run a schema against a value.
   *
   * @param schema - The contract.
   * @param data - What the resource produced.
   * @returns Whether it holds, the parsed value, and what failed.
   * @throws {TypeError} When the value is not a schema this can run, because guessing would mean
   *                     projecting unchecked data while reporting success.
   */
  check<T> (schema: unknown, data: unknown): ContractResult<T> {
    if (this.isStandard(schema)) { return this.fromStandard<T>(schema, data) }
    if (this.hasSafeParse(schema)) { return this.fromSafeParse<T>(schema, data) }
    if (this.hasValidate(schema)) { return this.fromValidate<T>(schema, data) }
    if (this.hasParse(schema)) { return this.fromParse<T>(schema, data) }

    throw new TypeError(
      'A resource schema must be runnable: a Standard Schema (Zod, Valibot, ArkType and others), or ' +
      'something exposing `safeParse`, `parse` or `validate`. Reporting success on a value this cannot ' +
      'run would mean projecting unchecked data, which is the one thing a contract must never do.'
    )
  }

  /**
   * Read a Standard Schema result.
   *
   * The synchronous path only: a schema whose validation is asynchronous returns a promise, and a
   * promise is not a result. Saying so beats treating it as one, which is how `[object Promise]`
   * reaches a response body.
   *
   * @param schema - The schema.
   * @param data - The value.
   * @returns The outcome.
   */
  private fromStandard<T> (schema: StandardSchema, data: unknown): ContractResult<T> {
    const result = schema['~standard'].validate(data)

    if (result instanceof Promise) {
      throw new TypeError(
        'This resource schema validates asynchronously, which a projection cannot consume. Use the ' +
        'synchronous form of your schema, or supply a checker that awaits it.'
      )
    }

    const issues = (result as { issues?: Array<{ message: string, path?: unknown }> }).issues

    return issues === undefined || issues.length === 0
      ? { success: true, value: (result as { value?: T }).value }
      : { success: false, issues: issues.map((issue) => this.toIssue(issue)) }
  }

  /**
   * Read a `safeParse` result (the Zod-like shape).
   *
   * @param schema - The schema.
   * @param data - The value.
   * @returns The outcome.
   */
  private fromSafeParse<T> (schema: { safeParse: (d: unknown) => any }, data: unknown): ContractResult<T> {
    const result = schema.safeParse(data)

    return result.success === true
      ? { success: true, value: result.data as T }
      : { success: false, issues: (result.error?.issues ?? []).map((issue: any) => this.toIssue(issue)) }
  }

  /**
   * Read a native `validate` result: already the shape this module reports.
   *
   * @param schema - The schema.
   * @param data - The value.
   * @returns The outcome.
   */
  private fromValidate<T> (schema: { validate: (d: unknown) => any }, data: unknown): ContractResult<T> {
    const result = schema.validate(data)

    return result?.success === true
      ? { success: true, value: result.value as T }
      : { success: false, issues: (result?.issues ?? []).map((issue: any) => this.toIssue(issue)) }
  }

  /**
   * Read a throwing `parse`.
   *
   * @param schema - The schema.
   * @param data - The value.
   * @returns The outcome.
   */
  private fromParse<T> (schema: { parse: (d: unknown) => unknown }, data: unknown): ContractResult<T> {
    try {
      return { success: true, value: schema.parse(data) as T }
    } catch (error: any) {
      const issues = error?.issues ?? [{ message: String(error?.message ?? error), path: [] }]
      return { success: false, issues: issues.map((issue: any) => this.toIssue(issue)) }
    }
  }

  /**
   * Normalise one issue, whatever dialect reported it.
   *
   * @param issue - The raw issue.
   * @returns The issue.
   */
  private toIssue (issue: { message?: string, path?: unknown }): ContractIssue {
    const path = Array.isArray(issue.path)
      // Standard Schema paths may carry segment objects rather than plain keys.
      ? issue.path.map((segment: any) => (typeof segment === 'object' && segment !== null ? segment.key : segment))
      : []

    return { message: issue.message ?? 'Invalid value', path }
  }

  /** @param schema - The candidate. @returns Whether it speaks Standard Schema. */
  private isStandard (schema: unknown): schema is StandardSchema {
    return typeof (schema as StandardSchema)?.['~standard']?.validate === 'function'
  }

  /** @param schema - The candidate. @returns Whether it exposes `safeParse`. */
  private hasSafeParse (schema: unknown): schema is { safeParse: (d: unknown) => any } {
    return typeof (schema as any)?.safeParse === 'function'
  }

  /** @param schema - The candidate. @returns Whether it exposes `validate`. */
  private hasValidate (schema: unknown): schema is { validate: (d: unknown) => any } {
    return typeof (schema as any)?.validate === 'function'
  }

  /** @param schema - The candidate. @returns Whether it exposes `parse`. */
  private hasParse (schema: unknown): schema is { parse: (d: unknown) => unknown } {
    return typeof (schema as any)?.parse === 'function'
  }
}
