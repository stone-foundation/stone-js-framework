import React from 'react'
import { Page } from '@stone-js/router'
import logo from '@img/logo.png'
import {
  createHead,
  IPage,
  PageRenderContext,
  ReactIncomingEvent
} from '@stone-js/use-react'

interface HomeData {
  message: string
}

/**
 * Home page — demonstrates:
 *  - the fluent head/meta API (title template, description, canonical, Open Graph,
 *    Twitter card and JSON-LD structured data), all from `head()`;
 *  - importing a static asset via the `@img` alias (resolved by the CLI's Vite config).
 */
@Page({ path: '/' })
export class HomePage implements IPage<ReactIncomingEvent> {
  handle (): HomeData {
    return { message: 'Write your domain once. Stone.js applies the context.' }
  }

  head () {
    return createHead()
      .title('Home')
      .titleTemplate('%s — Stone.js Showcase')
      .description('A Continuum Architecture showcase: universal pages, SSR head, static assets.')
      .canonical('https://showcase.stonejs.dev/')
      .og({
        type: 'website',
        siteName: 'Stone.js Showcase',
        image: { url: 'https://showcase.stonejs.dev/og.png', width: 1200, height: 630, alt: 'Stone.js' }
      })
      .twitter({ card: 'summary_large_image', site: '@stonejs' })
      .robots({ index: true, follow: true })
      .jsonLd({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Stone.js Showcase',
        url: 'https://showcase.stonejs.dev/'
      })
      .toContext()
  }

  render ({ data }: PageRenderContext<HomeData>) {
    return (
      <main>
        <img src={logo} alt="Stone.js" width={96} height={96} />
        <h1>Stone.js Showcase</h1>
        <p>{data?.message}</p>
      </main>
    )
  }
}
