import { JSX } from 'react'
import { CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/frontend/error-pages'

const DECL = `
import { ErrorPage, IErrorPage, ReactIncomingEvent } from '@stone-js/use-react'

@ErrorPage({ error: 'RuntimeError' })
export class NotFoundPage implements IErrorPage<ReactIncomingEvent> {
  render ({ error, statusCode }: { error: Error, statusCode: number }) {
    return (
      <section className='error'>
        <h1>{statusCode}</h1>
        <p>{error.message}</p>
        <a href='/'>Take me home</a>
      </section>
    )
  }
}
`

const IMP = `
import { defineErrorPage } from '@stone-js/use-react'

const NotFoundPage = () => ({
  render: ({ error, statusCode }) => (
    <section className='error'>
      <h1>{statusCode}</h1>
      <p>{error.message}</p>
      <a href='/'>Take me home</a>
    </section>
  )
})

export const errorPages = [defineErrorPage(NotFoundPage, { error: 'RuntimeError' }, true)]
`

/**
 * Frontend: error pages.
 */
@Page(PATH, { layout: 'docs' })
export class ErrorPages implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Error pages',
      description: 'Render a view for an error instead of a raw payload. Map error types to pages; handle adapter-level failures separately.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Frontend' title='Error pages' />
        <Lead>
          On a React context, an error should become a page, not a stack trace. The same error-mapping
          you saw on the backend renders a component here: a not-found page, a forbidden page, a
          friendly fallback, chosen by the type of error thrown.
        </Lead>

        <H2>Mapping an error to a page</H2>
        <p>
          Mark a component with <code>@ErrorPage({'{'} error {'}'})</code> (or register a
          <code> defineErrorPage</code>). When a matching error propagates, its <code>render</code>
          receives the error and a status code and returns the view.
        </p>
        <CodeTabs file='app/errors/NotFoundPage.tsx' decl={DECL} imp={IMP} />

        <H3>The error render context</H3>
        <p>
          An error page's <code>render</code> extends the page render context with the
          <code> error</code> and a <code>statusCode</code>, so it can show a tailored message and set
          the right status on the response.
        </p>

        <H2>Adapter error pages</H2>
        <p>
          Some failures happen before the kernel even runs, at the adapter boundary. An
          <code> @AdapterErrorPage</code> handles those integration-level errors, so even a failure in
          the plumbing renders something human instead of a blank 500.
        </p>

        <Callout kind='note' title='Same mechanism as the backend'>
          Error pages are the frontend face of the error handling you already know: throw a meaningful
          error in a page loader or component, and the matching error page renders. On an API context
          the same throw becomes a JSON error instead. One model, two faces.
        </Callout>

        <SeeAlso links={[
          { title: 'Error handling', path: '/docs/essentials/errors' },
          { title: 'Pages', path: '/docs/frontend/pages' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
