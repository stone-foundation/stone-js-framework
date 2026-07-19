import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Principle, Aphorism, Pager } from '../../components/content'

const PATH = '/docs/build/testing'

/**
 * Build: testing behaviourally.
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
        <ArticleTop eyebrow='Build' title='Testing' />
        <Lead>
          A test is only worth as much as its resemblance to production. Stone.js lets you boot the
          actual application in memory and send it real intentions, so you assert on behaviour the
          way a caller would, not on the shape of your mocks.
        </Lead>

        <H2>Behaviour over mocks</H2>
        <Principle
          principle={
            <p>
              Tests built from mocks verify that your code calls your mocks. They pass while the
              system is broken and break while the system is fine. A test that drives the real
              boundary verifies what actually happens.
            </p>
          }
          incarnation={
            <p>
              <code>@stone-js/testing</code> boots your real app on an in-memory adapter and gives
              you a <code>TestClient</code>. You dispatch an event through the same kernel
              production uses, and assert on the response. No HTTP, no network, full fidelity.
            </p>
          }
        />
        <Code file='tests/tasks.test.ts'>{`import { createTestApp } from '@stone-js/testing'
import { Application } from '../app/Application'

it('creates a task', async () => {
  const app = await createTestApp(Application)
  const client = app.client()

  const res = await client.post('/tasks', { title: 'Ship the docs' })

  expect(res.statusCode).toBe(201)
  expect(res.body.title).toBe('Ship the docs')
})`}</Code>

        <H2>Every context, one harness</H2>
        <p>
          Because the harness dispatches intentions through the kernel, the same test covers the
          behaviour whether the app will finally run on Node, on the edge or as agent tools. You
          test the domain once; the contexts do not change what it does.
        </p>

        <Aphorism>Boot the real app. Send a real intention. Assert on the real response.</Aphorism>

        <Callout kind='note' title='This site is tested this way'>
          The behavioural rule is not aspirational. Across the framework, every fixed bug earns a
          behavioural test, and each module carries its own suite at full coverage. The harness you
          use is the harness we use.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
