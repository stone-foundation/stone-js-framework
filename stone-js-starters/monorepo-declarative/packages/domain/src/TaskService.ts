import { Task } from './Task.js'

/**
 * The application's one piece of behaviour.
 *
 * It takes the tasks it works on, so a starter can hand it an array and a real application can hand
 * it a repository, without a line here changing. What matters is what it does *not* import: no
 * `Request`, no `Response`, no `window`, no `View`. It is the half of the application that is true
 * on a server, in a browser, on a phone and at the edge, and it is written once.
 */
export class TaskService {
  private readonly tasks: Task[]

  /**
   * Create the service.
   *
   * @param tasks - Where the tasks are kept. The caller owns it, which is what lets a test hand in
   *   its own and an application hand in its store.
   * @returns The service.
   */
  static create (tasks: Task[]): TaskService {
    return new TaskService(tasks)
  }

  /**
   * @param tasks - Where the tasks are kept.
   */
  private constructor (tasks: Task[]) {
    this.tasks = tasks
  }

  /**
   * Every task.
   *
   * @returns A copy, so a caller cannot reach into the service's state.
   */
  all (): Task[] {
    return [...this.tasks]
  }

  /**
   * One task by its identifier.
   *
   * @param id - The identifier.
   * @returns The task, or `undefined` when there is none.
   */
  find (id: string): Task | undefined {
    return this.tasks.find((task) => task.id === id)
  }

  /**
   * Flip a task's state.
   *
   * @param id - The identifier.
   * @returns The task as it now is, or `undefined` when there is none.
   */
  toggle (id: string): Task | undefined {
    const task = this.find(id)

    if (task === undefined) { return undefined }

    task.done = !task.done

    return task
  }

  /**
   * How many are left.
   *
   * @returns The number of tasks not done.
   */
  remaining (): number {
    return this.tasks.filter((task) => !task.done).length
  }
}
