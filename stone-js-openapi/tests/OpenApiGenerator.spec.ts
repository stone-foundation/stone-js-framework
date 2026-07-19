import { z } from 'zod'
import { OpenApiGenerator } from '../src/OpenApiGenerator'

const info = { title: 'Lab API', version: '0.8.0' }

describe('OpenApiGenerator', () => {
  it('builds a minimal document', () => {
    const doc = OpenApiGenerator.create(info).build()
    expect(doc.openapi).toBe('3.0.3')
    expect(doc.info).toEqual(info)
    expect(doc.paths).toEqual({})
    expect(doc.servers).toBeUndefined()
    expect(doc.tags).toBeUndefined()
    expect(doc.components).toBeUndefined()
  })

  it('adds servers, tags and component schemas', () => {
    const doc = OpenApiGenerator.create(info)
      .addServer('https://api.test', 'prod')
      .addServer('http://localhost:8080')
      .addTag('tasks', 'Task ops')
      .addTag('health')
      .addSchema('Task', z.object({ id: z.number(), title: z.string() }))
      .build()

    expect(doc.servers).toEqual([{ url: 'https://api.test', description: 'prod' }, { url: 'http://localhost:8080' }])
    expect(doc.tags).toEqual([{ name: 'tasks', description: 'Task ops' }, { name: 'health' }])
    expect(doc.components?.schemas.Task.type).toBe('object')
  })

  it('builds an operation with params, query, body and responses', () => {
    const doc = OpenApiGenerator.create(info)
      .addPath('post', '/tasks/{id}', {
        summary: 'Create',
        description: 'Creates a task',
        tags: ['tasks'],
        operationId: 'createTask',
        request: {
          params: z.object({ id: z.string() }),
          query: z.object({ dryRun: z.string().optional() }),
          headers: z.object({ 'x-trace': z.string().optional() }),
          body: z.object({ title: z.string() })
        },
        responses: {
          201: { description: 'Created', schema: z.object({ id: z.number() }) },
          400: { description: 'Bad Request' }
        }
      })
      .build()

    const op: any = doc.paths['/tasks/{id}'].post
    expect(op.summary).toBe('Create')
    expect(op.description).toBe('Creates a task')
    expect(op.tags).toEqual(['tasks'])
    expect(op.operationId).toBe('createTask')

    const pathParam = op.parameters.find((p: any) => p.in === 'path')
    expect(pathParam).toMatchObject({ name: 'id', in: 'path', required: true })
    const queryParam = op.parameters.find((p: any) => p.name === 'dryRun')
    expect(queryParam).toMatchObject({ in: 'query', required: false })
    expect(op.parameters.find((p: any) => p.in === 'header').name).toBe('x-trace')

    expect(op.requestBody.required).toBe(true)
    expect(op.requestBody.content['application/json'].schema.type).toBe('object')
    expect(op.responses['201'].content['application/json'].schema.type).toBe('object')
    expect(op.responses['400']).toEqual({ description: 'Bad Request' })
  })

  it('defaults responses to a 200 OK when none are given', () => {
    const doc = OpenApiGenerator.create(info).addPath('get', '/health', { summary: 'Health' }).build()
    expect((doc.paths['/health'].get as any).responses['200'].description).toBe('OK')
  })

  it('tolerates a parameter schema without properties (raw JSON Schema)', () => {
    const doc = OpenApiGenerator.create(info)
      .addPath('get', '/x', { request: { query: { type: 'object' } } })
      .build()
    const op: any = doc.paths['/x'].get
    expect(op.parameters).toBeUndefined()
  })

  it('derives operations from routes, ignoring un-annotated ones', () => {
    const doc = OpenApiGenerator.create(info)
      .addRoutes([
        { method: 'get', path: '/tasks', openapi: { summary: 'List' } },
        { method: 'get', path: '/internal' }
      ])
      .build()
    expect(doc.paths['/tasks'].get).toBeDefined()
    expect(doc.paths['/internal']).toBeUndefined()
  })
})
