import { TaskService } from '../app/TaskService'

vi.mock(import('@stone-js/core'), async (importOriginal) => ({ ...(await importOriginal()), Service: vi.fn(() => vi.fn()) }))

describe('TaskService', () => {
  it('adds a task with an id and a default done flag, and lists it', () => {
    const service = new TaskService()

    const task = service.add({ title: 'Write docs' })

    expect(task).toEqual({ id: 1, title: 'Write docs', done: false })
    expect(service.all()).toEqual([task])
  })

  it('increments ids and preserves an explicit done flag', () => {
    const service = new TaskService()
    service.add({ title: 'first' })
    const second = service.add({ title: 'second', done: true })

    expect(second).toEqual({ id: 2, title: 'second', done: true })
    expect(service.all()).toHaveLength(2)
  })
})
