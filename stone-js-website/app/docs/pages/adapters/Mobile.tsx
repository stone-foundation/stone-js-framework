import { JSX } from 'react'
import { siblings } from '../../nav'
import { StoneLink } from '@stone-js/use-react'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Aphorism, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/adapters/mobile'

/**
 * Adapters: Mobile (forthcoming).
 */
@Page(PATH, { layout: 'docs' })
export class Mobile implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Mobile adapter',
      description: 'A forthcoming adapter: React Native / Expo as one more context around the same domain. Here is the intended shape.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Adapters' title='Mobile' />
        <Lead>
          Mobile is a planned adapter, not a shipped one. It earns a page because the reasoning is
          worth stating: since every other runtime is just an adapter, mobile will be too, and the
          domain you write today will reach it without a rewrite.
        </Lead>

        <Callout kind='note' title='Status: coming'>
          A React Native / Expo adapter is on the roadmap but not yet released. The shape below is the
          intended design, not a current contract. Every other adapter in this section ships today.
        </Callout>

        <H2>Why it fits without a rewrite</H2>
        <p>
          A mobile app is another source of causes and sink of effects: a screen navigation, a tap, a
          background task. Under the Continuum that is a context, and the same pages and services that
          run on the web are what a mobile shell would drive, through <StoneLink to='/docs/frontend/use-view'>use-view</StoneLink>.
        </p>
        <Aphorism>If the domain never named the web, it never has to un-name it to run on a phone.</Aphorism>

        <H2>The intended shape</H2>
        <p>
          Expect the familiar move: install the adapter, add its decorator to the manifest, and the
          view dimension renders natively. The manifest gains one line; the domain gains nothing.
        </p>

        <H2>Until then</H2>
        <p>
          Build your domain now, exactly as this manual describes. When the mobile adapter lands, it
          will collapse the domain you already have onto phones, the same way the edge and agent
          adapters did for their runtimes.
        </p>

        <SeeAlso links={[
          { title: 'Mobile context', path: '/docs/contexts/mobile' },
          { title: 'use-view', path: '/docs/frontend/use-view' },
          { title: 'Write your own adapter', path: '/docs/frontier/adapter' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
