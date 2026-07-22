import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Principle, Aphorism, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/contexts/agents'

const DECL = `
import { StoneApp } from '@stone-js/core'
import { Routing } from '@stone-js/router'
import { McpDev } from '@stone-js/mcp-dev'

@McpDev()   // 'stone mcp' serves the framework + this app to your coding agent
@Routing()
@StoneApp()
export class Application {}
`

const IMP = `
import { defineStoneApp } from '@stone-js/core'
import { routerBlueprint } from '@stone-js/router'
import { mcpDevBlueprint } from '@stone-js/mcp-dev'

export const App = defineStoneApp(
  { name: 'tasks' },
  [routerBlueprint, mcpDevBlueprint]
)
`

/**
 * Contexts: agents (MCP).
 */
@Page(PATH, { layout: 'docs' })
export class Agents implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Agents',
      description: 'The next execution context. Serve your coding agent the framework and your app with `stone mcp`; exposing the running domain as tools is coming.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Contexts' title='Agents' />
        <Lead>
          Agents are the newest place software runs, and the reason the Continuum was worth
          building now. When a model can call your application, the caller is no longer a person or
          a service. It is a reasoning system. Stone.js treats it like any other context: a cause,
          an intention, a resolution.
        </Lead>

        <H2>An agent is a cause like any other</H2>
        <Principle
          principle={
            <p>
              A tool call from an agent is structurally identical to an HTTP request: a named
              intention with arguments, expecting a result. If your architecture already separates
              domain from context, exposing it to agents is a new adapter, not a new codebase.
            </p>
          }
          incarnation={
            <p>
              There are two agents here: the one that <em>calls</em> your app at run time, and the
              coding agent that <em>builds</em> it with you. Both are contexts. The one that ships
              today is the builder: <code>@stone-js/mcp-dev</code> serves it the framework and your
              app; exposing the running domain as tools is the next context, coming.
            </p>
          }
        />

        <H2>Serve the agent that builds with you</H2>
        <p>
          Add <code>@McpDev()</code> and the manifest gains one command, <code>stone mcp</code>. It
          starts an MCP server (stdio) that gives your coding agent the framework's knowledge and a
          live, read-only view of <em>this</em> app: its routes, commands, providers and config.
        </p>
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />
        <Code file='agent session' lang='text'>{`agent → tools/list
stone ← stone_routes · stone_app · stone_search · stone_docs
agent → stone_routes
stone ← GET /tasks (Tasks.list) · POST /tasks (Tasks.create)
agent → stone_search { query: "how do adapters collapse at runtime" }`}</Code>

        <Aphorism>The agent reads your app the way the framework does: one blueprint, one source of truth.</Aphorism>

        <p>
          The full tool list, the <code>--init</code> flow that writes <code>.mcp.json</code>, and
          the bundled Agent Skills are in the <strong>MCP dev server</strong> docs. A machine-readable
          <code> llms.txt</code> map of the docs is served at the site root, so any model can load the
          whole mental model at once.
        </p>

        <Callout kind='future' title='Your running domain as tools'>
          The next agent context: exposing your live domain to agents as MCP tools, the same handlers
          your REST API serves, resolved by the same kernel over MCP's web transport. Not a bespoke
          adapter, one more context over the domain you already wrote. Because Stone.js already
          modelled every runtime as a context, agents fall into place as one more dimension, not a
          retrofit.
        </Callout>

        <Callout kind='note' title='The division of labour'>
          The LLM masters the context. You master the domain. Together, you ship. That is the same
          sentence as the whole framework, now with a model on the other side of the context.
        </Callout>

        <SeeAlso links={[
          { title: 'MCP dev server', path: '/docs/extensions/mcp' },
          { title: 'Agent-native patterns', path: '/docs/frontier/agent-native' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
