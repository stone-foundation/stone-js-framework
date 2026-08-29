import { JSX } from 'react'
import { siblings } from '../../nav'
import { Code, CodeTabs } from '../../components/Code'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, PropsTable, SeeAlso, Pager, Aphorism } from '../../components/content'

const PATH = '/docs/extensions/mcp-server'

const DECL = `
import { Mcp } from '@stone-js/mcp'
import { Routing } from '@stone-js/router'
import { StoneApp } from '@stone-js/core'

@Mcp({ instructions: 'Tools for managing notes. Read before you write.' })
@Routing()
@StoneApp({ name: 'app' })
export class Application {}
`

const IMP = `
import { mcpBlueprint } from '@stone-js/mcp'
import { defineConfig, defineStoneApp } from '@stone-js/core'

// Enable the module on the manifest, exactly where the decorator sits
export const App = defineStoneApp({ name: 'app' }, [mcpBlueprint])

// Then configure it
export const AppConfig = defineConfig((blueprint) => blueprint.set('stone.mcp', {
  instructions: 'Tools for managing notes. Read before you write.',
  route: { auth: true }
}))
`

const TOOL_DECL = `
export class NotesController {
  @Post('/notes', { mcp: 'create-note' })
  create (event: IncomingHttpEvent) { /* ... */ }
}
`

const TOOL_IMP = `
export const NotesController = defineEventHandler({}, {
  create: definePost('/notes', { mcp: 'create-note' })
})
`

/**
 * Extensions: MCP server.
 */
@Page(PATH, { layout: 'docs' })
export class McpServer implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'MCP server',
      description: 'Expose the routes you already have as tools an AI agent can call, through the chain that already protects them.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Extensions' title='MCP server' />
        <Lead>
          Your routes become tools an AI agent can call. One endpoint appears, no route changes, and
          a tool call arrives at its route as an ordinary request: the same rate limit, the same
          authentication, the same authorization, the same validation.
        </Lead>

        <H2>Install</H2>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/mcp
npm i @stone-js/openapi   # optional, to derive tool arguments from your schemas`}</Code>

        <H2>Enable it</H2>
        <Principle
          principle={
            <p>
              An agent is a caller like any other. What it may do is what the caller it acts for may
              do, decided where that is already decided.
            </p>
          }
          incarnation={
            <p>
              A tool is a route that said so. The module adds one endpoint and derives the tool list
              from the router; a call is dispatched back into the router, so nothing is described
              twice and nothing is guarded twice.
            </p>
          }
        />
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />
        <p>
          That adds one route, <code>/mcp</code>, and changes nothing else. No route becomes a tool
          until it says so.
        </p>

        <H2>Declare a tool</H2>
        <CodeTabs file='app/NotesController.ts' decl={TOOL_DECL} imp={TOOL_IMP} />
        <p>The long form states what the short form would otherwise derive:</p>
        <Code file='app/NotesController.ts'>{`@Post('/notes', {
  mcp: {
    name: 'create-note',
    description: 'Create a note for the signed-in user.',
    annotations: { destructiveHint: false }
  }
})`}</Code>

        <H3>On the handler instead</H3>
        <p>
          The same shape as <code>@Validate</code> and <code>@Returns</code>, for an application that
          writes its declarations on the method.
        </p>
        <Code file='app/NotesController.ts'>{`import { Tool } from '@stone-js/mcp'

class NotesController {
  @Tool({ name: 'create-note', description: 'Create a note for the signed-in user.' })
  @Post('/notes')
  create (event: IncomingHttpEvent) { /* ... */ }
}`}</Code>
        <p>
          Both are read. The route wins when both are present, because with a router in play a route
          is the single description of itself.
        </p>

        <H2>What is derived, and from where</H2>
        <PropsTable nameHeader='field' rows={[
          { name: 'name', type: 'string', desc: <>Stated as <code>mcp: 'create-note'</code> or <code>mcp.name</code>. Otherwise the route's own <code>name</code>.</> },
          { name: 'description', type: 'string', desc: <>Stated as <code>mcp.description</code>. Otherwise the route's <code>contract</code> summary or description.</> },
          { name: 'inputSchema', type: 'JSON Schema', desc: <>Stated as <code>mcp.inputSchema</code>. Otherwise the route's validation schema, converted; failing that, its path parameters.</> },
          { name: 'outputSchema', type: 'JSON Schema', desc: <>Stated as <code>mcp.outputSchema</code>. Otherwise the resource the route publishes, converted. A shape nobody promised is still not sent.</> }
        ]} />
        <Callout kind='note' title='Only an object schema is published'>
          MCP carries structured output as an object, and a resource answering a bare array is a real
          thing. Wrapping it would invent a shape the application never declared, so that route gets
          no <code>outputSchema</code> at all: an agent told a tool returns an object it may not
          return is worse off than one told nothing, because it will parse against a promise nobody
          made.
        </Callout>
        <Callout kind='note' title='Every source is optional'>
          <p>
            An application with <code>openapi</code> and <code>validation</code> writes almost
            nothing. One with neither still gets working tools, built from what a route always has: a
            path, a method, and its parameters. That degradation is the design, not a fallback, and
            it is why this module needs no stack to be useful.
          </p>
        </Callout>
        <p>
          A tool with no description is exposed and logged. An agent reading a bare name will guess,
          and it guesses worst on the routes that write. Set
          <code> stone.mcp.requireDescription</code> to leave those out instead.
        </p>

        <H2>What happens on a call</H2>
        <Aphorism>
          An agent acts for someone. That someone is the principal.
        </Aphorism>
        <Code file='the chain'>{`tools/call  ->  a real request to the route
                ->  rate limit -> auth -> authz -> validation -> handler`}</Code>
        <p>
          The caller's headers travel with it, so the bearer an agent was given is the bearer the
          route authenticates. Nothing here carries a permission model of its own: a second set of
          rules would be a second thing to keep in step with the first.
        </p>
        <Callout kind='important' title='A failed tool is a result, not a broken exchange'>
          <p>
            A refused authorization answers a tool result marked <code>isError</code>, with the
            reason in words. The agent reads it, explains it, and tries something else. A protocol
            error would end the conversation over something entirely recoverable.
          </p>
        </Callout>

        <H2>Protecting the endpoint</H2>
        <p>The endpoint is a route, so it is guarded like one.</p>
        <Code file='app/AppConfig.ts'>{`blueprint.set('stone.mcp.route', {
  auth: true,
  rateLimit: { max: 60, window: 60, by: 'user' }
})`}</Code>

        <H2>Configuration</H2>
        <PropsTable rows={[
          { name: 'path', type: 'string', default: "'/mcp'", desc: 'Where the endpoint is served.' },
          { name: 'name', type: 'string', desc: 'What the server calls itself. Defaults to the application name.' },
          { name: 'version', type: 'string', default: "'0.0.0'", desc: 'The version an agent sees.' },
          { name: 'instructions', type: 'string', desc: 'Handed to the agent once, alongside the tool list. Where to say what the API is for.' },
          { name: 'requireDescription', type: 'boolean', default: 'false', desc: 'Leave out a tool that has no description, instead of exposing it with a warning.' },
          { name: 'route', type: 'object', desc: 'Anything to put on the endpoint route: auth, authz, rateLimit, middleware.' },
          { name: 'filter', type: 'function', desc: 'The last word on which tools are exposed, for what a declaration cannot know: an environment, a flag, a caller.' }
        ]} />

        <H2>Why there is no stream</H2>
        <p>
          An MCP server over HTTP is one POST endpoint: the client posts JSON-RPC, the server answers
          JSON, the connection closes. A stream is only needed for what a server sends unprompted,
          progress on a long tool or a server-initiated sampling request, and an API exposing its own
          routes sends none of them.
        </p>
        <p>
          That is why this runs unchanged on a long-lived Node server, on a Lambda, or at the edge.
          There is nothing to keep open, and no session to hold.
        </p>

        <SeeAlso links={[
          { title: 'OpenAPI', path: '/docs/extensions/openapi' },
          { title: 'Authorization', path: '/docs/extensions/authorization' },
          { title: 'MCP dev server', path: '/docs/extensions/mcp' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
