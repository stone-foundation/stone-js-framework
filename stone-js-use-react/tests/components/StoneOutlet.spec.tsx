import { act } from 'react'
import { STONE_PAGE_EVENT_OUTLET } from '../../src/constants'
import { StoneOutlet } from '../../src/components/StoneOutlet'
import { render, screen, cleanup } from '@testing-library/react'

describe('StoneOutlet', () => {
  beforeEach(() => {
    cleanup()
  })

  it('renders initial children', () => {
    render(
      <StoneOutlet>
        <p>Initial content</p>
      </StoneOutlet>
    )

    expect(screen.getByText('Initial content')).toBeDefined()
  })

  it('updates view on event dispatch with valid detail', () => {
    render(
      <StoneOutlet>
        <p>Initial</p>
      </StoneOutlet>
    )

    const newContent = <div>Updated content</div>

    act(() => {
      window.dispatchEvent(
        new CustomEvent(STONE_PAGE_EVENT_OUTLET, { detail: newContent })
      )
    })

    expect(screen.getByText('Updated content')).toBeDefined()
  })

  it('ignores event with empty detail', () => {
    render(
      <StoneOutlet>
        <p>Initial</p>
      </StoneOutlet>
    )

    act(() => {
      window.dispatchEvent(new CustomEvent(STONE_PAGE_EVENT_OUTLET, { detail: null }))
    })

    expect(screen.getByText('Initial')).toBeDefined()
  })

  it('cleans up event listener on unmount', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')

    const { unmount } = render(<StoneOutlet><span>Test</span></StoneOutlet>)
    unmount()

    expect(addSpy).toHaveBeenCalledWith(STONE_PAGE_EVENT_OUTLET, expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith(STONE_PAGE_EVENT_OUTLET, expect.any(Function))
  })
})
