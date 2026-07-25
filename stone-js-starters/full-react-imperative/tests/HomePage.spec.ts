import { renderToString } from 'react-dom/server'
import { HomePage } from '../app/pages/home/HomePage'

// We must mock router-bound components to lighten the test environment
vi.mock('@stone-js/use-react', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    StoneLink: ({ children }: any) => children
  }
})

describe('HomePage', () => {
  const render = (data: any[] = []): string => {
    const page = HomePage({ postService: {} as any })
    return renderToString(page.render?.({ data } as any))
  }

  it('should render the premium Stone.js welcome hero with the real logo', () => {
    // Act
    const html = render()

    // Assert
    expect(html).toContain('/logo.svg')
    expect(html).toContain('alt="Stone.js"')
  })

  it('should render the Welcome to Stone.js headline', () => {
    // Act
    const html = render()

    // Assert
    expect(html).toContain('Welcome')
    expect(html).toContain('Stone.js')
    expect(html).toContain('stone-welcome')
  })

  it('should reflect the number of published posts in the lead', () => {
    // Act
    const html = render([{ id: 1 }, { id: 2 }])

    // Assert
    expect(html).toContain('2 posts')
  })
})
