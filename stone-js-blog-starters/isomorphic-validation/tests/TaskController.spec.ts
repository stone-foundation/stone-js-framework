import { TaskController } from '../app/TaskController'
import { TaskService } from '../app/TaskService'
import { IncomingHttpEvent } from '@stone-js/http-core'

// Mock the route/response decorators and the validate middleware factory to no-ops.
vi.mock(import('@stone-js/router'), async (importOriginal) => ({ ...(await importOriginal()), EventHandler: vi.fn(() => vi.fn()), Get: vi.fn(() => vi.fn()), Post: vi.fn(() => vi.fn()) }))
vi.mock(import('@stone-js/http-core'), async (importOriginal) => ({ ...(await importOriginal()), JsonHttpResponse: vi.fn(() => vi.fn()) }))
vi.mock(import('@stone-js/validation'), async (importOriginal) => ({ ...(await importOriginal()), validate: vi.fn(() => vi.fn()) }))

describe('TaskController', () => {
  const eventWith = (body: unknown): IncomingHttpEvent =>
    ({ get: () => body }) as unknown as IncomingHttpEvent

  it('creates a task from the (already validated) body', () => {
    const created = { id: 1, title: 'Ship it', done: false }
    const add = vi.fn(() => created)
    const controller = new TaskController({ taskService: { add } as unknown as TaskService })

    const result = controller.create(eventWith({ title: 'Ship it' }))

    expect(add).toHaveBeenCalledWith({ title: 'Ship it' })
    expect(result).toBe(created)
  })

  it('lists tasks', () => {
    const tasks = [{ id: 1, title: 'a', done: false }]
    const all = vi.fn(() => tasks)
    const controller = new TaskController({ taskService: { all } as unknown as TaskService })

    expect(controller.list()).toBe(tasks)
  })
})
