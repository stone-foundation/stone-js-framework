import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Principle, Aphorism, Pager } from '../../components/content'

const PATH = '/docs/foundations/build-phase'

/**
 * Foundations: blueprint as a pipeline (the build phase).
 */
@Page(PATH, { layout: 'docs' })
export class BuildPhase implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Blueprint as a pipeline',
      description: 'The manifest is not assembled all at once; it is built by a pipeline of steps, each free to read and refine what came before.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Foundations' title='Blueprint as a pipeline' />
        <Lead>
          The Blueprint does not spring into existence complete. It is produced by a pipeline that
          runs once, before any event: a sequence of steps, each handed the manifest so far and free
          to add to or refine it. This is the build phase, and it is where extensibility lives.
        </Lead>

        <H2>Setup is a chain of responsibility</H2>
        <Principle
          principle={
            <p>
              A configuration built by one monolithic function is closed: to change it, you edit that
              function. A configuration built by a pipeline is open: to change it, you insert a step.
              Composition replaces modification.
            </p>
          }
          incarnation={
            <p>
              The <code>BlueprintBuilder</code> runs a pipeline of blueprint middleware. Every
              adapter and extension contributes steps that read the current manifest and write their
              own <code>stone.*</code> keys. The order is deterministic; later steps refine earlier
              ones.
            </p>
          }
        />
        <Aphorism>The manifest is not configured. It is composed, one step at a time, before the first event.</Aphorism>

        <H2>A step in the build</H2>
        <p>
          A blueprint step is a pipe: it receives the build context (the manifest under
          construction) and calls <code>next</code> to pass it on. It can inspect what previous steps
          decided and contribute accordingly.
        </p>
        <Code file='app/steps.ts'>{`import { defineBlueprintMiddleware } from '@stone-js/core'

export const withDefaults = defineBlueprintMiddleware((context, next) => {
  const { blueprint } = context
  if (!blueprint.has('stone.tasks.pageSize')) {
    blueprint.set('stone.tasks.pageSize', 20)   // refine the manifest
  }
  return next(context)   // hand it to the next step
})`}</Code>

        <H2>Why this matters for the ecosystem</H2>
        <p>
          Because setup is a pipeline, the core never has to know about the packages that extend it.
          An adapter adds its steps; an extension adds its steps; a community package adds its steps,
          all by insertion, none by editing the kernel. The micro-kernel stays tiny while the
          ecosystem grows around it.
        </p>

        <Callout kind='future' title='The same shape, twice'>
          You will meet this exact pattern again at runtime: middleware is a pipeline over events,
          just as the build phase is a pipeline over the manifest. One idea, the chain of
          responsibility, runs the framework from setup to response.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
