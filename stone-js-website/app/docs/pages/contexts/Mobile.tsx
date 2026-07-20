import { JSX } from 'react'
import { siblings } from '../../nav'
import { StoneLink } from '@stone-js/use-react'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Aphorism, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/contexts/mobile'

/**
 * Contexts: mobile (forthcoming).
 */
@Page(PATH, { layout: 'docs' })
export class Mobile implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Mobile',
      description: 'Mobile is a forthcoming context: React Native / Expo as one more adapter around the same domain. Here is how it will fit.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Contexts' title='Mobile' />
        <Lead>
          Mobile is the next context on the roadmap, not a shipped one. This page is a promise with
          its reasoning shown: because every other runtime is already just an adapter, mobile will be
          too, and your domain will not change to reach it.
        </Lead>

        <Callout kind='note' title='Status: coming'>
          A React Native / Expo adapter is planned but not yet released. The APIs below are
          illustrative of the intended shape, not a current contract. Everything else in this section,
          backend, frontend, edge and agents, ships today.
        </Callout>

        <H2>Why it fits without a rewrite</H2>
        <p>
          A mobile app is another place a cause originates and an effect lands: a screen navigation,
          a tap, a background task. Under the Continuum that makes it a context like any other. The
          same handlers that render on the web and the same services that hold your logic are exactly
          what a mobile shell would drive.
        </p>
        <Aphorism>If the domain never named the web, it never has to un-name it to run on a phone.</Aphorism>

        <H2>The intended shape</H2>
        <p>
          Mobile will follow the pattern you have already seen: a view layer on <code>@stone-js/use-view</code>
          (shared with <StoneLink to='/docs/contexts/frontend'>the frontend</StoneLink>), driven by a
          native adapter. The manifest gains one decorator; the domain gains nothing.
        </p>

        <H2>Until then</H2>
        <p>
          Build your domain now, exactly as the rest of these docs describe. When the mobile adapter
          lands, it will collapse the domain you already have onto phones, the same way the edge and
          agent adapters did for their runtimes. Nothing you write today is waiting on it.
        </p>

        <Callout kind='future' title='This is the shape of every future runtime'>
          Mobile is the clearest illustration of the whole bet: new platforms arrive as adapters, not
          as rewrites. Whatever comes after mobile will arrive the same way, and find your domain
          ready.
        </Callout>

        <SeeAlso links={[
          { title: 'Mobile adapter (status)', path: '/docs/adapters/mobile' },
          { title: 'use-view', path: '/docs/frontend/use-view' },
          { title: 'Write your own adapter', path: '/docs/extending/adapter' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
