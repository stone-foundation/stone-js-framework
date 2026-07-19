import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/routing/matching'

/**
 * Routing: matching & precedence.
 */
@Page(PATH, { layout: 'docs' })
export class Matching implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Matching & precedence',
      description: 'How the router picks a route: method, path specificity, constraints, and host or scheme, plus how to keep ambiguity out of your table.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Routing' title='Matching & precedence' />
        <Lead>
          When a cause arrives, the router finds the one route that answers it. Knowing how that
          choice is made, and how to make it unambiguous, is what keeps a growing route table
          predictable.
        </Lead>

        <H2>How a route is chosen</H2>
        <p>
          Matching considers, in effect: the HTTP method, then the path pattern, with more specific
          patterns preferred over catch-alls, then any constraints (<code>rules</code>) that must
          hold, and finally host (<code>domain</code>) and scheme (<code>protocol</code>) if declared.
          A route that fails any of these is skipped, and the next candidate is tried.
        </p>
        <PropsTable nameHeader='Criterion' rows={[
          { name: 'method', type: 'exact', desc: 'The verb must match (or the route must be @Any / list the method).' },
          { name: 'path specificity', type: 'static > param > catch-all', desc: 'A literal segment beats :param, which beats :rest*.' },
          { name: 'rules', type: 'must pass', desc: 'A parameter constraint that fails removes the route from contention.' },
          { name: 'domain / protocol', type: 'optional filter', desc: 'Restrict a route to a host or scheme.' },
          { name: 'strict', type: 'boolean', desc: 'When on, trailing-slash and case differences stop a match.' }
        ]} />

        <H2>Keeping the table unambiguous</H2>
        <p>
          Order-independence is the goal: two routes should never both be able to match the same
          request. Use constraints to separate look-alike paths, and reserve catch-alls for genuine
          fallbacks.
        </p>
        <Code file='app/routes.ts'>{`@Get('/tasks/:id', { rules: { id: /\\d+/ } })   // /tasks/42
@Get('/tasks/:slug')                            // /tasks/ship-the-docs
// The constraint keeps these two from ever competing for the same URL.`}</Code>

        <H2>Host and scheme</H2>
        <Code file='app/routes.ts'>{`@Get('/', { domain: 'admin.example.com' })         // only on that host
@Post('/hook', { protocol: 'https' })              // only over https`}</Code>

        <Callout kind='important' title='A missed match is a 404, not a crash'>
          If no route matches, the router raises a not-found the error handler maps to a 404. Add a
          fallback route (next page) to turn that into a friendly page or a custom payload.
        </Callout>

        <SeeAlso links={[
          { title: 'Parameters & constraints', path: '/docs/routing/parameters' },
          { title: 'Misc: fallback & current route', path: '/docs/routing/misc' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
