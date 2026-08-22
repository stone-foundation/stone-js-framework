import { JSX } from 'react'
import { siblings } from '../../nav'
import { Code, CodeTabs } from '../../components/Code'
import { StoneLink } from '@stone-js/use-react'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Aphorism, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/frontend/native'

const SCREEN_DECL = `
import { View, Text } from 'react-native'
import { IPage, Page, PageRenderContext, ReactIncomingEvent } from '@stone-js/use-react-native'

@Page('/tasks/:id')
export class TaskScreen implements IPage<ReactIncomingEvent> {
  constructor (private readonly tasks: TaskService) {}

  async handle (event: ReactIncomingEvent) {
    return await this.tasks.find(event.get('id'))
  }

  head ({ data }) {
    return { title: data.title }   // what a navigator shows in its header
  }

  render ({ data }: PageRenderContext<Task>) {
    return <View><Text>{data.title}</Text></View>
  }
}
`

const SCREEN_IMP = `
import { View, Text } from 'react-native'
import { definePage, IPage, ReactIncomingEvent } from '@stone-js/use-react-native'

export const TaskScreen = ({ tasks }: { tasks: TaskService }): IPage<ReactIncomingEvent> => ({
  async handle (event) {
    return await tasks.find(event.get('id'))
  },

  head ({ data }) {
    return { title: data.title }
  },

  render ({ data }) {
    return <View><Text>{data.title}</Text></View>
  }
})

export const TaskScreenBlueprint = definePage(TaskScreen, { path: '/tasks/:id' })
`

/**
 * Frontend: native screens.
 */
@Page(PATH, { layout: 'docs' })
export class Native implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Native screens',
      description: 'The React Native renderer: your pages become screens, the screens form a stack, and navigation goes through the router.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Frontend' title='Native screens' />
        <Lead>
          <code>@stone-js/use-react-native</code> is the view dimension on a phone. A resolved route
          becomes a screen, screens form a stack, and everything a page is made of comes from the
          same place the web renderer takes it from. There is no native variant of a page to learn.
        </Lead>

        <H2>A screen is a page</H2>
        <p>
          The <code>@Page</code> decorator, layouts, error pages, view providers and the hooks all
          come from <code>@stone-js/use-react-core</code>, shared with{' '}
          <StoneLink to='/docs/frontend'>the web renderer</StoneLink>. A component imports them from
          the renderer it runs on, and nothing else changes.
        </p>
        <CodeTabs file='app/TaskScreen.tsx' lang='tsx' decl={SCREEN_DECL} imp={SCREEN_IMP} />
        <p>
          On a phone there are no meta tags, so <code>head</code> means something slightly different
          and nothing more: the title is what a navigator shows in its header.
        </p>

        <H2>The stack, as plain state</H2>
        <p>
          This is the seam of the whole renderer. A browser has one document and replaces its
          contents; a phone has a stack of screens, each keeping its own state, with a back gesture
          that pops the top one. So the renderer does not render: it puts what the kernel resolved
          onto a stack, and whatever displays screens reacts.
        </p>
        <Aphorism>
          The stack is public state, which is what lets you choose who displays it.
        </Aphorism>
        <p>
          Keeping it as plain state, with no React and no navigation library in sight, has three
          consequences worth naming. A first run works with nothing installed. A real navigator can
          drive itself from the same object without this package depending on it. And the navigation
          semantics are testable without a device.
        </p>

        <H2>Showing the screens</H2>
        <H3>The floor</H3>
        <p>
          <code>StoneNativeApp</code> shows the screen on top of the stack. It is the simplest thing
          that works, with nothing to install and nothing to link.
        </p>
        <Code file='App.tsx' lang='tsx'>{`import { StoneNativeApp } from '@stone-js/use-react-native'

export default function App () {
  return <StoneNativeApp fallback={<Splash />} />
}`}</Code>

        <H3>A real navigator</H3>
        <p>
          The platform's own transitions, the swipe-back gesture, the hardware back button, and a
          screen keeping its own state while another covers it are things only a native navigator
          gives you, and none of them can be imitated in JavaScript. Two commands and one import
          away.
        </p>
        <Code file='terminal' lang='bash'>{`npx expo install @react-navigation/native @react-navigation/native-stack \\
  react-native-screens react-native-safe-area-context`}</Code>
        <Code file='App.tsx' lang='tsx'>{`import { StoneNativeStack } from '@stone-js/use-react-native/navigation'

export default function App () {
  return <StoneNativeStack screenOptions={{ headerShown: true }} />
}`}</Code>
        <p>
          Nothing about your pages changes. Each screen becomes a native one, keyed by its own
          identity so the navigator keeps its state as the stack grows, and titled from the page's{' '}
          <code>head</code>.
        </p>

        <Callout kind='note' title='Behind a subpath, and depending on nothing'>
          <code>StoneNativeStack</code> lives behind <code>/navigation</code> so React Navigation and
          its native dependencies stay optional: an application happy with the floor installs none of
          them, and a bundler never looks for them. The package's main entry imports nothing from
          them at all.
        </Callout>

        <H2>The one thing worth understanding</H2>
        <p>
          There are two stacks and one truth. The router owns navigation, so Stone's stack is the
          truth and the navigator displays it. A screen can then leave the navigator for two
          different reasons, and only one of them needs answering.
        </p>
        <ul>
          <li>
            <strong>The user swiped back</strong>, or pressed the hardware button. The navigator
            removed the screen and the framework knows nothing about it, so its stack still has the
            screen on top. It gets popped, and the two agree again.
          </li>
          <li>
            <strong>The framework popped it already</strong>, through <code>useGoBack</code> or a
            reset. The navigator is only catching up with a render it was given, and popping again
            would eat the screen underneath.
          </li>
        </ul>
        <p>
          Comparing the departing screen's key with what the stack now has on top separates the two
          exactly, with no flag to keep and no window in which a fast double-back does the wrong
          thing. That comparison is <code>shouldPopStone</code>, exported next to the component, and
          it is the part to read before writing your own navigator.
        </p>

        <H2>Navigating</H2>
        <p>
          Navigation goes through the router, so the route is matched, its loader runs and its
          middleware runs, exactly as they would for a deep link. A screen never renders another
          screen itself.
        </p>
        <Code file='app/TaskList.tsx' lang='tsx'>{`import { useNavigate, useGoBack } from '@stone-js/use-react-native'

const navigate = useNavigate()

navigate('/tasks/42')                                 // push a screen
navigate('/tasks/42', 'replace')                      // swap the current one
navigate('/sign-in', 'reset')                         // start again, leaving no history
navigate({ name: 'tasks.show', params: { id: 42 } })  // by route name`}</Code>
        <p>
          <code>useGoBack()</code> returns <code>{'{ goBack, canGoBack }'}</code>. Wire{' '}
          <code>goBack</code> to your header button and to Android's hardware button, and let the
          platform leave the application when <code>canGoBack</code> is false. The stack never pops
          its last screen: an application always displays something, and a back gesture on the first
          screen is the platform's business.
        </p>

        <H2>Nothing lists your screens</H2>
        <p>
          A web application never lists its pages: the build collects them. A native one should not
          have to either, and the only reason it once did is that collection is a bundler question.
          The web build asks Vite for <code>import.meta.glob</code>; Metro has no such thing and
          would not understand one.
        </p>
        <p>
          So the question is answered before any bundler runs. <code>withStone</code> wraps a Metro
          configuration, collects everything under <code>app/</code> and writes{' '}
          <code>.stone/modules.ts</code>: real static imports, which is what Metro needs to see,
          extensionless so per-platform files such as <code>HomePage.ios.tsx</code> still win as they
          would for hand-written code, and sorted so the file is byte-identical between two runs on
          the same tree.
        </p>
        <Code file='metro.config.js' lang='js'>{`const { getDefaultConfig } = require('expo/metro-config')
const { withStone } = require('@stone-js/use-react-native/metro')

module.exports = withStone(getDefaultConfig(__dirname), __dirname)`}</Code>
        <Code file='index.ts'>{`import { modules } from './.stone/modules'

stoneApp({ modules }).run()`}</Code>

        <Callout kind='note' title='Why the Metro configuration and not a command'>
          Metro loads that file whatever brought it up, so <code>expo start</code>,{' '}
          <code>expo run:ios</code> and an EAS build all get the generation without anyone
          remembering to ask. A command could not make that claim. It runs when Metro starts rather
          than continuously, so adding a screen to a running dev server means restarting it; editing
          one needs nothing, Fast Refresh was never involved.
        </Callout>

        <p>
          Add <code>.stone/</code> to your <code>.gitignore</code>. If you need the file without
          starting a bundler, for a type-check on a fresh clone or a CI step that does not bundle,{' '}
          <code>writeManifest</code> is exported from the same entry.
        </p>
        <Code file='package.json' lang='json'>{`{
  "scripts": {
    "modules": "node -e \\"require('@stone-js/use-react-native/metro').writeManifest(process.cwd())\\"",
    "typecheck": "npm run modules && tsc --noEmit"
  }
}`}</Code>

        <H2>Developing in a browser</H2>
        <p>
          The fastest loop on a native application is not a simulator, it is a browser tab. Expo
          serves a React Native application to one through <code>react-native-web</code>, with Fast
          Refresh, and the same code then runs on a device untouched.
        </p>
        <Code file='terminal' lang='bash'>{`npx expo install react-dom react-native-web
npx expo start --web`}</Code>
        <p>
          What you get is the real thing: your routes resolve, your loaders run, your screens render,
          deep links arrive as URLs. What you do not get is anything a browser cannot do, and that is
          worth knowing before trusting the loop for a given screen. <code>react-native-web</code>{' '}
          covers the core primitives, not every native module, so a screen built on the camera, on
          secure storage or on a native gesture handler has to be tried on a device. Layout is close
          but not identical, and performance in a tab says nothing about a phone.
        </p>

        <H2>Testing</H2>
        <p>
          Your domain, your routes and your loaders test without a device or a simulator, in the same
          shape a web application uses. Name the platform, because a native application's renderer
          registers itself against it, and send the event a phone receives.
        </p>
        <Code file='tests/TaskScreen.spec.ts'>{`import { createTestApp } from '@stone-js/testing'
import { makeIncomingBrowserEvent } from '@stone-js/testing/browser'
import { REACT_NATIVE_PLATFORM } from '@stone-js/react-native-adapter'

const app = await createTestApp({ platform: REACT_NATIVE_PLATFORM })

const response = await app.send(makeIncomingBrowserEvent({ url: 'myapp://tasks/42' }))

expect(response.statusCode).toBe(200)`}</Code>
        <p>
          A deep link is a URL with your own scheme, and the factory keeps schemes rather than
          resolving them away, so the route a phone reaches is the route a test reaches. For the
          native question, what lands on the stack and in what order, supply your own screen stack and
          navigation source and assert against them: both are configuration, not internals.
        </p>

        <H2>Configuration</H2>
        <PropsTable rows={[
          { name: 'stone.useReactNative.screenStack', type: 'ScreenStack', desc: 'The navigation stack. Created for you during the build phase and shared with the runtime, the response middleware and the components. Set it to supply your own, which is how a test reads what landed.' },
          { name: 'stone.useReact.*', type: 'various', desc: 'Pages, layouts, error pages and view providers are configured under the same keys the web renderer reads, because they are declared the same way and there is no reason for a page to be declared twice.' }
        ]} />

        <SeeAlso links={[
          { title: 'React Native adapter', path: '/docs/adapters/mobile' },
          { title: 'Mobile context', path: '/docs/contexts/mobile' },
          { title: 'Pages', path: '/docs/frontend/pages' },
          { title: 'Testing', path: '/docs/extensions/testing' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
