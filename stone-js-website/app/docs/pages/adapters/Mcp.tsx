import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Aphorism, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/adapters/mcp'

const DECL = `
import { StoneApp } from '@stone-js/core'
import { Routing } from '@stone-js/router'
import { Mcp } from '@stone-js/mcp-adapter'

@Mcp()   // expose the domain as MCP tools
@Routing()
@StoneApp({ name: 'tasks' })
export class Application {}
`

const IMP = `
import { defineStoneApp } from '@stone-js/core'
import { routerBlueprint } from '@stone-js/router'
import { mcpAdapterBlueprint } from '@stone-js/mcp-adapter'

export const App = defineStoneApp(
  { name: 'tasks' },
  [routerBlueprint, mcpAdapterBlueprint]
)
`

/**
 * Adapters: MCP (agents).
 */
@Page(PATH, { layout: 'docs' })
export class Mcp implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'MCP adapter',
      description: 'Expose your domain to AI agents as MCP tools, without touching a handler: the MCP equivalent of your REST API.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Adapters' title='MCP (agents)' />
        <Lead>
          <code>@stone-js/mcp-adapter</code> treats an AI agent as another context. A tool call is a
          cause like an HTTP request: a named intention with arguments, expecting a result. The adapter
          maps your existing handlers to MCP tools, so agents call the same domain your API serves.
        </Lead>

        <H2>Install & enable</H2>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/mcp-adapter`}</Code>
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />

        <H2>Handlers become tools</H2>
        <p>
          The same <code>Tasks</code> methods that answered HTTP become <code>task.list</code>,
          <code> task.show</code>, <code>task.create</code>, callable by any MCP client. Name routes
          well and give them tight schemas; the name and the schema are what an agent reads to choose
          and call a tool.
        </p>
        <Code file='agent session' lang='text'>{`agent -> tools/list
stone <- task.list · task.show · task.create
agent -> task.create { title: "Ship the docs" }
stone <- ✓ task #42 created`}</Code>
        <Aphorism>Your REST API and your agent tools are the same domain, resolved by two contexts.</Aphorism>

        <H2>Transport & config</H2>
        <p>
          MCP speaks over a transport. Use <strong>stdio</strong> for a local tool a desktop agent
          launches, or an HTTP/SSE transport for a remote server. The server's name and version are
          what clients see when they connect.
        </p>
        <PropsTable rows={[
          { name: 'name', type: 'string', desc: 'The MCP server name shown to clients.' },
          { name: 'version', type: 'string', desc: 'The server version.' },
          { name: 'transport', type: "'stdio' | 'sse'", default: "'stdio'", desc: 'stdio for a locally-launched tool; sse for a remote HTTP server.' },
          { name: 'tools', type: 'options', desc: 'Which handlers are exposed and how they are named as tools.' }
        ]} />

        <H2>Deploy</H2>
        <p>
          Run the MCP server like any other Stone.js output, and register it with your agent host or
          client. Stack it with an HTTP adapter and one deployment serves both humans (over HTTP) and
          agents (over MCP).
        </p>

        <Callout kind='future' title='Two agents, two packages'>
          <code>mcp-adapter</code> serves the agent that calls your app at runtime.
          <code> @stone-js/mcp</code> (plus <code>llms.txt</code>) serves the coding agent that builds
          with the framework. See Agent-native patterns.
        </Callout>

        <SeeAlso links={[
          { title: 'Agents context', path: '/docs/contexts/agents' },
          { title: 'Agent-native patterns', path: '/docs/frontier/agent-native' },
          { title: 'Named routes & URL generation', path: '/docs/routing/names' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
