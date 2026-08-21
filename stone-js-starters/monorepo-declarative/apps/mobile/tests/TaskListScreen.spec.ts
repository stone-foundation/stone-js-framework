import { stoneApp } from '@stone-js/core'
import { Application } from '../app/Application'
import { ScreenStack } from '@stone-js/use-react-native'
import { TaskListScreen } from '../app/TaskListScreen'
import { NavigationSource } from '@stone-js/react-native-adapter'

/**
 * The mobile application, booted under Node and asked real questions.
 *
 * Nothing is mocked. The kernel, the router, the adapter and the renderer are the ones a phone runs,
 * and the domain is the very same `@acme/domain` the web application uses. What a device adds is a
 * screen to draw on, and this asserts what the framework resolved before drawing.
 *
 * Read it next to `apps/web/tests/TaskListPage.spec.ts`: same domain, same questions, same answers.
 */
describe('TaskListScreen', () => {
  const screens = ScreenStack.create()
  const navigation = NavigationSource.create({ baseUrl: 'acme://app' })

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

  it('toggles a task through the same domain the web app uses', async () => {
    navigation.navigate('acme://app/?toggle=3')
    await settle()

    expect(screens.top()?.title).toBe('0 left · Acme tasks')
  })

  it('surfaces an unknown route instead of crashing', async () => {
    navigation.navigate('acme://app/nowhere')
    await settle()

    // An error page is still a screen: the application stays up and shows something.
    expect(screens.top()?.path).not.toBe('/')
  })
})
