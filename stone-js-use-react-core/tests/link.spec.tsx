import { JSX } from 'react'
import { render } from '@testing-library/react'
import { useLink } from '../src/link'
import { StoneContext } from '../src/StoneContext'

const generate = vi.fn((options: any) => `/notes/${String(options.params?.id ?? '')}`)
const navigate = vi.fn()

let currentRoute: any

const harness = (target: any, pathname = '/notes', logger?: any): { link: any } => {
  const captured: { link: any } = { link: undefined }

  const Probe = (): JSX.Element => {
    captured.link = useLink(target)
    return <span />
  }

  const router = { generate, navigate, getCurrentRoute: () => currentRoute, on: vi.fn(), off: vi.fn() }

  render(
    <StoneContext.Provider value={{
      container: {
        has: (key: string) => key === 'logger' && logger !== undefined,
        make: (key: string) => (key === 'router' ? router : key === 'logger' ? logger : undefined)
      },
      event: { pathname }
    } as any}>
      <Probe />
    </StoneContext.Provider>
  )

  return captured
}

beforeEach(() => {
  vi.clearAllMocks()
  // The implementation too, not only the calls: a test that made `generate` throw would otherwise
  // leave it throwing for every test after it.
  generate.mockImplementation((options: any) => `/notes/${String(options.params?.id ?? '')}`)
  currentRoute = { params: {}, getOption: () => undefined }
})

describe('resolving a link', () => {
  it('is the platform-independent half, so a mobile component can use it', () => {
    // The reason this lives in `@stone-js/use-react-core` rather than next to the anchor: an
    // anchor is a browser element and a route name is not. A React Native application has no `<a>`
    // and needs exactly this.
    const { link } = harness({ name: 'notes.show', params: { id: 42 } })

    expect(link.href).toBe('/notes/42')
    expect(typeof link.navigate).toBe('function')
    expect(link.isCurrent).toBe(false)
  })

  it('hands the router everything `generate` accepts', () => {
    harness({ name: 'notes.index', query: { page: 2 }, hash: 'top', protocol: 'https', withDomain: true })

    expect(generate).toHaveBeenCalledWith({
      name: 'notes.index',
      params: undefined,
      query: { page: 2 },
      hash: 'top',
      protocol: 'https',
      withDomain: true
    })
  })

  it('takes a raw address as it is, and asks the router nothing', () => {
    const { link } = harness({ href: '/raw/path' })

    expect(link.href).toBe('/raw/path')
    expect(generate).not.toHaveBeenCalled()
  })

  it('answers `#` and warns rather than throwing on a name nobody declared', () => {
    generate.mockImplementation(() => { throw new Error('No routes found with this name nope') })

    const { link } = harness({ name: 'nope' })

    expect(link.href).toBe('#')
  })

  it('compares a named link by name and parameters', () => {
    currentRoute = { params: { id: '42' }, getOption: (k: string) => (k === 'name' ? 'notes.show' : undefined) }

    expect(harness({ name: 'notes.show', params: { id: 42 } }).link.isCurrent).toBe(true)
    expect(harness({ name: 'notes.show', params: { id: 7 } }).link.isCurrent).toBe(false)
    expect(harness({ name: 'notes.index' }).link.isCurrent).toBe(false)
  })

  it('is current for every parameter value when it names none', () => {
    // What a navigation highlight wants from `notes.show`: the section is current, whichever note
    // is open.
    currentRoute = { params: { id: '42' }, getOption: (k: string) => (k === 'name' ? 'notes.show' : undefined) }

    expect(harness({ name: 'notes.show' }).link.isCurrent).toBe(true)
  })

  it('compares a raw address against the current path, since there is nothing else', () => {
    expect(harness({ href: '/notes' }, '/notes').link.isCurrent).toBe(true)
    expect(harness({ href: '/other' }, '/notes').link.isCurrent).toBe(false)
  })

  it('navigates by name, leaving the generation to the router', () => {
    harness({ name: 'notes.show', params: { id: 7 } }).link.navigate()

    expect(navigate).toHaveBeenCalledWith({ name: 'notes.show', params: { id: 7 }, query: undefined, hash: undefined })
  })

  it('forwards `replace` only when it was given', () => {
    harness({ href: '/raw' }).link.navigate()
    expect(navigate).toHaveBeenCalledWith('/raw')

    harness({ href: '/raw' }).link.navigate(true)
    expect(navigate).toHaveBeenCalledWith('/raw', true)
  })
})

describe('a link with nothing to point at', () => {
  it('answers `#`, so an anchor still renders', () => {
    expect(harness({}).link.href).toBe('#')
  })
})

describe('where the warning goes', () => {
  it('to the bound logger when the application has one', () => {
    // The framework's own channel first: an application that configured a logger wants its warnings
    // there, next to everything else it records.
    const warn = vi.fn()
    generate.mockImplementation(() => { throw new Error('nope') })

    harness({ name: 'nope' }, '/notes', { warn })

    expect(warn).toHaveBeenCalledWith(expect.stringContaining("no route is named 'nope'"))
  })

  it('to the console when it has none, and never through the static Logger', () => {
    // The static `Logger` throws when it has not been initialised, which would replace a broken
    // link with a broken page in the one path whose job is to survive a mistake.
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    generate.mockImplementation(() => { throw new Error('nope') })

    expect(() => harness({ name: 'nope' })).not.toThrow()
    expect(spy).toHaveBeenCalledWith(expect.stringContaining("no route is named 'nope'"))

    spy.mockRestore()
  })
})
