import { stoneApp } from '@stone-js/core'
import { Application } from '../app/Application'
import { HomeScreen } from '../app/HomeScreen'
import { ScreenStack } from '@stone-js/use-react-native'
import { NavigationSource } from '@stone-js/react-native-adapter'

/**
 * Navigation, with the real adapter this time.
 *
 * `HomeScreen.spec.ts` asks what a route resolves to, which is the same question on every platform
 * and needs no adapter. This asks the native question instead: what lands on the navigation stack,
 * and in what order. So nothing is substituted here. The kernel, the router, the React Native adapter
 * and the renderer are the ones a phone runs; what a device adds is a screen to draw on.
 *
 * Two things are supplied rather than discovered, both through documented configuration: the
 * navigation source, so the test can send a deep link, and the screen stack, so it can read what
 * landed on it.
 *
 * Screens are listed here because the generated manifest (`.stone/modules.ts`) is Metro's, written
 * when Metro starts. Under a test runner the modules are imported directly, which is the same set.
 */
describe('Navigation', () => {
  const screens = ScreenStack.create()
  const navigation = NavigationSource.create({ baseUrl: 'stone://' })

  // Booted once for the whole suite, as on a device: the default blueprints are shared module
  // objects, so booting the same modules twice in one process would accumulate route definitions.
  beforeAll(async () => {
    await stoneApp({
      modules: [
        Application,
        HomeScreen,
        { stone: { reactNative: { navigationSource: navigation }, useReactNative: { screenStack: screens } } }
      ]
    }).run()
  })

  const settle = async (): Promise<void> => { await new Promise((resolve) => setImmediate(resolve)) }

  it('puts the home screen on the stack at launch', () => {
    expect(screens.size()).toBe(1)
    expect(screens.top()?.path).toBe('/')
    expect(screens.top()?.title).toBe('World · Welcome to Stone.js')
  })

  it('routes a deep link to the screen that owns it, parameters included', async () => {
    navigation.navigate('stone://?name=Ada')
    await settle()

    expect(screens.top()?.title).toBe('Ada · Welcome to Stone.js')
  })

  it('re-resolving the current route replaces it instead of stacking a duplicate', () => {
    // The deep link above resolved `/` again with fresh data. A user walking back must not find
    // two identical screens, so the stack swaps the top rather than growing.
    expect(screens.size()).toBe(1)
  })

  it('surfaces an unknown route instead of crashing', async () => {
    navigation.navigate('stone://nowhere')
    await settle()

    // An error page is still a screen: the application stays up and shows something.
    expect(screens.top()?.path).not.toBe('/')
  })
})
