import { JSX } from 'react'
import { Code } from '../../components/Code'
import { siblings } from '../../nav'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Aphorism, PropsTable, SeeAlso, Pager } from '../../components/content'

const PATH = '/docs/extensions/mcp'

/**
 * Extensions: the MCP dev server (@stone-js/mcp-dev).
 */
@Page(PATH, { layout: 'docs' })
export class Mcp implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'MCP dev server',
      description: 'One command, `stone mcp`, serves the framework’s knowledge, your app’s structure, and your own tools to a coding agent over MCP.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Extensions' title='MCP dev server' />
        <Lead>
          A coding agent is only as good as its context. <code>@stone-js/mcp-dev</code> gives it three
          things through one command, <code>stone mcp</code>: the framework’s knowledge, a read-only
          view of <em>this</em> app, and any tools you add. The MCP SDK owns the protocol and runs the
          handlers in-process, so these dev helpers never touch your domain or the kernel.
        </Lead>

        <H2>Install</H2>
        <Code file='terminal' lang='bash'>{`npm i -D @stone-js/mcp-dev`}</Code>

        <H2>Add the command</H2>
        <p>
          Enable it with the <code>@McpDev()</code> decorator (or register <code>mcpDevBlueprint</code>),
          then start the server from your project. It runs over stdio and stops on <code>Ctrl+C</code>,
          exactly like <code>stone dev</code>.
        </p>
        <Code file='app/Application.ts'>{`import { McpDev } from '@stone-js/mcp-dev'
import { StoneApp } from '@stone-js/core'

@McpDev()
@StoneApp({ name: 'my-app' })
export class Application {}`}</Code>
        <Code file='terminal' lang='bash'>{`stone mcp`}</Code>

        <Callout kind='tip' title='Logs on stderr, protocol on stdout'>
          Every tool call is logged to <strong>stderr</strong> so you watch the agent think in real
          time, while stdout stays reserved for the JSON-RPC protocol. That single detail is what
          breaks most hand-rolled stdio MCP servers; here it is handled for you.
        </Callout>

        <H2>Register it for your agent</H2>
        <p>
          Let <code>stone mcp</code> write <code>.mcp.json</code> for you. It creates or merges the
          entry and never clobbers your own config, so a coding agent (Claude Code, Cursor, Claude
          Desktop, …) discovers the server.
        </p>
        <Code file='terminal' lang='bash'>{`stone mcp --init`}</Code>

        <H2>Framework-knowledge tools</H2>
        <p>
          The agent queries the framework live instead of guessing from stale training data.
        </p>
        <PropsTable nameHeader='Tool' rows={[
          { name: 'stone_search', type: 'query', desc: 'Search concepts, modules, best-practices and gaps.' },
          { name: 'stone_concept', type: 'id?', desc: 'Explain a core concept (omit id to list them).' },
          { name: 'stone_docs', type: '()', desc: 'Links to the authoritative documentation.' },
          { name: 'stone_modules', type: '()', desc: 'The ecosystem modules and what each does.' },
          { name: 'stone_best_practices', type: '()', desc: 'Conventions and anti-patterns, with rationale.' },
          { name: 'stone_gaps', type: '()', desc: 'What the framework does not (yet) provide.' },
          { name: 'stone_brief', type: '()', desc: 'The full agent brief (llms-full.txt).' }
        ]} />

        <H2>App-introspection tools</H2>
        <p>
          These read <em>your</em> app’s resolved blueprint, so the agent understands the app you are
          building, not just the framework. They are read-only and redact secret-looking config.
        </p>
        <PropsTable nameHeader='Tool' rows={[
          { name: 'stone_app', type: '()', desc: 'Name, env, active platform, and counts of routes/commands/providers/adapters.' },
          { name: 'stone_routes', type: '()', desc: 'The route tree: path, methods, name, handler, middleware.' },
          { name: 'stone_commands', type: '()', desc: 'The CLI commands (name, alias, args, description).' },
          { name: 'stone_adapters', type: '()', desc: 'Registered adapters and the active platform.' },
          { name: 'stone_providers', type: '()', desc: 'The service providers.' },
          { name: 'stone_kernel', type: '()', desc: 'The kernel pipeline: event handler, middleware, error handlers.' },
          { name: 'stone_key_routes', type: '()', desc: 'Key-routing definitions (event-bus / realtime).' },
          { name: 'stone_config', type: 'key?', desc: 'A resolved stone.* value by dotted key (secrets redacted).' }
        ]} />
        <Aphorism>The agent reads the app the way the framework does: one blueprint, one source of truth.</Aphorism>

        <H2>Your own tools</H2>
        <p>
          Add project-specific tools. They run in-process and receive their arguments directly. Set the
          server name, instructions, or the GitHub report tools under <code>stone.mcpDev</code>.
        </p>
        <Code file='app/Application.ts'>{`import { McpDev } from '@stone-js/mcp-dev'

@McpDev({
  name: 'my-app-dev',
  tools: [
    { name: 'db_schema', description: 'Return the current DB schema', handler: () => readSchema() }
  ]
})
@StoneApp({ name: 'my-app' })
export class Application {}`}</Code>

        <H2>Agent Skills</H2>
        <p>
          The package ships <a href='https://agentskills.io'>Agent Skills</a>
          (<code>stone-js</code>, <code>stone-js-routing</code>, <code>stone-js-adapters</code>):
          portable <code>SKILL.md</code> folders that teach a skills-compatible agent the framework’s
          conventions on demand. The tools introspect the app; the skills say how to build it. Copy the
          ones you want into your agent’s skills directory.
        </p>
        <Code file='terminal' lang='bash'>{`mkdir -p .claude/skills
cp -R node_modules/@stone-js/mcp-dev/skills/stone-js* .claude/skills/`}</Code>

        <Callout kind='future' title='Serving your domain to agents'>
          <code>@stone-js/mcp-dev</code> serves the agent that <em>builds</em> your app. Exposing your
          running domain to agents as tools (over MCP’s web transport) is a separate, upcoming
          capability, not a bespoke adapter: the same domain, one more context.
        </Callout>

        <SeeAlso links={[
          { title: 'Agent-native patterns', path: '/docs/frontier/agent-native' },
          { title: 'Agents context', path: '/docs/contexts/agents' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
