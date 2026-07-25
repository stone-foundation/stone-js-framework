import React from 'react'
import { PageLayout, StoneOutlet, IPageLayout, PageLayoutRenderContext } from '@stone-js/use-react'

/**
 * The default layout: a thin branded chrome (top bar + footer) around the page outlet.
 * The page content is placed via <StoneOutlet>, never a bare {children}.
 */
@PageLayout({ name: 'default' })
export class MainLayout implements IPageLayout {
  render ({ children }: PageLayoutRenderContext) {
    return (
      <div className='cx-shell'>
        <header className='cx-nav'>
          <a className='cx-wordmark' href='/'><span className='dot'>●</span> Stone.js</a>
          <nav>
            <a href='/'>Home</a>
            <a href='/blog/hello-world'>Blog</a>
          </nav>
        </header>
        <StoneOutlet>{children}</StoneOutlet>
        <footer className='cx-foot'>Built with Stone.js — the continuum framework</footer>
      </div>
    )
  }
}
