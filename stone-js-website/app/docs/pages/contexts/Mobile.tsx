import { JSX } from 'react'
import { siblings } from '../../nav'
import { Code, CodeGroup } from '../../components/Code'
import { StoneLink } from '@stone-js/use-react'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Aphorism, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/contexts/mobile'

const WEB_DECL = `
import { Routing } from '@stone-js/router'
import { StoneApp } from '@stone-js/core'
import { UseReact } from '@stone-js/use-react'
import { Browser } from '@stone-js/browser-adapter'

@Routing()
@Browser()          // where events come from
@UseReact()         // what a resolved route becomes
@StoneApp({ name: 'acme' }, [domainBlueprint])
export class Application {}
`

const WEB_IMP = `
import { routerBlueprint } from '@stone-js/router'
import { useReactBlueprint } from '@stone-js/use-react'
import { defineStoneApp } from '@stone-js/core'
import { browserAdapterBlueprint } from '@stone-js/browser-adapter'

export const Application = defineStoneApp(
  { name: 'acme' },
  [routerBlueprint, browserAdapterBlueprint, useReactBlueprint, domainBlueprint]
)
`

const NATIVE_DECL = `
import { Routing } from '@stone-js/router'
import { StoneApp } from '@stone-js/core'
import { UseReactNative } from '@stone-js/use-react-native'
import { ReactNative } from '@stone-js/react-native-adapter'

@Routing()
@ReactNative()      // where events come from
@UseReactNative()   // what a resolved route becomes
@StoneApp({ name: 'acme' }, [domainBlueprint])
export class Application {}
`

const NATIVE_IMP = `
import { routerBlueprint } from '@stone-js/router'
import { defineStoneReactNativeApp } from '@stone-js/use-react-native'
import { reactNativeAdapterBlueprint } from '@stone-js/react-native-adapter'

export const Application = defineStoneReactNativeApp(
  { name: 'acme' },
  [routerBlueprint, reactNativeAdapterBlueprint, domainBlueprint]
)
`

const PAGE = `
@Page('/tasks/:id')
export class TaskScreen implements IPage<ReactIncomingEvent> {
  constructor (private readonly tasks: TaskService) {}

  // Identical on both platforms. Answering a route is not a platform question.
  async handle (event: ReactIncomingEvent) {
    return await this.tasks.find(event.get('id'))
  }

  head ({ data }) {
    return { title: data.title }
  }

  // The only difference, and only in what it draws with.
  render ({ data }) {
    return <View><Text>{data.title}</Text></View>
  }
}
`

/**
 * Contexts: mobile.
 */
@Page(PATH, { layout: 'docs' })
export class Mobile implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Mobile',
      description: 'Mobile is a context, not a port. The same domain, the same routes, the same loaders, on a phone: React Native and Expo as one more adapter and one more renderer.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Contexts' title='Mobile' />
        <Lead>
          A page that answers <code>/tasks/:id</code> behind an HTTP adapter answers it on a phone
          too. What changes is where the result goes: a browser replaces a document, a phone pushes a
          screen onto a stack. Everything before that last step is the code you already wrote.
        </Lead>

        <H2>The whole difference, in two files</H2>
        <p>
          Open a web application's manifest next to a native one. This is not an abridged
          comparison: it is the entire difference between the two files.
        </p>

        <CodeGroup files={[
          { name: 'apps/web/app/Application.ts', decl: WEB_DECL, imp: WEB_IMP },
          { name: 'apps/mobile/app/Application.ts', decl: NATIVE_DECL, imp: NATIVE_IMP }
        ]} />

        <p>
          Two decorators differ, or two blueprints. The router is the same, the domain is the same
          line, and nothing else moved. Then open the pages: <code>handle</code> and{' '}
          <code>head</code> are identical, character for character, because answering a route is not
          a platform question. Only <code>render</code> differs, and only in what it draws with.
        </p>

        <Code file='app/TaskScreen.tsx' lang='tsx'>{PAGE}</Code>

        <Aphorism>
          If the domain never named the web, it never has to un-name it to run on a phone.
        </Aphorism>

        <H2>Why mobile is the case that proves the claim</H2>
        <p>
          Every context Stone.js supports asks the domain for nothing. That is easy to believe for
          the ones that look alike: a Node server and a Lambda both receive a request and return a
          response, so an adapter between them is unsurprising. Mobile is the case where the claim
          could have failed, and it is worth being precise about why.
        </p>
        <p>
          On a phone, <em>the bundler itself changes hands.</em> The web build asks Vite to collect
          your pages and hands the result to Rollup; a native build hands everything to Metro, which
          resolves every import statically and has no notion of a glob. The rendering target changes
          too: there is no document to replace, so a resolved route becomes a screen on a stack
          rather than markup in a container. And navigation stops being a URL bar: it is a deep link,
          a gesture, a hardware button.
        </p>
        <p>
          Three of the four dimensions change completely. <StoneLink to='/docs/foundations/domain-context'>Setup</StoneLink>{' '}
          gains a different build, Integration gains a different adapter, Initialization renders into
          a different place. The fourth, the functional dimension, the part you wrote, does not move.
        </p>

        <Callout kind='note' title='This is what “Stone.js is the context” means'>
          Not that the framework is portable. That the framework <em>is</em> the part that changes,
          so your code is not. If mobile had required a second version of your domain, the claim
          would have been marketing. It required two decorators.
        </Callout>

        <H2>What you install</H2>
        <p>
          Two packages, split along the same line as everywhere else in Stone.js: one captures causes,
          one renders resolutions.
        </p>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/react-native-adapter @stone-js/use-react-native`}</Code>
        <ul>
          <li>
            <StoneLink to='/docs/adapters/mobile'><code>@stone-js/react-native-adapter</code></StoneLink>{' '}
            is the Integration dimension: deep links, in-app navigation and the launch intent become
            incoming events.
          </li>
          <li>
            <StoneLink to='/docs/frontend/native'><code>@stone-js/use-react-native</code></StoneLink>{' '}
            is the renderer: a resolved route becomes a screen, and the screens form a stack.
          </li>
        </ul>
        <p>
          Everything a page is made of, the <code>@Page</code> decorator, layouts, error pages, view
          providers, the hooks, comes from <code>@stone-js/use-react-core</code>, shared with the web
          renderer. There is no native variant of a page's logic to learn.
        </p>

        <H2>One domain, two applications</H2>
        <p>
          The argument above is testable, and there is a starter that tests it. Scaffold{' '}
          <code>monorepo-declarative</code> and you get three packages: a domain that imports{' '}
          <code>@stone-js/core</code> and nothing else about a platform, a web application, and a
          native one.
        </p>
        <Code file='terminal' lang='bash'>{`npx @stone-js/create@latest acme --starter monorepo-declarative`}</Code>
        <Code lang='text'>{`acme/
├── packages/domain/     @acme/domain   the entities and the behaviour
├── apps/web/            @acme/web      @Browser + @UseReact
└── apps/mobile/         @acme/mobile   @ReactNative + @UseReactNative`}</Code>
        <p>
          Its three test suites sit at three levels, and the cheapest one carries the most. The
          domain boots nothing and tests plain objects in milliseconds. The web application boots the
          real kernel and reads the HTML that came back. The mobile one boots the real kernel and
          asserts what landed on the navigation stack. The web and mobile suites make{' '}
          <em>the same assertions about the same domain</em> through two different contexts, which is
          the claim stated as code rather than as prose.
        </p>

        <H2>What a phone genuinely adds</H2>
        <p>
          Being honest about a claim means naming what it does not cover. Three things about mobile
          are real work, and none of them is your domain.
        </p>

        <H3>The build belongs to Expo</H3>
        <p>
          Metro and Expo own native bundling: Hermes, per-platform resolution, the native projects,
          the dev client. Stone.js does not offer a second opinion on any of it. What it does is
          answer the one question Metro cannot: which modules make up your application. Two lines in{' '}
          <code>metro.config.js</code> collect everything under <code>app/</code> into real static
          imports before Metro runs, so adding a screen stays adding a file.
        </p>
        <Code file='metro.config.js' lang='js'>{`const { getDefaultConfig } = require('expo/metro-config')
const { withStone } = require('@stone-js/use-react-native/metro')

module.exports = withStone(getDefaultConfig(__dirname), __dirname)`}</Code>

        <H3>Navigation is a platform feeling</H3>
        <p>
          A stack of screens with the platform's transitions, the swipe-back gesture and the hardware
          button cannot be imitated in JavaScript. The renderer ships a floor that works with nothing
          installed, and a real navigator you graduate to. Both are described on the{' '}
          <StoneLink to='/docs/frontend/native'>native screens</StoneLink> page.
        </p>

        <H3>A device is a device</H3>
        <p>
          The fastest development loop for a native application is a browser tab: Expo serves it
          through <code>react-native-web</code> with Fast Refresh, and the same code then runs on a
          phone untouched. Use it for the domain, the navigation and most of the interface. Then use a
          device, because a browser covers the core primitives and not the camera, secure storage or a
          native gesture handler, and because performance in a tab says nothing about a phone.
        </p>

        <Callout kind='future' title='The next context costs the same'>
          Mobile was the hardest case and it cost two decorators. That is the shape of every runtime
          Stone.js has not met yet: it arrives as an adapter and a renderer, and the application it
          collapses is the one you already have.
        </Callout>

        <SeeAlso links={[
          { title: 'React Native adapter', path: '/docs/adapters/mobile' },
          { title: 'Native screens', path: '/docs/frontend/native' },
          { title: 'Domain × Context → Resolution', path: '/docs/foundations/domain-context' },
          { title: 'Frontend context', path: '/docs/contexts/frontend' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
