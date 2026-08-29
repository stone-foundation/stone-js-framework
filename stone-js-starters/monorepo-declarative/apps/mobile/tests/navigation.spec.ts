import { stoneApp } from '@stone-js/core'
import { Application } from '../app/Application'
import { ScreenStack } from '@stone-js/use-react-native'
import { TaskListScreen } from '../app/TaskListScreen'
import { NavigationSource } from '@stone-js/react-native-adapter'

/**
 * Navigation, with the real adapter this time.
 *
 * `TaskListScreen.spec.ts` asks what a route resolves to, which every platform answers the same way.
 * This asks the native question: what lands on the navigation stack, and in what order. So nothing is
 * substituted. The kernel, the router, the React Native adapter and the renderer are the ones a phone
 * runs; what a device adds is a screen to draw on.
 *
 * Two things are supplied rather than discovered, both through documented configuration: the
 * navigation source, so the test can send a deep link, and the screen stack, so it can read what
 * landed on it.
 */
describe('Navigation', () => {
  const screens = ScreenStack.create()
  const navigation = NavigationSource.create({ baseUrl: 'acme://' })

  // Booted once for the whole suite, as on a device: the default blueprints are shared module
  // objects, so booting the same modules twice in one process would accumulate route definitions.
  beforeAll(async () => {
    await stoneApp({
      modules: [
        Application,
        TaskListScreen,
        { stone: { reactNative: { navigationSource: navigation }, useReactNative: { screenStack: screens } } }
      ]
    }).run()
  })

  const settle = async (): Promise<void> => { await new Promise((resolve) => setImmediate(resolve)) }

  it('puts the task list on the stack at launch, counted by the shared domain', () => {
    expect(screens.size()).toBe(1)
    expect(screens.top()?.path).toBe('/')
    expect(screens.top()?.title).toBe('1 left · Acme tasks')
  })

  it('routes a deep link through the same domain the web app uses', async () => {
    navigation.navigate('acme://?toggle=3')
    await settle()

    expect(screens.top()?.title).toBe('0 left · Acme tasks')
  })

  it('re-resolving the current route replaces it instead of stacking a duplicate', () => {
    // A user walking back must not find two identical screens, so the stack swaps the top.
    expect(screens.size()).toBe(1)
  })

  it('surfaces an unknown route instead of crashing', async () => {
    navigation.navigate('acme://nowhere')
    await settle()

    // An error page is still a screen: the application stays up and shows something.
    expect(screens.top()?.path).not.toBe('/')
  })
})
