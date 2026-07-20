import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/extensions/resources'

/**
 * Extensions: resources.
 */
@Page(PATH, { layout: 'docs' })
export class Resources implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Resources',
      description: 'Shape what leaves your API: a deliberate projection from internal model to public representation, with sparse fields, envelopes and collections handled.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Extensions' title='Resources' />
        <Lead>
          Your internal model and your public representation are not the same thing. A resource is the
          deliberate projection between them: the place where you decide, once, what the world sees and
          what stays private.
        </Lead>

        <H2>Install</H2>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/resources`}</Code>

        <H2>Define the projection</H2>
        <Principle
          principle={
            <p>
              Returning raw models leaks internals and couples your API to your storage. A resource
              draws a stable line between the two, so the model can change without breaking the contract,
              and secrets never slip out by accident.
            </p>
          }
          incarnation={
            <p>
              <code>defineResource(transform)</code> declares the projection. Use <code>.item()</code>
              for one model and <code>.collection()</code> for many; sparse fieldsets, conditional
              fields and the <code>{'{ data, meta }'}</code> envelope are handled for you.
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
}))`}</Code>

        <H2>Using it in a handler</H2>
        <Code file='app/Tasks.ts'>{`@Get('/')
list () {
  return taskResource.collection(this.tasks.list())         // many
}

@Get('/:id')
show (event) {
  return taskResource.item(this.tasks.find(event.get('id')), only(['id', 'title']))  // sparse
}`}</Code>

        <H3>Helpers</H3>
        <PropsTable nameHeader='Helper' rows={[
          { name: '.item(model, ctx?)', type: 'one', desc: 'Project a single model.' },
          { name: '.collection(models, ctx?)', type: 'many', desc: 'Project an array of models.' },
          { name: '.envelope(...)', type: 'wrap', desc: 'Wrap the result in a { data, meta } envelope.' },
          { name: 'only([...]) / except([...])', type: 'fields', desc: 'Sparse fieldsets: include or drop fields.' },
          { name: 'whenIncluded(ctx, key, fn)', type: 'conditional', desc: 'Include related data only when requested.' }
        ]} />

        <Callout kind='future' title='One source, three consumers'>
          The same shape now serves three audiences: the resource that leaves your API, the OpenAPI
          contract derived from it, and the agent tools that call it. Write the projection once; it
          feeds them all.
        </Callout>

        <SeeAlso links={[
          { title: 'OpenAPI', path: '/docs/extensions/openapi' },
          { title: 'Validation', path: '/docs/extensions/validation' },
          { title: 'Outgoing response', path: '/docs/essentials/outgoing-response' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
