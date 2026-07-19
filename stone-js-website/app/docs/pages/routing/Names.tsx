import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Principle, Aphorism, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/routing/names'

/**
 * Routing: named routes & URL generation.
 */
@Page(PATH, { layout: 'docs' })
export class Names implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Named routes & URL generation',
      description: 'Give routes names and generate their URLs from those names, so links never hard-code a path and refactors never break them.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Routing' title='Named routes & URL generation' />
        <Lead>
          A URL written by hand is a path duplicated: change the route and every hard-coded link
          rots. Name the route instead and generate its URL from the name, so the path lives in one
          place and links follow it automatically.
        </Lead>

        <H2>Name once, generate everywhere</H2>
        <Principle
          principle={
            <p>
              A path is an implementation detail of a route. Referring to routes by a stable name
              instead of their current path decouples every caller from that detail, so paths can
              change freely.
            </p>
          }
          incarnation={
            <p>
              Give a route a <code>name</code>, then ask the router to build its URL with
              <code> router.generate(...)</code>, filling in parameters and query. The path exists in
              exactly one place: the route definition.
            </p>
          }
        />
        <Code file='app/Tasks.ts'>{`@Get('/tasks/:id', { name: 'tasks.show' })
show (event: IncomingHttpEvent) { /* ... */ }`}</Code>

        <H2>Generating a URL</H2>
        <p>
          From anywhere with the router (injected, or via <code>useRouter()</code> in a component),
          generate a URL by name. Parameters and query are filled and encoded for you.
        </p>
        <Code file='app/example.ts'>{`const url = router.generate({
  name: 'tasks.show',
  params: { id: 42 },
  query: { ref: 'email' }
})
// -> "/tasks/42?ref=email"`}</Code>

        <H2>Links in the UI</H2>
        <p>
          On the frontend, generate the URL by name and hand it to <code>StoneLink</code>, so
          navigation and server links share one source of truth.
        </p>
        <Code file='app/pages/TaskRow.tsx' lang='tsx'>{`const router = useRouter()

<StoneLink to={router.generate({ name: 'tasks.show', params: { id: task.id } })}>
  {task.title}
</StoneLink>`}</Code>

        <Aphorism>Name the route once. Every link becomes a reference, not a copy.</Aphorism>

        <Callout kind='note' title='Naming conventions'>
          A dotted name that mirrors the resource and action reads well and stays unique:
          <code> tasks.list</code>, <code>tasks.show</code>, <code>tasks.create</code>. Keep names
          stable even when paths change; that is the whole point.
        </Callout>

        <SeeAlso links={[
          { title: 'Route definitions', path: '/docs/routing/definitions' },
          { title: 'Misc: current route & useRouter', path: '/docs/routing/misc' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
