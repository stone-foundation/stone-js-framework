import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Principle, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/routing/binding'

const DECL = `
import { Get, EventHandler } from '@stone-js/router'
import { IncomingHttpEvent } from '@stone-js/http-core'

@EventHandler('/tasks')
export class TaskController {
  constructor ({ tasks }: { tasks: TaskService }) { this.tasks = tasks }

  // Resolve the :id param into a Task before the handler runs.
  @Get('/:id', {
    bindings: { id: (value, { container }) => container.resolve('tasks').find(value) }
  })
  show (event: IncomingHttpEvent) {
    const task = event.get<Task>('id')   // already the resolved Task, not the raw id
    return task
  }
}
`

const IMP = `
import { defineEventHandler, defineRoutes } from '@stone-js/router'

export const routes = defineRoutes([
  [defineEventHandler(TaskController, 'show'), {
    path: '/tasks/:id',
    method: 'GET',
    bindings: { id: (value, { container }) => container.resolve('tasks').find(value) }
  }]
])
`

/**
 * Routing: model binding.
 */
@Page(PATH, { layout: 'docs' })
export class Binding implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Model binding',
      description: 'Turn a path parameter into a resolved model before the handler runs, so handlers receive entities, not raw ids.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Routing' title='Model binding' />
        <Lead>
          A route parameter is usually an id, and the handler's first act is to look up the thing that
          id points to. Binding moves that lookup to the route, so the handler receives the resolved
          model directly and stays about behaviour, not plumbing.
        </Lead>

        <H2>Resolve at the boundary</H2>
        <Principle
          principle={
            <p>
              Every handler repeating "take the id, fetch the entity, handle the not-found case" is
              boilerplate at the boundary. Lift it to the route definition once, and each handler
              starts from a real object.
            </p>
          }
          incarnation={
            <p>
              The <code>bindings</code> option maps a parameter to a resolver: a function that
              receives the raw value and the container, and returns the model. The resolved value
              replaces the raw parameter on the event.
            </p>
          }
        />
        <CodeTabs file='app/Tasks.ts' decl={DECL} imp={IMP} />

        <H2>Reusable binding resolvers</H2>
        <p>
          A resolver is just a function, so factor common ones out and share them across routes. A
          binding can also be a bound-model descriptor when a type always resolves the same way.
        </p>
        <Code file='app/bindings.ts'>{`export const bindTask = (value, { container }) => {
  const task = container.resolve('tasks').find(value)
  if (task === undefined) throw new RuntimeError('Task not found')  // 404 at the edge
  return task
}

// then: @Get('/:id', { bindings: { id: bindTask } })`}</Code>

        <Callout kind='note' title='Binding runs before middleware sees the handler'>
          Resolution happens as part of matching the route, so downstream middleware and the handler
          all see the resolved value. Throw from a resolver to reject early with a clean error.
        </Callout>

        <SeeAlso links={[
          { title: 'Parameters & constraints', path: '/docs/routing/parameters' },
          { title: 'Service container & DI', path: '/docs/foundations/container' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
