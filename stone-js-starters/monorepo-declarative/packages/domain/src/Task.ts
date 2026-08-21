/**
 * A task.
 *
 * The whole of what this application is about, and it says nothing about HTTP, about a screen, or
 * about where it is stored. That is the point: a domain that names a platform can only run on it.
 */
export interface Task {
  /** Stable identifier, used in routes. */
  id: string

  /** What the user wrote. */
  title: string

  /** Whether it is done. */
  done: boolean
}
