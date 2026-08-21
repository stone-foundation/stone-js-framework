import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/routing/definitions'

const DECL = `
import { EventHandler, Get, Post, Put, Patch, Delete, Any, Match } from '@stone-js/router'
import { IncomingHttpEvent } from '@stone-js/http-core'

@EventHandler('/tasks')
export class TaskController {
  @Get('/')            list ()            { /* GET /tasks */ }
  @Get('/:id')         show (e: IncomingHttpEvent) { /* GET /tasks/:id */ }
  @Post('/')           create (e: IncomingHttpEvent) { /* POST /tasks */ }
  @Put('/:id')         replace (e: IncomingHttpEvent) { /* PUT /tasks/:id */ }
  @Patch('/:id')       update (e: IncomingHttpEvent) { /* PATCH /tasks/:id */ }
  @Delete('/:id')      remove (e: IncomingHttpEvent) { /* DELETE /tasks/:id */ }
  @Any('/search')      search (e: IncomingHttpEvent) { /* any method */ }
  @Match(['GET', 'HEAD'], '/health') health () { /* specific methods */ }
}
`

const IMP = `
import { defineEventHandler, defineRoutes } from '@stone-js/router'

export const routes = defineRoutes([
  [defineEventHandler(TaskController, 'list'),    { path: '/tasks',     method: 'GET' }],
  [defineEventHandler(TaskController, 'show'),    { path: '/tasks/:id', method: 'GET' }],
  [defineEventHandler(TaskController, 'create'),  { path: '/tasks',     method: 'POST' }],
  [defineEventHandler(TaskController, 'replace'), { path: '/tasks/:id', method: 'PUT' }],
  [defineEventHandler(TaskController, 'update'),  { path: '/tasks/:id', method: 'PATCH' }],
  [defineEventHandler(TaskController, 'remove'),  { path: '/tasks/:id', method: 'DELETE' }],
  [defineEventHandler(TaskController, 'search'),  { path: '/search',    methods: ['GET', 'POST'] }]
])
`

/**
 * Routing: route definitions.
 */
@Page(PATH, { layout: 'docs' })
export class Definitions implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Route definitions',
      description: 'Bind handlers to HTTP verbs and paths with method decorators or defineRoutes: the full set of ways to declare a route.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Routing' title='Route definitions' />
        <Lead>
          A route definition ties a method and a path to a handler. Stone.js gives you a decorator per
          HTTP verb, a controller decorator for grouping, and an imperative equivalent for each, all
          producing the same route table.
        </Lead>

        <H2>Verb decorators</H2>
        <p>
          Inside a controller (a class marked with <code>@EventHandler(basePath)</code>), each method
          binds to a verb and a sub-path. Paths combine: the controller's base path plus the method's
          path.
        </p>
        <CodeTabs file='app/Tasks.ts' decl={DECL} imp={IMP} />

        <H3>The available decorators</H3>
        <PropsTable nameHeader='Decorator' rows={[
          { name: '@Get', type: '(path, options?)', desc: 'Bind a GET route.' },
          { name: '@Post', type: '(path, options?)', desc: 'Bind a POST route.' },
          { name: '@Put', type: '(path, options?)', desc: 'Bind a PUT route.' },
          { name: '@Patch', type: '(path, options?)', desc: 'Bind a PATCH route.' },
          { name: '@Delete', type: '(path, options?)', desc: 'Bind a DELETE route.' },
          { name: '@Options', type: '(path, options?)', desc: 'Bind an OPTIONS route.' },
          { name: '@Any', type: '(path, options?)', desc: 'Match every HTTP method.' },
          { name: '@Match', type: '(methods, path, options?)', desc: 'Match a specific set of methods.' },
          { name: '@EventHandler', type: '(basePath, options?)', desc: 'Mark a class as a controller with a shared base path.' }
        ]} />

        <H2>Route options</H2>
        <p>
          Every verb decorator (and every entry of <code>defineRoutes</code>) accepts the same option
          object. The most common are below; later pages cover the rest in context.
        </p>
        <PropsTable rows={[
          { name: 'name', type: 'string', desc: 'A stable name for URL generation and links.' },
          { name: 'path', type: 'string | string[]', required: true, desc: 'The path pattern (imperative form; the decorator takes it as its first argument).' },
          { name: 'method / methods', type: "HttpMethod | HttpMethod[]", desc: 'The verb(s) matched.' },
          { name: 'middleware', type: 'MixedPipe[]', desc: 'Middleware run on the way to this handler.' },
          { name: 'rules', type: 'Record<string, RegExp | string>', desc: 'Constraints on path parameters.' },
          { name: 'bindings', type: 'Record<string, Resolver>', desc: 'Resolve a parameter into a model.' },
          { name: 'defaults', type: 'Record<string, unknown>', desc: 'Default values for optional parameters.' },
          { name: 'redirect', type: 'string | object', desc: 'Redirect instead of handling.' },
          { name: 'response', type: '{ type?, status?, headers? }', desc: 'What the route answers with. The handler returns the payload; the framework builds the response.' }
        ]} />

        <H2>Declaring what a route answers with</H2>
        <p>
          A route already says what it is: its path, its verb, what it accepts, whether it is protected.
          <code> response</code> is the other half of that sentence, so the handler can stay about the
          domain and there is one place to read when you want to know what an endpoint returns.
        </p>
        <Code file='app/TasksController.ts'>{`@Post('/tasks', { response: { type: 'json', status: 201 } })
create (event: IncomingHttpEvent): Task {
  return this.tasks.add(event.get('body'))   // the payload, nothing else
}

@Delete('/tasks/:id', { response: { type: 'no-content' } })
remove (event: IncomingHttpEvent): void { this.tasks.remove(event.get('id')) }`}</Code>
        <PropsTable nameHeader='key' rows={[
          { name: 'type', type: "'json' | 'jsonp' | 'html' | 'text' | 'file' | 'redirect' | 'no-content'", default: "'json'", desc: 'What kind of answer it is.' },
          { name: 'status', type: 'number', default: '200', desc: 'The status a successful answer carries. 302 for a redirect, 204 for no content.' },
          { name: 'headers', type: 'Record<string, string>', desc: 'Headers to send with it.' }
        ]} />
        <Callout kind='note' title='A method decorator still wins'>
          <code>@JsonHttpResponse(201)</code> produces the response itself, so when a handler has
          already answered, the route option steps aside: the more specific statement is the one that
          holds. The two forms are a choice, not a conflict. The published contract reads the same
          declaration, so a route answering <code>201</code> is documented as answering{' '}
          <code>201</code> without saying it twice.
        </Callout>

        <Callout kind='note' title='The three forms apply here too'>
          A handler can be a class method (shown here), a factory, or a plain function. The imperative
          <code> defineEventHandler(handler, method?)</code> accepts all three. Pick the form that
          fits; the route table is identical.
        </Callout>

        <SeeAlso links={[
          { title: 'Parameters & constraints', path: '/docs/routing/parameters' },
          { title: 'Groups & prefixes', path: '/docs/routing/groups' },
          { title: 'Event handlers', path: '/docs/foundations/forms' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
