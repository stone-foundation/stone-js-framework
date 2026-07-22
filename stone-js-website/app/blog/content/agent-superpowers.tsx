import { JSX } from 'react'
import { Code } from '../../docs/components/Code'
import { Diagram } from '../components/Diagram'
import { ArticleLayout, articleHead } from '../ArticleLayout'
import { HeadContext, IPage, Page, ReactIncomingEvent, StoneLink } from '@stone-js/use-react'

const SLUG = 'agent-superpowers'

/**
 * Blog: Give your coding agent Stone.js superpowers (@stone-js/mcp-dev).
 */
@Page(`/blog/${SLUG}`, { layout: 'site' })
export class AgentSuperpowers implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return articleHead(SLUG)
  }

  render (): JSX.Element {
    return (
      <ArticleLayout slug={SLUG}>
        <p className='doc-lead'>
          A coding agent is only as good as its context. Point it at a fresh Stone.js codebase and it
          guesses: wrong decorators, stale APIs, routes it cannot see. Stone.js ships the fix as one
          command, <code>stone mcp</code>: it hands your agent the framework’s knowledge and a live view
          of your own app, so it stops guessing.
        </p>

        <h2>Two agents, and the one that needs help</h2>
        <p>
          There are two agents in the room. One <em>calls</em> your app at run time; that is a run-time
          context (coming as a capability). The other <em>builds</em> your app with you, in your editor,
          and it needs to understand Stone.js and this codebase. <code>@stone-js/mcp-dev</code> serves
          that second agent.
        </p>

        <Diagram
          layout='hub'
          height={370}
          caption='One `stone mcp` server feeds the coding agent three streams: the framework’s knowledge, a read-only view of this app, and the tools you declare.'
          nodes={[
            { label: 'stone mcp', sub: 'MCP server (stdio)', kind: 'core' },
            { label: 'Framework knowledge', sub: 'stone_search · stone_docs', kind: 'client' },
            { label: 'This app', sub: 'stone_routes · stone_config', kind: 'client' },
            { label: 'Your tools', sub: 'project_notes · …', kind: 'client' }
          ]}
        />

        <h2>One command</h2>
        <p>
          Add <code>@McpDev()</code> to your app, then run <code>stone mcp</code>. It starts an MCP
          server over stdio and stops on <code>Ctrl+C</code>, exactly like <code>stone dev</code>. The
          MCP SDK owns the protocol and runs the handlers in-process, so these dev helpers never touch
          your domain or the kernel.
        </p>
        <Code file='app/Application.ts'>{`import { McpDev } from '@stone-js/mcp-dev'
import { Routing } from '@stone-js/router'
import { NodeHttp } from '@stone-js/node-http-adapter'
import { StoneApp } from '@stone-js/core'

@McpDev()   // adds the \`stone mcp\` command
@Routing()
@NodeHttp({ default: true })
@StoneApp({ name: 'my-app' })
export class Application {}`}</Code>

        <h2>It reads your app, not just the framework</h2>
        <p>
          This is the difference. Beyond framework knowledge, <code>stone mcp</code> exposes read-only
          tools built from your resolved blueprint, so the agent sees what <em>this</em> app declares
          and answers from fact instead of guesswork. Secrets are redacted.
        </p>
        <Code file='agent session' lang='text'>{`agent -> tools/list
stone <- stone_routes · stone_app · stone_config · project_notes · stone_search
agent -> stone_routes
stone <- GET /tasks (Tasks.list) · POST /tasks (Tasks.create)
agent -> stone_search { query: "how do adapters collapse at runtime" }
stone <- the runtime collapse selects one adapter per invocation …`}</Code>

        <h2>Register it, and add your own tools</h2>
        <p>
          Let the command write <code>.mcp.json</code> so your editor’s agent discovers the server; it
          merges and never clobbers your config. Declare project-specific tools under
          <code> stone.mcpDev</code>, and copy the bundled <StoneLink to='https://agentskills.io'>Agent
          Skills</StoneLink> into your agent’s skills directory to teach it the conventions.
        </p>
        <Code file='terminal' lang='bash'>{`stone mcp --init   # create/merge .mcp.json
mkdir -p .claude/skills && cp -R node_modules/@stone-js/mcp-dev/skills/stone-js* .claude/skills/`}</Code>

        <h2>Why it matters</h2>
        <ul>
          <li><strong>No more guessing.</strong> The agent queries concepts, modules and your real routes live, instead of hallucinating from stale training.</li>
          <li><strong>Grounded in your app.</strong> Introspection reads the one blueprint the framework itself uses, so what the agent sees is what actually runs.</li>
          <li><strong>Zero ceremony.</strong> One decorator, one command, logs on stderr so you watch the agent think. It stops with Ctrl+C.</li>
        </ul>

        <p>
          The full tool list and options are in
          <StoneLink to='/docs/extensions/mcp'> the MCP dev server docs</StoneLink>. Exposing your
          running domain to agents as tools is a separate, upcoming capability: the same domain, one
          more context.
        </p>
      </ArticleLayout>
    )
  }
}
