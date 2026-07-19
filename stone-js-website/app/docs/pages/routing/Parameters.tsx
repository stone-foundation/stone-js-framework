import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/routing/parameters'

const DECL = `
import { Get, EventHandler } from '@stone-js/router'
import { IncomingHttpEvent } from '@stone-js/http-core'

@EventHandler('/tasks')
export class TaskController {
  // Required param, constrained to digits.
  @Get('/:id', { rules: { id: /\\d+/ } })
  show (event: IncomingHttpEvent) {
    return this.tasks.find(event.get<string>('id'))
  }

  // Optional param with a default.
  @Get('/page/:n?', { defaults: { n: '1' } })
  page (event: IncomingHttpEvent) {
    return this.tasks.page(Number(event.get<string>('n')))
  }

  // Catch-all: matches the rest of the path.
  @Get('/files/:path*')
  file (event: IncomingHttpEvent) {
    return this.storage.read(event.get<string>('path'))
  }
}
`

const IMP = `
import { defineEventHandler, defineRoutes } from '@stone-js/router'

export const routes = defineRoutes([
  [defineEventHandler(TaskController, 'show'),
    { path: '/tasks/:id', method: 'GET', rules: { id: /\\d+/ } }],
  [defineEventHandler(TaskController, 'page'),
    { path: '/tasks/page/:n?', method: 'GET', defaults: { n: '1' } }],
  [defineEventHandler(TaskController, 'file'),
    { path: '/tasks/files/:path*', method: 'GET' }]
])
`

/**
 * Routing: parameters & constraints.
 */
@Page(PATH, { layout: 'docs' })
export class Parameters implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Parameters & constraints',
      description: 'Capture path segments as parameters, make them optional or catch-all, and constrain them with rules.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Routing' title='Parameters & constraints' />
        <Lead>
          A path can capture parts of the URL as named parameters. You read them off the event like
          any other intention, and you can make them optional, greedy, or subject to a pattern, so a
          route only matches when the shape is right.
        </Lead>

        <H2>Declaring and reading parameters</H2>
        <p>
          Prefix a segment with <code>:</code> to capture it. Inside the handler, read it with
          <code> event.get(name)</code>, exactly as you read query or body values, so the handler
          never cares where the value came from.
        </p>
        <CodeTabs file='app/Tasks.ts' decl={DECL} imp={IMP} />

        <H3>Parameter syntax</H3>
        <PropsTable nameHeader='Pattern' rows={[
          { name: ':id', type: 'required', desc: 'Captures exactly one segment; the route fails to match if it is absent.' },
          { name: ':id?', type: 'optional', desc: 'Matches with or without the segment; pair with defaults for a fallback value.' },
          { name: ':path*', type: 'catch-all (zero or more)', desc: 'Captures the rest of the path, slashes included.' },
          { name: ':path+', type: 'catch-all (one or more)', desc: 'Like *, but requires at least one segment.' }
        ]} />

        <H2>Constraints with rules</H2>
        <p>
          The <code>rules</code> option maps a parameter to a pattern. The route matches only when the
          parameter satisfies it, so <code>/tasks/42</code> reaches the handler while
          <code> /tasks/abc</code> does not, and can fall through to another route.
        </p>
        <Code file='app/Tasks.ts'>{`@Get('/:id', { rules: { id: /\\d+/ } })        // digits only
@Get('/:slug', { rules: { slug: '[a-z-]+' } }) // a string pattern works too`}</Code>

        <Callout kind='note' title='Parameters are strings'>
          Captured parameters arrive as strings. Convert at the edge of your handler
          (<code>Number(event.get('n'))</code>), or let model binding turn an id into a real entity,
          which is the next page.
        </Callout>

        <SeeAlso links={[
          { title: 'Model binding', path: '/docs/routing/binding' },
          { title: 'Query & body', path: '/docs/routing/query-body' },
          { title: 'Matching & precedence', path: '/docs/routing/matching' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
