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
import { BetaBanner } from '../components/BetaBanner'
import { Analytics } from '../components/Analytics'
import { defaultSocialHead } from '../site'
import { ScrollToHash } from '../components/ScrollToHash'
import { Manifesto, FinalCta } from '../sections/Closing'
import { IPage, Page, ReactIncomingEvent, HeadContext } from '@stone-js/use-react'

/** Applies the theme before first paint (no flash): the saved choice, else dark by default.
 *  The home page renders its own Header/Footer (not SiteLayout), so it carries its own copy. */
const NO_FLASH = "(function(){try{var d=document.documentElement,t=localStorage.getItem('stone-theme');d.setAttribute('data-theme',t||'dark');}catch(e){d.setAttribute('data-theme','dark');}})();"

/**
 * The landing page: Monument design, Superposition storytelling.
 * The hero is the thesis; every section below it is a proof.
 */
@Page('/')
export class HomePage implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    // The landing page has no layout (it renders its own Header/Footer), so it carries the
    // brand-default social card itself instead of inheriting it from a layout head.
    return {
      title: 'Stone.js · Your app exists in every runtime. Until you run it.',
      description: 'The Continuum framework. Write your domain once: it lives in superposition across every context (server, edge, browser, agents) and collapses into one at runtime.',
      metas: [
        ...(defaultSocialHead().metas ?? []),
        { name: 'author', content: 'Stone Foundation' },
        { name: 'keywords', content: 'stonejs,continuum,framework,typescript,javascript,edge,agents,mcp' }
      ]
    }
  }

  render (): JSX.Element {
    return (
      <div>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
        <BetaBanner />
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
