import { swaggerUiHtml } from '../src/serve'

describe('swaggerUiHtml', () => {
  it('renders a page pointing at the spec URL with a default title', () => {
    const html = swaggerUiHtml('/openapi.json')
    expect(html).toContain('swagger-ui')
    expect(html).toContain('"/openapi.json"')
    expect(html).toContain('<title>API Documentation</title>')
    expect(html).toContain('unpkg.com/swagger-ui-dist@5')
  })

  it('honours a custom title (escaped) and version', () => {
    const html = swaggerUiHtml('/spec', { title: 'Stone <Lab>', version: '4' })
    expect(html).toContain('<title>Stone &lt;Lab&gt;</title>')
    expect(html).toContain('swagger-ui-dist@4')
  })
})
