import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, Aphorism, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/extensions/testing'

/**
 * Extensions: testing.
 */
@Page(PATH, { layout: 'docs' })
export class Testing implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Testing',
      description: 'Boot the real application in memory and dispatch real events through the kernel. Test behaviour, not mocks.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Extensions' title='Testing' />
        <Lead>
          A test is only worth its resemblance to production. <code>@stone-js/testing</code> boots the
          actual application in memory and sends it real intentions through the same kernel production
          uses, so you assert on behaviour a caller would see, not on the shape of your mocks.
        </Lead>

        <H2>Install</H2>
        <Code file='terminal' lang='bash'>{`npm i -D @stone-js/testing`}</Code>
        <p>
          The package itself knows about no platform: the main entry imports neither an HTTP package
          nor a browser one. The event factories sit behind subpaths, so a native application, a CLI
          one or a worker installs nothing it does not use.
        </p>
        <PropsTable nameHeader='Entry' rows={[
          { name: '@stone-js/testing', type: 'always', desc: 'createTestApp, the client, container substitutions, and makeIncomingEvent for a platform-agnostic cause.' },
          { name: '@stone-js/testing/http', type: 'needs @stone-js/http-core', desc: 'makeIncomingHttpEvent, for an application served over HTTP.' },
          { name: '@stone-js/testing/browser', type: 'needs @stone-js/browser-core', desc: 'makeIncomingBrowserEvent, for a browser or a React Native application.' }
        ]} />

        <H2>Behaviour over mocks</H2>
        <Principle
          principle={
            <p>
              Tests built from mocks verify that your code calls your mocks. They pass while the system
              is broken and break while it is fine. A test that drives the real boundary verifies what
              actually happens.
            </p>
          }
          incarnation={
            <p>
              <code>createTestApp</code> boots your real app on an in-memory adapter and returns a
              client. <code>app.send(makeIncomingHttpEvent(...))</code> dispatches an event through the
              full kernel, and you assert on the returned response. No HTTP, no network, full fidelity.
            </p>
          }
        />
        <Code file='tests/tasks.test.ts'>{`import { createTestApp } from '@stone-js/testing'
import { makeIncomingHttpEvent } from '@stone-js/testing/http'

it('creates a task', async () => {
  // No module list: your app is discovered from app/**, the same files the CLI builds.
  const app = await createTestApp()

  const response = await app.send(makeIncomingHttpEvent({
    method: 'POST',
    url: '/tasks',
    body: { title: 'Ship the docs' }
  }))

  expect(response.statusCode).toBe(201)
  expect(response.json()).toMatchObject({ title: 'Ship the docs' })
})`}</Code>
        <Callout kind='note' title='A list you maintain is a list that drifts'>
          Listing modules by hand is still possible, and useful when a test deliberately runs a slice
          of the application. It is not the default because a forgotten handler answers 404 in a way
          that reads as a routing bug, and a forgotten <code>@Configuration</code> makes a whole suite
          validate behaviour production does not have.
        </Callout>

        <H3>Frontend apps answer with a page</H3>
        <p>
          A rendered page is an HTML string, so it is asserted like any other response. There is no
          assertion library here on purpose: query that HTML with whatever you already use
          ({'happy-dom'}, {'jsdom'}, Testing Library).
        </p>
        <Code file='tests/home.test.ts'>{`const response = await app.send(makeIncomingHttpEvent({ url: '/' }))

expect(response.html()).toContain('<h1>Tasks</h1>')`}</Code>

        <H3>Substituting a dependency</H3>
        <p>
          A fake repository, a fixed clock, a provider made to fail: <code>bindings</code> substitutes
          container registrations after your own, in the container the kernel builds for each event, so
          the code under test resolves the fake exactly as it resolves the real one.
        </p>
        <Code file='tests/expiry.test.ts'>{`const app = await createTestApp({
  bindings: { clock: { now: () => '2026-01-01T00:00:00.000Z' } }
})`}</Code>

        <H3>One config file, tests included</H3>
        <p>
          <code>stone test</code> runs your suite with Vitest, configured from
          {' '}<code>stone.config.mjs</code> like the build is. It does two things a bare runner cannot:
          it loads <code>.env.test</code> <em>before</em> the runner starts, so a value read at module
          load sees it, and it hands the test process the same file set the build uses, so a suite
          cannot boot a different application than the one that ships.
        </p>
        <Code file='stone.config.mjs' lang='js'>{`export default defineBuilderConfig({
  test: {
    envFile: '.env.test',                  // loaded before anything imports
    include: ['./tests/**/*.spec.ts'],
    vitest: { environment: 'happy-dom' }   // raw Vitest config, merged over the defaults
  }
})`}</Code>
        <Aphorism>Boot the real app. Send a real intention. Assert on the real response.</Aphorism>

        <H3>The harness API</H3>
        <PropsTable nameHeader='API' rows={[
          { name: 'createTestApp(options?)', type: '(opts) => Promise<TestClient>', desc: 'Boot the app in memory, discovering modules from app/** unless options.modules names them.' },
          { name: 'options.appDir / pattern', type: 'string', desc: 'Where to discover from, for a non-standard layout.' },
          { name: 'options.envFile', type: 'string | false', desc: 'Env file to load before booting. Defaults to .env.test; a missing file is not an error.' },
          { name: 'options.bindings', type: 'Record<string, unknown>', desc: 'Container substitutions by alias, bound after the app\'s own registrations.' },
          { name: 'app.send(event)', type: '(event) => Promise<Response>', desc: 'Dispatch an event through the full kernel.' },
          { name: 'options.blueprint', type: 'Partial<StoneBlueprint>', desc: 'Configuration to force, merged after the app\'s own modules so it wins. The counterpart of bindings: one replaces a service, the other replaces a value.' },
          { name: 'options.platform', type: 'string', desc: 'The context to run as, when an app stacks several. A browser or native renderer registers itself against it.' },
          { name: 'makeIncomingHttpEvent(opts)', type: '(opts) => event', desc: 'From /http. Build an HTTP event: { method, url, body, headers, ip }.' },
          { name: 'makeIncomingBrowserEvent(opts)', type: '(opts) => event', desc: 'From /browser. Build the event a browser or native app receives: { url, metadata }. Keeps your own scheme, so myapp://tasks/42 reaches the route a phone reaches.' },
          { name: 'response.statusCode', type: 'number', desc: 'The response status.' },
          { name: 'response.json()', type: '<T>() => T', desc: 'The body as data: parsed when the payload is a JSON string.' },
          { name: 'response.html() / text()', type: '() => string', desc: 'The body as text, for a rendered page.' }
        ]} />

        <H2>Every context, one harness</H2>
        <p>
          Because the harness dispatches intentions through the kernel, the same test covers the
          behaviour whether the app will finally run on Node, on the edge, or as agent tools. You test
          the domain once; the contexts do not change what it does.
        </p>
        <p>
          HTTP is not the only cause. <code>makeIncomingHttpEvent</code> builds an HTTP intention;
          <code> makeIncomingEvent</code> builds a generic one, so the same <code>app.send()</code>
          exercises a CLI command or an agent tool call, no server and no argv parsing required.
        </p>
        <p>
          An application that <em>renders</em> needs its own: a browser and a phone receive an
          <code> IncomingBrowserEvent</code>, and the React renderer keys its hydration snapshot on
          that event's identity. Name the platform, send the event that platform delivers, and a
          native application is tested exactly like a web one.
        </p>
        <Code file='tests/TaskScreen.spec.ts'>{`import { createTestApp } from '@stone-js/testing'
import { makeIncomingBrowserEvent } from '@stone-js/testing/browser'
import { REACT_NATIVE_PLATFORM } from '@stone-js/react-native-adapter'

const app = await createTestApp({ platform: REACT_NATIVE_PLATFORM })
const response = await app.send(makeIncomingBrowserEvent({ url: 'myapp://tasks/42' }))

expect(response.statusCode).toBe(200)`}</Code>
        <Code file='tests/prune.test.ts'>{`import { createTestApp, makeIncomingEvent } from '@stone-js/testing'

const app = await createTestApp({ modules: [PruneCommand, TaskService] })
const res = await app.send(makeIncomingEvent({ name: 'tasks:prune', days: 30 }))
expect(res.getContent()).toContain('Pruned')`}</Code>

        <Callout kind='note' title='The rule, not the aspiration'>
          Across the framework, every fixed bug earns a behavioural test, and each module carries its
          own suite at full coverage. The harness you use is the harness the framework uses on itself.
        </Callout>

        <SeeAlso links={[
          { title: 'Event handlers', path: '/docs/essentials/event-handlers' },
          { title: 'Error handling', path: '/docs/essentials/errors' },
          { title: 'Routing', path: '/docs/routing' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
