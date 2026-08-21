import { Task } from './Task.js'
import { defineService } from '@stone-js/core'
import { TaskService } from './TaskService.js'

export * from './Task.js'
export * from './TaskService.js'

/**
 * Where the tasks actually live, for a starter that installs no database.
 *
 * A module-level array, deliberately, because Stone.js gives every event its own container: a
 * service holding state in itself would forget it between two events. A real application injects a
 * repository here and this constant disappears; nothing in `TaskService` changes.
 */
const store: Task[] = [
  { id: '1', title: 'Write the domain once', done: true },
  { id: '2', title: 'Run it on the web', done: true },
  { id: '3', title: 'Run the same code on a phone', done: false }
]

/**
 * The domain, as something an application can activate.
 *
 * A module is activated by its decorator or by its blueprint, never by a third thing. A shared
 * package takes the blueprint path: decorating `TaskService` would mean the build has to discover
 * it, and a build discovers what is under `app/`, not what is in `node_modules`. So the domain hands
 * out a blueprint fragment instead, and each application activates it in its own `@StoneApp`.
 *
 * A factory rather than a class, because `TaskService` has a private constructor and is created
 * through `create`, which is the convention across Stone.js. The alias is what a page asks for:
 * `constructor ({ tasks }: { tasks: TaskService })`.
 */
export const domainBlueprint = defineService(() => TaskService.create(store), { alias: 'tasks' })
