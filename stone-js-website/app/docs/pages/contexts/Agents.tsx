import { JSX } from 'react'
import { Code, CodeTabs } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, Callout, Principle, Aphorism, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/contexts/agents'

const DECL = `
import { StoneApp } from '@stone-js/core'
import { Routing } from '@stone-js/router'
import { Mcp } from '@stone-js/mcp-adapter'

@Mcp()      // expose the domain as MCP tools for AI agents
@Routing()
@StoneApp()
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
 * Contexts: agents (MCP).
 */
@Page(PATH, { layout: 'docs' })
export class Agents implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Agents',
      description: 'The next execution context. Expose the same Tasks domain as MCP tools an AI agent can call, without touching a handler.'
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
              <code>@stone-js/mcp-adapter</code> turns your existing handlers into MCP tools. The
              same <code>Tasks</code> methods that served HTTP become <code>task.list</code>,
              <code> task.show</code>, <code>task.create</code>, callable by any MCP client.
            </p>
          }
        />

        <H2>Collapse it into tools</H2>
        <p>
          The Tasks domain is, once again, untouched. The manifest is the whole change.
        </p>
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />
        <Code file='agent session' lang='text'>{`agent → tools/list
stone ← task.list · task.show · task.create
agent → task.create { title: "Ship the docs" }
stone ← ✓ task #42 created`}</Code>

        <Aphorism>Your REST API and your agent tools are the same domain, resolved by two contexts.</Aphorism>

        <H2>Teaching the agents that build with you</H2>
        <p>
          There are two audiences here. One is the agent that consumes your app at runtime, above.
          The other is the coding agent building <em>with</em> Stone.js. That one needs to
          understand the framework itself.
        </p>
        <ul>
          <li><strong>@stone-js/mcp</strong>: an MCP server for the framework. Your coding agent queries concepts, modules and best practices in real time, instead of scanning packages.</li>
          <li><strong>llms.txt</strong>: a machine-readable map of the docs, served at the site root, so any model can load the whole mental model at once.</li>
        </ul>

        <Callout kind='future' title='Agent-native, not agent-bolted-on'>
          Most stacks are now wrapping an MCP layer around an app that never expected one. Because
          Stone.js already modelled every runtime as a context, agents fell into place as one more
          dimension, not a retrofit. This is the frontier the whole framework was aimed at.
        </Callout>

        <Callout kind='note' title='The division of labour'>
          The LLM masters the context. You master the domain. Together, you ship. That is the same
          sentence as the whole framework, now with a model on the other side of the adapter.
        </Callout>

        <SeeAlso links={[
          { title: 'MCP adapter', path: '/docs/adapters/mcp' },
          { title: 'MCP server & llms.txt', path: '/docs/extensions/mcp' },
          { title: 'Agent-native patterns', path: '/docs/frontier/agent-native' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
