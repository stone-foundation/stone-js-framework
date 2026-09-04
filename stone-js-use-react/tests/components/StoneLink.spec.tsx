import { JSX } from 'react'
import { Logger } from '@stone-js/core'
import { Router } from '@stone-js/router'
import { StoneContext } from '@stone-js/use-react-core'
import { StoneLink } from '../../src/components/StoneLink'
import { render, fireEvent, RenderResult } from '@testing-library/react'

const mockNavigate = vi.fn()
const mockGenerate = vi.fn((to) => (typeof to === 'string' ? to : '/generated-path'))

/** The current route, as the router reports it: a name and its bound parameters. */
let currentRoute: any = {
  path: '/about',
  params: {},
  getOption: (key: string) => (key === 'name' ? 'about' : undefined)
}

const mockRouter = {
  navigate: mockNavigate,
  generate: mockGenerate,
  getCurrentRoute: () => currentRoute,
  on: vi.fn(),
  off: vi.fn()
} as unknown as Router

/**
 * The context a page really gets.
 *
 * The link resolves the router through `useRouter()` now, the same hook every other component uses,
 * rather than reaching into the container for the `Router` class itself. So the harness binds it
 * under the name the hook asks for, and publishes an event, which is what tells a raw `href` whether
 * it is the current one.
 */
const renderWithContext = (ui: JSX.Element, pathname: string = '/about'): RenderResult =>
  render(
    <StoneContext.Provider value={{
      container: {
        // A container answers `has` as well as `make`: the stub says so, because the link asks it
        // whether a logger is bound before reporting a route name it could not resolve.
        has: (key: string) => key === 'router',
        make: (key: string) => (key === 'router' ? mockRouter : undefined)
      },
      event: { pathname }
    } as any}>
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

  it('logs a warning when nothing says where the link points', () => {
    const warnSpy = vi.spyOn(Logger, 'warn').mockImplementation(() => {})

    renderWithContext(
      // @ts-expect-error - testing purpose
      <StoneLink>Missing</StoneLink>
    )

    expect(warnSpy).toHaveBeenCalledWith('StoneLink: missing "name", "href" or "to"')

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

describe('a link that names its route', () => {
  beforeEach(() => {
    mockGenerate.mockImplementation((options: any) => {
      const path = String(options.name).replace('notes.show', '/notes/:id').replace('notes.index', '/notes')
      return path.replace(':id', String(options.params?.id ?? ''))
    })
  })

  it('generates its address through the router, from the name and the parameters', () => {
    // The form to prefer: the router owns the shape of every path, so a link that names a route
    // cannot go stale the day that path changes. And the generation is the router's, so a link and a
    // redirect built from the same name cannot disagree.
    const { getByRole } = renderWithContext(
      <StoneLink name='notes.show' params={{ id: 42 }}>Read it</StoneLink>
    )

    expect(mockGenerate).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'notes.show', params: { id: 42 } })
    )
    expect(getByRole('link').getAttribute('href')).toBe('/notes/42')
  })

  it('passes everything `generate` accepts, not only the parameters', () => {
    renderWithContext(
      <StoneLink name='notes.index' query={{ page: 2 }} hash='top' protocol='https' withDomain>
        Page 2
      </StoneLink>
    )

    expect(mockGenerate).toHaveBeenCalledWith({
      name: 'notes.index',
      params: undefined,
      query: { page: 2 },
      hash: 'top',
      protocol: 'https',
      withDomain: true
    })
  })

  it('navigates by name, so the router generates the path once', () => {
    const { getByRole } = renderWithContext(
      <StoneLink name='notes.show' params={{ id: 7 }}>Read it</StoneLink>
    )

    fireEvent.click(getByRole('link'))

    expect(mockNavigate).toHaveBeenCalledWith({ name: 'notes.show', params: { id: 7 }, query: undefined, hash: undefined })
  })

  it('is marked current by its route name, not by comparing a path to a pattern', () => {
    // What used to be broken for every parameterised route: the selected class compared the
    // generated `/notes/42` against the current route's pattern `/notes/:id`, which are never equal,
    // so a link to a route with a parameter was never highlighted.
    currentRoute = {
      path: '/notes/:id',
      params: { id: '42' },
      getOption: (key: string) => (key === 'name' ? 'notes.show' : undefined)
    }

    const { getByRole } = renderWithContext(
      <StoneLink name='notes.show' params={{ id: 42 }} selectedClass='on'>Read it</StoneLink>
    )

    const link = getByRole('link')

    expect(link.className).toContain('on')
    expect(link.getAttribute('aria-current')).toBe('page')
  })

  it('is not current when the same route is displayed with other parameters', () => {
    currentRoute = {
      path: '/notes/:id',
      params: { id: '7' },
      getOption: (key: string) => (key === 'name' ? 'notes.show' : undefined)
    }

    const { getByRole } = renderWithContext(
      <StoneLink name='notes.show' params={{ id: 42 }} selectedClass='on'>Read it</StoneLink>
    )

    expect(getByRole('link').className).not.toContain('on')
    expect(getByRole('link').getAttribute('aria-current')).toBeNull()
  })

  it('renders inert and says which name it could not resolve', () => {
    // A mistyped name must not take the page down: the link renders pointing nowhere, and says which
    // name could not be resolved. Through `console` here, because this harness binds no logger: the
    // static `Logger` is deliberately not used, since it throws when it has not been initialised.
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mockGenerate.mockImplementation(() => { throw new Error('No routes found with this name nope') })

    const { getByRole } = renderWithContext(<StoneLink name='nope'>Nowhere</StoneLink>)

    expect(getByRole('link').getAttribute('href')).toBe('#')
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("no route is named 'nope'"))

    warnSpy.mockRestore()
  })
})
