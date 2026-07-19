import { JSX } from 'react'
import { Code } from '../components/Code'
import { siblings } from '../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, Aphorism, Pager } from '../components/content'

const PATH = '/docs/foundations/uncertainty'

/**
 * Foundations: the contextual uncertainty principle.
 */
@Page(PATH, { layout: 'docs' })
export class Uncertainty implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'The uncertainty principle',
      description: 'A domain cannot at once know its execution context exactly and evolve independently of it. Defer the where, own the what.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Foundations' title='The uncertainty principle' />
        <Lead>
          The Continuum borrows its name from physics, and this is where the borrowing earns its
          keep. There is a real trade-off at the heart of every application, and most frameworks
          resolve it in the wrong direction.
        </Lead>

        <H2>The trade-off, stated</H2>
        <Aphorism cite='The Continuum Architecture'>
          A domain cannot, at the same time, know its execution context exactly and evolve
          independently of it.
        </Aphorism>
        <p>
          Know the context too well, hard-code the server, the request object, the platform SDK,
          and you are coupled: the domain now ages with the platform. Ignore the context entirely
          and you fail the intent: code has to run <em>somewhere</em>, and pretending otherwise
          produces abstractions that do not fit any real runtime. Both extremes lose.
        </p>

        <H2>The resolution</H2>
        <Principle
          principle={
            <>
              <p>
                The way out is not to eliminate the uncertainty but to <strong>place</strong> it.
                Keep the <em>where</em> deliberately uncertain while you build the <em>what</em>,
                and resolve the where at the last responsible moment, through an abstraction that
                mediates between domain and platform.
              </p>
              <p>
                This is an architectural stance you can adopt anywhere: a boundary whose job is to
                hold the platform at arm's length, so the core can move fast on meaning while the
                edge absorbs change.
              </p>
            </>
          }
          incarnation={
            <>
              <p>
                Stone.js places the uncertainty in the adapter and resolves it at runtime. The
                domain is written against an <code>IncomingEvent</code>, an intention, never a
                platform object. The adapter is the mediator that collapses a real cause into that
                intention.
              </p>
              <p>
                So you build the what at full speed, and the where is decided when the adapter runs,
                not when you write the handler.
              </p>
            </>
          }
        />

        <H2>What it looks like in practice</H2>
        <p>
          The domain reads meaning from the event. Whether the value arrived as a JSON body, a
          query string, a CLI flag or an agent argument is the adapter's problem, and stays the
          adapter's problem.
        </p>
        <Code file='app/Tasks.ts'>{`@Post('/')
create (event) {
  // "title" is an intention. Its transport is unknown here, on purpose.
  const title = event.get('title')
  return this.store.add({ title })
}`}</Code>

        <H3>The two failure modes, in code</H3>
        <p>
          The trade-off is easiest to see side by side. Know the context too exactly and the handler
          is welded to one platform; hold it uncertain and the same handler runs anywhere.
        </p>
        <Code file='coupled-vs-deferred.ts'>{`// Coupled: knows the platform exactly. Runs on Node, and only Node.
create (req, res) {
  res.status(201).json(store.add({ title: req.body.title }))   // Express-shaped, forever
}

// Deferred: reads an intention, returns a value. Runs on every context.
create (event) {
  return store.add({ title: event.get('title') })              // no platform in sight
}`}</Code>

        <Callout kind='future' title='Uncertainty as a superpower'>
          Because the where is held open, it can stay open for more than one context at once. Stack
          a Node adapter and a Lambda adapter on the same app and neither is resolved until a real
          cause arrives to collapse it. The next page, superposition and collapse, makes this
          concrete.
        </Callout>

        <Callout kind='note' title='Defer the where. Own the what.'>
          Every design decision in Stone.js is downstream of this one line.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
