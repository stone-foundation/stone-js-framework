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
        <Code file='tests/tasks.test.ts'>{`import { createTestApp, makeIncomingHttpEvent } from '@stone-js/testing'
import { TaskController } from '../app/TaskController'
import { TaskService } from '../app/TaskService'

it('creates a task', async () => {
  const app = await createTestApp({ modules: [TaskController, TaskService] })

  const response = await app.send(makeIncomingHttpEvent({
    method: 'POST',
    url: '/tasks',
    body: { title: 'Ship the docs' }
  }))

  expect(response.statusCode).toBe(201)
  expect(response.getContent()).toMatchObject({ title: 'Ship the docs' })
})`}</Code>
        <Aphorism>Boot the real app. Send a real intention. Assert on the real response.</Aphorism>

        <H3>The harness API</H3>
        <PropsTable nameHeader='API' rows={[
          { name: 'createTestApp(options?)', type: '(opts) => Promise<TestClient>', desc: 'Boot the app in memory. options.modules lists decorated classes and/or blueprints; options.blueprint merges a base blueprint.' },
          { name: 'app.send(event)', type: '(event) => Promise<Response>', desc: 'Dispatch an event through the full kernel.' },
          { name: 'makeIncomingHttpEvent(opts)', type: '(opts) => event', desc: 'Build an event: { method, url, body, headers, query }.' },
          { name: 'response.statusCode', type: 'number', desc: 'The response status.' },
          { name: 'response.getContent()', type: '() => unknown', desc: 'The response body.' }
        ]} />

        <H2>Every context, one harness</H2>
        <p>
          Because the harness dispatches intentions through the kernel, the same test covers the
          behaviour whether the app will finally run on Node, on the edge, or as agent tools. You test
          the domain once; the contexts do not change what it does.
        </p>

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
