import { ErrorOptions, RuntimeError } from '@stone-js/core'

/** One reason the data did not match the contract. */
export interface ContractIssue {
  message: string
  path: Array<string | number>
}

/** Options carrying what failed. */
export interface ResourceContractErrorOptions extends ErrorOptions {
  issues?: ContractIssue[]
}

/**
 * Raised when what a handler produced does not match the schema its resource published.
 *
 * This is a server-side fault, deliberately. The resource's schema is a promise made to every caller
 * and to the published contract; data that breaks it means the application is about to answer
 * something it documented it would not. Returning it anyway is the failure — a client cannot detect
 * it, and a consumer generated from the contract will break on a field that was supposed to be there.
 *
 * It fires on a genuine breach, not on a difference: a schema strips what it does not describe, so
 * extra fields are simply not exposed. Reaching this means something the contract requires is missing
 * or has the wrong type.
 */
export class ResourceContractError extends RuntimeError {
  /** What failed, so a log says which field rather than "validation failed". */
  readonly issues: ContractIssue[]

  /**
   * @param message - What went wrong.
   * @param options - Additional error options, including the issues.
   */
  constructor (message: string, options: ResourceContractErrorOptions = {}) {
    super(message, options)
    this.name = 'ResourceContractError'
    this.issues = options.issues ?? []
  }
}
