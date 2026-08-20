import { render } from '@testing-library/react'
import { isServer } from '../../src/PageInternals'
import { StoneServer } from '../../src/components/StoneServer'

// Mock `isServer` to control the environment behavior
vi.mock('../../src/PageInternals', async () => {
  const actual = await vi.importActual<object>('../../src/PageInternals')
  return {
    ...actual,
    isServer: vi.fn()
  }
})

describe('StoneServer', () => {
  // Rendered with the client renderer rather than `renderToStaticMarkup`: what is under
  // test is the gate, not how the markup is produced, and this package must stay buildable
  // and testable without `react-dom`. The web package covers the server rendering itself.
  it('renders children when isServer is true', () => {
    vi.mocked(isServer).mockReturnValue(true)

    const { container } = render(<StoneServer><div>Server Content</div></StoneServer>)

    expect(container.innerHTML).toContain('Server Content')
  })

  it('renders nothing when isServer is false', () => {
    vi.mocked(isServer).mockReturnValue(false)

    const { container } = render(<StoneServer><div>Client Content</div></StoneServer>)

    expect(container.innerHTML).toBe('')
  })
})
