import { renderToString } from 'react-dom/server'
import { HomePage } from '../app/pages/HomePage'

// Mock the page decorator so the class can be instantiated without a running app context.
vi.mock('@stone-js/use-react', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    Page: vi.fn(() => vi.fn())
  }
})

describe('HomePage', () => {
  it('returns the domain message from handle', () => {
    // Arrange
    const page = new HomePage()

    // Act
    const data = page.handle()

    // Assert
    expect(data.message).toBe('Write your domain once. Stone.js applies the context.')
  })

  it('renders the Stone.js logo and the message', () => {
    // Arrange
    const page = new HomePage()

    // Act
    const html = renderToString(page.render({ data: page.handle() } as any))

    // Assert: the Stone.js logo is rendered (Vite inlines the small SVG as a data URI),
    // alongside the title and the domain message.
    expect(html).toContain('<img')
    expect(html).toContain('image/svg+xml')
    expect(html).toContain('alt="Stone.js"')
    expect(html).toContain('Stone.js Showcase')
    expect(html).toContain('Write your domain once')
  })
})
