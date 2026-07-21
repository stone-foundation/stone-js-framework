import { TaskController } from '../app/TaskController'
import { TaskService } from '../app/TaskService'
import { IncomingHttpEvent } from '@stone-js/http-core'

vi.mock(import('@stone-js/router'), async (importOriginal) => ({ ...(await importOriginal()), EventHandler: vi.fn(() => vi.fn()), Get: vi.fn(() => vi.fn()), Post: vi.fn(() => vi.fn()) }))
vi.mock(import('@stone-js/http-core'), async (importOriginal) => ({ ...(await importOriginal()), JsonHttpResponse: vi.fn(() => vi.fn()) }))

describe('TaskController', () => {
  const eventTitled = (title?: string): IncomingHttpEvent =>
    ({ get: (_key: string, fallback?: string) => title ?? fallback }) as unknown as IncomingHttpEvent

  it('creates a task from the title', () => {
    const created = { id: 1, title: 'Ship it' }
    const add = vi.fn(() => created)
    const controller = new TaskController({ taskService: { add } as unknown as TaskService })

    expect(controller.create(eventTitled('Ship it'))).toBe(created)
    expect(add).toHaveBeenCalledWith('Ship it')
  })

  it('defaults an untitled task', () => {
    const add = vi.fn(() => ({ id: 1, title: 'Untitled' }))
    const controller = new TaskController({ taskService: { add } as unknown as TaskService })

    controller.create(eventTitled())

    expect(add).toHaveBeenCalledWith('Untitled')
  })

  it('lists tasks', () => {
    const tasks = [{ id: 1, title: 'a' }]
    const all = vi.fn(() => tasks)
    const controller = new TaskController({ taskService: { all } as unknown as TaskService })

    expect(controller.list()).toBe(tasks)
  })
})
