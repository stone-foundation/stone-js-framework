import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Principle, Aphorism, Pager } from '../../components/content'

const PATH = '/docs/build/resources'

/**
 * Build: resources and OpenAPI.
 */
@Page(PATH, { layout: 'docs' })
export class Resources implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Resources & OpenAPI',
      description: 'Shape what leaves your API with resources, then derive a public OpenAPI contract from the schemas you already wrote.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Build' title='Resources & OpenAPI' />
        <Lead>
          Two boundaries face the outside world: the shape of what you return, and the contract you
          publish about it. Both should be derived from what you already have, not maintained by
          hand alongside it.
        </Lead>

        <H2>Resources: the outgoing shape</H2>
        <Principle
          principle={
            <p>
              Your internal model and your public representation are not the same thing. A resource
              is the deliberate, stable projection from one to the other, the place where you decide
              what the world sees and what stays private.
            </p>
          }
          incarnation={
            <p>
              <code>defineResource(transform)</code> declares that projection once. Use
              <code> .item()</code> for one model and <code>.collection()</code> for many; sparse
              fieldsets, conditional fields and the <code>{'{ data, meta }'}</code> envelope are
              handled for you.
            </p>
          }
        />
        <Code file='app/resources.ts'>{`import { defineResource, only } from '@stone-js/resources'

export const taskResource = defineResource((task) => ({
  id: task.id,
  title: task.title,
  done: task.done,
  createdAt: task.createdAt.toISOString()
  // note: no ownerId, no internal flags. The projection is the contract.
}))

// in a handler:
taskResource.item(task)
taskResource.collection(tasks, only(['id', 'title']))   // sparse fieldset`}</Code>

        <H2>OpenAPI: the published contract</H2>
        <p>
          A public API deserves a public contract, but a contract maintained by hand drifts from
          the code the day after it is written. Derive it instead from the schemas your validation
          and resources already define.
        </p>
        <Code file='app/openapi.ts'>{`import { OpenApiGenerator } from '@stone-js/openapi'

const spec = OpenApiGenerator
  .create({ title: 'Tasks API', version: '1.0.0' })
  .addServer('https://api.example.com')
  .generate()   // a valid OpenAPI document, served at /openapi.json`}</Code>

        <Aphorism>You wrote the schema for validation. The contract is a view of it, not a second copy.</Aphorism>

        <Callout kind='future' title='One source, three consumers'>
          The same schema now feeds three audiences at once: the runtime that validates requests,
          the humans who read your OpenAPI docs, and, as the agents context showed, the machines
          that call your API as tools. Write it once; it serves them all.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
