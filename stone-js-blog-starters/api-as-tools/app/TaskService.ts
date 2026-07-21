import { Service } from '@stone-js/core'

/** A stored task. */
export interface Task {
  id: number
  title: string
}

/**
 * TaskService
 *
 * The domain. It knows nothing about HTTP or MCP: it just adds and lists tasks. The context (REST
 * or agent tool call) is what reaches it, never the other way around.
 */
@Service({ alias: 'taskService' })
export class TaskService {
  private readonly tasks: Task[] = []
  private nextId = 1

  add (title: string): Task {
    const task: Task = { id: this.nextId++, title }
    this.tasks.push(task)
    return task
  }

  all (): Task[] {
    return this.tasks
  }
}
