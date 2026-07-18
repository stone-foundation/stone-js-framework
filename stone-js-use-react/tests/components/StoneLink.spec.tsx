import { JSX } from 'react'
import { Logger } from '@stone-js/core'
import { Router } from '@stone-js/router'
import { StoneContext } from '../../src/StoneContext'
import { StoneLink } from '../../src/components/StoneLink'
import { render, fireEvent, RenderResult } from '@testing-library/react'

const mockNavigate = vi.fn()
const mockGenerate = vi.fn((to) => (typeof to === 'string' ? to : '/generated-path'))

const mockRouter = {
  navigate: mockNavigate,
  generate: mockGenerate,
  getCurrentRoute: () => ({ path: '/about' }),
  on: vi.fn((_, handler) => handler({ get: () => ({ path: '/about' }) })),
  off: vi.fn()
} as unknown as Router

const renderWithContext = (ui: JSX.Element): RenderResult =>
  render(
    <StoneContext.Provider value={{ container: { resolve: () => mockRouter } } as any}>
      {ui}
    </StoneContext.Provider>
  )

beforeEach(() => {
  vi.clearAllMocks()
})

describe('StoneLink', () => {
  it('renders an external link', () => {
    const { getByRole } = renderWithContext(
      <StoneLink href='https://example.com' external>
        External
      </StoneLink>
    )

    const link = getByRole('link')
    expect(link.textContent).toBe('External')
    expect(link.getAttribute('href')).toBe('https://example.com')
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
    expect(link.getAttribute('target')).toBe('_blank')
  })

  it('renders an internal link', () => {
    const { getByRole } = renderWithContext(
      <StoneLink to='/home'>Home</StoneLink>
    )

    const link = getByRole('link')
    expect(link.textContent).toBe('Home')
    expect(link.getAttribute('href')).toBe('/home')
  })

  it('navigates using router on click', () => {
    const { getByRole } = renderWithContext(
      <StoneLink to='/home'>Home</StoneLink>
    )

    const link = getByRole('link')
    fireEvent.click(link)

    expect(mockNavigate).toHaveBeenCalledWith('/home')
  })

  it('does not intercept modified clicks (open in new tab keeps working)', () => {
    const { getByRole } = renderWithContext(
      <StoneLink to='/home'>Home</StoneLink>
    )

    const link = getByRole('link')
    fireEvent.click(link, { metaKey: true })

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('calls router.generate when to is an object', () => {
    const routeObj = { name: 'user', params: { id: '1' } }

    renderWithContext(
      <StoneLink to={routeObj}>User</StoneLink>
    )

    expect(mockGenerate).toHaveBeenCalledWith(routeObj)
  })

  it('respects noRel prop', () => {
    const { getByRole } = renderWithContext(
      <StoneLink href='https://no-rel.com' noRel>
        NoRel
      </StoneLink>
    )

    const link = getByRole('link')
    expect(link.getAttribute('rel')).toBeNull()
  })

  it('calls user onClick before navigation', () => {
    const onClick = vi.fn()

    const { getByRole } = renderWithContext(
      <StoneLink to='/home' onClick={onClick}>
        Home
      </StoneLink>
    )

    const link = getByRole('link')
    fireEvent.click(link)

    expect(onClick).toHaveBeenCalled()
    expect(mockNavigate).toHaveBeenCalledWith('/home')
  })

  it('does not navigate if event is prevented', () => {
    const onClick = vi.fn((e) => e.preventDefault())

    const { getByRole } = renderWithContext(
      <StoneLink to='/home' onClick={onClick}>
        Home
      </StoneLink>
    )

    const link = getByRole('link')
    fireEvent.click(link)

    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('applies selected class when route matches', () => {
    const { getByRole } = renderWithContext(
      <StoneLink to='/about'>About</StoneLink>
    )

    const link = getByRole('link')
    expect(link.className).toContain('selected')
  })

  it('sets aria-current only when selected', () => {
    const { getByRole } = renderWithContext(
      <StoneLink to='/about'>About</StoneLink>
    )

    const link = getByRole('link')
    expect(link.getAttribute('aria-current')).toBe('page')
  })

  it('logs a warning when neither "to" nor "href" is provided', () => {
    const warnSpy = vi.spyOn(Logger, 'warn').mockImplementation(() => {})

    renderWithContext(
      // @ts-expect-error - testing purpose
      <StoneLink>Missing</StoneLink>
    )

    expect(warnSpy).toHaveBeenCalledWith('StoneLink: missing "to" or "href"')

    warnSpy.mockRestore()
  })

  it('does not set aria-current when not selected', () => {
    const { getByRole } = renderWithContext(
      <StoneLink to='/home'>Home</StoneLink>
    )

    const link = getByRole('link')
    expect(link.getAttribute('aria-current')).toBeNull()
  })
})
