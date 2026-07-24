import React from 'react'
import { PageLayout, IPageLayout, PageLayoutRenderContext } from '@stone-js/use-react'

/**
 * The default layout. In a future iteration (hierarchical heads), a layout may also
 * contribute a base head via `createHead().merge(...)`.
 */
@PageLayout({ name: 'default' })
export class MainLayout implements IPageLayout {
  render ({ children }: PageLayoutRenderContext) {
    return (
      <div className="app">
        <header><nav><a href="/">Home</a> · <a href="/blog/hello-world">Blog</a></nav></header>
        {children}
        <footer>◆ Stone.js — the continuum framework</footer>
      </div>
    )
  }
}
