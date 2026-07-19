import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/frontend/head'

/**
 * Frontend: head & metadata.
 */
@Page(PATH, { layout: 'docs' })
export class Head implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Head & metadata',
      description: 'Set the document title, meta, links and structured data per page with head(), or from a component with useHead. SSR bakes it into the HTML.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Frontend' title='Head & metadata' />
        <Lead>
          Good metadata is not an afterthought: it is what search engines and social cards read. A
          page declares its head in one place, and on SSR/SSG it is rendered straight into the HTML,
          so crawlers see it without running your JavaScript.
        </Lead>

        <H2>Per-page head</H2>
        <p>
          Return a <code>HeadContext</code> from a page's <code>head()</code>. It can depend on the
          page's data, so titles and descriptions reflect what is actually on the page.
        </p>
        <Code file='app/pages/TaskPage.tsx'>{`head ({ data }: { data: Task }): HeadContext {
  return {
    title: data.title,
    titleTemplate: '%s · Tasks',
    description: \`Task: \${data.title}\`,
    metas: [{ property: 'og:type', content: 'article' }]
  }
}`}</Code>

        <H2>The HeadContext</H2>
        <PropsTable rows={[
          { name: 'title', type: 'string', desc: 'The document title.' },
          { name: 'titleTemplate', type: 'string', desc: "A wrapper for the title, e.g. '%s · Tasks'." },
          { name: 'description', type: 'string', desc: 'The meta description.' },
          { name: 'metas', type: 'MetaDescriptor[]', desc: 'Arbitrary meta tags (Open Graph, Twitter, ...).' },
          { name: 'links', type: 'LinkDescriptor[]', desc: 'Link tags (canonical, preconnect, ...).' },
          { name: 'scripts', type: 'ScriptDescriptor[]', desc: 'Scripts (src or inline content).' },
          { name: 'jsonLd', type: 'object[]', desc: 'JSON-LD structured data blocks.' },
          { name: 'htmlAttributes / bodyAttributes', type: 'Record<string,string>', desc: 'Attributes on <html> / <body> (e.g. lang).' }
        ]} />

        <H3>From a component</H3>
        <p>
          Deep in the tree, a component can contribute to the head with <code>useHead</code>, merging
          onto what the page declared. Useful for widgets that need their own preconnect or meta.
        </p>
        <Code file='app/pages/Gallery.tsx' lang='tsx'>{`import { useHead } from '@stone-js/use-react'

export function Gallery () {
  useHead({ links: [{ rel: 'preconnect', href: 'https://images.example.com' }] })
  return <div className='gallery'>{/* ... */}</div>
}`}</Code>

        <Callout kind='future' title='SEO comes free with SSR/SSG'>
          Because the head is rendered into the static HTML on SSR and SSG, structured data and social
          cards work without a headless crawler running your app. The same page in CSR still sets the
          head, just in the browser.
        </Callout>

        <SeeAlso links={[
          { title: 'Pages', path: '/docs/frontend/pages' },
          { title: 'Rendering: CSR, SSR, SSG', path: '/docs/frontend/rendering' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
