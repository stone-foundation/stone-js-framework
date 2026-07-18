import React from 'react'
import { Page } from '@stone-js/router'
import {
  createHead,
  IPage,
  PageRenderContext,
  PageHeadContext,
  ReactIncomingEvent
} from '@stone-js/use-react'

interface Post {
  slug: string
  title: string
  excerpt: string
  cover: string
  body: string
}

/**
 * Blog post page — demonstrates a fully dynamic, data-driven head built from the
 * loader (`handle`) output, including an `article` Open Graph type and per-post JSON-LD.
 */
@Page({ path: '/blog/:slug' })
export class BlogPostPage implements IPage<ReactIncomingEvent> {
  handle (event: ReactIncomingEvent): Post {
    const slug = event.get<string>('slug', 'hello-world')
    return {
      slug,
      title: 'Hello, Continuum',
      excerpt: 'How Stone.js applies context to your domain at runtime.',
      cover: `https://showcase.stonejs.dev/covers/${slug}.png`,
      body: 'Full article content…'
    }
  }

  head ({ data }: PageHeadContext<Post>) {
    const post = data as Post
    return createHead()
      .title(post.title)
      .titleTemplate('%s — Stone.js Blog')
      .description(post.excerpt)
      .canonical(`https://showcase.stonejs.dev/blog/${post.slug}`)
      .og({ type: 'article', image: post.cover, siteName: 'Stone.js Blog' })
      .twitter({ card: 'summary_large_image', site: '@stonejs' })
      .jsonLd({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description: post.excerpt
      })
      .toContext()
  }

  render ({ data }: PageRenderContext<Post>) {
    return (
      <article>
        <h1>{data?.title}</h1>
        <p>{data?.body}</p>
      </article>
    )
  }
}
