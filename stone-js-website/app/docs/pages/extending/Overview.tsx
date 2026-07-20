import { JSX } from 'react'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Aphorism, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/extending'

/**
 * Extending: overview.
 */
@Page(PATH, { layout: 'docs' })
export class Overview implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Extending Stone.js',
      description: 'Author the framework’s own building blocks: a new adapter, a package or plugin, a decorator, CLI commands. The core stays small; you grow around it.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Extending' title='Extending Stone.js' />
        <Lead>
          Everything the framework ships, adapters, extensions, decorators, commands, is built with
          the same public seams you have. This section shows how to author each kind of building block,
          so a missing capability or runtime is a package you write, not a release you wait for.
        </Lead>

        <H2>The one rule that makes it possible</H2>
        <p>
          The micro-kernel depends on three primitives and nothing else; capability attaches through
          blueprints and providers, never by the core reaching outward. That single constraint is what
          lets anyone, first-party or not, extend the framework without forking it.
        </p>
        <Aphorism>If the core never reaches out, anything can plug in. Extending is the framework working as designed.</Aphorism>

        <H2>What you can author</H2>
        <SeeAlso links={[
          { title: 'Write your own adapter', path: '/docs/extending/adapter' },
          { title: 'Create a package or plugin', path: '/docs/extending/package' },
          { title: 'Create a decorator', path: '/docs/extending/decorator' },
          { title: 'Create CLI commands', path: '/docs/extending/commands' }
        ]} />

        <Callout kind='note' title='Built on the primitives'>
          Authoring often touches the three primitives directly, the pipeline, the container, the
          config store. The Primitives section documents each as a standalone library; keep it nearby
          while you build.
        </Callout>

        <SeeAlso links={[
          { title: 'Service providers', path: '/docs/di/providers' },
          { title: 'Blueprint middleware', path: '/docs/blueprint/middleware' },
          { title: 'Primitives', path: '/docs/primitives' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
