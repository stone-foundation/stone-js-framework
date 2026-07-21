import { TaskService } from '../app/TaskService'

vi.mock(import('@stone-js/core'), async (importOriginal) => ({ ...(await importOriginal()), Service: vi.fn(() => vi.fn()) }))

describe('TaskService', () => {
  it('adds a task with an id and default done flag, and lists it', () => {
    const service = new TaskService()
    const task = service.add({ title: 'Write docs' })

    expect(task).toEqual({ id: 1, title: 'Write docs', done: false })
    expect(service.all()).toEqual([task])
  })
})
