import { TaskService } from '../app/TaskService'

vi.mock(import('@stone-js/core'), async (importOriginal) => ({ ...(await importOriginal()), Service: vi.fn(() => vi.fn()) }))

describe('TaskService', () => {
  it('adds a task with an incrementing id and lists it', () => {
    const service = new TaskService()

    const first = service.add('Write docs')
    const second = service.add('Ship it')

    expect(first).toEqual({ id: 1, title: 'Write docs' })
    expect(second).toEqual({ id: 2, title: 'Ship it' })
    expect(service.all()).toEqual([first, second])
  })
})
