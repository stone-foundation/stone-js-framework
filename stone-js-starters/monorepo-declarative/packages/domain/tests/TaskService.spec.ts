import { Task, TaskService } from '../src/index.js'

/**
 * The domain, tested on its own.
 *
 * No application, no kernel, no adapter, no renderer, because none of them are involved. This is
 * the half of the codebase that both applications share, and it is also the half that is cheapest
 * to test: plain objects in, plain objects out, in milliseconds.
 */
describe('TaskService', () => {
  const seed = (): Task[] => [
    { id: '1', title: 'Done already', done: true },
    { id: '2', title: 'Still to do', done: false }
  ]

  it('lists the tasks it was given', () => {
    const service = TaskService.create(seed())

    expect(service.all()).toHaveLength(2)
    expect(service.all()[0].title).toBe('Done already')
  })

  it('hands out a copy, so a caller cannot reach into its state', () => {
    const service = TaskService.create(seed())

    service.all().push({ id: '3', title: 'Injected', done: false })

    expect(service.all()).toHaveLength(2)
  })

  it('finds a task by its identifier', () => {
    const service = TaskService.create(seed())

    expect(service.find('2')?.title).toBe('Still to do')
  })

  it('has nothing to find for an unknown identifier', () => {
    const service = TaskService.create(seed())

    expect(service.find('nope')).toBeUndefined()
  })

  it('flips a task and reports it as it now is', () => {
    const service = TaskService.create(seed())

    expect(service.toggle('2')?.done).toBe(true)
    expect(service.find('2')?.done).toBe(true)
  })

  it('flips back', () => {
    const service = TaskService.create(seed())

    service.toggle('1')

    expect(service.find('1')?.done).toBe(false)
  })

  it('has nothing to flip for an unknown identifier', () => {
    const service = TaskService.create(seed())

    expect(service.toggle('nope')).toBeUndefined()
  })

  it('counts what is left', () => {
    const service = TaskService.create(seed())

    expect(service.remaining()).toBe(1)

    service.toggle('2')

    expect(service.remaining()).toBe(0)
  })
})
