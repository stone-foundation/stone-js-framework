import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Principle, Aphorism, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/blueprint/middleware'

/**
 * Blueprint & build: blueprint middleware (the build pipeline).
 */
@Page(PATH, { layout: 'docs' })
export class BlueprintMiddleware implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Blueprint middleware',
      description: 'The manifest is composed by a pipeline of steps. Insert your own to read and refine the Blueprint before any event runs.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Blueprint & build' title='Blueprint middleware' />
        <Lead>
          The Blueprint is not assembled by one function; it is produced by a pipeline that runs once,
          before the first event. Each step receives the manifest so far and refines it. Extending
          setup means inserting a step, never editing the core.
        </Lead>

        <H2>Setup is a pipeline</H2>
        <Principle
          principle={
            <p>
              Configuration built by one closed function can only change by editing that function.
              Configuration built by a pipeline changes by insertion. Composition replaces
              modification, which is what keeps a small core open to a large ecosystem.
            </p>
          }
          incarnation={
            <p>
              The <code>BlueprintBuilder</code> runs a chain of blueprint middleware. Each is a pipe:
              it gets the build context (the manifest under construction), does its work, and calls
              <code> next</code>. Adapters and extensions contribute steps; so can you.
            </p>
          }
        />
        <Code file='app/steps.ts'>{`import { defineBlueprintMiddleware } from '@stone-js/core'

export const withTaskDefaults = defineBlueprintMiddleware((context, next) => {
  const { blueprint } = context
  if (!blueprint.has('stone.tasks.pageSize')) {
    blueprint.set('stone.tasks.pageSize', 20)   // refine the manifest
  }
  return next(context)                           // hand it to the next step
})`}</Code>

        <Aphorism>The manifest is not configured, it is composed, one step at a time, before the first event.</Aphorism>

        <H2>Reading what earlier steps decided</H2>
        <p>
          Because steps run in order, a later step can inspect what earlier ones wrote and react. That
          is how an extension can, say, register a default only when an adapter is present, without the
          two knowing about each other.
        </p>
        <Code file='app/steps.ts'>{`export const withEdgeTuning = defineBlueprintMiddleware((context, next) => {
  const { blueprint } = context
  if (blueprint.has('stone.adapters.fetch')) {
    blueprint.set('stone.cache.driver', 'edge')   // adapt to what is already there
  }
  return next(context)
})`}</Code>

        <Callout kind='future' title='The same shape at runtime'>
          You will meet this pipe again handling events: middleware is a pipeline over requests, just
          as the build phase is a pipeline over the manifest. One idea, the chain of responsibility,
          runs the framework from setup to response.
        </Callout>

        <SeeAlso links={[
          { title: 'The Blueprint', path: '/docs/blueprint' },
          { title: 'Blueprint as a pipeline (concept)', path: '/docs/foundations/build-phase' },
          { title: 'Middleware', path: '/docs/middleware' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
