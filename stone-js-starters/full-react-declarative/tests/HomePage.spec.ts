import { renderToString } from 'react-dom/server'
import { HomePage } from '../app/pages/home/HomePage'

// We must mock the @Page decorator and router-bound components to lighten the test environment
vi.mock('@stone-js/use-react', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    Page: vi.fn(() => vi.fn()),
    StoneLink: ({ children }: any) => children
  }
})

describe('HomePage', () => {
  const render = (): string => {
    const page = new HomePage()
    return renderToString(page.render())
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
})
