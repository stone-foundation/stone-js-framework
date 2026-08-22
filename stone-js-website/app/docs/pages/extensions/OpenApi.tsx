import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, Aphorism, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/extensions/openapi'

/**
 * Extensions: OpenAPI.
 */
@Page(PATH, { layout: 'docs' })
export class OpenApi implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'OpenAPI',
      description: 'Derive a public OpenAPI contract from the schemas you already write, instead of maintaining a second document by hand.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Extensions' title='OpenAPI' />
        <Lead>
          A public API deserves a public contract, but a contract maintained by hand drifts from the
          code the day after it is written. <code>@stone-js/openapi</code> derives the document from the
          schemas your validation and resources already define, so it stays true by construction.
        </Lead>

        <H2>Install</H2>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/openapi`}</Code>

        <H2>Derive, do not duplicate</H2>
        <Principle
          principle={
            <p>
              Two descriptions of the same API, the code and a hand-written spec, cannot stay in sync.
              Keep one description, the code, and generate the other from it. The contract becomes a
              view of the implementation, not a parallel artifact.
            </p>
          }
          incarnation={
            <p>
              <code>OpenApiGenerator</code> builds a valid OpenAPI document from your app: the info
              block, servers, and the paths and schemas taken from your routes, validation and
              resources. Serve it at a URL and point any tool at it.
            </p>
          }
        />
        <Code file='app/openapi.ts'>{`import { OpenApiGenerator } from '@stone-js/openapi'

export const spec = OpenApiGenerator
  .create({ title: 'Tasks API', version: '1.0.0' })
  .addServer('https://api.example.com')
  .build()   // a valid OpenAPI document`}</Code>

        <H3>What is derived, and from where</H3>
        <p>
          Everything a route already says about itself, read from the route <em>and</em> from the
          handler's own decorators, because both validation and resources work without a router, and a
          contract that only read route options documented half of such an application.
        </p>
        <PropsTable nameHeader='Derived' rows={[
          { name: 'Request', type: 'validation', desc: 'From `validation:` on the route or `@Validate()` on the handler.' },
          { name: 'Response', type: 'resources', desc: 'From `resource:` on the route or `@Returns()` on the handler: the schema the resource publishes is the documented payload.' },
          { name: 'Fragments', type: 'resources', desc: 'A query parameter with an enum of the names a caller may select, the parameter your app actually answers to.' },
          { name: 'Security', type: 'auth / authz', desc: 'From `auth:` / `authz:` on the route, or `@Protect()` / `@Can()` on the handler.' }
        ]} />
        <p>
          A declaration it could not read is <strong>reported</strong> rather than dropped: a resource
          named but never registered, or a schema that needs a real context, prints one line naming the
          route. A missing payload in a document that looks complete is worse than a loud gap.
        </p>

        <H3>Saying more, on the route</H3>
        <p>
          A route can add anything the derivation cannot know (a summary, tags, extra responses) under
          {' '}<code>contract</code>. What you write there wins, because an author who wrote it meant it,
          and <code>contract: false</code> keeps an endpoint out of the document entirely.
        </p>
        <Code file='app/TasksController.ts'>{`@Get('/tasks', { contract: { summary: 'List tasks', tags: ['tasks'] } })
list () { … }

@Get('/internal/metrics', { contract: false })   // documented nowhere
metrics () { … }`}</Code>
        <Callout kind='important' title='Describing a response keeps its schema'>
          <p>
            "What you write wins" is per status and per field, not per operation. Writing{' '}
            <code>200: {'{'} description: '…' {'}'}</code> describes the response the derivation already
            found; the schema stays. It is the common case and it used to be the opposite, which emptied
            the payload of every endpoint whose author had taken the trouble to document it.
          </p>
          <p>
            Naming a <em>different</em> success status does replace the derived one:{' '}
            <code>204</code> where the derivation produced <code>200</code> is a correction, and an
            operation answering both describes an endpoint that cannot exist. Error statuses always
            accumulate.
          </p>
        </Callout>

        <Callout kind='note' title='Why the key is not called openapi'>
          A route describes itself; OpenAPI is one way of <em>rendering</em> that description. Naming the
          option after a specification would put that specification's name in the router's vocabulary,
          and every application would have to rename its routes the day the same contract is rendered as
          something else.
        </Callout>

        <H2>Serving it</H2>
        <p>
          You do not have to wire any of it. Enable the module the way every Stone.js module is
          enabled, with its decorator or with its blueprint, and two routes appear:{' '}
          <code>/openapi.json</code> for the document and <code>/docs</code> for its explorer. Both
          paths are configurable under <code>stone.openapi</code>, and <code>docsPath: false</code>{' '}
          serves the machine-readable contract alone, for when the explorer must not be public.
        </p>
        <CodeTabs
          file='app/Application.ts'
          decl={`import { OpenApi } from '@stone-js/openapi'
import { StoneApp } from '@stone-js/core'

@OpenApi({ info: { title: 'Tasks API', version: '1.0.0' } })
@StoneApp({ name: 'my-app' })
export class Application {}`}
          imp={`import { defineStoneApp } from '@stone-js/core'
import { openApiBlueprint } from '@stone-js/openapi'

export const Application = defineStoneApp(handler, { name: 'my-app' }, [openApiBlueprint])`}
        />
        <Callout kind='note' title='The server URL is the host that answered'>
          The document is assembled per request, so the server URL it advertises is the host that
          actually served it. The same artefact documents itself correctly behind a local port, a load
          balancer and an API Gateway stage, where a URL frozen at build time would be wrong for at
          least two of them. Declare <code>servers</code> under <code>stone.openapi</code> to override it.
        </Callout>

        <Callout kind='note' title='The explorer finds the document by itself'>
          The page loads the document from the URL the route is actually served at, asked of the router,
          so a router prefix is accounted for: behind <code>/v1</code> the explorer loads{' '}
          <code>/v1/openapi.json</code> without being told. Do not write the prefix into{' '}
          <code>specPath</code>, or the router will apply its own on top of it. For a document published
          somewhere else entirely, a CDN path or another host, state it:{' '}
          <code>stone.openapi.swaggerUi.specUrl</code>.
        </Callout>

        <H3>Serving it yourself</H3>
        <p>
          If your application assembles its own document, or must serve it from somewhere the module
          does not reach, expose the built document from a route of your own. Tools, machines and agents
          read it directly; point any OpenAPI viewer (Swagger UI, Scalar) at that URL.
        </p>
        <CodeTabs
          file='app/OpenApiController.ts'
          decl={`import { EventHandler, Get } from '@stone-js/router'
import { spec } from './openapi'

@EventHandler('/openapi.json')
export class OpenApiController {
  @Get('/')
  document () { return spec }   // the generated OpenAPI document, as JSON
}`}
          imp={`import { defineEventHandler, defineRoutes } from '@stone-js/router'
import { spec } from './openapi'

const OpenApiController = () => ({ document: () => spec })

export const routes = defineRoutes([
  [defineEventHandler(OpenApiController, 'document'), { path: '/openapi.json', method: 'GET' }]
])`}
        />

        <H3>Schemas to JSON Schema</H3>
        <p>
          Under the hood <code>toJsonSchema</code> converts your validation schemas (Zod and other
          Standard Schemas) into the JSON Schema the document embeds, which is why the contract stays a
          faithful view of what you actually validate.
        </p>
        <Aphorism>You wrote the schema for validation. The contract is a view of it, not a second copy.</Aphorism>
        <p>
          A request is described as <strong>input</strong> and a response as <strong>output</strong>,
          which is both the honest direction and the only one that works: a request is what the caller
          sends, before coercion and defaults, and a schema that normalises before it judges (a trimmed
          handle, an upper-cased country) has no output shape to describe at all. Asking for one throws,
          and that used to take the whole document with it.
        </p>
        <Callout kind='note' title='One schema cannot sink the document'>
          A schema the converter cannot describe is left out on its own, and reported: on the console
          when the document is served, on standard error when the CLI writes it. The rest of the
          contract stands. A missing payload is a gap you can see; a document that 500s describes
          nothing at all, and an empty <code>{'{}'}</code> schema would quietly claim "anything goes".
        </Callout>
        <p>
          Two details fall out of the same rule. The document declares OpenAPI 3.0, so that dialect is
          requested from the schema engine (a nullable string is <code>nullable: true</code>, not a
          union with null) and a <code>$schema</code> marker never reaches the output, because 3.0 has
          nowhere to put one. And a route with no name publishes no <code>operationId</code> at all,
          rather than an empty one that generated clients key off.
        </p>

        <Callout kind='future' title='The contract agents read too'>
          The same document that documents your API for humans describes it for machines. Paired with
          the MCP adapter, an agent can discover and call your endpoints from the contract you already
          generate.
        </Callout>

        <SeeAlso links={[
          { title: 'Resources', path: '/docs/extensions/resources' },
          { title: 'Validation', path: '/docs/extensions/validation' },
          { title: 'MCP dev server', path: '/docs/extensions/mcp' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
