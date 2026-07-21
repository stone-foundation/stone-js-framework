import { JSX } from 'react'
import { CATALOG, CatalogModule } from '../ecosystem/registry'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'

/** A module card: a link to its docs when it has one, a plain card otherwise. */
function ModuleCard ({ m }: { m: CatalogModule }): JSX.Element {
  const body = (
    <>
      <p className='mc-name'>{m.name}</p>
      <p className='mc-desc'>{m.desc}</p>
      {m.href !== undefined && <span className='mc-more'>Read the docs →</span>}
    </>
  )
  return m.href !== undefined
    ? <a className='market-card is-link' href={m.href}>{body}</a>
    : <div className='market-card'>{body}</div>
}

/**
 * The Modules page: the ecosystem catalogue, front and centre. Every adapter and extension is a
 * product, each linking to its documentation. Kept out of the docs on purpose, this is where the
 * value is on display; the reference for each one lives in the docs.
 */
@Page('/ecosystem', { layout: 'site' })
export class EcosystemPage implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Modules · Stone.js',
      description: 'The Stone.js ecosystem: a keystone kernel with adapters and extensions that plug in through blueprints. Browse every module and jump into its docs.'
    }
  }

  render (): JSX.Element {
    return (
      <div className='wrap eco-wrap'>
        <header className='section-hero'>
          <p className='eyebrow'><span className='psi'>ψ</span>The ecosystem</p>
          <h1 className='mono-title'>Modules</h1>
          <p className='lede'>
            A keystone kernel with three dependencies; everything else, adapters and extensions,
            plugs in through blueprints, never the other way around. Deploy to any runtime, add only
            what you need. Every module links to its documentation.
          </p>
        </header>

        {CATALOG.map((group) => (
          <section key={group.tier} className='market-group'>
            <h2 className='market-tier'>{group.tier}</h2>
            <p className='market-blurb'>{group.blurb}</p>
            <div className='market-grid'>
              {group.modules.map((m) => <ModuleCard key={m.name} m={m} />)}
            </div>
          </section>
        ))}
      </div>
    )
  }
}
