/**
 * Custom error for pipeline operations.
 */
export class PipelineError extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'PipelineError'
  }
}
