import { LinkingLike } from '../src/declarations'
import { NavigationSource, defaultLinkingResolver } from '../src/NavigationSource'

/**
 * A stand-in for React Native's `Linking`, so the deep-link path is exercised without a
 * native runtime.
 */
const makeLinking = (initialUrl: string | null = null): LinkingLike & { fire: (url: string) => void, removed: boolean } => {
  let handler: ((event: { url: string }) => void) | undefined
  const linking = {
    removed: false,
    getInitialURL: async () => initialUrl,
    addEventListener (_type: 'url', fn: (event: { url: string }) => void) {
      handler = fn
      return { remove: () => { linking.removed = true } }
    },
    fire (url: string) { handler?.({ url }) }
  }
  return linking
}

describe('NavigationSource', () => {
  it('should resolve an in-app path against the base URL', () => {
    const source = NavigationSource.create()

    expect(source.resolveUrl('/tasks').href).toBe('stone://app/tasks')
  })

  it('should keep a deep link\'s own scheme, and read everything after it as the path', () => {
    // This used to expect `/tasks/42`, dropping `open` as though it were a host. It is not: a
    // custom scheme has no authority, and every platform delivers a deep link verbatim. Treating
    // the first segment as a host is what sent `myapp://discover` to `/`.
    const source = NavigationSource.create()

    const url = source.resolveUrl('myapp://open/tasks/42?from=push')

    expect(url.protocol).toBe('myapp:')
    expect(url.pathname).toBe('/open/tasks/42')
    expect(url.searchParams.get('from')).toBe('push')
  })

  it('should resolve against a configured base URL', () => {
    const source = NavigationSource.create({ baseUrl: 'myapp://app' })

    expect(source.resolveUrl('/profile').href).toBe('myapp://app/profile')
  })

  it('should notify listeners of an in-app navigation', () => {
    const source = NavigationSource.create()
    const listener = vi.fn()
    source.subscribe(listener)

    source.navigate('/tasks', { replace: true })

    expect(listener).toHaveBeenCalledWith({ url: '/tasks', metadata: { replace: true }, origin: 'in-app' })
  })

  it('should stop notifying a listener that unsubscribed', () => {
    const source = NavigationSource.create()
    const listener = vi.fn()
    const unsubscribe = source.subscribe(listener)

    unsubscribe()
    source.navigate('/tasks')

    expect(listener).not.toHaveBeenCalled()
  })

  it('should return the launch URL and forward deep links delivered later', async () => {
    const linking = makeLinking('myapp://open/tasks/7')
    const source = NavigationSource.create({ linkingResolver: () => linking })
    const listener = vi.fn()
    source.subscribe(listener)

    const launchUrl = await source.bind()
    linking.fire('myapp://open/tasks/9')

    expect(launchUrl).toBe('myapp://open/tasks/7')
    expect(listener).toHaveBeenCalledWith({ url: 'myapp://open/tasks/9', origin: 'deep-link' })
  })

  it('should report no launch URL when the application was opened normally', async () => {
    const source = NavigationSource.create({ linkingResolver: () => makeLinking(null) })

    expect(await source.bind()).toBeUndefined()
  })

  it('should work on a platform with no linking module at all', async () => {
    const source = NavigationSource.create({ linkingResolver: () => undefined })

    expect(await source.bind()).toBeUndefined()
  })

  it('should replace a previous subscription when bound twice', async () => {
    const linking = makeLinking()
    const source = NavigationSource.create({ linkingResolver: () => linking })

    await source.bind()
    await source.bind()

    expect(linking.removed).toBe(true)
  })

  it('should remove the platform subscription on unbind', async () => {
    const linking = makeLinking()
    const source = NavigationSource.create({ linkingResolver: () => linking })

    await source.bind()
    source.unbind()

    expect(linking.removed).toBe(true)
  })

  it('should tolerate unbind before bind', () => {
    expect(() => NavigationSource.create().unbind()).not.toThrow()
  })

  it('should drop every listener on clear', async () => {
    const linking = makeLinking()
    const source = NavigationSource.create({ linkingResolver: () => linking })
    const listener = vi.fn()
    source.subscribe(listener)
    await source.bind()

    source.clear()
    source.navigate('/tasks')

    expect(listener).not.toHaveBeenCalled()
    expect(linking.removed).toBe(true)
  })

  it('should launch on the base path when there is no launch URL', () => {
    expect(NavigationSource.create().makeLaunchIntent()).toEqual({ url: '/', origin: 'launch' })
  })

  it('should launch on the URL the application was opened with', () => {
    expect(NavigationSource.create().makeLaunchIntent('myapp://open/tasks')).toEqual({
      url: 'myapp://open/tasks',
      origin: 'launch'
    })
  })

  it('should resolve to nothing when react-native is absent', async () => {
    // The package is not installed here, which is the Node case the resolver must survive.
    expect(await defaultLinkingResolver()).toBeUndefined()
  })
})

describe('resolveUrl, against what a phone actually delivers', () => {
  const source = (baseUrl?: string): any => NavigationSource.create(baseUrl === undefined ? {} : { baseUrl })

  it('routes a deep link to the path the user wrote, not to its first segment', () => {
    // The defect this exists for. A custom scheme is not a special scheme, so WHATWG reads the
    // first segment as an authority: `myapp://tasks/42` parsed as host `tasks`, path `/42`, and the
    // router served `/42`. Worse, `myapp://discover` parsed as host `discover`, path '', and the
    // router answered `/` with 200: the wrong screen, and nothing looking wrong.
    expect(source().resolveUrl('myapp://tasks/42').pathname).toBe('/tasks/42')
    expect(source().resolveUrl('myapp://discover').pathname).toBe('/discover')
    expect(source().resolveUrl('myapp://orgs/klere').pathname).toBe('/orgs/klere')
  })

  it('keeps the query and the fragment a deep link carries', () => {
    const url = source().resolveUrl('myapp://tasks?page=2#top')

    expect(url.pathname).toBe('/tasks')
    expect(url.search).toBe('?page=2')
    expect(url.hash).toBe('#top')
  })

  it('handles a deep link with no path at all', () => {
    expect(source().resolveUrl('myapp://').pathname).toBe('/')
    expect(source().resolveUrl('myapp://?name=Ada').search).toBe('?name=Ada')
  })

  it('handles the triple-slash form, where there is no authority to mistake', () => {
    expect(source().resolveUrl('myapp:///tasks/42').pathname).toBe('/tasks/42')
  })

  it('leaves an http URL alone, because there the authority is an authority', () => {
    const url = source().resolveUrl('https://example.test/tasks/42')

    expect(url.host).toBe('example.test')
    expect(url.pathname).toBe('/tasks/42')
  })

  it('still resolves an in-app path against the base', () => {
    expect(source().resolveUrl('/tasks/42').pathname).toBe('/tasks/42')
    expect(source('myapp://x').resolveUrl('/tasks').pathname).toBe('/tasks')
  })
})
