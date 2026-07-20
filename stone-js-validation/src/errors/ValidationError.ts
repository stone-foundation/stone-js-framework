import { ValidationIssue } from '../declarations'
import { IntegrationError } from '@stone-js/core'
import type { ErrorOptions } from '@stone-js/core'

/**
 * Options for a {@link ValidationError}.
 */
export interface ValidationErrorOptions extends ErrorOptions {
  /** The normalised validation issues. */
  issues: ValidationIssue[]
}

/**
 * Thrown when a value fails validation.
 *
 * It carries the normalised {@link ValidationIssue}s so any layer can render them (an HTTP error
 * handler into `422` + problem+json, a CLI into a table, a form into field errors). The error
 * itself stays platform-agnostic — it knows nothing about HTTP.
 */
export class ValidationError extends IntegrationError {
  /** The normalised validation issues. */
  readonly issues: ValidationIssue[]

  /**
   * @param message - The error message.
   * @param options - The error options, including the issues.
   */
  constructor (message: string, options: ValidationErrorOptions) {
    super(message, options)
    this.name = 'ValidationError'
    this.issues = options.issues
  }

  /**
   * A plain, serialisable representation (suitable as a problem+json `errors` payload).
   *
   * @returns The issues keyed by dotted path.
   */
  toIssuesRecord (): Record<string, string[]> {
    return this.issues.reduce<Record<string, string[]>>((acc, issue) => {
      const key = issue.path.length > 0 ? issue.path.join('.') : '_'
      acc[key] = acc[key] ?? []
      acc[key].push(issue.message)
      return acc
    }, {})
  }
}
