import { JSX } from 'react'
import { Physics } from '../sections/Physics'
import { Strata } from '../sections/Strata'
import { Agents } from '../sections/Agents'
import { HeroAtom } from '../sections/HeroAtom'
import { Paradigms } from '../sections/Paradigms'
import { Ecosystem } from '../sections/Ecosystem'
import { Showcase } from '../sections/Showcase'
import { CollapseLab } from '../sections/CollapseLab'
import { Header, Footer } from '../components/Header'
import { Analytics } from '../components/Analytics'
import { ScrollToHash } from '../components/ScrollToHash'
import { Manifesto, FinalCta } from '../sections/Closing'
import { IPage, Page, ReactIncomingEvent, HeadContext } from '@stone-js/use-react'

/**
 * The landing page: Monument design, Superposition storytelling.
 * The hero is the thesis; every section below it is a proof.
 */
@Page('/')
export class HomePage implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Stone.js · Build once, deploy anywhere',
      description: 'The Continuum framework. Write your domain once: it lives in superposition across every context (server, edge, browser, agents) and collapses into one at runtime.',
      metas: [
        { name: 'author', content: 'Stone Foundation' },
        { name: 'keywords', content: 'stonejs,continuum,framework,typescript,javascript,edge,agents,mcp' }
      ]
    }
  }

  render (): JSX.Element {
    return (
      <div>
        <ScrollToHash />
        <Header />
        <Analytics />
        <main>
          <HeroAtom />
          <Physics />
          <hr className='filet' />
          <CollapseLab />
          <Paradigms />
          <Strata />
          <hr className='filet' />
          <Ecosystem />
          <Showcase />
          <Agents />
          <Manifesto />
          <FinalCta />
        </main>
        <Footer />
      </div>
    )
  }
}
