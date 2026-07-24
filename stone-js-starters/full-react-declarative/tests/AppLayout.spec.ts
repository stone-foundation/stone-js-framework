import { renderToString } from 'react-dom/server'
import { AppLayout } from '../app/layout/AppLayout/AppLayout'

// We must mock decorators and router-bound components to lighten the test environment
vi.mock('@stone-js/use-react', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    PageLayout: vi.fn(() => vi.fn()),
    StoneLink: ({ children }: any) => children,
    StoneOutlet: ({ children }: any) => children
  }
})

describe('AppLayout', () => {
  let layout: AppLayout

  beforeEach(() => {
    layout = new AppLayout({} as any)
  })

  const render = (): string => {
    const container = {
      make: () => ({ getUser: () => undefined })
    }
    return renderToString(layout.render({ container, children: null } as any))
  }

  it('should create an App Layout instance', () => {
    // Assert
    expect(layout).toBeInstanceOf(AppLayout)
  })

  it('should render the real Stone.js logo', () => {
    // Act
    const html = render()

    // Assert
    expect(html).toContain('/logo.svg')
    expect(html).toContain('alt="Stone.js"')
  })

  it('should render the unauthenticated header', () => {
    // Act
    const html = render()

    // Assert
    expect(html).toContain('Login')
    expect(html).toContain('Stone.js')
  })
})
