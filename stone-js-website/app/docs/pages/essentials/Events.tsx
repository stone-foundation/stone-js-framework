import { JSX } from 'react'
import { CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Aphorism, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/essentials/events'

const DECL = `
import { Listener } from '@stone-js/core'

@Listener({ event: 'task.created' })
export class NotifyOnCreate {
  constructor ({ mailer }: { mailer: Mailer }) { this.mailer = mailer }

  handle (event: { task: Task }) {
    return this.mailer.send('a task was created', event.task)
  }
}
`

const IMP = `
import { defineEventListener } from '@stone-js/core'

const NotifyOnCreate = ({ mailer }) => (event) =>
  mailer.send('a task was created', event.task)

export const listeners = [
  defineEventListener(NotifyOnCreate, { event: 'task.created' }, true)
]
`

/**
 * Essentials: events & listeners.
 */
@Page(PATH, { layout: 'docs' })
export class Events implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Events & listeners',
      description: 'Emit domain events and react to them with listeners or subscribers, so side effects stay decoupled from the code that triggers them.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Essentials' title='Events & listeners' />
        <Lead>
          Not every consequence belongs in the handler that causes it. Emitting a domain event lets
          the rest of the app react, sending a mail, updating a projection, without the emitter
          knowing or caring who listens. Coupling drops; the code that matters stays readable.
        </Lead>

        <H2>Emitting an event</H2>
        <p>
          The event emitter is injected like any service. Emit a named event with a payload from
          wherever the thing happens.
        </p>
        <CodeTabs
          file='app/Tasks.ts'
          decl={`constructor ({ eventEmitter }) { this.events = eventEmitter }

create (event: IncomingHttpEvent) {
  const task = this.tasks.add(event.get('title'))
  this.events.emit('task.created', { task })   // fire and forget
  return task
}`}
          imp={`const create = ({ tasks, eventEmitter }) => (event) => {
  const task = tasks.add(event.get('title'))
  eventEmitter.emit('task.created', { task })
  return task
}`}
        />
        <Aphorism>The handler states what happened. Listeners decide what to do about it.</Aphorism>

        <H2>Listening</H2>
        <p>
          A listener reacts to one event. Mark a class with <code>@Listener</code> (or register a
          <code> defineEventListener</code>), and it runs whenever that event is emitted, with its
          dependencies injected.
        </p>
        <CodeTabs file='app/NotifyOnCreate.ts' decl={DECL} imp={IMP} />

        <H3>Subscribers</H3>
        <p>
          When one unit handles several related events, a subscriber groups them: mark it with
          <code> @Subscriber</code> (or <code>defineEventSubscriber</code>) and map each event to a
          method. Wildcards let one listener catch a family of events.
        </p>

        <Callout kind='note' title='Keep listeners idempotent'>
          Listeners run as reactions, sometimes retried, sometimes out of order relative to other
          side effects. Make them safe to run more than once, and keep the source of truth in the
          domain, not in a listener.
        </Callout>

        <SeeAlso links={[
          { title: 'Hooks & lifecycle', path: '/docs/essentials/hooks' },
          { title: 'Service container & DI', path: '/docs/foundations/container' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
