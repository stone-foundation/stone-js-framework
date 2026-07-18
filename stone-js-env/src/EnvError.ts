/**
 * Custom error for env operations.
 */
export class EnvError extends Error {
  constructor (message: string) {
    super(message)
    this.name = 'EnvError'
  }
}
