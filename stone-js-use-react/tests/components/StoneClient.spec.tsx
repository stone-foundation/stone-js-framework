import { render } from '@testing-library/react'
import { isClient } from '../../src/UseReactPageInternals'
import { StoneClient } from '../../src/components/StoneClient'

// Mock isClient from UseReactPageInternals
vi.mock('../../src/UseReactPageInternals', async (mod) => {
  const actual: any = await mod()
  return {
    ...actual,
    isClient: vi.fn()
  }
})

describe('StoneClient', () => {
  it('should render children if isClient returns true', () => {
    vi.mocked(isClient).mockReturnValue(true)

    const { container } = render(
      <StoneClient>
        <p>Client Only</p>
      </StoneClient>
    )

    expect(container.innerHTML).toContain('Client Only')
  })

  it('should render nothing if isClient returns false', () => {
    vi.mocked(isClient).mockReturnValue(false)

    const { container } = render(
      <StoneClient>
        <p>Client Only</p>
      </StoneClient>
    )

    expect(container.innerHTML).toBe('')
  })
})
