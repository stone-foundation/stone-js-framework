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

  it('should keep a deep link\'s own scheme and host', () => {
    const source = NavigationSource.create()

    const url = source.resolveUrl('myapp://open/tasks/42?from=push')

    expect(url.protocol).toBe('myapp:')
    expect(url.pathname).toBe('/tasks/42')
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
