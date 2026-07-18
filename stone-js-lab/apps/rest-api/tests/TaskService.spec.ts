import { TaskService } from '../app/TaskService'

describe('TaskService (unit)', () => {
  it('seeds one task', () => {
    expect(new TaskService().list()).toHaveLength(1)
  })

  it('creates, finds and toggles a task', () => {
    const svc = new TaskService()
    const created = svc.create('Ship 0.8.0')
    expect(created).toMatchObject({ title: 'Ship 0.8.0', done: false })
    expect(svc.find(created.id)).toBe(created)

    const toggled = svc.toggle(created.id)
    expect(toggled.done).toBe(true)
  })

  it('removes a task (idempotent) and 404s on unknown', () => {
    const svc = new TaskService()
    svc.remove(1)
    expect(svc.list()).toHaveLength(0)
    svc.remove(1) // idempotent, no throw
    expect(() => svc.find(999)).toThrow(/#999 not found/)
  })
})
