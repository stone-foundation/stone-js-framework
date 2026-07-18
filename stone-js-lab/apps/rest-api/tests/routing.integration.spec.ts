import { TaskService } from '../app/TaskService'
import { Router, routerBlueprint } from '@stone-js/router'
import { IncomingHttpEvent } from '@stone-js/http-core'

const makeRouter = (svc: TaskService): any => Router.create({
  ...(routerBlueprint.stone.router as any),
  definitions: [
    { path: '/tasks', method: 'GET', handler: () => svc.list() },
    { path: '/tasks/:id(\\d+)', method: 'GET', handler: (e: any) => svc.find(Number(e.get('id'))) },
    { path: '/tasks', method: 'POST', handler: (e: any) => svc.create(e.get('title', 'Untitled')) }
  ]
})

const event = (method: string, path: string, body: Record<string, unknown> = {}): any =>
  IncomingHttpEvent.create({ url: new URL(`http://localhost${path}`), method: method as any, body })

describe('Tasks routing (integration)', () => {
  it('dispatches a real event to the collection route', async () => {
    const svc = new TaskService()
    const result = await makeRouter(svc).dispatch(event('GET', '/tasks'))
    expect(result).toHaveLength(1)
  })

  it('binds a regex path param and resolves the task', async () => {
    const svc = new TaskService()
    const result: any = await makeRouter(svc).dispatch(event('GET', '/tasks/1'))
    expect(result.id).toBe(1)
  })

  it('creates via POST body', async () => {
    const svc = new TaskService()
    const result: any = await makeRouter(svc).dispatch(event('POST', '/tasks', { title: 'From HTTP' }))
    expect(result.title).toBe('From HTTP')
    expect(svc.list()).toHaveLength(2)
  })
})
