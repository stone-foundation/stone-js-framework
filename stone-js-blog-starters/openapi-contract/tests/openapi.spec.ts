import { spec } from '../app/openapi'

describe('openapi spec', () => {
  it('builds a document from the info, servers, tags, schemas and paths', () => {
    expect(spec.openapi).toMatch(/^3\./)
    expect(spec.info).toEqual(expect.objectContaining({ title: 'Tasks API', version: '1.0.0' }))
    expect(spec.servers?.[0]?.url).toBe('http://localhost:8080')
    expect(spec.paths['/tasks']).toBeDefined()
    expect(Object.keys(spec.paths['/tasks'])).toEqual(expect.arrayContaining(['get', 'post']))
    expect(spec.components?.schemas.NewTask).toBeDefined()
  })
})
