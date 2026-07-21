import { JSX } from 'react'
import { Code } from '../../docs/components/Code'
import { Diagram } from '../components/Diagram'
import { ArticleLayout, articleHead } from '../ArticleLayout'
import { HeadContext, IPage, Page, ReactIncomingEvent, StoneLink } from '@stone-js/use-react'

const SLUG = 'api-as-agent-tools'

/**
 * Blog: Your API as MCP tools for agents (@stone-js/mcp-adapter).
 */
@Page(`/blog/${SLUG}`, { layout: 'site' })
export class ApiAsAgentTools implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return articleHead(SLUG)
  }

  render (): JSX.Element {
    return (
      <ArticleLayout slug={SLUG}>
        <p className='doc-lead'>
          Your product now has a new kind of caller: an AI agent that wants to do things, not read pages.
          The usual answer is to build a second API for it, with its own auth, its own schemas, and its
          own drift. Stone.js has a shorter answer: the domain that already answers HTTP can answer
          agents too.
        </p>

        <h2>An agent is just another context</h2>
        <p>
          A tool call from an agent is a cause like any other: a named intention with arguments,
          expecting a result. That is exactly what an HTTP request is. The only difference is the shape
          of the envelope, and shaping envelopes is what adapters do. So exposing your app to agents is
          not a new API; it is a new context over the same domain.
        </p>

        <Diagram
          layout='hub'
          height={370}
          caption='A tool call is an intention like an HTTP request. Two contexts, one domain: the REST adapter and the MCP adapter both resolve onto the handlers you already have.'
          nodes={[
            { label: 'Your handlers', sub: 'the domain, written once', kind: 'core' },
            { label: 'REST client', sub: 'node-http · GET /tasks', kind: 'client' },
            { label: 'AI agent', sub: 'mcp adapter · tools/call', kind: 'client' }
          ]}
        />

        <h2>Stack the adapter</h2>
        <p>
          <code>@stone-js/mcp-adapter</code> is added to the manifest like any other adapter. Stacking
          <code> @Mcp()</code> exposes your existing handlers as MCP tools. Nothing in your handlers
          changes: the adapter reads the routes you already have.
        </p>
        <Code file='app/Application.ts'>{`import { StoneApp } from '@stone-js/core'
import { Routing } from '@stone-js/router'
import { Mcp } from '@stone-js/mcp-adapter'

@Mcp()   // expose the domain as MCP tools
@Routing()
@StoneApp({ name: 'tasks' })
export class Application {}`}</Code>

        <h2>Handlers become tools</h2>
        <p>
          The same <code>Tasks</code> methods that answered HTTP become <code>task.list</code>,
          <code> task.show</code> and <code>task.create</code>, callable by any MCP client. The route
          name and its schema are what an agent reads to choose and call a tool, so a well-named route
          with a tight schema is already a well-described tool.
        </p>
        <Code file='agent session' lang='text'>{`agent -> tools/list
stone <- task.list · task.show · task.create
agent -> task.create { title: "Ship the docs" }
stone <- ✓ task #42 created`}</Code>

        <h2>One deployment, two audiences</h2>
        <p>
          MCP speaks over a transport. Use <strong>stdio</strong> for a local tool a desktop agent
          launches, or an <strong>sse</strong> transport for a remote server. Stack the MCP adapter next
          to an HTTP adapter and a single deployment serves both humans over HTTP and agents over MCP,
          from the very same handlers.
        </p>

        <h2>Why it matters</h2>
        <ul>
          <li><strong>No second API.</strong> Agents call the domain you already maintain, so there is nothing new to keep in sync.</li>
          <li><strong>Consistency by construction.</strong> What the API can do is exactly what the agent can do, because it is one set of handlers.</li>
          <li><strong>Agent-native, not agent-bolted-on.</strong> An agent is a first-class context, resolved by an adapter, like Node or the edge.</li>
        </ul>

        <p>
          The transport options and tool naming are in
          <StoneLink to='/docs/adapters/mcp'> the MCP adapter</StoneLink>. Note there are two agents in
          the room: that adapter serves the agent that calls your app, while
          <StoneLink to='/docs/extensions/mcp'> @stone-js/mcp</StoneLink> serves the coding agent that
          builds with the framework.
        </p>
      </ArticleLayout>
    )
  }
}
