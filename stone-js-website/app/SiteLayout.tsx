import { Header, Footer } from './components/Header'
import { BetaBanner } from './components/BetaBanner'
import { Analytics } from './components/Analytics'
import { ScrollToHash } from './components/ScrollToHash'
import { ReactNode } from 'react'
import { IPageLayout, PageLayout, PageLayoutRenderContext, StoneOutlet } from '@stone-js/use-react'

/** Applies the theme before first paint (no flash): the saved choice, else dark by default. */
const NO_FLASH = "(function(){try{var d=document.documentElement,t=localStorage.getItem('stone-theme');d.setAttribute('data-theme',t||'dark');}catch(e){d.setAttribute('data-theme','dark');}})();"

/**
 * The site shell for the marketing/content sections (Modules, Starters, Blog):
 * the global header + footer around a page outlet. Distinct from the docs
 * layout; pages opt in with `@Page(path, { layout: 'site' })`.
 */
@PageLayout({ name: 'site' })
export class SiteLayout implements IPageLayout {
  render ({ children }: PageLayoutRenderContext): ReactNode {
    return (
      <div className='site-root'>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH }} />
        <ScrollToHash />
        <Analytics />
        <BetaBanner />
        <Header />
        <main className='site-main'>
          <StoneOutlet>{children}</StoneOutlet>
        </main>
        <Footer />
      </div>
    )
  }
}
