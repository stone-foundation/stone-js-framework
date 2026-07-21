import { Header, Footer } from './components/Header'
import { Analytics } from './components/Analytics'
import { ScrollToHash } from './components/ScrollToHash'
import { ReactNode } from 'react'
import { IPageLayout, PageLayout, PageLayoutRenderContext, StoneOutlet } from '@stone-js/use-react'

/** Restores theme before first paint, so there is no flash. */
const NO_FLASH = "(function(){try{var d=document.documentElement,t=localStorage.getItem('stone-theme');if(t)d.setAttribute('data-theme',t);}catch(e){}})();"

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
        <Header />
        <main className='site-main'>
          <StoneOutlet>{children}</StoneOutlet>
        </main>
        <Footer />
      </div>
    )
  }
}
