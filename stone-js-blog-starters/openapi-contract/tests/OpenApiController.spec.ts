import { OpenApiController } from '../app/OpenApiController'
import { spec } from '../app/openapi'

vi.mock(import('@stone-js/router'), async (importOriginal) => ({ ...(await importOriginal()), EventHandler: vi.fn(() => vi.fn()), Get: vi.fn(() => vi.fn()) }))
vi.mock(import('@stone-js/http-core'), async (importOriginal) => ({ ...(await importOriginal()), HtmlHttpResponse: vi.fn(() => vi.fn()) }))

describe('OpenApiController', () => {
  const controller = new OpenApiController()

  it('serves the generated document as JSON', () => {
    expect(controller.document()).toBe(spec)
  })

  it('serves a Swagger UI page pointed at the JSON document', () => {
    const html = controller.docs()
    expect(html).toContain('swagger-ui')
    expect(html).toContain('/openapi.json')
  })
})
