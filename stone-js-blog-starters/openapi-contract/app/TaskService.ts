import { Service } from '@stone-js/core'
import { NewTaskInput } from './schemas'

/** A stored task. */
export interface Task extends NewTaskInput {
  id: number
}

/** In-memory task store, so the starter runs with nothing to provision. */
@Service({ alias: 'taskService' })
export class TaskService {
  private readonly tasks: Task[] = []
  private nextId = 1

  add (input: NewTaskInput): Task {
    const task: Task = { id: this.nextId++, done: false, ...input }
    this.tasks.push(task)
    return task
  }

  all (): Task[] {
    return this.tasks
  }
}
