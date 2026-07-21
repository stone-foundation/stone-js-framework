import { NewTask } from './schemas'
import { OpenApiGenerator, OpenApiDocument } from '@stone-js/openapi'

/**
 * The OpenAPI document, built from the same schema the API validates with. `addSchema` runs the
 * Zod schema through `toJsonSchema`, and each operation references it, so the contract is a view of
 * the code, not a second copy to maintain.
 */
export const spec: OpenApiDocument = OpenApiGenerator
  .create({ title: 'Tasks API', version: '1.0.0', description: 'A tiny task API whose contract is generated from its validation schema.' })
  .addServer('http://localhost:8080')
  .addTag('tasks', 'Create and list tasks')
  .addSchema('NewTask', NewTask)
  .addPath('get', '/tasks', {
    summary: 'List tasks',
    tags: ['tasks'],
    responses: { 200: { description: 'The tasks.' } }
  })
  .addPath('post', '/tasks', {
    summary: 'Create a task',
    tags: ['tasks'],
    request: { body: NewTask },
    responses: {
      201: { description: 'The created task.' },
      422: { description: 'The body failed validation.' }
    }
  })
  .build()
