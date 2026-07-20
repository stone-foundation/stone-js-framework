import { JSX } from 'react'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Aphorism, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/primitives'

/**
 * Primitives: overview.
 */
@Page(PATH, { layout: 'docs' })
export class Overview implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Primitives',
      description: 'The three libraries the kernel is built on: pipeline, service container and config. Small, focused, and usable on their own.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Primitives' title='Primitives' />
        <Lead>
          The micro-kernel depends on exactly three packages, and nothing else. They are small,
          single-purpose libraries you can read in an afternoon, and they explain how the whole
          framework behaves, because everything above them is composed from them.
        </Lead>

        <H2>The three</H2>
        <p>
          You rarely import them directly in an app, the framework wires them for you, but knowing them
          demystifies the rest, and each is useful standalone.
        </p>
        <SeeAlso links={[
          { title: 'Pipeline', path: '/docs/primitives/pipeline' },
          { title: 'Service container', path: '/docs/primitives/service-container' },
          { title: 'Config', path: '/docs/primitives/config' }
        ]} />
        <Aphorism>Three primitives, one kernel. Learn them and the framework stops being magic.</Aphorism>

        <Callout kind='note' title='Where you meet them'>
          The pipeline runs the build phase and the middleware chain; the container is dependency
          injection; config is the Blueprint store. Everything else, adapters, extensions, the view
          dimension, is built on these three.
        </Callout>

        <SeeAlso links={[
          { title: 'Middleware', path: '/docs/middleware' },
          { title: 'The container', path: '/docs/di' },
          { title: 'The Blueprint', path: '/docs/blueprint' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
