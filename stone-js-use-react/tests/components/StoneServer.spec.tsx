import { render } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { isServer } from '../../src/UseReactPageInternals'
import { StoneServer } from '../../src/components/StoneServer'

// Mock `isServer` to control the environment behavior
vi.mock('../../src/UseReactPageInternals', async () => {
  const actual = await vi.importActual<object>('../../src/UseReactPageInternals')
  return {
    ...actual,
    isServer: vi.fn()
  }
})

describe('StoneServer', () => {
  it('renders children when isServer is true', () => {
    vi.mocked(isServer).mockReturnValue(true)

    const html = renderToStaticMarkup(<StoneServer><div>Server Content</div></StoneServer>)
    expect(html).toContain('Server Content')
  })

  it('renders nothing when isServer is false', () => {
    vi.mocked(isServer).mockReturnValue(false)

    const { container } = render(<StoneServer><div>Client Content</div></StoneServer>)
    expect(container.innerHTML).toBe('')
  })
})
