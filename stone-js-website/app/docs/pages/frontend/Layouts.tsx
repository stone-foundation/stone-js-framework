import { JSX } from 'react'
import { CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/frontend/layouts'

const DECL = `
import { PageLayout, IPageLayout, StoneOutlet } from '@stone-js/use-react'
import { ReactNode } from 'react'

@PageLayout({ name: 'default' })
export class BaseLayout implements IPageLayout {
  render ({ children }: { children: ReactNode }) {
    return (
      <div className='app'>
        <header>Tasks</header>
        <main><StoneOutlet>{children}</StoneOutlet></main>
        <footer>© Tasks</footer>
      </div>
    )
  }
}
`

const IMP = `
import { definePageLayout, StoneOutlet } from '@stone-js/use-react'

const BaseLayout = () => ({
  render: ({ children }) => (
    <div className='app'>
      <header>Tasks</header>
      <main><StoneOutlet>{children}</StoneOutlet></main>
      <footer>© Tasks</footer>
    </div>
  )
})

export const layouts = [definePageLayout(BaseLayout, { name: 'default' }, true)]
`

/**
 * Frontend: layouts.
 */
@Page(PATH, { layout: 'docs' })
export class Layouts implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Layouts',
      description: 'Wrap pages in shared structure with @PageLayout and StoneOutlet. Name layouts to give different sections their own frame.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Frontend' title='Layouts' />
        <Lead>
          A layout is the frame around a page: the header, footer and shell that stay put while the
          page changes. Unlike a page, a layout is not an event handler; it lives purely in the view
          dimension, and it renders the page through a <code>StoneOutlet</code>.
        </Lead>

        <H2>Defining a layout</H2>
        <p>
          Mark a class with <code>@PageLayout({'{'} name {'}'})</code> and render your shell, placing the
          page where <code>StoneOutlet</code> sits. A layout may implement <code>head</code>, but never
          <code> handle</code>: it does not process events.
        </p>
        <CodeTabs file='app/layouts/BaseLayout.tsx' decl={DECL} imp={IMP} />

        <H3>Named layouts</H3>
        <p>
          The <code>name</code> makes a layout selectable. The one named <code>default</code> wraps any
          page that does not choose otherwise; register others (<code>admin</code>, <code>auth</code>)
          and opt in per page.
        </p>
        <CodeTabs
          file='app/pages/AdminPage.tsx'
          decl={`@Page('/admin', { layout: 'admin' })
export class AdminPage implements IPage<ReactIncomingEvent> {
  render () { return <Dashboard /> }
}`}
          imp={`const AdminPage = () => ({ render: () => <Dashboard /> })

export const pages = [definePage(AdminPage, { path: '/admin', layout: 'admin' }, true)]`}
        />

        <Callout kind='note' title='Layouts are view-only'>
          A layout has <code>render</code> and optionally <code>head</code>, nothing else. No
          middleware, no lifecycle, no event handling. Keep logic in pages and services; the layout
          just frames what they produce.
        </Callout>

        <H2>Root providers</H2>
        <p>
          Some context wraps the <em>whole</em> app, not one layout: a theme, an i18n provider, a data-
          fetching client. A <strong>view provider</strong> wraps the entire tree, above every layout
          and page, and runs on the server render and the client hydration alike, so context is
          consistent in both.
        </p>
        <CodeTabs
          file='app/AppProviders.tsx'
          decl={`import { ViewProvider, IViewProvider } from '@stone-js/use-react'
import { ReactNode } from 'react'

@ViewProvider()
export class AppProviders implements IViewProvider {
  render ({ children }: { children: ReactNode }) {
    return (
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </ThemeProvider>
    )
  }
}`}
          imp={`import { defineViewProvider } from '@stone-js/use-react'

const AppProviders = () => ({
  render: ({ children }) => (
    <ThemeProvider><QueryClientProvider client={queryClient}>{children}</QueryClientProvider></ThemeProvider>
  )
})

export const viewProviders = [defineViewProvider(AppProviders, {}, true)]`}
        />
        <Callout kind='note' title='Provider vs layout'>
          A layout frames a page's visible chrome and can differ per page. A view provider supplies
          invisible, app-wide context and wraps everything. Reach for a provider for
          <code> Context</code> that must exist everywhere; a layout for structure a page opts into.
        </Callout>

        <SeeAlso links={[
          { title: 'Pages', path: '/docs/frontend/pages' },
          { title: 'Components & links', path: '/docs/frontend/components' },
          { title: 'Head & metadata', path: '/docs/frontend/head' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
