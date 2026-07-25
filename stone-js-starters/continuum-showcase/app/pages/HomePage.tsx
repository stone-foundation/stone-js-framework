import React from 'react'
import logo from '@img/logo.svg'
import {
  Page,
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
@Page('/')
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
      <section className='stone-welcome'>
        <div className='glow' aria-hidden='true' />
        <div className='hero'>
          <img className='mark' src={logo} alt='Stone.js' width={104} height={104} />
          <p className='eyebrow'>The continuum showcase</p>
          <h1 className='title'>Stone.js</h1>
          <p className='lead'>{data?.message}</p>
          <p className='tagline'>
            One domain, rendered on the server and hydrated in the browser, with a fluent
            head / OpenGraph API and static-asset aliases.
          </p>
          <nav className='links'>
            <a href='/blog/hello-world'>Read the blog demo</a>
            <a href='https://stonejs.dev/docs' target='_blank' rel='noreferrer noopener'>Documentation</a>
            <span className='edit'>Edit <b>app/pages/HomePage.tsx</b></span>
          </nav>
        </div>
      </section>
    )
  }
}
