import { JSX } from 'react'
import { siblings } from '../../nav'
import { Code, CodeTabs } from '../../components/Code'
import { StoneLink } from '@stone-js/use-react'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/adapters/mobile'

const DECL = `
import { Routing } from '@stone-js/router'
import { StoneApp } from '@stone-js/core'
import { UseReactNative } from '@stone-js/use-react-native'
import { ReactNative } from '@stone-js/react-native-adapter'

@Routing()
@ReactNative()      // run on a phone
@UseReactNative()
@StoneApp({ name: 'tasks' })
export class Application {}
`

const IMP = `
import { routerBlueprint } from '@stone-js/router'
import { defineStoneReactNativeApp } from '@stone-js/use-react-native'
import { reactNativeAdapterBlueprint } from '@stone-js/react-native-adapter'

export const Application = defineStoneReactNativeApp(
  { name: 'tasks' },
  [routerBlueprint, reactNativeAdapterBlueprint]
)
`

const ENTRY = `
// Platform polyfills first, before anything from Stone.js loads.
import 'react-native-url-polyfill/auto'

import { stoneApp } from '@stone-js/core'
import { registerRootComponent } from 'expo'
import { modules } from './.stone/modules'
import App from './App'

void stoneApp({ modules }).run()

registerRootComponent(App)
`

/**
 * Adapters: React Native.
 */
@Page(PATH, { layout: 'docs' })
export class Mobile implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'React Native adapter',
      description: 'Run the app on a phone: the adapter that turns deep links, in-app navigation and the launch intent into incoming events.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Adapters' title='React Native' />
        <Lead>
          <code>@stone-js/react-native-adapter</code> makes a phone a context like any other. It
          captures native causes, a launch, a deep link, an in-app navigation, normalises them into
          incoming events, and hands the resolution back to the renderer. Paired with{' '}
          <StoneLink to='/docs/frontend/native'>use-react-native</StoneLink> it runs your pages as
          screens.
        </Lead>

        <H2>Install &amp; enable</H2>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/react-native-adapter @stone-js/use-react-native react-native-url-polyfill`}</Code>
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />

        <Callout kind='important' title='Two things a React Native project must set up'>
          React Native's built-in <code>URL</code> is a stub without a usable <code>pathname</code>,
          and the router reads <code>pathname</code> on every event, so the polyfill is required
          rather than optional. And <code>babel-preset-expo</code> applies the decorators plugin
          itself, in legacy mode by default: configure the semantics through the preset's own option
          and never add the plugin separately, or Babel reports the two plugins as a conflict.
        </Callout>

        <Code file='babel.config.js' lang='js'>{`module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      ['babel-preset-expo', { decorators: { version: '2023-11' } }]
    ]
  }
}`}</Code>

        <H2>What it captures</H2>
        <PropsTable rows={[
          { name: 'launch', type: 'on start', desc: 'The URL the application was opened with, or `/` when it was opened plainly. Every run therefore begins with a resolved route.' },
          { name: 'deep link', type: 'while running', desc: 'A URL with your own scheme, `myapp://tasks/42`, matched by the router like any other path.' },
          { name: 'in-app navigation', type: 'from a screen', desc: '`useNavigate()` goes through the router, so a screen never renders another screen itself.' }
        ]} />
        <p>
          All three arrive as the same kind of event a browser application receives, which is why the
          pages, the middleware and the loaders are unchanged. What the adapter never does is decide
          what a resolution looks like: that is the renderer's job, and the split is the same one
          every Stone.js platform is built along.
        </p>

        <H2>Deep links</H2>
        <p>
          Declare your scheme in <code>app.json</code> and the adapter does the rest: the launch URL
          and every later link are read through React Native's own linking module and dispatched.
        </p>
        <Code file='app.json' lang='json'>{`{
  "expo": {
    "scheme": "myapp"
  }
}`}</Code>
        <p>
          <code>myapp://tasks/42</code> then reaches the page that owns <code>/tasks/:id</code>, with{' '}
          <code>42</code> readable through <code>event.get('id')</code>. A query string works as it
          does anywhere else.
        </p>

        <H2>The entry point</H2>
        <p>
          One boot, one root component. The module list comes from a file the build generates, which
          is explained on the <StoneLink to='/docs/frontend/native'>native screens</StoneLink> page.
        </p>
        <Code file='index.ts'>{ENTRY}</Code>

        <H2>Configuration</H2>
        <PropsTable rows={[
          { name: 'stone.reactNative.navigationSource', type: 'NavigationSource', desc: 'The source of navigation events. Supply your own to drive the application from a test, or to change the base URL its links are resolved against.' },
          { name: 'baseUrl', type: 'string', default: 'stone://app', desc: 'The origin a scheme-less path is resolved against when building the event. Set it to your own scheme so a generated link matches what the platform delivers.' }
        ]} />

        <H2>Running and shipping</H2>
        <H3>In development</H3>
        <p>
          <code>stone dev native</code> collects your modules and hands over to Expo, so there is one
          vocabulary across platforms. Running <code>npx expo start</code> directly works exactly as
          well, and still collects them: that part lives in the Metro configuration rather than in the
          command.
        </p>
        <Code file='terminal' lang='bash'>{`stone dev native            # then press i for iOS, a for Android
npx expo start --web        # the same app in a browser tab, with Fast Refresh`}</Code>

        <H3>For production</H3>
        <p>
          <code>stone build native</code> produces a Hermes bytecode bundle per platform. Producing an
          installable application stays <code>npx expo run:ios</code> or an EAS build, which need a
          native toolchain and are better commands than a wrapper around them would be.
        </p>
        <Code file='terminal' lang='bash'>{`stone build native --platform ios   # a Hermes bundle
npx expo run:ios                    # an installable build, locally
eas build --platform ios            # or in the cloud`}</Code>

        <Callout kind='note' title='Deliberately thin'>
          Expo and Metro own native bundling, and they know about Hermes, per-platform resolution,
          the native projects and the dev client. Stone.js answers the one question they cannot, which
          modules make up your application, and stays out of the rest.
        </Callout>

        <SeeAlso links={[
          { title: 'Native screens', path: '/docs/frontend/native' },
          { title: 'Mobile context', path: '/docs/contexts/mobile' },
          { title: 'Browser adapter', path: '/docs/adapters/browser' },
          { title: 'Write your own adapter', path: '/docs/extending/adapter' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
