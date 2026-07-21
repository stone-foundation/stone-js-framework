import { JSX } from 'react'
import { siblings } from '../nav'
import { CATALOG } from '../../ecosystem/registry'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Pager } from '../components/content'

const PATH = '/docs/ecosystem'

/**
 * Ecosystem: the catalog, grouped by role. Rendered from the shared ecosystem registry (the same
 * data behind the top-level /ecosystem page); adapters and extensions link to their own docs.
 */
@Page(PATH, { layout: 'docs' })
export class Ecosystem implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Ecosystem',
      description: 'A keystone kernel with three dependencies; everything else, adapters and extensions, plugs in through blueprints. Browse the catalog.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Ecosystem' title='A keystone kernel. Everything else plugs in.' />
        <Lead>
          The core depends on three primitives and nothing more. Every other package, adapters and
          extensions alike, grafts onto it through a blueprint, never the other way around. That is
          why the catalog can grow without the center ever changing.
        </Lead>

        {CATALOG.map((group) => (
          <section key={group.tier} className='market-group'>
            <H2>{group.tier}</H2>
            <p className='market-blurb'>{group.blurb}</p>
            <div className='market-grid'>
              {group.modules.map((m) => (
                m.href !== undefined
                  ? (
                    <a key={m.name} className='market-card is-link' href={m.href}>
                      <p className='mc-name'>{m.name}</p>
                      <p className='mc-desc'>{m.desc}</p>
                    </a>
                    )
                  : (
                    <div key={m.name} className='market-card'>
                      <p className='mc-name'>{m.name}</p>
                      <p className='mc-desc'>{m.desc}</p>
                    </div>
                    )
              ))}
            </div>
          </section>
        ))}

        <Callout kind='future' title='The catalog is open'>
          Because adapters and extensions attach through blueprints, a community package sits beside
          a first-party one with no privileged access and no core change. The next capability, and
          the next runtime, can come from anyone.
        </Callout>

        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
