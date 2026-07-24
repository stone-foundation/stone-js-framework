import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { LayoutHeader } from '../app/components/LayoutHeader/LayoutHeader'

// We must mock router-bound components to lighten the test environment
vi.mock('@stone-js/use-react', async (importOriginal) => {
  const actual: any = await importOriginal()
  return {
    ...actual,
    StoneLink: ({ children }: any) => children
  }
})

describe('LayoutHeader', () => {
  const render = (): string => {
    const container = {
      make: (key: string) => key === 'event' ? { getUser: () => undefined } : {}
    } as any
    return renderToString(createElement(LayoutHeader, { container }))
  }

  it('should render the real Stone.js logo', () => {
    // Act
    const html = render()

    // Assert
    expect(html).toContain('/logo.svg')
    expect(html).toContain('alt="Stone.js"')
  })

  it('should render the Stone.js brand for an unauthenticated visitor', () => {
    // Act
    const html = render()

    // Assert
    expect(html).toContain('Stone.js')
    expect(html).toContain('app-navbar')
  })
})
