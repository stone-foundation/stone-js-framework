import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Principle, Aphorism, Pager } from '../../components/content'

const PATH = '/docs/foundations/ephemeral-context'

/**
 * Foundations: the ephemeral context.
 */
@Page(PATH, { layout: 'docs' })
export class EphemeralContext implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'The ephemeral context',
      description: 'A fresh dependency-injection container per event, created for one intention and discarded after. Only the adapter is long-lived.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Foundations' title='The ephemeral context' />
        <Lead>
          Each time the domain is applied to an intention, it runs inside a container built for that
          one event and thrown away afterwards. Nothing you resolve leaks into the next request. This
          single rule removes most of the state bugs that plague long-lived servers.
        </Lead>

        <H2>One container per event</H2>
        <Principle
          principle={
            <p>
              Shared mutable state across requests is the source of the hardest server bugs: leaked
              user data, order-dependent behaviour, memory that grows request by request. If each
              event gets its own isolated scope, those bugs cannot form.
            </p>
          }
          incarnation={
            <p>
              For every incoming event, the kernel spins up a fresh service container, resolves your
              handlers and services into it, runs them, and discards it. What you register as a
              singleton lives for that one event, not for the process.
            </p>
          }
        />
        <Aphorism>Nothing survives the request that should not. The blank slate is the default, not a discipline you enforce.</Aphorism>

        <H2>What stays, what goes</H2>
        <p>
          The <strong>adapter</strong> is the only long-lived thing: it holds the connection to the
          platform and builds a new context per cause. The <strong>Blueprint</strong> is built once
          and read-only. Everything else, the container and everything in it, is per-event.
        </p>
        <Code file='app/Tasks.ts'>{`@EventHandler('/tasks')
export class TaskController {
  // Built fresh for THIS event. Fields here are safe: they cannot bleed
  // into another request, because this instance does not outlive the event.
  private readonly tasks: TaskService
  constructor ({ tasks }: { tasks: TaskService }) { this.tasks = tasks }
}`}</Code>

        <H2>Why serverless fits perfectly</H2>
        <p>
          The ephemeral model and serverless runtimes are made for each other. A Lambda or a Worker
          already gives you a short-lived execution per invocation; the per-event container matches
          that grain exactly. There is nothing long-lived to warm except the adapter, so the domain
          pays no tax for running on the edge.
        </p>

        <Callout kind='note' title='Persistence lives outside the event'>
          Anything that must outlast a request, a database, a cache, a queue, is an external service
          the container talks to, not state held in the container. The container is a per-event
          workspace, never the store.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
